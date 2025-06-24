console.log("Ambre | ombreItemSheet.js SCRIPT LOADED"); // <-- ADD THIS LINE

const NIVEAUX_TECHNOLOGIQUES = {
    "1 Formes Primitives": {
        description: "La vie intelligente n'existe pas encore. Quelques formes de vie primitive, telles que des microorganismes ou des organismes unicellulaires, commencent à apparaître dans des environnements spécifiques comme les sources chaudes.",
        locomotion: "Flottement, dérive",
        communication: "Réactions chimiques, mouvements cellulaires",
        armes: "Défenses naturelles, toxines"
    },
    "2 Préhistoire": {
        description: "Les humains commencent à utiliser des outils de pierre, maîtrisent le feu et vivent en tant que chasseurs-cueilleurs. Les premières structures rudimentaires apparaissent, ainsi que les premières formes d'art telles que les peintures rupestres.",
        locomotion: "Radeaux, traîneaux",
        communication: "Tambours, signaux de fumée",
        armes: "Lances, haches en pierre"
    },
    "3 Antiquité": {
        description: "Les civilisations anciennes émergent avec des structures sociales complexes, l'écriture, la métallurgie (bronze et fer), et le commerce. Les grandes cités, temples et pyramides sont construits, et les premiers empires naissent.",
        locomotion: "Chariots, bateaux à voile",
        communication: "Papyrus, messagers à pied",
        armes: "Épées en bronze, arcs"
    },
    "4 Moyen-Âge et Renaissance": {
        description: "Ce niveau est caractérisé par des sociétés féodales, des châteaux, des chevaliers et des batailles médiévales. Il inclut également l'éveil culturel et scientifique de la Renaissance avec l'apparition de l'imprimerie, des grandes explorations maritimes, et des avancées en médecine et en art.",
        locomotion: "Chevaux, caravelles",
        communication: "Lettres, pigeons voyageurs",
        armes: "Épées en acier, arbalètes"
    },
    "5 Révolution Industrielle": {
        description: "L'industrialisation transforme les sociétés avec l'avènement de la machine à vapeur, des chemins de fer, et de la colonisation de nouveaux continents. Les révolutions politiques et sociales marquent cette époque, avec des mouvements vers plus de droits et de libertés.",
        locomotion: "Locomotives, bateaux à vapeur",
        communication: "Télégraphes, journaux",
        armes: "Mousquets, canons"
    },
    "6 Période Contemporaine": {
        description: "L'électricité, les télécommunications, et les automobiles révolutionnent le quotidien. Les guerres mondiales montrent l'impact des technologies modernes sur la guerre et la politique mondiale. Les balbutiements des IA et les énergies renouvelables font leur apparition. (Notre époque actuelle)",
        locomotion: "Voitures, avions",
        communication: "Téléphones, radios",
        armes: "Bombes nucléaires, fusils, grenades"
    },
    "7 Découverte Spatiale": {
        description: "Les voyages dans l'espace deviennent réalité, avec des missions habitées vers d'autres corps célestes. L'intelligence artificielle et la robotique commence à jouer un rôle significatif dans les sociétés humaines.",
        locomotion: "Navettes spatiales, voitures électriques",
        communication: "Emails, réseaux informatiques",
        armes: "Lasers, drones"
    },
    "8 Période Connectée": {
        description: "L'intégration complète des technologies de communication permet une conscience collective numérique, où les réalités virtuelles sont indiscernables de la réalité. La société est profondément interconnectée.",
        locomotion: "Véhicules volants autonomes, drones",
        communication: "Réalités virtuelles, réseaux neuraux",
        armes: "Armes à énergie, cyberarmes"
    },
    "9 Essor des Robots et IA": {
        description: "Les robots et l'intelligence artificielle dominent de nombreux aspects de la vie quotidienne et industrielle, souvent surpassant les capacités humaines dans divers domaines.",
        locomotion: "Exosquelettes robotiques, véhicules autonomes",
        communication: "Interfaces neuronales, réseaux d'IA",
        armes: "Drones de combat autonomes, nanotechnologies destructrices"
    },
    "10 Epuration Robotique": {
        description: "Une période de conflits ou de nettoyage systématique des robots et des IA, menant à une nouvelle ère de domination ou de cohabitation. Les sociétés humaines peuvent tenter de reprendre le contrôle ou de trouver un équilibre avec les machines.",
        locomotion: "Exosquelettes, véhicules blindés",
        communication: "Réseaux cryptés, brouilleurs",
        armes: "EMP, armes antirobots"
    },
    "11 Expansion Spatiale": {
        description: "La colonisation de nouvelles planètes et les voyages interstellaires deviennent fréquents aidés part les Robots et IA enfin maitrisé. Les technologies de terraformation permettent de rendre habitables des mondes auparavant inhospitaliers.",
        locomotion: "Vaisseaux interstellaires, rovers",
        communication: "Communication subspatiale, hologrammes",
        armes: "Armes à plasma, canons à énergie"
    },
    "12 Essor des Civilisations Aliens": {
        description: "Les humains ne sont plus seuls dans l'univers. Les civilisations extraterrestres sont découvertes, entraînant des échanges culturels, des alliances et parfois des conflits interstellaires.",
        locomotion: "Vaisseaux interstellaires hybrides, portails de téléportation",
        communication: "Réseaux interstellaires, télépathie technologique",
        armes: "Armes biologiques avancées, désintégrateurs"
    },
    "13 Extinction des Espèces": {
        description: "Une période où les civilisations extraterrestres et humaines subissent une extinction généralisée, souvent à la suite de guerres interstellaires, de catastrophes climatiques majeures ou d'effondrements structurels des sociétés avancées. Les mondes autrefois peuplés et dynamiques sont désormais déserts et abandonnés.",
        locomotion: "Ruines de vaisseaux interstellaires, véhicules abandonnés",
        communication: "Réseaux de communication hors service, messages d'urgence oubliés",
        armes: "Armes défectueuses, systèmes d'armement inactifs"
    },
    "14 Renaissance Chaotique": {
        description: "Après une période de déclin ou de catastrophe, les civilisations tentent de se reconstruire, souvent dans un contexte anarchique et désorganisé. Les technologies anciennes sont redécouvertes et réutilisées de manière improvisée. Ce niveau peut rester à la fin ou être intercalé entre n'importe quel autre niveau supérieur au niveau 6.",
        locomotion: "Véhicules réparés, montures génétiquement modifiées",
        communication: "Réseaux locaux improvisés, signaux de fumée avancés",
        armes: "Armes bricolées, technologies anciennes réactivées"
    }
};

