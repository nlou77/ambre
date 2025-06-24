/**
 * Item sheet for "Voie Secrète" items.
 * Allows linking to a specific Pouvoir type.
 * @extends {ItemSheet}
 */
// Import the helper function to get pouvoir types
import { getPouvoirTypes } from '../helpers/pouvoirHelper.js';

export default class CapaciteAnimaleItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ambre", "sheet", "item", "capaciteanimale"],
            template: "systems/ambre/templates/sheets/capaciteAnimale.hbs",
            width: 520,
            height: 520, // Increased height slightly for the new field
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /** @override */
    async getData(options) {
        const context = await super.getData(options);
        context.systemData = context.data.system; // Make system data more easily accessible

        // Get pouvoir types from the helper
        const allPouvoirs = getPouvoirTypes();
        context.pouvoirTypes = [
            { key: "", label: "Aucun (Générique)" }, // Option for unlinked
            // Map the pouvoirs from the helper to the key/label format needed for the dropdown
            ...allPouvoirs.map(p => ({ key: p.type, label: p.label }))
        ];
        return context;
    }

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Example: If you add a dropdown for linkedPouvoirType
        html.find('select[name="system.linkedPouvoirType"]').change(ev => {
            this.submit();
        });
    }
}