export default class AmbreActor extends Actor {
    prepareData() {
        super.prepareData()
        
        // Ensure all system properties exist with default values
        const system = this.system
        
        // Initialize physique components if they don't exist
        if (system.force === undefined) system.force = 20
        if (system.reflexe === undefined) system.reflexe = 20
        if (system.dexterite === undefined) system.dexterite = 20
        if (system.physique === undefined) system.physique = 20

        // Initialize endurance components if they don't exist
        if (system.adaptation === undefined) system.adaptation = 20
        if (system.regeneration === undefined) system.regeneration = 20
        if (system.resistance === undefined) system.resistance = 20
        if (system.endurance === undefined) system.endurance = 20
        
        // Initialize psyche components if they don't exist
        if (system.intelligence === undefined) system.intelligence = 20
        if (system.concentration === undefined) system.concentration = 20
        if (system.volonte === undefined) system.volonte = 20
        if (system.psyche === undefined) system.psyche = 20
        
        // Initialize perception components if they don't exist
        if (system.sens === undefined) system.sens = 20
        if (system.sixiemesens === undefined) system.sixiemesens = 20
        if (system.empathie === undefined) system.empathie = 20
        if (system.perception === undefined) system.perception = 20
        
        // Initialize charisme components if they don't exist
        if (system.eloquence === undefined) system.eloquence = 20
        if (system.intimidation === undefined) system.intimidation = 20
        if (system.apparence === undefined) system.apparence = 20
        if (system.charisme === undefined) system.charisme = 20
        // Calculate derived stats
        this._calculateDerivedStats()
    }
    
    _calculateDerivedStats() {
        const system = this.system
        
        // Calculate physique
        const force = system.force || 20
        const dexterite = system.dexterite || 20
        const reflexe = system.reflexe || 20
        system.physique = Math.round((force + dexterite + reflexe) / 3)
        
        // Calculate endurance
        const adaptation = system.adaptation || 20
        const regeneration = system.regeneration || 20
        const resistance = system.resistance || 20
        system.endurance = Math.round((adaptation + regeneration + resistance) / 3)
        
        // Calculate psyche
        const intelligence = system.intelligence || 20
        const concentration = system.concentration || 20
        const volonte = system.volonte || 20
        system.psyche = Math.round((intelligence + concentration + volonte) / 3)

        // Calculate charisme
        const eloquence = system.eloquence || 20
        const intimidation = system.intimidation || 20
        const apparence = system.apparence || 20
        system.charisme = Math.round((eloquence + intimidation + apparence) / 3)
        
        // Calculate perception
        const sens = system.sens || 20
        const sixiemesens = system.sixiemesens || 20
        const empathie = system.empathie || 20
        system.perception = Math.round((sens + sixiemesens + empathie) / 3)
    }
}