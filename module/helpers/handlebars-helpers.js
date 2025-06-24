/**
 * Register custom Handlebars helpers for the Ambre system
 */

export function registerHandlebarsHelpers() {
    
    // Register Handlebars helpers - Fix the slice helper
    Handlebars.registerHelper('slice', function(array, start, end) {
        if (!Array.isArray(array)) {
            console.warn('slice helper: first argument is not an array:', array);
            return [];
        }
        
        /*console.log('slice helper called with:', { 
            arrayLength: array.length, 
            start: start, 
            end: end 
        });*/
        
        // Handle negative indices and undefined end
        const actualStart = start < 0 ? Math.max(0, array.length + start) : start;
        const actualEnd = end === undefined ? array.length : (end < 0 ? Math.max(0, array.length + end) : end);
        
        /*console.log('slice helper actual values:', { 
            actualStart: actualStart, 
            actualEnd: actualEnd,
            result: array.slice(actualStart, actualEnd)
        });*/
        
        return array.slice(actualStart, actualEnd);
    });
    
    Handlebars.registerHelper('toLowerCase', function(str) {
    if (typeof str === 'string') {
        return str.toLowerCase();
    }
    return ''; // Retourne une chaîne vide si l'entrée n'est pas une chaîne
    });

    // Math helpers
    Handlebars.registerHelper('div', function(a, b) {
        return Math.floor(a / b);
    });

    Handlebars.registerHelper('add', function(a, b) {
        return a + b;
    });

    Handlebars.registerHelper('mult', function(a, b) {
        return a * b;
    });

    Handlebars.registerHelper('sub', function(a, b) {
        return a - b;
    });

    // Comparison helpers
    Handlebars.registerHelper('gte', function(a, b) {
        return a >= b;
    });

    Handlebars.registerHelper('lte', function(a, b) {
        return a <= b;
    });

    Handlebars.registerHelper('gt', function(a, b) {
        return a > b;
    });

    Handlebars.registerHelper('lt', function(a, b) {
        return a < b;
    });

    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    Handlebars.registerHelper('ne', function(a, b) {
        return a !== b;
    });

    // Logic helpers
    Handlebars.registerHelper('and', function(a, b) {
        return a && b;
    });

    Handlebars.registerHelper('or', function(a, b) {
        return a || b;
    });

    Handlebars.registerHelper('not', function(a) {
        return !a;
    });

    Handlebars.registerHelper('unless', function(conditional, options) {
        if (!conditional) {
            return options.fn(this);
        } else {
            return options.inverse(this);
        }
    });

    // Utility helpers
    Handlebars.registerHelper('range', function(start, end) {
        const result = [];
        for (let i = start; i <= end; i++) {
            result.push(i);
        }
        return result;
    });

    Handlebars.registerHelper('lookup', function(obj, key) {
        return obj && obj[key];
    });

    Handlebars.registerHelper('default', function(value, defaultValue) {
        return value !== undefined && value !== null && value !== '' ? value : defaultValue;
    });

    // String helpers
    Handlebars.registerHelper('capitalize', function(str) {
        if (typeof str !== 'string') return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    });

    Handlebars.registerHelper('lowercase', function(str) {
        if (typeof str !== 'string') return '';
        return str.toLowerCase();
    });

    Handlebars.registerHelper('uppercase', function(str) {
        if (typeof str !== 'string') return '';
        return str.toUpperCase();
    });

    console.log('Ambre Handlebars helpers registered');
}