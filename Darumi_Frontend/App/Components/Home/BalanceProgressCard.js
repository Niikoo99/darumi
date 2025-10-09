import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const BalanceProgressCard = ({ 
  balance, 
  availableMoney, 
  spentMoney, 
  currency = '$' 
}) => {
  const percentage = availableMoney > 0 ? (spentMoney / availableMoney) * 100 : 0;
  const remainingMoney = availableMoney - spentMoney;
  
  const getBalanceColor = () => {
    if (balance >= 0) return '#28a745';
    return '#dc3545';
  };

  const getProgressColor = () => {
    if (percentage <= 50) return '#28a745';
    if (percentage <= 80) return '#ffc107';
    return '#dc3545';
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Balance del Mes</Text>
        <Text style={[styles.balanceAmount, { color: getBalanceColor() }]}>
          {currency}{Math.abs(balance).toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Dinero Disponible</Text>
          <Text style={styles.progressValue}>{currency}{availableMoney.toFixed(2)}</Text>
        </View>
        
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: getProgressColor()
                }
              ]} 
            />
          </View>
        </View>
        
        <Text style={styles.remainingText}>
          Te quedan {currency}{remainingMoney.toFixed(2)} por gastar
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
    fontWeight: '500',
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: '700',
  },
  progressSection: {
    marginTop: 8,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#e9ecef',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 6,
    transition: 'width 0.3s ease',
  },
  remainingText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
});

export default BalanceProgressCard;
