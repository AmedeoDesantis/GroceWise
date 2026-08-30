import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '../types';
import { colors, spacing, borderRadius, typography } from '../styles/commonStyles';
import { formatPrice } from '../utils/formatting';

interface RankingListItemProps {
    product: Product;
    position: number;
    score: string;
    onPress: () => void;
}

export const RankingListItem: React.FC<RankingListItemProps> = ({
    product,
    position,
    score,
    onPress
}) => {
    return (
        <TouchableOpacity style={styles.container} onPress={onPress}>
            <View style={styles.rankBadge}>
                <Text style={styles.rankText}>#{position}</Text>
            </View>
            <View style={styles.infoContainer}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDetail}>{formatPrice(product.price)} • {product.brand || 'Senza marca'}</Text>
            </View>
            <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        padding: spacing.md,
        borderRadius: borderRadius.md,
        marginBottom: spacing.sm,
        borderWidth: 1,
        borderColor: colors.border,
    },
    rankBadge: {
        width: 32,
        height: 32,
        borderRadius: borderRadius.pill,
        backgroundColor: colors.lightBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    rankText: {
        ...typography.body,
        fontWeight: 'bold',
        color: colors.primary,
    },
    infoContainer: {
        flex: 1,
    },
    productName: {
        ...typography.body,
        fontWeight: '600',
        color: colors.text,
    },
    productDetail: {
        ...typography.small,
        color: colors.textSecondary,
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    scoreText: {
        ...typography.subtitle,
        color: colors.success,
    },
    scoreLabel: {
        ...typography.small,
        color: colors.textLight,
        fontSize: 10,
    }
});