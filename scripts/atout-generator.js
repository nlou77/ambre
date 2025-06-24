export class AtoutGenerator extends FormApplication {
  constructor(actor, options = {}) {
    super(actor, options);
    this.actor = actor;

    // State for dragging the portrait
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.initialOffset = { x: 0, y: 0 };
  }

  static _customFonts = null;

  /**
   * Scans the custom fonts directory, loads them, and returns a list of available fonts.
   * @returns {Promise<Array<{label: string, value: string}>>} An array of font options.
   * @private
   */
  static async getCustomFonts() {
    if (this._customFonts !== null) return this._customFonts; // Return cached fonts if already loaded

    const directory = "systems/ambre/assets/fonts/";
    let fontOptions = [];
    try {
        // Use wildcard to browse all files in the directory
        const browsePath = directory.endsWith('/') ? `${directory}*` : `${directory}/*`;
        const filePickerResult = await FilePicker.browse("data", browsePath, {
            extensions: [".otf", ".ttf", ".woff", ".woff2"], // Supported font formats
            wildcard: true,
            force: true // Force refresh to pick up new files
        });

        const styleId = "ambre-atout-custom-fonts";
        let styleSheet = document.getElementById(styleId);
        if (!styleSheet) {
            styleSheet = document.createElement("style");
            styleSheet.id = styleId;
            document.head.appendChild(styleSheet);
        }

        filePickerResult.files.forEach(file => {
            // Extract a user-friendly name from the file path (e.g., "My Custom Font" from "my-custom-font.ttf")
            const fontName = decodeURIComponent(file).split('/').pop().split('.').slice(0, -1).join('.')
                                .replace(/[-_]/g, ' ') // Replace hyphens/underscores with spaces
                                .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
            const rule = `@font-face { font-family: "${fontName}"; src: url("${file}"); }`;
            try { styleSheet.sheet.insertRule(rule, styleSheet.sheet.cssRules.length); }
            catch (e) { console.warn(`Ambre | Could not insert font rule for ${fontName}:`, e); }
            fontOptions.push({ label: fontName, value: fontName });
        });
    } catch (e) {
        console.error(`Ambre | AtoutGenerator | Could not browse for fonts in ${directory}.`, e);
        ui.notifications.error(`Impossible de charger les polices depuis ${directory}.`);
        fontOptions = [];
    }
    this._customFonts = fontOptions; // Cache the loaded fonts
    return this._customFonts;
  }

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      id: "atout-generator",
      title: "Générateur de Carte d'Atout",
      template: "systems/ambre/templates/apps/atout-generator.hbs",
      width: 1100,
      height: "auto",
      classes: ["atout", "generator"],
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "concept" }]
    });
  }

  /**
   * Helper function to dynamically load image options from a directory.
   * @param {string} directory The Foundry VTT data path to browse (e.g., "systems/ambre/assets/").
   * @param {RegExp} pattern A regular expression to filter file names (e.g., /frameTrump(\d+)\.png$/i).
   * @param {string} labelPrefix The prefix for the dropdown option labels (e.g., "Cadre").
   * @returns {Promise<Array<{label: string, value: string}>>} An array of options for a select dropdown.
   * @private
   */
  async _getDynamicImageOptions(directory, pattern, labelPrefix) {
    let options = [];
    try {
        // When using wildcard: true, the path needs to be a glob pattern.
        // We append '*' to search for all files within the directory.
        const browsePath = directory.endsWith('/') ? `${directory}*` : `${directory}/*`;
        const filePickerResult = await FilePicker.browse("data", browsePath, {
            extensions: [".png", ".webp", ".jpg", ".jpeg"],
            wildcard: true,
            force: true});

        options = filePickerResult.files
            .filter(file => pattern.test(file))
            .map(file => {
                const match = file.match(pattern); // Use the original file path for matching
                const number = match && match[1] ? match[1] : "Inconnu";
                return { label: `${labelPrefix} ${number}`, value: file }; // Store clean file path
            })
            .sort((a, b) => {
                // Custom sort to handle numbers correctly (e.g., 2 before 10)
                const numA = parseInt(a.label.replace(`${labelPrefix} `, ''), 10);
                const numB = parseInt(b.label.replace(`${labelPrefix} `, ''), 10);
                return numA - numB;
            });
    } catch (e) {
        console.error(`Ambre | AtoutGenerator | Could not browse for images in ${directory} with pattern ${pattern}.`, e);
        ui.notifications.error(`Impossible de charger les images pour ${labelPrefix}. Le répertoire est-il correct ?`);
        options = [{ label: "Erreur de chargement", value: "" }];
    }
    return options;
  }

  /** Données passées au template */
  async getData() {
    const frameDirectory = "systems/ambre/assets/skin/trumps/";
    const framePattern = /frameTrump(\d+)\.(png|webp|jpe?g)$/i;
    const frameOptions = await this._getDynamicImageOptions(frameDirectory, framePattern, "Cadre");    
    frameOptions.unshift({ label: "Aucun", value: "" }); // Add "None" option

    const bannerDirectory = "systems/ambre/assets/skin/trumps/"; // As per your request
    const bannerPattern = /frameBanner(\d+)\.(png|webp|jpe?g)$/i; // As per your request
    const bannerOptions = await this._getDynamicImageOptions(bannerDirectory, bannerPattern, "Bannière");
    bannerOptions.unshift({ label: "Aucune", value: "" }); // Add "None" option

    const textureDirectory = "systems/ambre/assets/skin/textures/";
    const texturePattern = /texture(\d+)\.(png|webp|jpe?g)$/i;
    const textureOptions = await this._getDynamicImageOptions(textureDirectory, texturePattern, "Texture");
    textureOptions.unshift({ label: "Aucune", value: "" });

    // Get standard fonts from Foundry's CONFIG
    const standardFonts = (CONFIG.fontFamilies || []).map(font => ({ label: font, value: font }));

    // Get custom fonts from system folder
    const customFonts = await AtoutGenerator.getCustomFonts();

    // Combine and sort all fonts alphabetically
    const allFonts = [...standardFonts, ...customFonts].sort((a, b) => a.label.localeCompare(b.label));

    // Get saved presets
    // Note: Ensure this setting is registered in your system's init hook.
    // game.settings.register("ambre", "atoutGeneratorPresets", { scope: "world", config: false, type: Object, default: {} });
    const presets = game.settings.get("ambre", "atoutGeneratorPresets") || {};
    const presetList = Object.keys(presets).map(key => ({ name: key }));

    const artistStylesSetting = game.settings.get("ambre", "atoutArtistStyles") || {};
    const artistStyleList = Object.entries(artistStylesSetting).map(([key, value]) => ({ 
        name: key, 
        locked: value.locked 
    }));


    // Exemple : options statiques, ou à terme dynamiques
    return {
      actor: this.actor,
      frames: frameOptions,
      banners: bannerOptions,
      textures: textureOptions,
      fonts: allFonts, // Pass the combined font list to the template
      presets: presetList,
      artistStyles: artistStyleList
    };
  }

  /**
   * Helper function to load an image and return a Promise.
   * Resolves with null if the image fails to load, preventing errors.
   * @param {string} src The source URL of the image.
   * @returns {Promise<HTMLImageElement|null>}
   * @private
   */
  _loadImage(src) {
    return new Promise((resolve) => {
      if (!src) return resolve(null);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn(`Could not load image: ${src}`);
        resolve(null); // Resolve with null to prevent Promise.all from rejecting on error
      };
      img.src = `${src}?v=${Date.now()}`; // Add cache-busting parameter here
    });
  }

  /**
   * Redraws the preview canvas based on the current form inputs.
   * @private
   */
  async _updatePreview() {
    const formData = new FormDataExtended(this.form).object;
    const canvas = this.element.find('#trumpCanvas')[0];
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background color
    if (formData.backgroundColor) {
        ctx.globalAlpha = parseFloat(formData.backgroundOpacity) ?? 1.0;
        ctx.fillStyle = formData.backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0; // Reset alpha
    }

    // Load all images concurrently
    const [portraitImg, bannerImg, frameImg, textureImg] = await Promise.all([
      this._loadImage(formData.portrait),
      this._loadImage(formData.banner),
      this._loadImage(formData.frame),
      this._loadImage(formData.texture)

    ]);

    // Draw portrait
    if (portraitImg) {
        const scale = parseFloat(formData.portraitScale) || 1.0;
        const offsetX = parseFloat(formData.portraitX) || 0;
        const offsetY = parseFloat(formData.portraitY) || 0;

        // Calculate dimensions to fit the image within the canvas while maintaining aspect ratio (cover mode)
        const imgRatio = portraitImg.naturalWidth / portraitImg.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;
        let renderWidth, renderHeight;

        // This logic makes the image "cover" the canvas area before scaling
        if (imgRatio > canvasRatio) { 
            renderHeight = canvas.height;
            renderWidth = renderHeight * imgRatio;
        } else { 
            renderWidth = canvas.width;
            renderHeight = renderWidth / imgRatio;
        }

        // Apply user scale and center the image
        const finalWidth = renderWidth * scale;
        const finalHeight = renderHeight * scale;
        const x = (canvas.width - finalWidth) / 2 + offsetX;
        const y = (canvas.height - finalHeight) / 2 + offsetY;

        ctx.drawImage(portraitImg, x, y, finalWidth, finalHeight);
    }

    // Draw portrait mask
    const maskWidth = parseFloat(formData.portraitMaskWidth) || 0;
    if (maskWidth > 0) {
        // Use the card's background color and opacity for the mask to blend it.
        ctx.globalAlpha = parseFloat(formData.backgroundOpacity) ?? 1.0;
        ctx.fillStyle = formData.backgroundColor || '#000000';

        // Draw left mask rectangle
        ctx.fillRect(0, 0, maskWidth, canvas.height);

        // Draw right mask rectangle
        ctx.fillRect(canvas.width - maskWidth, 0, maskWidth, canvas.height);
        
        ctx.globalAlpha = 1.0; // Reset alpha
    }

    // Draw frame with opacity and scale
    if (frameImg) {
        ctx.globalAlpha = parseFloat(formData.frameOpacity) ?? 1.0;
        const scale = parseFloat(formData.frameScale) || 1.0;

        // Calculate dimensions to fit the image within the canvas while maintaining aspect ratio (cover mode)
        const imgRatio = frameImg.naturalWidth / frameImg.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;
        let renderWidth, renderHeight;

        if (imgRatio > canvasRatio) {
            renderHeight = canvas.height;
            renderWidth = renderHeight * imgRatio;
        } else {
            renderWidth = canvas.width;
            renderHeight = renderWidth / imgRatio;
        }

        const finalWidth = renderWidth * scale;
        const finalHeight = renderHeight * scale;
        const x = (canvas.width - finalWidth) / 2;
        const y = (canvas.height - finalHeight) / 2;
        ctx.drawImage(frameImg, x, y, finalWidth, finalHeight);
        ctx.globalAlpha = 1.0; // Reset alpha
    }

    const textureBlendMode = formData.textureBlendMode || "afterAll"; // Default to afterAll if undefined

    // Draw texture based on blend mode
    if (textureImg && textureBlendMode === "beforeFrame") {
        ctx.globalAlpha = parseFloat(formData.textureOpacity) ?? 1.0;
        ctx.drawImage(textureImg, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }

    // Draw frame with opacity and scale
    if (frameImg) {
        ctx.globalAlpha = parseFloat(formData.frameOpacity) ?? 1.0;
        const scale = parseFloat(formData.frameScale) || 1.0;

        // Calculate dimensions to fit the image within the canvas while maintaining aspect ratio (cover mode)
        const imgRatio = frameImg.naturalWidth / frameImg.naturalHeight;
        const canvasRatio = canvas.width / canvas.height;
        let renderWidth, renderHeight;

        if (imgRatio > canvasRatio) {
            renderHeight = canvas.height;
            renderWidth = renderHeight * imgRatio;
        } else {
            renderWidth = canvas.width;
            renderHeight = renderWidth / imgRatio;
        }

        const finalWidth = renderWidth * scale;
        const finalHeight = renderHeight * scale;
        const x = (canvas.width - finalWidth) / 2;
        const y = (canvas.height - finalHeight) / 2;
        ctx.drawImage(frameImg, x, y, finalWidth, finalHeight);
        ctx.globalAlpha = 1.0; // Reset alpha
    }


    // Draw banner on top, with opacity, scale, and vertical positioning
    if (bannerImg) {
        ctx.globalAlpha = parseFloat(formData.bannerOpacity) ?? 1.0;
        const bannerScale = parseFloat(formData.bannerScale) || 1.0;
        const bannerY = parseFloat(formData.bannerY) || 0;

        // Calculate scaled dimensions
        const scaledWidth = bannerImg.naturalWidth * bannerScale;
        const scaledHeight = bannerImg.naturalHeight * bannerScale;

        // Center horizontally, apply vertical offset
        const x = (canvas.width - scaledWidth) / 2;
        const y = bannerY; // This is the top-left Y, adjusted by the slider

        ctx.drawImage(bannerImg, x, y, scaledWidth, scaledHeight);
        ctx.globalAlpha = 1.0; // Reset alpha
    }

    if (textureImg && textureBlendMode === "beforeDesignation") {
        ctx.globalAlpha = parseFloat(formData.textureOpacity) ?? 1.0;
        ctx.drawImage(textureImg, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }


    // Draw Designation Text (Name and Auteur)
    const name = formData.name || "";
    const designationFont = formData.designationFont || "Arial";
    const designationColor = formData.designationColor || "#FFFFFF";
    const designationSize = parseFloat(formData.designationSize) || 48;
    const designationY = parseFloat(formData.designationY) || 0;

    ctx.globalAlpha = 1.0; // Ensure text is fully opaque
    ctx.fillStyle = designationColor;
    ctx.textAlign = 'center';

    const centerX = canvas.width / 2;

    // Draw Name
    ctx.font = `bold ${designationSize}px "${designationFont}"`; // Wrap font name in quotes to handle spaces
    ctx.fillText(name, centerX, designationY + designationSize); // Position based on slider + font size

    if (textureImg && textureBlendMode === "beforeBanner") {
        ctx.globalAlpha = parseFloat(formData.textureOpacity) ?? 1.0;
        ctx.drawImage(textureImg, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
    }

     // Draw texture over everything else
     if (textureImg && textureBlendMode === "afterAll") {
        ctx.globalAlpha = parseFloat(formData.textureOpacity) ?? 1.0;
         // Draw the texture to cover the entire canvas
         ctx.drawImage(textureImg, 0, 0, canvas.width, canvas.height);
         ctx.globalAlpha = 1.0; // Reset alpha
     }








    // The "Auteur" is intentionally not drawn on the card preview. The data is still saved with the item upon creation.
  }

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    html.find('button.file-picker').click(this._onBrowseFile.bind(this));
    html.find('button.export-png-server-button').click(this._onExportToPNGServer.bind(this)); // Renamed: Export PNG to Server button
    html.find('button.download-png-local-button').click(this._onDownloadPNGLocally.bind(this)); // New: Download PNG Locally button
    html.find('button.reset-position').click(this._onResetPosition.bind(this));

    // Concept Tab Listeners
    html.find('button.new-creation').click(this._onNewCreation.bind(this));
    html.find('button.save-preset').click(this._onSavePreset.bind(this));
    html.find('.load-preset').click(this._onLoadPreset.bind(this));
    html.find('.delete-preset').click(this._onDeletePreset.bind(this));

    html.find('button.create-artist-style').click(this._onCreateArtistStyle.bind(this));
    html.find('button.load-artist-style').click(this._onLoadArtistStyle.bind(this));
    html.find('button.save-artist-style').click(this._onSaveArtistStyle.bind(this));
    html.find('button.delete-artist-style').click(this._onDeleteArtistStyle.bind(this));
    html.find('button.lock-artist-style').click(this._onLockArtistStyle.bind(this));

    // Refresh Images Button
    html.find('button.refresh-images').click(this._onRefreshImages.bind(this));

    // Listener for the new visual image pickers
    html.find('.image-picker-container .picker-thumbnail').on('click', this._onThumbnailClick.bind(this));

    // Update preview on change for select and text inputs
    html.find('select, input[type="text"], input[type="color"]').on('change', () => this._updatePreview());

    // Update preview in real-time for ALL range sliders
    html.find('input[type="range"]').on('input', (event) => {
        const value = event.currentTarget.value;
        // Format to 2 decimal places only if it's a float, otherwise show integer
        const formattedValue = Number.isInteger(parseFloat(value)) ? value : parseFloat(value).toFixed(2);
        $(event.currentTarget).siblings('.range-value').text(formattedValue);
        this._updatePreview();
    });

    // Add listeners for dragging the portrait on the canvas
    const canvas = html.find('#trumpCanvas');
    canvas.on('mousedown', this._onDragStart.bind(this));
    canvas.on('mousemove', this._onDragMove.bind(this));
    canvas.on('mouseup', this._onDragEnd.bind(this));
    canvas.on('mouseleave', this._onDragEnd.bind(this));

    // A small timeout ensures the canvas is ready for the initial render
    setTimeout(() => {
        // Initialize ALL range slider displays on first render
        html.find('input[type="range"]').each((index, element) => {
            const value = element.value;
            const formattedValue = Number.isInteger(parseFloat(value)) ? value : parseFloat(value).toFixed(2);
            $(element).siblings('.range-value').text(formattedValue);
        });

        // Initialize image picker selections
        this._updatePickerSelection('frame', this.form.elements.frame.value);
        this._updatePickerSelection('banner', this.form.elements.banner.value);
        this._updatePickerSelection('texture', this.form.elements.texture.value);

        this._updatePreview();
    }, 100);
  }

  _onBrowseFile(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const targetName = $(button).data('target');
    if (!targetName) return;

    new FilePicker({
        type: "image",
        button: button,
        current: this.form.elements[targetName]?.value ?? "",
        callback: path => {
          this.form.elements[targetName].value = path;
          this._updatePreview(); // Trigger preview update after selecting a file
        }
    }).browse();
  }

  /** Resets the portrait's position and scale */
  _onResetPosition(event) {
    event.preventDefault();
    this.form.elements.portraitX.value = 0;
    this.form.elements.portraitY.value = 0;
    this.form.elements.portraitScale.value = 1.0;
    // Also update the text display for the slider
    $(this.form.elements.portraitScale).siblings('.range-value').text('1.00');
    this._updatePreview();
  }

  /** Handle starting a drag operation on the canvas */
  _onDragStart(event) {
    event.preventDefault();
    this.isDragging = true;
    this.dragStart = { x: event.clientX, y: event.clientY };
    // Get current offsets from hidden inputs
    this.initialOffset = {
        x: parseFloat(this.form.elements.portraitX.value) || 0,
        y: parseFloat(this.form.elements.portraitY.value) || 0
    };
  }

  /** Handle moving the mouse during a drag operation */
  _onDragMove(event) {
    if (!this.isDragging) return;
    event.preventDefault();
    const dx = event.clientX - this.dragStart.x;
    const dy = event.clientY - this.dragStart.y;

    // Update hidden inputs directly, which will be read by _updatePreview
    this.form.elements.portraitX.value = this.initialOffset.x + dx;
    this.form.elements.portraitY.value = this.initialOffset.y + dy;

    this._updatePreview();
  }

  /** Handle ending a drag operation */
  _onDragEnd(event) {
    if (!this.isDragging) return;
    event.preventDefault();
    this.isDragging = false;
  }

  /**
   * Handles clicks on the visual picker thumbnails.
   * @param {MouseEvent} event The triggering click event.
   * @private
   */
  _onThumbnailClick(event) {
    event.preventDefault();
    const target = $(event.currentTarget);
    const container = target.closest('.image-picker-container');
    const targetInputName = container.data('target');
    const value = target.data('value');

    if (this.form.elements[targetInputName]) {
        this.form.elements[targetInputName].value = value;
    }

    container.find('.picker-thumbnail').removeClass('selected');
    target.addClass('selected');

    this._updatePreview();
  }

  _updatePickerSelection(key, value) {
    const container = this.element.find(`.image-picker-container[data-target="${key}"]`);
    if (container.length) {
        container.find('.picker-thumbnail').removeClass('selected');
        const selector = value ? `.picker-thumbnail[data-value="${value}"]` : '.picker-thumbnail[data-value=""]';
        container.find(selector).addClass('selected');
    }
  }

  /**
   * Refreshes the list of available images for frames or banners.
   * @param {MouseEvent} event The triggering click event.
   * @private
   */
  async _onRefreshImages(event) {
    event.preventDefault();
    const targetType = event.currentTarget.dataset.targetType; // 'frames' or 'banners'

    if (targetType === 'frames') {
        const frameDirectory = "systems/ambre/assets/skin/trumps/";
        const framePattern = /frameTrump(\d+)\.(png|webp|jpe?g)$/i;
        this.options.frames = await this._getDynamicImageOptions(frameDirectory, framePattern, "Cadre");
        this.options.frames.unshift({ label: "Aucun", value: "" });
    } else if (targetType === 'banners') {
        const bannerDirectory = "systems/ambre/assets/skin/trumps/";
        const bannerPattern = /frameBanner(\d+)\.(png|webp|jpe?g)$/i;
        this.options.banners = await this._getDynamicImageOptions(bannerDirectory, bannerPattern, "Bannière");
        this.options.banners.unshift({ label: "Aucune", value: "" });
    } else if (targetType === 'textures') {
        const textureDirectory = "systems/ambre/assets/skin/textures/";
        const texturePattern = /texture(\d+)\.(png|webp|jpe?g)$/i;
        this.options.textures = await this._getDynamicImageOptions(textureDirectory, texturePattern, "Texture");
        this.options.textures.unshift({ label: "Aucune", value: "" });
    }
    const typeLabel = targetType === 'frames' ? 'cadre' : (targetType === 'banners' ? 'bannière' : 'texture');
    ui.notifications.info(`Images de ${typeLabel} rafraîchies.`);
    this.render(false); // Re-render the form without re-fetching all data
  }

  /**
   * Resets the form to its default state to start a new creation.
   * @param {MouseEvent} event The triggering click event.
   * @private
   */
  _onNewCreation(event) {
    event.preventDefault();
    if (this.form) {
      this.form.reset(); // Resets form fields to their initial values from HTML.

      // After resetting, we need to manually update the text display for range sliders
      // because form.reset() doesn't trigger 'input' or 'change' events.
      this.element.find('input[type="range"]').each((index, element) => {
        const value = element.value;
        const formattedValue = Number.isInteger(parseFloat(value)) ? value : parseFloat(value).toFixed(2);
        $(element).siblings('.range-value').text(formattedValue);
      });

      // Also reset the hidden portrait offset fields.
      this.form.elements.portraitX.value = 0;
      this.form.elements.portraitY.value = 0;

      // Reset picker selections to 'none'
      this._updatePickerSelection('frame', '');
      this._updatePickerSelection('banner', '');
      this._updatePickerSelection('texture', '');

      this._updatePreview();
      ui.notifications.info("Le formulaire a été réinitialisé.");
    }
  }

  /**
   * Extracts only the style-related fields from the form data.
   * @param {object} formData The full form data object.
   * @returns {object} An object containing only the style properties.
   * @private
   */
  _getStyleDataFromForm(formData) {
    return {
        backgroundColor: formData.backgroundColor,
        backgroundOpacity: formData.backgroundOpacity,
        frame: formData.frame,
        frameScale: formData.frameScale,
        frameOpacity: formData.frameOpacity,
        banner: formData.banner,
        bannerScale: formData.bannerScale,
        bannerOpacity: formData.bannerOpacity,
        bannerY: formData.bannerY,
        texture: formData.texture,
        textureOpacity: formData.textureOpacity,
        designationFont: formData.designationFont,
        designationColor: formData.designationColor,
        designationSize: formData.designationSize,
        designationY: formData.designationY
    };
  }

  async _onCreateArtistStyle(event) {
    event.preventDefault();
    const newName = this.element.find('[name="newArtistStyleName"]').val()?.trim();
    if (!newName) {
        return ui.notifications.warn("Veuillez entrer un nom pour le nouveau style.");
    }

    const styles = game.settings.get("ambre", "atoutArtistStyles") || {};
    if (styles[newName]) {
        return ui.notifications.warn(`Un style nommé "${newName}" existe déjà.`);
    }

    const formData = new FormDataExtended(this.form).object;
    const styleData = this._getStyleDataFromForm(formData);

    styles[newName] = {
        locked: false,
        data: styleData
    };

    await game.settings.set("ambre", "atoutArtistStyles", styles);
    ui.notifications.info(`Le style de l'artiste "${newName}" a été créé.`);
    this.element.find('[name="newArtistStyleName"]').val(""); // Clear input
    this.render();
  }

  _onLoadArtistStyle(event) {
    event.preventDefault();
    const styleName = this.element.find('[name="selectedArtistStyle"]').val();
    if (!styleName) {
        return ui.notifications.warn("Veuillez sélectionner un style à charger.");
    }

    const styles = game.settings.get("ambre", "atoutArtistStyles") || {};
    const style = styles[styleName];

    if (!style) {
        return ui.notifications.error(`Impossible de trouver le style "${styleName}".`);
    }

    // Populate form, excluding fields that are not part of the style
    for (const [key, value] of Object.entries(style.data)) {
        const field = this.form.elements[key];
        if (field) {
            field.value = value;
            if (field.type === "range") {
                const formattedValue = Number.isInteger(parseFloat(value)) ? value : parseFloat(value).toFixed(2);
                $(field).siblings('.range-value').text(formattedValue);
            }
            // If it's an image picker, update its selection
            if (key === 'frame' || key === 'banner') {
                this._updatePickerSelection(key, value);
            }
        }
    }

    ui.notifications.info(`Style "${styleName}" chargé.`);
    this._updatePreview();
  }

  async _onSaveArtistStyle(event) {
    event.preventDefault();
    const styleName = this.element.find('[name="selectedArtistStyle"]').val();
    if (!styleName) {
        return ui.notifications.warn("Veuillez sélectionner un style à sauvegarder.");
    }

    const styles = game.settings.get("ambre", "atoutArtistStyles") || {};
    const style = styles[styleName];

    if (!style) {
        return ui.notifications.error(`Impossible de trouver le style "${styleName}".`);
    }

    if (style.locked) {
        return ui.notifications.warn(`Le style "${styleName}" est verrouillé et ne peut pas être modifié.`);
    }

    const formData = new FormDataExtended(this.form).object;
    const newStyleData = this._getStyleDataFromForm(formData);

    style.data = newStyleData;

    await game.settings.set("ambre", "atoutArtistStyles", styles);
    ui.notifications.info(`Le style "${styleName}" a été mis à jour.`);
  }

  async _onDeleteArtistStyle(event) {
    event.preventDefault();
    const styleName = this.element.find('[name="selectedArtistStyle"]').val();
    if (!styleName) {
        return ui.notifications.warn("Veuillez sélectionner un style à supprimer.");
    }

    const styles = game.settings.get("ambre", "atoutArtistStyles") || {};
    if (!styles[styleName]) {
        return ui.notifications.error(`Impossible de trouver le style "${styleName}".`);
    }

    const confirmed = await Dialog.confirm({
        title: "Supprimer le Style",
        content: `<p>Êtes-vous sûr de vouloir supprimer le style "<strong>${styleName}</strong>" ?</p>`,
        yes: () => true,
        no: () => false,
        defaultYes: false
    });

    if (confirmed) {
        delete styles[styleName];
        await game.settings.set("ambre", "atoutArtistStyles", styles);
        ui.notifications.info(`Style "${styleName}" supprimé.`);
        this.render();
    }
  }

  async _onLockArtistStyle(event) {
    event.preventDefault();
    const styleName = this.element.find('[name="selectedArtistStyle"]').val();
    if (!styleName) {
        return ui.notifications.warn("Veuillez sélectionner un style à verrouiller/déverrouiller.");
    }

    const styles = game.settings.get("ambre", "atoutArtistStyles") || {};
    const style = styles[styleName];

    if (!style) {
        return ui.notifications.error(`Impossible de trouver le style "${styleName}".`);
    }

    style.locked = !style.locked;

    await game.settings.set("ambre", "atoutArtistStyles", styles);
    ui.notifications.info(`Le style "${styleName}" a été ${style.locked ? 'verrouillé' : 'déverrouillé'}.`);
    this.render();
  }

  /**
   * Saves the current form configuration as a named preset.
   * @param {MouseEvent} event The triggering click event.
   * @private
   */
  async _onSavePreset(event) {
    event.preventDefault();
    const presetName = this.element.find('[name="presetName"]').val()?.trim();
    if (!presetName) {
        return ui.notifications.warn("Veuillez entrer un nom pour la configuration.");
    }

    const formData = new FormDataExtended(this.form).object;
    const presets = game.settings.get("ambre", "atoutGeneratorPresets") || {};
    
    presets[presetName] = formData;
    
    await game.settings.set("ambre", "atoutGeneratorPresets", presets);
    ui.notifications.info(`Configuration "${presetName}" sauvegardée.`);
    this.render(); // Re-render to show the new preset in the list
  }

  /**
   * Loads a saved preset configuration into the form.
   * @param {MouseEvent} event The triggering click event.
   * @private
   */
  _onLoadPreset(event) {
    event.preventDefault();
    const presetName = event.currentTarget.dataset.presetName;
    const presets = game.settings.get("ambre", "atoutGeneratorPresets") || {};
    const presetData = presets[presetName];

    if (!presetData) {
        return ui.notifications.error(`Impossible de trouver la configuration "${presetName}".`);
    }

    // Populate the form with the preset data
    for (const [key, value] of Object.entries(presetData)) {
        const field = this.form.elements[key];
        if (field) {
            field.value = value;
            // If it's a range slider, also update its text display
            if (field.type === "range") {
                const formattedValue = Number.isInteger(parseFloat(value)) ? value : parseFloat(value).toFixed(2);
                $(field).siblings('.range-value').text(formattedValue);
            }
            // If it's an image picker, update its selection
            if (key === 'frame' || key === 'banner') {
                this._updatePickerSelection(key, value);
            }
        }
    }

    ui.notifications.info(`Configuration "${presetName}" chargée.`);
    this._updatePreview();
  }

  /**
   * Deletes a saved preset configuration.
   * @param {MouseEvent} event The triggering click event.
   * @private
   */
  async _onDeletePreset(event) {
    event.preventDefault();
    const presetName = event.currentTarget.dataset.presetName;
    const presets = game.settings.get("ambre", "atoutGeneratorPresets") || {};

    if (presets[presetName]) {
        const confirmed = await Dialog.confirm({
            title: "Supprimer la Configuration",
            content: `<p>Êtes-vous sûr de vouloir supprimer la configuration "<strong>${presetName}</strong>" ?</p>`,
            yes: () => true,
            no: () => false,
            defaultYes: false
        });

        if (confirmed) {
            delete presets[presetName];
            await game.settings.set("ambre", "atoutGeneratorPresets", presets);
            ui.notifications.info(`Configuration "${presetName}" supprimée.`);
            this.render(); // Re-render to remove the preset from the list
        }
    }
  }

  /** Gestion du formulaire */
  async _updateObject(event, formData) { // This method is for creating the Atout item, not direct export
    const canvas = this.element.find('#trumpCanvas')[0];
    if (!canvas) {
        return ui.notifications.error("Le canvas de prévisualisation est introuvable.");
    }

    // 1. Convert canvas to a Blob, then a File
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/webp', 0.9));
    if (!blob) {
        return ui.notifications.error("Erreur lors de la création de l'image de l'atout.");
    }
    const fileName = `${formData.name.slugify({strict: true})}-${Date.now()}.webp`;
    const file = new File([blob], fileName, { type: 'image/webp' });

    // 2. Define a world-specific upload path and ensure it exists before uploading
    const uploadPath = `worlds/${game.world.id}/atouts-generes`;
    try {
        // This will create the directory if it doesn't exist.
        // It throws an error if it already exists, which we can safely ignore.
        await FilePicker.createDirectory("data", uploadPath, {});
    } catch (err) {
        // Check if the error is because the directory already exists. If so, it's not a problem.
        if (!err.message.includes("already exists")) {
            console.error("Ambre | AtoutGenerator | Failed to create directory for atouts.", err);
            return ui.notifications.error("Impossible de créer le répertoire de sauvegarde pour les atouts.");
        }
    }

    // 3. Upload the file
    let uploadedPath;
    try {
        const response = await FilePicker.upload("data", uploadPath, file, {});
        uploadedPath = response.path;
    } catch (err) {
        console.error("Ambre | AtoutGenerator | Failed to upload atout image.", err);
        return ui.notifications.error("Impossible de sauvegarder l'image de l'atout sur le serveur.");
    }

    if (!uploadedPath) return;

    // 4. Prepare item data with the new image path
    const itemData = {
        name: formData.name || "Nouvel Atout",
        type: "atout",
        img: uploadedPath, // Use the final composited image as the item's icon and main image
        system: {
            // We still save all generator settings in case we want to edit the card later
            auteur: formData.auteur,
            representation: uploadedPath, // This also points to the final image
            background: formData.backgroundColor,
            frame: formData.frame,
            banner: formData.banner,
            texture: formData.texture,
            textureBlendMode: formData.textureBlendMode,
            portraitScale: formData.portraitScale,
            portraitMaskWidth: formData.portraitMaskWidth,
            frameScale: formData.frameScale,
            portraitX: formData.portraitX,
            portraitY: formData.portraitY,
            backgroundOpacity: formData.backgroundOpacity,
            frameOpacity: formData.frameOpacity,
            bannerOpacity: formData.bannerOpacity,
            textureOpacity: formData.textureOpacity,
            bannerScale: formData.bannerScale,
            bannerY: formData.bannerY,
            designationFont: formData.designationFont,
            designationColor: formData.designationColor,
            designationSize: formData.designationSize,
            designationY: formData.designationY
        }
    };

    // 5. Create the item
    if (this.actor) {
      await Item.create(itemData, {parent: this.actor});
      ui.notifications.info(`L'atout "${itemData.name}" a été créé pour ${this.actor.name}.`);
    } else {
      await Item.create(itemData);
      ui.notifications.info(`L'atout "${itemData.name}" a été créé dans le répertoire d'Objets du monde.`);
    }
  }

  /**
   * Exports the current canvas content as a PNG image to a user-specified directory in the Foundry Data folder (server-side).
   * @param {MouseEvent} event The triggering click event.
   * @private
   */
  async _onExportToPNGServer(event) {
    event.preventDefault();
    const canvas = this.element.find('#trumpCanvas')[0];
    if (!canvas) {
      return ui.notifications.error("Le canvas de prévisualisation est introuvable pour l'exportation.");
    }

    const defaultPath = `worlds/${game.world.id}/atouts-png-exports`;

    const dialogContent = `
        <p>Choisissez le répertoire de destination pour l'image PNG. Le fichier sera sauvegardé sur le <strong>serveur</strong>, dans votre dossier de données utilisateur Foundry.</p>
        <form>
            <div class="form-group">
                <label>Répertoire de Destination</label>
                <div class="form-fields">
                    <input type="text" name="export-path" value="${defaultPath}" />
                    <button type="button" class="browse-export-path" title="Parcourir les répertoires du serveur"><i class="fas fa-folder-open"></i></button>
                </div>
            </div>
        </form>
        <p class="notes">Pour télécharger le fichier directement sur votre ordinateur, utilisez le bouton "Télécharger PNG (Local)".</p>
    `;

    new Dialog({
        title: "Exporter l'Atout en PNG (vers le Serveur)",
        content: dialogContent,
        buttons: {
            export: {
                icon: '<i class="fas fa-file-export"></i>',
                label: "Exporter",
                callback: async (html) => {
                    const path = html.find('input[name="export-path"]').val().trim();
                    if (!path) return ui.notifications.warn("Le chemin d'exportation ne peut pas être vide.");

                    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    if (!blob) return ui.notifications.error("Erreur lors de la création de l'image PNG.");

                    const formName = new FormDataExtended(this.form).object.name || "nouvel-atout";
                    const fileName = `${formName.slugify({strict: true})}-${Date.now()}.png`;
                    const file = new File([blob], fileName, { type: 'image/png' });

                    try {
                        await FilePicker.createDirectory("data", path, {});
                    } catch (err) {
                        if (!err.message.includes("already exists")) {
                            console.error(`Ambre | Could not create export directory at ${path}`, err);
                            return ui.notifications.error(`Impossible de créer le répertoire d'exportation : ${path}`);
                        }
                    }

                    const response = await FilePicker.upload("data", path, file, {});
                    ui.notifications.info(`Atout exporté avec succès vers : ${response.path}`);
                }
            },
            cancel: { icon: '<i class="fas fa-times"></i>', label: "Annuler" }
        },
        default: "export",
        render: (html) => {
            // Add listener for the new browse button inside the dialog
            html.find('.browse-export-path').on('click', (ev) => {
                ev.preventDefault();
                const pathInput = html.find('input[name="export-path"]'); // This is the input field
                new FilePicker({
                    type: "folder",
                    current: pathInput.val(),
                    callback: (path) => {
                        pathInput.val(path);
                    }
                }).render(true, {top: ev.clientY - 100, left: ev.clientX - 200}); // Render directly, providing a hint for position
            });
        }
    }).render(true);
  }

  /**
   * Exports the current canvas content as a PNG image for local download (client-side "Save As").
   * @param {MouseEvent} event The triggering click event.
   * @private
   */
  _onDownloadPNGLocally(event) {
    event.preventDefault();
    const canvas = this.element.find('#trumpCanvas')[0];
    if (!canvas) {
      return ui.notifications.error("Le canvas de prévisualisation est introuvable pour l'exportation.");
    }

    const dataURL = canvas.toDataURL('image/png');
    const formName = new FormDataExtended(this.form).object.name || "Nouvel Atout";
    const fileName = `${formName.slugify({strict: true})}.png`;

    const a = document.createElement('a');
    a.href = dataURL;
    a.download = fileName;
    document.body.appendChild(a); // Required for Firefox
    a.click();
    document.body.removeChild(a); // Clean up
    ui.notifications.info(`Image "${fileName}" téléchargée.`);
  }
}
