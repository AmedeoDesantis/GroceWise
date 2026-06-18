export interface Nutrients {
    calories?: number;
    carbohydrates?: number;
    proteins?: number;
    fats?: number;
}

export interface Product {
    db_id?: string;
    barcode: string;
    name: string;
    brand?: string;
    price: number;
    buy_date?: string;
    finish_date?: string;
    nutrients?: Nutrients;
    ingredients?: string[];
    weight?: number;
}

export interface AddProductResponse {
    status: string;
    inserted_id: string;
}

export type FilterType = 'all' | 'unconsumed';
