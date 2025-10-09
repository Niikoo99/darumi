import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const FinancialSummaryCards = ({ expenses, income, balance, currency = '$' }) => {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <FontAwesome5 name="money-bill-wave" size={20} color="#dc3545" />
        </View>
        <Text style={styles.cardLabel}>Gastos</Text>
        <Text style={[styles.cardAmount, styles.expenseAmount]}>
          {currency}{Math.abs(expenses).toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <FontAwesome5 name="money-bill-alt" size={20} color="#28a745" />
        </View>
        <Text style={styles.cardLabel}>Ingresos</Text>
        <Text style={[styles.cardAmount, styles.incomeAmount]}>
          {currency}{Math.abs(income).toFixed(2)}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardIcon}>
          <FontAwesome5 name="balance-scale" size={20} color="#17a2b8" />
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
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
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontWeight: '600',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  expenseAmount: {
    color: '#dc3545',
  },
  incomeAmount: {
    color: '#28a745',
  },
  positiveAmount: {
    color: '#17a2b8',
  },
  negativeAmount: {
    color: '#dc3545',
  },
});

export default FinancialSummaryCards;
