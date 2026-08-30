import { DayStats, MetricKey } from '../types';
import { Product } from '../types';

export const sortDates = (data: Record<string, DayStats>): string[] =>
    Object.keys(data).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

export const formatChartLabels = (dates: string[]): string[] =>
    dates.map((dateStr) =>
        new Date(dateStr).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })
    );

export const extractDataset = (
    data: Record<string, DayStats>,
    dates: string[],
    metric: MetricKey
): number[] => dates.map((date) => data[date][metric]);



export interface RankedProduct {
    product: Product;
    score: number;
    scoreLabel: string;
}

export const calculateProductsRanking = (products: Product[]): RankedProduct[] => {
    // 1. Filtriamo solo i prodotti validi (che hanno un prezzo, sono stati consumati e hanno macronutrienti)
    const validProducts = products.filter(
        p => p.price && p.price > 0 && p.buy_date && p.finish_date && p.nutrients
    );

    // 2. Calcoliamo il punteggio per ogni prodotto
    const scoredProducts = validProducts.map(product => {
        // Calcoliamo quanti giorni è durato (minimo 1 giorno per evitare divisioni per zero)
        const buyDate = new Date(product.buy_date!).getTime();
        const finishDate = new Date(product.finish_date!).getTime();
        const durationDays = Math.max(1, (finishDate - buyDate) / (1000 * 3600 * 24));

        // Quanto ci è costato al giorno?
        const costPerDay = product.price! / durationDays;

        // Valore Nutrizionale (Puoi bilanciare questi pesi come preferisci)
        // Esempio: Diamo 2 punti per ogni grammo di proteina e 1 punto ogni 100 kcal
        const proteinValue = (product.nutrients?.proteins || 0) * 2;
        const energyValue = (product.nutrients?.calories || 0) / 100;
        const nutritionScore = proteinValue + energyValue;

        // SCORE FINALE: Nutrizione diviso Costo Giornaliero
        const finalScore = nutritionScore / costPerDay;

        return {
            product,
            score: finalScore,
            scoreLabel: finalScore.toFixed(1) // Arrotonda a 1 decimale (es. "9.8")
        };
    });

    // 3. Li ordiniamo dal punteggio più alto al più basso e prendiamo i primi 5
    return scoredProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
};
