// d:\VTT Foundry_data\foundrydata\Data\systems\ambre\module\sheets\atoutItemSheet.js
export default class AtoutItemSheet extends ItemSheet {

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            classes: ["ambre", "sheet", "item", "atout-card-sheet"],
            template: "systems/ambre/templates/sheets/atout-sheet.hbs",
            width: 460,
            height: 770,
            resizable: false // Or false if you want fixed size
        });
    }

    /** @override */
    async getData(options) {
        const context = await super.getData(options);
        // The item's image (`item.img`) is now the full, final card.
        // We don't need to reconstruct it. We just pass the data to the template.
        context.item = context.document;
        context.system = context.item.system;
        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Apply the owning actor's theme to the item sheet window frame
        if (this.item.actor) {
            const actorTheme = this.item.actor.system.selectedtheme || 'defaut'; // Get actor's theme, default to 'defaut'
            const sheetElement = this.element; // Get the sheet's main HTML element (the window)

            // Remove any existing theme classes
            const themeClasses = ['theme-defaut', 'theme-marelle', 'theme-logrus', 'theme-atouts', 'theme-metamorphose', 'theme-pentacre', 'theme-coeurflamme', 'theme-orbochromat', 'theme-abreuvoir', 'theme-harmonium', 'theme-chimerion', 'theme-sabliers', 'theme-abysses', 'theme-magie'];
            themeClasses.forEach(className => {
                sheetElement.removeClass(className);
            });
            sheetElement.addClass(`theme-${actorTheme}`); // Add the actor's theme class
        }
    }
}
