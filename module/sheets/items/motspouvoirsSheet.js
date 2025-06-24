/**
 * @extends {ItemSheet}
 */
export default class MotsPouvoirsSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ambre", "sheet", "item", "mots-pouvoirs-sheet"],
      template: "systems/ambre/templates/sheets/items/mots-pouvoirs.hbs",
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    return `systems/ambre/templates/sheets/items/mots-pouvoirs.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    context.system = context.item.system; // Make system data easily accessible
    context.config = CONFIG.AMBRE;
    return context;
  }

  /* -------------------------------------------- */

  /** @override */
  activateListeners(html) {
    super.activateListeners(html);
    // Add any event listeners for interaction here
  }

  /** @override */
  async _render(force = false, options = {}) {
    await super._render(force, options);
    if (this.rendered && this.element && this.element.length) {
        // Apply a default theme to ensure visibility, similar to SortilegesSheet
        const windowApp = this.element.closest('.window-app.app.item-sheet');
        if (windowApp.length && !windowApp.hasClass('theme-defaut')) {
            windowApp.addClass('theme-defaut');
            console.log(`Ambre | MotsPouvoirsSheet: Applied default theme.`);
        }
    }
  }
}