import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const QuickActions = ({ onAddExpense, onAddIncome }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.expenseButton]}
        onPress={onAddExpense}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIcon, styles.expenseIcon]}>
          <FontAwesome5 name="money-bill-wave" size={24} color="#4caf50" />
        </View>
        <Text style={styles.actionText}>Nuevo Gasto</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.incomeButton]}
        onPress={onAddIncome}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIcon, styles.incomeIcon]}>
          <FontAwesome5 name="hand-holding-usd" size={24} color="#ff9800" />
        </View>
        <Text style={styles.actionText}>Nuevo Ingreso</Text>
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
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
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
  expenseButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  incomeButton: {
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
  },
  expenseIcon: {
    backgroundColor: '#e8f5e8',
  },
  incomeIcon: {
    backgroundColor: '#fff3e0',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default QuickActions;
