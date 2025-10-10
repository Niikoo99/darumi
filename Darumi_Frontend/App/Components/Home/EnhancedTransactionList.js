import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';

const EnhancedTransactionList = ({ transactions = [], onTransactionPress, onEditTransaction }) => {
  // Mapeo de categorías a iconos y colores
  const categoryConfig = {
    'Comida/Restaurante': { icon: 'hamburger', color: '#ff6b6b' },
    'Transporte': { icon: 'car', color: '#4ecdc4' },
    'Combustibles': { icon: 'gas-pump', color: '#45b7d1' },
    'Vestimenta/Calzado': { icon: 'tshirt', color: '#96ceb4' },
    'Mecanica': { icon: 'wrench', color: '#feca57' },
    'Electrodomestico': { icon: 'home', color: '#ff9ff3' },
    'Varios': { icon: 'ellipsis-h', color: '#a55eea' },
    'Ingresos': { icon: 'money-bill-wave', color: '#28a745' },
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Hoy';
    if (diffDays === 2) return 'Ayer';
    if (diffDays <= 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const renderTransactionItem = (item, index) => {
    const isExpense = item.Monto_gasto < 0;
    const config = categoryConfig[item.Nombre_categoria] || categoryConfig['Varios'];
    
    return (
      <TouchableOpacity 
        key={item.id || index}
        style={styles.transactionItem}
        onPress={() => onTransactionPress && onTransactionPress(item)}
        onLongPress={() => onEditTransaction && onEditTransaction(item)}
        activeOpacity={0.7}
      >
        <View style={[styles.transactionIcon, { backgroundColor: config.color }]}>
          <FontAwesome5 name={config.icon} size={20} color="white" />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {item.Titulo_gasto}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionCategory}>{item.Nombre_categoria}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.Fecha_creacion_gasto)}</Text>
          </View>
          {item.Detalle_gasto && (
            <Text style={styles.transactionDetail} numberOfLines={1}>
              {item.Detalle_gasto}
            </Text>
          )}
        </View>
        
        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText,
            isExpense ? styles.expenseAmount : styles.incomeAmount
          ]}>
            {isExpense ? '-' : '+'}${Math.abs(item.Monto_gasto).toFixed(2)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Transacciones Recientes</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>Ver todas</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.transactionList}>
        {transactions.slice(0, 5).map((item, index) => renderTransactionItem(item, index))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  transactionList: {
    // Container for transaction items
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
    marginRight: 12,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  transactionCategory: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionDetail: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
  },
  expenseAmount: {
    color: Colors.danger,
  },
  incomeAmount: {
    color: Colors.success,
  },
});

export default EnhancedTransactionList;