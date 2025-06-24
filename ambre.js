import { ambre } from "./module/config.js";
import ArtefactItemSheet from "./module/sheets/artefactItemSheet.js";
import PouvoirItemSheet from "./module/sheets/pouvoirItemSheet.js";
import CreatureItemSheet from "./module/sheets/creatureItemSheet.js";
import OmbreItemSheet from "./module/sheets/ombreItemSheet.js";
import PjActorSheet from "./module/sheets/pjActorSheet.js"; // Corrected variable name to PjActorSheet
import AtoutItemSheet from "./module/sheets/atoutItemSheet.js";
import VoieSecreteItemSheet from "./module/sheets/voieSecreteItemSheet.js";
import MotsPouvoirsSheet from "./module/sheets/items/motspouvoirsSheet.js";
import SortilegesSheet from "./module/sheets/items/sortilegesSheet.js";
import CapaciteAnimaleItemSheet from "./module/sheets/CapaciteAnimaleItemSheet.js";
import ArtefactAbyssalItemSheet from "./module/sheets/items/artefactAbyssalItemSheet.js";
import CatalyseurItemSheet from "./module/sheets/items/catalyseurItemSheet.js";
import IngredientItemSheet from "./module/sheets/items/ingredientItemSheet.js";
import MiroirItemSheet from "./module/sheets/items/miroirItemSheet.js";
import ReceptacleItemSheet from "./module/sheets/items/receptacleItemSheet.js";
import RuneItemSheet from "./module/sheets/items/RuneItemSheet.js"; // Corrected file name
import PnjActorSheet from "./module/sheets/pnjActorSheet.js";
import { AtoutGenerator } from "./scripts/atout-generator.js";

// Import Handlebars helpers registration function
import { registerHandlebarsHelpers } from './module/helpers/handlebars-helpers.js';

async function preloadHandlesbarsTemplates() {

    const templatePaths=[
        "systems/ambre/templates/sheets/pjActor-sheet.hbs",
        "systems/ambre/templates/sheets/actor/options.hbs",
        "systems/ambre/templates/sheets/actor/parts/option.hbs",
        "systems/ambre/templates/sheets/actor/parts/checkbox.hbs",
        "systems/ambre/templates/partials/majorStats.hbs",
        "systems/ambre/templates/partials/commonStats.hbs",
        "systems/ambre/templates/sheets/actor/parts/description.hbs",
        "systems/ambre/templates/sheets/actor/parts/caracteristiques.hbs",
        "systems/ambre/templates/sheets/actor/parts/avantages.hbs",
        "systems/ambre/templates/sheets/actor/parts/competence.hbs",
        "systems/ambre/templates/sheets/actor/parts/theme.hbs",
        "systems/ambre/templates/sheets/actor/parts/accespouvoirs.hbs",
        "systems/ambre/templates/partials/pouvoir.hbs",
        "systems/ambre/templates/sheets/actor/parts/artefacts_mat.hbs",
        "systems/ambre/templates/sheets/actor/parts/ombres_mat.hbs",
        "systems/ambre/templates/sheets/actor/parts/atouts_mat.hbs",
        "systems/ambre/templates/sheets/artefact-sheet.hbs",
        "systems/ambre/templates/sheets/actor/parts/journaux_mat.hbs",
        "systems/ambre/templates/sheets/actor/parts/materiel_mat.hbs",
        "systems/ambre/templates/partials/creature-polymorphie-forms.hbs",
        "systems/ambre/templates/partials/artefact-polymorphie-forms.hbs",
        "systems/ambre/templates/partials/ombre-controle-pouvoirs-amis.hbs",
        "systems/ambre/templates/partials/talentsSpecifiques.hbs",
        "systems/ambre/templates/sheets/capaciteAnimale.hbs",
        "systems/ambre/templates/sheets/items/mots-pouvoirs.hbs",
        "systems/ambre/templates/sheets/items/runes.hbs",
        "systems/ambre/templates/sheets/items/sortileges.hbs",
        "systems/ambre/templates/sheets/items/artefactabyssal-sheet.hbs",
        "systems/ambre/templates/sheets/items/catalyseur-sheet.hbs",
        "systems/ambre/templates/sheets/items/receptacle-sheet.hbs",
        "systems/ambre/templates/sheets/items/ingredient-sheet.hbs",
        "systems/ambre/templates/sheets/items/miroir-sheet.hbs",
        "systems/ambre/templates/sheets/pnjActor-sheet.hbs",
        "systems/ambre/templates/apps/atout-generator.hbs",
    ];
    return loadTemplates(templatePaths);
    
}

console.log("Ambre | Main system script loading...");

