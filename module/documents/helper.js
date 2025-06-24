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

    Handlebars.registerHelper('add', function(a, b) {
        return (a || 0) + (b || 0);
    });

    Handlebars.registerHelper('div', function(a, b) {
        if (!a || !b) return 0;
        return Math.floor(a / b);
    });

    Handlebars.registerHelper('mult', function(a, b) {
        return (a || 0) * (b || 0);
    });

    Handlebars.registerHelper('gte', function(a, b) {
        return (a || 0) >= (b || 0);
    });

    Handlebars.registerHelper('lookup', function(obj, key) {
        if (!obj || typeof obj !== 'object') return false;
        return obj[key] || false;
    });

    Handlebars.registerHelper('eq', function(a, b) {
        return a === b;
    });

    Handlebars.registerHelper('gt', function(a, b) {
        return (a || 0) > (b || 0);
    });

    Handlebars.registerHelper('and', function(a, b) {
        return a && b;
    });

    Handlebars.registerHelper('sub', function(a, b) {
        return a - b;
    });