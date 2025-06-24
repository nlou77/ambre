/**
 * Migration script for Ambre system actors and items.
 * Target Schema Version: 1
 *
 * This script will:
 * 1. For 'pj' actors:
 *    - Ensure 'system.creation' block exists and is complete with defaults.
 *    - Migrate `allies_valeur` and `ennemis_valeur` from `system.characterDescription` to `system.creation`.
 *    - Migrate `ptscaracteristiques` from `system` root to `system.creation`.
 *    - Migrate `karma` (value) and `ptskarma` (cost) to their new locations and ensure consistency.
 * 2. For all actor types ('pj', 'pnj', 'figurant'):
 *    - Ensure all `system` properties defined in `template.json` for their type exist, adding defaults if missing.
 *    - Explicitly set `biographyEditorVisible` to `false` if missing.
 *    - Explicitly set `sheetLocked` to `false` if missing.
 *    - Explicitly set `allowStatRefreshOnLock` to `true` if missing.
 * 3. For all item types:
 *    - Ensure all `system` properties defined in `template.json` for their type exist, adding defaults if missing.
 *    - Specifically, update `voiesecrete` item images if they are default.
 * 4. Update actor's/item's `system.schemaVersion` to 1 if any changes were made.
 */

// Define the target schema version for this migration
const AMBRE_TARGET_SCHEMA_VERSION = 1;

// Default structure for the 'creation' block, based on template.json
const AMBRE_DEFAULT_CREATION_BLOCK = {
  ptsbase: 600,
  ptstotaux: 0,
  ptscaracteristiques: 0,
  ptsrestants: 0,
  ptskarma: 0,
  ptscompetences: 0,
  ptsartefacts: 0,
  ptsombres: 0,
  ptscreatures: 0,
  ptspouvoirs: 0,
  ptsmarelle: 0,
  ptslogrus: 0,
  ptsabreuvoir: 0,
  ptsabysses: 0,
  ptsmetamorphose: 0,
  ptsatouts: 0,
  ptspentacre: 0,
  ptscoeurflamme: 0,
  ptsorbochromat: 0,
  ptsharmonium: 0,
  ptschimerion: 0,
  ptssabliers: 0,
  ptsmagie: 0,
  ptscontribution: 0,
  ptspointfaible: 0,
  ennemis_valeur: 0,
  allies_valeur: 0,
  ptsvsmarelle: 0,
  ptsvslogrus: 0,
  ptsvsabreuvoir: 0,
  ptsvsabysses: 0,
  ptsvsmetamorphose: 0,
  ptsvsatouts: 0,
  ptsvspentacre: 0,
  ptsvscoeurflamme: 0,
  ptsvsorbochromat: 0,
  ptsvsharmonium: 0,
  ptsvschimerion: 0,
  ptsvssabliers: 0,
  ptsvsmagie: 0
};

/**
 * Recursively applies default values from a template to current data,
 * building an update object for Foundry.
 *
 * @param {object} currentData The current system data (will be modified in memory for recursion).
 * @param {object} defaultTemplate The template to apply defaults from.
 * @param {object} updateData The object to accumulate Foundry update paths.
 * @param {string} pathPrefix The current path prefix for updateData (e.g., 'system.creation').
 * @returns {boolean} True if any changes were added to updateData.
 */
