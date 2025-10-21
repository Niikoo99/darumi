import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import { formatCurrency } from '../../../utils/formatting';
import AutoScaleCurrencyText from '../AutoScaleCurrencyText';
import { 
  scaleSize, 
  getBodyFontSize, 
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getBorderWidth,
  getIconSize,
  getGap,
  // getMinWidth // Temporarily commented out
} from '../../../utils/scaling';

// Temporary local function to replace getMinWidth
const getMinWidth = (baseMinWidth = 80) => scaleSize(baseMinWidth);

const FinancialSummaryCards = ({ expenses, income, balance, currency = '$' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.cardIcon, { backgroundColor: `${Colors.danger}20` }]}>
          <FontAwesome5 name="money-bill-wave" size={getIconSize(20)} color={Colors.danger} />
        </View>
        <Text style={styles.cardLabel}>Gastos</Text>
        <AutoScaleCurrencyText 
          value={expenses} 
          variant="expense"
          testID="expenses-card"
        />
      </View>

      <View style={styles.card}>
        <View style={[styles.cardIcon, { backgroundColor: `${Colors.success}20` }]}>
          <FontAwesome5 name="money-bill-alt" size={getIconSize(20)} color={Colors.success} />
        </View>
        <Text style={styles.cardLabel}>Ingresos</Text>
        <AutoScaleCurrencyText 
          value={income} 
          variant="income"
          testID="income-card"
        />
      </View>

      <View style={styles.card}>
        <View style={[styles.cardIcon, { backgroundColor: `${Colors.primary}20` }]}>
          <FontAwesome5 name="balance-scale" size={getIconSize(20)} color={Colors.primary} />
        </View>
        <Text style={styles.cardLabel}>Balance</Text>
        <AutoScaleCurrencyText 
          value={balance} 
          variant="balance"
          style={balance >= 0 ? styles.positiveAmount : styles.negativeAmount}
          testID="balance-card"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing(20),
    gap: getGap(8),
  },
  card: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(16),
    padding: getSpacing(12),
    alignItems: 'center',
    borderWidth: getBorderWidth(2),
    borderColor: Colors.border,
    ...getShadowSize(4, 16, 0.08),
    minWidth: getMinWidth(80),
    flexShrink: 1,
  },
  cardIcon: {
    width: getIconSize(40),
    height: getIconSize(40),
    borderRadius: getBorderRadius(20),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(8),
  },
  cardLabel: {
    fontSize: scaleSize(12),
    color: Colors.textSecondary,
    marginBottom: getSpacing(8),
    textTransform: 'uppercase',
    letterSpacing: scaleSize(0.5),
    fontWeight: '600',
  },
  positiveAmount: {
    color: Colors.primary,
  },
  negativeAmount: {
    color: Colors.danger,
  },
});

export default FinancialSummaryCards;
