/**
 * Utility functions related to competence data for the pjActorSheet.
 */

export function getDefaultCompetences() {
        return {
            "athletisme": {
                "label": "Athlétisme",
                "value": 0,
                "caracteristique": "physique",
                "active": false,
                "specialite": ["Course rapide", "Saut"],
                "description": "L'athlétisme représente les compétences de votre personnage dans des activités physiques telles que la course, le saut, l'escalade et la natation, lui permettant d'accomplir des prouesses physiques exceptionnelles."
            },
            "armescontact": {
                "label": "Armes de contact",
                "value": 0,
                "caracteristique": "physique",
                "active": false,
                "specialite": "",
                "description": "La compétence 'Armes de Contact' englobe la capacité de manier efficacement des armes de mêlée permettant à votre personnage de briller dans le combat armé rapproché. Elle représente son talent pour infliger des dégâts mortels à ses adversaires avec ces armes."
            },
            "armesdistance": {
                "label": "Armes à Distance",
                "value": 0,
                "caracteristique": "physique",
                "active": false,
                "specialite": "",
                "description": "Cette compétence révèle la maîtrise de votre personnage dans l'utilisation d'armes à distance telles que les arcs, les arbalètes ou les fusils, lui permettant de viser avec précision pour causer des dégâts."
            },
            "corpsacorps": {
                "label": "Corps à corps",
                "value": 0,
                "caracteristique": "physique",
                "active": false,
                "specialite": "",
                "description": "Cette compétence représente la capacité de votre personnage à se battre efficacement au combat à mains nues, tout simplement avec ses poings, ses pieds et son corps. Elle englobe à la fois les compétences d'arts martiaux et les autres techniques de combat à mains nues." 
            },
            "discretion": {
                "label": "Discrétion",
                "value": 0,
                "caracteristique": "physique",
                "active": false,
                "specialite": "",
                "description": "Cette compétence dénote la capacité de votre personnage à se déplacer silencieusement, à éviter d'être vu, et à se fondre dans son environnement, ce qui lui permet de se faufiler sans être détecté et d'opérer de manière furtive dans diverses situations." 
            },
            "pilotage": {
                "label": "Pilotage",
                "value": 0,
                "caracteristique": "physique",
                "active": false,
                "specialite": "",
                "description": "La compétence 'Pilotage' reflète l'expertise de votre personnage dans la conduite de véhicules tels que des vaisseaux spatiaux, des voitures, ou des navires." 
            },
            "abstinence": {
                "label": "Abstinence",
                "value": 0,
                "caracteristique": "endurance",
                "active": false,
                "specialite": "",
                "description": "La compétence Abstinence représente la capacité de votre personnage à résister aux tentations, que ce soit pour éviter la dépendance à des substances ou pour maintenir une discipline stricte dans des situations de privation." 
            },
            "immunite": {
                "label": "Immunité",
                "value": 0,
                "caracteristique": "endurance",
                "active": false,
                "specialite": "",
                "description": "Cette compétence mesure la capacité de votre personnage à résister aux maladies, aux infections et aux poisons, ainsi qu'à maintenir sa santé générale."
            },
            "luxure": {
                "label": "Luxure",
                "value": 0,
                "caracteristique": "endurance",
                "active": false,
                "specialite": "",
                "description": "La compétence Luxure reflète le niveau de performance et de résistance à faire la fête toutes les nuits."
            },
            "poison": {
                "label": "Poison",
                "value": 0,
                "caracteristique": "endurance",
                "active": false,
                "specialite": "",
                "description": "Cette compétence représente la connaissance de votre personnage en matière de poisons, lui permettant de détecter, ou créer des substances toxiques."
            },
            "survie": {
                "label": "Survie",
                "value": 0,
                "caracteristique": "endurance",
                "active": false,
                "specialite": "",
                "description": "La compétence Survie reflète la capacité de votre personnage à survivre dans des environnements hostiles, à trouver de la nourriture, de l'eau et à s'abriter, ainsi qu'à naviguer en terrain inconnu."
            },
            "resilience": {
                "label": "Résilience",
                "value": 0,
                "caracteristique": "endurance",
                "active": false,
                "specialite": "",
                "description": "Cette compétence montre la capacité de votre personnage à résister à la douleur physique et aux privations." 
            },
            "courage": {
                "label": "Courage",
                "value": 0,
                "caracteristique": "psyche",
                "active": false,
                "specialite": "",
                "description": "La compétence Courage représente la détermination, la volonté et la capacité de votre personnage à affronter des peurs, à résister à des influences mentales néfastes et à maintenir son sangfroid dans des situations dangereuses."
            },
            "dissimulation": {
                "label": "Dissimulation",
                "value": 0,
                "caracteristique": "psyche",
                "active": false,
                "specialite": "",
                "description": "Cette compétence représente la capacité de votre personnage à se cacher, à passer inaperçu et à tromper les sens de vos interlocuteurs, que ce soit pour l'infiltration, l'espionnage ou l'évasion." 
            },
            "duelmental": {
            "label": "Duel mental",
            "value": 0,
            "caracteristique": "psyche",
            "active": false,
            "specialite": "",
            "description": "Cet compétence reflète votre capacité à engager des confrontations psychiques, à résister aux attaques mentales et à manipuler les pensées et les émotions de vos interlocuteurs. Avant un Duel mental, il faut effectuer un Contact mental. Il existe plusieurs sortes de contacts mentaux : par le toucher (peau à peau), par Contact d'Atout (si vous acceptez l'appel), par une extension du Logrus ou un sortilège, par un contact visuel prolongé entre Ambriens (il faut un regard fixe (maintenu d'yeux à yeux sans interruption pendant quelques secondes) et par télépathie sur les Ombres où celle-ci fonctionne." 
            },
            "erudition": {
            "label": "Érudition",
            "value": 0,
            "caracteristique": "psyche",
            "active": false,
            "specialite": "",
            "description": "Cette compétence mesure la connaissance, la recherche et la compréhension approfondie des informations et des connaissances, permettant à votre personnage de résoudre des énigmes, de décrypter des textes anciens et d'acquérir de nouvelles compétences."  
            },
            "meditation": {
            "label": "Méditation",
            "value": 0,
            "caracteristique": "psyche",
            "active": false,
            "specialite": "",
            "description": "Cette compétence mesure la capacité de votre personnage à se concentrer, à méditer et à exploiter son propre esprit pour améliorer ses pouvoirs psychiques, sa clarté mentale et sa résistance aux influences extérieures." 
            },
            "strategie": {
            "label": "Stratégie",
            "value": 0,
            "caracteristique": "psyche",
            "active": false,
            "specialite": "",
            "description": "La compétence Stratégie mesure la capacité de votre personnage à élaborer des plans complexes, à anticiper les actions de ses adversaires et à prendre des décisions judicieuses en situation de crise." 
            },
            "clairvoyance": {
            "label": "Clairvoyance",
            "value": 0,
            "caracteristique": "perception",
            "active": false,
            "specialite": "",
            "description": "Cette compétence mesure la capacité de votre personnage à percevoir des informations ou des événements à distance, que ce soit par le biais de visions, de rêves prémonitoires ou de sens extrasensoriels."
            },
            "fouille": {
            "label": "Fouille",
            "value": 0,
            "caracteristique": "perception",
            "active": false,
            "specialite": "",
            "description": "La compétence Fouille représente la capacité de votre personnage à rechercher des objets cachés, des indices ou des éléments importants dans son environnement, que ce soit pour résoudre des mystères, trouver des trésors ou repérer des pièges."
            },
            "intuition": {
            "label": "Intuition",
            "value": 0,
            "caracteristique": "perception",
            "active": false,
            "specialite": "",
            "description": "Cette compétence mesure la capacité de votre personnage à percevoir les intentions, les émotions cachées et les vérités non dites de vos interlocuteurs, que ce soit en observant leur comportement, leurs microexpressions ou en ressentant leur présence."
            },
            "orientation": {
            "label": "Orientation",
            "value": 0,
            "caracteristique": "perception",
            "active": false,
            "specialite": "",
            "description": "Cette compétence mesure la capacité de votre personnage à se repérer dans son environnement, à cartographier des lieux inconnus et à trouver le chemin vers sa destination, que ce soit en utilisant des repères visuels ou des sens aiguisés."
            },
            "pistage": {
            "label": "Pistage",
            "value": 0,
            "caracteristique": "perception",
            "active": false,
            "specialite": "",
            "description": "La compétence Pistage représente la capacité de votre personnage à suivre des traces, des empreintes ou des indices laissés par d'autres personnes ou créatures, que ce soit pour traquer une proie, retrouver un individu ou résoudre des enquêtes." 
            },
            "subtilisation": {
            "label": "Subtilisation",
            "value": 0,
            "caracteristique": "perception",
            "active": false,
            "specialite": "",
            "description": "La compétence Subtilisation représente la capacité de votre personnage à se faufiler discrètement, à voler des objets sans être détecté et à utiliser son agilité pour échapper à la surveillance."  
            },
            "bluff": {
            "label": "Bluff",
            "value": 0,
            "caracteristique": "charisme",
            "active": false,
            "specialite": "",
            "description": "La compétence Bluff représente la capacité de votre personnage à tromper ou à mystifier les autres en utilisant des mensonges convaincants, des ruses habiles et des feintes astucieuses pour atteindre ses objectifs." 
            },
            "commerce": {
            "label": "Commerce",
            "value": 0,
            "caracteristique": "charisme",
            "active": false,
            "specialite": "",
            "description": "La compétence Commerce représente la maitrise des pratiques commerciales, de la négociation des prix, de la gestion des stocks et de la connaissance des marchés, que ce soit pour réussir dans le monde des affaires, réaliser des transactions lucratives ou établir des partenariats." 
            },
            "dressage": {
            "label": "Dressage",
            "value": 0,
            "caracteristique": "charisme",
            "active": false,
            "specialite": "",
            "description": "Cette compétence mesure la capacité de votre personnage à entraîner et à contrôler des animaux ou des créatures, que ce soit pour les utiliser comme montures, les dresser pour des tâches spécifiques ou les apaiser en cas de danger."
            },
            "persuasion": {
            "label": "Persuasion",
            "value": 0,
            "caracteristique": "charisme",
            "active": false,
            "specialite": "",
            "description": "Cette compétence mesure la capacité de votre personnage à influencer et à convaincre les autres par le biais d'arguments logiques, de discours persuasifs et de négociations habiles, que ce soit pour obtenir leur soutien, leur confiance ou leur coopération." 
            },
            "representation": {
            "label": "Représentation",
            "value": 0,
            "caracteristique": "charisme",
            "active": false,
            "specialite": "",
            "description": "Cette compétence mesure la capacité de votre personnage à se produire sur scène, à divertir un public, à jouer un rôle ou à effectuer des performances artistiques, que ce soit pour gagner sa vie en tant qu'artiste ou pour influencer les autres par des moyens artistiques."
            },
            "seduction": {
            "label": "Séduction",
            "value": 0,
            "caracteristique": "charisme",
            "active": false,
            "specialite": "",
            "description": "La compétence Séduction représente l'art de charmer et de séduire les autres en utilisant le charisme, l'attrait physique et la flatterie, que ce soit pour établir des relations amoureuses, gagner des faveurs ou manipuler subtilement."
            }
        };
    }