function _applyTemplateDefaults(currentData, defaultTemplate, updateData, pathPrefix = 'system') {
    let changed = false;

    for (const key in defaultTemplate) {
        const templateValue = defaultTemplate[key];
        const currentPath = pathPrefix ? `${pathPrefix}.${key}` : key;

        if (typeof templateValue === 'object' && templateValue !== null && !Array.isArray(templateValue)) {
            // If it's an object, recurse
            if (!foundry.utils.hasProperty(currentData, key) || typeof foundry.utils.getProperty(currentData, key) !== 'object' || foundry.utils.getProperty(currentData, key) === null) {
                // If the current data doesn't have this object or it's not an object, initialize it
                foundry.utils.setProperty(updateData, currentPath, foundry.utils.deepClone(templateValue));
                // Update currentData in memory for subsequent checks in this pass
                foundry.utils.setProperty(currentData, key, foundry.utils.deepClone(templateValue));
                changed = true;
            }
            // Recurse into the nested object
            if (_applyTemplateDefaults(foundry.utils.getProperty(currentData, key), templateValue, updateData, currentPath)) {
                changed = true;
            }
        } else if (!foundry.utils.hasProperty(currentData, key) || foundry.utils.getProperty(currentData, key) === undefined) {
            // If property is missing or undefined, set it to the default
            foundry.utils.setProperty(updateData, currentPath, templateValue);
            // Update currentData in memory for subsequent checks in this pass
            foundry.utils.setProperty(currentData, key, templateValue);
            changed = true;
        }
        // Specific flag handling for actor sheets (these are not in template.json directly as `false` or `true` defaults)
        // This assumes these flags are directly under `system`
        if (pathPrefix === 'system') { // Only apply these if we are at the root of the system object
            if (key === 'biographyEditorVisible' && !foundry.utils.hasProperty(currentData, key)) {
                foundry.utils.setProperty(updateData, currentPath, false);
                foundry.utils.setProperty(currentData, key, false);
                changed = true;
            }
            if (key === 'sheetLocked' && !foundry.utils.hasProperty(currentData, key)) {
                foundry.utils.setProperty(updateData, currentPath, false);
                foundry.utils.setProperty(currentData, key, false);
                changed = true;
            }
            if (key === 'allowStatRefreshOnLock' && !foundry.utils.hasProperty(currentData, key)) {
                foundry.utils.setProperty(updateData, currentPath, true);
                foundry.utils.setProperty(currentData, key, true);
                changed = true;
            }
        }
    }
    return changed;
}

/**
 * Migrates a single actor's data.
 * @param {Actor} actor The actor to migrate.
 * @returns {Promise<boolean>} True if the actor was migrated, false otherwise.
 */
