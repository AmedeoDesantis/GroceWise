/**
 * Formatta una data nel formato locale italiano
 */
export const formatDate = (dateString?: string): string => {
    if (!dateString) return '';
    try {
        return new Date(dateString).toLocaleDateString('it-IT');
    } catch {
        return dateString;
    }
};

/**
 * Formatta un prezzo con il simbolo dell'euro
 */
export const formatPrice = (price: number): string => {
    return `€${price.toFixed(2)}`;
};

/**
 * Formatta ingredienti mostrando i primi N e "..."
 */
export const formatIngredients = (ingredients?: string[], maxItems: number = 3): string => {
    if (!ingredients || ingredients.length === 0) return '';
    const displayed = ingredients.slice(0, maxItems).join(', ');
    const suffix = ingredients.length > maxItems ? '...' : '';
    return displayed + suffix;
};

/**
 * Formatta nutrienti per la visualizzazione
 */
export const formatNutrients = (value?: number, unit: string = ''): string => {
    if (!value) return '';
    return `${value}${unit}`;
};
