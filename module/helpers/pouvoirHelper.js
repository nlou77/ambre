/**
 * Helper functions for pouvoir calculations and data management
 */

/**
 * Calculate niveau based on pouvoir value
 * @param {number} value - The pouvoir value (0-500)
 * @returns {string} The niveau description
 */
export function calculateNiveau(value) {
    if (value < 1) return "0";
    if (value <= 15) return "1";
    if (value <= 30) return "2";
    if (value <= 45) return "3";
    if (value <= 60) return "4";
    if (value <= 75) return "5";
    if (value <= 90) return "6";
    if (value <= 105) return "7";
    if (value <= 120) return "8";
    if (value <= 140) return "9";
    if (value <= 160) return "10";
    if (value <= 180) return "11";
    if (value <= 200) return "12";
    if (value <= 220) return "13";
    if (value <= 240) return "14";
    if (value <= 260) return "15";
    if (value <= 280) return "16";
    if (value <= 305) return "Voie Secrète 1"; // Corrected duplicated block
    if (value <= 330) return "Voie Secrète 2";
    if (value <= 355) return "Voie Secrète 3";
    if (value <= 380) return "Voie Secrète 4";
    if (value <= 405) return "Voie Secrète 5";
    if (value <= 430) return "Voie Secrète 6";
    return "Inconnu";
}

/**
 * Calculate numeric niveau based on pouvoir value
 * @param {number} value - The pouvoir value (0-500)
 * @returns {number} The numeric niveau
 */
export function calculateNiveauNumeric(value) {
    const niveauStr = calculateNiveau(value); // Leverage existing string-based calculation
    if (niveauStr === "Inconnu") {
        // Assuming "Inconnu" means they are at the highest defined level or beyond
        // For "next_level" logic, this means showing all capacities up to the max + 1
        // Let's find the max capacity level defined in capacitesData or use a sufficiently high number.
        // For now, let's treat it as the highest known discrete level (Voie Secrète 5 = 21)
        return 21; 
    }
    if (niveauStr.startsWith("Voie Secrète")) {
        return 16 + parseInt(niveauStr.split(" ")[2]);
    }
    return parseInt(niveauStr);
}

/**
 * Calculate the number of extensions for Logrus power.
 * Extensions = floor(Psyche / 10) + bonus based on Logrus level.
 * Bonus: +2 at Logrus level 3, +2 more at Logrus level 4 (total +4 at level 4+).
 * @param {object} actorSystem - The actor's system data.
 * @param {number} logrusPouvoirValue - The current value of the Logrus power.
 * @returns {number} The calculated number of extensions.
 */
export function calculNbreExtension(actorSystem, logrusPouvoirValue) {
    if (!actorSystem || typeof actorSystem.psyche !== 'number') {
        console.warn("Ambre | calculNbreExtension: actorSystem.psyche is not a number or actorSystem is undefined.");
        return 0;
    }

    const baseExtensions = Math.floor(actorSystem.psyche / 10);
    const logrusNiveauNumeric = calculateNiveauNumeric(logrusPouvoirValue);

    let bonus = 0;
    if (logrusNiveauNumeric >= 3) { // Bonus if Logrus level is 3 or higher
        bonus += 2;
    }
    if (logrusNiveauNumeric >= 4) { // Additional bonus if Logrus level is 4 or higher
        bonus += 2;
    }
    return baseExtensions + bonus;
}

/**
 * Calculate the number of currently memorized Atouts.
 * This counts items of type "atout" where system.memorise is true.
 * @param {Actor} actor - The actor document.
 * @returns {number} The count of memorized Atouts.
 */
export function calculNbreAtoutsMemorises(actor) {
    if (!actor || !actor.items) {
        console.warn("Ambre | calculNbreAtoutsMemorises: Actor or actor.items is undefined.");
        return 0;
    }
    return actor.items.filter(item => item.type === "atout" && item.system?.memorized === true).length;
}

/**
 * Calculate the maximum number of Atouts an actor can memorize.
 * This is equal to floor(Psyche / 10).
 * @param {object} actorSystem - The actor's system data.
 * @returns {number} The maximum number of memorizable Atouts.
 */
export function calculNbreAtoutsMemorisable(actorSystem) {
    if (!actorSystem || typeof actorSystem.psyche !== 'number') {
        console.warn("Ambre | calculNbreAtoutsMemorisable: actorSystem.psyche is not a number or actorSystem is undefined.");
        return 0;
    }
    return Math.floor(actorSystem.psyche / 10);
}

/**
 * Get capacites for a specific pouvoir type
 * @param {string} pouvoirType - The type of pouvoir
 * @param {number} currentValue - Current value of the pouvoir
 * @param {object} [actorSystem={}] - The actor's system data for dynamic calculations.
 * @param {string} [displayMode="all"] - How to filter capacities: "all", "above_level", "next_level".
 * @returns {Array} Array of capacites with availability
 */