export function getSpecialites(competenceKey) {
    const specialites = {
        athletisme: [
            { key: "courselongue", label: "Course longue" },
            { key: "courserapide", label: "Course rapide" },
            { key: "escalade", label: "Escalade" },
            { key: "natation", label: "Natation" },
            { key: "sauthauteur", label: "Saut en hauteur" },
            { key: "sautlongueur", label: "Saut en longueur" },
            { key: "parcours", label: "Parcours d'obstacles" }
        ],
        armescontact: [
            { key: "armearticulée", label: "Arme articulée" },
            { key: "armesadeuxmains", label: "Armes à deux mains" },
            { key: "batonsmasses", label: "Bâtons et masses" },
            { key: "dagueepeecourte", label: "Dague et épée courte" },
            { key: "epee", label: "Epée" },
            { key: "epeebouclier", label: "Epée et bouclier" },
            { key: "hache", label: "Haches de batard" }
        ],
        armesdistance: [
            { key: "arc", label: "Arc" },
            { key: "arbalete", label: "Arbalète" },
            { key: "tromblon", label: "Tromblon" },
            { key: "sniper", label: "Sniper" },
            { key: "canon", label: "Canon" },
            { key: "fusillaser", label: "Fusil-laser" }
        ],
        corpsacorps: [
            { key: "defenseesquive", label: "Défense et Esquive" },
            { key: "maitriseavecdegats", label: "Maîtrise avec dégats" },
            { key: "maitrisesansdegats", label: "Maîtrise sans dégats" },
            { key: "percussionpourfairefuir", label: "Percussion pour faire fuir" },
            { key: "percussionpourtuer", label: "Percussion pour tuer" }
        ],
        discretion: [
            { key: "batiments", label: "Batîments" },
            { key: "ville", label: "Ville" },
            { key: "desert", label: "Désert" },
            { key: "plaine", label: "Plaine" },
            { key: "donjon", label: "Donjon" },
            { key: "foret", label: "Forêt" },
            { key: "jungle", label: "Jungle" },
            { key: "ocean", label: "Ocean" },
            { key: "montagne", label: "Montagne" }
        ],
        pilotage: [
            { key: "bateau", label: "Bateau" },
            { key: "equitation", label: "Equitation" },
            { key: "grandvaisseau", label: "Grand vaisseau" },
            { key: "petitvaisseau", label: "Petit vaisseau" },
            { key: "planeur", label: "Planeur" },
            { key: "vehiculedeuxroues", label: "Véhicule deux roues" },
            { key: "vehiculequatreroues", label: "Véhicule quatre roues" },
            { key: "Vehiculesansmoteur", label: "Véhicule sans moteur" }
        ],
        abstinence: [
            { key: "mouvement", label: "Mouvement" },
            { key: "nourriture", label: "Nourriture" },
            { key: "respiration", label: "Respiration" },
            { key: "sexualite", label: "Sexualité" },
            { key: "sommeil", label: "Sommeil" }
        ],
        luxure: [
            { key: "rencontresexuelle", label: "Rencontre sexuelle" },
            { key: "orgies", label: "Orgies" },
            { key: "nuitsblanches", label: "Nuitsblanches" },
            { key: "beuverie", label: "Beuverie" },
            { key: "droguesentoutgenre", label: "Drogues en tout genre" }
        ],
        immunite: [
            { key: "maladiecancereuse", label: "Maladie cancéreuse" },
            { key: "maladieimmunitaire", label: "Maladie immunitaire" },
            { key: "maladieparasitaire", label: "Maladie parasitaire" },
            { key: "poisonhallucinogene", label: "Poison hallucinogène" },
            { key: "poisonmorte", label: "Poison mortel" },
            { key: "poisonperturbateur", label: "Poison perturbateur" },
            { key: "poisonstimulateur", label: "Poison stimulateur" }
        ],
        poison: [
            { key: "poisonshallucinogenes", label: "Poisons hallucinogènes" },
            { key: "poisonsmortelles", label: "Poisons Mortelles" },
            { key: "poisonsperturbateurs", label: "Poisons Perturbateurs" },
            { key: "poisonsstimulateurs", label: "Poisons Stimulateurs" }
        ],
        survie: [
            { key: "desert", label: "Désert" },
            { key: "donjon", label: "Donjon" },
            { key: "foret", label: "Forêt" },
            { key: "jungle", label: "Jungle" },
            { key: "montagne", label: "Montagne" },
            { key: "steppe", label: "Steppe" },
            { key: "ocean", label: "Ocean" },
            { key: "ville", label: "Ville" }
        ],
        resilience: [
            { key: "contusionblessures", label: "Contusion et blessures" },
            { key: "douleurchimique", label: "Douleur Chimique" },
            { key: "douleurenergetique", label: "Douleur énergétique" },
            { key: "etouffements", label: "Etouffements" },
            { key: "isolement", label: "Isolement" },
            { key: "apnee", label: "Apnée" },
            { key: "chaleur", label: "Chaleur" },
            { key: "froid", label: "Froid" }
        ],
        courage: [
            { key: "pourhonneur", label: "Pour l'honneur" },
            { key: "pourlagloire", label: "Pour la Gloire" },
            { key: "pourlesamis", label: "Pour les amis(es)" },
            { key: "poursoi", label: "Pour soi" },
            { key: "pourlafamille", label: "Pour la famille" },
            { key: "pourhumanite", label: "Pour l'humanité" },
            { key: "pourambre", label: "Pour Ambre" },
            { key: "pourleChaos", label: "Pour le Chaos" },
            { key: "pourargent", label: "Pour l'argent" },
            { key: "pourdeconner", label: "Pour déconner" },
            { key: "pourvoirsicapasse", label: "Pour voir si ça passe" }
        ],
        dissimulation: [
            { key: "accessoires", label: "Accessoires" },
            { key: "attitudes", label: "Attitudes" },
            { key: "deguisement", label: "Déguisement" },
            { key: "maquillage", label: "Maquillage" },
            { key: "ventriloque", label: "Ventriloque" }
        ],
        erudition: [
            { key: "architecture", label: "Architecture" },
            { key: "armescombat", label: "Armes & Combat" },
            { key: "artistique", label: "Artistique" },
            { key: "celebrite", label: "Célébrité" },
            { key: "economie", label: "Économie" },
            { key: "erotisme", label: "Érotisme" },
            { key: "esoterisme", label: "Ésotérisme" },
            { key: "gastronomie", label: "Gastronomie" },
            { key: "geographie", label: "Géographie" },
            { key: "histoire", label: "Histoire" },
            { key: "litterature", label: "Littérature" },
            { key: "politique", label: "Politique" },
            { key: "regneanimal", label: "Règne animal" },
            { key: "regnemineral", label: "Règne minéral" },
            { key: "regnevegetal", label: "Règne végétal" },
            { key: "religion", label: "Religion" },
            { key: "sciencesbiologiques", label: "Sciences biologiques" },
            { key: "sciencesphysiques", label: "Sciences physiques" },
            { key: "technologie", label: "Technologie" },
            { key: "uscoutume", label: "Us et Coutume" }
        ],
        duelmental: [
            { key: "attaque", label: "Attaque" },
            { key: "defense", label: "Défense" },
            { key: "dissimule", label: "Dissimulé" },
            { key: "evitement", label: "Évitement" },
            { key: "paratout", label: "par Atout" },
            { key: "parmagie", label: "par Magie" },
            { key: "parlelogrus", label: "par le Logrus" }
        ],
        meditation: [
            { key: "soignersonesprit", label: "Soigner son esprit" },
            { key: "trouverunsouvenir", label: "Trouver un souvenir" },
            { key: "espritfocus", label: "Esprit focus" },
            { key: "espritvoyageur", label: "Esprit voyageur" }
        ],
        strategie: [
            { key: "entreprise", label: "D'entreprise" },
            { key: "financiere", label: "Financière" },
            { key: "jeuxdeconquete", label: "Jeux de conquête" },
            { key: "jeuxdehasard", label: "Jeux de hasard" },
            { key: "militaire", label: "Militaire" }
        ],
        clairvoyance: [
            { key: "amesdesdefunts", label: "Âmes des défunts," },
            { key: "creatureextraterrestre", label: "Créature extraterrestre" },
            { key: "desauras", label: "Des Auras" },
            { key: "entitedesincarnee", label: "Entité désincarnée" },
            { key: "espritvoyageur", label: "Esprit voyageur" },
            { key: "espritsdelanature", label: "Esprits de la nature" },
            { key: "etrepossede", label: "Être possédé" },
            { key: "poltergeist", label: "Poltergeist" },
            { key: "predictives", label: "Prédictives" },
            { key: "reincarnation", label: "Réincarnation" }
        ],
        fouille: [
            { key: "indicesolfactifs", label: "Indices olfactifs" },
            { key: "indicessonores", label: "Indices sonores" },
            { key: "indicestemporels", label: "Indices temporels" },
            { key: "Indices visuels", label: "Indices visuels" }
        ],
        intuition: [
            { key: "bluff", label: "Bluff" },
            { key: "domportementanimal", label: "Comportement animal" },
            { key: "dangerimminent", label: "Danger imminent" },
            { key: "detreobserve", label: "D'être observé" },
            { key: "enquete", label: "Enquête" },
            { key: "revespremonitoires", label: "Rêves prémonitoires" }
        ],
        orientation: [
            { key: "desert", label: "Désert" },
            { key: "donjon", label: "Donjon" },
            { key: "foret", label: "Forêt" },
            { key: "jungle", label: "Jungle" },
            { key: "montagne", label: "Montagne" },
            { key: "plaine", label: "Plaine" },
            { key: "ocean", label: "Ocean" },
            { key: "ville", label: "Ville" }
        ],
        pistage: [
            { key: "desert", label: "Désert" },
            { key: "donjon", label: "Donjon" },
            { key: "foret", label: "Forêt" },
            { key: "jungle", label: "Jungle" },
            { key: "montagne", label: "Montagne" },
            { key: "plaine", label: "Plaine" },
            { key: "ocean", label: "Ocean" },
            { key: "ville", label: "Ville" }
        ],
        subtilisation: [
            { key: "arnaqueur", label: "Arnaqueur" },
            { key: "cambrioleur", label: "Cambrioleur" },
            { key: "pickpocket", label: "Pickpocket" },
            { key: "pillard", label: "Pillard" }
        ],
        bluff: [
            { key: "Déformer la vérité", label: "Déformer la vérité" },
            { key: "Dissimuler la vérité", label: "Dissimuler la vérité" },
            { key: "Jeux de table", label: "Jeux de table" },
            { key: "Nier la réalité", label: "Nier la réalité" }
        ],
        commerce: [
            { key: "animaux", label: "Animaux" },
            { key: "armes", label: "Armes" },
            { key: "artefacts", label: "Artefacts" },
            { key: "bijoux", label: "Bijoux" },
            { key: "humain", label: "Humain" },
            { key: "marchenoir", label: "Marché Noir" },
            { key: "logement", label: "Logement" },
            { key: "nourriture", label: "Nourriture" },
            { key: "vehicules", label: "Véhicules" },
            { key: "vetements", label: "Vêtements" }
        ],
        dressage: [
            { key: "compagnieabyssale", label: "Compagnie Abyssale" },
            { key: "compagnieaerienne", label: "Compagnie aérienne" },
            { key: "compagnieaquatique", label: "Compagnie aquatique" },
            { key: "compagnieterrestre", label: "Compagnie terrestre" },
            { key: "creatureabyssale", label: "Créature Abyssale" },
            { key: "creatureaerienne", label: "Créature aérienne" },
            { key: "creatureaquatique", label: "Créature aquatique" },
            { key: "creatureterrestre", label: "Créature terrestre" },
            { key: "montureabyssale", label: "Monture Abyssale" },
            { key: "montureaerienne", label: "Monture aérienne" },
            { key: "montureaquatique", label: "Monture aquatique" },
            { key: "montureterrestre", label: "Monture terrestre" }
        ],
        persuasion: [
            { key: "parlasubjectivite", label: "Par la subjectivité" },
            { key: "parattenuation", label: "Par l'atténuation" },
            { key: "parexagération", label: "Par l'exagération" },
            { key: "paropposition", label: "Par l'opposition" }
        ],
        representation: [
            { key: "chant", label: "Chant" },
            { key: "comedie", label: "Comédie" },
            { key: "conte", label: "Conte" },
            { key: "danse", label: "Danse" },
            { key: "imitation", label: "Imitation" },
            { key: "marionnettiste", label: "Marionnettiste" },
            { key: "mime", label: "Mime" },                
            { key: "musique", label: "Musique" },
            { key: "prestidigitation", label: "Prestidigitation" }
        ],
        seduction: [
            { key: "draguecompulsive", label: "Drague compulsive" },
            { key: "dragueoffensive", label: "Drague offensive" },
            { key: "flirt", label: "Flirt" },
            { key: "galanterie", label: "Galanterie" },
            { key: "parlerire", label: "Par le rire" },
            { key: "passive", label: "Passive" }
        ]
    };
    
    return specialites[competenceKey] || [];
}