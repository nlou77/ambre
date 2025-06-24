/**
 * Item sheet for "Voie Secrète" items.
 * Allows linking to a specific Pouvoir type.
 * @extends {ItemSheet}
 */
// Import the helper function to get pouvoir types
import { getPouvoirTypes } from '../helpers/pouvoirHelper.js';

export default class VoieSecreteItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ambre", "sheet", "item", "voiesecrete-sheet"],
            template: "systems/ambre/templates/sheets/voiesecrete-sheet.hbs",
            width: 520,
            height: 520, // Increased height slightly for the new field
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /** @override */
    async getData(options) {
        const context = await super.getData(options);
        context.system = context.item.system; // Make system data easily accessible
        context.config = CONFIG.AMBRE;

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
    /** @override */
  async _render(force = false, options = {}) {
    await super._render(force, options);
    if (this.rendered && this.element && this.element.length) {
        this._applyTheme();
    }
  }

  /**
   * Applies the correct theme class to the item sheet window.
   * For VoieSecrète, we'll just apply a default theme.
   * @private
   */
  _applyTheme() {
    if (!this.element || !this.element.length) return;

    const windowApp = this.element.closest('.window-app.app.item-sheet');
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
    console.log(`Ambre | VoieSecreteSheet: Applied theme "${theme}".`);
  }
}