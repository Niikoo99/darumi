import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Colors from '../../../assets/shared/Colors';
import PaymentCard from '../PaymentCard';
import { formatCurrency } from '../../../utils/formatting';
import { 
  getSpacing, 
  getBorderRadius, 
  getBorderWidth, 
  getBodyFontSize, 
  getSmallFontSize,
  getShadowSize
} from '../../../utils/scaling';

/**
 * Componente para mostrar resumen de pagos habituales en el Dashboard
 */
const PaymentsSummary = ({ payments, resumen, onRefresh }) => {
  const navigation = useNavigation();

  // Obtener los próximos 3 pagos activos
  const upcomingPayments = payments
    .filter(payment => payment.Active === 1)
    .slice(0, 3);

  const handleViewAll = () => {
    navigation.navigate('UsualPayment');
  };

  const renderPaymentItem = ({ item }) => (
    <PaymentCard
      payment={item}
      showActions={false}
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <FontAwesome5 name="credit-card" size={20} color={Colors.primary} />
          <Text style={styles.title}>Pagos Habituales</Text>
        </View>
        
        <TouchableOpacity onPress={handleViewAll} style={styles.viewAllButton}>
          <Text style={styles.viewAllText}>Ver todos</Text>
          <FontAwesome5 name="chevron-right" size={12} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Resumen */}
      {resumen && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Activos</Text>
            <Text style={styles.summaryValue}>{resumen.pagosActivos || 0}</Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Balance</Text>
            <Text style={[
              styles.summaryValue,
              { color: (resumen.balance || 0) >= 0 ? Colors.success : Colors.danger }
            ]}>
              {formatCurrency(resumen.balance || 0)}
            </Text>
          </View>
          
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Total</Text>
            <Text style={styles.summaryValue}>{resumen.totalPagos || 0}</Text>
          </View>
        </View>
      )}

      {/* Lista de próximos pagos */}
      {upcomingPayments.length > 0 ? (
        <FlatList
          data={upcomingPayments}
          renderItem={renderPaymentItem}
          keyExtractor={(item) => item.Id_PagoHabitual.toString()}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <FontAwesome5 name="credit-card" size={32} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No hay pagos habituales</Text>
          <TouchableOpacity onPress={handleViewAll} style={styles.addButton}>
            <Text style={styles.addButtonText}>Agregar primero</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(),
    padding: getSpacing(16),
    marginBottom: getSpacing(16),
    ...getShadowSize(2, 4, 0.1),
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(16),
  },
  
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(8),
  },
  
  title: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
  },
  
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(4),
    paddingVertical: getSpacing(4),
    paddingHorizontal: getSpacing(8),
  },
  
  viewAllText: {
    fontSize: getSmallFontSize(),
    color: Colors.primary,
    fontWeight: '500',
  },
  
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(8),
    padding: getSpacing(12),
    marginBottom: getSpacing(16),
  },
  
  summaryItem: {
    alignItems: 'center',
  },
  
  summaryLabel: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
    marginBottom: getSpacing(4),
  },
  
  summaryValue: {
    fontSize: getBodyFontSize(),
    fontWeight: '700',
    color: Colors.text,
  },
  
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: getSpacing(20),
  },
  
  emptyText: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    marginTop: getSpacing(8),
    marginBottom: getSpacing(16),
  },
  
  addButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(8),
    borderRadius: getBorderRadius(6),
  },
  
  addButtonText: {
    fontSize: getSmallFontSize(),
    fontWeight: '600',
    color: Colors.white,
  },
});

export default PaymentsSummary;


