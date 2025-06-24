export default class PouvoirItemSheet extends ItemSheet {
    
    static get  defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            width: 520,
            height: 480,
            classes: ["ambre","sheet","pouvoir"],
            tabs: [{navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description"}]
        });
    }

    get template() {
        return `systems/ambre/templates/sheets/pouvoir-sheet.hbs`;
    }

    getData() {
        const data = super.getData();
        data.config = CONFIG.ambre;
        return data;
    }
}