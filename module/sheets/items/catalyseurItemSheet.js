export default class CatalyseurItemSheet extends ItemSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ambre", "sheet", "item", "catalyseur"],
            template: "systems/ambre/templates/sheets/items/catalyseur-sheet.hbs",
            width: 520,
            height: 400,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    async getData(options) {
        const context = await super.getData(options);
        context.systemData = context.item.system;
        context.config = CONFIG.AMBRE;
        return context;
    }
}
