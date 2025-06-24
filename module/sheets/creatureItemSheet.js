console.log("Ambre | creatureItemSheet.js SCRIPT LOADED"); // <-- ADD THIS LINE

export default class creatureItemSheet extends ItemSheet {
    constructor(...args) {
        super(...args);
        this._leftColumnStateInitialized = false; // For initial width adjustment
        this._initialWidthAdjusted = false; // For the right-side panel
    }

    static get  defaultOptions() {
return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["ambre", "sheet", "item", "creature-card-sheet"],
        template: "systems/ambre/templates/sheets/creature-sheet.hbs", // Corrected path
        width: 800, // Adjusted from 900. Center column is 750px, allowing for padding.
        height: 620,
        resizable: true,
      });
    }

    get template() {
        return `systems/ambre/templates/sheets/creature-sheet.hbs`;
    }

    async getData(options) {
        const context = await super.getData(options);
        const item = context.item;
        // item here is this.item, which is the document for which the sheet is being rendered.
        context.system = item.system;
        context.system.xCounter = item.system.xCounter || 1; // Ensure xCounter defaults to 1 for display

        context.currentLivePossessingActorName = null; // For display when unlocked
        context.possessingPjActorName = null;
        let actualPossessingActor = null;

        console.log(`Ambre | getData for creature: "${item.name}" (ID: ${item.id}, UUID: ${item.uuid}, isOwned: ${item.isOwned})`);
        if (item.isOwned && item.actor) {
            console.log(`Ambre |   Item is directly owned by Actor: "${item.actor.name}" (ID: ${item.actor.id}, Type: ${item.actor.type})`);
        } else if (item.isOwned && !item.actor) {
            console.warn(`Ambre |   Item isOwned is true, but item.actor is not defined for "${item.name}" (${item.id}). This might indicate an issue.`);
        }
        console.log(`Ambre |   Initial state: system.linked = ${context.system.linked}, system.locked = ${context.system.locked}`);

        // Step 1: Determine the actual possessing actor.
        // This determination is now independent of the 'system.linked' status.
        if (item.isOwned && item.actor) {
            // If the item sheet is for an item directly owned by an actor
            actualPossessingActor = item.actor;
            console.log(`Ambre |   Using direct owner: item.actor is "${actualPossessingActor.name}" (ID: ${item.actor.id}, Type: ${actualPossessingActor.type}).`);
        } else if (!item.isOwned) {
            // If the item sheet is for a world item (item.isOwned is false).
            // Attempt to find if any actor in the game has an item with this specific (world item's) ID.
            console.log(`Ambre |   Item is a world item (isOwned: false). Performing general search for any actor possessing this specific item ID (${item.id})...`);
            actualPossessingActor = game.actors.find(actor => actor.items.has(item.id));
            if (actualPossessingActor) {
                console.log(`Ambre |   General search found an actor: "${actualPossessingActor.name}" (ID: ${actualPossessingActor.id}, Type: ${actualPossessingActor.type}) possessing item ID ${item.id}.`);
            } else {
                console.warn(`Ambre |   General search: No actor found possessing an item with the world item's ID "${item.id}".`);
            }
        }
        // If item.isOwned is true but item.actor is null/undefined, actualPossessingActor remains null.

        // Manual actor linking (and thus enrichedLinkedActors) has been removed.
        // The system.linkedActors field on the item will no longer be used by this sheet.

        // Step 2: Populate possessingPjActorName.
        if (context.system.locked) {
            if (context.system.possessingActorNameOnLock) {
                context.possessingPjActorName = context.system.possessingActorNameOnLock;
                console.log(`Ambre | Item is locked. Using stored owner name: "${context.possessingPjActorName}".`);
            } else {
                console.log(`Ambre | Item is locked, but no 'possessingActorNameOnLock' was stored.`);
            }
            // currentLivePossessingActorName remains null as we show the locked-in name
        } else {
            if (actualPossessingActor) {
                context.currentLivePossessingActorName = actualPossessingActor.name;
                console.log(`Ambre | Item is UNLOCKED. Current live possessor: "${context.currentLivePossessingActorName}".`);
            }
            // possessingPjActorName remains null as it's for the locked state display
        }

        // --- Prepare Dynamic Attribute Descriptions ---
        context.dynamicDescriptions = {}; // Initialize

        // Determine characteristic values to use for calculations
        let physiqueValueForCalc = 0, enduranceValueForCalc = 0, psycheValueForCalc = 0, perceptionValueForCalc = 0;
        let physiqueSource = "None", enduranceSource = "None", psycheSource = "None", perceptionSource = "None";

        if (context.system.locked) {
            physiqueValueForCalc = Number(context.system.storedPhysique) || 0;
            enduranceValueForCalc = Number(context.system.storedEndurance) || 0;
            psycheValueForCalc = Number(context.system.storedPsyche) || 0;
            perceptionValueForCalc = Number(context.system.storedPerception) || 0;
            physiqueSource = `Stored (Locked): ${physiqueValueForCalc}`;
            enduranceSource = `Stored (Locked): ${enduranceValueForCalc}`;
            psycheSource = `Stored (Locked): ${psycheValueForCalc}`;
            perceptionSource = `Stored (Locked): ${perceptionValueForCalc}`;
            console.log(`Ambre | Using STORED stats for dynamic descriptions because item is locked.`);
        } else if (actualPossessingActor) {
            physiqueValueForCalc = actualPossessingActor.system.physique || 0;
            enduranceValueForCalc = actualPossessingActor.system.endurance || 0;
            psycheValueForCalc = actualPossessingActor.system.psyche || 0;
            perceptionValueForCalc = actualPossessingActor.system.perception || 0;
            physiqueSource = `Live Actor (${actualPossessingActor.name}): ${physiqueValueForCalc}`;
            enduranceSource = `Live Actor (${actualPossessingActor.name}): ${enduranceValueForCalc}`;
            psycheSource = `Live Actor (${actualPossessingActor.name}): ${psycheValueForCalc}`;
            perceptionSource = `Live Actor (${actualPossessingActor.name}): ${perceptionValueForCalc}`;
            console.log(`Ambre | Using LIVE stats from actor "${actualPossessingActor.name}" for dynamic descriptions.`);
        } else {
            physiqueSource = "No Actor (Unlocked): 0";
            enduranceSource = "No Actor (Unlocked): 0";
            psycheSource = "No Actor (Unlocked): 0";
            perceptionSource = "No Actor (Unlocked): 0";
            console.log(`Ambre | No possessing actor and item not locked. Using default 0 for stats in dynamic descriptions.`);
        }

        if (true) { // This block will always run to set descriptions, using defaults if no actor/stored stats
            // console.log(`Ambre | Calculating dynamic descriptions. Locked: ${context.system.locked}, Actor: ${actualPossessingActor ? actualPossessingActor.name : 'None'}`);

            // --- Vitesse ---
            const vitesseLevel = parseInt(context.system.vitesse, 10) || 0;
            let vitesseBase = 0;
            let vitesseDesc = "Non Applicable";

            if (vitesseLevel === 5) vitesseBase = 50;
            else if (vitesseLevel === 10) vitesseBase = 100;
            else if (vitesseLevel === 15) vitesseBase = 150;

            if (vitesseBase > 0) {
                const physiqueBonus = Math.floor(Number(physiqueValueForCalc) / 2);
                vitesseDesc = `Vitesse de ${vitesseBase + physiqueBonus} km/h.`;
            }
            context.dynamicDescriptions.vitesse = vitesseDesc;
            console.log(`Ambre | Vitesse Level: ${vitesseLevel}, Physique (${physiqueSource}), Bonus: ${Math.floor(Number(physiqueValueForCalc) / 2)}, Desc: ${vitesseDesc}`);

            // --- Résistance ---
            const resistanceLevel = parseInt(context.system.resistance, 10) || 0;
            let resistanceBase = 0;
            let resistanceDesc = "Non Applicable";

            if (resistanceLevel === 5) resistanceBase = 5;
            else if (resistanceLevel === 10) resistanceBase = 10;
            else if (resistanceLevel === 15) resistanceBase = 15;

            if (resistanceBase > 0) {
                const enduranceBonus = Math.floor(Number(enduranceValueForCalc) / 2);
                resistanceDesc = `Résistance de ${resistanceBase + enduranceBonus}.`;
            }
            context.dynamicDescriptions.resistance = resistanceDesc;
            console.log(`Ambre | Résistance Level: ${resistanceLevel}, Endurance (${enduranceSource}), Bonus: ${Math.floor(Number(enduranceValueForCalc) / 2)}, Desc: ${resistanceDesc}`);

            // --- Vitalité ---
            const vitaliteLevel = parseInt(context.system.vitalite, 10) || 0;
            let vitaliteBase = 0;
            let vitaliteDesc = "Votre créature aura 1 point de vie."; // Default for level 0
            let enduranceBonusVitalite = 0; // Initialize bonus

            if (vitaliteLevel === 5) vitaliteBase = 5;
            else if (vitaliteLevel === 10) vitaliteBase = 10;
            else if (vitaliteLevel === 15) vitaliteBase = 15;

            if (vitaliteBase > 0) { // Only calculate bonus if a level > 0 is selected
                enduranceBonusVitalite = Math.floor(Number(enduranceValueForCalc) / 2);
                vitaliteDesc = `Vitalité de ${vitaliteBase + enduranceBonusVitalite}.`;
            }
            context.dynamicDescriptions.vitalite = vitaliteDesc;
            console.log(`Ambre | Vitalité Level: ${vitaliteLevel}, Endurance (${enduranceSource}), Bonus Applied: ${vitaliteBase > 0 ? enduranceBonusVitalite : 'N/A'}, Desc: ${vitaliteDesc}`);

            // --- Souffle ---
            const souffleLevel = parseInt(context.system.souffle, 10) || 0;
            let souffleBase = 0;
            let souffleDesc = "Non Applicable"; // Default for level 0

            if (souffleLevel === 5) souffleBase = 5;
            else if (souffleLevel === 10) souffleBase = 10;
            else if (souffleLevel === 15) souffleBase = 15;

            if (souffleBase > 0) {
                const enduranceBonusSouffle = Math.floor(Number(enduranceValueForCalc) / 2);
                souffleDesc = `Souffle de ${souffleBase + enduranceBonusSouffle}.`;
            }
            context.dynamicDescriptions.souffle = souffleDesc;
            console.log(`Ambre | Souffle Level: ${souffleLevel}, Endurance (${enduranceSource}), Bonus: ${Math.floor(Number(enduranceValueForCalc) / 2)}, Desc: ${souffleDesc}`);

            // --- Agression ---
            const agressionLevel = parseInt(context.system.agression, 10) || 0;
            let agressionBase = 0;
            let agressionDesc = "Votre créature ne peut pas combattre."; // Default for level 0

            if (agressionLevel === 5) agressionBase = 5;
            else if (agressionLevel === 10) agressionBase = 10;
            else if (agressionLevel === 15) agressionBase = 15;

            if (agressionBase > 0) {
                const physiqueBonusAgression = Math.floor(Number(physiqueValueForCalc) / 2);
                agressionDesc = `Agression de ${agressionBase + physiqueBonusAgression}.`;
            }
            context.dynamicDescriptions.agression = agressionDesc;
            console.log(`Ambre | Agression Level: ${agressionLevel}, Physique (${physiqueSource}), Bonus: ${Math.floor(Number(physiqueValueForCalc) / 2)}, Desc: ${agressionDesc}`);

            // --- Dégâts ---
            const degatsLevel = parseInt(context.system.degats, 10) || 0;
            let degatsBase = 0;
            let degatsDesc = "Non Applicable";

            if (degatsLevel === 5) degatsBase = 5;
            else if (degatsLevel === 10) degatsBase = 10;
            else if (degatsLevel === 15) degatsBase = 15;

            if (degatsBase > 0) {
                const physiqueBonusDegats = Math.floor(Number(physiqueValueForCalc) / 2);
                degatsDesc = `Dégâts de ${degatsBase + physiqueBonusDegats}.`;
            }
            context.dynamicDescriptions.degats = degatsDesc;
            console.log(`Ambre | Dégâts Level: ${degatsLevel}, Physique (${physiqueSource}), Bonus: ${Math.floor(Number(physiqueValueForCalc) / 2)}, Desc: ${degatsDesc}`);

            // --- Intelligence ---
            const intelligenceLevel = parseInt(context.system.intelligence, 10) || 0;
            let intelligenceBase = 0;
            let intelligenceDesc = "Non Applicable";

            if (intelligenceLevel === 5) intelligenceBase = 5;
            else if (intelligenceLevel === 10) intelligenceBase = 10;
            else if (intelligenceLevel === 15) intelligenceBase = 15;

            if (intelligenceBase > 0) {
                const psycheBonusIntelligence = Math.floor(Number(psycheValueForCalc) / 2);
                intelligenceDesc = `Intelligence de ${intelligenceBase + psycheBonusIntelligence}.`;
            }
            context.dynamicDescriptions.intelligence = intelligenceDesc;
            console.log(`Ambre | Intelligence Level: ${intelligenceLevel}, Psyché (${psycheSource}), Bonus: ${Math.floor(Number(psycheValueForCalc) / 2)}, Desc: ${intelligenceDesc}`);

            // --- Télépathie (conditional on Intelligence) ---
            const telepathieLevel = parseInt(context.system.telepathie, 10) || 0;
            let telepathieBase = 0;
            let telepathieDesc = "Non Applicable";

            if (intelligenceLevel > 0) { // Only if Intelligence is active
                if (telepathieLevel === 5) telepathieBase = 5;
                else if (telepathieLevel === 10) telepathieBase = 10;
                else if (telepathieLevel === 15) telepathieBase = 15;

                if (telepathieBase > 0) {
                    const perceptionBonusTelepathie = Math.floor(Number(perceptionValueForCalc) / 2);
                    telepathieDesc = `Télépathie de ${telepathieBase + perceptionBonusTelepathie}.`;
                }
            }
            context.dynamicDescriptions.telepathie = telepathieDesc;
            console.log(`Ambre | Télépathie Level: ${telepathieLevel} (Int: ${intelligenceLevel}), Perception (${perceptionSource}), Bonus: ${Math.floor(Number(perceptionValueForCalc) / 2)}, Desc: ${telepathieDesc}`);

            // --- Défense Psy (conditional on Intelligence) ---
            const defensepsyLevel = parseInt(context.system.defensepsy, 10) || 0;
            let defensepsyBase = 0;
            let defensepsyDesc = "Non Applicable";

            if (intelligenceLevel > 0) { // Only if Intelligence is active
                if (defensepsyLevel === 5) defensepsyBase = 5;
                else if (defensepsyLevel === 10) defensepsyBase = 10;
                else if (defensepsyLevel === 15) defensepsyBase = 15;
                if (defensepsyBase > 0) {
                    const psycheBonusDefensePsy = Math.floor(Number(psycheValueForCalc) / 2);
                    defensepsyDesc = `Défense Psy de ${defensepsyBase + psycheBonusDefensePsy}.`;
                }
            }
            context.dynamicDescriptions.defensepsy = defensepsyDesc;
            console.log(`Ambre | Défense Psy Level: ${defensepsyLevel} (Int: ${intelligenceLevel}), Psyché (${psycheSource}), Bonus: ${Math.floor(Number(psycheValueForCalc) / 2)}, Desc: ${defensepsyDesc}`);

            // --- Polymorphie ---
            const polymorphieLevel = parseInt(context.system.polymorphie?.value, 10) || 0;
            let polymorphieDesc = "Non Applicable"; // Default description

            // Descriptions for Polymorphie are often direct from the selected level
            if (polymorphieLevel === 5) polymorphieDesc = "Formes simples, changements mineurs.";
            else if (polymorphieLevel === 10) polymorphieDesc = "Formes plus complexes.";
            else if (polymorphieLevel === 15) polymorphieDesc = "Transformations majeures.";
            // Add characteristic bonus if applicable, e.g.:
            // const someBonus = Math.floor((Number(actorCharValue) || 0) / 2);
            // polymorphieDesc = `${polymorphieDesc} (Bonus: ${someBonus})`;

            context.dynamicDescriptions.polymorphie_value = polymorphieDesc; // Key matches data-desc-for
            console.log(`Ambre | Polymorphie Level: ${polymorphieLevel}, Desc: ${polymorphieDesc}`);

        } else {
            // This else block for dynamicDescriptions is no longer strictly needed as the logic above handles all cases.
            // However, ensuring keys exist if no calculations happened (e.g. if the `if(true)` was conditional) is good practice.
            context.dynamicDescriptions.vitesse = null; // Ensure key exists, template will handle null
            context.dynamicDescriptions.resistance = null;
            context.dynamicDescriptions.vitalite = null;
            context.dynamicDescriptions.souffle = null;
            context.dynamicDescriptions.agression = null;
            context.dynamicDescriptions.degats = null;
            context.dynamicDescriptions.intelligence = null;
            context.dynamicDescriptions.telepathie = null;
            context.dynamicDescriptions.defensepsy = null;
            context.dynamicDescriptions.polymorphie_value = null;
        }

        // Fetch list of "pouvoir" items for the Puissance dropdown
        const puissanceOptions = [
            "Abreuvoir",
            "Abysses",
            "Atouts",
            "Chimérion",
            "Coeur-Flamme",
            "Harmonium",
            "Logrus",
            "Magie",
            "Marelle",
            "Métamorphose",
            "Orbochromat",
            "Pentacre",
            "Sablier d'Ujuhe"
        ];
        // The template expects objects with _id and name properties.
        // For this static list, we can use the string itself for both.
        context.pouvoirsList = puissanceOptions.map(p => ({ _id: p, name: p }));

        await this._calculateAndUpdateTotalCost(); // Ensure total cost is up-to-date for rendering
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        // --- Hides attribute rows with a value of 0 when the sheet is locked ---
        if (this.item.system.locked) {
            html.find('.attribute-level-select').each((_index, selectElement) => {
                const select = $(selectElement);
                if (select.val() == "0" || select.val() == 0) {
                    const gridContainer = select.closest('.creature-attributes-list');
                    if (!gridContainer.length) return;

                    const allChildren = gridContainer.children();
                    const niveauDiv = select.closest('.attribute-grid-niveau');
                    const niveauIndex = allChildren.index(niveauDiv);

                    if (niveauIndex > -1) {
                        // The row consists of 5 elements. The 'niveau' div is the 2nd element.
                        const startIndex = niveauIndex - 1;
                        for (let i = 0; i < 5; i++) {
                            if (allChildren[startIndex + i]) $(allChildren[startIndex + i]).hide();
                        }
                    }
                }
            });
        }
        // --- Listener for toggling the description editor ---
        const descriptionSection = html.find('section.sheet-body');
        const toggleEditorBtn = html.find('.toggle-description-editor');

        // Set initial visibility based on flag, default to visible
        const isVisible = this.item.getFlag("ambre", "descriptionEditorVisible") ?? false;
        if (!isVisible) {
            descriptionSection.hide();
        }

        toggleEditorBtn.on('click', ev => {
            ev.preventDefault();
            const isCurrentlyVisible = descriptionSection.is(':visible');
            descriptionSection.slideToggle(200);
            this.item.setFlag("ambre", "descriptionEditorVisible", !isCurrentlyVisible);
        });
        const panel = html.find('.creature-side-panel');
        const toggleBtn = html.find('.toggle-panel-btn');
        const mainContent = html.find('.creature-main-content'); // To push content

        const leftColumn = html.find('.creature-left-column');
        const leftColumnToggleBtn = html.find('.toggle-left-center-column-btn');
        const leftColumnToggleIcon = leftColumnToggleBtn.find('i');
        const leftColumnWidth = 250; // Correction: Doit correspondre à flex-basis de .creature-left-column dans CSS

    
        // Restore panel state if it was previously saved
        if (this.item.getFlag("ambre", "creaturePanelOpen")) {
            panel.addClass('open');
            mainContent.addClass('panel-pushed');
            toggleBtn.find('i').removeClass('fa-chevron-left').addClass('fa-chevron-right');
            // Adjust sheet width if panel is open by default
            if (!this._initialWidthAdjusted) {
                this.setPosition({ width: this.position.width + 300 + 35 }); // Add panel content width (300) + toggle area width (35)
                this._initialWidthAdjusted = true; // Prevent re-adjusting on subsequent renders
            }
        }
    
        toggleBtn.on('click', () => {
            const isOpen = panel.hasClass('open');
            let currentWidth = this.position.width;

            if (isOpen) {
            panel.removeClass('open');
            mainContent.removeClass('panel-pushed');
            toggleBtn.find('i').removeClass('fa-chevron-right').addClass('fa-chevron-left');
            this.setPosition({ width: currentWidth - (300 + 35) }); // Subtract panel content width + toggle area width
            } else {
            panel.addClass('open');
            mainContent.addClass('panel-pushed');
            toggleBtn.find('i').removeClass('fa-chevron-left').addClass('fa-chevron-right');
            this.setPosition({ width: currentWidth + (300 + 35) }); // Add panel content width + toggle area width
            }
            // Save panel state
            this.item.setFlag("ambre", "creaturePanelOpen", !isOpen);
        });

        // --- Left Column Toggle (between Left and Center) ---
        let isLeftColumnVisible = this.item.getFlag("ambre", "creatureLeftColumnVisible") || false; // Default to hidden

        if (!this._leftColumnStateInitialized) {
            if (isLeftColumnVisible) {
                leftColumn.show();
                leftColumnToggleIcon.removeClass('fa-chevron-right').addClass('fa-chevron-left');
                // Adjust sheet width as defaultOptions.width is for the hidden state
                this.setPosition({ width: this.position.width + leftColumnWidth });
            } else {
                leftColumn.hide(); // Ensure it's hidden if flag is false
                leftColumnToggleIcon.removeClass('fa-chevron-left').addClass('fa-chevron-right');
                // Width is already correct as per defaultOptions for hidden state
            }
            this._leftColumnStateInitialized = true;
        } else {
            // On subsequent renders (e.g., after item update), just ensure visibility matches flag
            if (isLeftColumnVisible) {
                leftColumn.show();
                leftColumnToggleIcon.removeClass('fa-chevron-right').addClass('fa-chevron-left');
            } else {
                leftColumn.hide();
                leftColumnToggleIcon.removeClass('fa-chevron-left').addClass('fa-chevron-right');
            }
        }

        leftColumnToggleBtn.on('click', () => {
            const currentlyVisible = leftColumn.is(':visible');
            const newVisibility = !currentlyVisible;
            let currentSheetWidth = this.position.width;

            leftColumn.toggle(newVisibility);
            leftColumnToggleIcon.toggleClass('fa-chevron-left fa-chevron-right');
            this.setPosition({ width: currentSheetWidth + (newVisibility ? leftColumnWidth : -leftColumnWidth) });
            this.item.setFlag("ambre", "creatureLeftColumnVisible", newVisibility);
        });

        // --- Collapsible Sections State Management ---
        const collapsibleHeaders = html.find('.creature-collapsible-header');

        // // Initial state restoration for collapsible sections (REMOVED as per request)
        // collapsibleHeaders.each((_index, el) => {
        //     const header = $(el);
        //     const targetSectionId = header.data('target-section');
        //     const targetSection = html.find('#' + targetSectionId);

        //     if (targetSection.length) { // Ensure the target section exists in the DOM
        //         const flagName = `${targetSectionId}Open`;
        //         const isOpen = this.item.getFlag("ambre", flagName);

        //         if (isOpen === true) {
        //             targetSection.show(); // Show without animation for initial load
        //             header.addClass('open');
        //         } else {
        //             // If flag is false or undefined, ensure it's hidden (default HTML state)
        //             // and icon is in the closed state.
        //             targetSection.hide();
        //             header.removeClass('open');
        //         }
        //     }
        // });

        // Listener for toggling collapsible sections
        collapsibleHeaders.off('click.collapsible').on('click.collapsible', event => { // Added .collapsible namespace
            const header = $(event.currentTarget);
            const targetSectionId = header.data('target-section');
            const targetSection = html.find('#' + targetSectionId);

            if (targetSection.length) {
                const isCurrentlyHidden = targetSection.is(':hidden'); // State *before* toggle (true if it's about to open)
                
                let sectionHeightBeforeToggle = 0;
                if (!isCurrentlyHidden) { // If visible and about to close, get its height
                    sectionHeightBeforeToggle = targetSection.outerHeight(true) || 0;
                }

                targetSection.slideToggle(200, () => { // Callback exécuté après la fin de l'animation
                    // const isNowVisible = targetSection.is(':visible'); // State *after* toggle
                    // this.item.setFlag("ambre", flagName, isNowVisible); // REMOVED: Saving flag state no longer needed

                    let newHeight;
                    if (isCurrentlyHidden) { // Was hidden, now opening
                        const sectionHeightAfterToggle = targetSection.outerHeight(true) || 0;
                        newHeight = this.position.height + sectionHeightAfterToggle;
                    } else { // Was visible, now closing
                        newHeight = this.position.height - sectionHeightBeforeToggle;
                    }

                    // S'assurer que la fenêtre ne devient pas plus petite que sa hauteur par défaut
                    const defaultHeight = this.constructor.defaultOptions.height;
                    this.setPosition({ height: Math.max(newHeight, defaultHeight) });
                });
                header.toggleClass('open'); // Toggles icon immediately
            }
        });
        
        // Ensure all collapsible sections start closed and with the correct icon state
        // This is a safety net in case HTML defaults are somehow overridden before JS runs,
        // or if other parts of the code might show them.
        collapsibleHeaders.each((_index, el) => {
            const header = $(el);
            const targetSectionId = header.data('target-section');
            html.find('#' + targetSectionId).hide();
            header.removeClass('open'); // Ensures icon is in closed state
        });


        // --- Tooltip pour les descriptions d'attributs ---
        html.find('.attribute-info-icon').on('click', function(event) {
            event.stopPropagation(); // Empêche le clic de se propager au document immédiatement
            const icon = $(this);
            const tooltipId = icon.data('tooltip-id');
            const tooltip = html.find('#' + tooltipId);

            // Cache tous les autres tooltips ouverts
            html.find('.tooltip-popup.active').not(tooltip).removeClass('active').hide();

            // Bascule l'état du tooltip actuel
            tooltip.toggleClass('active');
            if (tooltip.hasClass('active')) {
                tooltip.fadeIn(100); // Ou .show() ou .slideDown()
            } else {
                tooltip.fadeOut(100); // Ou .hide() ou .slideUp()
            }
        });

        // Ferme les tooltips si on clique n'importe où ailleurs sur la fiche (sauf sur un autre tooltip/icône)
        html.on('click', function(event) {
            if (!$(event.target).closest('.attribute-info-icon').length && !$(event.target).closest('.tooltip-popup').length) {
                html.find('.tooltip-popup.active').removeClass('active').fadeOut(100);
            }
        });

        // --- Gestion des boutons +/- pour le niveau de Polymorphie ---
        html.find('#creature-polymorphie-content-center .polymorphie-main-value .creature-attribute-value-control .value-increment').click(async ev => {
            const currentValue = parseInt(this.item.system.polymorphie.value) || 0;
            await this.item.update({"system.polymorphie.value": currentValue + 1});
        });

        html.find('#creature-polymorphie-content-center .polymorphie-main-value .creature-attribute-value-control .value-decrement').click(async ev => {
            const currentValue = parseInt(this.item.system.polymorphie.value) || 0;
            if (currentValue > 0) { // Empêche les valeurs négatives, ajustez si nécessaire
                await this.item.update({"system.polymorphie.value": currentValue - 1});
            }
        });

        // --- Gestion des formes de Polymorphie ---
        // Ajouter une forme
        html.find('.add-polymorphie-forme').click(async ev => {
            const alternatives = Array.isArray(this.item.system.polymorphie.formes?.alternatives) 
                ? [...this.item.system.polymorphie.formes.alternatives] 
                : [];
            alternatives.push(""); // Ajoute une nouvelle forme vide
            await this.item.update({"system.polymorphie.formes.alternatives": alternatives});
        });

        // Supprimer une forme
        html.find('.remove-polymorphie-forme').click(async ev => {
            const indexToRemove = parseInt($(ev.currentTarget).data('index'));
            if (isNaN(indexToRemove)) return;

            const alternatives = Array.isArray(this.item.system.polymorphie.formes?.alternatives)
                ? [...this.item.system.polymorphie.formes.alternatives]
                : [];

            if (indexToRemove >= 0 && indexToRemove < alternatives.length) {
                alternatives.splice(indexToRemove, 1); // Supprime l'élément à l'index donné
                await this.item.update({"system.polymorphie.formes.alternatives": alternatives});
            }
        });

        // Mettre à jour la forme par défaut
        html.find('input[name="system.polymorphie.formes.defaut"]').change(async ev => {
            const newValue = $(ev.currentTarget).val();
            await this.item.update({"system.polymorphie.formes.defaut": newValue});
        });

        // Mettre à jour une forme alternative
        html.find('.polymorphie-formes-list input[name^="system.polymorphie.formes.alternatives."]').change(async ev => {
            const inputName = $(ev.currentTarget).attr('name'); // e.g., "system.polymorphieFormes.alternatives.0"
            const newValue = $(ev.currentTarget).val();
            await this.item.update({[inputName]: newValue});
        });

        // --- Listener for attribute level select dropdowns ---
        html.find('.attribute-level-select').on('change', this._onAttributeLevelChange.bind(this));

        this._updateAttributeDescriptionTexts(html); // Initialize description texts
        
        // Listener for the refresh possessing actor icon
        html.find('.refresh-possessing-actor').click(async ev => {
            ev.preventDefault();
            console.log(`Ambre | 'Refresh & Lock' button clicked for creature: "${this.item.name}".`);
            if (this.item.system.locked) {
                ui.notifications.warn("L'action de rafraîchissement est désactivée car l'creature est verrouillé.");
                console.log(`Ambre |   Action aborted: creature is already locked.`);
                return;
            }
            // This button now explicitly handles stat refresh logic AND locking.
            const { statUpdateData, notificationKey, actorNameForNotification } = await this._handleStatRefreshLogic();
            
            const finalUpdateData = {
                ...statUpdateData, // Apply stat changes (or no changes if preserving)
                "system.locked": true
            };

            await this.item.update(finalUpdateData);

            // Construct and display notification
            let notifMsg = `creature "${this.item.name}" verrouillé. `;
            if (notificationKey === "statsStored") {
                notifMsg += `Statistiques de ${actorNameForNotification} stockées.`;
            } else if (notificationKey === "statsCleared") {
                notifMsg += `Aucune statistique d'acteur n'a été stockée (rafraîchissement autorisé, pas d'acteur trouvé, stats précédentes effacées).`;
            } else if (notificationKey === "statsPreservedOnRefreshAttempt") {
                notifMsg += `Les statistiques précédemment stockées ont été préservées (actualisation interdite).`;
            } else {
                notifMsg += `État des statistiques inchangé (comportement par défaut).`; // Fallback
            }
            ui.notifications.info(notifMsg);
            console.log(`Ambre |   Refresh & Lock: ${notifMsg}`);
        });

        // Listener for the toggle stat refresh on lock icon
        html.find('.toggle-stat-refresh-lock').click(async ev => {
            ev.preventDefault();
            if (this.item.system.locked) {
                ui.notifications.warn("L'creature est verrouillé. Déverrouillez-le pour changer ce paramètre d'actualisation des stats.");
                return;
            }
            // Ensure allowStatRefreshOnLock has a boolean value, defaulting to true if somehow undefined.
            const currentAllowState = typeof this.item.system.allowStatRefreshOnLock === 'boolean' ? this.item.system.allowStatRefreshOnLock : true;
            console.log(`Ambre | 'Toggle Allow Stat Refresh on Lock' button clicked for "${this.item.name}". Current state: ${currentAllowState}. Changing to: ${!currentAllowState}.`);
            await this.item.update({"system.allowStatRefreshOnLock": !currentAllowState});
            if (!currentAllowState) { // It was false, now true
                ui.notifications.info(`L'actualisation des stats au verrouillage est maintenant AUTORISÉE pour "${this.item.name}".`);
            } else { // It was true, now false
                ui.notifications.info(`L'actualisation des stats au verrouillage est maintenant INTERDITE pour "${this.item.name}". Les stats existantes seront préservées au prochain verrouillage.`);
            }
            // Sheet re-renders due to item.update(), updating icon and title.
        });

        // Listener for the lock/unlock icon
        html.find('.toggle-creature-lock').click(async ev => {
            ev.preventDefault();
            const currentLockState = this.item.system.locked || false;
            console.log(`Ambre | 'Toggle Lock/Unlock' icon clicked for creature: "${this.item.name}". Current lock state: ${currentLockState}.`);
            if (currentLockState) { // Is currently locked, about to unlock
                await this.item.update({ "system.locked": false });
                ui.notifications.info(`creature "${this.item.name}" déverrouillé. Les statistiques précédemment stockées sont préservées.`);
                console.log(`Ambre |   creature was locked, now unlocked. Previously stored stats are preserved.`);
            } else {
                // Is currently unlocked, about to lock
                // This action now ONLY locks the item and preserves existing stats.
                // Stat refresh logic is handled by the "Refresh & Lock" button.
                await this.item.update({ "system.locked": true });
                ui.notifications.info(`creature "${this.item.name}" verrouillé. Les statistiques précédemment stockées (le cas échéant) ont été préservées.`);
                console.log(`Ambre |   creature is unlocked, now locked. Previously stored stats (if any) are preserved. Stat refresh logic NOT invoked by this action.`);
            }
        });

        // Listeners for the xCounter buttons
        html.find('.x-counter-decrement').click(async ev => {
            ev.preventDefault();
            if (this.item.system.locked) return;
            let currentXCounter = parseInt(this.item.system.xCounter) || 1;
            if (currentXCounter > 1) {
                await this.item.update({"system.xCounter": currentXCounter - 1});
                await this._calculateAndUpdateTotalCost();
            }
        });

        html.find('.x-counter-increment').click(async ev => {
            ev.preventDefault();
            if (this.item.system.locked) return;
            let currentXCounter = parseInt(this.item.system.xCounter) || 1;
            // You might want to add a maximum limit here if desired
            await this.item.update({"system.xCounter": currentXCounter + 1});
            await this._calculateAndUpdateTotalCost();
        });


        // Listener for clearing the stored possessing actor when locked
        html.find('.clear-possessing-actor-on-lock').click(async ev => {
            ev.preventDefault();
            // This button is now intended for use when the item is UNLOCKED,
            // to clear previously stored data.
            if (this.item.system.locked) {
                ui.notifications.warn("L'creature doit être déverrouillé pour oublier les données stockées.");
                return;
            }
            if (this.item.system.possessingActorNameOnLock) {
                const confirmed = await Dialog.confirm({
                    title: "Confirmer l'oubli",
                    content: `<p>Voulez-vous vraiment oublier les données de l'acteur <strong>${this.item.system.possessingActorNameOnLock}</strong> (précédemment stockées) pour cet creature ? Les statistiques (Physique, Endurance, etc.) associées seront également effacées.</p>`,
                    yes: () => true,
                    no: () => false,
                    defaultYes: false
                });

                if (confirmed) {
                    await this.item.update({
                        "system.possessingActorNameOnLock": null,
                        "system.possessingActorIdOnLock": null,
                        "system.storedPhysique": null,
                        "system.storedEndurance": null,
                        "system.storedPsyche": null,
                        "system.storedPerception": null
                    });
                    ui.notifications.info(`L'acteur possesseur stocké pour "${this.item.name}" a été oublié et les stats associées effacées.`);
                }
            } else {
                // This should ideally not be reached if the button is only visible when possessingActorNameOnLock exists.
                ui.notifications.info("Aucune donnée d'acteur précédemment stockée à oublier.");
            }
        });
    } // End of activateListeners

    /**
     * Determines the actor stats to be stored based on allowStatRefreshOnLock.
     * Does NOT update the item directly and does NOT handle locking.
     * @private
     * @returns {Promise<{statUpdateData: object, notificationKey: string, actorNameForNotification: string|null}>}
     *          - statUpdateData: The data to update item stats (e.g., storedPhysique).
     *          - notificationKey: A key to identify the type of notification message.
     *          - actorNameForNotification: Name of the actor if stats were stored.
     */
    async _handleStatRefreshLogic() {
        console.log(`Ambre | _handleStatRefreshLogic called for creature: "${this.item.name}".`);
        let actorToStoreStatsFrom = null;
        const item = this.item;
        const statUpdateData = {};
        let notificationKey = ""; // e.g., "statsStored", "statsCleared", "statsPreservedOnRefreshAttempt"
        let actorNameForNotification = null;

        // Determine the actor whose stats to potentially store
        if (item.isOwned && item.actor) {
            actorToStoreStatsFrom = item.actor;
            console.log(`Ambre |   _handleStatRefreshLogic: Item is owned by "${actorToStoreStatsFrom.name}".`);
        } else if (!item.isOwned) {
            actorToStoreStatsFrom = game.actors.find(a => a.items.has(item.id));
            if (actorToStoreStatsFrom) {
                console.log(`Ambre |   _handleStatRefreshLogic: Item is a world item, found possessed by "${actorToStoreStatsFrom.name}".`);
            } else {
                console.log(`Ambre |   _handleStatRefreshLogic: Item is a world item, and no actor currently possesses it.`);
            }
        } else {
            console.log(`Ambre |   _handleStatRefreshLogic: Item is marked as owned but has no actor reference.`);
        }

        if (this.item.system.allowStatRefreshOnLock) {
            console.log(`Ambre |   _handleStatRefreshLogic: Stat refresh is ALLOWED.`);
            if (actorToStoreStatsFrom) {
                statUpdateData["system.storedPhysique"] = actorToStoreStatsFrom.system.physique || 0;
                statUpdateData["system.storedEndurance"] = actorToStoreStatsFrom.system.endurance || 0;
                statUpdateData["system.storedPsyche"] = actorToStoreStatsFrom.system.psyche || 0;
                statUpdateData["system.storedPerception"] = actorToStoreStatsFrom.system.perception || 0;
                statUpdateData["system.possessingActorNameOnLock"] = actorToStoreStatsFrom.name;
                statUpdateData["system.possessingActorIdOnLock"] = actorToStoreStatsFrom.id;
                notificationKey = "statsStored";
                actorNameForNotification = actorToStoreStatsFrom.name;
                console.log(`Ambre |   _handleStatRefreshLogic: Prepared to store stats for ${actorToStoreStatsFrom.name}.`);
            } else {
                // Refresh allowed, but no actor found. Clear existing stored stats.
                statUpdateData["system.storedPhysique"] = null;
                statUpdateData["system.storedEndurance"] = null;
                statUpdateData["system.storedPsyche"] = null;
                statUpdateData["system.storedPerception"] = null;
                statUpdateData["system.possessingActorNameOnLock"] = null;
                statUpdateData["system.possessingActorIdOnLock"] = null;
                notificationKey = "statsCleared";
                console.log(`Ambre |   _handleStatRefreshLogic: No actor found. Prepared to clear previous stats (if any) as refresh was allowed.`);
            }
        } else {
            // Stat refresh is NOT allowed. Stats will be preserved by not adding them to statUpdateData.
            notificationKey = "statsPreservedOnRefreshAttempt";
            console.log(`Ambre |   _handleStatRefreshLogic: Stat refresh was NOT allowed; existing stored stats will be preserved by not adding them to statUpdateData.`);
        }
        return { statUpdateData, notificationKey, actorNameForNotification };
    }

    async _onAttributeLevelChange(event) {
        const selectElement = event.currentTarget;
        const numericLevel = parseInt(selectElement.value); 

        // Validate numericLevel, though current values ("0", "5", "10", "15") should parse correctly.
        // Ensure <option> values in HTML are purely numeric.
        if (isNaN(numericLevel)) {
            console.warn(`Ambre | Invalid numeric level from select: '${selectElement.value}'. Ensure <option> values are numeric.`);
            return;
        }

        const niveauCell = $(selectElement).closest('.attribute-grid-niveau'); // Changed from .form-group-stat
        const propertyName = niveauCell.data('property-name'); // Get property name from data attribute

        let updates = {};

        if (propertyName) {
            updates[propertyName] = numericLevel;

            // If Intelligence is set to 0, force Telepathie and DefensePsy to 0
            if (propertyName === "system.intelligence" && numericLevel === 0) {
                if (this.item.system.telepathie !== 0) {
                    updates["system.telepathie"] = 0;
                }
                if (this.item.system.defensepsy !== 0) {
                    updates["system.defensepsy"] = 0;
                }
            }
            
            await this.item.update(updates);
            await this._calculateAndUpdateTotalCost(); // Recalculate total cost after all potential updates
        } else {
            console.warn(`Ambre | Could not find data-property-name for attribute level change on element:`, selectElement);
        }
    }

    /**
     * Calculates the total cost based on attribute levels and updates the item.
     * @private
     */
    async _calculateAndUpdateTotalCost() {
        let baseTotalCost = 0;
        const systemData = this.item.system;

        const attributePaths = [
            "vitesse",
            "resistance",
            "vitalite",
            "souffle",
            "agression",
            "degats",
            "intelligence",
            "telepathie",
            "defensepsy",
            "polymorphie.value" // This is the main level for polymorphie
        ];

        for (const path of attributePaths) {
            const value = path.split('.').reduce((o, k) => (o && typeof o[k] !== 'undefined') ? o[k] : 0, systemData);
            baseTotalCost += (parseInt(value) || 0);
        }

        let costBeforeXMultiplier = baseTotalCost;
        // If "Obtenu à la création" is NOT checked (i.e., it's false or undefined), multiply cost by 2.
        // Assumes system.obtainedAtCreation is a boolean. If undefined, it will evaluate as not true.
        if (!(systemData.obtainedAtCreation === true)) {
            costBeforeXMultiplier = baseTotalCost * 2;
        }

        const xMultiplier = parseInt(systemData.xCounter) || 1;
        const finalTotalCost = costBeforeXMultiplier * xMultiplier;
        if (systemData.totalCost !== finalTotalCost) {
            console.log(`Ambre | Recalculating Total Cost: Base=${baseTotalCost}, ObtainedAtCreation=${systemData.obtainedAtCreation}, Final=${finalTotalCost}`);
            await this.item.update({"system.totalCost": finalTotalCost});
        }
    }

    // This function ensures that if a dynamic description wasn't provided by getData (e.g., no actor),
    // the description span will be filled with the text from the selected <option>.
    _updateAttributeDescriptionTexts(html) {
        html.find('.attribute-level-description-text').each((_index, spanElement) => {
            const span = $(spanElement);
            const propertyNameFromDataAttr = span.data('desc-for'); // e.g., "system.vitesse"
            
            // If the span is empty (meaning dynamicDescription for it was null/empty and Handlebars rendered nothing)
            if (span.text().trim() === "") {
                // Find the corresponding select element
                const selectElement = html.find(`.attribute-level-select[name="${propertyNameFromDataAttr}"]`);
                if (selectElement.length) {
                    const selectedOption = selectElement[0].selectedOptions[0];
                    const selectedOptionText = selectedOption ? selectedOption.text : "Non Applicable";
                    span.text(selectedOptionText); // Corrected: use 'span' which is $(spanElement)
                }
            }
        });
    }

    // Optional: Reset initialWidthAdjusted if the sheet is closed and reopened
    async close(options) {
        this._initialWidthAdjusted = false;
        // Reset other state flags if necessary, for example:
        this._leftColumnStateInitialized = false;
        return super.close(options);
    }
}