async function migrateAmbreActorData(actor) {
  const updateData = {};
  let hasMigratedData = false; // Tracks if actual data fields were changed
  // Create a deep clone to work with in memory, so we don't modify the live actor data directly
  // until we're ready to call actor.update().
  const currentSystemData = foundry.utils.deepClone(actor.system);

  // --- Step 1: Apply specific PJ actor migrations (if applicable) ---
  if (actor.type === 'pj') {
    // Ensure system.creation block exists and is complete
    if (!currentSystemData.creation) {
      updateData['system.creation'] = foundry.utils.deepClone(AMBRE_DEFAULT_CREATION_BLOCK);
      foundry.utils.mergeObject(currentSystemData, { creation: foundry.utils.deepClone(AMBRE_DEFAULT_CREATION_BLOCK) });
      hasMigratedData = true;
      console.log(`Ambre Migration | Actor ${actor.name}: Initialized system.creation block.`);
    } else {
      let creationBlockModified = false;
      for (const key in AMBRE_DEFAULT_CREATION_BLOCK) {
        if (!foundry.utils.hasProperty(currentSystemData.creation, key)) {
          foundry.utils.setProperty(updateData, `system.creation.${key}`, AMBRE_DEFAULT_CREATION_BLOCK[key]);
          foundry.utils.setProperty(currentSystemData.creation, key, AMBRE_DEFAULT_CREATION_BLOCK[key]); // for current pass
          creationBlockModified = true;
        }
      }
      if (creationBlockModified) {
        hasMigratedData = true;
        console.log(`Ambre Migration | Actor ${actor.name}: Updated system.creation with default fields.`);
      }
    }

    // --- Migrate allies_valeur ---
    if (foundry.utils.hasProperty(currentSystemData, "characterDescription.allies_valeur")) {
      const oldValue = foundry.utils.getProperty(currentSystemData, "characterDescription.allies_valeur");
      if (oldValue !== undefined && (currentSystemData.creation.allies_valeur === 0 || currentSystemData.creation.allies_valeur === undefined)) {
        updateData['system.creation.allies_valeur'] = oldValue;
        currentSystemData.creation.allies_valeur = oldValue; // for current pass
        console.log(`Ambre Migration | Actor ${actor.name}: Migrated allies_valeur (${oldValue}) to system.creation.`);
      }
      updateData['system.characterDescription.-=allies_valeur'] = null;
      hasMigratedData = true;
    }

    // --- Migrate ennemis_valeur ---
    if (foundry.utils.hasProperty(currentSystemData, "characterDescription.ennemis_valeur")) {
      const oldValue = foundry.utils.getProperty(currentSystemData, "characterDescription.ennemis_valeur");
      if (oldValue !== undefined && (currentSystemData.creation.ennemis_valeur === 0 || currentSystemData.creation.ennemis_valeur === undefined)) {
        updateData['system.creation.ennemis_valeur'] = oldValue;
        currentSystemData.creation.ennemis_valeur = oldValue; // for current pass
        console.log(`Ambre Migration | Actor ${actor.name}: Migrated ennemis_valeur (${oldValue}) to system.creation.`);
      }
      updateData['system.characterDescription.-=ennemis_valeur'] = null;
      hasMigratedData = true;
    }

    // --- Migrate ptscaracteristiques ---
    if (foundry.utils.hasProperty(currentSystemData, "ptscaracteristiques")) {
      const oldValue = currentSystemData.ptscaracteristiques;
      updateData['system.creation.ptscaracteristiques'] = oldValue;
      currentSystemData.creation.ptscaracteristiques = oldValue; // for current pass
      updateData['system.-=ptscaracteristiques'] = null;
      hasMigratedData = true;
      console.log(`Ambre Migration | Actor ${actor.name}: Migrated ptscaracteristiques (${oldValue}) to system.creation.`);
    }

    // --- Migrate karma and ptskarma ---
    let karmaSourceValue = Number(foundry.utils.getProperty(currentSystemData, "characterDescription.karma") || "0");
    let karmaMigrationOccurred = false;

    // Check old system.karma (numeric value at root)
    if (foundry.utils.hasProperty(currentSystemData, "karma")) {
      const oldKarmaValue = Number(currentSystemData.karma);
      if ((!foundry.utils.hasProperty(currentSystemData, "characterDescription.karma") || karmaSourceValue === 0) && oldKarmaValue !== 0) { // Check if characterDescription.karma is missing or 0
        updateData['system.characterDescription.karma'] = String(oldKarmaValue);
        karmaSourceValue = oldKarmaValue; // Update for subsequent calculation
        console.log(`Ambre Migration | Actor ${actor.name}: Migrated system.karma (${oldKarmaValue}) to system.characterDescription.karma.`);
        karmaMigrationOccurred = true;
      }
      updateData['system.-=karma'] = null; // Mark for removal
      
      hasMigratedData = true; // Counts as a data migration
    }
    // Check old system.ptskarma (cost at root) and ensure system.creation.ptskarma is set
    if (foundry.utils.hasProperty(currentSystemData, "ptskarma")) {
      const oldPtsKarma = Number(currentSystemData.ptskarma);
      updateData['system.creation.ptskarma'] = oldPtsKarma;
      currentSystemData.creation.ptskarma = oldPtsKarma; // for current pass

      // This condition means:
      // 1. characterDescription.karma is missing OR it's 0 (meaning it wasn't set or was default)
      // AND
      // 2. oldPtsKarma is not 0 (meaning there was a cost to infer karma from)
      // This is to prevent overwriting a manually set characterDescription.karma with an inferred 0.
      if ((!foundry.utils.hasProperty(currentSystemData, "characterDescription.karma") || karmaSourceValue === 0) && oldPtsKarma !== 0) {
        const inferredKarma = oldPtsKarma / 2;
        updateData['system.characterDescription.karma'] = String(inferredKarma);
        karmaSourceValue = inferredKarma;
        console.log(`Ambre Migration | Actor ${actor.name}: Migrated system.ptskarma (${oldPtsKarma}) to system.creation.ptskarma and inferred system.characterDescription.karma.`);
      } else {
        console.log(`Ambre Migration | Actor ${actor.name}: Migrated system.ptskarma (${oldPtsKarma}) to system.creation.ptskarma.`);
      }
      updateData['system.-=ptskarma'] = null;
      hasMigratedData = true;
      karmaMigrationOccurred = true;
    }

    // Ensure system.creation.ptskarma is consistent with (potentially migrated) system.characterDescription.karma
    const finalCalculatedPtsKarma = karmaSourceValue * 2; // Recalculate based on the final karmaSourceValue
    // Only update if the value is different from what's currently in system.creation.ptskarma
    // This handles cases where ptskarma might have been migrated from root, but its value needs to be adjusted
    // based on the characterDescription.karma.
    if (currentSystemData.creation.ptskarma !== finalCalculatedPtsKarma) {
      updateData['system.creation.ptskarma'] = finalCalculatedPtsKarma;
      currentSystemData.creation.ptskarma = finalCalculatedPtsKarma; // Update in-memory for this pass
      if (!karmaMigrationOccurred) { // Only log if this is a new calculation not part of direct ptskarma field migration
          console.log(`Ambre Migration | Actor ${actor.name}: Ensured system.creation.ptskarma is ${finalCalculatedPtsKarma} based on characterDescription.karma.`);
      }
      hasMigratedData = true;
    }
  }

  // --- Step 2: Apply generic template defaults for all actor types ---
  // Get the default template for this actor type from game.system.model.Actor
  const actorModel = game.system.model.Actor[actor.type];
  if (actorModel && actorModel.system) {
      if (_applyTemplateDefaults(currentSystemData, actorModel.system, updateData, 'system')) {
          hasMigratedData = true;
          console.log(`Ambre Migration | Actor ${actor.name} (${actor.type}): Applied generic template defaults.`);
      }
  } else {
      console.warn(`Ambre Migration | Actor ${actor.name} (${actor.type}): No model found in game.system.model.Actor for this type. Skipping generic template migration.`);
  }


  if (Object.keys(updateData).length > 0) {
    // Always include schema version update if any data changed
    updateData['system.schemaVersion'] = AMBRE_TARGET_SCHEMA_VERSION;
    console.log(`Ambre Migration | Actor ${actor.name}: Applying updates:`, updateData);
    await actor.update(updateData);
    return true; // Indicates data was changed and schema version updated
  }
  return false; // Indicates no specific data fields were changed by this function
}

