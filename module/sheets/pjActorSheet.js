// Import the pouvoir helper functions
import { calculatePouvoir, getPouvoirTypes, getPouvoirLabel, validatePouvoirValue, calculateNiveauNumeric } from '../helpers/pouvoirHelper.js';
import { getSpecialites, getDefaultCompetences } from './pjActorSheetCompetences.js'; // Import the moved function

// Map pour les points des alliés
const ALLIES_POINTS_MAP = {
    "domestique_1": 1,
    "domestique_2": 2,
    "diplomate_or_3": 3,
    "diplomate_or_4": 4,
    "diplomate_noir_5": 5,
    "diplomate_noir_6": 6,
    "cousin_7": 7,
    "cousin_8": 8,
    "oncle_9": 9,
    "oncle_10": 10,
    "fratrie_11": 11,
    "fratrie_12": 12,
    "conseil_chaos_13": 13,
    "conseil_chaos_14": 14,
    "conseil_chaos_15": 15
};

// Map pour les points des alliés
const ENNEMIS_POINTS_MAP = {
    "domestique_1": 1,
    "domestique_2": 2,
    "diplomate_noir_3": 3,
    "diplomate_noir_4": 4,
    "diplomate_or_5": 5,
    "diplomate_or_6": 6,
    "cousin_7": 7,
    "cousin_8": 8,
    "conseil_chaos_9": 9,
    "conseil_chaos_10": 10,
    "oncle_11": 11,
    "oncle_12": 12,
    "fratrie_13": 13,
    "fratrie_14": 14,
    "fratrie_15": 15
};