const NIVEAUX_MAGIQUES = {
    "1 Absence de Magie": {
        description: "Univers où la magie n'existe pas et où seule la technologie fonctionne. Il n'y a que la Marelle, le Logrus ou les Atouts qui permettent d'atteindre et de fonctionner dans ses Ombres. La Métamorphose, l'Abreuvoir ou les Mots de Pouvoir ne fonctionnent pas."
    },
    "2 Magie Primordiale & Draconique": {
        description: "Utilisation de la magie brute et instable, souvent liée à des forces élémentaires et draconiques. La magie est puissante mais difficile à contrôler, il y a donc peu de magicien humain. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets de l'Abyss sont doublés. Les Dragons des Ambriens peuvent se rendre dans ce type d'Ombre, sans risque. Mais pour cela, il faudra trouver le moyen de les téléporter directement dans ces Ombres, car dans les autres Ombres, ils ne viveraient que quelques secondes, avant de partir en poussière. N'oubliez pas que les Dragons des Ambriens ne peuvent survivre qu'à Ambre et le Cercle d'Or."
    },
    "3 Magie Tribale et Totémique": {
        description: "Magie chamanique et rituelle, souvent liée aux esprits de la nature et des ancêtres, utilisant des totems et des symboles sacrés. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets de l'Orbochromat sont doublés."
    },
    "4 Magie Alchimique et Rituelle": {
        description: "Utilisation de la magie pour transformer les substances et créer des potions, ainsi que des rituels complexes pour canaliser la magie. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets du Pentacre sont doublés."
    },
    "5 Magie Colorée": {
        description: "Magie caractéristique des univers colorés tels que les bandes dessinées, dessins animés, les mangas et les romans fantastiques, où la magie est souvent exubérante et imaginative. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets du Chimerion sont doublés."
    },
    "6 Magie Héroïque": {
        description: "Magie personnelle utilisée par des héros ou des individus privilégiés dans des univers de superhéros, où seuls quelques élus possèdent des pouvoirs magiques. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets de l'Abreuvoir sont doublés."
    },
    "7 Magie Inversée ou Fluctuante": {
        description: "Magie imprévisible où les effets peuvent varier, se retourner contre l'utilisateur ou fonctionner de manière aléatoire. L'ensemble des pouvoirs des Ambriens fonctionnent, mais leurs effets sont incontrôlables, sauf pour le Logrus."
    },
    "8 Magie Runique et Parchemins": {
        description: "Utilisation de symboles, runes et parchemins complexes pour canaliser et contrôler la magie. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets de la Magie de Langh sont doublés."
    },
    "9 Magie Temporelle et Dimensionelle": {
        description: "Magie permettant de manipuler le temps et l'espace, voyager à travers les dimensions et altérer la réalité. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets des Sabliers d'Ujuhé sont doublés."
    },
    "10 Magie Divine et Cosmique": {
        description: "Magie puisant dans des forces divines ou cosmiques, souvent impliquant des entités supérieures ou des énergies universelles. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets de la Marelle sont doublés."
    },
    "11 Magie Psionique": {
        description: "Utilisation de pouvoirs mentaux et psychiques, permettant des capacités telles que la télépathie, la télékinésie et la manipulation mentale. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets du CoeurFlamme sont doublés."
    },
    "12 Magie Mutante": {
        description: "Magie permettant aux humains de se transformer en créatures hybrides comme les loupgarous, oursgarous et autres. Cette magie exploite les forces primordiales et les instincts animaux, donnant naissance à des transformations puissantes et souvent terrifiantes. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets de la Métamorphose sont doublés."
    },
    "13 Magie Courante": {
        description: "La Magie Courante englobe tous les types de magie des autres niveaux, permettant une flexibilité maximale dans l’utilisation des pouvoirs magiques. Les utilisateurs peuvent pratiquer tous les types de magie, que ce soit la magie élémentaire, divine, runique, technomagique, ou toute autre forme présente dans les niveaux inférieurs. Cette omnipotence magique permet une variété et une puissance impressionnantes dans les actions magiques. L'ensemble des pouvoirs des Ambriens fonctionnent. Les effets de l'Harmonium sont doublés."
    },
    "14 Magie Unique": {
        description: "La Magie Unique est caractérisé par l'utilisation exclusive de pouvoirs spécifiques à l'univers d'Ambre. Ce niveau de magie se distingue par sa singularité et son exclusivité, nécessitant une maîtrise approfondie des pouvoirs ambriens pour accéder à ses Ombres. L'entrée dans ces univers particuliers est souvent verrouillée, nécessitant une compréhension et une maîtrise approfondie de pouvoirs uniques et complexes. Un seul pouvoir Ambrien fonctionne dans ces Ombres. Les effets de de ce pouvoir sont doublés. Accès Spécifique aux Ombres : Pour entrer dans ces Ombres, il est nécessaire de maîtriser le pouvoir au niveau 16 et de trouver l'entrée cachée ou secrète qui mène à ces univers. L'accès est souvent limité aux seuls Princes ou Princesses qui possèdent une compréhension complète de ce pouvoir."
    },
    "15 Magie Ambrienne": {
        description: "À Ambre et dans le Cercle d'Or, la plupart des formes de magie sont inopérantes en raison de la proximité de la Marelle.. Cependant, la Marelle ellemême fonctionne sans contrainte dans ces régions. Cela signifie que si vous possédez des pouvoirs magiques, il est essentiel de vérifier s'ils sont utilisables à Ambre, car beaucoup d'entre eux seront neutralisés par la présence de la Marelle."
    }
};

export default class ombreItemSheet extends ItemSheet {
    constructor(...args) {
        super(...args);
        this._leftColumnStateInitialized = false; // For initial width adjustment
        this._initialWidthAdjusted = false; // For the right-side panel
    }

    static get  defaultOptions() {
return foundry.utils.mergeObject(super.defaultOptions, {
        classes: ["ambre", "sheet", "item", "ombre-card-sheet"],
        template: "systems/ambre/templates/sheets/ombre-sheet.hbs", // Corrected path
        width: 800, // Adjusted from 900. Center column is 750px, allowing for padding.
        height: 620,
        resizable: true,
      });
    }

    get template() {
        return `systems/ambre/templates/sheets/ombre-sheet.hbs`;
    }

