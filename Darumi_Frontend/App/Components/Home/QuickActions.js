import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';

const QuickActions = ({ onAddExpense, onAddIncome }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.expenseButton]}
        onPress={onAddExpense}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIcon, styles.expenseIcon]}>
          <FontAwesome5 name="money-bill-wave" size={24} color={Colors.danger} />
        </View>
        <Text style={styles.actionText}>💸 Nuevo Gasto</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.incomeButton]}
        onPress={onAddIncome}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIcon, styles.incomeIcon]}>
          <FontAwesome5 name="hand-holding-usd" size={24} color={Colors.success} />
        </View>
        <Text style={styles.actionText}>💰 Nuevo Ingreso</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: 16,
    padding: 20,
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
  expenseButton: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
  },
  incomeButton: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.success,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  expenseIcon: {
    backgroundColor: `${Colors.danger}20`,
  },
  incomeIcon: {
    backgroundColor: `${Colors.success}20`,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});

export default QuickActions;