export default class PjActorSheet extends ActorSheet {
    constructor(...args) {
        super(...args);
        this.currentTab = 'description'; // Track current tab
    }

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["ambre", "sheet", "actor"],
            template: "systems/ambre/templates/sheets/pjActor-sheet.hbs",
            width: 1250,
            height: 925,
            tabs: [
            {
                navSelector: ".horizontal-navigation:not(.secondary) .sheet-navigation", // Targets primary tab navigation
                contentSelector: ".sheet-body:not(.tab[data-tab='pouvoirs'] > .sheet-body)", // Targets primary tab content area
                initial: "description" // Default primary tab
            },

        ]
        });
    }

    async getData() {
        const context = super.getData();
        context.system = this.actor.system;

        // Ensure system exists
        if (!context.system) {
            console.error('No system data found!');
            context.system = {};
        }
        
        // Initialize competences if they don't exist
        if (!context.system.competences) {
            console.log('No competences found, initializing empty object...');
            context.system.competences = {};
        }
        
        if (Object.keys(context.system.competences).length === 0) {
            context.system.competences = getDefaultCompetences();
            
            // Update the actor with default competences (async, but don't wait)
            this.actor.update({
                "system.competences": context.system.competences
            }).catch(err => console.error('Failed to update actor competences:', err));
        }
        
        // Get all pouvoir types configuration
        const pouvoirTypes = getPouvoirTypes();
        
        // Get the actor's preferred display mode for capacites
        // Assuming it's stored in system.options.capacitesDisplayMode
        // Default to "all" if not set or if options object doesn't exist
        const actorCapacitesDisplayMode = context.system.capacitesDisplayMode || "all"; // Ensure this is system.capacitesDisplayMode not system.options.capacitesDisplayMode
        // console.log("Ambre | Actor display mode:", actorCapacitesDisplayMode); // Log de débogage
        // Prepare pouvoir data for each type        
        context.pouvoirData = {}; // Ensure this is initialized
        
        for (let pouvoirConfig of pouvoirTypes) {
            const { type, field, label } = pouvoirConfig;

            // Get the value from the correct field (ptsmarelle, ptslogrus, etc.)
            const pouvoirValue = context.system[field] || 0;
            // Calculate enhanced pouvoir data, passing the actor's chosen display mode
            const calculatedData = calculatePouvoir(type, pouvoirValue, this.actor, actorCapacitesDisplayMode);
            
            if (calculatedData && typeof calculatedData === 'object') {
                // If calculatePouvoir returns a valid object, use it
                context.pouvoirData[type] = calculatedData;
                // Assign field and label if they are not part of calculatedData
                // or if you want to ensure they are set at this level.
                if (!context.pouvoirData[type].hasOwnProperty('field')) {
                    context.pouvoirData[type].field = field;
                }
                if (!context.pouvoirData[type].hasOwnProperty('label')) {
                    context.pouvoirData[type].label = label;
                }
                
                // Add the UI state for showing capacites
                if (!this._uiState) this._uiState = {};
                if (!this._uiState.pouvoirs) this._uiState.pouvoirs = {};
                // Assurer une initialisation correcte si l'état pour ce pouvoir n'existe pas encore
                if (typeof this._uiState.pouvoirs[type]?.showCapacites !== 'boolean') {
                    this._uiState.pouvoirs[type] = { showCapacites: false }; // Default to false
                }
                context.pouvoirData[type].showCapacites = this._uiState.pouvoirs[type].showCapacites;

                // Retrieve the ptsvsValue for this pouvoir type
                const vsPouvoirFieldName = `ptsvs${type}`; // e.g., "ptsvsmarelle"
                // Ensure system.creation exists and the specific field exists
                if (context.system.creation && context.system.creation.hasOwnProperty(vsPouvoirFieldName)) {
                    context.pouvoirData[type].ptsvsValue = context.system.creation[vsPouvoirFieldName];
                } else {
                    context.pouvoirData[type].ptsvsValue = 0; // Default if not found
                }
                // Also ensure it's a number
                context.pouvoirData[type].ptsvsValue = Number(context.pouvoirData[type].ptsvsValue) || 0;
                // console.log(`Ambre | getData: showCapacites for ${type} is ${context.pouvoirData[type].showCapacites} (from _uiState: ${this._uiState.pouvoirs[type]?.showCapacites})`);

            } else {
                // If calculatePouvoir returns falsy (e.g., null, undefined), set to null.
                // The pouvoir.hbs partial will handle this with its {{#if pouvoirData}} check.
                context.pouvoirData[type] = null;
            }
        }

        // Prepare sorted possessions sections for the template
        const possessionsSections = [
            { id: 'atouts', label: 'Jeux d\'Atouts', partial: 'systems/ambre/templates/sheets/actor/parts/atouts_mat.hbs' },
            { id: 'journaux', label: 'Journaux', partial: 'systems/ambre/templates/sheets/actor/parts/journaux_mat.hbs' },
            { id: 'artefacts', label: 'Artefacts', partial: 'systems/ambre/templates/sheets/actor/parts/artefacts_mat.hbs' },
            { id: 'ombres', label: 'Ombres', partial: 'systems/ambre/templates/sheets/actor/parts/ombres_mat.hbs' },
            { id: 'materiel', label: 'Materiel', partial: 'systems/ambre/templates/sheets/actor/parts/materiel_mat.hbs' }
        ];

        const possessionsOrder = this.actor.system.possessionsOrder || ['atouts', 'journaux', 'artefacts', 'ombres', 'materiel']; // Default order
        
        context.sortedPossessionsSections = possessionsOrder.map(id => {
            return possessionsSections.find(s => s.id === id);
        }).filter(s => s); // Filter out any undefined if an ID in order is no longer valid

        // Add any sections not in the order to the end
        possessionsSections.forEach(section => {
            if (!context.sortedPossessionsSections.find(s => s.id === section.id)) {
                context.sortedPossessionsSections.push(section);
            }
        });

        context.sectionPartials = Object.fromEntries(possessionsSections.map(s => [s.id, s.partial]));

        // Prepare sorted pouvoirsList for the template
        const rawPouvoirTypes = getPouvoirTypes();
        let currentPouvoirOrder = foundry.utils.deepClone(this.actor.system.pouvoirOrder || []);
        const knownPouvoirKeys = new Set(rawPouvoirTypes.map(pt => pt.type));
        const orderedPouvoirKeys = new Set(currentPouvoirOrder);

        let finalPouvoirOrder = [];
        let orderChanged = false;

        // Add items from currentPouvoirOrder that are still valid
        for (const key of currentPouvoirOrder) {
            if (knownPouvoirKeys.has(key)) {
                finalPouvoirOrder.push(key);
            } else {
                orderChanged = true; // A key in the order is no longer a known pouvoir
            }
        }

        // Add any new pouvoir types not yet in the order, append them based on rawPouvoirTypes order
        for (const pt of rawPouvoirTypes) {
            if (!orderedPouvoirKeys.has(pt.type)) {
                finalPouvoirOrder.push(pt.type);
                orderChanged = true; // New pouvoir added to the order
            }
        }

        if (orderChanged || !this.actor.system.pouvoirOrder || finalPouvoirOrder.length !== currentPouvoirOrder.length) {
            // Non-blocking update, getData should proceed with the calculated finalPouvoirOrder
            this.actor.update({ 'system.pouvoirOrder': finalPouvoirOrder }).catch(err => console.warn("Ambre | Failed to update pouvoirOrder", err));
        }
        context.system.pouvoirOrder = finalPouvoirOrder;

        context.pouvoirsList = [];
        const pouvoirConfigMap = new Map(rawPouvoirTypes.map(pt => [pt.type, pt]));
        for (const pouvoirTypeKey of finalPouvoirOrder) {
            const config = pouvoirConfigMap.get(pouvoirTypeKey);
            if (config && context.pouvoirData[pouvoirTypeKey]) { // Ensure data exists and config exists
                context.pouvoirsList.push({ type: config.type, field: config.field, label: config.label, data: context.pouvoirData[pouvoirTypeKey] });
            }
        }

        // Prepare data for Orbochromat talents
        const orbochromatPouvoirData = context.pouvoirData.orbochromat;
        let orbochromatTalentBlockData = null;
        if (orbochromatPouvoirData) {
            orbochromatTalentBlockData = {
                ...orbochromatPouvoirData, // Includes niveauNumeric, etc.
                brumesData: [
                    { term: "Agressif", definition: "Brume pourpre" },
                    { term: "Amoureux", definition: "Brume bleue" },
                    { term: "Apeuré", definition: "Brume orange" },
                    { term: "Avide", definition: "Brume rouge foncé" },
                    { term: "Calme", definition: "Brume bleu clair" },
                    { term: "Colérique", definition: "Brume rouge" },
                    { term: "Compatissant", definition: "Brume rose foncé" },
                    { term: "Déçu", definition: "Brume marron" },
                    { term: "Dépressif", definition: "Brume grise" },
                    { term: "Envieux", definition: "Brume vert foncé" },
                    { term: "Excité", definition: "Brume violette" },
                    { term: "Généreux", definition: "Brume rose clair" },
                    { term: "Haineux", definition: "Brume noire" },
                    { term: "Heureux", definition: "Brume vermillon" },
                    { term: "Idéaliste", definition: "Brume jaune" },
                    { term: "Innocent", definition: "Brume blanche" },
                    { term: "Méfiant", definition: "Brume vert clair" },
                    { term: "Obsédé", definition: "Brume verte" },
                    { term: "Protecteur", definition: "Brume lavande" },
                    { term: "Spirituel", definition: "Brume or" },
                    { term: "Suspicieux", definition: "Brume bleu foncé" },
                    { term: "Triste", definition: "Brume argentée" },
                    { term: "Confusion", definition: "Brume aléatoire ondulante" },
                    { term: "Dans la Lune", definition: "Brume de couleurs vives" },
                    { term: "Frénétique", definition: "Brume aléatoire rapide" },
                    { term: "Psychotique", definition: "Brume tourbillonnante" }
                ],
                fluidesData: [
                    { term: "Ambrien", definition: "Fluide turquoise" },
                    { term: "Chaosien", definition: "Fluide rouge foncé" },
                    { term: "Démons", definition: "Fluide rouge" },
                    { term: "Dragons", definition: "Fluide jaune" },
                    { term: "Entité Abyssal", definition: "Fluide noir" },
                    { term: "Félins", definition: "Fluide orange" },
                    { term: "Insectes", definition: "Fluide gris" },
                    { term: "Humain", definition: "Fluide bleu" },
                    { term: "MortVivant", definition: "Fluide pâle" }
                ],
                etincellesData: [
                    { term: "Abreuvoir", definition: "Étincelles jaunes" },
                    { term: "Abyss", definition: "Étincelles noires" },
                    { term: "Atouts", definition: "Étincelles pourpres" },
                    { term: "Chimérion", definition: "Étincelles bleues" },
                    { term: "CoeurFlamme", definition: "Étincelles roses" },
                    { term: "Harmonium", definition: "Étincelles blanches" },
                    { term: "Logrus", definition: "Étincelles vertes" },
                    { term: "Magie", definition: "Étincelles orange" },
                    { term: "Marelle", definition: "Étincelles bleu foncé" },
                    { term: "Métamorphose", definition: "Étincelles rouges" },
                    { term: "Orbochromat", definition: "Étincelles multicolores" },
                    { term: "Pentacre", definition: "Étincelles marron foncé" },
                    { term: "Sablier d'Ujuhé", definition: "Étincelles beige clair" },
                    { term: "Dons spéciaux", definition: "Étincelles grises" }
                ],
                teintesData: {
                    base: [
                        { term: "Homme", definition: "Les teintes sont froides." },
                        { term: "Femme", definition: "Les teintes sont chaudes." },
                        { term: "Jeune", definition: "Les teintes sont vives." },
                        { term: "Vieux", definition: "Les teintes sont pâles." }
                    ],
                    niveau10: [
                        { term: "Frères et soeurs", definition: "Les teintes sont électrisées." },
                        { term: "Parents", definition: "Les teintes sont pailletées." },
                        { term: "Demi-frères et demi-soeurs", definition: "Les teintes sont électrisées par saccades." },
                        { term: "Grands-parents", definition: "Les teintes sont pailletées par saccades." },
                        { term: "Neveux et nièces", definition: "Les teintes sont enluminées." },
                        { term: "Tantes et oncles", definition: "Les teintes sont saccadées." },
                        { term: "Cousins et cousines", definition: "Les teintes sont enluminées par saccades." }
                    ]
                }
            };
        }
        // Store the processed Orbochromat data on the sheet instance
        // so it can be accessed by the click listener.
        this._processedOrbochromatData = orbochromatTalentBlockData;

        // Prepare sorted talent sections for talentsSpecifiques.hbs
        const talentConfigurations = [
            { type: "logrus", key: "logrus", condition: context.pouvoirData.logrus?.showNombreExtensions, data: context.pouvoirData.logrus },
            { type: "atouts", key: "atouts", condition: context.pouvoirData.atouts?.showAtoutsMemorisesTalent, data: context.pouvoirData.atouts },
            { type: "magie", key: "magie_motspouvoirs", condition: context.pouvoirData.magie?.showMotsPouvoirsDropZone, data: context.pouvoirData.magie },
            { type: "magie", key: "magie_receptacles", condition: context.pouvoirData.magie?.showReceptaclesDropZone, data: context.pouvoirData.magie },
            { type: "magie", key: "magie_sortileges", condition: context.pouvoirData.magie?.showSortilegesDropZone, data: context.pouvoirData.magie },
            { type: "metamorphose_forme", key: "metamorphose_forme", condition: context.pouvoirData.metamorphose?.showCapacitesAnimalesDropZone, data: context.pouvoirData.metamorphose },
            { type: "metamorphose_speciale", key: "metamorphose_speciale", condition: context.pouvoirData.metamorphose?.showCapacitesAnimalesSpecialesDropZone, data: context.pouvoirData.metamorphose },
            { type: "orbochromat", key: "orbochromat_talents", condition: (orbochromatPouvoirData && orbochromatPouvoirData.niveauNumeric >= 1), data: orbochromatTalentBlockData },
            { type: "chimerion", key: "chimerion_miroirs", condition: context.pouvoirData.chimerion?.showMiroirsDropZone, data: context.pouvoirData.chimerion },
            { type: "abysses", key: "abysses_failles", condition: context.pouvoirData.abysses?.showFaillesCounter, data: context.pouvoirData.abysses },
            { type: "magie", key: "magie_runes", condition: context.pouvoirData.magie?.showRunesDropZone, data: context.pouvoirData.magie },
            { type: "sabliers", key: "sabliers_jours_sans_connexion", condition: context.pouvoirData.sabliers?.showJoursSansConnexion, data: context.pouvoirData.sabliers },
            { type: "abreuvoir", key: "abreuvoir_puissance", condition: context.pouvoirData.abreuvoir?.showPuissanceCounter, data: context.pouvoirData.abreuvoir }
        ];

        let availableTalents = talentConfigurations.filter(t => t.condition);
        const talentOrder = this.actor.system.talentOrder || [];
        
        context.sortedTalentSections = [];
        const addedKeys = new Set();

        for (const key of talentOrder) {
            const talent = availableTalents.find(t => t.key === key);
            if (talent) {
                context.sortedTalentSections.push(talent);
                addedKeys.add(key);
            }
        }
        for (const talent of availableTalents) {
            if (!addedKeys.has(talent.key)) {
                context.sortedTalentSections.push(talent);
            }
        }

        // Calculate total contributions for display
        const c1 = Number(context.system.contribution1) || 0;
        const c2 = Number(context.system.contribution2) || 0;

        // Initialize UI state for talents specifiques if not already present
        if (!this._uiState) this._uiState = {};
        if (typeof this._uiState.talentsSpecifiquesExpanded !== 'boolean') {
            this._uiState.talentsSpecifiquesExpanded = false; // Default to closed
        }
        context.talentsSpecifiquesExpanded = this._uiState.talentsSpecifiquesExpanded;

        // Initialize UI state for caracteristiques section
        if (typeof this._uiState.caracteristiquesExpanded !== 'boolean') {
            this._uiState.caracteristiquesExpanded = true; // Default to open
        }
        context.caracteristiquesExpanded = this._uiState.caracteristiquesExpanded;

        // Initialize UI state for avantages section
        if (typeof this._uiState.avantagesExpanded !== 'boolean') {
            this._uiState.avantagesExpanded = true; // Default to open
        }
        context.avantagesExpanded = this._uiState.avantagesExpanded;

        // Initialize UI state for new possessions sections
        if (typeof this._uiState.ingredientExpanded !== 'boolean') {
            this._uiState.ingredientExpanded = true; // Default to open
        }
        context.ingredientExpanded = this._uiState.ingredientExpanded;

        if (typeof this._uiState.artefactabyssalExpanded !== 'boolean') {
            this._uiState.artefactabyssalExpanded = true;
        }
        context.artefactabyssalExpanded = this._uiState.artefactabyssalExpanded;

        if (typeof this._uiState.catalyseurExpanded !== 'boolean') {
            this._uiState.catalyseurExpanded = true;
        }
        context.catalyseurExpanded = this._uiState.catalyseurExpanded;

        if (typeof this._uiState.miroirExpanded !== 'boolean') {
            this._uiState.miroirExpanded = true;
        }
        context.miroirExpanded = this._uiState.miroirExpanded;

        if (typeof this._uiState.receptacleExpanded !== 'boolean') {
            this._uiState.receptacleExpanded = true;
        }
        context.receptacleExpanded = this._uiState.receptacleExpanded;

        if (typeof this._uiState.runeExpanded !== 'boolean') {
            this._uiState.runeExpanded = true;
        }
        context.runeExpanded = this._uiState.runeExpanded;
        if (typeof this._uiState.sortilegeExpanded !== 'boolean') {
            this._uiState.sortilegeExpanded = true;
        }
        context.sortilegeExpanded = this._uiState.sortilegeExpanded;


        const c3 = Number(context.system.contribution3) || 0;
        context.system.totalContributionsDisplay = c1 + c2 + c3;

        this._calculateMajorStats(context.system);
        // Handle competences FIRST (before creation points calculation)
        try {
            context.competencesFlat = this._calculateCompetences(context.system);
            
            // Calculate competence sums
            context.competenceSums = {
                all: this._calculateCompetenceSum(context.system),
                activeOnly: this._calculateCompetenceSum(context.system, { activeOnly: true }),
                withSpecialites: this._calculateCompetenceSum(context.system, { includeSpecialites: true })
            };
            
        } catch (error) {
            console.error('Error calculating competences:', error);
            context.competencesFlat = [];
            context.competenceSums = {};
        }
        
        this._preparePossessionsData(context);

        // Prepare linked Journal Entries
        context.linkedJournals = [];
        if (this.actor.system.linkedJournalUUIDs && Array.isArray(this.actor.system.linkedJournalUUIDs)) {
            for (const uuid of this.actor.system.linkedJournalUUIDs) {
                const journal = await fromUuid(uuid);
                if (journal) {
                    context.linkedJournals.push(journal);
                } else {
                    console.warn(`Ambre | Could not find JournalEntry with UUID: ${uuid}`);
                }
            }
        }

        this._calculateCreationPoints(context.system);

        // Add baseScoreSpecialite to the context for template usage
        if (!context.system) {
            context.system = {};
        }context.system.baseScoreSpecialite = game.settings.get("ambre", "baseScoreSpecialite");
        
        context.currentTab = this.currentTab;

        // DEBUGGING: Log des données des pouvoirs et des options système
        //console.log("Ambre | Pouvoirs List for template:", JSON.stringify(context.pouvoirsList, null, 2));
        //console.log("Ambre | System Options for template:", JSON.stringify(context.system.options, null, 2));
        return context;
    }

    /**
     * Handle pouvoir value changes with validation
     * @param {Event} event - The change event
     * @private
     */
    _onPouvoirValueChange(event) {
        const input = event.currentTarget;
        const value = parseInt(input.value) || 0;
        const validation = validatePouvoirValue(value);
        
        // Remove existing validation classes
        input.classList.remove('valid', 'invalid', 'at-max');
        
        if (!validation.isValid) {
            input.classList.add('invalid');
            ui.notifications.warn(validation.message);
        } else if (value === 500) {
            input.classList.add('at-max');
        } else {
            input.classList.add('valid');
        }
    }

    /**
     * Handle toggling capacites display
     * @param {Event} event - The click event
     * @private
     */
    _onToggleCapacites(event) {
        event.preventDefault();
        const pouvoirType = event.currentTarget.dataset.pouvoirType;

        // Initialize _uiState if it doesn't exist
        if (!this._uiState) this._uiState = {};
        if (!this._uiState.pouvoirs) this._uiState.pouvoirs = {};
        // Assurer une initialisation correcte si l'état pour ce pouvoir n'existe pas encore ou n'est pas un booléen
        if (typeof this._uiState.pouvoirs[pouvoirType]?.showCapacites !== 'boolean') {
            // Si non initialisé ou invalide, on le met à false, ainsi le premier clic le passera à true.
            this._uiState.pouvoirs[pouvoirType] = { showCapacites: false };
        }

        // Toggle the showCapacites state for this pouvoir type
        this._uiState.pouvoirs[pouvoirType].showCapacites = !this._uiState.pouvoirs[pouvoirType].showCapacites;

        // console.log(`Ambre | UI State for ${pouvoirType} toggled to: ${this._uiState.pouvoirs[pouvoirType].showCapacites}`);
        this.render(false);
    }
    
    /**
     * Handle change of Allié type from dropdown.
     * @param {Event} event The change event.
     * @private
     */
    async _onAllieTypeChange(event) {
        event.preventDefault();
        const selectedAllieType = event.currentTarget.value;
        const points = ALLIES_POINTS_MAP[selectedAllieType] || 0;

        const updateData = {
            "system.allieType": selectedAllieType,
            "system.creation.allies_valeur": points
        };
        
        await this.actor.update(updateData);
        // The sheet will re-render due to actor update, updating the readonly field.
    }

        /**
     * Handle change of Allié type from dropdown.
     * @param {Event} event The change event.
     * @private
     */
    async _onEnnemiTypeChange(event) {
        event.preventDefault();
        const selectedEnnemiType = event.currentTarget.value;
        const points = ENNEMIS_POINTS_MAP[selectedEnnemiType] || 0;

        const updateData = {
            "system.ennemiType": selectedEnnemiType,
            "system.creation.ennemis_valeur": points
        };
        
        await this.actor.update(updateData);
        // The sheet will re-render due to actor update, updating the readonly field.
    }

    /**
     * Handle dropping of an item onto the sheet.
     * @param {DragEvent} event     The concluding drag event
     * @param {Object} data         The data transfer extracted from the event
     * @returns {Promise<Item[]|boolean>}
     * @override
     */
    async _onDropItem(event, data) {
        const item = await Item.fromDropData(data);
        if ( !item ) return false;

        // Handle dropping JournalEntry documents
        if (data.type === "JournalEntry" && data.uuid) {
            const journal = await fromUuid(data.uuid);
            if (journal) return this._onDropJournalEntryLink(journal);
            return false;
        }
        // The following lines for dropTargetElement and its data attributes were duplicated.
        // The second block is the one that should be active.
        // const dropTargetElement = $(event.target).closest('.drop-target');
        // if (!dropTargetElement.length) return false;
        // const expectedGroupType = dropTargetElement.data('group-type');
        // ... (other data attributes)

        // Determine the target group
        const dropTargetElement = $(event.target).closest('.drop-target');
        if (!dropTargetElement.length) {
            // console.log("Ambre | _onDropItem: No .drop-target element found climbing from event.target:", event.target);
            return false;
        }

        // Log details about the found dropTargetElement
        // console.log("Ambre | _onDropItem: Found dropTargetElement:", dropTargetElement[0]); // Log the raw DOM element
        // console.log("Ambre | _onDropItem: dropTargetElement HTML (first 200 chars):", dropTargetElement[0].outerHTML.substring(0, 200));
        // console.log("Ambre | _onDropItem: dropTargetElement.attr('data-group-type'):", dropTargetElement.attr('data-group-type'));

        const expectedGroupType = dropTargetElement.data('group-type');
        const pouvoirTypeForDropZone = dropTargetElement.data('pouvoir-type'); // Used for both voiesecrete and motspouvoirs
        const capaciteSubtypeForDropZone = dropTargetElement.data('capacite-subtype'); // New: for "forme" or "speciale"
        const artefactSlotForDropZone = dropTargetElement.data('artefact-slot'); // For specific artefact slots
        const specialSlotForDropZone = dropTargetElement.data('special-slot'); // New: for the Mots de Pouvoirs header
        // console.log(`Ambre | _onDropItem: START. Dropped item type: "${item?.type}", Name: "${item?.name}"`);
        // console.log(`Ambre |   Drop Target Data: expectedGroupType="${expectedGroupType}", pouvoirTypeForDropZone="${pouvoirTypeForDropZone}", capaciteSubtype="${capaciteSubtypeForDropZone}", artefactSlot="${artefactSlotForDropZone}", specialSlot="${specialSlotForDropZone}"`);

        const sortilegesSlotForDropZone = dropTargetElement.data('sortileges-slot'); // For specific artefact slots
        
        // --- NEW: Handling for the special Mots de Pouvoirs header slot (Artefact or Catalyseur) ---
        if (specialSlotForDropZone === "magie_motspouvoirs_catalyst_artefact") {
            if (item.type === "artefact" || item.type === "catalyseur") {
                if (this.actor.isOwner) {
                    // Check if an item already occupies this special slot
                    const existingItemInSlot = this.actor.items.find(
                        i => i.system.linkedToSpecialSlot === "magie_motspouvoirs_catalyst_artefact"
                    );
                    if (existingItemInSlot) {
                        ui.notifications.warn(game.i18n.localize("AMBRE.notifications.SpecialSlotOccupied") || "Cet emplacement spécial est déjà occupé.");
                        return false;
                    }

                    const itemData = item.toObject();
                    foundry.utils.setProperty(itemData, "system.linkedToSpecialSlot", "magie_motspouvoirs_catalyst_artefact");
                    // Remove any old linking if it was a generic artefact slot item
                    foundry.utils.setProperty(itemData, "system.linkedToPouvoirSlot", ""); 
                    return this._onDropItemCreate(itemData);
                }
                return false; // Not owner
            } else {
                ui.notifications.warn(game.i18n.format("AMBRE.notifications.WrongItemTypeForSpecialSlot", {itemType: item.type, zoneType: "Emplacement Catalyseur/Artefact"}));
                return false; // Wrong item type
            }
        }
        // --- END NEW ---

        // Specific handling for voiesecrete drop area
        // This block must come BEFORE the generic item type check.
        if (expectedGroupType === "voiesecrete") {
            if (item.type === "voiesecrete") {
                if (this.actor.isOwner) {
                    // Calculate the limit
                    const vsPouvoirFieldName = `ptsvs${pouvoirTypeForDropZone}`;
                    const vsPoints = foundry.utils.getProperty(this.actor.system, `creation.${vsPouvoirFieldName}`) || 0;
                    const maxAllowedItems = Math.floor(Number(vsPoints) / 25);

                    // Count existing items for this pouvoirType
                    const existingLinkedItemsCount = this.actor.items.filter(
                        i => i.type === "voiesecrete" && i.system.linkedPouvoirType === pouvoirTypeForDropZone
                    ).length;

                    if (existingLinkedItemsCount >= maxAllowedItems) {
                        ui.notifications.warn(game.i18n.format("AMBRE.notifications.MaxVoiesSecretesReached", {
                            max: maxAllowedItems,
                            pouvoir: getPouvoirLabel(pouvoirTypeForDropZone) // Assuming you have a getPouvoirLabel helper
                        }));
                        return false; // Prevent drop
                    }

                    const itemData = item.toObject();
                    // Automatically set the linkedPouvoirType based on the drop zone
                    if (pouvoirTypeForDropZone) {
                        foundry.utils.setProperty(itemData, "system.linkedPouvoirType", pouvoirTypeForDropZone);
                        // console.log(`Ambre | Dropped voiesecrete item. Setting linkedPouvoirType to: ${pouvoirTypeForDropZone} for item "${itemData.name}"`);
                    }
                    return this._onDropItemCreate(itemData);
                }
                return false; // Not owner
            } else {
                ui.notifications.warn(game.i18n.format("AMBRE.notifications.WrongItemTypeForDropZone", {itemType: item.type, zoneType: "Voie Secrète"}));
                return false; // Wrong item type for this specific zone
            }
        }

        // Handling for specific artefact slots (e.g., Mots de Pouvoirs header)
        if (expectedGroupType === "artefact" && artefactSlotForDropZone && !specialSlotForDropZone) { // Ensure it's not the special slot
            if (item.type === "artefact") {
                if (this.actor.isOwner) {
                    // Check if an artefact already occupies this specific slot
                    const existingArtefactInSlot = this.actor.items.find(
                        i => i.type === "artefact" && i.system.linkedToPouvoirSlot === artefactSlotForDropZone
                    );
                    if (existingArtefactInSlot) {
                        ui.notifications.warn(game.i18n.localize("AMBRE.notifications.ArtefactSlotOccupied") || "Cet emplacement d'artefact est déjà occupé.");
                        return false;
                    }

                    const itemData = item.toObject();
                    foundry.utils.setProperty(itemData, "system.linkedToPouvoirSlot", artefactSlotForDropZone);
                    // Remove any new special linking if it was a generic artefact
                    foundry.utils.setProperty(itemData, "system.linkedToSpecialSlot", ""); 
                    return this._onDropItemCreate(itemData);
                }
                return false; // Not owner
            } else {
                ui.notifications.warn(game.i18n.format("AMBRE.notifications.WrongItemTypeForDropZone", {itemType: item.type, zoneType: "Emplacement d'Artefact Spécifique"}));
                return false; // Wrong item type
            }
        }
        
        // Handling for motspouvoirs drop area (specific to 'magie' pouvoir)
        if (expectedGroupType === "motspouvoirs") {
            if (pouvoirTypeForDropZone === "magie" && item.type === "motspouvoirs") {
                if (this.actor.isOwner) {
                    const magiePouvoirValue = this.actor.system.ptsmagie || 0;
                    // calculateNiveauNumeric is imported from pouvoirHelper.js
                    const magieNiveauNumeric = calculateNiveauNumeric(magiePouvoirValue); 

                    if (magieNiveauNumeric >= 2) {
                        // Check limit for Mots de Pouvoirs
                        const actorPsyche = this.actor.system.psyche || 0;
                        const maxAllowed = Math.floor(actorPsyche / 10); // Same limit logic as in helper
                        const currentCount = this.actor.items.filter(
                            i => i.type === "motspouvoirs" && i.system.linkedPouvoir === "magie"
                        ).length;

                        if (currentCount >= maxAllowed) {
                            ui.notifications.warn(game.i18n.format("AMBRE.notifications.MaxMotsPouvoirsReached", { max: maxAllowed }) || `Limite de ${maxAllowed} Mots de Pouvoirs atteinte.`);
                            return false;
                        }

                        const itemData = item.toObject();
                        foundry.utils.setProperty(itemData, "system.linkedPouvoir", "magie");
                        return this._onDropItemCreate(itemData);
                    } else {
                        ui.notifications.warn(game.i18n.localize("AMBRE.notifications.MagieLevelTooLowForMotsPouvoirs") || "Le niveau de Magie (Niveau 2+) est requis pour ajouter des Mots de Pouvoirs.");
                        return false;
                    }
                }
                return false; // Not owner
            } else {
                ui.notifications.warn(game.i18n.format("AMBRE.notifications.WrongItemTypeForDropZone", {itemType: item.type, zoneType: "Mots de Pouvoirs"}));
                return false; // Wrong item type or not the magie drop zone for motspouvoirs
            }
        }

        // Handling for receptacles drop area (specific to 'magie' pouvoir)
        if (expectedGroupType === "receptacles") {
            if (pouvoirTypeForDropZone === "magie" && item.type === "receptacle") {
                if (this.actor.isOwner) {
                    const magiePouvoirValue = this.actor.system.ptsmagie || 0;
                    const magieNiveauNumeric = calculateNiveauNumeric(magiePouvoirValue);

                    if (magieNiveauNumeric >= 3) { // Magie Niveau 3+ required
                        // Check limit for Receptacles
                        const actorPsyche = this.actor.system.psyche || 0;
                        const maxAllowed = Math.floor(actorPsyche / 10);
                        const currentCount = this.actor.items.filter(
                            i => i.type === "receptacle" && i.system.linkedPouvoir === "magie"
                        ).length;

                        if (currentCount >= maxAllowed) {
                            ui.notifications.warn(game.i18n.format("AMBRE.notifications.MaxReceptaclesReached", { max: maxAllowed }) || `Limite de ${maxAllowed} Réceptacles atteinte.`);
                            return false;
                        }

                        const itemData = item.toObject();
                        foundry.utils.setProperty(itemData, "system.linkedPouvoir", "magie");
                        return this._onDropItemCreate(itemData);
                    } else {
                        ui.notifications.warn(game.i18n.localize("AMBRE.notifications.MagieLevelTooLowForReceptacles") || "Le niveau de Magie (Niveau 3+) est requis pour ajouter des Réceptacles.");
                        return false;
                    }
                }
                return false; // Not owner
            } else {
                ui.notifications.warn(game.i18n.format("AMBRE.notifications.WrongItemTypeForDropZone", {itemType: item.type, zoneType: "Réceptacles"}));
                return false; // Wrong item type or not the magie drop zone for receptacles
            }
        }

        // Handling for miroirs drop area (specific to 'chimerion' pouvoir)
        if (expectedGroupType === "miroirs") {
            if (pouvoirTypeForDropZone === "chimerion" && item.type === "miroir") {
                if (this.actor.isOwner) {
                    const chimerionPouvoirValue = this.actor.system.ptschimerion || 0;
                    const chimerionNiveauNumeric = calculateNiveauNumeric(chimerionPouvoirValue);

                    if (chimerionNiveauNumeric >= 11) { // Chimérion Niveau 11+ required
                        const actorPsyche = this.actor.system.psyche || 0;
                        const maxAllowed = Math.floor(actorPsyche / 10);
                        const currentCount = this.actor.items.filter(
                            i => i.type === "miroir" && i.system.linkedPouvoir === "chimerion"
                        ).length;

                        if (currentCount >= maxAllowed) {
                            ui.notifications.warn(game.i18n.format("AMBRE.notifications.MaxMiroirsReached", { max: maxAllowed }) || `Limite de ${maxAllowed} Miroirs atteinte.`);
                            return false;
                        }

                        const itemData = item.toObject();
                        foundry.utils.setProperty(itemData, "system.linkedPouvoir", "chimerion");
                        return this._onDropItemCreate(itemData);
                    } else {
                        ui.notifications.warn(game.i18n.localize("AMBRE.notifications.ChimerionLevelTooLowForMiroirs") || "Le niveau de Chimérion (Niveau 11+) est requis pour ajouter des Miroirs.");
                        return false;
                    }
                }
                return false; // Not owner
            } else {
                ui.notifications.warn(game.i18n.format("AMBRE.notifications.WrongItemTypeForDropZone", {itemType: item.type, zoneType: "Miroirs"}));
                return false; // Wrong item type or not the chimerion drop zone for miroirs
            }
        }

        // Handling for runes drop area (specific to 'magie' pouvoir)
        if (expectedGroupType === "runes") {
            if (pouvoirTypeForDropZone === "magie" && item.type === "rune") {
                if (this.actor.isOwner) {
                    const magiePouvoirValue = this.actor.system.ptsmagie || 0;
                    const magieNiveauNumeric = calculateNiveauNumeric(magiePouvoirValue);

                    if (magieNiveauNumeric >= 5) { // Magie Niveau 5+ required
                        const actorPerception = this.actor.system.perception || 0;
                        const maxAllowed = Math.floor(actorPerception / 5);
                        const currentCount = this.actor.items.filter(
                            i => i.type === "rune" && i.system.linkedPouvoir === "magie"
                        ).length;

                        if (currentCount >= maxAllowed) {
                            ui.notifications.warn(game.i18n.format("AMBRE.notifications.MaxRunesReached", { max: maxAllowed }) || `Limite de ${maxAllowed} Runes atteinte.`);
                            return false;
                        }

                        const itemData = item.toObject();
                        foundry.utils.setProperty(itemData, "system.linkedPouvoir", "magie");
                        return this._onDropItemCreate(itemData);
                    } else {
                        ui.notifications.warn(game.i18n.localize("AMBRE.notifications.MagieLevelTooLowForRunes") || "Le niveau de Magie (Niveau 5+) est requis pour ajouter des Runes.");
                        return false;
                    }
                }
                return false; // Not owner
            } else {
                ui.notifications.warn(game.i18n.format("AMBRE.notifications.WrongItemTypeForDropZone", {itemType: item.type, zoneType: "Runes"}));
                return false; // Wrong item type or not the magie drop zone for runes
            }
        }

        if (expectedGroupType === "sortileges") {
            if (pouvoirTypeForDropZone === "magie" && item.type === "sortileges") {
                if (this.actor.isOwner) {
                    const magiePouvoirValue = this.actor.system.ptsmagie || 0;
                    // calculateNiveauNumeric is imported from pouvoirHelper.js
                    const magieNiveauNumeric = calculateNiveauNumeric(magiePouvoirValue); 

                    if (magieNiveauNumeric >= 3) {
                        const itemData = item.toObject();
                        foundry.utils.setProperty(itemData, "system.linkedPouvoir", "magie");
                        // No limit check needed anymore for sortileges
                        return this._onDropItemCreate(itemData);
                    } else {
                        ui.notifications.warn(game.i18n.localize("AMBRE.notifications.MagieLevelTooLowForSortileges") || "Le niveau de Magie (Niveau 3+) est requis pour ajouter des Sortileges.");
                        return false;
                    }
                }
                return false; // Not owner
            } else {
                ui.notifications.warn(game.i18n.format("AMBRE.notifications.WrongItemTypeForDropZone", {itemType: item.type, zoneType: "Sortileges"}));
                return false; // Wrong item type or not the magie drop zone for Sortileges
            }
        }

        // Handling for capaciteanimale drop area (specific to 'metamorphose' pouvoir)
        if (expectedGroupType === "capaciteanimale") {
            if (pouvoirTypeForDropZone === "metamorphose" && item.type === "capaciteanimale") {
                if (!this.actor.isOwner) return false;

                const metamorphosePouvoirValue = this.actor.system.ptsmetamorphose || 0;
                const metamorphoseNiveauNumeric = calculateNiveauNumeric(metamorphosePouvoirValue);
                const itemData = item.toObject();
                foundry.utils.setProperty(itemData, "system.linkedPouvoirType", "metamorphose");

                if (capaciteSubtypeForDropZone === "forme") {
                    if (metamorphoseNiveauNumeric >= 2) {
                        const maxAllowed = Math.floor((this.actor.system.physique || 0) / 10);
                        const currentCount = this.actor.items.filter(
                            i => i.type === "capaciteanimale" && i.system.linkedPouvoirType === "metamorphose" && (i.system.capaciteSubType === "forme" || !i.system.capaciteSubType)
                        ).length;

                        if (currentCount >= maxAllowed) {
                            ui.notifications.warn(game.i18n.format("AMBRE.notifications.MaxCapacitesAnimalesFormeReached", { max: maxAllowed }) || `Limite de ${maxAllowed} Capacités Animales (Forme) atteinte.`);
                            return false;
                        }
                        foundry.utils.setProperty(itemData, "system.capaciteSubType", "forme");
                        return this._onDropItemCreate(itemData);
                    } else {
                        ui.notifications.warn(game.i18n.localize("AMBRE.notifications.MetamorphoseLevelTooLowForCapacitesAnimales") || "Le niveau de Métamorphose (Niveau 2+) est requis pour ajouter des Capacités Animales.");
                        return false;
                    }
                } else if (capaciteSubtypeForDropZone === "speciale") {
                    if (metamorphoseNiveauNumeric >= 8) {
                        const maxAllowed = Math.floor((this.actor.system.physique || 0) / 10);
                        const currentCount = this.actor.items.filter(
                            i => i.type === "capaciteanimale" && i.system.linkedPouvoirType === "metamorphose" && i.system.capaciteSubType === "speciale"
                        ).length;

                        if (currentCount >= maxAllowed) {
                            ui.notifications.warn(game.i18n.format("AMBRE.notifications.MaxCapacitesAnimalesSpecialesReached", { max: maxAllowed }) || `Limite de ${maxAllowed} Capacités Animales Spéciales atteinte.`);
                            return false;
                        }
                        foundry.utils.setProperty(itemData, "system.capaciteSubType", "speciale");
                        return this._onDropItemCreate(itemData);
                    } else {
                        ui.notifications.warn(game.i18n.localize("AMBRE.notifications.MetamorphoseLevelTooLowForCapacitesAnimalesSpeciales") || "Le niveau de Métamorphose (Niveau 8+) est requis pour ajouter des Capacités Animales Spéciales.");
                        return false;
                    }
                } else {
                    ui.notifications.warn("Type de capacité animale non reconnu pour cette zone de dépôt.");
                    return false;
                }
            } else {
                ui.notifications.warn(game.i18n.format("AMBRE.notifications.WrongItemTypeForDropZone", {itemType: item.type, zoneType: "Capacités Animales"}));
                return false; // Wrong item type or not the metamorphose drop zone
            }
        }

        // Before the generic handler:
        // console.log(`Ambre | _onDropItem: Reached generic handler check. Item type: "${item.type}", Expected group type: "${expectedGroupType}"`);
        // Check if the item type matches the group type for Items (artefact, creature, ombre, atout, ingredient, artefactabyssal, catalyseur, miroir, receptacle, rune, sortileges)
        if (item.type === expectedGroupType && ["artefact", "creature", "ombre", "atout", "ingredient", "artefactabyssal", "catalyseur", "miroir", "receptacle", "rune", "sortileges"].includes(expectedGroupType)) {
            // console.log(`Ambre | _onDropItem: Generic handler MATCHED. Item type: "${item.type}", Expected group type: "${expectedGroupType}"`);
            if (!this.actor.isOwner) {
                // console.log("Ambre | _onDropItem: Generic handler - Actor is not owner. Preventing drop.");
                return false;
            }
            // console.log("Ambre | _onDropItem: Generic handler - Actor is owner. Proceeding to _onDropItemCreate.");
            const created = await this._onDropItemCreate(item.toObject()); // Ensure you await this
            if (created) {
                this.render(false); // Force a re-render of the sheet
            }
            return created;
        }
        
        // If no specific or generic handler matched
        // This log will help determine if the drop event is processed up to this point but no valid handler is found.
        // console.log(`Ambre | _onDropItem: END. No handler matched for item type: "${item.type}" on group type: "${expectedGroupType}"`);
        return false;
    }

    /**
     * Handle creating a new Item document from dropped data.
     * OVERRIDE to add logging.
     * @param {object} itemData The data to create the item with
     * @private
     */
    async _onDropItemCreate(itemData) {
        // console.log(`Ambre | _onDropItemCreate: Attempting to create item with data:`, JSON.parse(JSON.stringify(itemData)));
        try {
            const createdItems = await this.actor.createEmbeddedDocuments("Item", [itemData]);
            // console.log(`Ambre | _onDropItemCreate: Successfully created item(s):`, createdItems);
            if (createdItems && createdItems.length > 0) {
                return createdItems;
            }
            // console.warn(`Ambre | _onDropItemCreate: createEmbeddedDocuments returned an empty or invalid result.`);
            return false;
        } catch (error) {
            // console.error(`Ambre | _onDropItemCreate: Error during createEmbeddedDocuments:`, error);
            ui.notifications.error(`Erreur lors de la création de l'objet : ${error.message}`);
            return false;
        }
    }

    /**
     * Handle dropping a JournalEntry to link it to the actor.
     * @param {JournalEntry} journal The JournalEntry document dropped.
     * @private
     */
    async _onDropJournalEntryLink(journal) {
        if (!this.actor.isOwner) return false;

        const currentUUIDs = this.actor.system.linkedJournalUUIDs || [];
        if (!currentUUIDs.includes(journal.uuid)) {
            const newUUIDs = [...currentUUIDs, journal.uuid];
            await this.actor.update({"system.linkedJournalUUIDs": newUUIDs});
            ui.notifications.info(`Journal "${journal.name}" lié à l'acteur.`);
        }
        return true; // Indicate the drop was handled
    }

    _calculateCreationPoints(system) {
        // Defensive check: Ensure system.creation object exists before trying to read from it.
        if (!system.creation) {
            system.creation = {};
        }

        // Calculate Creation Points
        const ptsbase = game.settings.get("ambre", "basePointsCreation") || 600;
        let ptstotaux =  0;
        const ptskarma = system.karma * 2 || 0;
        // Calculate competences points using the sum function
        const competenceSum = this._calculateCompetenceSum(system);
        const totalCompetencesSpent = competenceSum.totalValue; // Just the competence values, not including characteristics
        const ptscompetences = totalCompetencesSpent;
        // Calculate points faible, using the field from system.creation
        const pointFaible = Number(system.ptspointfaible) || 0;
        const ptspouvoirs = ((system.ptsmarelle || 0) + (system.ptslogrus || 0) + (system.ptsatouts || 0) + (system.ptsmetamorphose || 0) + (system.ptspentacre || 0) + (system.ptscoeurflamme || 0) + (system.ptsorbochromat || 0) + (system.ptsabreuvoir || 0) + (system.ptsharmonium || 0) + (system.ptschimerion || 0) + (system.ptssabliers || 0) + (system.ptsabysses || 0) + (system.ptsmagie || 0));
        const ptscontributions = system.totalContributionsDisplay;
        const ptscaracteristiques = system.ptscaracteristiques;

        // Calculate costs for Ombres, Artefacts, Creatures
        let ptsombres = 0;
        let ptsartefacts = 0;
        let ptscreatures = 0;

        if (this.actor && this.actor.items) {
            for (const item of this.actor.items) {
                const itemCost = Number(item.system?.totalCost) || 0;
                if (item.type === "ombre") {
                    ptsombres += itemCost;
                } else if (item.type === "artefact") {
                    ptsartefacts += itemCost;
                } else if (item.type === "creature") {
                    ptscreatures += itemCost;
                }
            }
        }

        ptstotaux = ptscaracteristiques - pointFaible + ptscompetences + ptspouvoirs + ptskarma - ptscontributions +
                    (system.creation.allies_valeur || 0) - (system.creation.ennemis_valeur || 0) +
                    ptsombres + ptsartefacts + ptscreatures;
        let ptsrestants = ptsbase - ptstotaux;
       

        // Update system data
        system.creation.ptsbase = ptsbase; // Ensure updates go to system.creation
        system.creation.ptstotaux = ptstotaux; // Ensure updates go to system.creation
        system.ptskarma = ptskarma; // This is correctly at system.ptskarma
        system.creation.ptscompetences = ptscompetences; // Ensure updates go to system.creation
        system.creation.ptspouvoirs = ptspouvoirs; // Ensure updates go to system.creation
        system.creation.ptscaracteristiques = ptscaracteristiques; // Ensure updates go to system.creation
        system.creation.ptsrestants = ptsrestants; // Ensure updates go to system.creation
        system.creation.ptscontributions = ptscontributions; // Ensure updates go to system.creation
        system.creation.ptspointfaible = pointFaible; // Ensure updates go to system.creation

        // Assign calculated item costs
        system.creation.ptsombres = ptsombres;
        system.creation.ptsartefacts = ptsartefacts;
        system.creation.ptscreatures = ptscreatures;
    }

    _calculateCompetences(system) {
        // Safety check
        if (!system) {
            console.error('System is undefined in _calculateCompetences');
            return [];
        }
        
        // Initialize competences if they don't exist
        if (!system.competences) {
            system.competences = this.getDefaultCompetences();
            
            // Update the actor
            this.actor.update({
                "system.competences": system.competences
            }).catch(err => console.error('Failed to update competences:', err));
        }
        
        // Check if competences is empty
        if (Object.keys(system.competences).length === 0) {
            system.competences = getDefaultCompetences();
        }
        
        // Prepare competences data for display
        const competencesFlat = [];
        
        if (system.competences && typeof system.competences === 'object') {
            Object.entries(system.competences).forEach(([compKey, competence]) => {
                if (!competence || typeof competence !== 'object') {
                    console.warn(`Invalid competence: ${compKey}`);
                    return;
                }
                
                const caracteristiqueValue = system[competence.caracteristique] || 0;
                const competenceValue = competence.value || 0;
                const halfValue = Math.floor(competenceValue / 2);
                const total = competenceValue + caracteristiqueValue + halfValue;
                
                // Get specialites for this competence
                const specialites = getSpecialites(compKey); // Use the imported function
                
                competencesFlat.push({
                    key: compKey,
                    label: competence.label || compKey,
                    value: competenceValue,
                    description: competence.description || "",
                    caracteristique: competence.caracteristique || "physique",
                    caracteristiqueValue: caracteristiqueValue,
                    halfValue: halfValue,
                    total: total,
                    active: competence.active || false,
                    selectedSpecialite: competence.specialite || "", // Assuming this is where the selected specialite is stored
                    specialites: getSpecialites(compKey), // Use the imported function
                    inputName: `system.competences.${compKey}`
                });
            });
        }
        
        return competencesFlat;
    }

    _preparePossessionsData(sheetData) {
        const actorData = sheetData.actor; // This is this.actor from getData
        // console.log(`Ambre | _preparePossessionsData: Preparing possessions. Actor items count: ${actorData.items.size}. Items:`, actorData.items.map(i => `${i.name} (${i.type})`));
        sheetData.possessedArtefacts = actorData.items.filter(i => i.type === 'artefact');
        // console.log(`Ambre | _preparePossessionsData: Filtered possessedArtefacts count: ${sheetData.possessedArtefacts.length}. Names:`, sheetData.possessedArtefacts.map(i => i.name));

        sheetData.possessedCreatures = actorData.items.filter(i => i.type === 'creature'); // Assuming 'creature' is an item type
        sheetData.possessedOmbres = actorData.items.filter(i => i.type === 'ombre'); // Assuming 'ombre' is an item type
        sheetData.equippedAtouts = actorData.items.filter(i => i.type === 'atout');
        sheetData.possessedIngredients = actorData.items.filter(i => i.type === 'ingredient');
        sheetData.possessedArtefactAbyssals = actorData.items.filter(i => i.type === 'artefactabyssal');
        sheetData.possessedCatalyseurs = actorData.items.filter(i => i.type === 'catalyseur');
        sheetData.possessedMiroirs = actorData.items.filter(i => i.type === 'miroir');
        sheetData.possessedReceptacles = actorData.items.filter(i => i.type === 'receptacle');
        sheetData.possessedRunes = actorData.items.filter(i => i.type === 'rune');
        sheetData.possessedSortileges = actorData.items.filter(i => i.type === 'sortileges');
        sheetData.possessedVoiesSecretes = actorData.items.filter(i => i.type === 'voiesecrete');
        // sheetData.possessedJournaux = actorData.items.filter(i => i.type === 'journal'); // Removed: Standard journals are not items
    }

    _calculateMajorStats(system) {
        // Calculate physique
        system.force_display = (system.force || 0) + (system.temporarybonusforce || 0);
        system.dexterite_display = (system.dexterite || 0) + (system.temporarybonusdexterite || 0);
        system.reflexe_display = (system.reflexe || 0) + (system.temporarybonusreflexe || 0);
        // Calculate base physique from sub-stats, then add its direct temporary bonus
        system.physique = Math.round((system.force_display + system.dexterite_display + system.reflexe_display) / 3) + (system.temporarybonusphysique || 0);
        
        // Calculate endurance
        system.adaptation_display = (system.adaptation || 0) + (system.temporarybonusadaptation || 0);
        system.regeneration_display = (system.regeneration || 0) + (system.temporarybonusregeneration || 0);
        system.resistance_display = (system.resistance || 0) + (system.temporarybonusresistance || 0);
        system.endurance = Math.round((system.adaptation_display + system.regeneration_display + system.resistance_display) / 3) + (system.temporarybonusendurance || 0);
        
        // Calculate psyche
        system.intelligence_display = (system.intelligence || 0) + (system.temporarybonusintelligence || 0);
        system.concentration_display = (system.concentration || 0) + (system.temporarybonusconcentration || 0);
        system.volonte_display = (system.volonte || 0) + (system.temporarybonusvolonte || 0);
        system.psyche = Math.round((system.intelligence_display + system.concentration_display + system.volonte_display) / 3) + (system.temporarybonuspsyche || 0);
        
        // Calculate perception (if you have these components)
        system.sens_display = (system.sens || 0) + (system.temporarybonussens || 0);
        system.sixiemesens_display = (system.sixiemesens || 0) + (system.temporarybonussixiemesens || 0);
        system.empathie_display = (system.empathie || 0) + (system.temporarybonusempathie || 0);
        system.perception = Math.round((system.sens_display + system.sixiemesens_display + system.empathie_display) / 3) + (system.temporarybonusperception || 0);
        
        // Calculate charisme (if you have these components)
        system.apparence_display = (system.apparence || 0) + (system.temporarybonusapparence || 0);
        system.intimidation_display = (system.intimidation || 0) + (system.temporarybonusintimidation || 0);
        system.eloquence_display = (system.eloquence || 0) + (system.temporarybonuseloquence || 0);
        system.charisme = Math.round((system.apparence_display + system.intimidation_display + system.eloquence_display) / 3) + (system.temporarybonuscharisme || 0);

        // Calculate Points de caracteristiques
        // Points de caractéristiques should be based on the BASE values of sub-characteristics, not including temporary bonuses.
        system.ptscaracteristiques = (system.force || 0) + (system.dexterite || 0) + (system.reflexe || 0) + 
                                     (system.adaptation || 0) + (system.regeneration || 0) + (system.resistance || 0) + 
                                     (system.intelligence || 0) + (system.concentration || 0) + (system.volonte || 0) + 
                                     (system.sens || 0) + (system.sixiemesens || 0) + (system.empathie || 0) + 
                                     (system.apparence || 0) + (system.intimidation || 0) + (system.eloquence || 0) - 300;    

        // Defensive initialization for health and energy structures
        if (!system.health) system.health = { value: 0, min: 0, max: 0 };
        if (typeof system.health.healthReserve !== 'object' || system.health.healthReserve === null) {
            system.health.healthReserve = { value: 0, max: 0 };
        }
        if (!system.energy) system.energy = { value: 0, min: 0, max: 0 };
        if (typeof system.energy.energyReserve !== 'object' || system.energy.energyReserve === null) {
            system.energy.energyReserve = { value: 0, max: 0 };
        }

        system.health.max = system.endurance;
        system.health.healthReserve.max = Math.floor(system.endurance / 2);
        system.energy.max = system.psyche;
        system.energy.energyReserve.max = Math.floor(system.psyche / 2);
    }

    activateListeners(html) {
        super.activateListeners(html);
        
        // Handle navigation tab clicks
        html.find('.sheet-navigation-tab').click((event) => {
            this.currentTab = event.currentTarget.dataset.tab;
            this._onTabClick(event);
        });
        html.find('.karma-component').on('input change', (event) => this._onComponentChange('karma', event));
        html.find('.physique-component').on('input change', (event) => this._onComponentChange('physique', event));
        html.find('.endurance-component').on('input change', (event) => this._onComponentChange('endurance', event));
        html.find('.psyche-component').on('input change', (event) => this._onComponentChange('psyche', event));
        html.find('.perception-component').on('input change', (event) => this._onComponentChange('perception', event));
        html.find('.charisme-component').on('input change', (event) => this._onComponentChange('charisme', event));


        html.find('.clickable-label').click(this._onToggleDescription.bind(this));
        // Initialize competences button
        // html.find('.competence-specialite-checkbox').change(this._onSpecialiteCheckboxChange.bind(this)); // Method is commented out

        // Generic handler for number inputs that need sanitization
        html.find('input[name="system.creation.ptspointfaible"]').on('input change', this._onGenericNumericInputChange.bind(this));

        // Handle theme selection changes
        html.find('input[name="system.selectedtheme"]').on('change', this._onThemeChange.bind(this));
        html.find('input[name="system.options.headerTextColor"]').on('change', this._onHeaderTextColorChange.bind(this));
        
        // Apply current theme on sheet render
        this._applyCurrentTheme(html);


        // Set initial Karma input position
        this._updateKarmaInputPosition(html);

        // Handle Atout Style selection changes
        // This listener is on the actor sheet, but triggers style application to item sheets
        html.find('select[name="system.atoutStyle"]').on('change', this._applyAtoutStyleToSheets.bind(this));


        // Handle biography editor
        html.find('.editor-edit-btn').click(this._onEditorEditClick.bind(this));
        html.find('.editor-save').click(this._onEditorSave.bind(this));
        html.find('.editor-cancel').click(this._onEditorCancel.bind(this));
        
        // Handle item editing and deletion
        html.find('.item .item-edit').click(this._onItemEdit.bind(this)); // More general selector
        html.find('.item .item-delete').click(this._onItemDelete.bind(this)); // More general selector
        html.find('.actorDesc-header .item-create').click(this._onItemCreateClick.bind(this)); // Adjusted selector for item creation
        html.find('.item-name-clickable').click(this._onItemNameClick.bind(this));

        // Pouvoir value validation
        
        // Capacites toggle buttons
        html.find('.pouvoir-capacites-btn-main').on('click', this._onToggleCapacites.bind(this));

        // Listener for Allié type change
        html.find('select[name="system.allieType"]').change(this._onAllieTypeChange.bind(this));

        // Listener for Ennemi type change
        html.find('select[name="system.ennemiType"]').change(this._onEnnemiTypeChange.bind(this));

        // Listener for clickable tab titles
        html.find('.clickable-tab-title').click(this._onToggleTabContent.bind(this));

        // Listener for clickable avantage dots
        html.find('.avantage-dot').click(this._onAvantageDotClick.bind(this));

        // Listener for refreshing avantages
        html.find('.refresh-avantages-button').click(this._onRefreshAvantagesClick.bind(this));

        // Listener for refreshing caracteristiques temporary bonuses
        html.find('.refresh-caracteristiques-button').click(this._onRefreshCaracteristiquesClick.bind(this));

        // Make possessions sections draggable
        this._activatePossessionsDragDrop(html);

        // Make pouvoirs sections draggable
        this._activatePouvoirDragDrop(html);

        html.find('.journal-list-item .journal-edit').click(this._onEditStandardJournal.bind(this));
        html.find('.journal-list-item .journal-delete').click(this._onDeleteStandardJournal.bind(this));

        // Listener for the "Dévoiler Voies Secrètes" button
        html.find('.vs-capacites-btn-main').click(ev => {
            const button = $(ev.currentTarget);
            const pouvoirType = button.data('pouvoir-type');
            // console.log(`Ambre | Clicked 'Dévoiler Voies Secrètes' for ${pouvoirType}`);
            this.displayVSElement(pouvoirType, button);
        });

        // Debug: Log all buttons found
        const buttons = html.find('.pouvoir-capacites-btn-main');
        //console.log(`Found ${buttons.length} capacites buttons`);
        buttons.each((index, button) => {
            //console.log(`Button ${index}:`, button, `pouvoir-type: ${button.dataset.pouvoirType}`);
        });

        // Restore the current tab after render
        this._restoreCurrentTab(html);

        // Listeners for banner controls
        html.find('.prev-banner').click(this._onChangeBanner.bind(this, -1));
        html.find('.next-banner').click(this._onChangeBanner.bind(this, 1));

        // Listeners for decorum controls
        html.find('.prev-decorum').click(this._onChangeDecorum.bind(this, -1));
        html.find('.next-decorum').click(this._onChangeDecorum.bind(this, 1));
        
        // Listeners for counter icon controls
        html.find('.counter-icon-control.prev-icon').click(this._onChangeCounterIconTheme.bind(this, -1));
        html.find('.counter-icon-control.next-icon').click(this._onChangeCounterIconTheme.bind(this, 1));

        // Drag and Drop for Talent Sections
        const talentContainer = html.find('.talents-specifiques-collapsible-group .collapsible-content');
        let draggedItem = null;

        talentContainer.find('.talent-block-draggable').each((i, el) => {
            el.addEventListener('dragstart', (event) => {
                draggedItem = event.target;
                event.dataTransfer.setData('text/plain', event.target.dataset.talentKey);
                event.target.classList.add('dragging');
                // Add a slight delay to allow the browser to capture the original element for the drag image
                setTimeout(() => {
                    if (draggedItem) $(draggedItem).css('opacity', '0.5');
                }, 0);
            });

            el.addEventListener('dragend', (event) => {
                if (draggedItem) {
                    $(draggedItem).css('opacity', '1');
                    draggedItem.classList.remove('dragging');
                }
                draggedItem = null;
                // Remove any dragover indicators
                talentContainer.find('.talent-block-draggable').removeClass('drag-over-before drag-over-after');
            });
        });

        talentContainer.on('dragover', '.talent-block-draggable', (event) => {
            event.preventDefault();
            event.originalEvent.dataTransfer.dropEffect = 'move';
        });
        
        talentContainer.on('drop', '.talent-block-draggable', async (event) => {
            event.preventDefault();
            if (!draggedItem) return;

            const targetItem = event.currentTarget;
            if (draggedItem !== targetItem) {
                // Determine if dropping before or after the target
                const rect = targetItem.getBoundingClientRect();
                const isAfter = (event.originalEvent.clientY - rect.top) > (rect.height / 2);
                if (isAfter) {
                    targetItem.parentNode.insertBefore(draggedItem, targetItem.nextSibling);
                } else {
                    targetItem.parentNode.insertBefore(draggedItem, targetItem);
                }
            }
            // Update actor's talentOrder
            const newOrder = Array.from(talentContainer.find('.talent-block-draggable')).map(el => el.dataset.talentKey);
            await this.actor.update({'system.talentOrder': newOrder});
            // No need to re-render, DOM is already updated.
        });

        // Custom Tooltip for Orbochromat Talents
        const orbochromatTooltip = $('<div class="orbochromat-custom-tooltip"></div>').hide().appendTo(this.element.find('.sheet-body'));
        let currentTooltipTarget = null;

        // Listener for the main Talents Spécifiques collapsible header
        // Moved here to ensure it's after the tooltip logic which might be within this section
        html.find('.talents-main-header').click(ev => {
            if (!this._uiState) this._uiState = {}; // Ensure _uiState exists
            // Toggle the stored state
            this._uiState.talentsSpecifiquesExpanded = !this._uiState.talentsSpecifiquesExpanded;

            // Visual toggle (already in place)
            const header = $(ev.currentTarget);
            const content = header.siblings('.collapsible-content');
            const icon = header.find('.collapsible-icon i');
            content.slideToggle(200);
            header.toggleClass('expanded');
            icon.toggleClass('fa-chevron-right fa-chevron-down');
            // No need to call this.render() here as slideToggle handles the immediate visual change.
            // The state is saved for the *next* full render.
        });
    
        // Listeners for standard Journal Entry management        
        html.find('.journal-create-button').click(this._onCreateStandardJournal.bind(this));
    
        html.find('.talent-icon[data-tooltip-type]').click(event => {
            event.stopPropagation();
            // console.log("Ambre | Orbochromat icon clicked:", event.currentTarget);
            const icon = $(event.currentTarget);
            const tooltipType = icon.data('tooltip-type');

            const talentData = this._processedOrbochromatData; // Access stored processed data

            if (!talentData) {
                console.warn("Ambre | Orbochromat talent data not available for tooltip (from this._processedOrbochromatData).");
                return;
            }

            if (currentTooltipTarget === event.currentTarget && orbochromatTooltip.is(':visible')) {
                orbochromatTooltip.hide();
                currentTooltipTarget = null;
                return;
            }
            currentTooltipTarget = event.currentTarget;

            let contentHtml = '';
            const dataSet = talentData[`${tooltipType}Data`];

            let tooltipContentWrapperClass = "";
            if (tooltipType === 'teintes') {
                dataSet.base.forEach(item => contentHtml += `<div><span class="tooltip-term">${item.term}:</span> <span class="tooltip-definition">${item.definition}</span></div>`);
                if (talentData.niveauNumeric >= 10 && dataSet.niveau10) {
                    contentHtml += `<div class="tooltip-separator">Niveau 10+:</div>`;
                    dataSet.niveau10.forEach(item => contentHtml += `<div><span class="tooltip-term">${item.term}:</span> <span class="tooltip-definition">${item.definition}</span></div>`);
                }
            } else if (tooltipType === 'brumes' && dataSet && Array.isArray(dataSet)) {
                tooltipContentWrapperClass = "tooltip-content-wrapper"; // Add this class for Brumes
                dataSet.forEach(item => contentHtml += `<div><span class="tooltip-term">${item.term}:</span> <span class="tooltip-definition">${item.definition}</span></div>`);
            } else if (dataSet && Array.isArray(dataSet)) {
                dataSet.forEach(item => contentHtml += `<div><span class="tooltip-term">${item.term}:</span> <span class="tooltip-definition">${item.definition}</span></div>`);
            }

            if (!contentHtml) {
                console.warn("Ambre | No content generated for tooltip. Tooltip will not be shown or will be empty.");
                // Optionally, you might want to explicitly hide it if it was somehow visible
                // orbochromatTooltip.hide();
                // currentTooltipTarget = null;
                // return; // Or display a "No data" message in the tooltip
            }

            // Add data-attribute for specific styling, and wrap content if needed
            orbochromatTooltip.attr('data-tooltip-content-type', tooltipType);
            const finalHtml = tooltipContentWrapperClass ? `<div class="${tooltipContentWrapperClass}">${contentHtml}</div>` : contentHtml;
            orbochromatTooltip.html(finalHtml).show();
            
            // --- New Positioning Logic ---
            const sheetBody = this.element.find('.sheet-body');
            // Ensure sheetBody has a positioning context if it doesn't already.
            // Most Foundry sheets have .window-content or .app which are positioned.
            // If sheetBody itself isn't 'relative', 'absolute', or 'fixed', offsets might be tricky.
            // However, jQuery's .offset() is document-relative, which helps.

            const sheetBodyOffset = sheetBody.offset(); // { top, left } of sheetBody relative to document
            const iconOffset = icon.offset();           // { top, left } of icon relative to document

            const tooltipWidth = orbochromatTooltip.outerWidth();
            const tooltipHeight = orbochromatTooltip.outerHeight();
            const iconWidth = icon.outerWidth();
            const iconHeight = icon.outerHeight();

            // Calculate the icon's center relative to the document
            const iconCenterXDoc = iconOffset.left + iconWidth / 2;
            const iconCenterYDoc = iconOffset.top + iconHeight / 2;

            // Calculate tooltip's top-left for it to be centered on the icon's center (document relative)
            let targetTooltipLeftDoc = iconCenterXDoc - tooltipWidth / 2;
            let targetTooltipTopDoc = iconCenterYDoc - tooltipHeight / 2;

            // Convert document-relative coordinates to be relative to sheetBody, accounting for scroll
            let finalLeft = targetTooltipLeftDoc - sheetBodyOffset.left + sheetBody.scrollLeft();
            let finalTop = targetTooltipTopDoc - sheetBodyOffset.top + sheetBody.scrollTop();

            orbochromatTooltip.css({
                top: finalTop + 'px',
                left: finalLeft + 'px',
                transform: 'none' // Remove any previous transform if it was used for screen centering
            });
        });

        // Hide tooltip if clicking anywhere else on the sheet body
        this.element.find('.sheet-body').on('click', function(e) {
            if (!$(e.target).closest('.talent-icon[data-tooltip-type]').length && !$(e.target).closest('.orbochromat-custom-tooltip').length) {
                orbochromatTooltip.hide();
                currentTooltipTarget = null;
            }
        });
        html.find('.clickable-talent-circle').click(this._onTalentCircleClick.bind(this));

        // Listeners for Atout checkboxes
        html.find('.atout-croquis-checkbox').on('change', this._onAtoutCroquisChange.bind(this));
        html.find('.atout-memorized-checkbox').on('change', this._onAtoutMemorizedChange.bind(this));

        // Listener for Puissance counter buttons
        html.find('.puissance-change-btn').click(this._onPuissanceChange.bind(this));
    
    } // End of activateListeners method
    /**
     * Activate drag and drop listeners for the pouvoirs section.
     * @param {jQuery} html The sheet's HTML element.
     * @private
     */
    _activatePouvoirDragDrop(html) {
        const pouvoirsContainer = html.find('.pouvoirs-container-draggable');
        let draggedPouvoirItem = null;

        pouvoirsContainer.find('.pouvoir-block-draggable').each((i, el) => {
            el.setAttribute('draggable', true);

            el.addEventListener('dragstart', (event) => {
                draggedPouvoirItem = event.target.closest('.pouvoir-block-draggable');
                if (!draggedPouvoirItem) return;
                event.dataTransfer.setData('text/plain', draggedPouvoirItem.dataset.pouvoirKey);
                draggedPouvoirItem.classList.add('dragging');
                setTimeout(() => {
                    if (draggedPouvoirItem) $(draggedPouvoirItem).css('opacity', '0.5');
                }, 0);
            });

            el.addEventListener('dragend', () => {
                if (draggedPouvoirItem) {
                    $(draggedPouvoirItem).css('opacity', '1');
                    draggedPouvoirItem.classList.remove('dragging');
                }
                draggedPouvoirItem = null;
                pouvoirsContainer.find('.pouvoir-block-draggable').removeClass('drag-over-before drag-over-after');
            });
        });

        pouvoirsContainer.on('dragover', '.pouvoir-block-draggable', (event) => {
            event.preventDefault();
            event.originalEvent.dataTransfer.dropEffect = 'move';
            
            const targetItem = event.currentTarget;
            if (draggedPouvoirItem && draggedPouvoirItem !== targetItem) {
                const rect = targetItem.getBoundingClientRect();
                const isAfter = (event.originalEvent.clientY - rect.top) > (rect.height / 2);
                
                pouvoirsContainer.find('.pouvoir-block-draggable').removeClass('drag-over-before drag-over-after');
                targetItem.classList.add(isAfter ? 'drag-over-after' : 'drag-over-before');
            }
        });

        pouvoirsContainer.on('dragleave', '.pouvoir-block-draggable', (event) => {
            if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
                 event.currentTarget.classList.remove('drag-over-before', 'drag-over-after');
            } else if (!event.relatedTarget) {
                 event.currentTarget.classList.remove('drag-over-before', 'drag-over-after');
            }
        });

        pouvoirsContainer.on('drop', '.pouvoir-block-draggable', async (event) => {
            event.preventDefault();
            if (!draggedPouvoirItem) return;

            const targetItem = event.currentTarget;
            targetItem.classList.remove('drag-over-before', 'drag-over-after');

            if (draggedPouvoirItem !== targetItem) {
                const rect = targetItem.getBoundingClientRect();
                const isAfter = (event.originalEvent.clientY - rect.top) > (rect.height / 2);

                if (isAfter) {
                    targetItem.parentNode.insertBefore(draggedPouvoirItem, targetItem.nextSibling);
                } else {
                    targetItem.parentNode.insertBefore(draggedPouvoirItem, targetItem);
                }
            }

            const newOrder = Array.from(pouvoirsContainer[0].children)
                                  .map(child => child.dataset.pouvoirKey)
                                  .filter(key => key);

            await this.actor.update({ 'system.pouvoirOrder': newOrder });
        });
    }
     /**
     * Activate drag and drop listeners for possessions sections.
     * Allows reordering sections like Artefacts, Ombres, etc.
     * @param {jQuery} html The sheet's HTML element.
     * @private
     */
    _activatePossessionsDragDrop(html) {
        const possessionsContainer = html.find('.possessions-sections-container');
        let draggedPossessionSection = null;

        possessionsContainer.find('.possessions-section-draggable').each((i, el) => {
            el.setAttribute('draggable', true);

            el.addEventListener('dragstart', (event) => {
                draggedPossessionSection = event.target.closest('.possessions-section-draggable');
                if (!draggedPossessionSection) return;
                event.dataTransfer.setData('text/plain', draggedPossessionSection.dataset.sectionId);
                draggedPossessionSection.classList.add('dragging');
                setTimeout(() => {
                    if (draggedPossessionSection) $(draggedPossessionSection).css('opacity', '0.5');
                }, 0);
            });

            el.addEventListener('dragend', () => {
                if (draggedPossessionSection) {
                    $(draggedPossessionSection).css('opacity', '1');
                    draggedPossessionSection.classList.remove('dragging');
                }
                draggedPossessionSection = null;
                possessionsContainer.find('.possessions-section-draggable').removeClass('drag-over-before drag-over-after');
            });
        });

        possessionsContainer.on('dragover', '.possessions-section-draggable', (event) => {
            event.preventDefault();
            event.originalEvent.dataTransfer.dropEffect = 'move';
            const targetItem = event.currentTarget;
            possessionsContainer.find('.possessions-section-draggable').removeClass('drag-over-before drag-over-after');
            const isAfter = (event.originalEvent.clientY - targetItem.getBoundingClientRect().top) > (targetItem.offsetHeight / 2);
            targetItem.classList.add(isAfter ? 'drag-over-after' : 'drag-over-before');
        });

        possessionsContainer.on('dragleave', '.possessions-section-draggable', (event) => {
             if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) {
                 event.currentTarget.classList.remove('drag-over-before', 'drag-over-after');
            } else if (!event.relatedTarget) {
                 event.currentTarget.classList.remove('drag-over-before', 'drag-over-after');
            }
        }); // End of 'dragleave'

        possessionsContainer.on('drop', '.possessions-section-draggable', async (event) => {
            event.preventDefault();
            if (!draggedPossessionSection) return;

            const targetItem = event.currentTarget;
            targetItem.classList.remove('drag-over-before', 'drag-over-after');

            if (draggedPossessionSection !== targetItem) {
                const isAfter = (event.originalEvent.clientY - targetItem.getBoundingClientRect().top) > (targetItem.offsetHeight / 2);
                targetItem.parentNode.insertBefore(draggedPossessionSection, isAfter ? targetItem.nextSibling : targetItem);
            }
            // Get the new order from the reordered DOM elements
            const newOrder = Array.from(possessionsContainer[0].children)
                                  .map(child => child.dataset.sectionId)
                                  .filter(id => id); // Filter out undefined if any non-section children exist
            await this.actor.update({ 'system.possessionsOrder': newOrder });
        }); // End of 'drop'
    } // End of _activatePossessionsDragDrop

    /**
     * Handles the display of "Voies Secrètes" elements.
     * @param {string} pouvoirType - The type of pouvoir (e.g., "marelle", "logrus").
     * @param {jQuery} buttonElement - The jQuery object for the clicked button.
     */
    displayVSElement(pouvoirType, buttonElement) {
        const sheetHtml = this.element; // Get the full sheet HTML (jQuery object)
        const vsSection = sheetHtml.find(`.pouvoir-section[data-pouvoir-type="${pouvoirType}"] .voies-secretes-section[data-pouvoir-type="${pouvoirType}"]`);

        if (vsSection.length) {
            const isCurrentlyVisible = vsSection.is(":visible"); // Check state *before* toggling
            vsSection.slideToggle(200); // jQuery's slideToggle for a nice animation (200ms duration)
            
            const buttonTextSpan = buttonElement.find('.btn-text');
            if (isCurrentlyVisible) { // If it was visible, it's now being hidden
                buttonTextSpan.text("Dévoiler Voies Secrètes");
            } else { // If it was hidden, it's now being shown
                buttonTextSpan.text("Cacher Voies Secrètes");
            }
        } else {
            console.warn(`Ambre | Voies Secrètes section for ${pouvoirType} not found.`);
            ui.notifications.warn(`Section des Voies Secrètes pour ${pouvoirType} non trouvée.`);
        }
    }


    /**
     * Handle clicking a toggleable tab title to show/hide its content.
     * @param {Event} event The click event.
     * @private
     */
    _onToggleTabContent(event) {
        event.preventDefault();
        const titleElement = $(event.currentTarget);
        // Use 'data-tab-target' to match the attribute in caracteristiques.hbs for Avantages
        const targetContentId = titleElement.data('tab-target') || titleElement.data('toggles'); 
        if (targetContentId) {
            const contentElement = this.element.find(`#${targetContentId}`);
            contentElement.slideToggle(200); // Uses jQuery's slideToggle for a smooth animation
            titleElement.toggleClass('active'); // Optional: add an active class to the title for styling

            // If this is the caracteristiques section, update its state for persistence
            if (targetContentId === 'caracteristiques-content-area') {
                if (!this._uiState) this._uiState = {};
                // The state is initialized in getData, so we can just toggle it.
                this._uiState.caracteristiquesExpanded = !this._uiState.caracteristiquesExpanded;
            }

            // If this is the avantages section, update its state for persistence
            if (targetContentId === 'avantages-content-area') {
                if (!this._uiState) this._uiState = {};
                // The state is initialized in getData, so we can just toggle it.
                this._uiState.avantagesExpanded = !this._uiState.avantagesExpanded;
            }
            // Handle new possessions sections
            if (targetContentId === 'ingredient-content-area') {
                if (!this._uiState) this._uiState = {};
                this._uiState.ingredientExpanded = !this._uiState.ingredientExpanded;
            }
            if (targetContentId === 'artefactabyssal-content-area') {
                if (!this._uiState) this._uiState = {};
                this._uiState.artefactabyssalExpanded = !this._uiState.artefactabyssalExpanded;
            }
            if (targetContentId === 'catalyseur-content-area') {
                if (!this._uiState) this._uiState = {};
                this._uiState.catalyseurExpanded = !this._uiState.catalyseurExpanded;
            }
            if (targetContentId === 'miroir-content-area') {
                if (!this._uiState) this._uiState = {};
                this._uiState.miroirExpanded = !this._uiState.miroirExpanded;
            }
            if (targetContentId === 'receptacle-content-area') {
                if (!this._uiState) this._uiState = {};
                this._uiState.receptacleExpanded = !this._uiState.receptacleExpanded;
            }
            if (targetContentId === 'rune-content-area') {
                if (!this._uiState) this._uiState = {};
                this._uiState.runeExpanded = !this._uiState.runeExpanded;
            }
            if (targetContentId === 'sortilege-content-area') {
                if (!this._uiState) this._uiState = {};
                this._uiState.sortilegeExpanded = !this._uiState.sortilegeExpanded;
            }
            // Note: 'sortilege' is not typically a directly possessed item type in the same way,
            // it's usually linked to other items or powers. If you intend to have a direct
            // drop zone for 'sortilege' items, you'd add a similar block here.
            // For now, I've included it in the _onDropItem generic handler, but not as a collapsible section.

        }
    }
    
    // Make sure to add listeners for '.contribution-input' if you want live updates
    // without relying solely on the sheet's default submit-on-change for input fields.

     /**
     * Handle clicking the edit button for an owned item.
     * @param {Event} event The click event.
     * @private
     */
    _onItemEdit(event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const itemId = button.parents('.item').data('item-id');
        const item = this.actor.items.get(itemId);
        if (item) {
            item.sheet.render(true);
        }
    }

    /**
     * Handle clicking an item's name to open its sheet.
     * @param {Event} event The click event.
     * @private
     */
    _onItemNameClick(event) {
        event.preventDefault();
        const target = $(event.currentTarget);
        const itemId = target.closest('.item').data('item-id');
        if (!itemId) return;
        const item = this.actor.items.get(itemId);
        if (item) {
            item.sheet.render(true);
        }
    }

    /**
     * Handle clicking the delete button for an owned item.
     * @param {Event} event The click event.
     * @private
     */
    async _onItemDelete(event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const itemId = button.parents('.item').data('item-id');
        await this.actor.deleteEmbeddedDocuments('Item', [itemId]);
    }

    /**
     * Handle clicking the create button for a new item in a possession group.
     * @param {Event} event The click event.
     * @private
     */
    async _onItemCreateClick(event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const itemType = button.data('item-type'); // This should be "artefact", "ombre", "atout", etc.
        // console.log(`Ambre | _onItemCreateClick: Button clicked. Attempting to create item of type: "${itemType}"`);

        if (!itemType) {
            console.error("Ambre | No item type specified for creation.");
            return;
        }
        // Prepare basic data for the new item
        const newItemData = {
            name: `Nouveau ${itemType.charAt(0).toUpperCase() + itemType.slice(1)}`, // e.g., "New Artefact"
            type: itemType,
            // You can add default system data here if needed, e.g.,
            // system: { /* default properties for this item type */ }
        };

        // Create the item directly on the actor
        await this.actor.createEmbeddedDocuments("Item", [newItemData]);
        // The sheet should re-render automatically due to the actor update.
    }

    /**
     * Handle creating a new standard JournalEntry and linking it to the actor.
     * @param {Event} event The click event.
     * @private
     */
    async _onCreateStandardJournal(event) {
        event.preventDefault();
        if (!this.actor.isOwner) return;

        try {
            const journalData = {
                name: `Journal de ${this.actor.name} - Nouveau`,
                folder: this.actor.folder ? this.actor.folder.id : null // Optional: place in actor's folder
            };
            const newJournal = await JournalEntry.create(journalData, {renderSheet: true});
            if (newJournal) {
                const currentUUIDs = this.actor.system.linkedJournalUUIDs || [];
                const newUUIDs = [...currentUUIDs, newJournal.uuid];
                await this.actor.update({"system.linkedJournalUUIDs": newUUIDs});
                ui.notifications.info(`Nouveau journal "${newJournal.name}" créé et lié.`);
            }
        } catch (err) {
            console.error("Ambre | Error creating new journal entry:", err);
            ui.notifications.error("Erreur lors de la création du journal.");
        }
    }

    /**
     * Handle editing a linked standard JournalEntry.
     * @param {Event} event The click event.
     * @private
     */
    async _onEditStandardJournal(event) {
        event.preventDefault();
        const journalUuid = $(event.currentTarget).closest('.journal-list-item').data('journal-uuid');
        const journal = await fromUuid(journalUuid);
        if (journal) {
            journal.sheet.render(true);
        }
    }

    /**
     * Handle deleting a linked standard JournalEntry (and unlinking it).
     * @param {Event} event The click event.
     * @private
     */
    async _onDeleteStandardJournal(event) {
        event.preventDefault();
        if (!this.actor.isOwner) return;
        const journalUuid = $(event.currentTarget).closest('.journal-list-item').data('journal-uuid');
        const journal = await fromUuid(journalUuid);
        if (journal) {
            // Optional: Confirm before deleting the actual JournalEntry
            // await journal.delete(); // Uncomment to delete the journal itself
            // Unlink from actor
            const currentUUIDs = this.actor.system.linkedJournalUUIDs || [];
            const newUUIDs = currentUUIDs.filter(uuid => uuid !== journalUuid);
            await this.actor.update({"system.linkedJournalUUIDs": newUUIDs});
            ui.notifications.info(`Journal "${journal.name}" délié (et/ou supprimé).`);
        }
    }

    /**
     * Handle initializing a pouvoir
     * @param {Event} event - The click event
     * @private
     */
    _onInitializePouvoir(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const pouvoirType = button.dataset.pouvoirType;
        
        // Initialize the pouvoir with default values
        this.actor.update({
            [`system.${pouvoirType}`]: {
                value: 0,
                niveau: "Aucun",
                showCapacites: false // Assuming this should be part of the actor data for pouvoirs
            }
        });
        
        ui.notifications.info(`${getPouvoirLabel(pouvoirType)} initialisé.`);
    }

    async _onInitCompetences(event) {
        event.preventDefault();
        try {
            const defaultCompetences = getDefaultCompetences();
            
            await this.actor.update({
                "system.competences": defaultCompetences
            });
            
            // Re-render the sheet
            this.render(false);
        } catch (error) {
            console.error("Ambre | Failed to initialize competences:", error);
            ui.notifications.error('Erreur lors de l\'initialisation des compétences');
        }
    }

    _onToggleDescription(event) {
        event.preventDefault();
        const label = event.currentTarget;
        const descriptionId = label.dataset.description;
        const descriptionElement = document.getElementById(`desc-${descriptionId}`);
        
        if (!descriptionElement) return;
        
        const isVisible = descriptionElement.style.display !== 'none';
        
        if (isVisible) {
            // Hide description
            descriptionElement.classList.add('hiding');
            label.classList.remove('active');
            
            setTimeout(() => {
                descriptionElement.style.display = 'none';
                descriptionElement.classList.remove('hiding');
            }, 300);
        } else {
            // Show description
            descriptionElement.style.display = 'block';
            label.classList.add('active');
        }
    }

    _onThemeChange(event) {
        const selectedTheme = event.currentTarget.value;
        const html = this.element;
        
        // Update the actor data
        this.actor.update({
            'system.selectedtheme': selectedTheme
        });
        
        // Apply the theme immediately
        this._applyTheme(html, selectedTheme);
    }

    _applyCurrentTheme(html) {
        const currentTheme = this.actor.system.selectedtheme || 'defaut';
        this._applyTheme(html, currentTheme);

        // Apply header text color style
        const currentHeaderColor = this.actor.system.options?.headerTextColor || 'defaut';
        this._applyHeaderTextColor(html, currentHeaderColor);

        // Apply Atout Style to the actor sheet and relevant item sheets
        this._applyAtoutStyleToSheets();
    }

    _applyTheme(html, themeName) {
        const actorElement = html.closest('.actor');
        
        // Remove all existing theme classes
        const themeClasses = [
            'theme-defaut', 'theme-marelle', 'theme-logrus', 'theme-atouts',
            'theme-metamorphose', 'theme-pentacre', 'theme-coeurflamme',
            'theme-orbochromat', 'theme-abreuvoir', 'theme-harmonium',
            'theme-chimerion', 'theme-sabliers', 'theme-abysses', 'theme-magie'
        ];
        
        themeClasses.forEach(className => {
            actorElement.removeClass(className);
        });
        
        // Add the new theme class
        if (themeName && themeName !== '') {
            actorElement.addClass(`theme-${themeName}`);
        }
    };

    /**
     * Handle changes to the header text color selection.
     * @param {Event} event The change event.
     * @private
     */
    _onHeaderTextColorChange(event) {
        const selectedColor = event.currentTarget.value;
        const html = this.element;
        
        this.actor.update({
            'system.options.headerTextColor': selectedColor
        });
        
        this._applyHeaderTextColor(html, selectedColor);
    }

    /**
     * Applies the correct CSS class to the sheet for header text color.
     * @param {jQuery} html The sheet's HTML element.
     * @param {string} colorName The name of the color style ('defaut', 'sombre', 'lumineux').
     * @private
     */
    _applyHeaderTextColor(html, colorName) {
        const actorElement = html.closest('.actor');
        // Remove all existing header color classes
        actorElement.removeClass('header-text-defaut header-text-sombre header-text-lumineux');
        // Add the new theme class
        if (colorName) actorElement.addClass(`header-text-${colorName}`);
    }

     /**
     * Apply the actor's current atout style to the actor sheet and any open
     * Atout item sheets belonging to this actor, respecting item overrides.
     * @private
     */
    _applyAtoutStyleToSheets() {
        const currentAtoutStyle = this.actor.system.atoutStyle || ''; // Ensure atoutStyle exists in template.json if used
        const actorElement = this.element.closest('.actor');

        // Remove previous atout style classes from the actor sheet
        actorElement.removeClass((index, className) => (className.match(/(^|\s)atout-style-\S+/g) || []).join(' '));
        // Add the new atout style class to the actor sheet if one is selected
        if (currentAtoutStyle) {
            actorElement.addClass(`atout-style-${currentAtoutStyle}`);
        }

        // Find all open sheets
        Object.values(ui.windows).forEach(sheet => {
            // Check if it's an Atout item sheet belonging to this actor
            if (sheet.object?.type === 'atout' && sheet.object.actor?.id === this.actor.id) {
                const itemElement = sheet.element.closest('.item-sheet');
                // Remove previous atout style classes from the item sheet
                itemElement.removeClass((index, className) => (className.match(/(^|\s)atout-style-\S+/g) || []).join(' '));
                // Apply actor's style ONLY if the item doesn't have its own override
                if (currentAtoutStyle && !sheet.object.system.overrideAtoutStyle) { // Ensure overrideAtoutStyle exists on item
                    itemElement.addClass(`atout-style-${currentAtoutStyle}`);
                }
            }
        });
    }

    async _onComponentChange(statType, event) {
        const html = this.element;
        let updateData = {};
        let calculatedValue = 0;

        // Helper function to safely parse and clamp numbers
        const safeParseInt = (value, min = 0, max = 999) => {
            const parsed = parseInt(value) || 0;
            return Math.max(min, Math.min(max, parsed));
        };
        
        switch(statType) {
            case 'physique':
                const force = safeParseInt(html.find('input[name="system.force"]').val());
                const tempBonusForce = safeParseInt(html.find('input[name="system.temporarybonusforce"]').val());
                const force_display = force + tempBonusForce;

                const dexterite = safeParseInt(html.find('input[name="system.dexterite"]').val()); // Renamed from dexterite_base
                const tempBonusDexterite = safeParseInt(html.find('input[name="system.temporarybonusdexterite"]').val());
                const dexterite_display = dexterite + tempBonusDexterite;

                const reflexe = safeParseInt(html.find('input[name="system.reflexe"]').val()); // Renamed from reflexe_base
                const tempBonusReflexe = safeParseInt(html.find('input[name="system.temporarybonusreflexe"]').val());
                const reflexe_display = reflexe + tempBonusReflexe;

                const tempBonusPhysique = safeParseInt(html.find('input[name="system.temporarybonusphysique"]').val());
                calculatedValue = Math.round((force_display + dexterite_display + reflexe_display) / 3) + tempBonusPhysique;
                
                // Update the major stat display field
                html.find('input[name="system.physique"]').val(calculatedValue);

                // Update individual display fields
                html.find('input[name="system.force"]').val(force);
                html.find('input[name="system.temporarybonusforce"]').val(tempBonusForce);
                html.find('input[name="system.force_display"]').val(force_display);

                html.find('input[name="system.dexterite"]').val(dexterite);
                html.find('input[name="system.temporarybonusdexterite"]').val(tempBonusDexterite);
                html.find('input[name="system.dexterite_display"]').val(dexterite_display);

                html.find('input[name="system.reflexe"]').val(reflexe);
                html.find('input[name="system.temporarybonusreflexe"]').val(tempBonusReflexe);
                html.find('input[name="system.reflexe_display"]').val(reflexe_display);
                
                updateData = {
                    'system.force': force,
                    'system.temporarybonusforce': tempBonusForce,
                    'system.force_display': force_display,
                    'system.dexterite': dexterite,
                    'system.temporarybonusdexterite': tempBonusDexterite,
                    'system.dexterite_display': dexterite_display,
                    'system.reflexe': reflexe,
                    'system.temporarybonusreflexe': tempBonusReflexe,
                    'system.reflexe_display': reflexe_display,
                    'system.physique': calculatedValue
                };
                break;
                
            case 'endurance':
                const adaptation = safeParseInt(html.find('input[name="system.adaptation"]').val());
                const tempBonusAdaptation = safeParseInt(html.find('input[name="system.temporarybonusadaptation"]').val());
                const adaptation_display = adaptation + tempBonusAdaptation;

                const regeneration = safeParseInt(html.find('input[name="system.regeneration"]').val());
                const tempBonusRegeneration = safeParseInt(html.find('input[name="system.temporarybonusregeneration"]').val());
                const regeneration_display = regeneration + tempBonusRegeneration;

                const resistance = safeParseInt(html.find('input[name="system.resistance"]').val());
                const tempBonusResistance = safeParseInt(html.find('input[name="system.temporarybonusresistance"]').val());
                const resistance_display = resistance + tempBonusResistance;

                const tempBonusEndurance = safeParseInt(html.find('input[name="system.temporarybonusendurance"]').val());
                calculatedValue = Math.round((adaptation_display + regeneration_display + resistance_display) / 3) + tempBonusEndurance;
                
                // Update the major stat display field
                html.find('input[name="system.endurance"]').val(calculatedValue);

                html.find('input[name="system.adaptation"]').val(adaptation);
                html.find('input[name="system.temporarybonusadaptation"]').val(tempBonusAdaptation);
                html.find('input[name="system.adaptation_display"]').val(adaptation_display);

                html.find('input[name="system.regeneration"]').val(regeneration);
                html.find('input[name="system.temporarybonusregeneration"]').val(tempBonusRegeneration);
                html.find('input[name="system.regeneration_display"]').val(regeneration_display);

                html.find('input[name="system.resistance"]').val(resistance);
                html.find('input[name="system.temporarybonusresistance"]').val(tempBonusResistance);
                html.find('input[name="system.resistance_display"]').val(resistance_display);
                
                updateData = {
                    'system.adaptation': adaptation,
                    'system.temporarybonusadaptation': tempBonusAdaptation,
                    'system.adaptation_display': adaptation_display,
                    'system.regeneration': regeneration,
                    'system.temporarybonusregeneration': tempBonusRegeneration,
                    'system.regeneration_display': regeneration_display,
                    'system.resistance': resistance,
                    'system.temporarybonusresistance': tempBonusResistance,
                    'system.resistance_display': resistance_display,
                    'system.endurance': calculatedValue
                };
                break;
                
            case 'psyche':
                const intelligence = safeParseInt(html.find('input[name="system.intelligence"]').val());
                const tempBonusIntelligence = safeParseInt(html.find('input[name="system.temporarybonusintelligence"]').val());
                const intelligence_display = intelligence + tempBonusIntelligence;

                const concentration = safeParseInt(html.find('input[name="system.concentration"]').val());
                const tempBonusConcentration = safeParseInt(html.find('input[name="system.temporarybonusconcentration"]').val());
                const concentration_display = concentration + tempBonusConcentration;

                const volonte = safeParseInt(html.find('input[name="system.volonte"]').val());
                const tempBonusVolonte = safeParseInt(html.find('input[name="system.temporarybonusvolonte"]').val());
                const volonte_display = volonte + tempBonusVolonte;

                const tempBonusPsyche = safeParseInt(html.find('input[name="system.temporarybonuspsyche"]').val());
                calculatedValue = Math.round((intelligence_display + concentration_display + volonte_display) / 3) + tempBonusPsyche;
                
                // Update the major stat display field
                html.find('input[name="system.psyche"]').val(calculatedValue);

                html.find('input[name="system.intelligence"]').val(intelligence);
                html.find('input[name="system.temporarybonusintelligence"]').val(tempBonusIntelligence);
                html.find('input[name="system.intelligence_display"]').val(intelligence_display);

                html.find('input[name="system.concentration"]').val(concentration);
                html.find('input[name="system.temporarybonusconcentration"]').val(tempBonusConcentration);
                html.find('input[name="system.concentration_display"]').val(concentration_display);

                html.find('input[name="system.volonte"]').val(volonte);
                html.find('input[name="system.temporarybonusvolonte"]').val(tempBonusVolonte);
                html.find('input[name="system.volonte_display"]').val(volonte_display);
                
                updateData = {
                    'system.intelligence': intelligence,
                    'system.temporarybonusintelligence': tempBonusIntelligence,
                    'system.concentration': concentration,
                    'system.temporarybonusconcentration': tempBonusConcentration,
                    'system.volonte': volonte,
                    'system.temporarybonusvolonte': tempBonusVolonte,
                    'system.volonte_display': volonte_display,
                    'system.psyche': calculatedValue
                };
                break;
                
            case 'perception':
                const sens = safeParseInt(html.find('input[name="system.sens"]').val());
                const tempBonusSens = safeParseInt(html.find('input[name="system.temporarybonussens"]').val());
                const sens_display = sens + tempBonusSens;

                const sixiemesens = safeParseInt(html.find('input[name="system.sixiemesens"]').val());
                const tempBonusSixiemesens = safeParseInt(html.find('input[name="system.temporarybonussixiemesens"]').val());
                const sixiemesens_display = sixiemesens + tempBonusSixiemesens;

                const empathie = safeParseInt(html.find('input[name="system.empathie"]').val());
                const tempBonusEmpathie = safeParseInt(html.find('input[name="system.temporarybonusempathie"]').val());
                const empathie_display = empathie + tempBonusEmpathie;

                const tempBonusPerception = safeParseInt(html.find('input[name="system.temporarybonusperception"]').val());
                calculatedValue = Math.round((sens_display + sixiemesens_display + empathie_display) / 3) + tempBonusPerception;
                
                // Update the major stat display field
                html.find('input[name="system.perception"]').val(calculatedValue);

                html.find('input[name="system.sens"]').val(sens);
                html.find('input[name="system.temporarybonussens"]').val(tempBonusSens);
                html.find('input[name="system.sens_display"]').val(sens_display);

                html.find('input[name="system.sixiemesens"]').val(sixiemesens);
                html.find('input[name="system.temporarybonussixiemesens"]').val(tempBonusSixiemesens);
                html.find('input[name="system.sixiemesens_display"]').val(sixiemesens_display);

                html.find('input[name="system.empathie"]').val(empathie);
                html.find('input[name="system.temporarybonusempathie"]').val(tempBonusEmpathie);
                html.find('input[name="system.empathie_display"]').val(empathie_display);
                
                updateData = {
                    'system.sens': sens,
                    'system.temporarybonussens': tempBonusSens,
                    'system.sens_display': sens_display,
                    'system.sixiemesens': sixiemesens,
                    'system.temporarybonussixiemesens': tempBonusSixiemesens,
                    'system.sixiemesens_display': sixiemesens_display,
                    'system.empathie': empathie,
                    'system.temporarybonusempathie': tempBonusEmpathie,
                    'system.empathie_display': empathie_display,
                    'system.perception': calculatedValue
                };
                break;
                
            case 'charisme':
                const apparence = safeParseInt(html.find('input[name="system.apparence"]').val());
                const tempBonusApparence = safeParseInt(html.find('input[name="system.temporarybonusapparence"]').val());
                const apparence_display = apparence + tempBonusApparence;

                const intimidation = safeParseInt(html.find('input[name="system.intimidation"]').val());
                const tempBonusIntimidation = safeParseInt(html.find('input[name="system.temporarybonusintimidation"]').val());
                const intimidation_display = intimidation + tempBonusIntimidation;

                const eloquence = safeParseInt(html.find('input[name="system.eloquence"]').val());
                const tempBonusEloquence = safeParseInt(html.find('input[name="system.temporarybonuseloquence"]').val());
                const eloquence_display = eloquence + tempBonusEloquence;

                const tempBonusCharisme = safeParseInt(html.find('input[name="system.temporarybonuscharisme"]').val());
                calculatedValue = Math.round((apparence_display + intimidation_display + eloquence_display) / 3) + tempBonusCharisme;
                
                // Update the major stat display field
                html.find('input[name="system.charisme"]').val(calculatedValue);

                html.find('input[name="system.apparence"]').val(apparence);
                html.find('input[name="system.temporarybonusapparence"]').val(tempBonusApparence);
                html.find('input[name="system.apparence_display"]').val(apparence_display);

                html.find('input[name="system.intimidation"]').val(intimidation);
                html.find('input[name="system.temporarybonusintimidation"]').val(tempBonusIntimidation);
                html.find('input[name="system.intimidation_display"]').val(intimidation_display);

                html.find('input[name="system.eloquence"]').val(eloquence);
                html.find('input[name="system.temporarybonuseloquence"]').val(tempBonusEloquence);
                html.find('input[name="system.eloquence_display"]').val(eloquence_display);
                
                updateData = {
                    'system.apparence': apparence,
                    'system.temporarybonusapparence': tempBonusApparence,
                    'system.intimidation': intimidation,
                    'system.temporarybonusintimidation': tempBonusIntimidation,
                    'system.eloquence': eloquence,
                    'system.temporarybonuseloquence': tempBonusEloquence,
                    'system.eloquence_display': eloquence_display,
                    'system.charisme': calculatedValue
                };
                break;
            
            case 'karma':
                // Get value from the event target
                const rawKarmaValue = event.currentTarget.value;
                const karma = safeParseInt(rawKarmaValue, -15, 15);
                const ptskarma = ((rawKarmaValue === "" || rawKarmaValue === "-") ? 0 : karma) * 2; // Handle intermediate empty/negative sign state for calculation
                
                // DO NOT set html.find('input[name="system.karma"]').val(karma); here.
                // Let Foundry's data binding update the input field after actor update.
                updateData = {
                    'system.karma': karma
                }; // Remove ptskarma calculation here
                break;
        }
        
        // The major stat display fields (system.physique, system.endurance, etc.)
        // are now updated within their respective switch cases above.
        // This avoids misapplying 'calculatedValue' to the 'karma' input.
        
        // Update the actor data without triggering a full re-render
        await this._updateActorDataSilently(updateData);

        // If karma was changed, update its input position
        if (statType === 'karma') this._updateKarmaInputPosition(html);
  }

    /**
     * Handle changes to the temporary bonus input of a major characteristic.
     * @param {Event} event The input or change event.
     * @private
     */
    async _onMajorStatTempBonusChange(event) {
        const inputElement = event.currentTarget;
        const fieldName = inputElement.name; // e.g., "system.temporarybonusphysique"
        const tempBonusValue = parseInt(inputElement.value) || 0;

        // Determine which major stat this temporary bonus belongs to
        // e.g., "system.temporarybonusphysique" -> "physique"
        const majorStatName = fieldName.replace("system.temporarybonus", "").toLowerCase();

        // Prepare update data for the temporary bonus field itself
        let updateData = { [fieldName]: tempBonusValue };

        await this.actor.update(updateData); // Update the temp bonus first
        this._onComponentChange(majorStatName, event); // Then trigger recalculation of the major stat
    }

    /**
     * Generic handler for numeric input changes that need sanitization.
     * @param {Event} event The input or change event.
     * @private
     */
    async _onGenericNumericInputChange(event) {
        const inputElement = event.currentTarget;
        const fieldName = inputElement.name;
        let value = inputElement.value;

        // Replace comma with period for decimal, then parse
        value = value.replace(',', '.');
        let parsedValue = parseFloat(value);

        if (isNaN(parsedValue)) {
            parsedValue = 0; // Default to 0 if parsing fails
        }

        parsedValue = Math.max(0, parsedValue);

        await this.actor.update({ [fieldName]: parsedValue });
    }
    async _updateActorDataSilently(updateData) {
        // Update the actor data without triggering a re-render
        await this.actor.update(updateData, { render: false });
        
        // Update the internal data to keep it in sync
        foundry.utils.mergeObject(this.actor.system, updateData.system || foundry.utils.getProperty(updateData, "system") || {});
    }
    _restoreCurrentTab(html) {
        // Activate the current tab
        html.find('.sheet-navigation-tab').removeClass('active');
        html.find('.tab').removeClass('active');
        
        html.find(`.sheet-navigation-tab[data-tab="${this.currentTab}"]`).addClass('active');
        html.find(`.tab[data-tab="${this.currentTab}"]`).addClass('active');
    }

    _onTabClick(event) {
        event.preventDefault();
        const tab = event.currentTarget.dataset.tab;
        this.currentTab = tab;
        
        // Handle tab switching manually
        const html = this.element;
        html.find('.sheet-navigation-tab').removeClass('active');
        html.find('.tab').removeClass('active');
        
        event.currentTarget.classList.add('active');
        html.find(`.tab[data-tab="${tab}"]`).addClass('active');
    }

    _onEditorEditClick(event) {
        event.preventDefault();
        const container = $(event.currentTarget).closest('.editor-container');
        const fieldPath = container.data('edit-container');
        if (!fieldPath) return;
        const displayDiv = container.find('.editor-display');
        const editDiv = container.find('.editor-edit');
        
        // Store original content for cancel functionality
        if (!this._originalEditorContent) this._originalEditorContent = {};
        this._originalEditorContent[fieldPath] = foundry.utils.getProperty(this.actor, fieldPath);
        
        // Switch to edit mode
        displayDiv.hide();
        editDiv.show();
        
        // Focus on the editor
        setTimeout(() => {
            const editor = editDiv.find(`[data-edit="${fieldPath}"]`);
            if (editor.length) {
                const tinymceEditor = tinymce.get(editor.attr('id'));
                if (tinymceEditor) {
                    tinymceEditor.focus();
                } else {
                    editor.focus();
                }
            }
        }, 100);
    }

    async _onEditorSave(event) {
        event.preventDefault();
        const container = $(event.currentTarget).closest('.editor-container');
        const fieldPath = container.data('edit-container');
        if (!fieldPath) return;
const displayDiv = container.find('.editor-display');
        const editDiv = container.find('.editor-edit');
        
        // Get the editor content
        const editorContentElement = editDiv.find(`[data-edit="${fieldPath}"]`);
        let newContent = '';
        
        if (editorContentElement.length) {
            const editorId = editorContentElement.attr('id');
            if (window.tinymce && editorId && window.tinymce.get(editorId)) {
                newContent = window.tinymce.get(editorId).getContent();
            } else {
                // Fallback for plain textarea or div if TinyMCE not found or not initialized on this element
                newContent = editorContentElement.val() || editorContentElement.html();
            }
        }
        
        // Update the actor data
        await this.actor.update({ [fieldPath]: newContent });
        editDiv.hide();
        displayDiv.show();
        
        // Clear stored original content
        if (this._originalEditorContent) {
            this._originalEditorContent[fieldPath] = null;
        }
    }

    _onEditorCancel(event) {
        event.preventDefault();
        const container = $(event.currentTarget).closest('.editor-container');
        const fieldPath = container.data('edit-container');
        if (!fieldPath) return;

        const displayDiv = container.find('.editor-display');
        const editDiv = container.find('.editor-edit');
        
        // Restore original content if available
        if (this._originalEditorContent && this._originalEditorContent[fieldPath] !== null) {
            const editorContentElement = editDiv.find(`[data-edit="${fieldPath}"]`);
            if (editorContentElement.length) {
                const editorId = editorContentElement.attr('id');
                if (window.tinymce && editorId && window.tinymce.get(editorId)) {
                    window.tinymce.get(editorId).setContent(this._originalEditorContent[fieldPath]);
                } else {
                    editorContentElement.val(this._originalEditorContent[fieldPath]);
                }
            }
        }
        
        // Switch back to display mode
        editDiv.hide();
        displayDiv.show();
        
        // Clear stored original content
        if (this._originalEditorContent) {
            this._originalEditorContent[fieldPath] = null;
        }
    
    }

    /**
     * Calculate the sum of competence values
     * @param {Object} system - The actor's system data
     * @param {Object} options - Options for the calculation
     * @param {boolean} options.activeOnly - Only count active competences (default: false)
     * @param {boolean} options.includeSpecialites - Include specialite bonus (default: false)
     * @param {Array} options.excludeCompetences - Array of competence keys to exclude
     * @param {Array} options.includeOnly - Array of competence keys to include (if specified, only these will be counted)
     * @returns {Object} - Object containing various sums and details
     */
    _calculateCompetenceSum(system, options = {}) {
        // Default options
        const opts = {
            activeOnly: options.activeOnly || false,
            includeSpecialites: options.includeSpecialites || false,
            excludeCompetences: options.excludeCompetences || [],
            includeOnly: options.includeOnly || null,
        };
        
        // console.log('Options:', opts);
        
        // Safety check
        if (!system || !system.competences) {
            console.warn('No competences found in system for sum calculation');
            return {
                totalValue: 0,
                totalWithCharacteristics: 0,
                totalWithHalf: 0,
                activeCount: 0,
                totalCount: 0,
                competenceDetails: []
            };
        }
        
        let totalValue = 0;
        let totalWithCharacteristics = 0;
        let totalWithHalf = 0;
        let activeCount = 0;
        let totalCount = 0;
        const competenceDetails = [];
        
        Object.entries(system.competences).forEach(([compKey, competence]) => {
            if (!competence || typeof competence !== 'object') {
                return;
            }
            
            if (opts.excludeCompetences.includes(compKey)) return;
            if (opts.includeOnly && !opts.includeOnly.includes(compKey)) return;
            if (opts.activeOnly && !competence.active) return;
            
            const competenceValue = competence.value || 0;
            const caracteristiqueValue = system[competence.caracteristique] || 0;
            const halfValue = Math.floor(competenceValue / 2);
            const isActive = competence.active || false;
            
            const competenceTotal = competenceValue + caracteristiqueValue + halfValue;
            
            let specialiteBonus = 0;
            if (opts.includeSpecialites && competence.specialite && competence.specialite !== "") { // Check if specialite is selected
                specialiteBonus = 10; 
            }
            
            totalValue += competenceValue;
            totalWithCharacteristics += competenceValue + caracteristiqueValue;
            totalWithHalf += competenceTotal + specialiteBonus;
            
            if (isActive) activeCount++;
            totalCount++;
            
            competenceDetails.push({
                key: compKey,
                label: competence.label || compKey,
                value: competenceValue,
                caracteristique: competence.caracteristique,
                caracteristiqueValue: caracteristiqueValue,
                halfValue: halfValue,
                specialite: competence.specialite || '',
                specialiteBonus: specialiteBonus,
                total: competenceTotal + specialiteBonus,
                active: isActive
            });
        });
        
        const result = {
            totalValue: totalValue,
            totalWithCharacteristics: totalWithCharacteristics,
            totalWithHalf: totalWithHalf,
            activeCount: activeCount,
            totalCount: totalCount,
            competenceDetails: competenceDetails,
            averageValue: totalCount > 0 ? Math.round(totalValue / totalCount) : 0,
            averageTotal: totalCount > 0 ? Math.round(totalWithHalf / totalCount) : 0
        };
        
        // console.log('Competence sum result:', result);
        return result;
    };


    /**
     * Handle changing the header banner image.
     * @param {number} direction -1 for previous, 1 for next.
     * @param {Event} event The click event.
     * @private
     */
    async _onChangeBanner(direction, event) {
        event.preventDefault();
        let currentBanner = parseInt(this.actor.system.headerBannerNumber) || 1;
        const maxBanners = 14; // Total number of banners

        currentBanner += direction;

        if (currentBanner < 1) {
            currentBanner = maxBanners; // Loop to last banner
        } else if (currentBanner > maxBanners) {
            currentBanner = 1; // Loop to first banner
        }

        // Update actor data without re-rendering the sheet
        await this.actor.update({ "system.headerBannerNumber": currentBanner }, { render: false });

        // Manually update the DOM
        const newBannerSrc = `systems/ambre/assets/artwork/banners/banner${currentBanner}.png`;
        this.element.find('.header-banner').attr('src', newBannerSrc);
        this.element.find('.banner-number-display').text(`Bannière ${currentBanner}`);
    }

    /**
     * Handle changing the decorum style.
     * @param {number} direction -1 for previous, 1 for next.
     * @param {Event} event The click event.
     * @private
     */
    async _onChangeDecorum(direction, event) {
        event.preventDefault();
        let currentDecorum = parseInt(this.actor.system.decorumNumber) || 1;
        const maxDecorums = 11; // Total number of decorum styles

        currentDecorum += direction;

        if (currentDecorum < 1) {
            currentDecorum = maxDecorums; // Loop to last decorum
        } else if (currentDecorum > maxDecorums) {
            currentDecorum = 1; // Loop to first decorum
        }

        // Update actor data without re-rendering the sheet
        await this.actor.update({ "system.decorumNumber": currentDecorum }, { render: false });

        // Manually update the DOM
        this.element.find('.decorum-number-display').text(`Décorum ${currentDecorum}`);
    }

    /**
     * Handle changing the counter icon theme number.
     * @param {number} direction -1 for previous, 1 for next.
     * @param {Event} event The click event.
     * @private
     */
    async _onChangeCounterIconTheme(direction, event) {
        event.preventDefault();
        const button = $(event.currentTarget);
        const counterType = button.data('counter-type'); // e.g., "health", "energy"
        const fieldName = `system.${counterType}IconTheme`; // e.g., "system.healthIconTheme"

        let currentTheme = parseInt(foundry.utils.getProperty(this.actor, fieldName)) || 0; // Default to 0 if not set or invalid
        const maxThemes = 7; // Themes 01 to 07

        currentTheme += direction;

        if (currentTheme < 0) { // Allow 0 for "no picture"
            currentTheme = maxThemes; // Loop to last theme
        } else if (currentTheme > maxThemes) {
            currentTheme = 0; // Loop to "no picture" (0)
        }

        // Format with leading zero if single digit (e.g., 1 -> "01", 7 -> "07", 0 -> "00")
        const newThemeFormatted = String(currentTheme).padStart(2, '0');

        let updateData = {};
        updateData[fieldName] = newThemeFormatted;

        // Update actor data without re-rendering the sheet
        await this.actor.update(updateData, { render: false });

        // Manually update the DOM
        // 1. Update the theme number display in the options tab
        button.siblings('.counter-icon-number-display').text(`Thème ${newThemeFormatted}`);

        // 2. Update the icon in the description tab
        const iconContainer = this.element.find(`.counter-icon-container[data-icon-for="${counterType}"]`);
        if (newThemeFormatted === "00") {
            iconContainer.empty();
        } else {
            const suffixMap = {
                health: 'vie',
                healthReserve: 'vier',
                energy: 'nrj',
                energyReserve: 'nrjr'
            };
            const suffix = suffixMap[counterType];
            if (suffix) {
                const newSrc = `systems/ambre/assets/skin/cells/th${newThemeFormatted}-${suffix}.png`;
                
                let img = iconContainer.find('img.counter-icon');
                if (img.length === 0) {
                    // If image doesn't exist, create it and add it to the container
                    img = $('<img class="counter-icon" alt="Counter Icon">');
                    iconContainer.append(img);
                }
                img.attr('src', newSrc);
            }
        }
    }

    async _onAvantageDotClick(event) {
        event.preventDefault();
        if (!this.actor.isOwner) {
            ui.notifications.warn("Vous n'avez pas la permission de modifier cet acteur.");
            return;
        }

        const dotElement = $(event.currentTarget);
        const level = dotElement.data('level');
        const avantageKey = dotElement.data('avantage-key'); // e.g., "puissance"

        if (!avantageKey || level === undefined) {
            console.error("Ambre | Avantage key or level missing from dot element.");
            ui.notifications.error("Erreur : Données d'avantage manquantes.");
            return;
        }

        const currentActorValuePath = `system.${avantageKey}.${level}`;
        const currentActorValue = foundry.utils.getProperty(this.actor.system, `${avantageKey}.${level}`) || false;
        
        const updateData = {};
        updateData[currentActorValuePath] = !currentActorValue;

        try {
            await this.actor.update(updateData);
        } catch (err) {
            console.error(`Ambre | Failed to update avantage ${avantageKey} level ${level}:`, err);
            ui.notifications.error(`Erreur lors de la mise à jour de l'avantage.`);
        }
    }

    async _onRefreshAvantagesClick(event) {
        event.preventDefault();
        if (!this.actor.isOwner) {
            ui.notifications.warn("Vous n'avez pas la permission de modifier cet acteur.");
            return;
        }

        const confirmed = await Dialog.confirm({
            title: "Réinitialiser les Avantages",
            content: "<p>Êtes-vous sûr de vouloir réinitialiser tous les avantages à leur état non sélectionné ?</p>",
            yes: () => true,
            no: () => false,
            defaultYes: false
        });

        if (!confirmed) {
            return;
        }

        const updateData = {};
        const avantageKeys = [
            "puissance", "criticite", "esquive", "insensibilite", "cicatrisation",
            "tenacite", "liberte", "dualite", "acharnement", "acuite", "chance",
            "opacite", "audience", "entrave", "incognito"
        ];

        avantageKeys.forEach(key => {
            if (this.actor.system[key] && typeof this.actor.system[key] === 'object') {
                Object.keys(this.actor.system[key]).forEach(level => {
                    updateData[`system.${key}.${level}`] = false;
                });
            }
        });

        if (Object.keys(updateData).length > 0) {
            await this.actor.update(updateData);
            ui.notifications.info("Tous les avantages ont été réinitialisés.");
        } else {
            ui.notifications.info("Aucun avantage à réinitialiser ou structure de données inattendue.");
        }
    }

    /**
     * Handle clicking the refresh button for temporary characteristic bonuses.
     * @param {Event} event The click event.
     * @private
     */
    async _onRefreshCaracteristiquesClick(event) {
        event.preventDefault();
        if (!this.actor.isOwner) {
            ui.notifications.warn("Vous n'avez pas la permission de modifier cet acteur.");
            return;
        }

        const confirmed = await Dialog.confirm({
            title: "Réinitialiser les Bonus Temporaires",
            content: "<p>Êtes-vous sûr de vouloir réinitialiser tous les bonus temporaires des caractéristiques à 0 ?</p>",
            yes: () => true,
            no: () => false,
            defaultYes: false
        });

        if (!confirmed) {
            return;
        }

        const updateData = {
            'system.temporarybonusphysique': 0, 'system.temporarybonusforce': 0, 'system.temporarybonusdexterite': 0, 'system.temporarybonusreflexe': 0,
            'system.temporarybonusendurance': 0, 'system.temporarybonusadaptation': 0, 'system.temporarybonusregeneration': 0, 'system.temporarybonusresistance': 0,
            'system.temporarybonuspsyche': 0, 'system.temporarybonusintelligence': 0, 'system.temporarybonusconcentration': 0, 'system.temporarybonusvolonte': 0,
            'system.temporarybonusperception': 0, 'system.temporarybonussens': 0, 'system.temporarybonussixiemesens': 0, 'system.temporarybonusempathie': 0,
            'system.temporarybonuscharisme': 0, 'system.temporarybonusapparence': 0, 'system.temporarybonusintimidation': 0, 'system.temporarybonuseloquence': 0
        };

        await this.actor.update(updateData);
        ui.notifications.info("Tous les bonus temporaires des caractéristiques ont été réinitialisés.");
    }

    /**
     * Updates the visual position of the Karma input field based on its value.
     * @param {jQuery} html The jQuery object representing the sheet's HTML.
     * @private
     */
    _updateKarmaInputPosition(html) {
        const karmaInput = html.find('input[name="system.karma"].karma-overlay-input');
        if (!karmaInput.length) return;

        const karmaValue = parseInt(karmaInput.val()) || 0;

        const maxPixelOffset = 112;
        const maxKarmaValue = 15;
        let offsetX = 0;

        if (maxKarmaValue !== 0) { // Avoid division by zero
            offsetX = - (karmaValue / maxKarmaValue) * maxPixelOffset;
        }

        // Apply the transform style directly
        karmaInput.css('transform', `translate(calc(-50% + ${offsetX}px), -50%)`);
    }

    async _onTalentCircleClick(event) {
        event.preventDefault();
        if (!this.actor.isOwner) {
            ui.notifications.warn("Vous n'avez pas la permission de modifier cet acteur.");
            return;
        }

        const circleElement = $(event.currentTarget);
        const talentType = circleElement.data('talent-type');
        const circleIndex = parseInt(circleElement.data('circle-index'));

        let updateData = {};

        if (talentType === 'logrus') {
            const logrusData = this.actor.system.talentsTracking?.logrus;
            let usedExtensions = logrusData?.usedExtensions || 0;
            const maxExtensions = calculNbreExtension(this.actor.system, this.actor.system.ptslogrus); // Recalculate or get from context

            const targetFillCount = circleIndex + 1;
            if (targetFillCount === usedExtensions) {
                usedExtensions--; // Clicked the last filled dot, so unfill it
            } else {
                usedExtensions = targetFillCount; // Fill up to the clicked dot
            }
            usedExtensions = Math.max(0, Math.min(usedExtensions, maxExtensions)); // Clamp
            updateData['system.talentsTracking.logrus.usedExtensions'] = usedExtensions;

        } else if (talentType === 'abysses_failles') { // Ensure this matches data-talent-type
            const abyssesData = this.actor.system.talentsTracking?.abysses;
            let usedFailles = abyssesData?.usedFailles || 0;
            
            const pouvoirAbyssesValue = this.actor.system.ptsabysses || 0;
            const niveauNumericAbysses = calculateNiveauNumeric(pouvoirAbyssesValue);
            let maxFailles = 0;
            if (niveauNumericAbysses >= 6) {
                if (niveauNumericAbysses >= 12) {
                    maxFailles = Math.floor((this.actor.system.psyche * 2) / 10);
                } else {
                    maxFailles = Math.floor(this.actor.system.psyche / 10);
                }
            }

            const targetFillCount = circleIndex + 1;
            if (targetFillCount === usedFailles) {
                usedFailles--;
            } else {
                usedFailles = targetFillCount;
            }
            usedFailles = Math.max(0, Math.min(usedFailles, maxFailles)); // Clamp
            updateData['system.talentsTracking.abysses.usedFailles'] = usedFailles;
        } else if (talentType === 'sabliers_jours') { // Matches data-talent-type
            const sabliersData = this.actor.system.talentsTracking?.sabliers;
            let usedJours = sabliersData?.usedJoursSansConnexion || 0;

            let maxJours = 0;
            if (this.actor.system && typeof this.actor.system.psyche === 'number' && typeof this.actor.system.endurance === 'number') {
                maxJours = Math.floor((this.actor.system.psyche + this.actor.system.endurance) / 10);
            }

            const targetFillCount = circleIndex + 1;
            if (targetFillCount === usedJours) {
                // If the clicked circle is the last filled one, unfill it (decrement)
                usedJours--;
            } else {
                // Otherwise, fill up to the clicked circle (set to index + 1)
                usedJours = targetFillCount;
            }
            usedJours = Math.max(0, Math.min(usedJours, maxJours)); // Clamp value

            updateData['system.talentsTracking.sabliers.usedJoursSansConnexion'] = usedJours;
        }

        if (Object.keys(updateData).length > 0) {
            await this.actor.update(updateData);
        }
    }

    /**
     * Handle changes to the "Croquis" checkbox for an Atout.
     * @param {Event} event The change event.
     * @private
     */
    async _onAtoutCroquisChange(event) {
        event.preventDefault();
        if (!this.actor.isOwner) {
            ui.notifications.warn("Vous n'avez pas la permission de modifier cet acteur.");
            return;
        }

        const checkbox = event.currentTarget;
        const itemId = $(checkbox).closest('.item').data('item-id'); // Get itemId from parent .item element
        const item = this.actor.items.get(itemId);

        if (item) {
            try {
                await item.update({ "system.croquis": checkbox.checked });
            } catch (err) {
                console.error(`Ambre | Failed to update 'croquis' status for atout ${itemId}:`, err);
                ui.notifications.error("Erreur lors de la mise à jour de l'atout.");
            }
        } else {
            console.warn(`Ambre | Atout item with ID ${itemId} not found for update.`);
        }
    }

    /**
     * Handle changes to the "Memorisé" checkbox for an Atout.
     * @param {Event} event The change event.
     * @private
     */
    async _onAtoutMemorizedChange(event) {
        event.preventDefault();
        if (!this.actor.isOwner) {
            ui.notifications.warn("Vous n'avez pas la permission de modifier cet acteur.");
            return;
        }

        const checkbox = event.currentTarget;
        const itemId = $(checkbox).closest('.item').data('item-id');
        const item = this.actor.items.get(itemId);

        if (item) {
            await item.update({ "system.memorized": checkbox.checked });
        }
    }

    /**
     * Handle changes to the Puissance counter via buttons.
     * @param {Event} event The click event.
     * @private
     */
    async _onPuissanceChange(event) {
        event.preventDefault();
        if (!this.actor.isOwner) {
            ui.notifications.warn("Vous n'avez pas la permission de modifier cet acteur.");
            return;
        }

        const button = $(event.currentTarget);
        const changeValue = parseInt(button.data('change-value'));
        
        // Get current usedPuissance, defaulting to 0 if not set
        let currentUsedPuissance = foundry.utils.getProperty(this.actor.system, 'talentsTracking.abreuvoir.usedPuissance') || 0;
        
        // Recalculate maxPuissance based on current actor endurance, as it's dynamic
        const actorEndurance = this.actor.system.endurance || 0;
        const maxPuissance = actorEndurance * 2;

        let newPuissance = currentUsedPuissance + changeValue;
        newPuissance = Math.max(0, Math.min(newPuissance, maxPuissance)); // Clamp the value

        await this.actor.update({ 'system.talentsTracking.abreuvoir.usedPuissance': newPuissance });
    }
}
