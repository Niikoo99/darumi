import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
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
  getBorderWidth,
  getIconSize,
  getMaxWidth
} from '../../../utils/scaling';

// Temporary local function to replace getMinWidth
const getMinWidth = (baseMinWidth = 80) => scaleSize(baseMinWidth);

const EnhancedTransactionList = ({ transactions = [], onTransactionPress, onEditTransaction, onViewAll }) => {
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
          <FontAwesome5 name={config.icon} size={getIconSize(22)} color="white" />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {item.Titulo_gasto}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.Fecha_creacion_gasto)}</Text>
          {item.Detalle_gasto && (
            <Text style={styles.transactionDetail} numberOfLines={1}>
              {item.Detalle_gasto}
            </Text>
          )}
        </View>
        
        <View style={styles.transactionAmount}>
          <AutoScaleCurrencyText 
            value={Math.abs(item.Monto_gasto)} 
            variant="small"
            style={[
              styles.amountText,
              isExpense ? styles.expenseAmount : styles.incomeAmount
            ]}
            testID={`transaction-amount-${index}`}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📋 Transacciones Recientes</Text>
        <TouchableOpacity onPress={onViewAll}>
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
    borderRadius: getBorderRadius(20),
    padding: getSpacing(24),
    marginBottom: getSpacing(20),
    borderWidth: getBorderWidth(2),
    borderColor: Colors.border,
    ...getShadowSize(8, 32, 0.1),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(20),
  },
  title: {
    fontSize: getTitleFontSize(18),
    fontWeight: '600',
    color: Colors.text,
  },
  viewAllText: {
    fontSize: scaleSize(14),
    color: Colors.primary,
    fontWeight: '500',
  },
  transactionList: {
    // Container for transaction items
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing(16), // Reducido de 18 a 16
    paddingHorizontal: getSpacing(16), // Reducido de 18 a 16
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(12),
    marginBottom: getSpacing(10), // Reducido de 12 a 10
    borderWidth: getBorderWidth(),
    borderColor: Colors.borderLight,
    // Sombra sutil
    ...getShadowSize(1, 2, 0.1),
  },
  transactionIcon: {
    width: getIconSize(50), // Ligeramente más grande
    height: getIconSize(50),
    borderRadius: getBorderRadius(25),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(18), // Más separación
    // Sombra sutil para el ícono
    ...getShadowSize(2, 4, 0.15),
  },
  transactionDetails: {
    flex: 1,
    marginRight: getSpacing(8), // Reducido de 12 a 8 para dar más espacio
    minWidth: 0, // Permite truncamiento
    flexShrink: 1, // Permite que se ajuste si es necesario
  },
  transactionTitle: {
    fontSize: getBodyFontSize(16), // Reducido de 17 a 16
    fontWeight: '700', // Más bold para destacar
    color: Colors.text,
    marginBottom: getSpacing(6), // Reducido de 8 a 6
    lineHeight: getBodyFontSize(16) * 1.2, // Ajustado
  },
  transactionDate: {
    fontSize: scaleSize(11), // Reducido de 12 a 11
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
    marginBottom: getSpacing(4),
    lineHeight: scaleSize(11) * 1.2, // Mejor control de altura de línea
    flexShrink: 0, // Evita que se comprima
  },
  transactionDetail: {
    fontSize: scaleSize(11),
    color: 'rgba(255, 255, 255, 0.5)', // Aún más sutil
    fontStyle: 'italic',
    fontWeight: '300',
  },
  transactionAmount: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: getMinWidth(100), // Reducido de 120 a 100
    paddingLeft: getSpacing(10), // Reducido de 12 a 10
  },
  amountText: {
    fontSize: getBodyFontSize(16), // Reducido de 19 a 16
    fontWeight: '700', // Reducido de 800 a 700
    textAlign: 'right',
    maxWidth: getMaxWidth(110), // Reducido para dar más espacio al texto
    letterSpacing: 0.5, // Mejor legibilidad de números
    lineHeight: getBodyFontSize(18) * 1.1,
  },
  expenseAmount: {
    color: Colors.danger,
    // Sombra sutil para gastos
    textShadowColor: 'rgba(220, 53, 69, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  incomeAmount: {
    color: Colors.success,
    // Sombra sutil para ingresos
    textShadowColor: 'rgba(40, 167, 69, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default EnhancedTransactionList;