    async getData(options) {
        const context = await super.getData(options);
        const item = context.item;
        // item here is this.item, which is the document for which the sheet is being rendered.
        // Ensure system.controlePouvoirs is a number for the template context
        if (item.system && item.system.hasOwnProperty('controlePouvoirs')) {
            const parsedValue = parseInt(item.system.controlePouvoirs, 10);
            item.system.controlePouvoirs = isNaN(parsedValue) ? 0 : parsedValue;
        } else if (item.system) {
            item.system.controlePouvoirs = 0; // Default if not present
        }

        context.system = item.system;
        context.system.xCounter = item.system.xCounter || 1; // Ensure xCounter defaults to 1 for display
        // Ensure controlePouvoirsAmis is an array of objects, converting old string format if necessary
        let initialAmisData = item.system.controlePouvoirsAmis; 
        console.log(`Ambre | getData: Initial system.controlePouvoirsAmis from item data:`, JSON.parse(JSON.stringify(initialAmisData)));

        let actualAmisArray; 
        if (Array.isArray(initialAmisData)) {
            actualAmisArray = initialAmisData;
        } else if (typeof initialAmisData === 'object' && initialAmisData !== null) {
            // Attempt to convert from object {0: val, 1: val} to array [val, val]
            // This handles cases where Foundry might have stored an array as an object with numeric keys
            actualAmisArray = Object.values(initialAmisData);
            console.log(`Ambre | getData: Initial data for controlePouvoirsAmis was object-like, converted to array:`, JSON.parse(JSON.stringify(actualAmisArray)));
            // Optional: Consider immediately updating the item to fix the stored format if this conversion happens.
            // However, this might trigger re-render loops if not handled carefully.
            // For now, we'll just work with the corrected array in memory for this getData call.
        } else {
            actualAmisArray = []; 
        }

        // This mapping is for the template context.
        // It ensures each element in the array is a well-formed object for the template.
        context.system.controlePouvoirsAmis = actualAmisArray.map(ami => {
            if (typeof ami === 'string') {
                // This handles the legacy case where 'amis' might have been stored as simple strings
                return { name: ami, hasControl: false }; // Convert old string to new object format
            }
            // For objects, ensure they have the expected structure for the template
            return {
                name: (typeof ami === 'object' && ami !== null && ami.name !== undefined) ? String(ami.name) : "", // Ensure name is string
                hasControl: (typeof ami === 'object' && ami !== null && typeof ami.hasControl === 'boolean') ? ami.hasControl : false
            }
            // Ensure we only pass valid-looking objects to the template
            // Ensure we only pass valid-looking objects to the template
            }).filter(ami => typeof ami === 'object' && ami !== null && typeof ami.name === 'string' && typeof ami.hasControl === 'boolean');
        console.log(`Ambre | getData: Processed context.system.controlePouvoirsAmis for template:`, JSON.parse(JSON.stringify(context.system.controlePouvoirsAmis)));

        context.currentLivePossessingActorName = null; // For display when unlocked
        context.possessingPjActorName = null;
        let actualPossessingActor = null;

        console.log(`Ambre | getData for ombre: "${item.name}" (ID: ${item.id}, UUID: ${item.uuid}, isOwned: ${item.isOwned})`);
        if (item.isOwned && item.actor) {
            console.log(`Ambre |   Item is directly owned by Actor: "${item.actor.name}" (ID: ${item.actor.id}, Type: ${item.actor.type})`);
        } else if (item.isOwned && !item.actor) {
            console.warn(`Ambre |   Item isOwned is true, but item.actor is not defined for "${item.name}" (${item.id}). This might indicate an issue.`);
        }
        console.log(`Ambre |   Initial state: system.linked = ${context.system.linked}, system.locked = ${context.system.locked}`);

        // Step 1: Determine the actual possessing actor.
        // This determination is now independent of the 'system.linked' status.
        if (item.isOwned && item.actor) {
            // If the item sheet is for an item directly owned by an actor
            actualPossessingActor = item.actor;
            console.log(`Ambre |   Using direct owner: item.actor is "${actualPossessingActor.name}" (ID: ${item.actor.id}, Type: ${actualPossessingActor.type}).`);
        } else if (!item.isOwned) {
            // If the item sheet is for a world item (item.isOwned is false).
            // Attempt to find if any actor in the game has an item with this specific (world item's) ID.
            console.log(`Ambre |   Item is a world item (isOwned: false). Performing general search for any actor possessing this specific item ID (${item.id})...`);
            actualPossessingActor = game.actors.find(actor => actor.items.has(item.id));
            if (actualPossessingActor) {
                console.log(`Ambre |   General search found an actor: "${actualPossessingActor.name}" (ID: ${actualPossessingActor.id}, Type: ${actualPossessingActor.type}) possessing item ID ${item.id}.`);
            } else {
                console.warn(`Ambre |   General search: No actor found possessing an item with the world item's ID "${item.id}".`);
            }
        }
        // If item.isOwned is true but item.actor is null/undefined, actualPossessingActor remains null.

        // Manual actor linking (and thus enrichedLinkedActors) has been removed.
        // The system.linkedActors field on the item will no longer be used by this sheet.

        // Step 2: Populate possessingPjActorName.
        if (context.system.locked) {
            if (context.system.possessingActorNameOnLock) {
                context.possessingPjActorName = context.system.possessingActorNameOnLock;
                console.log(`Ambre | Item is locked. Using stored owner name: "${context.possessingPjActorName}".`);
            } else {
                console.log(`Ambre | Item is locked, but no 'possessingActorNameOnLock' was stored.`);
            }
            // currentLivePossessingActorName remains null as we show the locked-in name
        } else {
            if (actualPossessingActor) {
                context.currentLivePossessingActorName = actualPossessingActor.name;
                console.log(`Ambre | Item is UNLOCKED. Current live possessor: "${context.currentLivePossessingActorName}".`);
            }
            // possessingPjActorName remains null as it's for the locked state display
        }

        // --- Prepare Dynamic Attribute Descriptions ---
        context.dynamicDescriptions = {}; // Initialize

        // Determine characteristic values to use for calculations
        let physiqueValueForCalc = 0, enduranceValueForCalc = 0, psycheValueForCalc = 0, perceptionValueForCalc = 0;
        let physiqueSource = "None", enduranceSource = "None", psycheSource = "None", perceptionSource = "None";

        if (context.system.locked) {
            physiqueValueForCalc = Number(context.system.storedPhysique) || 0;
            enduranceValueForCalc = Number(context.system.storedEndurance) || 0;
            psycheValueForCalc = Number(context.system.storedPsyche) || 0;
            perceptionValueForCalc = Number(context.system.storedPerception) || 0;
            physiqueSource = `Stored (Locked): ${physiqueValueForCalc}`;
            enduranceSource = `Stored (Locked): ${enduranceValueForCalc}`;
            psycheSource = `Stored (Locked): ${psycheValueForCalc}`;
            perceptionSource = `Stored (Locked): ${perceptionValueForCalc}`;
            console.log(`Ambre | Using STORED stats for dynamic descriptions because item is locked.`);
        } else if (actualPossessingActor) {
            physiqueValueForCalc = actualPossessingActor.system.physique || 0;
            enduranceValueForCalc = actualPossessingActor.system.endurance || 0;
            psycheValueForCalc = actualPossessingActor.system.psyche || 0;
            perceptionValueForCalc = actualPossessingActor.system.perception || 0;
            physiqueSource = `Live Actor (${actualPossessingActor.name}): ${physiqueValueForCalc}`;
            enduranceSource = `Live Actor (${actualPossessingActor.name}): ${enduranceValueForCalc}`;
            psycheSource = `Live Actor (${actualPossessingActor.name}): ${psycheValueForCalc}`;
            perceptionSource = `Live Actor (${actualPossessingActor.name}): ${perceptionValueForCalc}`;
            console.log(`Ambre | Using LIVE stats from actor "${actualPossessingActor.name}" for dynamic descriptions.`);
        } else {
            physiqueSource = "No Actor (Unlocked): 0";
            enduranceSource = "No Actor (Unlocked): 0";
            psycheSource = "No Actor (Unlocked): 0";
            perceptionSource = "No Actor (Unlocked): 0";
            console.log(`Ambre | No possessing actor and item not locked. Using default 0 for stats in dynamic descriptions.`);
        }
        
        // Prepare data for Niveaux Technologiques
        const selectedTechLevelKey = context.system.niveauTechnologique || "1 Formes Primitives";
        context.dynamicDescriptions.niveauTechnologique = NIVEAUX_TECHNOLOGIQUES[selectedTechLevelKey] || NIVEAUX_TECHNOLOGIQUES["1 Formes Primitives"];

        // Prepare data for Niveaux Magiques
        const selectedMagicLevelKey = context.system.niveauMagie || "1 Absence de Magie"; // Default to first magic level
        context.dynamicDescriptions.niveauMagie = NIVEAUX_MAGIQUES[selectedMagicLevelKey] || NIVEAUX_MAGIQUES["1 Absence de Magie"];

        // Prepare linked Journal Entries
        context.linkedJournals = [];
        if (item.system.linkedJournalUUIDs && Array.isArray(item.system.linkedJournalUUIDs)) {
            for (const uuid of item.system.linkedJournalUUIDs) {
                const journal = await fromUuid(uuid);
                if (journal) {
                    context.linkedJournals.push(journal);
                } else {
                    console.warn(`Ambre | OmbreItemSheet: Could not find JournalEntry with UUID: ${uuid}`);
                }
            }
        }

        if (true) { // This block will always run to set descriptions, using defaults if no actor/stored stats
            // console.log(`Ambre | Calculating dynamic descriptions. Locked: ${context.system.locked}, Actor: ${actualPossessingActor ? actualPossessingActor.name : 'None'}`);

            // --- Contrôle de l'Ombre ---
            const controleOmbreLevel = parseInt(context.system.controleOmbre, 10) || 0;
            let controleOmbreDesc = "Non Applicable";

            if (controleOmbreLevel === 5) controleOmbreDesc = "Contrôle de l'environnement. Vous contrôlez la pluie et le beau temps !";
            else if (controleOmbreLevel === 10) controleOmbreDesc = "Contrôle du vivant. Vous contrôlez les créatures et les êtres vivants de votre Ombre.";
            else if (controleOmbreLevel === 15) controleOmbreDesc = "Création / destruction. Vous pouvez créer ce que vous voulez dans votre Ombre, il n’y a que votre imagination pour vous limiter. Et puis le détruire si cela vous chante.";
            
            context.dynamicDescriptions.controleOmbre = controleOmbreDesc;
            console.log(`Ambre | Contrôle de l'Ombre Level: ${controleOmbreLevel}, Desc: ${controleOmbreDesc}`);

            // --- Gardien de l'Ombre ---
            const gardienOmbreLevel = parseInt(context.system.gardienOmbre, 10) || 0;
            let gardienOmbreDesc = "Non Applicable";

            if (gardienOmbreLevel === 5) gardienOmbreDesc = "Gardien de l'ombre pouvant repousser un Chaosien ou une troupe de démons.";
            else if (gardienOmbreLevel === 10) gardienOmbreDesc = "Puissant Gardien de l'ombre pouvant repousser un Ambrien de 2nde génération.";
            else if (gardienOmbreLevel === 15) gardienOmbreDesc = "Gardien immortel pouvant repousser un Ambrien de 1ière génération.";
            
            context.dynamicDescriptions.gardienOmbre = gardienOmbreDesc;
            console.log(`Ambre | Gardien de l'Ombre Level: ${gardienOmbreLevel}, Desc: ${gardienOmbreDesc}`);

            // --- Contrôle du Destin ---
            const controleDestinLevel = parseInt(context.system.controleDestin, 10) || 0;
            let controleDestinDesc = "Non Applicable";

            if (controleDestinLevel === 5) controleDestinDesc = "L'Ombre peut se déplacer et se trouver sur le chemin d'un humain qui utilise la sorcellerie (portail magique). Affichez l’image de l’humain sur les affiches, les murs et autres supports publicitaires de votre Ombre personnelle, pour que cela fonctionne.";
            else if (controleDestinLevel === 10) controleDestinDesc = "L'Ombre peut se déplacer et se trouver sur le chemin d'un Chaosien qui utilise la sorcellerie (Portail magique). Affichez l’image du Chaosien sur les affiches, les murs et autres supports publicitaires de votre Ombre personnelle, pour que cela fonctionne.";
            else if (controleDestinLevel === 15) controleDestinDesc = "L'Ombre peut se déplacer et se trouver sur le chemin d'un Ambrien qui utilise la marelle. Vous souhaitez que Fiona visite votre Ombre lors d’un voyage avec la Marelle. Affichez l’image de Fiona, sur les affiches, les murs et autres supports publicitaires de votre Ombre personnelle, pour que cela fonctionne.";
            
            context.dynamicDescriptions.controleDestin = controleDestinDesc;
            console.log(`Ambre | Contrôle du Destin Level: ${controleDestinLevel}, Desc: ${controleDestinDesc}`);

            // --- Contrôle Temporel ---
            const controleTemporelLevel = parseInt(context.system.controleTemporel, 10) || 0;
            let controleTemporelDesc = "Non Applicable";

            if (controleTemporelLevel === 5) controleTemporelDesc = "Accélération/Ralentissement X 2 (1h Ombre = 3h Ambre / 1h Ombre = 12h Ambre).";
            else if (controleTemporelLevel === 10) controleTemporelDesc = "Accélération/Ralentissement X 4 (1h Ombre = 1h30 Ambre / 1h Ombre = 24h Ambre).";
            else if (controleTemporelLevel === 15) controleTemporelDesc = "Accélération/Ralentissement X 6 (1h Ombre = 1h Ambre / 1h Ombre = 36h Ambre).";
            
            context.dynamicDescriptions.controleTemporel = controleTemporelDesc;
            console.log(`Ambre | Contrôle Temporel Level: ${controleTemporelLevel}, Desc: ${controleTemporelDesc}`);

            // --- Blocage Communications ---
            const blocageCommunicationsLevel = parseInt(context.system.blocageCommunications, 10) || 0;
            let blocageCommunicationsDesc = "Non Applicable";

            if (blocageCommunicationsLevel === 5) blocageCommunicationsDesc = "Communications psychiques restreintes aux Pouvoirs activés.";
            else if (blocageCommunicationsLevel === 10) blocageCommunicationsDesc = "Communications restreintes aux Pouvoirs activés, détection d'activation.";
            else if (blocageCommunicationsLevel === 15) blocageCommunicationsDesc = "Communications restreintes, détection à distance, contenu audible dans l'Ombre.";
            
            context.dynamicDescriptions.blocageCommunications = blocageCommunicationsDesc;
            console.log(`Ambre | Blocage Communications Level: ${blocageCommunicationsLevel}, Desc: ${blocageCommunicationsDesc}`);

            // --- Blocage des Accès ---
            const blocageAccesLevel = parseInt(context.system.blocageAcces, 10) || 0;
            let blocageAccesDesc = "Non Applicable";

            if (blocageAccesLevel === 5) blocageAccesDesc = "Accès conditionné à plusieurs règles. Alerte gardien si entrée franchie.";
            else if (blocageAccesLevel === 10) blocageAccesDesc = "Accès restreint à une unique règle. Alerte vous et gardien si entrée franchie.";
            else if (blocageAccesLevel === 15) blocageAccesDesc = "Accès restreint à un unique point d'entrée. Alerte vous et gardien si entrée franchie.";
            
            context.dynamicDescriptions.blocageAcces = blocageAccesDesc;
            console.log(`Ambre | Blocage des Accès Level: ${blocageAccesLevel}, Desc: ${blocageAccesDesc}`);

            // --- Omniscience Divine ---
            const omniscienceDivineLevel = parseInt(context.system.omniscienceDivine, 10) || 0;
            let omniscienceDivineDesc = "Non Applicable";
            const perceptionVal = Number(perceptionValueForCalc) || 0; // Ensure it's a number for calculation

            if (omniscienceDivineLevel === 5) {
                omniscienceDivineDesc = `Prévenance d'événements anormaux : ${perceptionVal * 10} secondes.`;
            } else if (omniscienceDivineLevel === 10) {
                omniscienceDivineDesc = `Prévenance d'événements anormaux : ${perceptionVal} secondes.`;
            } else if (omniscienceDivineLevel === 15) {
                omniscienceDivineDesc = `Prévenance d'événements anormaux : ${Math.floor(perceptionVal / 10)} secondes.`; // Using Math.floor for cleaner display
            }
            
            context.dynamicDescriptions.omniscienceDivine = omniscienceDivineDesc;
            console.log(`Ambre | Omniscience Divine Level: ${omniscienceDivineLevel}, Perception (${perceptionSource}), Desc: ${omniscienceDivineDesc}`);

            // --- Contrôle des Pouvoirs ---
            const controlePouvoirsLevel = parseInt(context.system.controlePouvoirs, 10) || 0;
            let controlePouvoirsDesc = "Non Applicable";

            if (controlePouvoirsLevel === 5) controlePouvoirsDesc = "Seul vous activez/désactivez vos pouvoirs (niv. 8+).";
            else if (controlePouvoirsLevel === 10) controlePouvoirsDesc = "Vous/gardien activez/désactivez pouvoirs (niv. 8+). Gardien peut bloquer intrus.";
            else if (controlePouvoirsLevel === 15) controlePouvoirsDesc = "Vous/gardien/amis activez/désactivez pouvoirs (niv. 8+).";
            
            context.dynamicDescriptions.controlePouvoirs = controlePouvoirsDesc;
            console.log(`Ambre | Contrôle des Pouvoirs Level: ${controlePouvoirsLevel}, Desc: ${controlePouvoirsDesc}`);

        } else {
            // This else block for dynamicDescriptions is no longer strictly needed as the logic above handles all cases.
            // However, ensuring keys exist if no calculations happened (e.g. if the `if(true)` was conditional) is good practice.
            context.dynamicDescriptions.controleOmbre = null;
            context.dynamicDescriptions.gardienOmbre = null;
            context.dynamicDescriptions.controleDestin = null;
            context.dynamicDescriptions.controleTemporel = null;
            context.dynamicDescriptions.blocageCommunications = null;
            context.dynamicDescriptions.blocageAcces = null;
            context.dynamicDescriptions.omniscienceDivine = null;
            context.dynamicDescriptions.controlePouvoirs = null;
            // context.system.controlePouvoirsAmis is handled directly in getData
        }

        // Fetch list of "pouvoir" items for the Puissance dropdown
        const puissanceOptions = [
            "Abreuvoir",
            "Abysses",
            "Atouts",
            "Chimérion",
            "Coeur-Flamme",
            "Harmonium",
            "Logrus",
            "Magie",
            "Marelle",
            "Métamorphose",
            "Orbochromat",
            "Pentacre",
            "Sablier d'Ujuhe"
        ];
        // The template expects objects with _id and name properties.
        // For this static list, we can use the string itself for both.
        context.pouvoirsList = puissanceOptions.map(p => ({ _id: p, name: p }));

        await this._calculateAndUpdateTotalCost(); // Ensure total cost is up-to-date for rendering
        return context;
    }

