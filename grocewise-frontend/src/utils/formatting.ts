/**
 * Format a date in local English format
 */
export const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('en-US');
    } catch {
        return dateString;
    }
};

/**
 * Format a price with euro symbol
 */
export const formatPrice = (price: number): string => {
    return `€${price.toFixed(2)}`;
};

/**
 * Format ingredients showing first N and "..."
 */
export const formatIngredients = (ingredients?: string[], maxItems: number = 3): string => {
    if (!ingredients || ingredients.length === 0) return '';
    const displayed = ingredients.slice(0, maxItems).join(', ');
    const suffix = ingredients.length > maxItems ? '...' : '';
    return displayed + suffix;
};


export const formatNutrients = (value?: number, unit: string = ''): string => {
    if (!value) return '';
    return `${value}${unit}`;
};

export const formatQuantity = (quantity?: number, unit: string = ''): string => {
    if (quantity === undefined || quantity === null) return '';
    if (unit === undefined || unit === null || unit.trim() === '') return `${quantity}`;

    const cleanUnit = unit.trim().toLowerCase();
    const unitMappings: Record<string, { category: 'weight' | 'volume', multiplier: number }> = {
        'mg': { category: 'weight', multiplier: 0.001 },
        'g': { category: 'weight', multiplier: 1 },
        'gr': { category: 'weight', multiplier: 1 },
        'kg': { category: 'weight', multiplier: 1000 },
        't': { category: 'weight', multiplier: 1000000 },

        'ml': { category: 'volume', multiplier: 1 },
        'cl': { category: 'volume', multiplier: 10 },
        'dl': { category: 'volume', multiplier: 100 },
        'l': { category: 'volume', multiplier: 1000 },
        'lt': { category: 'volume', multiplier: 1000 },
        'hl': { category: 'volume', multiplier: 100000 },
    };
    const formatNumber = (num: number) => +(num).toFixed(2);

    const matchedUnit = unitMappings[cleanUnit];
    if (!matchedUnit) {
        return `${formatNumber(quantity)} ${unit.trim()}`;
    }

    const baseValue = quantity * matchedUnit.multiplier;
    switch (matchedUnit.category) {
        case 'weight':
            if (baseValue >= 1000000) return `${formatNumber(baseValue / 1000000)} t`;
            if (baseValue >= 1000) return `${formatNumber(baseValue / 1000)} kg`;
            if (baseValue < 1) return `${formatNumber(baseValue * 1000)} mg`;
            return `${formatNumber(baseValue)} g`;

        case 'volume':
            if (baseValue >= 100000) return `${formatNumber(baseValue / 100000)} hl`;
            if (baseValue >= 1000) return `${formatNumber(baseValue / 1000)} l`;
            return `${formatNumber(baseValue)} ml`;
        default:
            return `${formatNumber(quantity)} ${unit.trim()}`;
    }
};
