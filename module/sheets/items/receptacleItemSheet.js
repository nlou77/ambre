/**
 * @extends {ItemSheet}
 */
export default class ReceptacleItemSheet extends ItemSheet {

    /** @override */
    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ambre", "sheet", "item", "receptacle"],
            template: "systems/ambre/templates/sheets/items/receptacle-sheet.hbs",
            width: 520,
            height: 500, // Adjusted height to fit new content
            tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
        });
    }

    /** @override */
    get template() {
        return `systems/ambre/templates/sheets/items/receptacle-sheet.hbs`;
    }

    /* -------------------------------------------- */

    /** @override */
    async getData(options) {
        const context = await super.getData(options);
        context.system = context.item.system;

        // Resolve linked sortilege
        if (context.system.linkedSortilegeUUID) {
            context.linkedSortilege = await fromUuid(context.system.linkedSortilegeUUID);
        }

        // Resolve linked mot de pouvoir
        if (context.system.linkedMotPouvoirUUID) {
            context.linkedMotPouvoir = await fromUuid(context.system.linkedMotPouvoirUUID);
        }

        // Prepare dots for display
        const exemplaires = context.system.exemplaires || 0;
        const status = context.system.exemplairesStatus || [];
        context.dots = Array.from({ length: exemplaires }, (_, i) => ({
            used: !!status[i]
        }));

        return context;
    }

    /* -------------------------------------------- */

    /** @override */
    activateListeners(html) {
        super.activateListeners(html);

        // Handle dot clicks
        html.find('.dots-container .dot').click(this._onDotClick.bind(this));

        // Handle unlink
        html.find('.unlink-sortilege').click(this._onUnlinkSortilege.bind(this));
        html.find('.unlink-mot-pouvoir').click(this._onUnlinkMotPouvoir.bind(this));
        
        // Handle clicking the linked item name to open its sheet
        html.find('.clickable-link').click(this._onClickLinkedEntity.bind(this));

        // --- NEW: Explicitly handle drag and drop on the target element ---
        const sortilegeDropTarget = html.find('.sortilege-drop-target');
        if (sortilegeDropTarget.length) {
            sortilegeDropTarget.on('dragover', this._onDragOverTarget.bind(this));
            sortilegeDropTarget.on('dragleave', this._onDragLeaveTarget.bind(this));
            sortilegeDropTarget.on('drop', this._onDrop.bind(this));
        }
        const motPouvoirDropTarget = html.find('.mot-pouvoir-drop-target');
        if (motPouvoirDropTarget.length) {
            motPouvoirDropTarget.on('dragover', this._onDragOverTarget.bind(this));
            motPouvoirDropTarget.on('dragleave', this._onDragLeaveTarget.bind(this));
            motPouvoirDropTarget.on('drop', this._onDrop.bind(this));
        }
    }

    async _onDrop(event) {
        event.preventDefault();
        const data = TextEditor.getDragEventData(event.originalEvent);
        if (data.type !== "Item") return;

        const dropTarget = $(event.currentTarget);
        const item = await Item.fromDropData(data);
        if (!item) return;

        if (dropTarget.hasClass('sortilege-drop-target')) {
            if (item.type !== 'sortileges') {
                return ui.notifications.warn("Vous ne pouvez lier qu'un objet de type 'Sortilège'.");
            }
            await this.item.update({ 'system.linkedSortilegeUUID': item.uuid, 'system.exemplairesStatus': [] });
        } else if (dropTarget.hasClass('mot-pouvoir-drop-target')) {
            if (item.type !== 'motspouvoirs') {
                return ui.notifications.warn("Vous ne pouvez lier qu'un objet de type 'Mot de Pouvoir'.");
            }
            await this.item.update({ 'system.linkedMotPouvoirUUID': item.uuid });
        }
    }

    async _onDotClick(event) {
        event.preventDefault();
        const dotIndex = parseInt($(event.currentTarget).data('index'));
        const status = foundry.utils.deepClone(this.item.system.exemplairesStatus || []);
        const exemplaires = this.item.system.exemplaires || 0;
        while (status.length < exemplaires) { status.push(false); }
        status[dotIndex] = !status[dotIndex];
        await this.item.update({ 'system.exemplairesStatus': status });
    }

    async _onUnlinkSortilege(event) {
        event.preventDefault();
        await this.item.update({ 'system.linkedSortilegeUUID': '', 'system.exemplairesStatus': [] });
    }
    
    async _onUnlinkMotPouvoir(event) {
        event.preventDefault();
        await this.item.update({ 'system.linkedMotPouvoirUUID': '' });
    }

    async _onClickLinkedEntity(event) {
        event.preventDefault();
        const uuid = $(event.currentTarget).data('item-uuid');
        if (!uuid) return;
        const entity = await fromUuid(uuid);
        if (entity?.sheet) entity.sheet.render(true);
    }

    // --- NEW HELPER METHODS FOR DRAG/DROP VISUALS ---
    _onDragOverTarget(event) {
        event.preventDefault();
        // Add a class to the drop target for visual feedback
        $(event.currentTarget).addClass('drag-over');
    }

    _onDragLeaveTarget(event) {
        // Remove the visual feedback class
        $(event.currentTarget).removeClass('drag-over');
    }
}
