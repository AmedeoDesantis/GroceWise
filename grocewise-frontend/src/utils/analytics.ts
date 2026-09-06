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
    const validProducts = products.filter(
        p => p.price && p.barcode && p.buy_date && p.finish_date && p.nutrients && p.unit && p.quantity
    );

    const groupedByBarcode = new Map<string, Product[]>();
    validProducts.forEach(product => {
        const group = groupedByBarcode.get(product.barcode!) || [];
        group.push(product);
        groupedByBarcode.set(product.barcode!, group);
    });

    const aggregatedProducts: RankedProduct[] = Array.from(groupedByBarcode.values()).map(group => {
        let totalScore = 0;

        group.forEach(product => {
            const buyDate = new Date(product.buy_date!).getTime();
            const finishDate = new Date(product.finish_date!).getTime();
            const durationDays = Math.max(1, (finishDate - buyDate) / (1000 * 3600 * 24));

            const costPerDay = product.price! / durationDays;

            const proteinValue = (product.nutrients?.proteins || 0) * 2;
            const energyValue = (product.nutrients?.calories || 0) / 100;
            const nutritionScore = proteinValue + energyValue;

            totalScore += nutritionScore / costPerDay;
        });

        const avgScore = totalScore / group.length;

        return {
            product: group[0],
            score: avgScore,
            scoreLabel: avgScore.toFixed(1)
        };
    });

    return aggregatedProducts
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
};
