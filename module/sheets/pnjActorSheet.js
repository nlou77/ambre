import { getPouvoirTypes } from '../helpers/pouvoirHelper.js';

export default class PnjActorSheet extends ActorSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ambre", "sheet", "actor", "pnj"], // Add 'pnj' class for specific styling
            template: "systems/ambre/templates/sheets/pnjActor-sheet.hbs",
            width: 800, // Adjust width as needed for a simpler sheet
            height: 1050, // Adjust height as needed
            scrollY: [".pnj-sheet-body"] // Explicitly define the scrollable element
        });
    }
    

    async getData() {
        const context = super.getData();
        context.system = this.actor.system;

        if (!context.system) {
            console.error('No system data found for PNJ!');
            context.system = {};
            }

        // Ensure health and energy structures exist and set default max values
        // Endurance and Psyche are direct inputs for PNJs
        const endurance = Number(context.system.endurance) || 0;
        const psyche = Number(context.system.psyche) || 0;

        if (!context.system.health) context.system.health = { value: 0, max: 0, min: 0, healthReserve: { value: 0, max: 0 } };
        if (!context.system.health.healthReserve) context.system.health.healthReserve = { value: 0, max: 0 };
        
        // Default health.max is 600 in template.json, or 0 if newly created without template defaults fully applied yet
        if (context.system.health.max === 600 || context.system.health.max === 0) {
            context.system.health.max = endurance;
        }
        if (context.system.health.healthReserve.max === 0) {
            context.system.health.healthReserve.max = Math.floor(endurance / 2);
        }

        if (!context.system.energy) context.system.energy = { value: 0, max: 0, min: 0, energyReserve: { value: 0, max: 0 } };
        if (!context.system.energy.energyReserve) context.system.energy.energyReserve = { value: 0, max: 0 };

        if (context.system.energy.max === 0) {
            context.system.energy.max = psyche;
        }
        if (context.system.energy.energyReserve.max === 0) {
            context.system.energy.energyReserve.max = Math.floor(psyche / 2);
        }
        // Ensure system.creation exists for pouvoir points
        if (!context.system.creation) {
            context.system.creation = {};
        }

        context.pouvoirTypes = getPouvoirTypes(); // For iterating pouvoir inputs

        // Prepare linked items and journals by resolving UUIDs
        context.possessedArtefacts = [];
        if (this.actor.system.linkedArtefactUUIDs) {
            for (const uuid of this.actor.system.linkedArtefactUUIDs) {
                const item = await fromUuid(uuid);
                if (item) context.possessedArtefacts.push(item);
            }
        }

        context.possessedOmbres = [];
        if (this.actor.system.linkedOmbreUUIDs) {
            for (const uuid of this.actor.system.linkedOmbreUUIDs) {
                const item = await fromUuid(uuid);
                if (item) context.possessedOmbres.push(item);
            }
        }
        context.linkedJournals = [];
        if (this.actor.system.linkedJournalUUIDs) {
            for (const uuid of this.actor.system.linkedJournalUUIDs) {
                const journal = await fromUuid(uuid);
                if (journal) context.linkedJournals.push(journal);
            }
        }

        // Pass the lock state to the template

        // Pass the lock state to the template
        context.sheetLocked = this.actor.getFlag("ambre", "sheetLocked") || false;
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);

        // --- Listener for toggling the description editor ---
        const descriptionSection = html.find('.biography-section');
        const toggleEditorBtn = html.find('.toggle-description-editor');

        // Set initial visibility based on flag, default to hidden
        const isVisible = this.actor.getFlag("ambre", "biographyEditorVisible") ?? false;
        if (!isVisible) descriptionSection.hide();

        toggleEditorBtn.on('click', ev => {
            ev.preventDefault();
            const isCurrentlyVisible = descriptionSection.is(':visible');
            descriptionSection.slideToggle(200);
            // Save the new visibility state as a flag on the actor
            this.actor.setFlag("ambre", "biographyEditorVisible", !isCurrentlyVisible, { render: false });
        });

        // --- End of description editor toggle ---

        // Listeners for unlinking items/journals
        html.find('.unlink-linked-item').click(this._onUnlinkItem.bind(this));
        html.find('.unlink-linked-journal').click(this._onUnlinkJournal.bind(this));
        html.find('.refresh-button').click(this._onRefreshStats.bind(this));
        html.find('.show-image-button').click(this._onShowImage.bind(this));
        html.find('.lock-sheet-button').click(this._onLockSheet.bind(this));

        // Listeners for opening linked item/journal sheets
        html.find('.linked-item-display .clickable-link').click(this._onClickLinkedEntity.bind(this));

    } // End of activateListeners method

    /**
     * Handle dropping an entity onto the PNJ sheet.
     * @param {DragEvent} event The concluding drag event.
     * @override
     */
    async _onDrop(event) {
        event.preventDefault();
        const data = TextEditor.getDragEventData(event);
        
        const dropTargetElement = $(event.target).closest('.drop-target, .journal-drop-target');
        if (!dropTargetElement.length) return false;

        const targetGroupType = dropTargetElement.data('group-type');

        if (!this.isEditable) {
            ui.notifications.warn("Vous n'avez pas la permission de modifier cet acteur.");
            return false;
        }

        // Handle JournalEntry drops
        if (data.type === "JournalEntry" && targetGroupType === "journal") {
            const journal = await fromUuid(data.uuid);
            if (journal) {
                const currentUUIDs = this.actor.system.linkedJournalUUIDs || [];
                if (!currentUUIDs.includes(journal.uuid)) {
                    const newUUIDs = [...currentUUIDs, journal.uuid];
                    await this.actor.update({"system.linkedJournalUUIDs": newUUIDs});
                    ui.notifications.info(`Journal "${journal.name}" lié au PNJ.`);
                } else {
                    ui.notifications.warn(`Journal "${journal.name}" est déjà lié.`);
                }
            }
            return;
        }

        // Handle Item drops (Artefact, Ombre)
        if (data.type === "Item") {
            const item = await Item.fromDropData(data);
            if (!item) return false;

            let updatePath = null;
            let currentUUIDs = [];
            let itemTypeName = "";

            if (item.type === "artefact" && targetGroupType === "artefact") {
                updatePath = "system.linkedArtefactUUIDs";
                currentUUIDs = this.actor.system.linkedArtefactUUIDs || [];
                itemTypeName = "Artefact";
            } else if (item.type === "ombre" && targetGroupType === "ombre") {
                updatePath = "system.linkedOmbreUUIDs";
                currentUUIDs = this.actor.system.linkedOmbreUUIDs || [];
                itemTypeName = "Ombre";
            } else {
                ui.notifications.warn(`Type d'objet "${item.type}" incorrect pour cette zone de dépôt ("${targetGroupType}").`);
                return false;
            }

            if (updatePath) {
                if (!currentUUIDs.includes(item.uuid)) {
                    const newUUIDs = [...currentUUIDs, item.uuid];
                    await this.actor.update({[updatePath]: newUUIDs});
                    ui.notifications.info(`${itemTypeName} "${item.name}" lié au PNJ.`);
                } else {
                    ui.notifications.warn(`${itemTypeName} "${item.name}" est déjà lié.`);
                }
            }
            return;
        }
        // Fallback to super._onDrop if not handled here, though for PNJs we are specific.
        // return super._onDrop(event); 
    }

    async _onUnlinkItem(event) {
        event.preventDefault();
        if (!this.isEditable) return;
        console.log("Ambre | _onUnlinkItem triggered.");

        const button = $(event.currentTarget);
        const itemElement = button.closest('.item.linked-item-display'); // More specific selector
        const itemUuid = itemElement.data('item-uuid');
        const itemType = $(event.currentTarget).data('item-type'); // "artefact" or "ombre"

        console.log(`Ambre |   - Item UUID to unlink: ${itemUuid}`);
        console.log(`Ambre |   - Item Type: ${itemType}`);

        if (!itemUuid || !itemType) {
            console.error("Ambre | Error: Missing item UUID or type for unlinking.");
            ui.notifications.error("Erreur lors de la dissociation de l'objet : données manquantes.");
            return;
        }

        const uuidArrayPath = `system.linked${itemType.charAt(0).toUpperCase() + itemType.slice(1)}UUIDs`;
        let currentUUIDs = foundry.utils.getProperty(this.actor.system, uuidArrayPath.substring(7)) || []; // Get the array directly
        console.log(`Ambre |   - Current UUIDs for ${itemType}:`, JSON.parse(JSON.stringify(currentUUIDs)));

        const newUUIDs = currentUUIDs.filter(uuid => uuid !== itemUuid);
        console.log(`Ambre |   - New UUIDs for ${itemType} (after filter):`, JSON.parse(JSON.stringify(newUUIDs)));

        await this.actor.update({[uuidArrayPath]: newUUIDs});
        console.log(`Ambre |   - Actor updated. Sheet should re-render.`);
    }

    async _onUnlinkJournal(event) {
        event.preventDefault();
        if (!this.isEditable) return;
        console.log("Ambre | _onUnlinkJournal triggered.");
        const journalElement = $(event.currentTarget).closest('.journal.linked-item-display'); // More specific
        const journalUuid = journalElement.data('journal-uuid');
        console.log(`Ambre |   - Journal UUID to unlink: ${journalUuid}`);

        let currentUUIDs = this.actor.system.linkedJournalUUIDs || [];
        const newUUIDs = currentUUIDs.filter(uuid => uuid !== journalUuid);
        await this.actor.update({"system.linkedJournalUUIDs": newUUIDs});
        console.log(`Ambre |   - Actor updated for journal. Sheet should re-render.`);
    }

    async _onRefreshStats(event) {
        event.preventDefault();
        const system = this.actor.system;
        const updates = {
            "system.health.value": system.health.max,
            "system.health.healthReserve.value": system.health.healthReserve.max,
            "system.energy.value": system.energy.max,
            "system.energy.energyReserve.value": system.energy.energyReserve.max
        };
        await this.actor.update(updates);
    }

    _onShowImage(event) {
        event.preventDefault();
        const actorImage = this.actor.img;
        
        console.log(`Ambre | PNJ Sheet: _onShowImage triggered by user ${game.user.name}.`);
        console.log(`Ambre | PNJ Sheet: Attempting to show image for actor "${this.actor.name}". Path: ${actorImage}`);

        if (!actorImage) {
            ui.notifications.warn(`Ce PNJ (${this.actor.name}) n'a pas d'image configurée.`);
            console.warn(`Ambre | PNJ Sheet: No actor image configured for PNJ "${this.actor.name}".`);
            return;
        }

        // --- NEW, MORE ROBUST PATH VALIDATION ---
        const knownPrefixes = ["systems/", "worlds/", "modules/", "icons/", "http://", "https://"];
        const isWebPath = knownPrefixes.some(prefix => actorImage.startsWith(prefix));
        const isDataUri = actorImage.startsWith("data:image");
        const isLocalWindowsPath = /^([a-zA-Z]:\\|\\\\)/.test(actorImage) || actorImage.includes(":\\");

        if (isLocalWindowsPath) {
            const errorMsg = `Le chemin de l'image pour ${this.actor.name} ("${actorImage}") semble être un fichier local et ne sera pas accessible aux joueurs. Veuillez utiliser le sélecteur de fichiers de Foundry.`;
            ui.notifications.error(errorMsg);
            console.error(`Ambre | PNJ Sheet: Image path "${actorImage}" appears to be a local file path. This will not work for players. Please use an image from your Foundry Data, a module, or a system folder.`);
            return; // Stop execution for clearly invalid paths
        }

        if (!isWebPath && !isDataUri) {
            // This condition will catch paths like "Ambre/Images/..."
            const warnMsg = `Le chemin de l'image pour ${this.actor.name} ("${actorImage}") n'est peut-être pas accessible aux joueurs. Les chemins valides commencent généralement par "systems/", "worlds/", "modules/", "icons/", ou "http(s)://". Veuillez utiliser le sélecteur de fichiers de Foundry.`;
            ui.notifications.warn(warnMsg);
            console.warn(`Ambre | PNJ Sheet: Image path "${actorImage}" does not start with a known web-accessible prefix. This may fail for players.`);
            // We can let it try anyway, but the warning is there.
        }
        // --- END OF NEW VALIDATION ---

        try {
            const popout = new ImagePopout(actorImage, {
                title: "Image Partagée", // Generic title for the popout window
                share: true, // This is crucial for showing to all players
                uuid: this.actor.uuid // Optional: associates the popout with the actor
            });
            popout.render(true); // Render the popout
            
            console.log(`Ambre | PNJ Sheet: ImagePopout created for "${actorImage}". 'share: true' is set. Foundry should handle sharing this popout.`);
            ui.notifications.info(`L'image du PNJ ("${this.actor.name}") a été envoyée pour affichage aux joueurs.`);
        } catch (error) {
            console.error(`Ambre | PNJ Sheet: Error creating or rendering ImagePopout for "${actorImage}":`, error);
            ui.notifications.error(`Une erreur est survenue lors de la tentative d'affichage de l'image pour ${this.actor.name}. Vérifiez la console (F12).`);
        }
    }

    async _onLockSheet(event) {
        event.preventDefault();
        const isLocked = this.actor.getFlag("ambre", "sheetLocked") || false;
        await this.actor.setFlag("ambre", "sheetLocked", !isLocked);
        // Optionally, provide user feedback
        if (isLocked) {
            ui.notifications.info(`${this.actor.name}'s sheet unlocked.`);
        } else {
            ui.notifications.info(`${this.actor.name}'s sheet locked.`);
        }
        this.render(); // Re-render the sheet to reflect the lock state
    }

    /**
     * Handle clicking on a linked item or journal name to open its sheet.
     * @param {Event} event The click event.
     * @private
     */
    async _onClickLinkedEntity(event) {
        event.preventDefault();
        const targetElement = $(event.currentTarget);
        const parentDisplayElement = targetElement.closest('.linked-item-display');

        const itemUuid = parentDisplayElement.data('item-uuid');
        const journalUuid = parentDisplayElement.data('journal-uuid');

        if (itemUuid) {
            const item = await fromUuid(itemUuid);
            if (item && item.sheet) {
                item.sheet.render(true);
            } else {
                ui.notifications.warn(`Impossible d'ouvrir la fiche pour l'objet lié (UUID: ${itemUuid}).`);
            }
        } else if (journalUuid) {
            const journal = await fromUuid(journalUuid);
            if (journal && journal.sheet) {
                journal.sheet.render(true);
            } else {
                ui.notifications.warn(`Impossible d'ouvrir la fiche pour le journal lié (UUID: ${journalUuid}).`);
            }
        }
    }

    /** @override */
    async _render(force = false, options = {}) {
        await super._render(force, options);
        if (this.rendered && this.element && this.element.length) {
            this._applyTheme();
        }
    }

    /**
     * Applies the correct theme class to the actor sheet window.
     * For PNJ, we'll apply a default theme.
     * @private
     */
    _applyTheme() {
        if (!this.element || !this.element.length) return;

        const windowApp = this.element.closest('.window-app.app.actor-sheet'); // Target actor-sheet window
        if (!windowApp.length) return;

        const theme = "theme-defaut"; // Apply the default theme

        // A list of all possible themes to ensure we remove any that might be lingering
        const allThemes = [
            "theme-defaut", "theme-marelle", "theme-atouts", "theme-metamorphose",
            "theme-pentacre", "theme-abreuvoir", "theme-harmonium", "theme-chimerion",
            "theme-sabliers", "theme-arden", "theme-kolvir", "theme-tirnanogth",
            "theme-rebma", "theme-chaos", "theme-abysses-deep", "theme-musique",
            "theme-ygg", "theme-marelle-corwin", "theme-roue-spectrale", "theme-fontaine"
        ];

        // Remove all potential theme classes
        allThemes.forEach(t => windowApp.removeClass(t));

        // Add the new theme class
        windowApp.addClass(theme);
        console.log(`Ambre | PnjActorSheet: Applied theme "${theme}".`);
    }
}