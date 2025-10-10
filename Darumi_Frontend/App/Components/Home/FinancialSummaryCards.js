import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';

const FinancialSummaryCards = ({ expenses, income, balance, currency = '$' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.cardIcon, { backgroundColor: `${Colors.danger}20` }]}>
          <FontAwesome5 name="money-bill-wave" size={20} color={Colors.danger} />
        </View>
        <Text style={styles.cardLabel}>Gastos</Text>
        <Text style={[styles.cardAmount, styles.expenseAmount]}>
          {currency}{Math.abs(expenses).toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.cardIcon, { backgroundColor: `${Colors.success}20` }]}>
          <FontAwesome5 name="money-bill-alt" size={20} color={Colors.success} />
        </View>
        <Text style={styles.cardLabel}>Ingresos</Text>
        <Text style={[styles.cardAmount, styles.incomeAmount]}>
          {currency}{Math.abs(income).toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={[styles.cardIcon, { backgroundColor: `${Colors.primary}20` }]}>
          <FontAwesome5 name="balance-scale" size={20} color={Colors.primary} />
        </View>
        <Text style={styles.cardLabel}>Balance</Text>
        <Text style={[
          styles.cardAmount, 
          balance >= 0 ? styles.positiveAmount : styles.negativeAmount
        ]}>
          {currency}{Math.abs(balance).toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  expenseAmount: {
    color: Colors.danger,
  },
  incomeAmount: {
    color: Colors.success,
  },
  positiveAmount: {
    color: Colors.primary,
  },
  negativeAmount: {
    color: Colors.danger,
  },
});

export default FinancialSummaryCards;