    activateListeners(html) {
        super.activateListeners(html);
        // --- Hides attribute rows with a value of 0 when the sheet is locked ---
        if (this.item.system.locked) {
            html.find('.attribute-level-select').each((_index, selectElement) => {
                const select = $(selectElement);
                if (select.val() == "0" || select.val() == 0) {
                    const gridContainer = select.closest('.ombre-attributes-list');
                    if (!gridContainer.length) return;

                    const allChildren = gridContainer.children();
                    const niveauDiv = select.closest('.attribute-grid-niveau');
                    const niveauIndex = allChildren.index(niveauDiv);

                    if (niveauIndex > -1) {
                        // The row consists of 5 elements. The 'niveau' div is the 2nd element.
                        const startIndex = niveauIndex - 1;
                        for (let i = 0; i < 5; i++) {
                            if (allChildren[startIndex + i]) $(allChildren[startIndex + i]).hide();
                        }
                    }
                }
            });
        }
        // --- Listener for toggling the description editor ---
        const descriptionSection = html.find('section.sheet-body');
        const toggleEditorBtn = html.find('.toggle-description-editor');

        // Set initial visibility based on flag, default to visible
        const isVisible = this.item.getFlag("ambre", "descriptionEditorVisible") ?? false;
        if (!isVisible) {
            descriptionSection.hide();
        }

        toggleEditorBtn.on('click', ev => {
            ev.preventDefault();
            const isCurrentlyVisible = descriptionSection.is(':visible');
            descriptionSection.slideToggle(200);
            this.item.setFlag("ambre", "descriptionEditorVisible", !isCurrentlyVisible);
        });
        const panel = html.find('.ombre-side-panel');
        const toggleBtn = html.find('.toggle-panel-btn');
        const mainContent = html.find('.ombre-main-content'); // To push content

        const leftColumn = html.find('.ombre-left-column');
        const leftColumnToggleBtn = html.find('.toggle-left-center-column-btn');
        const leftColumnToggleIcon = leftColumnToggleBtn.find('i');
        const leftColumnWidth = 250; // Correction: Doit correspondre à flex-basis de .ombre-left-column dans CSS

    
        // Restore panel state if it was previously saved
        if (this.item.getFlag("ambre", "ombrePanelOpen")) {
            panel.addClass('open');
            mainContent.addClass('panel-pushed');
            toggleBtn.find('i').removeClass('fa-chevron-left').addClass('fa-chevron-right');
            // Adjust sheet width if panel is open by default
            if (!this._initialWidthAdjusted) {
                this.setPosition({ width: this.position.width + 300 + 35 }); // Add panel content width (300) + toggle area width (35)
                this._initialWidthAdjusted = true; // Prevent re-adjusting on subsequent renders
            }
        }
    
        toggleBtn.on('click', () => {
            const isOpen = panel.hasClass('open');
            let currentWidth = this.position.width;

            if (isOpen) {
            panel.removeClass('open');
            mainContent.removeClass('panel-pushed');
            toggleBtn.find('i').removeClass('fa-chevron-right').addClass('fa-chevron-left');
            this.setPosition({ width: currentWidth - (300 + 35) }); // Subtract panel content width + toggle area width
            } else {
            panel.addClass('open');
            mainContent.addClass('panel-pushed');
            toggleBtn.find('i').removeClass('fa-chevron-left').addClass('fa-chevron-right');
            this.setPosition({ width: currentWidth + (300 + 35) }); // Add panel content width + toggle area width
            }
            // Save panel state
            this.item.setFlag("ambre", "ombrePanelOpen", !isOpen);
        });

        // --- Left Column Toggle (between Left and Center) ---
        let isLeftColumnVisible = this.item.getFlag("ambre", "ombreLeftColumnVisible") || false; // Default to hidden

        if (!this._leftColumnStateInitialized) {
            if (isLeftColumnVisible) {
                leftColumn.show();
                leftColumnToggleIcon.removeClass('fa-chevron-right').addClass('fa-chevron-left');
                // Adjust sheet width as defaultOptions.width is for the hidden state
                this.setPosition({ width: this.position.width + leftColumnWidth });
            } else {
                leftColumn.hide(); // Ensure it's hidden if flag is false
                leftColumnToggleIcon.removeClass('fa-chevron-left').addClass('fa-chevron-right');
                // Width is already correct as per defaultOptions for hidden state
            }
            this._leftColumnStateInitialized = true;
        } else {
            // On subsequent renders (e.g., after item update), just ensure visibility matches flag
            if (isLeftColumnVisible) {
                leftColumn.show();
                leftColumnToggleIcon.removeClass('fa-chevron-right').addClass('fa-chevron-left');
            } else {
                leftColumn.hide();
                leftColumnToggleIcon.removeClass('fa-chevron-left').addClass('fa-chevron-right');
            }
        }

        leftColumnToggleBtn.on('click', () => {
            const currentlyVisible = leftColumn.is(':visible');
            const newVisibility = !currentlyVisible;
            let currentSheetWidth = this.position.width;

            leftColumn.toggle(newVisibility);
            leftColumnToggleIcon.toggleClass('fa-chevron-left fa-chevron-right');
            this.setPosition({ width: currentSheetWidth + (newVisibility ? leftColumnWidth : -leftColumnWidth) });
            this.item.setFlag("ambre", "ombreLeftColumnVisible", newVisibility);
        });

        // --- Collapsible Sections State Management ---
        const collapsibleHeaders = html.find('.ombre-collapsible-header');

        // // Initial state restoration for collapsible sections (REMOVED as per request)
        // collapsibleHeaders.each((_index, el) => {
        //     const header = $(el);
        //     const targetSectionId = header.data('target-section');
        //     const targetSection = html.find('#' + targetSectionId);

        //     if (targetSection.length) { // Ensure the target section exists in the DOM
        //         const flagName = `${targetSectionId}Open`;
        //         const isOpen = this.item.getFlag("ambre", flagName);

        //         if (isOpen === true) {
        //             targetSection.show(); // Show without animation for initial load
        //             header.addClass('open');
        //         } else {
        //             // If flag is false or undefined, ensure it's hidden (default HTML state)
        //             // and icon is in the closed state.
        //             targetSection.hide();
        //             header.removeClass('open');
        //         }
        //     }
        // });

        // Listener for toggling collapsible sections
        collapsibleHeaders.off('click.collapsible').on('click.collapsible', event => { // Added .collapsible namespace
            const header = $(event.currentTarget);
            const targetSectionId = header.data('target-section');
            const targetSection = html.find('#' + targetSectionId);

            if (targetSection.length) {
                const isCurrentlyHidden = targetSection.is(':hidden'); // State *before* toggle (true if it's about to open)
                
                let sectionHeightBeforeToggle = 0;
                if (!isCurrentlyHidden) { // If visible and about to close, get its height
                    sectionHeightBeforeToggle = targetSection.outerHeight(true) || 0;
                }

                targetSection.slideToggle(200, () => { // Callback exécuté après la fin de l'animation
                    // const isNowVisible = targetSection.is(':visible'); // State *after* toggle
                    // this.item.setFlag("ambre", flagName, isNowVisible); // REMOVED: Saving flag state no longer needed

                    let newHeight;
                    if (isCurrentlyHidden) { // Was hidden, now opening
                        const sectionHeightAfterToggle = targetSection.outerHeight(true) || 0;
                        newHeight = this.position.height + sectionHeightAfterToggle;
                    } else { // Was visible, now closing
                        newHeight = this.position.height - sectionHeightBeforeToggle;
                    }

                    // S'assurer que la fenêtre ne devient pas plus petite que sa hauteur par défaut
                    const defaultHeight = this.constructor.defaultOptions.height;
                    this.setPosition({ height: Math.max(newHeight, defaultHeight) });
                });
                header.toggleClass('open'); // Toggles icon immediately
            }
        });
        
        // Ensure all collapsible sections start closed and with the correct icon state
        // This is a safety net in case HTML defaults are somehow overridden before JS runs,
        // or if other parts of the code might show them.
        collapsibleHeaders.each((_index, el) => {
            const header = $(el);
            const targetSectionId = header.data('target-section');
            html.find('#' + targetSectionId).hide();
            header.removeClass('open'); // Ensures icon is in closed state
        });


        // --- Tooltip pour les descriptions d'attributs ---
        html.find('.attribute-info-icon').on('click', function(event) {
            event.stopPropagation(); // Empêche le clic de se propager au document immédiatement
            const icon = $(this);
            const tooltipId = icon.data('tooltip-id');
            const tooltip = html.find('#' + tooltipId);

            // Cache tous les autres tooltips ouverts
            html.find('.tooltip-popup.active').not(tooltip).removeClass('active').hide();

            // Bascule l'état du tooltip actuel
            tooltip.toggleClass('active');
            if (tooltip.hasClass('active')) {
                tooltip.fadeIn(100); // Ou .show() ou .slideDown()
            } else {
                tooltip.fadeOut(100); // Ou .hide() ou .slideUp()
            }
        });

        // Ferme les tooltips si on clique n'importe où ailleurs sur la fiche (sauf sur un autre tooltip/icône)
        html.on('click', function(event) {
            if (!$(event.target).closest('.attribute-info-icon').length && !$(event.target).closest('.tooltip-popup').length) {
                html.find('.tooltip-popup.active').removeClass('active').fadeOut(100);
            }
        });

        // --- Listener for attribute level select dropdowns ---
        html.find('.attribute-level-select').on('change', this._onAttributeLevelChange.bind(this));

        // Listener for Niveaux Technologiques dropdown change
        html.find('select[name="system.niveauTechnologique"]').on('change', this._onNiveauTechnologiqueChange.bind(this));
        // Listener for Niveaux de Magie dropdown change (can be added later if it needs dynamic updates)
        html.find('select[name="system.niveauMagie"]').on('change', this._onNiveauMagiqueChange.bind(this));

        // Listeners for Journal Entry management specific to Ombre items
        html.find('.ombre-linked-journals-section .journal-create-button').click(this._onOmbreJournalCreate.bind(this));
        html.find('.ombre-linked-journals-section .journal-edit').click(this._onOmbreJournalEdit.bind(this));
        html.find('.ombre-linked-journals-section .journal-unlink').click(this._onOmbreJournalUnlink.bind(this));
        // Note: _onDrop will handle journal drops if the drop target has 'journal-drop-target' class


        this._updateAttributeDescriptionTexts(html); // Initialize description texts
        
        // Listener for the refresh possessing actor icon
        html.find('.refresh-possessing-actor').click(async ev => {
            ev.preventDefault();
            console.log(`Ambre | 'Refresh & Lock' button clicked for ombre: "${this.item.name}".`);
            if (this.item.system.locked) {
                ui.notifications.warn("L'action de rafraîchissement est désactivée car l'ombre est verrouillé.");
                console.log(`Ambre |   Action aborted: ombre is already locked.`);
                return;
            }
            // This button now explicitly handles stat refresh logic AND locking.
            const { statUpdateData, notificationKey, actorNameForNotification } = await this._handleStatRefreshLogic();
            
            const finalUpdateData = {
                ...statUpdateData, // Apply stat changes (or no changes if preserving)
                "system.locked": true
            };

            await this.item.update(finalUpdateData);

            // Construct and display notification
            let notifMsg = `ombre "${this.item.name}" verrouillé. `;
            if (notificationKey === "statsStored") {
                notifMsg += `Statistiques de ${actorNameForNotification} stockées.`;
            } else if (notificationKey === "statsCleared") {
                notifMsg += `Aucune statistique d'acteur n'a été stockée (rafraîchissement autorisé, pas d'acteur trouvé, stats précédentes effacées).`;
            } else if (notificationKey === "statsPreservedOnRefreshAttempt") {
                notifMsg += `Les statistiques précédemment stockées ont été préservées (actualisation interdite).`;
            } else {
                notifMsg += `État des statistiques inchangé (comportement par défaut).`; // Fallback
            }
            ui.notifications.info(notifMsg);
            console.log(`Ambre |   Refresh & Lock: ${notifMsg}`);
        });

        // Listener for the toggle stat refresh on lock icon
        html.find('.toggle-stat-refresh-lock').click(async ev => {
            ev.preventDefault();
            if (this.item.system.locked) {
                ui.notifications.warn("L'ombre est verrouillé. Déverrouillez-le pour changer ce paramètre d'actualisation des stats.");
                return;
            }
            // Ensure allowStatRefreshOnLock has a boolean value, defaulting to true if somehow undefined.
            const currentAllowState = typeof this.item.system.allowStatRefreshOnLock === 'boolean' ? this.item.system.allowStatRefreshOnLock : true;
            console.log(`Ambre | 'Toggle Allow Stat Refresh on Lock' button clicked for "${this.item.name}". Current state: ${currentAllowState}. Changing to: ${!currentAllowState}.`);
            await this.item.update({"system.allowStatRefreshOnLock": !currentAllowState});
            if (!currentAllowState) { // It was false, now true
                ui.notifications.info(`L'actualisation des stats au verrouillage est maintenant AUTORISÉE pour "${this.item.name}".`);
            } else { // It was true, now false
                ui.notifications.info(`L'actualisation des stats au verrouillage est maintenant INTERDITE pour "${this.item.name}". Les stats existantes seront préservées au prochain verrouillage.`);
            }
            // Sheet re-renders due to item.update(), updating icon and title.
        });

        // Listener for the lock/unlock icon
        html.find('.toggle-ombre-lock').click(async ev => {
            ev.preventDefault();
            const currentLockState = this.item.system.locked || false;
            console.log(`Ambre | 'Toggle Lock/Unlock' icon clicked for ombre: "${this.item.name}". Current lock state: ${currentLockState}.`);
            if (currentLockState) { // Is currently locked, about to unlock
                await this.item.update({ "system.locked": false });
                ui.notifications.info(`ombre "${this.item.name}" déverrouillé. Les statistiques précédemment stockées sont préservées.`);
                console.log(`Ambre |   ombre was locked, now unlocked. Previously stored stats are preserved.`);
            } else {
                // Is currently unlocked, about to lock
                // This action now ONLY locks the item and preserves existing stats.
                // Stat refresh logic is handled by the "Refresh & Lock" button.
                await this.item.update({ "system.locked": true });
                ui.notifications.info(`ombre "${this.item.name}" verrouillé. Les statistiques précédemment stockées (le cas échéant) ont été préservées.`);
                console.log(`Ambre |   ombre is unlocked, now locked. Previously stored stats (if any) are preserved. Stat refresh logic NOT invoked by this action.`);
            }
        });

        // Listeners for the xCounter buttons
        html.find('.x-counter-decrement').click(async ev => {
            ev.preventDefault();
            if (this.item.system.locked) return;
            let currentXCounter = parseInt(this.item.system.xCounter) || 1;
            if (currentXCounter > 1) {
                await this.item.update({"system.xCounter": currentXCounter - 1});
                await this._calculateAndUpdateTotalCost();
            }
        });

        html.find('.x-counter-increment').click(async ev => {
            ev.preventDefault();
            if (this.item.system.locked) return;
            let currentXCounter = parseInt(this.item.system.xCounter) || 1;
            // You might want to add a maximum limit here if desired
            await this.item.update({"system.xCounter": currentXCounter + 1});
            await this._calculateAndUpdateTotalCost();
        });


        // Listener for clearing the stored possessing actor when locked
        html.find('.clear-possessing-actor-on-lock').click(async ev => {
            ev.preventDefault();
            // This button is now intended for use when the item is UNLOCKED,
            // to clear previously stored data.
            if (this.item.system.locked) {
                ui.notifications.warn("L'ombre doit être déverrouillé pour oublier les données stockées.");
                return;
            }
            if (this.item.system.possessingActorNameOnLock) {
                const confirmed = await Dialog.confirm({
                    title: "Confirmer l'oubli",
                    content: `<p>Voulez-vous vraiment oublier les données de l'acteur <strong>${this.item.system.possessingActorNameOnLock}</strong> (précédemment stockées) pour cet ombre ? Les statistiques (Physique, Endurance, etc.) associées seront également effacées.</p>`,
                    yes: () => true,
                    no: () => false,
                    defaultYes: false
                });

                if (confirmed) {
                    await this.item.update({
                        "system.possessingActorNameOnLock": null,
                        "system.possessingActorIdOnLock": null,
                        "system.storedPhysique": null,
                        "system.storedEndurance": null,
                        "system.storedPsyche": null,
                        "system.storedPerception": null
                    });
                    ui.notifications.info(`L'acteur possesseur stocké pour "${this.item.name}" a été oublié et les stats associées effacées.`);
                }
            } else {
                // This should ideally not be reached if the button is only visible when possessingActorNameOnLock exists.
                ui.notifications.info("Aucune donnée d'acteur précédemment stockée à oublier.");
            }
        });

        // --- Gestion des amis pour Contrôle des Pouvoirs ---
        // Ajouter un ami
        html.find('.add-controle-pouvoirs-ami').click(async ev => {
            if (this.item.system.locked) return;
            const currentAmisRaw = this.item.system.controlePouvoirsAmis;
            let currentAmisArray;

            if (Array.isArray(currentAmisRaw)) {
                currentAmisArray = currentAmisRaw;
            } else if (typeof currentAmisRaw === 'object' && currentAmisRaw !== null) {
                currentAmisArray = Object.values(currentAmisRaw); // Convert object-like to true array
            } else {
                currentAmisArray = [];
            }
            console.log(`Ambre | Add Friend: Current amis after initial read/conversion:`, JSON.parse(JSON.stringify(currentAmisArray)));

            // Normalize the current array to ensure all elements are objects
            const normalizedAmis = currentAmisArray.map(ami => {
                if (typeof ami === 'string') return { name: ami, hasControl: false };
                return { // Ensure existing objects have the correct structure
                    name: (typeof ami === 'object' && ami !== null && ami.name !== undefined) ? String(ami.name) : "",
                    hasControl: (typeof ami === 'object' && ami !== null && typeof ami.hasControl === 'boolean') ? ami.hasControl : false
                };
            }).filter(ami => typeof ami.name === 'string'); // Keep only valid-like objects

            normalizedAmis.push({ name: "", hasControl: false }); // Add the new friend object
            console.log(`Ambre | Add Friend: Amis after adding new, before update:`, JSON.parse(JSON.stringify(normalizedAmis)));
            await this.item.update({ "system.controlePouvoirsAmis": normalizedAmis });
            console.log(`Ambre | Add Friend: Item updated. Current item.system.controlePouvoirsAmis:`, JSON.parse(JSON.stringify(this.item.system.controlePouvoirsAmis)));
        });

        // Supprimer un ami
        html.find('.remove-controle-pouvoirs-ami').click(async ev => {
            if (this.item.system.locked) return;
            const indexToRemove = parseInt($(ev.currentTarget).data('index'));
            if (isNaN(indexToRemove)) return;

            const currentAmisRaw = this.item.system.controlePouvoirsAmis;
            let currentAmisArray;

            if (Array.isArray(currentAmisRaw)) {
                currentAmisArray = currentAmisRaw;
            } else if (typeof currentAmisRaw === 'object' && currentAmisRaw !== null) {
                currentAmisArray = Object.values(currentAmisRaw); // Convert object-like to true array
            } else {
                currentAmisArray = [];
            }
            console.log(`Ambre | Remove Friend: Current amis after initial read/conversion:`, JSON.parse(JSON.stringify(currentAmisArray)));

            // Normalize the array before splicing.
            const normalizedAmis = currentAmisArray.map(ami => {
                if (typeof ami === 'string') return { name: ami, hasControl: false };
                return {
                    name: (typeof ami === 'object' && ami !== null && ami.name !== undefined) ? String(ami.name) : "",
                    hasControl: (typeof ami === 'object' && ami !== null && typeof ami.hasControl === 'boolean') ? ami.hasControl : false
                };
            }).filter(ami => typeof ami.name === 'string');

            if (indexToRemove >= 0 && indexToRemove < normalizedAmis.length) {
                normalizedAmis.splice(indexToRemove, 1);
                console.log(`Ambre | Remove Friend: Amis after splicing, before update:`, JSON.parse(JSON.stringify(normalizedAmis)));
                await this.item.update({ "system.controlePouvoirsAmis": normalizedAmis });
                console.log(`Ambre | Remove Friend: Item updated. Current item.system.controlePouvoirsAmis:`, JSON.parse(JSON.stringify(this.item.system.controlePouvoirsAmis)));
            }
        });

        // Mettre à jour un nom d'ami
        html.find('.controle-pouvoirs-ami-input').change(async ev => {
            if (this.item.system.locked) return;
            const inputElement = $(ev.currentTarget);
            const nameParts = inputElement.attr('name').split('.');
            const indexToUpdate = parseInt(nameParts[2], 10);
            const newName = inputElement.val();
            console.log(`Ambre | Update Friend Name: index=${indexToUpdate}, newName='${newName}'`);

            if (isNaN(indexToUpdate)) {
                console.error("Ambre | Could not determine index for friend name update from name attribute:", inputElement.attr('name'));
                return;
            }

            const currentAmisRaw = this.item.system.controlePouvoirsAmis;
            let currentAmisArray;
            if (Array.isArray(currentAmisRaw)) {
                currentAmisArray = currentAmisRaw;
            } else if (typeof currentAmisRaw === 'object' && currentAmisRaw !== null) {
                currentAmisArray = Object.values(currentAmisRaw);
            } else {
                currentAmisArray = [];
            }
            console.log(`Ambre | Update Friend Name: Current amis after initial read/conversion:`, JSON.parse(JSON.stringify(currentAmisArray)));

            const updatedAmis = currentAmisArray.map((ami, index) => {
                let currentAmiObject = (typeof ami === 'object' && ami !== null) ? ami : { name: (typeof ami === 'string' ? String(ami) : ""), hasControl: false };
                if (typeof currentAmiObject.name !== 'string') currentAmiObject.name = "";
                if (typeof currentAmiObject.hasControl !== 'boolean') currentAmiObject.hasControl = false;

                if (index === indexToUpdate) {
                    return { ...currentAmiObject, name: newName };
                }
                return currentAmiObject;
            }).filter(ami => typeof ami.name === 'string');

            console.log(`Ambre | Update Friend Name: Amis after mapping, before update:`, JSON.parse(JSON.stringify(updatedAmis)));
            await this.item.update({ "system.controlePouvoirsAmis": updatedAmis });
            console.log(`Ambre | Update Friend Name: Item updated. Current item.system.controlePouvoirsAmis:`, JSON.parse(JSON.stringify(this.item.system.controlePouvoirsAmis)));
        });

        // Mettre à jour le checkbox "Contrôle" d'un ami
        html.find('.controle-pouvoirs-ami-checkbox').change(async ev => {
            if (this.item.system.locked) return;
            const checkbox = $(ev.currentTarget);
            const nameParts = checkbox.attr('name').split('.');
            const indexToUpdate = parseInt(nameParts[2], 10);
            const isChecked = checkbox.is(':checked');
            console.log(`Ambre | Update Friend Control: index=${indexToUpdate}, isChecked=${isChecked}`);

            if (isNaN(indexToUpdate)) {
                console.error("Ambre | Could not determine index for friend control update from name attribute:", checkbox.attr('name'));
                return;
            }
            
            const currentAmisRaw = this.item.system.controlePouvoirsAmis;
            let currentAmisArray;
            if (Array.isArray(currentAmisRaw)) {
                currentAmisArray = currentAmisRaw;
            } else if (typeof currentAmisRaw === 'object' && currentAmisRaw !== null) {
                currentAmisArray = Object.values(currentAmisRaw);
            } else {
                currentAmisArray = [];
            }
            console.log(`Ambre | Update Friend Control: Current amis after initial read/conversion:`, JSON.parse(JSON.stringify(currentAmisArray)));

            const updatedAmis = currentAmisArray.map((ami, index) => {
                let currentAmiObject = (typeof ami === 'object' && ami !== null) ? ami : { name: (typeof ami === 'string' ? String(ami) : ""), hasControl: false };
                if (typeof currentAmiObject.name !== 'string') currentAmiObject.name = "";
                if (typeof currentAmiObject.hasControl !== 'boolean') currentAmiObject.hasControl = false;

                if (index === indexToUpdate) {
                    return { ...currentAmiObject, hasControl: isChecked };
                }
                return currentAmiObject;
            }).filter(ami => typeof ami.name === 'string');

            console.log(`Ambre | Update Friend Control: Amis after mapping, before update:`, JSON.parse(JSON.stringify(updatedAmis)));
            await this.item.update({ "system.controlePouvoirsAmis": updatedAmis });
            console.log(`Ambre | Update Friend Control: Item updated. Current item.system.controlePouvoirsAmis:`, JSON.parse(JSON.stringify(this.item.system.controlePouvoirsAmis)));
        });
            
    } // End of activateListeners

