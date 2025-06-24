export default class IngredientItemSheet extends ItemSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ambre", "sheet", "item", "ingredient"],
            template: "systems/ambre/templates/sheets/items/ingredient-sheet.hbs",
            width: 520,
            height: 420,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    async getData(options) {
        const context = await super.getData(options);
        context.systemData = context.item.system;
        context.config = CONFIG.AMBRE;

        context.categoriesIngredient = [
            { key: "fleurs_herbes", label: "Fleurs et Herbes" },
            { key: "seves_resines", label: "Sèves et Résines" },
            { key: "ecorces_feuilles", label: "Écorces et Feuilles" },
            { key: "racines_tubercules", label: "Racines et Tubercules" },
            { key: "baies_fruits", label: "Baies et Fruits" }
        ];
        return context;
    }
}