Hooks.once("init", function() 
{
    console.log ('Ambre | Initializing Ambre System (init hook)'); 
    // Register Handlebars helpers
    registerHandlebarsHelpers();

    game.settings.register("ambre", "basePointsCreation", {
        name: "Base de points de création",
        hint: "Définit le nombre de points de base pour la création de personnage.",
        scope: "world",
        config: true,
        type: Number,
        default: 600,
        onChange: value => console.log(`Ambre | Setting 'Base de points de création' changed to: ${value}`)
    });

    game.settings.register("ambre", "atoutGeneratorPresets", {
        name: "Atout Generator Presets",
        scope: "world",
        config: false, // This setting does not need to appear in the module settings menu.
        type: Object,
        default: {}
    });

    game.settings.register("ambre", "atoutArtistStyles", {
        name: "Atout Generator Artist Styles",
        scope: "world",
        config: false,
        type: Object,
        default: {}
    });

    game.settings.register("ambre", "baseScoreSpecialite", {
        name: "Score minimum pour une spécialité",
        hint: "Définit le nombre de points minimum pour une spécialité.",
        scope: "world",
        config: true,
        type: Number,
        default: 10,
        onChange: value => console.log(`Ambre | Setting 'Score minimum pour une spécialité' changed to: ${value}`)
    });

    game.settings.register("ambre", "basePouvoirVersion", {
        name: "Version des pouvoirs du système",
        hint: "Définit la version de pouvoirs utilisée par le système.",
        scope: "world",
        config: true,
        type: String,
        choices: {
            "aberion15": "Aberion 1.5",
            "aberion20": "Aberion 2.0",
            "xavious": "Xavious"
        },
        default: "aberion15",
        onChange: value => console.log(`Ambre | Setting 'Version des pouvoirs du système' changed to: ${value}`)
    });

    CONFIG.ambre = ambre
    //Items.unregisterSheet("core", Itemsheet); // Si vous avez une classe Itemsheet globale, sinon commentez
    //Actors.unregisterSheet('core', ActorSheet); // Si vous avez une classe ActorSheet globale, sinon commentez
    // Register sheet application classes
    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet('ambre', ArtefactItemSheet, { types: ['artefact'], makeDefault: true });
    Items.registerSheet('ambre', PouvoirItemSheet, { types: ['pouvoir'], makeDefault: true });
    Items.registerSheet('ambre', CreatureItemSheet, { types: ['creature'], makeDefault: true });
    Items.registerSheet('ambre', OmbreItemSheet, { types: ['ombre'], makeDefault: true });
    Items.registerSheet('ambre', AtoutItemSheet, { types: ['atout'], makeDefault: true });
    Items.registerSheet('ambre', VoieSecreteItemSheet, { types: ['voiesecrete'], makeDefault: true });
    Items.registerSheet('ambre', MotsPouvoirsSheet, { types: ['motspouvoirs'], makeDefault: true });
    Items.registerSheet('ambre', SortilegesSheet, { types: ['sortileges'], makeDefault: true });
    Items.registerSheet('ambre', CapaciteAnimaleItemSheet, { types: ['capaciteanimale'], makeDefault: true });
    Items.registerSheet('ambre', ArtefactAbyssalItemSheet, { types: ['artefactabyssal'], makeDefault: true });
    Items.registerSheet('ambre', CatalyseurItemSheet, { types: ['catalyseur'], makeDefault: true });
    Items.registerSheet('ambre', ReceptacleItemSheet, { types: ['receptacle'], makeDefault: true });
    Items.registerSheet('ambre', IngredientItemSheet, { types: ['ingredient'], makeDefault: true });
    Items.registerSheet('ambre', MiroirItemSheet, { types: ['miroir'], makeDefault: true });
    Items.registerSheet('ambre', RuneItemSheet, { types: ['rune'], makeDefault: true });

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet('ambre', PjActorSheet, { types: ['pj'], makeDefault: true }); // Corrected variable name
    Actors.registerSheet('ambre', PnjActorSheet, { types: ['pnj'], makeDefault: true });
    preloadHandlesbarsTemplates();

    // Register all required Handlebars helpers
    Handlebars.registerHelper('range', function(start, end) {
        if (typeof start !== 'number' || typeof end !== 'number') {
            return [];
        }
        const result = [];
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    });

    // Add these Handlebars helpers
    Handlebars.registerHelper('isEven', function(value) {
        return value % 2 === 0;
    });

    Handlebars.registerHelper('isOdd', function(value) {
        return value % 2 === 1;
    });

    Handlebars.registerHelper('add', function(a, b) {
        return (Number(a) || 0) + (Number(b) || 0);
    });

    Handlebars.registerHelper('div', function(a, b) {
        if (!a || !b) return 0;
        return Math.floor((Number(a) || 0) / (Number(b) || 1)); // Eviter division par zéro
    });

    Handlebars.registerHelper('json', function(context) {
        return JSON.stringify(context, null, 2);
    });

    Handlebars.registerHelper('getCompetenceTotal', function(competenceValue, caracteristiqueValue) {
        return (Number(competenceValue) || 0) + (Number(caracteristiqueValue) || 0);
    });

    Handlebars.registerHelper('buildCompetencePath', function(carKey, compKey) {
        return `system.competences.${carKey}.competences.${compKey}.value`;
    });

    Handlebars.registerHelper('mult', function(a, b) {
        return (Number(a) || 0) * (Number(b) || 0);
    });

    Handlebars.registerHelper('concat', function(...args) {
        // Supprimer le dernier argument qui est l'objet options de Handlebars
        args.pop();
        return args.join('');
    });

    Handlebars.registerHelper('gte', function(a, b) {
        return (Number(a) || 0) >= (Number(b) || 0);
    });

    Handlebars.registerHelper('lookup', function(obj, key) {
        if (!obj || typeof obj !== 'object') return undefined; // Renvoyer undefined plutôt que false
        return obj[key];
    });

    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    Handlebars.registerHelper('gt', function(a, b) {
        return (Number(a) || 0) > (Number(b) || 0);
    });

    Handlebars.registerHelper('and', function(...args) {
        // Supprimer le dernier argument (options Handlebars)
        args.pop();
        for (let i = 0; i < args.length; i++) {
            if (!args[i]) return false;
        }
        return true;
    });

    Handlebars.registerHelper('sub', function(a, b) {
        return (Number(a) || 0) - (Number(b) || 0);
    });

    // In your main system setup file (e.g., ambre.js)
CONFIG.ambre.CREATURE_ATTRIBUTES = {
    vitalite: { label: "Vitalité", level0: "Non Applicable", level5: "Vitalité Niveau 5", level10: "Vitalité Niveau 10", level15: "Vitalité Niveau 15", tooltip: "Description de la vitalité...", descPrefix: "Vitalité de", statBonus: "endurance" },
    vitesse: { label: "Vitesse", level0: "Non Applicable", level5: "50 km/h", level10: "100 km/h", level15: "150 km/h", tooltip: "Description de la vitesse...", descPrefix: "Vitesse de", statBonus: "physique" },
    souffle: { label: "Souffle", level0: "Non Applicable", level5: "Souffle Niveau 5", level10: "Souffle Niveau 10", level15: "Souffle Niveau 15", tooltip: "Description du souffle...", descPrefix: "Souffle de", statBonus: "perception" },
    agression: { label: "Agression", level0: "Non Applicable", level5: "Agression Niveau 5", level10: "Agression Niveau 10", level15: "Agression Niveau 15", tooltip: "Description de l'agression...", descPrefix: "Agression de", statBonus: "physique" },
    resistance: { label: "Résistance", level0: "Non Applicable", level5: "Peau du Mammouth 5", level10: "Carapace de la Tortue 10", level15: "Écaille du Dragon 15", tooltip: "Description de la résistance...", descPrefix: "Résistance de", statBonus: "endurance" },
    degats: { label: "Dégâts", level0: "Non Applicable", level5: "Crocs du Loup 5", level10: "Dents du Requin 10", level15: "Crocs du Dragon 15", tooltip: "Description des dégâts...", descPrefix: "Dégâts de", statBonus: "physique" },
    intelligence: { label: "Intelligence", level0: "Non Applicable", level5: "Esprit du Loup 5", level10: "Esprit humain 10", level15: "Esprit chaosien 15", tooltip: "Description de l'intelligence...", descPrefix: "Intelligence de", statBonus: "psyche" },
    telepathie: { label: "Télépathie", level0: "Non Applicable", level5: "Télépathie au toucher 5", level10: "Télépathie visuelle 10", level15: "Télépathie dans l’Ombre 15", tooltip: "Description de la télépathie...", descPrefix: "Télépathie de", statBonus: "perception" },
    defensepsy: { label: "Défense Psy", level0: "Non Applicable", level5: "Activation Manuelle", level10: "Activation Magique", level15: "Défense permanente", tooltip: "Description de la défense psy...", descPrefix: "Défense Psy de", statBonus: "psyche" },
    polymorphie: { label: "Polymorphie", level0: "Non Applicable", level5: "Formes simples", level10: "Formes complexes", level15: "Transformations majeures", tooltip: "Description de la polymorphie...", descPrefix: "Polymorphie de", statBonus: null }
};


    // Exposer MesAtoutsApp globalement pour les macros
    game.ambre = game.ambre || {};
    game.ambre.AtoutGenerator = AtoutGenerator;

    console.log ('Ambre | System initialization (init hook) complete.');
});



// Hook to set default image for "voiesecrete" items
Hooks.on("preCreateItem", (item, createData, options, userId) => {
    // Check if the item is of type "voiesecrete" and no image is already specified
    if (item.type === "voiesecrete") {
        // If img is not already set in createData, or if it's the default mystery-man
        if (!createData.img || createData.img === "icons/svg/mystery-man.svg") {
            // We need to update the 'createData' object that will be used for creation.
            // Directly modifying item.img here might be too late or not affect the database entry.
            createData.img = "systems/ambre/assets/icons/voiesecrete.png";
        }
    }
});