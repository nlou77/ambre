/**
 * @extends {ItemSheet}
 */
export default class SortilegesSheet extends ItemSheet {

  /** @override */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["ambre", "sheet", "item", "sortileges-sheet"],
      template: "systems/ambre/templates/sheets/items/sortileges.hbs",
      width: 520,
      height: 480,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
    });
  }

  /** @override */
  get template() {
    return `systems/ambre/templates/sheets/items/sortileges.hbs`;
  }

  /* -------------------------------------------- */

  /** @override */
  async getData(options) {
    const context = await super.getData(options);
    // The context object includes `item` and `editable`
    // Let's ensure system data is easily accessible.
    context.system = context.item.system;
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
        this._applyTheme();
    }
  }

  /**
   * Applies the correct theme class to the item sheet window.
   * For Sortilèges, we'll just apply a default theme.
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
    console.log(`Ambre | SortilegesSheet: Applied theme "${theme}".`);
  }
}