/**
 * Migrates a single item's data to the latest schema.
 * @param {Item} item The item to migrate.
 * @returns {Promise<boolean>} True if the item was migrated, false otherwise.
 */
async function migrateAmbreItemData(item) {
    const updateData = {};
    let hasMigratedData = false;
    // Create a deep clone to work with in memory
    const currentSystemData = foundry.utils.deepClone(item.system);

    // --- Step 1: Apply specific item migrations ---
    // For voiesecrete default image
    if (item.type === "voiesecrete" && (!item.img || item.img === "icons/svg/mystery-man.svg")) {
        updateData["img"] = "systems/ambre/assets/icons/voiesecrete.png";
        hasMigratedData = true;
        console.log(`Ambre Migration | Item ${item.name} (voiesecrete): Updated default image.`);
    }

    // --- Step 2: Apply generic template defaults for all item types ---
    // Get the default template for this item type from game.system.model.Item
    const itemModel = game.system.model.Item[item.type];
    if (itemModel && itemModel.system) {
        if (_applyTemplateDefaults(currentSystemData, itemModel.system, updateData, 'system')) {
            hasMigratedData = true;
            console.log(`Ambre Migration | Item ${item.name} (${item.type}): Applied generic template defaults.`);
        }
    } else {
        console.warn(`Ambre Migration | Item ${item.name} (${item.type}): No model found in game.system.model.Item for this type. Skipping generic template migration.`);
    }

    if (Object.keys(updateData).length > 0) {
        // Always include schema version update if any data changed
        updateData['system.schemaVersion'] = AMBRE_TARGET_SCHEMA_VERSION;
        console.log(`Ambre Migration | Item ${item.name}: Applying updates:`, updateData);
        await item.update(updateData);
        return true; // Indicates data was changed and schema version updated
    }
    return false; // Indicates no specific data fields were changed by this function
}


/**
 * Runs the migration for all relevant actors and items in the world.
 */
