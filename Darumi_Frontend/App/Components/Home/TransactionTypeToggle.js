import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const TransactionTypeToggle = ({ isExpense, onToggle }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.toggleOption,
          styles.expenseOption,
          isExpense && styles.activeOption
        ]}
        onPress={() => onToggle(true)}
        activeOpacity={0.7}
      >
        <FontAwesome5 
          name="money-bill-wave" 
          size={20} 
          color={isExpense ? '#dc3545' : '#666'} 
        />
        <Text style={[
          styles.toggleText,
          styles.expenseText,
          isExpense && styles.activeText
        ]}>
          Gasto
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.toggleOption,
          styles.incomeOption,
          !isExpense && styles.activeOption
        ]}
        onPress={() => onToggle(false)}
        activeOpacity={0.7}
      >
        <FontAwesome5 
          name="money-bill-alt" 
          size={20} 
          color={!isExpense ? '#28a745' : '#666'} 
        />
        <Text style={[
          styles.toggleText,
          styles.incomeText,
          !isExpense && styles.activeText
        ]}>
          Ingreso
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  activeOption: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  expenseText: {
    color: '#dc3545',
  },
  incomeText: {
    color: '#28a745',
  },
  activeText: {
    fontWeight: '700',
  },
});

export default TransactionTypeToggle;