    /**
     * Determines the actor stats to be stored based on allowStatRefreshOnLock.
     * Does NOT update the item directly and does NOT handle locking.
     * @private
     * @returns {Promise<{statUpdateData: object, notificationKey: string, actorNameForNotification: string|null}>}
     *          - statUpdateData: The data to update item stats (e.g., storedPhysique).
     *          - notificationKey: A key to identify the type of notification message.
     *          - actorNameForNotification: Name of the actor if stats were stored.
     */
    async _handleStatRefreshLogic() {
        console.log(`Ambre | _handleStatRefreshLogic called for ombre: "${this.item.name}".`);
        let actorToStoreStatsFrom = null;
        const item = this.item;
        const statUpdateData = {};
        let notificationKey = ""; // e.g., "statsStored", "statsCleared", "statsPreservedOnRefreshAttempt"
        let actorNameForNotification = null;

        // Determine the actor whose stats to potentially store
        if (item.isOwned && item.actor) {
            actorToStoreStatsFrom = item.actor;
            console.log(`Ambre |   _handleStatRefreshLogic: Item is owned by "${actorToStoreStatsFrom.name}".`);
        } else if (!item.isOwned) {
            actorToStoreStatsFrom = game.actors.find(a => a.items.has(item.id));
            if (actorToStoreStatsFrom) {
                console.log(`Ambre |   _handleStatRefreshLogic: Item is a world item, found possessed by "${actorToStoreStatsFrom.name}".`);
            } else {
                console.log(`Ambre |   _handleStatRefreshLogic: Item is a world item, and no actor currently possesses it.`);
            }
        } else {
            console.log(`Ambre |   _handleStatRefreshLogic: Item is marked as owned but has no actor reference.`);
        }

        if (this.item.system.allowStatRefreshOnLock) {
            console.log(`Ambre |   _handleStatRefreshLogic: Stat refresh is ALLOWED.`);
            if (actorToStoreStatsFrom) {
                statUpdateData["system.storedPhysique"] = actorToStoreStatsFrom.system.physique || 0;
                statUpdateData["system.storedEndurance"] = actorToStoreStatsFrom.system.endurance || 0;
                statUpdateData["system.storedPsyche"] = actorToStoreStatsFrom.system.psyche || 0;
                statUpdateData["system.storedPerception"] = actorToStoreStatsFrom.system.perception || 0;
                statUpdateData["system.possessingActorNameOnLock"] = actorToStoreStatsFrom.name;
                statUpdateData["system.possessingActorIdOnLock"] = actorToStoreStatsFrom.id;
                notificationKey = "statsStored";
                actorNameForNotification = actorToStoreStatsFrom.name;
                console.log(`Ambre |   _handleStatRefreshLogic: Prepared to store stats for ${actorToStoreStatsFrom.name}.`);
            } else {
                // Refresh allowed, but no actor found. Clear existing stored stats.
                statUpdateData["system.storedPhysique"] = null;
                statUpdateData["system.storedEndurance"] = null;
                statUpdateData["system.storedPsyche"] = null;
                statUpdateData["system.storedPerception"] = null;
                statUpdateData["system.possessingActorNameOnLock"] = null;
                statUpdateData["system.possessingActorIdOnLock"] = null;
                notificationKey = "statsCleared";
                console.log(`Ambre |   _handleStatRefreshLogic: No actor found. Prepared to clear previous stats (if any) as refresh was allowed.`);
            }
        } else {
            // Stat refresh is NOT allowed. Stats will be preserved by not adding them to statUpdateData.
            notificationKey = "statsPreservedOnRefreshAttempt";
            console.log(`Ambre |   _handleStatRefreshLogic: Stat refresh was NOT allowed; existing stored stats will be preserved by not adding them to statUpdateData.`);
        }
        return { statUpdateData, notificationKey, actorNameForNotification };
    }

