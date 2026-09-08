export interface Override {
    barcode: string;
    name?: string;
    price?: number;
    quantity?: number;
    unit?: 'g' | 'kg' | 'l' | 'ml';
}