export function getCapacites(pouvoirType, currentValue, actorSystem = {}, displayMode = "all") {

    // Define capacites for each pouvoir type
    const capacitesData = {
        marelle: [
            {
                nom: "Empreinte Brisée",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.endurance ? (Math.floor(180/(system.endurance/10))) : 0) ;
                    return `${baseInvocation} Minutes.`;
                },
                zoneEffet: "",
                duree: "", 
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseInvocation = (system && system.endurance ? (Math.floor(180/(system.endurance/10))) : 0) ;
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ;
                    return `${baseInvocation} minutes pour passer une Marelle brisée & trouver ${baseRang} objets par jour.`;
                }
            },
            {
                nom: "Marelle Brisée",
                niveau: 2,
                cout: 30,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "", 
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ;
                    return `${baseRang} modifications d'ombre par heure. Max 50.`;
                }
            },
            {
                nom: "Empreinte de la Marelle",
                niveau: 3,
                cout: 45,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.endurance ? (240/(Math.floor(system.endurance/10))) : 0) ;
                    return `${baseInvocation} Minutes.`;
                },
                zoneEffet: "",
                duree: "", 
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseInvocation = (system && system.endurance ? (Math.floor(180/(system.endurance/10))) : 0) ;
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ;
                    return `${baseInvocation} minutes pour passer une Marelle & rechercher ${baseRang} personnes par jour.`;
                }
            },
            {
                nom: "Marche en Ombre",
                niveau: 4,
                cout: 60,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "", 
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ;
                    return `${baseRang} modifications en Ombre par 10 minutes. Max ${system.endurance} modifications.`;
                }
            },
            {
                nom: "Descente aux Enfers",
                niveau: 5,
                cout: 75,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "", 
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ;
                    return `${baseRang} modifications en Ombre par minute. Max ${system.endurance} modifications. -1 point de Fatigue par modification.`;
                }
            },
            {
                nom: "Voie Royale",
                niveau: 6,
                cout: 90,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "", 
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ;
                    return `${baseRang} modifications en Ombre par 30 minutes. Max ${system.endurance} modifications. +1 point de Fatigue par modification.`;
                }
            },
            {
                nom: "Influencer les probabilités",
                niveau: 7,
                cout: 105,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "", 
                rang: (system) => {
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseMax = (system && system.psyche ? (Math.floor((system.psyche/10))) : 0) ;
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ;
                    return `${baseRang} probabilités modifiables par heure. (Maximum ${baseMax} probabilités en une journée).`;
                }
            },
            {
                nom: "Evocation du Signe",
                niveau: 8,
                cout: 120,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} minutes.`;
                } ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? (system.endurance) : 0) ; 
                    return `${baseDuree} min.`;
                } , 
                rang: (system) => {
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)*5) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ;
                    const baseDuree = (system && system.endurance ? (system.endurance) : 0) ;  
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)*5) : 0) ;
                    return `${baseInvocation} minutes pour traverser mentalement une Marelle (Minimum 1 minute). Boost de ${baseRang} en Force, Dextérité, Réflexe, Régénération, Résistance, Concentration ou Volonté pendant ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Défense de la Marelle",
                niveau: 9,
                cout: 140,
                tempsInvocation: "" ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? (system.psyche) : 0) ; 
                    return `${baseDuree} min.`;
                } , 
                rang: (system) => {
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseDuree = (system && system.psyche ? (system.psyche) : 0) ;  
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ;
                    return `Vous êtes protégé pendant ${baseDuree} minutes. Vous pouvez réaliser ${baseRang} actions en plus de votre défense normale.`;
                }
            },
            {
                nom: "Vision de la Marelle",
                niveau: 10,
                cout: 160,
                tempsInvocation: "" ,
                zoneEffet: (system) => {
                    baseRang = (system && system.perception ? (system.perception*20) : 0) ; 
                    return `${baseRang} m.`;
                } ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? (system.psyche) : 0) ; 
                    return `${baseDuree} min.`;
                } , 
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.psyche ? (system.psyche) : 0) ;  
                    const baseRang = (system && system.perception ? (system.perception*20) : 0) ;
                    return `Détection des énergies pendant ${baseDuree} minutes sur ${baseRang} mètres.`;
                }
            },
            {
                nom: "Parcourir le Signe",
                niveau: 11,
                cout: 180,
                tempsInvocation: "" ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ; 
                    return `${baseDuree} min.`;
                } , 
                rang: (system) => {
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseDuree = (system && system.psyche ?  (Math.floor(60/(system.psyche/10))) : 0) ;  
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ;
                    return `Vous pouvez rechercher ${baseRang} personnes par heure. La durée de recherche d'un individu demande ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Lentille de la Marelle",
                niveau: 12,
                cout: 200,
                tempsInvocation: (system) => {
                    const baseDuree = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ; 
                    return `${baseDuree} min.`;
                }  ,
                zoneEffet: "",
                duree: "", 
                rang: (system) => {
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseDuree = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;  
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ;
                    return `Vous pouvez chercher à travers ${baseRang} ombres pendant 1 heure. Il vous faut ${baseDuree} minutes pour lancer votre recherche en Ombre.`;
                }
            },
            {
                nom: "Téléportation",
                niveau: 13,
                cout: 220,
                tempsInvocation: (system) => {
                    const baseDuree = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                zoneEffet: "",
                duree: "" , 
                rang: (system) => {
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseDuree = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ;  
                    const baseRang = (system && system.perception ? (Math.floor(system.perception/10)) : 0) ;
                    return `Vous pouvez emmener ${baseRang} personnes avec vous. La traversée mentale de la Marelle nécessite ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Poche d'Ombre",
                niveau: 14,
                cout: 240,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10)))  : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? (Math.floor(system.endurance)/10) : 0) ; 
                    return `${baseDuree} jrs.`;
                } , 
                rang: "" ,
                description: (system) => {
                    const baseDuree = (system && system.endurance ? (Math.floor(system.endurance)/10) : 0) ;   
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10)))  : 0) ;
                    return `Vous créez en ${baseInvocation} minutes une poche d'ombre qui dure ${baseDuree} jours.`;
                }
            },
            {
                nom: "Altération d'ombre",
                niveau: 15,
                cout: 260,
                tempsInvocation: "" ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ; 
                    return `${baseDuree} min.`;
                } , 
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                } ,
                description: (system) => {
                    const baseDuree = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ;  
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)) : 0) ;
                    return `Vous effectuez ${baseRang} altérations d'ombre. Il vous faut ${baseDuree} minutes pour en créer une.`;
                }
            },
            {
                nom: "Contact Primordial",
                niveau: 16,
                cout: 290,
                tempsInvocation: "" ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree} min.`;
                } , 
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.charisme/10)) : 0) ;   
                    return `Vous pouvez rencontrer la Licorne pendant ${baseDuree} minutes.`;
                }
            }
        ],
        logrus: [
            {
                nom: "Empreinte du Logrus",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.endurance ? ((Math.floor(240/(system.endurance/10)))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "" ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor((system.perception/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception ? Math.floor((system.perception/10)) : 0) ;
                    const baseInvocation = (system && system.endurance ? ((Math.floor(240/(system.endurance/10)))) : 0) ;
                    return `${baseInvocation} minutes pour passer le Logrus. La portée de vos sens peut être multiplié par ${baseRang}.`;
                }
            },
            {
                nom: "Evocation du Signe",
                niveau: 2,
                cout: 30,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(300/(system.perception/10))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "" ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(300/(system.perception/10))) : 0) ;
                    return `Il vous faut ${baseInvocation} minutes pour trouver ${baseRang} objets ou personnes. ${baseRang} extensions.`;
                }
            },
            {
                nom: "Vision du Logrus",
                niveau: 3,
                cout: 45,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "" ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)+2) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)+2) : 0) ;  
                    return `Vous percevez la Psyché et les énergies que vous maîtrisez. Il vous faut ${baseInvocation} minutes pour trouver ${baseRang} objets ou personnes. ${baseRang} extensions.`;
                }
            },
            {
                nom: "Contrôle des tentacules",
                niveau: 4,
                cout: 60,
                tempsInvocation: "" ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(system.endurance) : 0) ; 
                    return `${baseDuree} sec.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)+4) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(system.endurance) : 0) ;  
                    const baseRang = (system && system.psyche ? (Math.floor(system.psyche/10)+4) : 0) ; 
                    return `Vous avez ${baseRang} extensions que vous pouvez modifier en fouet, corde, mains ... pendant ${baseDuree} secondes.`;
                }
            },
            {
                nom: "Conjuration du Logrus",
                niveau: 5,
                cout: 75,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(system.endurance) : 0) ; 
                    return `${baseDuree} sec.`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(system.endurance) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ; 
                    return `Vous invoquez en ${baseInvocation} minutes l'énergie chaotique du Logrus pour une durée de ${baseDuree} secondes.`;
                }
            },
            {
                nom: "Touche Chaotique",
                niveau: 6,
                cout: 90,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "",
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    return `Vous pouvez ranger ${baseRang} sorts dans le Logrus. Cela vous prend ${baseInvocation} secondes. Vous pouvez faire ${baseRang} touches chaotiques par jour.`;
                }
            },
            {
                nom: "Défense du Logrus",
                niveau: 7,
                cout: 105,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang:"",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `Il vous faut ${baseInvocation} secondes pour activer votre protection du Logrus pour une durée de ${baseDuree}} minutes.`;
                }
            },
            {
                nom: "Dissimulation d'énergie",
                niveau: 8,
                cout: 120,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet:"" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10)))  : 0) ;
                    return `Il vous faut ${baseInvocation} secondes pour activer votre dissimulation d'énergie pour une durée de ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Altération d'ombre",
                niveau: 9,
                cout: 140,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet:"" ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `Vous pouvez effectuer ${baseRang} altérations. Cela vous prend ${baseInvocation} minutes de concentration.`;
                }
            },
            {
                nom: "Gangrène du Logrus",
                niveau: 10,
                cout: 160,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.physique ? Math.floor((system.physique/10)) : 0) ; 
                    return `${baseRang} jrs.`;
                },
                description: (system) => {
                    const baseRang = (system && system.physique ? Math.floor((system.physique/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `Vous mettez ${baseInvocation} minutes pour infliger la gangrène. Il faudra ${baseRang} jours de repos pour un Ambrien.`;
                }
            },
            {
                nom: "Folie du Chaos",
                niveau: 11,
                cout: 180,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10)))  : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet:"" ,
                duree:"" ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang} jrs.`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10)))  : 0) ;
                    return `Vous mettez ${baseInvocation} minutes pour infliger la folie. Il faudra ${baseRang} jours de repos pour un Ambrien.`;
                }
            },
            {
                nom: "Serviteur du Logrus",
                niveau: 12,
                cout: 200,
                tempsInvocation: "",
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme)) : 0) ; 
                    return `${baseDuree}h.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor((system.perception/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme)) : 0) ; 
                    const baseRang = (system && system.perception ? Math.floor((system.perception/10)) : 0) ;
                    return `Vous pouvez invoquer ${baseRang} serviteurs du Logrus qui vous obéiront pendant ${baseDuree} heures.`;
                }
            },
            {
                nom: "Créature du Chaos",
                niveau: 13,
                cout: 220,
                tempsInvocation: "" ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme)) : 0) ;  
                    return `${baseDuree}h.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor((system.perception/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme)) : 0) ; 
                    const baseRang = (system && system.perception ? Math.floor((system.perception/10)) : 0) ;
                    return `Vous pouvez contrôler ${baseRang} créatures de niveau chaosien qui vous suivront pendant ${baseDuree} heures.`;
                }
            },
            {
                nom: "Plan Primal",
                niveau: 14,
                cout: 240,
                tempsInvocation: "" ,
                zoneEffet: "" ,
                duree: "",
                rang:"",
                description: (system) => {
                    return `Vous obtenez un Plan Primal dans le Cercle Noir. Votre Charisme vous permet de le garder`; 
                }               
            },
            {
                nom: "Chaos Primordial",
                niveau: 15,
                cout: 260,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet:"" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} sec.`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) : 0) ;
                    return `Vous maintenez pendant ${baseDuree} secondes le Chaos Primordial. Il vous faut ${baseInvocation} minutes pour l'invoquer.`;
                }
            },
            {
                nom: "Contact avec le Serpent",
                niveau: 16,
                cout: 280,
                tempsInvocation: "" ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `Vous pouvez rencontrer le Serpent pendant ${baseDuree} minutes maximum.`;
                }
            }
        ],
        atouts: [
            {
                nom: "Croquis d'Atouts",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche && system.perception ? (Math.floor(320/((system.psyche+system.perception)/10)))  : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "" ,
                duree: "" ,
                rang: "",
                description: (system) => {
                    const baseInvocation = (system && system.psyche && system.perception ? (Math.floor(320/((system.psyche+system.perception)/10))) : 0) ;
                    return `Vous pouvez faire des croquis d'atouts, des atouts à usage unique. Il vous faut ${baseInvocation} minutes pour les créer.`;
                }
            },
            {
                nom: "Création d'Atouts",
                niveau: 2,
                cout: 30,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? Math.floor(48/((system.psyche/10))) : 0) ; 
                    return `${baseInvocation} h.`;
                } ,
                zoneEffet: "" ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? Math.floor(48/((system.psyche/10))) : 0) ;
                    return `Vous pouvez faire un Atout en ${baseInvocation} heures, le double sans le modèle sous les yeux. Vous pouvez travailler sur ${baseRang} atouts en même temps.`;
                }
            },
            {
                nom: "Détection d'énergie d'Atouts",
                niveau: 3,
                cout: 45,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? Math.floor(60/((system.psyche/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: (system) => {
                    const baseZone = (system && system.perception ? (system.perception) : 0) ; 
                    return `${baseZone} m.`;
                } ,
                duree: "" ,
                rang: "",
                description: (system) => {
                    const baseZone = (system && system.perception ? (system.perception) : 0) ;
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    return `Après ${baseInvocation} secondes de concentration, vous pouvez détecter l'énergie des Atouts pendant ${baseInvocation} secondes. Il faut un niveau de Perception+Psyché supérieur à la psyché d'une cible se dissimulant.`;
                }
            },
            {
                nom: "Mémoire d'Atouts",
                niveau: 4,
                cout: 60,
                tempsInvocation: "" ,
                zoneEffet: "" ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;
                    return `Vous pouvez mémoriser ${baseRang} Atouts.`;
                }
            },
            {
                nom: "Activation Rapide",
                niveau: 5,
                cout: 75,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(30/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation}`;
                } ,
                zoneEffet: "" ,
                duree: "",
                rang: "",
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(30/(system.psyche/10))) : 0) ;
                    return `Vous activez vos atouts en ${baseInvocation} secondes au lieu des 30 secondes requises.`;
                }
            },
            {
                nom: "Transport Très Rapide",
                niveau: 6,
                cout: 90,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(30/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation}`;
                } ,
                zoneEffet: "" ,
                duree: "" ,
                rang: "",
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(30/(system.psyche/10))) : 0) ;
                    return `Il vous faut ${baseInvocation} secondes de concentration pour activer un de vos Atouts d'un lieu par simple contact.`;
                }
            },
            {
                nom: "Sens des Atouts",
                niveau: 7,
                cout: 105,
                tempsInvocation: "" ,
                zoneEffet: "" ,
                duree: "" ,
                rang: "",
                description: (system) => {
                    return `Vous pouvez savoir qui vous contacte si vous avez son Atout.`;
                }
            },
            {
                nom: "Identification par Atouts",
                niveau: 8,
                cout: 120,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: "",
                description: (system) => {
                    return `Vous permet de révèler la véritable identité d'un Atout déguisé. Le niveau de l'artiste en PERCEPTION + PSYCHE doit surpasser le niveau en PSYCHE du créateur de la carte d'Atout déguisé.`;
                }
            },
            {
                nom: "Atouts déguisés",
                niveau: 9,
                cout: 140,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(48/(system.psyche/10)))*2 : 0) ; 
                    return `${baseInvocation}h.`;
                } ,
                zoneEffet: "",
                duree: "",
                rang: "",
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(30/(system.psyche/10)))*2 : 0) ;
                    return `Vous permet de créer des Atouts déguisés en ${baseInvocation} heures. Le niveau de l'Artiste en PERCEPTION + PSYCHE doit être supérieur au niveau en PSYCHE de la cible. Si la cible vous surpasse, elle pourra démasquer votre Atout. Si la cible n'a pas le Pouvoir des Atouts, elle ne pourra rien démasquer.`;
                }
            },
            {
                nom: "Espionnage par Atout",
                niveau: 10,
                cout: 160,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: "",
                description: (system) => {
                    return `Vous pouvez espionner un contact d'atouts.`;
                }
            },
            {
                nom: "Brouillage d'Atouts",
                niveau: 11,
                cout: 180,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.endurance ? (system.endurance) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? (system.endurance) : 0) ; 
                    return `${baseDuree}h.`;
                } ,
                rang: "",
                description: (system) => {
                    const baseInvocation = (system && system.endurance ? (system.endurance) : 0) ;
                    const baseDuree = (system && system.endurance ? (system.endurance) : 0) ; 
                    return `Vous pouvez activer un brouillage d'Atouts pendant ${baseDuree} heures en vous concentrant ${baseInvocation} minutes.`;
                }
            },
            {
                nom: "Redirection d'Atouts",
                niveau: 12,
                cout: 200,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.endurance ? (system.endurance) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: "",
                rang:"",
                description: (system) => {
                    const baseInvocation = (system && system.endurance ? (system.endurance) : 0) ;
                    return `Vous pouvez rediriger les Appels d'un Atout vers un destinataire précis pendant le temps de votre concentration de ${baseInvocation} minutes.`;
                }
            },
            {
                nom: "Discrétion d'Atouts",
                niveau: 13,
                cout: 220,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang:"",
                description: (system) => {
                    return `Permet de ne pas être espionné en utilisant ses Atouts. Votre niveau en ENDURANCE + PSYCHE + PERCEPTION doit être supérieur au niveau en PERCEPTION de l'espion pour qu'il ne puisse pas vous espionner. Si l'espion n'a pas la capacité niveau 10 de l'Art des Atouts, il ne pourra rien faire.`; 
                }
            },
            {   
                nom: "Défense par Atouts",
                niveau: 14,
                cout: 240,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: "",
                description: (system) => {
                    return `En vous concentrant sur votre Jeu d'Atouts, vous pouvez résister ou interrompre une attaque mentale.`;
                }
            },
            {
                nom: "Portail par Atouts",
                niveau: 15,
                cout: 260,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "",
                duree: "" ,
                rang: "",
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    return `Vous réalisez un portail d'Atouts en ${baseInvocation} secondes. Si votre PERCEPTION est supérieur ou égale à 100, vous n'avez plus besoin de support.` ;
                }
            },
            {
                nom: "Contact avec Lumion",
                niveau: 16,
                cout: 280,
                tempsInvocation: "",
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `Vous pouvez rencontrer Lumion pendant ${baseDuree} minutes au maximum.`;
                }
            }
        ],
        metamorphose: [
            {
                nom: "Forme Primaire",
                niveau: 1,
                cout: 15,
                tempsInvocation: "" ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} Min.`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `Vous obtenez votre forme primaire, celle-ci dure ${baseDuree} minutes par jour.`;
                }
            },
            {
                nom: "Forme Animale",
                niveau: 2,
                cout: 30,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} Min.`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `Vous obtenez votre forme animale, celle-ci dure ${baseDuree} minutes par jour. Vous avez un nombre de capacités liées dépendant de votre ENDURANCE initiale, ce nombre n'évolue pas.`;
                }
            },
            {
                nom: "Forme Chaotique",
                niveau: 3,
                cout: 45,
                tempsInvocation: "",
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} Min.`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `Vous obtenez votre forme chaotique, celle-ci dure ${baseDuree} minutes par jour.`;
                }
            },
            {
                nom: "Adaptation Mineure",
                niveau: 4,
                cout: 60,
                tempsInvocation: "",
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} Min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.physique ? Math.floor((system.physique/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree =  (system && system.endurance ? Math.floor((system.endurance))  : 0) ; 
                    const baseRang = (system && system.physique ? Math.floor((system.physique/10)) : 0) ;
                    return `Vous pouvez effectuer ${baseRang} petites métamorphoses par jour, elles durent ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Guérison accélérée",
                niveau: 5,
                cout: 75,
                tempsInvocation: "",
                zoneEffet:"",
                duree: "Var.",
                rang: (system) => {
                    const baseRang = (system && system.endurance ? Math.floor((system.endurance)/10) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.endurance ? Math.floor((system.endurance/10)) : 0) ;
                    const baseTime1 = (system && system.psyche ? Math.floor(10/(system.psyche/10)) : 0) ;
                    const baseTime2 = (system && system.psyche ? Math.floor(20/(system.psyche/10)) : 0) ;
                    const baseTime3 = (system && system.psyche ? Math.floor(40/(system.psyche/10)) : 0) ;
                    const baseTime4 = (system && system.psyche ? Math.floor(80/(system.psyche/10)) : 0) ;
                    const baseTime5 = (system && system.psyche ? Math.floor(160/(system.psyche/10)) : 0) ;
                    const baseTime6 = (system && system.psyche ? Math.floor(320/(system.psyche/10)) : 0) ;
                    return `Vous obtenez Guérison accélérée. 
                    Soigner un petit membre : main, pied... ${baseRang} membres en ${baseTime1} heures.
                    Soigner un grand membre : bras, jambe... ${baseRang} membres en ${baseTime2} heures.
                    Soigner un organe : oeil, foie, poumons ... ${baseRang} membres en ${baseTime3} heures.
                    Reconstituer un petit membre : main, pied... ${baseRang} membres en ${baseTime4} heures.
                    Reconstituer un grand membre : bras, jambe... ${baseRang} membres en ${baseTime5} heures.
                    Reconstituer un organe : oeil, foie, poumons ... ${baseRang} membres en ${baseTime6} heures.`;
                }
            },
            {
                nom: "Duplication",
                niveau: 6,
                cout: 90,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ; 
                    return `${baseInvocation}`;
                } ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)/10) : 0) ; 
                    return `${baseDuree} h.`;
                },
                rang:  (system) => {
                    const baseRang = (system && system.endurance ? Math.floor((system.endurance)/10) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.endurance ? Math.floor((system.endurance)/10) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    return `Vous prenez l'apparence d'un autre, pendant ${baseRang} heures. ${baseInvocation} minutes sont nécessaires à la transformation`;
                }
            },
            {
                nom: "Adaptation supérieure",
                niveau: 7,
                cout: 105,
                tempsInvocation: "",
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)/10) : 0) ;
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.physique ? Math.floor((system.physique)/10) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)/10) : 0) ; 
                    const baseRang = (system && system.physique ? Math.floor((system.physique)/10) : 0) ;
                    return `Vous lâchez prise pour que votre métamorphose s'adapte au danger ${baseRang} fois par jour. Elle dure ${baseDuree} minutes par jour.`;
                }
            },
            {
                nom: "Obtention de Capacités",
                niveau: 8,
                cout: 120,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `Vous mémorisez ${baseRang} capacités, que vous pouvez utiliser pendant ${baseDuree} minutes par jour.`;
                }
            },
            {
                nom: "Transformer sa personnalité",
                niveau: 9,
                cout: 140,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10)))  : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception))) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception))) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10))) :0) ;
                    return `Vous imitez pendant ${baseDuree} minutes, une cible dont la psyché est inférieure à ${baseRang}. Il faut ${baseInvocation} minutes pour l'activer.`;
                }
            },
            {
                nom: "Transformer son aura",
                niveau: 10,
                cout: 160,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10)))  : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.charisme ? Math.floor(((system.psyche+system.charisme)/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ;  
                    const baseRang = (system && system.psyche && system.charisme ? Math.floor(((system.psyche+system.charisme)/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10)))  : 0) ;
                    return `Vous imitez pendant ${baseDuree} minutes, l'aura d'une cible dont le charisme est inférieure à ${baseRang}. Il faut ${baseInvocation} minutes pour l'activer.`;
                }
            },
            {
                nom: "Transformation d'autrui",
                niveau: 11,
                cout: 180,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10)))  : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche)) : 0) ;  
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10)))  : 0) ;
                    return `Vous pouvez transformer, en ${baseInvocation} minutes, une cible dont la psyché est inférieure à ${baseRang} pendant ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Soigner autrui",
                niveau: 12,
                cout: 200,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10)))  : 0) ;
                    return `${baseInvocation}`;
                } ,
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/(system.psyche/10)))  : 0) ;
                    return `Vous pouvez soigner ${baseRang} organes d'une cible par jour. Il vous faut ${baseInvocation} minutes par organe`;
                }
            },
            {
                nom: "Absorber/Ejecter de la masse",
                niveau: 13,
                cout: 220,
                tempsInvocation:"",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.physique ? Math.floor((system.physique/10)) : 0) ; 
                    return `${baseRang}%`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseZone = (system && system.charisme && system.poids ? (Math.floor(system.charisme/10)*system.poids) : 0) ;
                    return `Vous pouvez modifier ${baseRang}% de votre masse par jour. Elle dure ${baseDuree} minutes. Cela représente à peu près ${baseZone} kg.`;
                }
            },
            {
                nom: "Créature de Sang",
                niveau: 14,
                cout: 240,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(24/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} h.`;
                } ,
                zoneEffet: "",
                duree: "" ,
                rang: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance/10)) : 0) ; 
                    return `${baseDuree}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    return `Vous pouvez créer ${baseRang} créatures de sang. Cela vous prend ${baseInvocation} heures pour chacune.`;
                }
            },
            {
                nom: "Guérison totale",
                niveau: 15,
                cout: 260,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: "" ,
                rang: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance/10)) : 0) ; 
                    return `${baseDuree}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    return `Vous pouvez soigner ${baseRang} organes par jour. Cela vous prend ${baseInvocation} minutes.`;
                }
            },
            {
                nom: "Contact avec Krolm",
                niveau: 16,
                cout: 280,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `Vous pouvez rencontrer Krolm pendant ${baseDuree} minutes maximum.`;
                }
            }
        ],
        pentacre: [
            {
                nom: "Création du Pentacre",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? Math.floor(360/(system.psyche/10)) : 0) ;
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? Math.floor(360/(system.psyche/10)) : 0) ;
                    return `Cela vous prend ${baseInvocation} minutes à ouvrir un portail sur les Limbes. Il reste ouvert pendant ${baseDuree} minutes et sur 0-21 (par le tirage des Arcanes) créatures des limbes, ${baseRang} sont amicales, les autres s'éparpillent en ombre.`;
                }
            },
            {
                nom: "Le Passeur",
                niveau: 2,
                cout: 30,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `Le Passeur surveille ce qui s'extrait de son Pentacle et parvient à filtrer certaines créatures. Sur les 0-21 Créatures, ${baseRang} sont bloquées. Cela influe sur votre tirage d'arcane.`;
                }
            },
            {
                nom: "Vision des Limbes",
                niveau: 3,
                cout: 45,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme)) : 0) ; 
                    return `${baseDuree} sec.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor((system.perception)) : 0) ; 
                    return `${baseRang} jrs.`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme)) : 0) ;  
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    return `Vous pouvez discuter pendant ${baseDuree} secondes avec l'esprit d'un mort, décédé il y a moins de ${baseRang} jours.`;
                }
            },
            {
                nom: "Réduction d'Ancres",
                niveau: 4,
                cout: 60,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.charisme ? 12-Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme ? 12-Math.floor((system.charisme/10)) : 0) ;
                    return `Vous avez dorénavant besoin de ${baseRang} ancres au lieu de 12.`;
                }
            },
            {
                nom: "Plongée dans les limbes",
                niveau: 5,
                cout: 75,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ;  
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    return `Les Limbres possèdent 12 royaumes. Vous plongez votre esprit jusqu'au ${baseRang}ème niveau des limbes pendant ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Invocation",
                niveau: 6,
                cout: 90,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche*3)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche*3)) : 0) ;
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    return `Vous pouvez invoquer ${baseRang} créatures de niveau ${baseRang} pendant ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Renvoi",
                niveau: 7,
                cout: 105,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "",
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.charisme ? (Math.floor((system.psyche+system.charisme)/10)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche && system.charisme ? (Math.floor((system.psyche+system.charisme)/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ; 
                    return `Il vous faut ${baseInvocation} secondes pour renvoyer dans les limbes ${baseRang} créatures de niveau ${baseRang}.`;
                }
            },
            {
                nom: "Façonnage Mortuaire",
                niveau: 8,
                cout: 120,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ; 
                    return `${baseInvocation} h.`;
                } ,
                zoneEffet: "" ,
                duree: "",
                rang: "",
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ; 
                    return `Il vous faut ${baseInvocation} heures pour momifier un corps, ce qui le protège des forces du Royaume de Morgh. L'esprit de la personne momofiée peut se réincarner.`;
                }
            },
            {
                nom: "Invocation de la Horde",
                niveau: 9,
                cout: 140,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.psyche*2)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme && system.psyche ? Math.floor((system.charisme+system.psyche)/10) : 0) ; 
                    return `${baseRang} min.`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.psyche*2)) : 0) ; 
                    const baseRang = (system && system.charisme && system.psyche ? Math.floor((system.charisme+system.psyche)/10) : 0) ; 
                    const baseCrea = (system && system.charisme && system.psyche ? Math.floor((system.charisme+system.psyche)) : 0) ; 
                    return `Vous pouvez invoquer ${baseCrea} créatures de niveau ${baseRang}, vous les controlez pendant ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Renvoie de la Horde",
                niveau: 10,
                cout: 160,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.charisme ? (Math.floor(360/(system.charisme/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet:"" ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.charisme ? (Math.floor(((system.psyche+system.charisme)/10))) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche && system.charisme ? Math.floor(((system.psyche+system.charisme))) : 0) ;
                    const baseCrea = (system && system.psyche && system.charisme ? Math.floor((system.psyche+system.charisme)/10) : 0) ;
                    const baseInvocation = (system && system.charisme ? (Math.floor(360/(system.charisme/10))) : 0) ;
                    return `Il vous faut ${baseInvocation} secondes pour renvoyer dans les limbes ${baseCrea} créatures de niveau ${baseRang}.`;
                }
            },
            {
                nom: "Exorcisme",
                niveau: 11,
                cout: 180,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.charisme ? (Math.floor(240/(system.charisme/10))) : 0) ;
                    return `${baseInvocation}`;
                } ,
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche)) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    return `Vous cherchez le squatteur dans l'esprit de la victime pendant ${baseInvocation} minutes et vous pouvez l'ejecter lors d'un duel mental avec votre PSYCHE de ${baseRang} .`;
                }
            },
            {
                nom: "Feinte",
                niveau: 12,
                cout: 200,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `Vous mettez ${baseInvocation} secondes pour feinter la mort pendant ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Résurection",
                niveau: 13,
                cout: 220,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor((system.perception/2)) : 0) ;
                    return `${baseRang} min.`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception ? Math.floor((system.perception/2)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `Vous pouvez ramener à la vie un mort décédé depuis moins de ${baseRang} minutes. Cela vous demande ${baseInvocation} minutes.`;
                }
            },
            {
                nom: "Invocation de l'Armée",
                niveau: 14,
                cout: 240,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.psyche)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang} min.`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche)) : 0) ; 
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme)/10) : 0) ; 
                    const baseCrea = (system && system.charisme ? Math.floor((system.charisme)*10) : 0) ;
                    return `Vous pouvez invoquer ${baseCrea} créatures de niveau ${baseRang} par jour, vous les controlez pendant ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Renvoie de l'Armée",
                niveau: 15,
                cout: 260,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.charisme ? (Math.floor(420/(system.charisme/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet:"" ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.charisme ? (Math.floor(((system.psyche+system.charisme)*10))) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche && system.charisme ? Math.floor(((system.psyche+system.charisme))) : 0) ;
                    const baseCrea = (system && system.psyche && system.charisme ? (Math.floor(((system.psyche+system.charisme)*10))) : 0) ;
                    const baseInvocation = (system && system.charisme ? (Math.floor(420/(system.charisme/10))) : 0) ;
                    return `Il vous faut ${baseInvocation} secondes pour renvoyer dans les limbes ${baseCrea} créatures de niveau ${baseRang}.`;
                }
            },
            {
                nom: "Contact Mortel",
                niveau: 16,
                cout: 280,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `Vous pouvez rencontrer Morgh pendant ${baseDuree} minutes maximum.`;
                }
            }
        ],
        coeurflamme: [
            {
                nom: "Paix intérieure",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ; 
                    return `Suite à une méditation de ${baseInvocation} minutes, vous pouvez poser ${baseRang} questions à votre MJ pendant une partie (peu importe le temps de jeu). Fondamentalement, tout action visant à utiliser le Coeur-Flamme contre la volonté de la cible, octroie à cette même cible la capacité de doubler sa résistance (généralement PERCEPTION).`;
                }
            },
            {
                nom: "Sérénité ou Agressivité",
                niveau: 2,
                cout: 30,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ;  
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ;
                    return `Vous infusez Sérénité/Agressivité pendant ${baseDuree} minutes à ${baseRang} cibles dont la perception est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Générosité ou Avidité",
                niveau: 3,
                cout: 45,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ; 
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ;
                    return `Vous infusez Générosité/Avidité pendant ${baseDuree} minutes à ${baseRang} cibles dont la perception est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Assurance ou Peur",
                niveau: 4,
                cout: 60,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ;  
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ; 
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ;
                    return `Vous infusez Assurance/Peur pendant ${baseDuree} minutes à ${baseRang} cibles dont la perception est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Confiance ou Défiance",
                niveau: 5,
                cout: 75,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ;  
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ;
                    return `Vous infusez Confiance/Défiance pendant ${baseDuree} minutes à ${baseRang} cibles dont la perception est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Joie ou Peine",
                niveau: 6,
                cout: 90,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ;  
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ;
                    return `Vous infusez Joie/Peine pendant ${baseDuree} minutes à ${baseRang} cibles dont la perception est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Amour ou Haine",
                niveau: 7,
                cout: 105,
                tempsInvocation: "",
                zoneEffet: "" ,
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ;  
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10))*baseUnitDuree : 0) ; 
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/2)) : 0) ;
                    return `Vous infusez Amour/Haine pendant ${baseDuree} minutes à ${baseRang} cibles dont la perception est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Infusion de la Tribu",
                niveau: 8,
                cout: 120,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10))*baseUnitDuree : 0) ; 
                    return `${baseDuree} jrs.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme*10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10))*baseUnitDuree : 0) ; 
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme*10)) : 0) ;
                    const baseResist = (system && system.charisme ? Math.floor((system.charisme/2)) : 0) ;
                    return `Votre Infusion de la tribu dure ${baseDuree} jours et vous pouvez atteindre ${baseRang} cibles. Seules les cibles à la PERCEPTION inférieure à votre ${baseResist} sont affectées.`;
                }
            },
            {
                nom: "Perception de l'infusion",
                niveau: 9,
                cout: 140,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(300/((system.psyche)/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "" ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.psyche+system.perception))) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.psyche+system.perception))) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(300/((system.psyche)/10))) : 0) ;
                    return `Il vous faut ${baseInvocation} secondes pour percevoir les infusions d'un Ambrien qui a un CHARISME inférieur à ${baseRang}.`;
                }
            },
            {
                nom: "L'Exclusion",
                niveau: 10,
                cout: 160,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(300/((system.psyche)/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "" ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.psyche+system.perception))) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.psyche+system.perception))) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(300/((system.psyche)/10))) : 0) ;
                    return `Il vous faut ${baseInvocation} secondes pour annuler les infusions d'un ambrien qui a une PSYCHE inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Infusion du peuple",
                niveau: 11,
                cout: 180,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche))*baseUnitDuree : 0) ; 
                    return `${baseDuree} jrs.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme*1000)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche))*baseUnitDuree : 0) ; 
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme*10)) : 0) ;
                    const baseResist = (system && system.charisme ? Math.floor((system.charisme/2)) : 0) ;
                    return `Votre Infusion du peuple dure ${baseDuree} jours et vous pouvez atteindre ${baseRang} cibles. Seules les cibles à la PERCEPTION inférieure à votre ${baseResist} sont affectées.`;
                }
            },
            {
                nom: "Persuasion",
                niveau: 12,
                cout: 200,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/((system.psyche)/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "" ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.charisme && system.psyche ? Math.floor(((system.psyche+system.charisme))) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    return `Il vous faut ${baseInvocation} secondes pour persuader une cible qui a une Perception de moins de ${baseRang}.`;
                }
            },
            {
                nom: "Infusion de l'Ombre",
                niveau: 13,
                cout: 220,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche*10))*baseUnitDuree : 0) ; 
                    return `${baseDuree} jrs.`;
                } ,
                rang: "NA",
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 260 ? (system && system.psyche ? Math.floor((system.psyche*10)) : 0) : 1;
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche*10))*baseUnitDuree : 0) ; 
                    const baseResist = (system && system.charisme ? Math.floor((system.charisme/2)) : 0) ;
                    return `Votre Infusion de l'ombre dure ${baseDuree} jours et vous pouvez atteindre toutes les créatures de l'ombre. Seules les cibles à la PERCEPTION inférieure à votre ${baseResist} sont affectées.`;
                }
            },
            {
                nom: "Exclusion supérieure",
                niveau: 14,
                cout: 240,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(300/((system.psyche)/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "" ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.charisme && system.perception ? Math.floor(((system.charisme+system.perception))) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme && system.perception ? Math.floor(((system.charisme+system.perception))) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(300/((system.psyche)/10))) : 0) ;
                    return `Il vous faut ${baseInvocation} secondes pour annuler les infusions d'un ambrien qui a une PSYCHE inférieure à ${baseRang}. Vous pouvez supprimer vos propres infusions instantannément.`;
                }
            },
            {
                nom: "Infusion Etendue",
                niveau: 15,
                cout: 260,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;
                    return `La durée de vos infusions est multipliée par ${baseRang}.`;
                }
            },
            {
                nom: "Contact avec Sah et Piam",
                niveau: 16,
                cout: 280,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `Vous pouvez rencontrer Sah et Piam pendant ${baseDuree} minutes maximum.`;
                }
            }
        ],
        orbochromat: [
            {
                nom: "Symbiose I",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60 / ((system.psyche) / 10))) : 0);
                    const baseUnitInvoc = system.ptsorbochromat >= 75 ? "sec." : "min.";
                    return `${baseInvocation} ${baseUnitInvoc}`;
                } ,
                zoneEffet: (system) => {
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;
                    return `${baseZone} m.`;
                } ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/((system.psyche)/10))) : 0) ;
                    const baseUnitInvoc = system.ptsorbochromat >= 75 ? "sec." : "min.";
                    return `Après ${baseInvocation} ${baseUnitInvoc} de concentration, vous percevez les Auras des cibles dont la perception est inférieure à ${baseRang} dans une zone de ${baseZone} mètres autour de vous. Limité aux BRUMES et aux TEINTES.`;
                }
            },
            {
                nom: "Vision Chromatique",
                niveau: 2,
                cout: 30,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60 / ((system.psyche) / 10))) : 0);
                    const baseUnitInvoc = system.ptsorbochromat >= 75 ? "sec." : "min.";
                    return `${baseInvocation} ${baseUnitInvoc}`;
                } ,
                zoneEffet: (system) => {
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ; 
                    return `${baseZone} m.`;
                } ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    const baseUnitInvoc = system.ptsorbochromat >= 75 ? "sec." : "min.";
                    return `Après ${baseInvocation} ${baseUnitInvoc} de concentration, vous percevez les Traces des cibles dont la perception est inférieure à ${baseRang}. Limité aux BRUMES et aux TEINTES dans une zone de ${baseZone} mètres autour de vous.`;
                }
            },
            {
                nom: "Confusion Chromatique",
                niveau: 3,
                cout: 45,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60 / ((system.psyche) / 10))) : 0);
                    const baseUnitInvoc = system.ptsorbochromat >= 75 ? "sec." : "min.";
                    return `${baseInvocation} ${baseUnitInvoc}`;
                } ,
                zoneEffet: (system) => {
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;  
                    return `${baseZone} m.`;
                } ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/((system.psyche)/10))) : 0) ; 
                    const baseUnitInvoc = system.ptsorbochromat >= 75 ? "sec." : "min.";
                    return `Après ${baseInvocation} ${baseUnitInvoc} de concentration, vous dissimulez votre Aura aux cibles dont la perception est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Symbiose II",
                niveau: 4,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60 / ((system.psyche) / 10))) : 0);
                    const baseUnitInvoc = system.ptsorbochromat >= 75 ? "sec." : "min.";
                    return `${baseInvocation} ${baseUnitInvoc}`;
                } ,
                zoneEffet: (system) => {
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ; 
                    return `${baseZone} m.`;
                } ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ; 
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    const baseUnitInvoc = system.ptsorbochromat >= 75 ? "sec." : "min.";
                    return `Après ${baseInvocation} ${baseUnitInvoc} de concentration, vous percevez les Auras des cibles dont la perception est inférieure à ${baseRang}. Limité aux BRUMES, aux TEINTES et aux FLUIDES dans une zone de ${baseZone} mètres autour de vous.`;
                }
            },
            {
                nom: "Discernement Chromatique",
                niveau: 5,
                cout: 75,
                tempsInvocation:"",
                zoneEffet: "",
                duree: "",
                rang: "",
                description: (system) => {
                    return `Vos méditations passent en concentration et les temps d'activation sont grandement réduits. 
                    Vos pouvoirs de niveau 1 à 4 voient leur temps d'incantation exprimé en secondes au lieu de minutes.`;
                }
            },
            {
                nom: "Symbiose III",
                niveau: 6,
                cout: 90,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/((system.psyche)/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: (system) => {
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ; 
                    return `${baseZone} m.`;
                } ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(60/((system.psyche)/10))) : 0) ; 
                    return `Après ${baseInvocation} secondes de concentration, vous percevez les Auras des cibles dont la perception est inférieure à ${baseRang} dans une zone de ${baseZone} mètres autour de vous. Vous discernez maintenant les BRUMES, FLUIDES, TEINTES et les ETINCELLES.`;
                }
            },
            {
                nom: "Tâche Chromatique",
                niveau: 7,
                cout: 105,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/((system.psyche)/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: (system) => {
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;
                    return `${baseZone} m.`;
                } ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang =  (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/((system.psyche)/10))) : 0) ;
                    return `Après ${baseInvocation} secondes de concentration, vous percevez les supercheries des cibles dont la psyché est inférieure à ${baseRang} dans une zone de ${baseZone} mètres autour de vous.`;
                }
            },
            {
                nom: "Souvenir Chromatique I",
                niveau: 8,
                cout: 120,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/((system.psyche)/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: (system) => {
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;
                    return `${baseZone} m.`;
                } ,
                duree: (system) => {
                    const baseDuree = (system && system.perception ? Math.floor((system.perception)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.perception ? Math.floor((system.perception)) : 0) ;
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    return `Après ${baseInvocation} secondes de concentration, vous percevez les Auras réminiscentes des cibles dont la perception est inférieure à ${baseRang} dans une zone de ${baseZone} mètres autour de vous. Ces auras remontent à maximum ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Altération Personnelle",
                niveau: 9,
                cout: 140,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/((system.psyche)/10))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 180 ? 2 : 1;
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance/10)*baseUnitDuree) : 0) ; 
                    return `${baseDuree} h.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseUnitDuree = system.ptsorbochromat >= 180 ? 2 : 1;
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance/10)*baseUnitDuree) : 0) ;
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (system.psyche) : 0) ;
                    return `Après ${baseInvocation} minutes d'altération chromatique, celle-ci a une durée de ${baseDuree} heures. Vous duperez vos interlocuteurs dont la perception est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Arbre Chromatique",
                niveau: 10,
                cout: 160,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(320/((system.psyche)/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: (system) => {
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;
                    return `${baseZone} m.`;
                } ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseUnitZone = system.ptsorbochromat >= 260 ? 2 : 1;
                    const baseZone = (system && system.perception ? Math.floor((system.perception/2)*baseUnitZone) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(320/((system.psyche)/10))) : 0) ; 
                    return `Après ${baseInvocation} secondes de concentration, vous percevez les liens familiaux des cibles dont la psyché est inférieure à ${baseRang} à ${baseZone} mètres autour de vous.`;
                }
            },
            {
                nom: "Altération Partagée",
                niveau: 11,
                cout: 180,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(160/((system.psyche)/10))) : 0) ; 
                    return `${baseInvocation} min.`;
                } ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)*2) : 0) ; 
                    return `${baseDuree} h.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)*2) : 0) ;
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(160/((system.psyche)/10))) : 0) ; 
                    return `Après ${baseInvocation} minutes d'altération chromatique, celle-ci a une durée de ${baseDuree} heures. Vos cibles duperont leurs interlocuteurs dont la perception est inférieure à ${baseRang}. Vos altérations durent maintenant deux fois plus longtemps.`;
                }
            },
            {
                nom: "Bulle Chromatique",
                niveau: 12,
                cout: 200,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/((system.psyche)/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} h.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ;
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/((system.psyche)/10))) : 0) ; 
                    return `Après ${baseInvocation} secondes de concentration, vous créez une bulle qui vous protège des énergies pendant ${baseDuree} minutes. Vous êtes protégés des mages dont la perception est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Disparition Chromatique",
                niveau: 13,
                cout: 220,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/((system.psyche)/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} h.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ;
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/((system.psyche)/10))) : 0) ; 
                    return `Après ${baseInvocation} secondes de concentration, vous effacez toute trace d'aura pendant ${baseDuree} heures.`;
                }
            },
            {
                nom: "Souvenir Chromatique II",
                niveau: 14,
                cout: 240,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/((system.psyche)/10))) : 0) ; 
                    return `${baseInvocation} sec.`;
                } ,
                zoneEffet: "" ,
                duree: (system) => {
                    const baseDuree = (system && system.perception ? Math.floor((system.perception)) : 0) ; 
                    return `${baseDuree} jrs.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.perception ? Math.floor((system.perception)) : 0) ;
                    const baseRang = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/((system.psyche)/10))) : 0) ; 
                    return `Après ${baseInvocation} secondes de concentration, vous percevez les Auras réminiscentes anciennes de ${baseDuree} jours, des cibles dont la psyché est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Vision Supérieure",
                niveau: 15,
                cout: 260,
                tempsInvocation: "",
                zoneEffet: "" ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0) ;
                    return `La distance de vos perceptions est dorénavant multipliée par ${baseRang}. Vous pouvez voir à travers les obstacles`;
                }
            },
            {
                nom: "Contact Chromatique",
                niveau: 16,
                cout: 280,
                tempsInvocation:"",
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `Vous pouvez rencontrer Nal'k pendant ${baseDuree} minutes maximum.`;
                }
            }
        ],
        abreuvoir: [
            {
                nom: "Saturation",
                niveau: 1,
                cout: 15,
                tempsInvocation: "",
                zoneEffet: "" ,
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.endurance/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.endurance/10)) : 0) ;
                    return `Vous avez ${baseRang} points de PUISSANCE, plus ${baseRang} points supplémentaires que vous pouvez stocker pendant ${baseRang} minutes. 
                    Absorption de Puissance supplémentaire :
                    Bronzage au soleil en continu : 1 pt de Puissance / minute (/ distance)
                    Pile de 10 volts contenant 10 pts : 1 pt de Puissance / seconde
                    Batterie de 120 volts contenant 120 pts : 12 pts de Puissance / seconde
                    Prise de 220 volts branchée en continu : 22 pts de Puissance / seconde
                    Boule de feu contenant 30 pts : 30 pts de Puissance / seconde
                    Boule d'électricité contenant 40 pts : 40 pts de Puissance / seconde
                    Éclair contenant 50 pts : 50 pts de Puissance / seconde`;
                }
            },
            {
                nom: "Photokinésie",
                niveau: 2,
                cout: 30,
                tempsInvocation: "",
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor((system.psyche*10)) : 0) ; 
                    return `${baseZone} m.`;
                } ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance/10)) : 0) ; 
                    return `1/${baseDuree} min.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance/10)) : 0) ;  
                    const baseZone = (system && system.psyche ? (system.psyche) : 0) ;
                    return `Vous pouvez illuminer une zone de ${baseZone} en consommant 1 point de PUISSANCE par tranche de ${baseDuree} minutes. Vous pouvez faire varier l'intensité : doux = 1 pt de Puissance; normal = 2 pts de Puissance; intense = 3 pts de Puissance; aveuglant = 4 pts de Puissance.`;
                }
            },
            {
                nom: "Champs de Force",
                niveau: 3,
                cout: 45,
                tempsInvocation: "2 sec.",
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseZone} m.`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseInvocation = "2";
                    return `En ${baseInvocation} secondes, vous dressez un champ de force protégeant des attaques physiques ou magiques qui dure ${baseDuree} minutes et s'étend sur ${baseRang} mètres autour de vous.
                    Dévier l'énergie vous permet de renvoyer automatiquement l'énergie au sol, évitant ainsi que des passants soient blessés.
                    Renvoyer l'énergie vous permet de renvoyer automatiquement les dégâts que vous deviez subir sur celui qui vous attaque.
                    Absorber l'énergie vous permet simplement de renforcer votre bouclier avec les points de dégâts que vous auriez dû subir.`;
                }
            },
            {
                nom: "Ondes de Choc",
                niveau: 4,
                cout: 60,
                tempsInvocation: "2 sec.",
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor((system.psyche)) : 0) ;
                    return `${baseZone}`;
                } ,
                duree: "" ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    const baseRang2 = (system && system.psyche ? Math.floor((system.psyche)) : 0) ;
                    return `${baseRang} m/${baseRang2} m².`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseZone = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseInvocation = "2" ;
                    return `En ${baseInvocation} secondes, vous projetez une onde de choc sur ${baseZone} mètres carré autour et à une distance de ${baseRang} mètres de vous. Elle occasionne ${baseRang} dégâts étourdissants et non mortels de force .`;
                }
            },
            {
                nom: "Manipulation I",
                niveau: 5,
                cout: 75,
                tempsInvocation: "2 sec.",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.physique ? Math.floor((system.physique)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((system.psyche+system.perception)/10) : 0) ;
                    const baseRang2 = (system && system.physique ? Math.floor((system.physique)) : 0) ; 
                    const baseInvocation = "2" ;
                    return `En ${baseInvocation} secondes, votre capacité de vol à une vitesse de ${baseRang} km/h, à une hauteur de ${baseRang2} pendant ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Catalyseur",
                niveau: 6,
                cout: 90,
                tempsInvocation: "",
                zoneEffet: "" ,
                duree: "1 sec/1 pt",
                rang: "2 pts/1PV",
                description: `Vous pouvez partager votre énergie avec vos amis par un simple contact. Vous transférez 1 point en 1 seconde.`
            },
            {
                nom: "Décharge Energétique",
                niveau: 7,
                cout: 105,
                tempsInvocation: "1 sec/1 pt",
                zoneEffet: "" ,
                duree: "",
                rang: "Pui.",
                description: `Vous pouvez utiliser votre énergie pour recharger un objet par simple contact. Vous transférez 1 point en 1 seconde.
                    Petite batterie : Un smartphone de 5 Volts contient 5 pts / Pile de 10 Volts contient 10 pts / Batterie de 120 Volts contient 120 pts ...
                    Voiture électrique : Une batterie de 300 Volts contient 300 pts 
                    Droïde optimisé : 2 batteries de 250 Volts 
                    XWing de Luke : 2 batteries de 1000 Volts ...
                    Étoile de la Mort : 645 batteries de 100 000 000 Volts`
            },
            {
                nom: "Eclat Energétique",
                niveau: 8,
                cout: 120,
                tempsInvocation: "1 sec." ,
                zoneEffet: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseZone}`;
                } ,
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `Vous activez en 1 seconde, un éclat d'énergie sur une cible qui a une endurance inférieure à ${baseRang}, cela lui occasionne ${baseDuree} points de dégâts mortels par seconde.`;
                }
            },
            {
                nom: "Manipulation II",
                niveau: 9,
                cout: 140,
                tempsInvocation: "2 sec.",
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor((system.psyche)) : 0) ; 
                    return `${baseZone}`;
                } ,
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((system.psyche+system.perception)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor((system.psyche)) : 0) ;
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche)) : 0) ; 
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((system.psyche+system.perception)) : 0) ;
                    const baseRang2 = (system && system.physique ? Math.floor((system.physique)) : 0) ; 
                    const baseInvocation = "2" ;
                    return `En ${baseInvocation} secondes, votre capacité de vol à une vitesse de ${baseRang} km/h, à une hauteur de ${baseRang2} pendant ${baseDuree} minutes. Vous pouvez être accompagné par ${baseZone} personnes en divisant votre vitesse d'autant.`;
                }
            },
            {
                nom: "Eclats Etendus",
                niveau: 10,
                cout: 160,
                tempsInvocation: "1 sec." ,
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseZone}`;
                } ,
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;  
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseZone = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    return `Vous activez en 1 seconde, un éclat d'énergie sur une cible qui a une endurance inférieure à ${baseRang}, cela lui occasionne ${baseDuree} points de dégâts mortels par seconde. Vous pouvez cibler ${baseZone} cibles supplémentaires. `;
                }
            },
            {
                nom: "Bouclier Energétique",
                niveau: 11,
                cout: 180,
                tempsInvocation: "2 sec.",
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseZone} m.`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance/10)) : 0) ; 
                    return `${baseDuree} h.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `${baseRang} km²`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    const baseZone = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseInvocation = "2";
                    return `En ${baseInvocation} secondes, vous projetez un champ de force ${baseRang} km² autour de vous. Vous choisissez la PUISSANCE investie au lancement. Ce champ peut durer ${baseDuree} h.`;
                }
            },
            {
                nom: "Pluie d'Eclats",
                niveau: 12,
                cout: 200,
                tempsInvocation: "1 sec.",
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ; 
                    return `${baseZone} km²`;
                } ,
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseDuree} pt/sec.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;  
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception)/10)) : 0) ;
                    return `Vous activez en 1 seconde, un éclat d'énergie sur une cible qui a une endurance inférieure à ${baseDuree}, cela lui occasionne ${baseRang} points de dégâts mortels.`;
                }
            },
            {
                nom: "Blocage Energétique",
                niveau: 13,
                cout: 220,
                tempsInvocation: "2 sec.",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    const baseRang = (system && system.psyche ? Math.floor((system.psyche)) : 0) ;
                    const baseInvocation = "2" ;
                    return `En ${baseInvocation} secondes, vous activez le blocage d'un objet énergétique de taille ${baseRang} pendant ${baseDuree} minutes par jour.`;
                }
            },
            {
                nom: "Fontaine de Puissance",
                niveau: 14,
                cout: 240,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseInvocation} minutes.`;
                } ,
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor((system.endurance)) : 0) ; 
                    return `${baseDuree} jrs.`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.physique && system.endurance ? Math.floor(((system.physique+system.endurance))) : 0) ;  
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.endurance)) : 0) ; 
                    const baseInvocation = (system && system.endurance ? Math.floor((system.endurance)) : 0) ;
                    const baseRang = (system && system.physique && system.endurance ? Math.floor(((system.physique+system.endurance))) : 0) ;
                    return `En vous y baignant pendant ${baseInvocation} minutes, vous pouvez augmenter votre réserve à un maximum de ${baseRang} points supplémentaires que vous pouvez stocker pendant ${baseDuree} minutes.`;
                }
            },
            {
                nom: "Combustion",
                niveau: 15,
                cout: 260,
                tempsInvocation: "1 sec.",
                zoneEffet: "cible.",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor((system.psyche/10)) : 0) ;  
                    const baseRang = (system && system.psyche && system.perception ? Math.floor(((system.psyche+system.perception))) : 0) ;
                    const baseInvocation = "1 sec." ;
                    return `Vous activez en ${baseInvocation} la combustion d'une cible dont l'endurance est inférieure à votre endurance à ${baseRang}, temporisée de ${baseDuree} minutes sur une cible.`;
                }
            },
            {
                nom: "Contact Primordial",
                niveau: 16,
                cout: 280,
                tempsInvocation: "",
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree}`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `Vous pouvez rencontrer Maego pendant ${baseDuree} minutes maximum.`;
                }
            }
        ],
        harmonium: [
            {
                nom: "Vision Harmonieuse",
                niveau: 1,
                cout: 15,
                tempsInvocation: "",
                zoneEffet: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor((system.charisme*10)) : 0) ;
                    return `${baseZone} m.`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    return `${baseDuree} Min.`;
                },
                rang: "" ,
                description: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor((system.charisme*10)) : 0) ;
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    return `Permet de percevoir l'harmonie et détecter des dissonances des Ombres pendant ${baseDuree} minutes par jour sur une zone de ${baseZone} mètres de rayon.`;
                }
            },
            {
                nom: "Chant Harmonieux",
                niveau: 2,
                cout: 30,
                tempsInvocation: "",
                zoneEffet: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor((system.charisme*10)) : 0) ;
                    return `${baseZone} m.`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    return `${baseDuree} Min.`;
                },
                rang: "" ,
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    const baseZone = (system && system.charisme ? Math.floor((system.charisme*10)) : 0) ;
                    return `Vous attirez les animaux sur une zone de ${baseZone} mètres de rayon. Cela dure ${baseDuree} minutes par jour.`;
                }
            },
            {
                nom: "Comparaison Mineure",
                niveau: 3,
                cout: 45,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ;
                    return `${baseInvocation} sec`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `Cet air vous permet de comparer ${baseRang} cibles après ${baseInvocation} secondes de musique.`;
                }
            },
            {
                nom: "Etincelle en Do",
                niveau: 4,
                cout: 60,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} sec`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)*2)) : 0 ) ;
                    return `${baseRang} Min.`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)*2)) : 0 ) ;
                    return `Cette musique vous permet de maintenir en vie et de réanimer une créature mortellement blessée et inconsciente. Vous pouvez rendre à ces cibles ${baseRang} points de vie par jour. Chaque don de 1 pt de vie demande ${baseInvocation} secondes.`;
                }
            },
            {
                nom: "Arpège Mineur",
                niveau: 5,
                cout: 75,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ;
                    return `${baseInvocation}`;
                },
                zoneEffet: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)*10)) : 0 ) ;
                    return `${baseZone} m.`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} Min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ;
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)*10)) : 0 ) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `En ${baseInvocation} secondes, vous créer une zone d'un rayon de ${baseZone} mètres centrée sur vous ou sur un élément du décor. Dans cette zone, tout s'équilibre. La durée maximale par jour est de ${baseDuree} minutes. Ne fonctionne ni à Ambre ni dans les ombres du Cercle d'Or.`;
                }
            },
            {
                nom: "Convenance d'Octave",
                niveau: 6,
                cout: 90,
                tempsInvocation: "",
                zoneEffet: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)*10)) : 0 ) ;
                    return `${baseZone}`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} Min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme)*10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)*10)) : 0 ) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `Le personnage obtient d'un ou plusieurs PNJ sur une zone de ${baseZone} un type d'objet ou un type de service à sa convenance, sans aucun retour, et surtout avec le sourire. Cet effet peut être activé pendant ${baseDuree} minutes par jour.`;
                }
            },
            {
                nom: "Mélodie du Bonheur",
                niveau: 7,
                cout: 105,
                tempsInvocation: "",
                zoneEffet: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)*10)) : 0 ) ;
                    return `${baseZone}`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} Min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.charisme && system.perception ? (Math.floor((system.charisme+system.perception))) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)*10)) : 0 ) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    const baseRang = (system && system.charisme && system.perception ? (Math.floor((system.charisme+system.perception))) : 0) ;
                    return `Le personnage joue une mélodie qui apaise les tensions sur ${baseZone} mètres autour de lui. Il peut le faire pendant ${baseDuree} minutes par jour. L'effet fonctionne sur les cibles dont la PSYCHE est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Etincelle en Mi",
                niveau: 8,
                cout: 120,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(60/(system.perception/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)*5)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(60/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)*5)) : 0 ) ;
                    return `Cette musique en Mi Majeur, agit sur les personnes ou créatures conscientes, ciblées dans votre champ visuel, et vous permet de soigner une créature ou une personne consciente. Vous pouvez rendre jusqu'à ${baseRang} points de vie.  Il faut ${baseInvocation} secondes pour soigner 1 point de vie.`;
                }
            },
            {
                nom: "Arpège Majeur",
                niveau: 9,
                cout: 140,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                },
                zoneEffet: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `${baseZone} km²`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)/10)) : 0 ) ;
                    return `${baseDuree} h.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)/10)) : 0 ) ;
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `Comme Arpège Mineur mais le lanceur peut projeter la brume sur une cible vivante. La zone couverte est de ${baseZone} km². Il faut ${baseInvocation} secondes pour déclencher la brume que vous pouvez maintenir pendant ${baseDuree} heures par jour.`;
                }
            },
            {
                nom: "Etincelle en Sol",
                niveau: 10,
                cout: 160,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseZone} cibles`;
                },
                duree:"",
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme))) : 0 ) ;
                    return `${baseRang} h.`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseZone = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme))) : 0 ) ;
                    return `Ces notes de musique en Sol Majeur permettent de ramener à la vie un sujet mort depuis moins de ${baseRang} heures. Vous pouvez produire cet air ${baseZone} fois par jour. Chacune demande un air de ${baseInvocation} minutes.`;
                }
            },
            {
                nom: "Improvisation",
                niveau: 11,
                cout: 180,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    return `${baseInvocation}`;
                },
                zoneEffet: (system) => {
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `${baseZone} km²`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} h.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.charisme && system.perception ? (system.charisme+system.perception) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    const baseRang = (system && system.charisme && system.perception ? (system.charisme+system.perception) : 0) ;
                    const baseZone = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `Cette capacité permet au personnage en jouant de faire fuir dans une zone de ${baseZone} km² de large tous les animaux, créatures et individus.conflits pendant. Votre improvisation dure ${baseDuree} heures. Les cibles avec une PSYCHE supérieure à ${baseRang} sont immunisées.`;
                }
            },
            {
                nom: "Oreille Absolue",
                niveau: 12,
                cout: 200,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "Ombre",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} jrs.`;
                },
                rang: "",
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `Comme Arpège Majeur, mais la brume s'active sur la totalité de l'ombre. Il faut ${baseInvocation} minutes pour déclencher la brume. Elle peut durer jusqu'à ${baseDuree} jours.`;
                }
            },
            {
                nom: "Comparaison Majeure",
                niveau: 13,
                cout: 220,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "Ombre",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `Permet de lancer une comparaison sur l'intégralité d'une ombre. Temps de lancement : ${baseInvocation} minutes. Vous êtes limités à ${baseRang} par jour.`;
                }
            },
            {
                nom: "Tempo d'Espoir",
                niveau: 14,
                cout: 240,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation}`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `Si vous êtes dans une situation désespérée, jouez ces quelques notes de musique sur le bon Tempo pour éclairer votre esprit sur une voie de sortie en vous donnant ${baseRang} indices. Cela vous prend ${baseInvocation} minutes.`;
                }
            },
            {
                nom: "Si Bémol",
                niveau: 15,
                cout: 260,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    return `${baseInvocation}`;
                },
                zoneEffet: "Ombre.",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.charisme && system.perception ? (system.charisme+system.perception) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.charisme && system.perception ? (system.charisme+system.perception) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    return `Cette douce musique en Si bémol vous donne les pleins pouvoirs sur la totalité d'une Ombre. Les créatures et individus avec une PSYCHE infériure à ${baseRang} s'inclinent devant le personnage. ${baseInvocation} minutes sont nécessaires à l'activation.`;
                }
            },
            {
                nom: "Chant d'Ekkih",
                niveau: 16,
                cout: 280,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ; 
                    return `${baseDuree} min.`;
                } ,
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor((system.charisme/10)) : 0) ;
                    return `Permet un contact direct avec Ekkih, la source primordiale de l'Harmonie pendant ${baseDuree} minutes.`;
                }
            }
        ],
        chimerion: [
            {
                nom: "Tyr Na Nog'th",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception)))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception)))) : 0 ) ;
                    return `En ${baseInvocation} minutes, vous pouvez pénétrer les rêves d'une cible dont la PERCEPTION est inférieure à ${baseRang} par le biais d'un contact physique pour les observer. 
                    Vous pouvez rester dans ces rêves jusqu'à ${baseDuree} minutes`;
                }
            },
            {
                nom: "Déjà Vu",
                niveau: 2,
                cout: 30,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception)))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `En ${baseInvocation} minutes, vous pouvez pénétrer les rêves d'une cible dont la PERCEPTION est inférieure à ${baseRang} par le biais d'un contact physique pour y implanter une image persistante. 
                    Vous pouvez rester dans ces rêves jusqu'à ${baseDuree} minutes`;
                }
            },
            {
                nom: "Dualité",
                niveau: 3,
                cout: 45,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception)))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `En ${baseInvocation} minutes, vous pouvez pénétrer les rêves d'une cible dont la PERCEPTION est inférieure à ${baseRang} par le biais d'un contact physique. 
                    Vous pouvez transformer ce rêve en cauchemar ou inversement. Vous pouvez rester dans ces rêves jusqu'à ${baseDuree} minutes`;
                }
            },
            {
                nom: "Plonger dans le Rêve",
                niveau: 4,
                cout: 60,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception)))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `En ${baseInvocation} minutes, vous pouvez pénétrer les rêves d'une cible dont la PERCEPTION est inférieure à ${baseRang} par le biais d'un contact physique. 
                    Vous pouvez être actif dans ce rêve. Vous pouvez rester dans ces rêves jusqu'à ${baseDuree} minutes`;
                }
            },
            {
                nom: "Repos Réparateur",
                niveau: 5,
                cout: 75,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception)))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `En ${baseInvocation} minutes, vous pouvez pénétrer les rêves d'une cible dont la PERCEPTION est inférieure à ${baseRang} par le biais d'un contact physique. 
                    Vous pouvez stimuler la guérison du rêveur et lui rendre jusqu'à ${baseDuree} points de vie. Vous pouvez rester dans ces rêves jusqu'à ${baseDuree} minutes
                    Vous devez rester ${baseInvocation} minutes pour que cela fonctionne.`;
                }
            },
            {
                nom: "Souvenirs Perdus",
                niveau: 6,
                cout: 90,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception)))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `En ${baseInvocation} minutes, vous pouvez pénétrer les rêves d'une cible dont la PERCEPTION est inférieure à ${baseRang} par le biais d'un contact physique. 
                    Vous pouvez effacer jusqu'à ${baseDuree} souvenirs récents. Vous pouvez rester dans ces rêves jusqu'à ${baseDuree} minutes
                    Vous devez rester ${baseInvocation} minutes pour que cela fonctionne.`;
                }
            },
            {
                nom: "Vol du Papillon",
                niveau: 7,
                cout: 105,
                tempsInvocation: "",
                zoneEffet:"",
                duree: "",
                rang: "",
                description: "Les durées pour accéder aux rêves passent de minutes en secondes."
            },
            {
                nom: "Anténaë",
                niveau: 8,
                cout: 120,
                tempsInvocation: "",
                zoneEffet:"",
                duree: "",
                rang: "",
                description: "Le contact physique n'est plus nécessaire mais seulement un contact visuel. Si vous utilisez Anténaë, vos temps d'invocation et la durée d'action sont doublés."
            },
            {
                nom: "Hallucination",
                niveau: 9,
                cout: 140,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                },
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseDuree}`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `En ${baseInvocation} secondes, vous pouvez provoquer des hallucinations chez une cible dont la PERCEPTION est inférieure à ${baseRang}. 
                    Ces hallucinations visuelles ou auditives durent ${baseDuree} minutes. Fonctionne sur des cibles éveillées.`;
                }
            },
            {
                nom: "Idée Fixe",
                niveau: 10,
                cout: 160,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                },
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseDuree}`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `En ${baseInvocation} secondes, vous pouvez implanter une idée fixe chez une cible dont la PERCEPTION est inférieure à ${baseRang}. 
                    Ces hallucinations visuelles ou auditives durent ${baseDuree} minutes. Fonctionne sur des cibles éveillées.`;
                }
            },
            {
                nom: "Galerie des Miroirs",
                niveau: 11,
                cout: 180,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ;
                    return `${baseInvocation} min`;
                },
                zoneEffet:"",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor((((system.psyche))/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(240/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `Vous permet de connecter le Chimérion à ${baseRang} miroir(s) existant(s). Cela vous prend ${baseInvocation} minutes.
                    Vous pouvez ensuite voir utiliser vos capacités du Chimérion au travers de ces miroirs.`;
                }
            },
            {
                nom: "Hantise",
                niveau: 12,
                cout: 200,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    return `${baseInvocation} sec.`;
                },
                zoneEffet: (system) => {
                    const baseZone = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `${baseZone}`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseDuree}`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    const baseInvocation = (system && system.perception ? (Math.floor(120/(system.perception/10))) : 0) ;
                    const baseRang = (system && system.psyche && system.perception ? Math.floor((((system.psyche+system.perception))/10)) : 0 ) ;
                    const baseZone = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `En ${baseInvocation} secondes, vous pouvez implanter une idée fixe chez ${baseZone} cible(s) dont la PERCEPTION est inférieure à ${baseRang}. 
                    Ces hallucinations visuelles ou auditives durent ${baseDuree} minutes. Fonctionne sur des cibles éveillées.`;
                }
            },
            {
                nom: "Repos du Guerrier",
                niveau: 13,
                cout: 220,
                tempsInvocation: "",
                zoneEffet:"",
                duree: "",
                rang: "",
                description: "Vous permet de vous appliquer vous même Repos Réparateur. Vous regagnez la totalité de vos points de vie et d'énergie en 6 heures de sommeil."
            },
            {
                nom: "Passe-Miroir",
                niveau: 14,
                cout: 240,
                tempsInvocation: "",
                zoneEffet:"",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    return `Evolution de Galerie des Miroirs, vous pouvez voyager au travers des ${baseRang} miroirs que vous avez connectés.`;
                }
            },
            {
                nom: "Esprit du Papillon",
                niveau: 15,
                cout: 260,
                tempsInvocation: "",
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree}`;
                },
                rang: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    const baseRang = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `Vous pouvez quitter votre corps et agir en Esprit du Chimérion pendant ${baseRang} minutes. 
                    Vous êtes immatériels, pouvez traverser les murs et les obstacles mais pas les barrières magiques. 
                    Personne ne vous voit mais vous ne les entendez pas nons plus.`;
                }
            },
            {
                nom: "Contact avec Onidji",
                niveau: 16,
                cout: 280,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    return `${baseDuree}`;
                },
                rang: "",
                description: (system) => {
                    const base = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    return `Établit le contact direct avec Onidji pendant ${base} minutes.`;
                }
            }
        ],
        sabliers: [
            {
                nom: "Sabliers Mouvants",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system  && system.perception ? Math.floor(120/((system.perception)/10)) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree}`;
                },
                rang: (system) => {
                    const baseRang = (system  && system.psyche && system.endurance ? Math.floor(((system.psyche+system.endurance)/10)) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseInvocation = (system  && system.perception ? Math.floor(120/((system.perception)/10)) : 0) ;
                    const baseRang = (system  && system.psyche && system.endurance ? Math.floor(((system.psyche+system.endurance)/10)) : 0) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `Il faut ${baseInvocation} minutes pour établir la connexion initiale au courant temporel, vous devez y rester connecté pendant ${baseDuree} minutes pour en avoir les effets. 
                    La connexion reste établie durant ${baseRang} jours.`;
                }
            },
            {
                nom: "Le Pendule d'Ujuhé",
                niveau: 2,
                cout: 30,
                tempsInvocation: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    return `${baseInvocation} sec.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception)/10)) : 0) ;
                    return `+/- ${baseRang} sec/min`;
                },   
                description: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception)/10)) : 0) ;
                    return `Après ${baseInvocation} secondes, vous pouvez dérégler les objets qui mesurent le temps de +/- ${baseRang} secondes par minute de  minutes.`;
                }
            },
            {
                nom: "Datation d'Ujuhé",
                niveau: 3,
                cout: 45,
                tempsInvocation: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    return `${baseInvocation} sec.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception)/10)) : 0) ;
                    return `Vous pouvez déterminer la date de création de ${baseRang} objets par jour. 
                    Il faut ${baseInvocation} secondes pour activer cette capacité.`;
                }
            },
            {
                nom: "Intervalle Régulier",
                niveau: 4,
                cout: 60,
                tempsInvocation: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "",
                duree:"",
                rang: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(120/((system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseInvocation = (system  && system.perception ? Math.floor(120/((system.perception)/10)) : 0) ;
                    const baseRang = (system  && system.perception ? Math.floor(120/((system.perception)/10)) : 0) ;
                    return `Vous modifiez l'intervalle temporel d'une ombre de +/- ${baseRang} minutes tant que vous restez dans cette ombre. 
                    Il faut ${baseInvocation} minutes pour déclencher cette capacité.`;
                }
            },
            {
                nom: "Horloge Interne",
                niveau: 5,
                cout: 75,
                tempsInvocation: "5 sec.",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)/10)) : 0 ) ;
                    return `${baseDuree} jrs.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)/10)) : 0 ) ;
                    const baseInvocation = "5";
                    const baseRang = (system  && system.psyche && system.endurance ? Math.floor(((system.psyche+system.endurance)/10)) : 0) ;
                    return `Vous pouvez altérer votre horloge interne. Cela affecter la durée des effets ou les temps d'incantation avec un rapport de ${baseRang}.
                    Il faut ${baseInvocation} secondes pour déclencher cet effet et dure ${baseDuree} jours.`;
                }
            },
            {
                nom: "Sable fin d'Ujuhé",
                niveau: 6,
                cout: 90,
                tempsInvocation: "5 sec.",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree}`;
                },
                rang: (system) => {
                    const baseRang = (system  && system.psyche ? Math.floor(((system.psyche)/10)) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseInvocation = "5";
                    const baseRang = (system  && system.psyche ? Math.floor(((system.psyche)/10)) : 0) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `En ${baseInvocation} secondes, vous vous déplacez dans l'Entretemps pendant une durée incompressible de ${baseDuree} minutes.
                    Vous disparaissez de l'ombre où vous vous trouvez mais vous y réapparaitrez à la fin de l'effet. 
                    Dans ce laps de temps, vous pouvez interragir avec les objets d'ombre tant qu'ils n'excèdent pas ${baseRang} kigolgrammes.`;
                }
            },
            {
                nom: "Datation d'Ujuhé II",
                niveau: 7,
                cout: 105,
                tempsInvocation: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    return `${baseInvocation} sec.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception)/10)) : 0) ;
                    return `Vous pouvez déterminer la date de création de ${baseRang} êtres vivants par jour. 
                    Il faut ${baseInvocation} secondes pour activer cette capacité.`;
                }
            },
            {
                nom: "Poussière d'Antan",
                niveau: 8,
                cout: 120,
                tempsInvocation: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    return `${baseInvocation} sec.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(120/((system.perception)/10)) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    const baseRang = (system  && system.perception ? Math.floor(120/((system.perception)/10)) : 0) ;
                    return `Cette capacité vous permet de percevoir le temps. Elle nécessite ${baseInvocation} secondes pour s'activer et ne fonctionne que dans un espace clos.
                    Vous pouvez manipuler ${baseRang} mètres cube de poussière d'antan mais vous ne savez pas encore qu'en faire.`;
                }
            },
            {
                nom: "Ryhtme d'Ujuhé",
                niveau: 9,
                cout: 140,
                tempsInvocation: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception))) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseInvocation = (system  && system.perception ? Math.floor(120/((system.perception)/10)) : 0) ;
                    const baseRang = (system  && system.psyche && system.endurance ? Math.floor(((system.psyche+system.endurance)/10)) : 0) ;
                    return `Vous pouvez en ${baseInvocation} minutes changer le rythme d'une Ombre personnelle et le rapport temporel entre Ambre et elle de x${baseRang}.`;
                }
            },
            {
                nom: "Aura d'Ujuhé",
                niveau: 10,
                cout: 160,
                tempsInvocation: "",
                zoneEffet: (system) => {
                    const baseZone = (system  && system.psyche ? Math.floor(((system.psyche)/10)) : 0) ;
                    return `${baseZone}`;
                },
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.psyche ? Math.floor(((system.psyche)/10)) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseZone = "";
                    return `Dans une zone de ${baseZone} mètres autour de vous, tout est modifié par votre Horloge Interne. `;
                }
            },
            {
                nom: "Poussière en Corps",
                niveau: 11,
                cout: 180,
                tempsInvocation: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception))) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception))) : 0) ;
                    return `Vous pouvez, en ${baseInvocation} minutes, rajeunir ou vieillir de ${baseRang} jours une personne consentante.`;
                }
            },
            {
                nom: "Château de Poussières",
                niveau: 12,
                cout: 200,
                tempsInvocation: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception))*10) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseInvocation = (system  && system.psyche ? Math.floor(120/((system.psyche)/10)) : 0) ;
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception))*10) : 0) ;
                    return `Vous pouvez, en ${baseInvocation} minutes, rajeunir ou vieillir de ${baseRang} jours une cible inanimée. 
                    5 usures sur un bâtiment aura tendance à le détruire. Cette capacité ne fonctionne pas en Ambre.`;
                }
            },
            {
                nom: "Poussières en Sable",
                niveau: 13,
                cout: 220,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.psyche ? Math.floor((system.psyche)) : 0) ;
                    return `x${baseRang}`;
                },   
                description: (system) => {
                    const baseRang = (system  && system.psyche ? Math.floor((system.psyche)) : 0) ;
                    return `Vous multipliez maintenant par ${baseRang} les jours de vieillissement/rajeunissement et de réparation/usure des capacités Poussières En Corps et Château de Poussière.`;
                }
            },
            {
                nom: "Pause d'Ujuhé",
                niveau: 14,
                cout: 240,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception))) : 0) ;
                    return `${baseRang}`;
                },   
                description: (system) => {
                    const baseRang = (system  && system.perception ? Math.floor(((system.perception))) : 0) ;
                    return `Vous arrêtez le temps pendant ${baseRang} secondes. Cela compte aussi pour vous mais peut vous permettre une pause salutaire.`;
                }
            },
            {
                nom: "Suprématie d'Ujuhé",
                niveau: 15,
                cout: 260,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: '',   
                description: "Avec ce niveau de maîtrise, vous pouvez appliquer vos capacités Poussières d'Antan à un Ambrien et Château de Poussière à un objet ou une construction, même si celle-ci contient une énergie magique"
            },
            {
                nom: "Contact avec Ujuhé",
                niveau: 16,
                cout: 280,
                tempsInvocation:"",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `${baseDuree}`;
                },
                rang: "",   
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `Établit le contact avec la Source du Temps pendant ${baseDuree} minutes.`;
                }
            }
        ],
        abysses: [
            {
                nom: "Pêcheur de l'Abysse",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(360/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `${baseRang} choses.`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(360/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `Vous pouvez pêcher dans l'Abysses, en y consacrant ${baseInvocation} minutes, vous pouvez récupérer jusqu'à ${baseRang} choses par jour.
                    Le résultat de votre pêche dépend de votre karma. Avec du mauvais karma, vous pêcher autant de créatures que votre karma avant de pêcher un objet.
                    Avec du bon karma, vous pêcher autant d'objets que votre karma avant de pêcher une créature. Avec du karma neutre, vous alternez entre objets et créatures.`;
                }
            },
            {
                nom: "Plongeur de l'Abysse",
                niveau: 2,
                cout: 30,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `Les règles de pêche précédentes ne s'appliquent plus à vous désormais. Vous remontez un objet de plus.
                    Vous pouvez plonger pendant ${baseDuree} minutes par jour, au delà vous subissez 2 points de Mal des Abysses toutes les 5 minutes. `;
                }
            },
            {
                nom: "Plongée en Apnée",
                niveau: 3,
                cout: 45,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)*2)) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)*2)) : 0 ) ;
                    return `Vous plongez deux fois plus longtemps désormais. Vous remontez un objet de plus.
                    Vous pouvez plonger pendant ${baseDuree} minutes par jour, au delà vous subissez 1 points de Mal des Abysses toutes les 5 minutes. `;
                }
            },
            {
                nom: "Survie en Profondeur",
                niveau: 4,
                cout: 60,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)*4)) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)*4)) : 0 ) ;
                    return `Vous plongez deux fois plus longtemps désormais. Vous remontez un objet de plus et un puissant artefact.
                    Vous pouvez plonger pendant ${baseDuree} minutes par jour, au delà vous subissez 1 points de Mal des Abysses toutes heures.
                    Vous êtes obligés de plonger et de revenir depuis l'immense crevasse derrière la Citadelle du Chaos.`;
                }
            },
            {
                nom: "Courants Abyssaux",
                niveau: 5,
                cout: 75,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception))) : 0 ) ;
                    return `Vous connaissez un nombre de Kosmes/Sous-Kosmes égal à ${baseRang} dans lequel le Mal des Abysses n'a pas de prise.
                    Vous n'êtes plus obligés de plonger et de revenir depuis l'immense crevasse derrière la Citadelle du Chaos.`;
                }
            },
            {
                nom: "Faille Abyssale",
                niveau: 6,
                cout: 90,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} sec`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? (Math.floor((system.psyche/10))) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.psyche ? (Math.floor((system.psyche/10))) : 0) ;
                    return `En ${baseInvocation} secondes, vous ouvre unefaille vers les Abysses (un Kosme/Sous-Kosme) depuis une ombre. 
                    Vous pouvez ouvrir ou fermer ${baseRang} Failles par jour. La faille fait 10 points de dommage toutes les secondes`;
                }
            },
            {
                nom: "Brûlure Abyssale",
                niveau: 7,
                cout: 105,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} sec`;
                },
                zoneEffet: "",
                duree:"",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `Il faut ${baseInvocation} secondes pour lancer la brûlure, elle inflige votre niveau toutes les 2 secondes. Vous pouvez en lancer ${baseRang} par jour.`;
                }
            },
            {
                nom: "Lucidité Abyssale",
                niveau: 8,
                cout: 120,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(320/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "",
                duree: "",
                rang: "",
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(320/(system.psyche/10))) : 0) ;
                    return `Il vous faut ${baseInvocation} pour analyser un objet magique.`;
                }
            },
            {
                nom: "Compagnon Abyssal",
                niveau: 9,
                cout: 140,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseTaille = (system && system.psyche ? Math.floor((system.charisme)) : 0 ) ;
                    const baseNiveau = (system && system.psyche ? Math.floor(10+((system.charisme)/10)) : 0 ) ;
                    return `Un compagnon abyssal de ${baseTaille} centimètres et de niveau ${baseNiveau} qui vous suit partout.`;
                }
            },
            {
                nom: "Rayon Abyssal",
                niveau: 10,
                cout: 160,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} sec`;
                },
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)/10)) : 0 ) ;
                    return `${baseDuree}`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)*10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)*10)) : 0 ) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance)/10)) : 0 ) ;
                    return `Il faut ${baseInvocation} secondes pour lancer le rayon abyssal à une distance de ${baseRang} mètres, il inflige votre niveau toutes les 2 secondes. Vous pouvez en lancer ${baseDuree} par jour.`;
                }
            },
            {
                nom: "Bulle Abyssale",
                niveau: 11,
                cout: 180,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} sec`;
                },
                zoneEffet: (system) => {
                    const baseZone = (system && system.physique ? Math.floor(((system.physique)/10)) : 0 ) ;
                    return `${baseZone} pers.`;
                },
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.physique ? Math.floor(((system.physique)/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    const baseZone = (system && system.physique ? Math.floor(((system.physique)/10)) : 0 ) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.physique ? Math.floor(((system.physique)/10)) : 0 ) ;
                    return `Vous créez une Bulle Abyssale infranchissable en ${baseInvocation} secondes, protégeant jusqu'à ${baseRang} personnes pendant ${baseDuree} minutes au maximum par jour.`;
                }
            },
            {
                nom: "Voyage par l'Abysse",
                niveau: 12,
                cout: 200,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: "",
                description: (system) => {
                    const baseRang = (system && system.physique ? Math.floor(((system.physique)/10)) : 0 ) ;
                    return `Votre nombre de failles est doublé. Le temps pour les ouvrir est diminué de moitié.`;
                }
            },
            {
                nom: "Connaissance Abyssale",
                niveau: 13,
                cout: 220,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche))) : 0 ) ;
                    return `Destruction pure totale d'une cible en ${baseRang} secondes.`;
                }
            },
            {
                nom: "Déchirure Abyssale",
                niveau: 14,
                cout: 240,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} sec`;
                },
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor(((system.psyche)*10)) : 0 ) ;
                    return `${baseZone} m.`;
                },
                duree:"",
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(240/(system.psyche/10))) : 0) ;
                    const baseZone = (system && system.psyche ? Math.floor(((system.psyche)*10)) : 0 ) ;
                    return `Il vous faut ${baseInvocation} secondes pour créer une Déchirure Abyssale de ${baseZone} mètres de rayon, à une distance de ${baseRang} kilomètres.`;
                }
            },
            {
                nom: "Foyer Abyssal",
                niveau: 15,
                cout: 260,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(360/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseZone} km²`;
                },
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseRang} km²`;
                },
                description: (system) => {
                    const baseZone = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(360/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `Il vous faut ${baseInvocation} minutes pour rejoindre votre Foyer Abyssal de ${baseZone} kilomètres carrés.`;
                }
            },
            {
                nom: "Fusion Abyssale",
                niveau: 16,
                cout: 280,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) 
                    return `${baseDuree} minutes`;
                },
                rang: "",
                description: (system) => {
                    const baseDuree = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 )
                    return `Contact direct avec Gorogu pendant ${baseDuree} minutes.`;
                }
            }
        ],
        magie: [
            {
                nom: "Discernement",
                niveau: 1,
                cout: 15,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} sec`;
                },
                zoneEffet: (system) => {
                    const baseZone = (system && system.perception ? Math.floor(((system.perception)*10)) : 0 ) ;
                    return `${baseZone} m.`;
                },
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    const baseZone = (system && system.perception ? Math.floor(((system.perception)*10)) : 0 ) ;
                    return `Permet de percevoir les flux magiques sur une zone de ${baseZone} mètres. Vous pouvez faire ${baseRang} discernements par jour, cela vous demande ${baseInvocation} secondes.`;
                }
            },
            {
                nom: "Mots de Pouvoirs",
                niveau: 2,
                cout: 30,
                tempsInvocation: "3 sec.",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? (system.psyche+system.perception) : 0) ;
                    return `${baseRang}`;
                },
                description: (system) => {
                    const baseInvocation = "3 sec.";
                    const baseNbre = (system && system.psyche ? Math.floor(((system.psyche)/5)) : 0 ) ;
                    const baseRang = (system && system.psyche && system.perception ? (system.psyche+system.perception) : 0) ;
                    return `Vous pouvez apprendre jusqu'à ${baseNbre} mots de pouvoirs. Un mot de pouvoir se lance en ${baseInvocation} secondes. La PSYCHE de votre cible doit être supérieur à ${baseRang} pour resister aux effets psychiques. L'ENDURANCE' de votre cible doit être supérieur à ${baseRang} pour resister aux effets physiques et énergétiques.`;
                }
            },
            {
                nom: "Sorcellerie",
                niveau: 3,
                cout: 45,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(48/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} h.`;
                },
                zoneEffet: "",
                duree:"",
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `${baseRang}`;
                },  
                description: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(48/(system.psyche/10))) : 0) ;
                    return `Vous pouvez créer et utiliser ${baseRang} réceptacles de sortilèges. Il faut ${baseInvocation} heures pour préparer un sortilège dans un réceptacle. 
                    Pour activer un sortilège stocké dans votre réceptacle, vous devez débloquer 13 clés de 5 secondes, soit 75 secondes.`;
                }
            },
            {
                nom: "Réceptacle Magique",
                niveau: 4,
                cout: 60,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(72/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} h.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception ? 1+Math.floor(((system.perception)/10)) : 0 ) ;
                    return `${baseRang} ex.`;
                },  
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(72/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.perception ? 1+Math.floor(((system.perception)/10)) : 0 ) ;
                    return `Vous pouvez stocker dans un réceptacle magique ${baseRang} exemplaires d'un même sortilège. 
                    Il vous faut ${baseInvocation} heures pour créer un réceptacle. 
                    Le Logrus peut servir de réceptacle unique comme un manteau aux mutiples pôches.`;
                }
            },
            {
                nom: "Runes Magiques",
                niveau: 5,
                cout: 75,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(320/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet:"",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/5)) : 0 ) ;
                    return `${baseRang} runes`;
                },  
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(320/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/5)) : 0 ) ;
                    const baseNiv = (system && system.perception && system.psyche ? Math.floor(((system.psyche+system.perception))) : 0) ;
                    return `Il vous faut ${baseInvocation} minutes pour dessiner une rune magique. Vous en connaissez ${baseRang}.
                    Vous pouvez déchiffrer les runes dessinées par une personne dont la PSYCHE est inférieure à ${baseNiv}.`;
                }
            },
            {
                nom: "Maîtrise des Clefs",
                niveau: 6,
                cout: 90,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseRang}`;
                },  
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    const baseTemps = (13 - baseRang)*5 ;
                    return `Vous parvenez à vous passer de ${baseRang} clefs pour lancer vos sortilèges. Vous lancez vos sortilèges en ${baseTemps} secondes.`;
                }
            },
            {
                nom: "Sortilège Supérieur",
                niveau: 7,
                cout: 105,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(72/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} h.`;
                },
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `${baseRang} ex.`;
                },  
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(72/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    const baseTemps = (13 - baseRang)*5 ;
                    return `Vous pouvez mêler la puissance d'un pouvoir que vous maîtrisez au nvieau 8 à vos sortilèges. 
                    Vous pouvez créer maintenant ${baseRang} réceptacles magiques. Il vous faut ${baseInvocation} heures pour créer un réceptacle.
                    Vous lancez vos sortilèges supérieurs en ${baseTemps} secondes.`;
                }
            },
            {
                nom: "Conjuration Simple",
                niveau: 8,
                cout: 120,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet:"",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor(((system.charisme))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseRang}`;
                },  
                description: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor(((system.charisme))) : 0 ) ;
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `Vous pouvez en ${baseInvocation} minutes conjurer un objet non magique ou une créature au rang inférieur à humain.
                    La conjuration dure ${baseDuree} minutes. Vous pouvez faire jusqu'à ${baseRang} conjurations par jour.`;
                }
            },
            {
                nom: "Enchantement",
                niveau: 9,
                cout: 140,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(72/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} h.`;
                },
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    return `${baseDuree} jrs.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `${baseRang} ex.`;
                },  
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(72/(system.psyche/10))) : 0) ;
                    const baseDuree = (system && system.endurance ? Math.floor(((system.endurance))) : 0 ) ;
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `Il vous faut ${baseInvocation} heures pour créer un objet enchantécréature.
                    Vous pouvez créer jusqu'à ${baseRang} objets enchantés contenant jusqu'à ${baseRang} sortilèges supérieurs.
                    L'enchantement dure ${baseDuree} jours.`;
                }
            },
            {
                nom: "Conjuration Complexe",
                niveau: 10,
                cout: 160,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} min.`;
                },
                zoneEffet: "",
                duree: (system) => {
                    const baseDuree = (system && system.charisme ? Math.floor(((system.charisme))) : 0 ) ;
                    return `${baseDuree} min.`;
                },
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `${baseRang}`;
                },  
                description: (system) => {
                    const baseLvl = (system && system.psyche && system.perception ? (Math.floor((system.psyche+system.perception))) : 0) ;
                    const baseInvocation = (system && system.psyche ? (Math.floor(120/(system.psyche/10))) : 0) ;
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    const baseDuree = (system && system.charisme ? Math.floor(((system.charisme))) : 0 ) ;
                    return `Vous pouvez maintenant conjurer des êtres vivants si leur PSYCHE est inférieure à ${baseLvl} ou des objets magiques.
                    Il vous faut ${baseInvocation} minutes pour procéder à la conjuration.
                    Vos conjurations durent ${baseDuree} minutes. Vous pouvez le faire jusqu''à ${baseRang} fois par jour.`;
                }
            },
            {
                nom: "Dissimulation",
                niveau: 11,
                cout: 180,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `${baseRang}`;
                },  
                description: (system) => {
                    const baseRang = (system && system.perception ? Math.floor(((system.perception)/10)) : 0 ) ;
                    return `Vous pouvez dissimuler vos pratiques magiques aux personnes dont la PERCEPTION est inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Haute Qualité",
                niveau: 12,
                cout: 200,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseRang}`;
                },  
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `Vous pouvez choisir une spécialité augmentant votre pratique parmi la durée des effets, la vitesse d'incantation, le nombre de cibles, les dégâts ou les soins, la distance.
                    Vous pouvez y appliquer un multiplicateur ou un diviseur de ${baseRang}.
                    Vos Mots de Pouvoir se lancent maintenant en 1 seconde.`;
                }
            },
            {
                nom: "Analyse d'Objet",
                niveau: 13,
                cout: 220,
                tempsInvocation: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(48/(system.psyche/10))) : 0) ;
                    return `${baseInvocation} h.`;
                },
                zoneEffet: "",
                duree: "",
                rang: "",  
                description: (system) => {
                    const baseInvocation = (system && system.psyche ? (Math.floor(48/(system.psyche/10))) : 0) ;
                    return `En ${baseInvocation} heures, vous parvenez à analyser un objet magique et à en apprendre les sortilèges qu'il peut contenir.`;
                }
            },
            {
                nom: "Compulsion",
                niveau: 14,
                cout: 240,
                tempsInvocation: "",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? (Math.floor((system.psyche+system.perception))) : 0) ;
                    return `${baseRang}`;
                },  
                description: (system) => {
                    const baseRang = (system && system.psyche && system.perception ? (Math.floor((system.psyche+system.perception))) : 0) ;
                    return `Vos pratiques magiques peuvent maintenant influer sur les émotions, les sentiments, les besoins, les souvenirs. 
                    Pour que cela fonctionne, votre cible doit avec une PSYCHE inférieure à ${baseRang}.`;
                }
            },
            {
                nom: "Serviteur de Langh",
                niveau: 15,
                cout: 260,
                tempsInvocation: "un mot",
                zoneEffet: "",
                duree: "",
                rang: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseRang}`;
                },  
                description: (system) => {
                    const baseRang = (system && system.psyche ? Math.floor(((system.psyche)/10)) : 0 ) ;
                    return `${baseRang} par jour, vous pouvez bénéficier de la protection de Langh. 
                    Aucune énergie de vous occasionne de dommages et peuvent même recharger vos réceptacles`;
                }
            },
            {
                nom: "Contact avec Langh",
                niveau: 16,
                cout: 280,
                tempsInvocation: "",
                zoneEffet: "",
                duree: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `${baseRang} minutes`;
                },
                rang: "",
                description: (system) => {
                    const baseRang = (system && system.charisme ? Math.floor(((system.charisme)/10)) : 0 ) ;
                    return `Contact direct avec Ilkar pendant ${baseRang} minutes.`;
                }
            }
        ]
    };

    // Get capacites for this pouvoir type, or empty array if not defined
    const baseCapacites = capacitesData[pouvoirType] || [];

    // Resolve cost for filtering purposes
    const capacitesWithResolvedCost = baseCapacites.map(capacite => {
        const resolvedCost = typeof capacite.cout === 'function' ? capacite.cout(actorSystem) : capacite.cout;
        return { ...capacite, _resolvedCost: Number(resolvedCost) || 0 };
    });

    // Apply display mode filtering
    let displayFilteredCapacites;
    const actorCurrentNiveau = calculateNiveauNumeric(currentValue);
    // console.log(`Ambre | getCapacites: Initial: displayMode="${displayMode}", currentValue=${currentValue}, actorCurrentNiveau=${actorCurrentNiveau}`); // DEBUG

    switch (displayMode) {
        case "above_level":
            // Show all capacities whose 'niveau' is less than or equal to the actor's current numeric pouvoir level.
            displayFilteredCapacites = capacitesWithResolvedCost.filter(c => c.niveau <= actorCurrentNiveau);
            break;
        case "next_level":
        case "next": // "next" and "next_level" are treated as synonyms
            // Show only capacities AT the actor's current numeric pouvoir level + 1, matching the label's description.
            const nextExactNiveau = actorCurrentNiveau + 1;
            // console.log(`Ambre | getCapacites: Case "next_level": nextExactNiveau for filtering display list is <= ${nextExactNiveau}`); // DEBUG
            displayFilteredCapacites = capacitesWithResolvedCost.filter(c => c.niveau <= nextExactNiveau); // Corrected: was actorCurrentNiveau+1, now nextExactNiveau
            break;
        case "all":
        default:
            displayFilteredCapacites = capacitesWithResolvedCost;
            break;
    }

    // Resolve remaining dynamic properties and mark availability
    return displayFilteredCapacites.map(capaciteToResolve => {
        const resolvedCapacite = { ...capaciteToResolve }; // Clone again

        // Resolve dynamic properties by calling functions if they are defined
        if (typeof capaciteToResolve.cout === 'function') {
            resolvedCapacite.cout = capaciteToResolve.cout(actorSystem);
        }
        if (typeof capaciteToResolve.tempsInvocation === 'function') {
            resolvedCapacite.tempsInvocation = capaciteToResolve.tempsInvocation(actorSystem);
        }
        if (typeof capaciteToResolve.zoneEffet === 'function') {
            resolvedCapacite.zoneEffet = capaciteToResolve.zoneEffet(actorSystem);
        }
        if (typeof capaciteToResolve.duree === 'function') {
            resolvedCapacite.duree = capaciteToResolve.duree(actorSystem);
        }
        if (typeof capaciteToResolve.rang === 'function') {
            resolvedCapacite.rang = capaciteToResolve.rang(actorSystem);
        }
        if (typeof capaciteToResolve.voiesecrete === 'function') {
            resolvedCapacite.voiesecrete = capaciteToResolve.voiesecrete(actorSystem);
        }
        if (typeof capaciteToResolve.description === 'function') {
            resolvedCapacite.description = capaciteToResolve.description(actorSystem);
        }

        // Use the resolved cost for availability check
        resolvedCapacite.cout = resolvedCapacite._resolvedCost; // Put the resolved cost back into 'cout'
        // Ensure 'cout' is a number before comparison for availability
        const cost = Number(resolvedCapacite.cout) || 0;


        // Default availability: must meet cost AND be at or below actor's current pouvoir level
        let isEffectivelyAvailable = (currentValue >= cost) && (resolvedCapacite.niveau <= actorCurrentNiveau);

        // Special handling for 'next_level' display mode
        if ((displayMode === "next_level" || displayMode === "next") && resolvedCapacite.niveau === (actorCurrentNiveau + 1)) {
            // The capacity at the next level is shown (due to displayFilteredCapacites logic)
            // but explicitly marked as unavailable for interaction.
            resolvedCapacite.available = false;
        } else {
            // For all other cases (capacities <= current level in 'next_level' mode,
            // and all relevant capacities in 'all' or 'above_level' modes after list filtering)
            resolvedCapacite.available = isEffectivelyAvailable;
        }return resolvedCapacite;
    });
}

/**
 * Calculate pouvoir data including niveau and capacites
 * @param {string} pouvoirType - The type of pouvoir (marelle, logrus, etc.)
 * @param {number} pouvoirValue - The current pouvoir value (from ptsmarelle, ptslogrus, etc.)
 * @param {Actor} actor - The actor document for dynamic calculations and item access.
 * @param {string} [displayMode="all"] - The selected displayMode for capacites. (already present)
 * @returns {Object} Enhanced pouvoir data
 */
export function calculatePouvoir(pouvoirType, pouvoirValue, actor, displayMode = "all") {

    // Ensure we have a valid number
    const value = parseInt(pouvoirValue) || 0;
    
    // Calculate niveau based on value
    const niveau = calculateNiveau(value);

    const niveauNumeric = calculateNiveauNumeric(value); // Add this
    // Fetch linked VoieSecrète items for this pouvoirType
    let linkedVoiesSecretes = [];
    // actor is the actual actor object passed from pjActorSheet.js getData
    const actorSystem = actor ? actor.system : {}; // Get system data from the actor

    let nombreAtoutsMemorises = 0;
    let nombreAtoutsMemorisable = 0;
    let showAtoutsMemorisesTalent = false;
    let currentUsedAtoutSlots = 0; // For manual tracking
    let atoutsCircles = [];
    
    let extensionsCircles = [];
    let usedLogrusExtensions = 0; // For manual tracking

    let receptaclesCircles = [];
    let maxReceptacles = 0; // Declare maxReceptacles here with a default value
    
    let showMotsPouvoirsDropZone = false;
    let linkedMotsPouvoirs = [];
    let maxMotsPouvoirs = 0; 
    let currentMotsPouvoirsCount = 0;
    let motsPouvoirsCircles = [];
    let headerItemForMotsPouvoirs = null; // Can be artefact or catalyseur

    let showSortilegesDropZone = false;
    let showReceptaclesDropZone  = false;
    let linkedSortileges = [];
    let linkedReceptacles = [];
    let currentReceptaclesCount = 0; // Declare currentReceptaclesCount here
    let linkedReceptaclesHeader = []; // For the receptacles linked to the header slot

    let showCapacitesAnimalesDropZone = false;
    let linkedCapacitesAnimalesForme = []; 
    let maxCapacitesAnimalesForme = 0;
    let currentCapacitesAnimalesFormeCount = 0;
    let capacitesAnimalesFormeCircles = [];

    let showCapacitesAnimalesSpecialesDropZone = false;
    let linkedCapacitesAnimalesSpeciales = [];
    let maxCapacitesAnimalesSpeciales = 0; // Will also be physique/10
    let currentCapacitesAnimalesSpecialesCount = 0;
    let capacitesAnimalesSpecialesCircles = [];

    let showMiroirsDropZone = false;
    let linkedMiroirs = [];
    let maxMiroirs = 0;
    let currentMiroirsCount = 0;
    let miroirsCircles = [];

    let showFaillesCounter = false;
    let maxFailles = 0;
    let usedAbyssesFailles = 0; // For manual tracking
    let faillesCircles = [];

    let taillePortail = 0;
    let zoneDommagesAbyssaux = 0;
    let dommagesFaille = 0;

    let showRunesDropZone = false;
    let linkedRunes = [];
    let maxRunes = 0;
    let currentRunesCount = 0;
    let runesCircles = [];

    let showJoursSansConnexion = false;
    let maxJoursSansConnexion = 0;
    let usedJoursSansConnexion = 0;
    let joursSansConnexionCircles = [];

    // New variables for Abreuvoir talent
    let showPuissanceCounter = false;
    let maxPuissance = 0;
    let usedPuissance = 0;
    let puissanceCircles = [];

    // Calculate Talents Spécifiques data (example for Logrus)
    let nombreExtensions = 0;
    let showNombreExtensions = false;
    if (pouvoirType === 'logrus') {
        const logrusNiveauNumeric = calculateNiveauNumeric(value);
        if (logrusNiveauNumeric >= 2) {
            nombreExtensions = calculNbreExtension(actorSystem, value);
            usedLogrusExtensions = actor.system.talentsTracking?.logrus?.usedExtensions || 0;
            showNombreExtensions = true;
            extensionsCircles = []; // Ensure it's reset
            for (let i = 0; i < nombreExtensions; i++) {
                // extensionsCircles.push({}); // Old: Placeholder for a filled circle
                extensionsCircles.push({ filled: i < usedLogrusExtensions });
            }
        }
    }

    // Calculate Talents Spécifiques data for Atouts
    if (pouvoirType === 'atouts') {
        const atoutsNiveauNumeric = calculateNiveauNumeric(value);
        if (atoutsNiveauNumeric >= 4) { // Condition: Atouts level must be 4 or higher
            nombreAtoutsMemorises = calculNbreAtoutsMemorises(actor);
            nombreAtoutsMemorisable = calculNbreAtoutsMemorisable(actorSystem);
            
            currentUsedAtoutSlots = nombreAtoutsMemorises; // Directly use the count of memorized atouts

            showAtoutsMemorisesTalent = true;
            atoutsCircles = []; // Ensure it's reset
            for (let i = 0; i < nombreAtoutsMemorisable; i++) {
                atoutsCircles.push({ filled: i < nombreAtoutsMemorises });
            }
        }
        // If level is less than 4, showAtoutsMemorisesTalent remains false
    }

    if (pouvoirType === 'magie') {
        if (niveauNumeric >= 2) {
            showMotsPouvoirsDropZone = true;
        }
        if (niveauNumeric >= 3) {
            showReceptaclesDropZone = true;
        }
        if (niveauNumeric >= 3) {
            showSortilegesDropZone = true;
        }
        
        // Calculate limit and current count for Mots de Pouvoirs
        if (actorSystem && typeof actorSystem.psyche === 'number') {
            maxMotsPouvoirs = Math.floor(actorSystem.psyche / 10); 
            maxReceptacles = Math.floor(actorSystem.perception / 10);
        } else {
            maxMotsPouvoirs = 0; // Default if psyche is not available
            maxReceptacles = 0;
        }

        if (actor && actor.items) {
            linkedMotsPouvoirs = actor.items.filter(i =>
                i.type === "motspouvoirs" &&
                i.system?.linkedPouvoir === "magie" // Only show Mots de Pouvoirs specifically linked to Magie
            );

            linkedSortileges = actor.items.filter(i =>
                i.type === "sortileges" && // Ensure it's a sortileges item
                i.system?.linkedPouvoir === "magie" // Filter by the linkedPouvoir field set on drop
            );            
            // Filter for linked Receptacles
            linkedReceptacles = actor.items.filter(i =>
                i.type === "receptacle" && // Ensure it's a receptacle item
                i.system?.linkedPouvoir === "magie" // Filter by the linkedPouvoir field set on drop
            );
            currentReceptaclesCount = linkedReceptacles.length;
            // Find the unique item (artefact or catalyseur) linked to the Mots de Pouvoirs special header slot
            headerItemForMotsPouvoirs = actor.items.find(i =>
                (i.type === "artefact" || i.type === "catalyseur") &&
                i.system?.linkedToSpecialSlot === "magie_motspouvoirs_catalyst_artefact"
            ) || null;
            
            // Find all receptacles linked to the specific header slot
            linkedReceptaclesHeader = actor.items.filter(i =>  
                i.type === "receptacle" && 
                i.system?.linkedToPouvoirSlot === "magie_sortileges_header" // Corrected typo: sortilges -> sortileges
            ) || []; // Corrected: Default to empty array, not null
            // Prepare circles for display
            motsPouvoirsCircles = [];
            currentMotsPouvoirsCount = linkedMotsPouvoirs.length;
            for (let i = 0; i < maxMotsPouvoirs||0; i++) {
                motsPouvoirsCircles.push({ filled: i < currentMotsPouvoirsCount });
            }
            // Calculate max and prepare circles for Receptacles
            maxReceptacles = Math.floor(actorSystem.psyche / 10);
            // receptaclesCircles = [];
            for (let i = 0; i < maxReceptacles||0; i++) {
                receptaclesCircles.push({ filled: i < currentReceptaclesCount });
            }

            // Logic for Runes
            if (niveauNumeric >= 5) { // Niveau 5+ required for Runes
                showRunesDropZone = true;
            }
            if (actorSystem && typeof actorSystem.perception === 'number') {
                maxRunes = Math.floor(actorSystem.perception / 5);
            } else {
                maxRunes = 0;
            }
            if (actor && actor.items) {
                linkedRunes = actor.items.filter(i => i.type === "rune" && i.system?.linkedPouvoir === "magie");
                currentRunesCount = linkedRunes.length;
                runesCircles = [];
                for (let i = 0; i < maxRunes; i++) {
                    runesCircles.push({ filled: i < currentRunesCount });
                }
            }
        } else {
            motsPouvoirsCircles = Array(maxMotsPouvoirs || 0).fill({}).map(() => ({ filled: false })); // Ensure initialization even without actor.items
            receptaclesCircles = Array(maxReceptacles || 0).fill({}).map(() => ({ filled: false }));
            headerItemForMotsPouvoirs = null;
        }
    }

    if (pouvoirType === 'metamorphose') {
        if (niveauNumeric >= 2) {
            showCapacitesAnimalesDropZone = true; // For "Forme Animale"
        }
        if (actorSystem && typeof actorSystem.physique === 'number') {
            maxCapacitesAnimalesForme = Math.floor(actorSystem.physique / 10);
            maxCapacitesAnimalesSpeciales = Math.floor(actorSystem.physique / 10); // Same limit logic
        }
        if (actor && actor.items) {
            linkedCapacitesAnimalesForme = actor.items.filter(i =>
                i.type === "capaciteanimale" &&
                i.system?.linkedPouvoirType === "metamorphose" &&
                (i.system?.capaciteSubType === "forme" || !i.system?.capaciteSubType) // Default to "forme" if subtype is missing for older items
            );
            currentCapacitesAnimalesFormeCount = linkedCapacitesAnimalesForme.length;
            // Prepare circles for Forme Animale
            capacitesAnimalesFormeCircles = [];
            for (let i = 0; i < maxCapacitesAnimalesForme; i++) {
                capacitesAnimalesFormeCircles.push({ filled: i < currentCapacitesAnimalesFormeCount });
            }


            // For "Capacités Animales Spéciales"
            if (niveauNumeric >= 8) {
                showCapacitesAnimalesSpecialesDropZone = true;
            }
            linkedCapacitesAnimalesSpeciales = actor.items.filter(i =>
                i.type === "capaciteanimale" &&
                i.system?.linkedPouvoirType === "metamorphose" &&
                i.system?.capaciteSubType === "speciale"
            );
            currentCapacitesAnimalesSpecialesCount = linkedCapacitesAnimalesSpeciales.length;
            // Prepare circles for Speciales
            capacitesAnimalesSpecialesCircles = [];
            for (let i = 0; i < maxCapacitesAnimalesSpeciales; i++) {
                capacitesAnimalesSpecialesCircles.push({ filled: i < currentCapacitesAnimalesSpecialesCount });
            }
        }
    }

    if (pouvoirType === 'chimerion') {
        if (niveauNumeric >= 11) { // Niveau 11+ required for Miroirs
            showMiroirsDropZone = true;
        }

        if (actorSystem && typeof actorSystem.psyche === 'number') {
            maxMiroirs = Math.floor(actorSystem.psyche / 10);
        } else {
            maxMiroirs = 0;
        }

        if (actor && actor.items) {
            linkedMiroirs = actor.items.filter(i =>
                i.type === "miroir" && // Item type is "miroir"
                i.system?.linkedPouvoir === "chimerion" // Linked to chimerion pouvoir
            );
            currentMiroirsCount = linkedMiroirs.length;

            miroirsCircles = [];
            for (let i = 0; i < maxMiroirs; i++) {
                miroirsCircles.push({ filled: i < currentMiroirsCount });
            }
        }
    }

    if (pouvoirType === 'abysses') {
        if (niveauNumeric >= 6) {
            showFaillesCounter = true;
            if (actorSystem && typeof actorSystem.psyche === 'number') {
                if (niveauNumeric >= 12) {
                    maxFailles = Math.floor((actorSystem.psyche * 2) / 10);
                } else {
                    maxFailles = Math.floor(actorSystem.psyche / 10);
                }
            } else {
                maxFailles = 0;
            }
            usedAbyssesFailles = actor.system.talentsTracking?.abysses?.usedFailles || 0;

            faillesCircles = [];
            // Create a circle for each point of maxFailles, similar to Logrus extensions
            for (let i = 0; i < maxFailles; i++) {
                faillesCircles.push({ filled: i < usedAbyssesFailles });
            }

            // Calculate new Abysses talent values (Level 6+)
            const levelModifier = niveauNumeric - 6;
            const actorTaille = typeof actorSystem.taille === 'number' ? actorSystem.taille : 0;

            // Apply the formulas as requested, ensuring non-negative results for damage/zone
            taillePortail = actorTaille + (1 - levelModifier / 10);
            zoneDommagesAbyssaux = Math.max(0, 10 - levelModifier);
            dommagesFaille = Math.max(0, 10 - levelModifier);

            // --- ADD THESE LOGS ---
            console.log(`Ambre | Abysses Calculations (Level ${niveauNumeric}):`);
            console.log(`  - levelModifier: ${levelModifier}`);
            console.log(`  - actorTaille: ${actorTaille}`);
            console.log(`  - taillePortail: ${taillePortail}`);
            console.log(`  - zoneDommagesAbyssaux: ${zoneDommagesAbyssaux}`);
            console.log(`  - dommagesFaille: ${dommagesFaille}`);
            // --- END ADDED LOGS ---
        }
    }

    if (pouvoirType === 'sabliers') {
        if (niveauNumeric > 1) { // Niveau Sabliers > 1 requis
            showJoursSansConnexion = true;
            if (actorSystem && typeof actorSystem.psyche === 'number' && typeof actorSystem.endurance === 'number') {
                maxJoursSansConnexion = Math.floor((actorSystem.psyche + actorSystem.endurance) / 10);
            } else {
                maxJoursSansConnexion = 0;
            }

            // Retrieve the number of used days from the actor's data
            usedJoursSansConnexion = actor.system.talentsTracking?.sabliers?.usedJoursSansConnexion || 0;

            joursSansConnexionCircles = [];
            for (let i = 0; i < maxJoursSansConnexion; i++) {
                joursSansConnexionCircles.push({ filled: i < usedJoursSansConnexion });
            }
        }
    }
    if (pouvoirType === 'abreuvoir') {
        if (niveauNumeric >= 1) {
            showPuissanceCounter = true;
            const endurance = actorSystem.endurance || 0;
            maxPuissance = endurance * 2;
            usedPuissance = actor.system.talentsTracking?.abreuvoir?.usedPuissance || 0;

            puissanceCircles = [];
            for (let i = 0; i < maxPuissance; i++) {
                puissanceCircles.push({
                    filled: i < usedPuissance
                });
            }
        }
    }

    if (actor && actor.items) {
        linkedVoiesSecretes = actor.items.filter(i =>
            i.type === "voiesecrete" &&
            i.system && // Ensure the item has a system object
            typeof i.system.linkedPouvoirType === 'string' && // Ensure linkedPouvoirType is a string
            i.system.linkedPouvoirType === pouvoirType
        );
    }
    
    // Pass displayMode to getCapacites
    const capacites = getCapacites(pouvoirType, value, actorSystem, displayMode);
    if (pouvoirType === 'marelle') {actorSystem.ptsmarelle = value;}
    if (pouvoirType === 'logrus') {actorSystem.ptslogrus = value;}
    if (pouvoirType === 'atouts') {actorSystem.ptsatouts = value;}
    if (pouvoirType === 'metamorphose') {actorSystem.ptsmetamorphose = value;}
    if (pouvoirType === 'pentacre') {actorSystem.ptspentacre = value;}
    if (pouvoirType === 'coeurflamme') {actorSystem.ptscoeurflamme = value;}  
    if (pouvoirType === 'orbochromat') {actorSystem.ptsorbochromat = value;}
    if (pouvoirType === 'abreuvoir') {actorSystem.ptsabreuvoir = value;}
    if (pouvoirType === 'harmonium') {actorSystem.ptsharmonium = value;}
    if (pouvoirType === 'chimerion') {actorSystem.ptschimerion = value;}
    if (pouvoirType === 'sabliers') {actorSystem.ptssabliers = value;}
    if (pouvoirType === 'abysses') {actorSystem.ptsabysses = value;}
    if (pouvoirType === 'magie') {actorSystem.ptsmagie = value;}
    // console.log(capacites.filter(c => c.available).length); // Optional: remove or comment out debug log
    return {
        value: value,
        niveau: niveau,
        niveauNumeric: niveauNumeric, // Added for easier template access
        capacites: capacites,
        capacitesCount: capacites.filter(c => c.available).length,
        showCapacites: true, // This is a UI state, typically managed by pjActorSheet._uiState        
        currentDisplayMode: displayMode, // Expose the display mode used for fetching capacites
        linkedVoiesSecretes: linkedVoiesSecretes, // Add the linked items
        nombreExtensions: nombreExtensions,
        extensionsCircles: extensionsCircles, // Array for Logrus extension circles
        showNombreExtensions: showNombreExtensions,
        nombreAtoutsMemorises: nombreAtoutsMemorises,
        nombreAtoutsMemorisable: nombreAtoutsMemorisable,
        atoutsCircles: atoutsCircles, // Array for Atout circles (filled/empty)
        currentUsedAtoutSlots: currentUsedAtoutSlots, // For manual tracking display
        showAtoutsMemorisesTalent: showAtoutsMemorisesTalent,
        showMotsPouvoirsDropZone: showMotsPouvoirsDropZone, 
        showSortilegesDropZone: showSortilegesDropZone, 
        showReceptaclesDropZone: showReceptaclesDropZone, // Add this flag
        linkedMotsPouvoirs: linkedMotsPouvoirs, 
        showReceptaclesDropZone: showReceptaclesDropZone, // Add this flag
        linkedReceptacles: linkedReceptacles, // Add the linked receptacles
        maxReceptacles: maxReceptacles, // Add max receptacles
        receptaclesCircles: receptaclesCircles, // Add receptacles circles
        linkedSortileges: linkedSortileges, 
        taillePortail: taillePortail,
        zoneDommagesAbyssaux: zoneDommagesAbyssaux,
        dommagesFaille: dommagesFaille,
        maxMotsPouvoirs: maxMotsPouvoirs, 
        maxReceptacles: maxReceptacles,
        currentMotsPouvoirsCount: currentMotsPouvoirsCount, 
        motsPouvoirsCircles: motsPouvoirsCircles,        
        headerItemForMotsPouvoirs: headerItemForMotsPouvoirs, // Renamed and updated
        showCapacitesAnimalesDropZone: showCapacitesAnimalesDropZone, // For Forme
        linkedCapacitesAnimalesForme: linkedCapacitesAnimalesForme,   // For Forme
        maxCapacitesAnimalesForme: maxCapacitesAnimalesForme,         // For Forme
        currentCapacitesAnimalesFormeCount: currentCapacitesAnimalesFormeCount, // For Forme        
        capacitesAnimalesFormeCircles: capacitesAnimalesFormeCircles, // For Forme
        showCapacitesAnimalesSpecialesDropZone: showCapacitesAnimalesSpecialesDropZone, // For Speciales
        linkedCapacitesAnimalesSpeciales: linkedCapacitesAnimalesSpeciales,         // For Speciales
        maxCapacitesAnimalesSpeciales: maxCapacitesAnimalesSpeciales,               // For Speciales
        currentCapacitesAnimalesSpecialesCount: currentCapacitesAnimalesSpecialesCount, // For Speciales        
        linkedReceptaclesHeader: linkedReceptaclesHeader, // Ensure this is included
        currentReceptaclesCount: currentReceptaclesCount, // Add current receptacles count
        capacitesAnimalesSpecialesCircles: capacitesAnimalesSpecialesCircles, // For Speciales
        showMiroirsDropZone: showMiroirsDropZone,
        linkedMiroirs: linkedMiroirs,
        maxMiroirs: maxMiroirs,
        currentMiroirsCount: currentMiroirsCount,
        miroirsCircles: miroirsCircles,
        showFaillesCounter: showFaillesCounter,
        maxFailles: maxFailles,
        faillesCircles: faillesCircles,
        usedAbyssesFailles: usedAbyssesFailles, // expose for potential display if needed
        showRunesDropZone: showRunesDropZone,
        linkedRunes: linkedRunes,
        maxRunes: maxRunes,
        currentRunesCount: currentRunesCount,
        runesCircles: runesCircles,
        showJoursSansConnexion: showJoursSansConnexion,
        maxJoursSansConnexion: maxJoursSansConnexion,
        usedJoursSansConnexion: usedJoursSansConnexion,
        joursSansConnexionCircles: joursSansConnexionCircles,
        showPuissanceCounter: showPuissanceCounter,
        maxPuissance: maxPuissance,
        usedPuissance: usedPuissance,
        puissanceCircles: puissanceCircles
    };
}

/**
 * Get all pouvoir types with their corresponding template.json field names
 * @returns {Array} Array of pouvoir configuration objects
 */
export function getPouvoirTypes() {
    return [
        { type: 'marelle', field: 'ptsmarelle', label: 'Marelle' },
        { type: 'logrus', field: 'ptslogrus', label: 'Logrus' },
        { type: 'atouts', field: 'ptsatouts', label: 'Atouts' },
        { type: 'metamorphose', field: 'ptsmetamorphose', label: 'Métamorphose' },
        { type: 'pentacre', field: 'ptspentacre', label: 'Pentacre' },
        { type: 'coeurflamme', field: 'ptscoeurflamme', label: 'Coeur-Flamme' },
        { type: 'orbochromat', field: 'ptsorbochromat', label: 'Orbochromat' },
        { type: 'abreuvoir', field: 'ptsabreuvoir', label: 'Abreuvoir' },
        { type: 'harmonium', field: 'ptsharmonium', label: 'Harmonium' },
        { type: 'chimerion', field: 'ptschimerion', label: 'Chimérion' },
        { type: 'sabliers', field: 'ptssabliers', label: 'Sabliers d\'Ujuhe' },
        { type: 'abysses', field: 'ptsabysses', label: 'Abysses' },
        { type: 'magie', field: 'ptsmagie', label: 'Magie' }
    ];
}

/**
 * Get pouvoir type display name
 * @param {string} pouvoirType - The pouvoir type key
 * @returns {string} The display name
 */
export function getPouvoirLabel(pouvoirType) {
    const labels = {
        marelle: "Marelle",
        logrus: "Logrus", 
        atouts: "Atouts",
        metamorphose: "Métamorphose",
        pentacre: "Pentacre",
        coeurflamme: "Coeur-Flamme",
        orbochromat: "Orbochromat",
        abreuvoir: "Abreuvoir",
        harmonium: "Harmonium",
        chimerion: "Chimérion",
        sabliers: "Sabliers d'Ujuhe",
        abysses: "Abysses",
        magie: "Magie"
    };
    
    return labels[pouvoirType] || pouvoirType;
}

/**
 * Validate pouvoir value
 * @param {number} value - The pouvoir value to validate
 * @returns {Object} Validation result with isValid and message
 */
export function validatePouvoirValue(value) {
    if (value < 0) {
        return { isValid: false, message: "La valeur ne peut pas être négative" };
    }
    if (value > 500) {
        return { isValid: false, message: "La valeur maximum est 500" };
    }
    return { isValid: true, message: "" };
}