    async _onAttributeLevelChange(event) {
        const selectElement = event.currentTarget;
        const numericLevel = parseInt(selectElement.value); 

        // Validate numericLevel, though current values ("0", "5", "10", "15") should parse correctly.
        // Ensure <option> values in HTML are purely numeric.
        if (isNaN(numericLevel)) {
            console.warn(`Ambre | Invalid numeric level from select: '${selectElement.value}'. Ensure <option> values are numeric.`);
            return;
        }

        const niveauCell = $(selectElement).closest('.attribute-grid-niveau'); // Changed from .form-group-stat
        const propertyName = niveauCell.data('property-name'); // Get property name from data attribute

        let updates = {};

        if (propertyName) {
            updates[propertyName] = numericLevel;

            console.log(`Ambre | _onAttributeLevelChange: propertyName='${propertyName}', numericLevel=${numericLevel}. Preparing to update:`, updates);
            await this.item.update(updates);
            // After the update, this.item.system should reflect the change.
            console.log(`Ambre | _onAttributeLevelChange: Item updated. Current this.item.system.controlePouvoirs = ${this.item.system.controlePouvoirs}`);
            await this._calculateAndUpdateTotalCost(); // Recalculate total cost after all potential updates
        } else {
            console.warn(`Ambre | Could not find data-property-name for attribute level change on element:`, selectElement);
        }
    }

