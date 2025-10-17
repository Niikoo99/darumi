import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import { formatCurrency } from '../../../utils/formatting';
import AutoScaleCurrencyText from '../AutoScaleCurrencyText';
import { 
  scaleSize, 
  getBodyFontSize, 
  getTitleFontSize,
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getBorderWidth
} from '../../../utils/scaling';

const BalanceProgressCard = ({ 
  balance, 
  availableMoney, 
  spentMoney, 
  currency = '$' 
}) => {
  // El dinero disponible es la suma de ingresos
  const effectiveAvailableMoney = availableMoney;
  const percentage = effectiveAvailableMoney > 0 ? (spentMoney / effectiveAvailableMoney) * 100 : 0;
  const remainingMoney = effectiveAvailableMoney - spentMoney;
  
  const getBalanceColor = () => {
    if (balance >= 0) return Colors.success;
    return Colors.danger;
  };

  const getProgressColor = () => {
    if (percentage <= 50) return Colors.success;
    if (percentage <= 80) return Colors.warning;
    return Colors.danger;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Balance del Mes</Text>
        <AutoScaleCurrencyText 
          value={balance} 
          variant="balance"
          style={{ color: getBalanceColor() }}
          testID="balance-amount"
        />
      </View>
      
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressLabel}>Dinero Disponible</Text>
          <AutoScaleCurrencyText 
            value={effectiveAvailableMoney} 
            variant="small"
            style={styles.progressValue}
            testID="available-money"
          />
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
          Llevas gastado <AutoScaleCurrencyText 
            value={spentMoney} 
            variant="small"
            style={{ color: Colors.danger }}
            testID="spent-money"
          />
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(20),
    padding: getSpacing(24),
    marginBottom: getSpacing(20),
    borderWidth: getBorderWidth(2),
    borderColor: Colors.border,
    ...getShadowSize(8, 32, 0.1),
  },
  header: {
    alignItems: 'center',
    marginBottom: getSpacing(20),
  },
  title: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    marginBottom: getSpacing(8),
    fontWeight: '500',
  },
  progressSection: {
    marginTop: getSpacing(8),
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing(8),
  },
  progressLabel: {
    fontSize: scaleSize(14),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  progressValue: {
    fontSize: scaleSize(12),
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
    minWidth: 0,
  },
  progressBarContainer: {
    marginBottom: getSpacing(8),
  },
  progressBar: {
    height: scaleSize(12),
    backgroundColor: Colors.borderLight,
    borderRadius: getBorderRadius(6),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: getBorderRadius(6),
    transition: 'width 0.3s ease',
  },
  remainingText: {
    textAlign: 'center',
    fontSize: scaleSize(12),
    color: Colors.danger,
    fontWeight: '500',
    flexShrink: 1,
    minWidth: 0,
  },
});

export default BalanceProgressCard;