export async function runAmbreActorMigration() { // Renamed from runAmbreActorMigration to be more generic
  if (!game.user.isGM) {
    console.log("Ambre Migration | Attempted to run migration as non-GM user.");
    ui.notifications.error("Seuls les MJ peuvent exécuter cette migration.");
    return;
  }

  // --- Pre-flight check for data model ---
  // If the data model isn't loaded, we can't do any migrations. This is a critical failure.
  if (!game.system?.model?.Actor || !game.system?.model?.Item) {
    const errorMsg = "Migration impossible : le modèle de données du système (template.json) n'a pas pu être chargé. Vérifiez la console (F12) pour les erreurs et la validité de votre fichier template.json.";
    console.error(`Ambre Migration | CRITICAL ERROR: System data model is not available. This indicates a core Foundry VTT loading issue or an invalid template.json.`);
    console.error(`Ambre Migration | game.system:`, game.system);
    console.error(`Ambre Migration | game.system?.model:`, game.system?.model);
    ui.notifications.error(errorMsg, { permanent: true });
    return; // Abort the entire migration
  }

  ui.notifications.info("Démarrage de la migration des acteurs et objets pour le système Ambre...", { permanent: false });
  let migratedActorCount = 0;
  let migratedItemCount = 0; // Counter for migrated items

  // --- Actor Migration ---
  console.log("Ambre Migration | Démarrage de la migration des acteurs...");
  const allActors = game.actors.contents; // Get all actors regardless of type
  for (const actor of allActors) {
    const currentVersion = actor.system.schemaVersion || 0;
    if (currentVersion < AMBRE_TARGET_SCHEMA_VERSION) {
      try {
        console.log(`Ambre Migration | Migration de l'acteur ${actor.name} (ID: ${actor.id}, Type: ${actor.type}) de la version ${currentVersion} à ${AMBRE_TARGET_SCHEMA_VERSION}.`);
        if (await migrateAmbreActorData(actor)) {
          migratedActorCount++;
        } else {
          // If migrateAmbreActorData returned false, it means no specific data fields were changed.
          // However, the schema version still needs to be updated if it was lower.
          console.log(`Ambre Migration | Actor ${actor.name} (${actor.type}): Aucune donnée spécifique à migrer, mise à jour de la version du schéma.`);
          await actor.update({'system.schemaVersion': AMBRE_TARGET_SCHEMA_VERSION});
        }
      } catch (err) {
        console.error(`Ambre Migration | Échec de la migration pour l'acteur ${actor.name} (ID: ${actor.id}). Erreur:`, err);
      }
    }
  }
  // --- Item Migration ---
  console.log("Ambre Migration | Démarrage de la migration des objets...");
  const allItems = game.items.contents; // Get all items regardless of type

  for (const item of allItems) {
    const currentVersion = item.system.schemaVersion || 0; // Items might not have schemaVersion, default to 0
    if (currentVersion < AMBRE_TARGET_SCHEMA_VERSION) {
    try {
      console.log(`Ambre Migration | Migration de l'objet ${item.name} (ID: ${item.id}, Type: ${item.type}) de la version ${currentVersion} à ${AMBRE_TARGET_SCHEMA_VERSION}.`);
        if (await migrateAmbreItemData(item)) {
      migratedItemCount++;
    } else {
          // If migrateAmbreItemData returned false, it means no specific data fields were changed.
          // However, the schema version still needs to be updated if it was lower.
          console.log(`Ambre Migration | Item ${item.name} (${item.type}): Aucune donnée spécifique à migrer, mise à jour de la version du schéma.`);
          await item.update({'system.schemaVersion': AMBRE_TARGET_SCHEMA_VERSION});
        }
      } catch (err) {
        console.error(`Ambre Migration | Échec de la migration pour l'objet ${item.name} (ID: ${item.id}, Type: ${item.type}). Erreur:`, err);
      }
    }
  }

  // --- Final Notification ---
  let notificationMessage = "Migration Ambre terminée. ";
  if (migratedActorCount > 0) {
    notificationMessage += `${migratedActorCount} acteur(s) ont eu leurs données migrées. `;
  } else {
    notificationMessage += `Aucun acteur n'a nécessité de migration de données spécifique. `;
  }
  if (migratedItemCount > 0) {
    notificationMessage += `${migratedItemCount} objet(s) ont eu leurs données migrées.`;
  }
  ui.notifications.info(notificationMessage, { permanent: true });

  // Final check for any remaining un-migrated actors/items (should be none if successful)
  const actorsStillNotUpToDate = game.actors.filter(a => (a.system.schemaVersion || 0) < AMBRE_TARGET_SCHEMA_VERSION);
  const itemsStillNotUpToDate = game.items.filter(i => (i.system.schemaVersion || 0) < AMBRE_TARGET_SCHEMA_VERSION);
  if (actorsStillNotUpToDate.length > 0) {
      ui.notifications.warn(`${actorsStillNotUpToDate.length} acteur(s) n'ont pas pu être mis à jour à la version de schéma ${AMBRE_TARGET_SCHEMA_VERSION}. Vérifiez la console pour les erreurs.`, {permanent: true});
  }
  if (itemsStillNotUpToDate.length > 0) {
      ui.notifications.warn(`${itemsStillNotUpToDate.length} objet(s) n'ont pas pu être mis à jour à la version de schéma ${AMBRE_TARGET_SCHEMA_VERSION}. Vérifiez la console pour les erreurs.`, {permanent: true});
  }
}