    async _onNiveauTechnologiqueChange(event) {
        const selectElement = event.currentTarget;
        const selectedValue = selectElement.value;

        // Update the item
        await this.item.update({ "system.niveauTechnologique": selectedValue });

        // No need to manually update the display fields (locomotion, communication, armes)
        // because the sheet will re-render after the item update, and getData()
        // will repopulate context.dynamicDescriptions.niveauTechnologique correctly.
        // If you wanted to avoid a full re-render, you would manually update those spans here.
        // For simplicity and consistency with other updates, letting it re-render is fine.
        console.log(`Ambre | Niveau Technologique changed to: ${selectedValue}. Sheet will re-render.`);
    }

    async _onNiveauMagiqueChange(event) {
        const selectElement = event.currentTarget;
        const selectedValue = selectElement.value;

        // Update the item
        await this.item.update({ "system.niveauMagie": selectedValue });

        // Similar to tech level, re-render will handle updating the description.
        console.log(`Ambre | Niveau Magique changed to: ${selectedValue}. Sheet will re-render.`);
    }

    /**
     * Handle creating a new JournalEntry and linking it to this Ombre item.
     * @param {Event} event The click event.
     * @private
     */
    async _onOmbreJournalCreate(event) {
        event.preventDefault();
        if (!this.isEditable) return;

        try {
            const journalData = {
                name: `Notes sur ${this.item.name}`,
                // folder: this.item.folder ? this.item.folder.id : null // Optional
            };
            const newJournal = await JournalEntry.create(journalData, {renderSheet: true});
            if (newJournal) {
                const currentUUIDs = this.item.system.linkedJournalUUIDs || [];
                if (!currentUUIDs.includes(newJournal.uuid)) {
                    const newUUIDs = [...currentUUIDs, newJournal.uuid];
                    await this.item.update({"system.linkedJournalUUIDs": newUUIDs});
                    ui.notifications.info(`Nouveau journal "${newJournal.name}" créé et lié à l'Ombre.`);
                }
            }
        } catch (err) {
            console.error("Ambre | OmbreItemSheet: Error creating new journal entry:", err);
            ui.notifications.error("Erreur lors de la création du journal pour l'Ombre.");
        }
    }

