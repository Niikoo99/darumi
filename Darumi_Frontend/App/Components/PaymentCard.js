import React from 'react';
import { View, Text, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';
import { formatCurrency } from '../../utils/formatting';
import { 
  getSpacing, 
  getBorderRadius, 
  getBorderWidth, 
  getBodyFontSize, 
  getSmallFontSize,
  getIconSize,
  getShadowSize
} from '../../utils/scaling';

/**
 * Componente para mostrar una tarjeta de pago habitual
 * Diseño coherente con el estilo Darumi
 */
const PaymentCard = ({ 
  payment, 
  onToggleActive, 
  onDelete, 
  onEdit,
  showActions = true 
}) => {
  const isActive = payment.Active === 1;
  const isPago = payment.Tipo === 'Pago';
  const isIngreso = payment.Tipo === 'Ingreso';

  // Obtener icono según el tipo de pago
  const getPaymentIcon = (titulo) => {
    const iconMap = {
      'Alquiler': 'home',
      'Servicios': 'tools',
      'Salario': 'money-bill-wave',
      'Netflix': 'play',
      'Gym': 'dumbbell',
      'Internet': 'wifi',
      'Luz': 'lightbulb',
      'Gas': 'fire',
      'Agua': 'tint',
      'Teléfono': 'phone',
      'Supermercado': 'shopping-cart',
      'Transporte': 'bus',
      'Combustible': 'gas-pump',
      'Freelance': 'laptop',
      'Venta': 'handshake',
    };
    return iconMap[titulo] || 'credit-card';
  };

  // Obtener color según el tipo
  const getPaymentColor = () => {
    if (isIngreso) return Colors.success;
    if (isPago) return Colors.danger;
    return Colors.primary;
  };

  // Obtener color de fondo según el estado
  const getBackgroundColor = () => {
    if (!isActive) return Colors.backgroundSecondary;
    return Colors.backgroundCard;
  };

  // Obtener color del borde según el estado
  const getBorderColor = () => {
    if (!isActive) return Colors.border;
    if (isIngreso) return Colors.success;
    if (isPago) return Colors.danger;
    return Colors.primary;
  };

  const iconName = getPaymentIcon(payment.Titulo);
  const paymentColor = getPaymentColor();
  const backgroundColor = getBackgroundColor();
  const borderColor = getBorderColor();

  return (
    <View style={[
      styles.card,
      {
        backgroundColor,
        borderColor,
        opacity: isActive ? 1 : 0.6
      }
    ]}>
      {/* Información principal */}
      <View style={styles.paymentInfo}>
        <View style={[styles.iconContainer, { backgroundColor: `${paymentColor}20` }]}>
          <FontAwesome5 
            name={iconName} 
            size={getIconSize(20)} 
            color={paymentColor} 
          />
        </View>
        
        <View style={styles.paymentDetails}>
          <Text style={[styles.paymentTitle, { color: isActive ? Colors.text : Colors.textSecondary }]}>
            {payment.Titulo}
          </Text>
          
          <View style={styles.paymentMeta}>
            <Text style={[styles.paymentType, { color: paymentColor }]}>
              {payment.Tipo}
            </Text>
            
            {payment.Recurrencia && (
              <Text style={styles.recurrencia}>
                • {payment.Recurrencia}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* Monto y controles */}
      <View style={styles.paymentControls}>
        <Text style={[
          styles.paymentAmount,
          { color: paymentColor }
        ]}>
          {formatCurrency(payment.Monto)}
        </Text>
        
        {showActions && (
          <View style={styles.controls}>
            {/* Switch para activar/desactivar */}
            <Switch
              value={isActive}
              onValueChange={(value) => onToggleActive && onToggleActive(payment.Id_PagoHabitual, value)}
              trackColor={{ false: Colors.border, true: `${paymentColor}40` }}
              thumbColor={isActive ? paymentColor : Colors.textSecondary}
              style={styles.switch}
            />
            
            {/* Botón de eliminar */}
            <TouchableOpacity 
              onPress={() => onDelete && onDelete(payment.Id_PagoHabitual)}
              style={styles.deleteButton}
              activeOpacity={0.7}
            >
              <FontAwesome5 
                name="trash-alt" 
                size={getIconSize(14)} 
                color={Colors.danger} 
              />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(),
    borderLeftWidth: getBorderWidth(4),
    borderRadius: getBorderRadius(),
    padding: getSpacing(16),
    marginBottom: getSpacing(12),
    ...getShadowSize(2, 4, 0.1),
  },
  
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  iconContainer: {
    width: getSpacing(40),
    height: getSpacing(40),
    borderRadius: getBorderRadius(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(12),
  },
  
  paymentDetails: {
    flex: 1,
  },
  
  paymentTitle: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    marginBottom: getSpacing(4),
  },
  
  paymentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  paymentType: {
    fontSize: getSmallFontSize(),
    fontWeight: '500',
  },
  
  recurrencia: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
    marginLeft: getSpacing(4),
  },
  
  paymentControls: {
    alignItems: 'flex-end',
  },
  
  paymentAmount: {
    fontSize: getBodyFontSize(),
    fontWeight: '700',
    marginBottom: getSpacing(8),
    textAlign: 'right',
  },
  
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(8),
  },
  
  switch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  
  deleteButton: {
    padding: getSpacing(8),
    borderRadius: getBorderRadius(4),
    backgroundColor: `${Colors.danger}10`,
  },
});

export default PaymentCard;


