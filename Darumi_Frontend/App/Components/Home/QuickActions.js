import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import { 
  scaleSize, 
  getBodyFontSize, 
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getBorderWidth,
  getGap,
  getIconSize
} from '../../../utils/scaling';

const QuickActions = ({ onAddExpense, onAddIncome }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.expenseButton]}
        onPress={onAddExpense}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIcon, styles.expenseIcon]}>
          <FontAwesome5 name="money-bill-wave" size={getIconSize(24)} color={Colors.danger} />
        </View>
        <Text style={styles.actionText}>💸 Nuevo Gasto</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.actionButton, styles.incomeButton]}
        onPress={onAddIncome}
        activeOpacity={0.7}
      >
        <View style={[styles.actionIcon, styles.incomeIcon]}>
          <FontAwesome5 name="hand-holding-usd" size={getIconSize(24)} color={Colors.success} />
        </View>
        <Text style={styles.actionText}>💰 Nuevo Ingreso</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: getGap(16),
    marginBottom: getSpacing(16),
    paddingHorizontal: getSpacing(4),
  },
  actionButton: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(16),
    padding: getSpacing(16),
    alignItems: 'center',
    borderWidth: getBorderWidth(2),
    borderColor: Colors.border,
    ...getShadowSize(4, 16, 0.08),
  },
  expenseButton: {
    borderLeftWidth: getBorderWidth(4),
    borderLeftColor: Colors.danger,
  },
  incomeButton: {
    borderLeftWidth: getBorderWidth(4),
    borderLeftColor: Colors.success,
  },
  actionIcon: {
    width: getIconSize(48),
    height: getIconSize(48),
    borderRadius: getBorderRadius(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(8),
  },
  expenseIcon: {
    backgroundColor: `${Colors.danger}20`,
  },
  incomeIcon: {
    backgroundColor: `${Colors.success}20`,
  },
  actionText: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
});

export default QuickActions;