    /**
     * Handle editing a linked JournalEntry.
     * @param {Event} event The click event.
     * @private
     */
    async _onOmbreJournalEdit(event) {
        event.preventDefault();
        const journalUuid = $(event.currentTarget).closest('.journal-list-item').data('journal-uuid');
        const journal = await fromUuid(journalUuid);
        if (journal) {
            journal.sheet.render(true);
        }
    }

    /**
     * Handle unlinking a JournalEntry from this Ombre item.
     * @param {Event} event The click event.
     * @private
     */
    async _onOmbreJournalUnlink(event) {
        event.preventDefault();
        if (!this.isEditable) return;

        const journalUuid = $(event.currentTarget).closest('.journal-list-item').data('journal-uuid');
        const journal = await fromUuid(journalUuid); // To get the name for the notification

        const currentUUIDs = this.item.system.linkedJournalUUIDs || [];
        const newUUIDs = currentUUIDs.filter(uuid => uuid !== journalUuid);

        if (newUUIDs.length !== currentUUIDs.length) {
            await this.item.update({"system.linkedJournalUUIDs": newUUIDs});
            ui.notifications.info(`Journal "${journal ? journal.name : 'Inconnu'}" délié de l'Ombre.`);
        }
    }



    /**
     * Calculates the total cost based on attribute levels and updates the item.
     * @private
     */
    async _calculateAndUpdateTotalCost() {
        let baseTotalCost = 0;
        const systemData = this.item.system;

        const attributePaths = [
            "controleOmbre",
            "gardienOmbre",
            "controleDestin",
            "controleTemporel",
            "blocageCommunications",
            "blocageAcces",
            "omniscienceDivine",
            "controlePouvoirs"
        ];

        for (const path of attributePaths) {
            const value = path.split('.').reduce((o, k) => (o && typeof o[k] !== 'undefined') ? o[k] : 0, systemData);
            baseTotalCost += (parseInt(value) || 0);
        }

        let costBeforeXMultiplier = baseTotalCost;
        // If "Obtenu à la création" is NOT checked (i.e., it's false or undefined), multiply cost by 2.
        // Assumes system.obtainedAtCreation is a boolean. If undefined, it will evaluate as not true.
        if (!(systemData.obtainedAtCreation === true)) {
            costBeforeXMultiplier = baseTotalCost * 2;
        }

        const xMultiplier = parseInt(systemData.xCounter) || 1;
        const finalTotalCost = costBeforeXMultiplier * xMultiplier;
        if (systemData.totalCost !== finalTotalCost) {
            console.log(`Ambre | Recalculating Total Cost: Base=${baseTotalCost}, ObtainedAtCreation=${systemData.obtainedAtCreation}, Final=${finalTotalCost}`);
            await this.item.update({"system.totalCost": finalTotalCost});
        }
    }

    // This function ensures that if a dynamic description wasn't provided by getData (e.g., no actor),
    // the description span will be filled with the text from the selected <option>.
    _updateAttributeDescriptionTexts(html) {
        html.find('.attribute-level-description-text').each((_index, spanElement) => {
            const span = $(spanElement);
            const propertyNameFromDataAttr = span.data('desc-for'); // e.g., "system.vitesse"
            
            // If the span is empty (meaning dynamicDescription for it was null/empty and Handlebars rendered nothing)
            if (span.text().trim() === "") {
                // Find the corresponding select element
                const selectElement = html.find(`.attribute-level-select[name="${propertyNameFromDataAttr}"]`);
                if (selectElement.length) {
                    const selectedOption = selectElement[0].selectedOptions[0];
                    const selectedOptionText = selectedOption ? selectedOption.text : "Non Applicable";
                    span.text(selectedOptionText); // Corrected: use 'span' which is $(spanElement)
                }
            }
        });
    }

    // Optional: Reset initialWidthAdjusted if the sheet is closed and reopened
    async close(options) {
        this._initialWidthAdjusted = false;
        // Reset other state flags if necessary, for example:
        this._leftColumnStateInitialized = false;
        return super.close(options);
    }

    /**
     * Handle dropping of an item onto the sheet.
     * For Ombre items, we are specifically interested in JournalEntry drops.
     * @override
     */
    async _onDrop(event) {
        const data = TextEditor.getDragEventData(event);
        if ( data.type === "JournalEntry" && data.uuid ) {
            const journal = await fromUuid(data.uuid);
            if (journal && this.isEditable) {
                const currentUUIDs = this.item.system.linkedJournalUUIDs || [];
                if (!currentUUIDs.includes(journal.uuid)) {
                    const newUUIDs = [...currentUUIDs, journal.uuid];
                    return this.item.update({"system.linkedJournalUUIDs": newUUIDs});
                }
            }
        }
        return super._onDrop(event); // Allow default handling for other drop types if any
    }
}
