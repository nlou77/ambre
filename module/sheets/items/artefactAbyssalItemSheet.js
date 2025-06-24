import { getPouvoirTypes, getCapacites } from '../../helpers/pouvoirHelper.js';

export default class ArtefactAbyssalItemSheet extends ItemSheet {
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ambre", "sheet", "item", "artefactabyssal"],
            template: "systems/ambre/templates/sheets/items/artefactabyssal-sheet.hbs",
            width: 560,
            height: 450,
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    async getData(options) {
        const context = await super.getData(options);
        context.systemData = context.item.system;
        context.config = CONFIG.AMBRE;

        context.pouvoirTypes = [{ key: "", label: "Aucun Pouvoir Lié" }, ...getPouvoirTypes().map(p => ({ key: p.type, label: p.label }))];
        
        context.capacitesList = [];
        if (context.systemData.pouvoirLie) {
            // For item sheets, we don't have an actor or a specific pouvoir value to filter by level.
            // So, we'll fetch all capacities for the selected pouvoir type.
            // The getCapacites function might need a slight adaptation or a new helper if it strictly requires actor/value.
            // For now, assuming getCapacites can return all base capacities for a type.
            // We pass a dummy value (e.g., 500 to show all) and an empty actorSystem.
            const allCapacitesForPouvoir = getCapacites(context.systemData.pouvoirLie, 500, {}, "all");
            context.capacitesList = [{ key: "", label: "Aucune Capacité Liée" }, ...allCapacitesForPouvoir.map(c => ({ key: c.nom, label: c.nom }))];
        } else {
            context.capacitesList = [{ key: "", label: "Sélectionnez d'abord un pouvoir" }];
        }

        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        // Re-render the sheet if the pouvoirLie select changes, to update capacitesList
        html.find('select[name="system.pouvoirLie"]').change(ev => {
            this.item.update({"system.pouvoirLie": ev.currentTarget.value, "system.capaciteLiee": ""}).then(() => {
                this.render(true); // Force re-render to update capacites dropdown
            });
        });
    }
}

