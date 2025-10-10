import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  TextInput, 
  ScrollView,
  Animated,
  Modal 
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';
import ScrollableTransactionForm from '../Components/Home/ScrollableTransactionForm';
import ModernInputField from '../Components/Home/ModernInputField';
import FixedTransactionToggle from '../Components/Home/FixedTransactionToggle';
import { formatCurrency } from '../../utils/formatting';

export default function UsualPayment() {
  const [payments, setPayments] = useState([
    { id: '1', name: 'Alquiler', amount: 1000, type: 'Pago', icon: 'home', color: Colors.danger },
    { id: '2', name: 'Servicios', amount: 200, type: 'Pago', icon: 'tools', color: Colors.warning },
    { id: '3', name: 'Salario', amount: 2500, type: 'Ingreso', icon: 'money-bill-wave', color: Colors.success },
    { id: '4', name: 'Netflix', amount: 15, type: 'Pago', icon: 'play', color: '#E50914' },
    { id: '5', name: 'Gym', amount: 80, type: 'Pago', icon: 'dumbbell', color: '#FF6B6B' },
  ]);

  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [isExpenseSelected, setIsExpenseSelected] = useState(true); // Cambio para usar el mismo patrón que Home
  const [modalVisible, setModalVisible] = useState(false);
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const modalAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const totalAmount = payments.reduce((total, payment) => {
    if (payment.type === 'Pago') {
      return total - payment.amount;
    } else {
      return total + payment.amount;
    }
  }, 0);

  const handleAddPayment = () => {
    if (newPaymentName && newPaymentAmount) {
      const paymentType = isExpenseSelected ? 'Pago' : 'Ingreso';
      const newPayment = {
        id: Math.random().toString(),
        name: newPaymentName,
        amount: parseFloat(newPaymentAmount),
        type: paymentType,
        icon: getPaymentIcon(newPaymentName),
        color: getPaymentColor(paymentType),
      };
      setPayments([...payments, newPayment]);
      setNewPaymentName('');
      setNewPaymentAmount('');
      setModalVisible(false);
    }
  };

  const handleRemovePayment = (id) => {
    Animated.timing(fadeAnim, {
      toValue: 0.5,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      const updatedPayments = payments.filter((payment) => payment.id !== id);
      setPayments(updatedPayments);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const getPaymentIcon = (name) => {
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
    };
    return iconMap[name] || 'credit-card';
  };

  const getPaymentColor = (type) => {
    return type === 'Pago' ? Colors.danger : Colors.success;
  };

  // Función para manejar el toggle de gasto/ingreso
  const handleToggleSwitch = (isExpense) => {
    setIsExpenseSelected(isExpense);
  };

  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeModal = () => {
    Animated.timing(modalAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
    });
  };

  const renderPaymentItem = ({ item }) => (
    <Animated.View
      style={[
        styles.paymentItem,
        {
          borderLeftColor: item.color,
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.paymentInfo}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <FontAwesome5 name={item.icon} size={20} color={item.color} />
        </View>
        <View style={styles.paymentDetails}>
          <Text style={styles.paymentName}>{item.name}</Text>
          <Text style={styles.paymentType}>{item.type}</Text>
        </View>
      </View>
      <View style={styles.paymentAmountContainer}>
        <Text style={[
          styles.paymentAmount,
          { color: item.type === 'Pago' ? Colors.danger : Colors.success }
        ]}>
          {formatCurrency(item.amount)}
        </Text>
        <TouchableOpacity 
          onPress={() => handleRemovePayment(item.id)}
          style={styles.deleteButton}
        >
          <FontAwesome5 name="trash-alt" size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const totalAmountStyle = totalAmount >= 0 ? styles.totalAmountPositive : styles.totalAmountNegative;

  return (
    <View style={styles.container}>
      {/* Header Gamificado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💳 Pagos Habituales</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus pagos recurrentes</Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{payments.filter(p => p.type === 'Pago').length}</Text>
          <Text style={styles.statLabel}>Pagos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{payments.filter(p => p.type === 'Ingreso').length}</Text>
          <Text style={styles.statLabel}>Ingresos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, totalAmountStyle]}>
            {formatCurrency(totalAmount)}
          </Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Pagos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💸 Pagos Recurrentes</Text>
            <FlatList
              data={payments.filter(payment => payment.type === 'Pago')}
              renderItem={renderPaymentItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Ingresos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Ingresos Recurrentes</Text>
            <FlatList
              data={payments.filter(payment => payment.type === 'Ingreso')}
              renderItem={renderPaymentItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Resumen Total */}
          <View style={styles.totalContainer}>
            <View style={styles.totalCard}>
              <Text style={styles.totalLabel}>Balance Total</Text>
              <Text style={[styles.totalAmount, totalAmountStyle]}>
                {formatCurrency(totalAmount)}
              </Text>
              <Text style={styles.totalSubtext}>
                {totalAmount >= 0 ? 'Ingresos superan gastos' : 'Gastos superan ingresos'}
              </Text>
            </View>
          </View>

          {/* Botón Agregar */}
          <TouchableOpacity style={styles.addButton} onPress={openModal}>
            <FontAwesome5 name="plus" size={20} color={Colors.white} />
            <Text style={styles.addButtonText}>Agregar Pago Habitual</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal Rediseñado para Agregar Pago */}
      <ScrollableTransactionForm
        isVisible={modalVisible}
        onClose={closeModal}
        title={isExpenseSelected ? '💸 Nuevo Pago Habitual' : '💰 Nuevo Ingreso Habitual'}
        subtitle="Registra tu pago o ingreso recurrente"
        actionButtons={
          <>
            <TouchableOpacity 
              style={styles.fixedCancelButton} 
              onPress={closeModal}
              activeOpacity={0.8}
            >
              <Text style={styles.fixedCancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.fixedSaveButton,
                (!newPaymentName.trim() || !newPaymentAmount) 
                  ? styles.fixedDisabledButton 
                  : (isExpenseSelected ? styles.fixedExpenseButton : styles.fixedIncomeButton)
              ]} 
              onPress={handleAddPayment}
              activeOpacity={0.8}
              disabled={!newPaymentName.trim() || !newPaymentAmount}
            >
              <Text style={styles.fixedSaveButtonText}>
                {isExpenseSelected ? 'Guardar Pago' : 'Guardar Ingreso'}
              </Text>
            </TouchableOpacity>
          </>
        }
      >
        {/* Toggle Gastos/Ingresos */}
        <FixedTransactionToggle 
          isExpense={isExpenseSelected}
          onToggle={handleToggleSwitch}
        />

        {/* Campo de nombre */}
        <ModernInputField
          label="¿Cómo se llama este pago?"
          placeholder={isExpenseSelected ? "Ej: Alquiler, Netflix, Gym..." : "Ej: Salario, Freelance, Venta..."}
          value={newPaymentName}
          onChangeText={setNewPaymentName}
          keyboardType="default"
        />

        {/* Campo de monto */}
        <ModernInputField
          label="Monto"
          placeholder="0"
          value={newPaymentAmount}
          onChangeText={setNewPaymentAmount}
          keyboardType="numeric"
        />

      </ScrollableTransactionForm>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: Colors.textDark,
    opacity: 0.8,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: 16,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.border,
    borderLeftWidth: 4,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  paymentType: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  paymentAmountContainer: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'right',
    flexWrap: 'wrap',
    maxWidth: 100,
  },
  deleteButton: {
    padding: 8,
  },
  totalContainer: {
    marginBottom: 24,
  },
  totalCard: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  totalAmountPositive: {
    color: Colors.success,
  },
  totalAmountNegative: {
    color: Colors.danger,
  },
  totalSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
  },
  expenseButton: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
  },
  incomeButton: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
  },
  disabledButton: {
    backgroundColor: '#666',
    shadowOpacity: 0.1,
    elevation: 2,
    shadowColor: '#666',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  // Fixed Action Buttons (igual que otros formularios)
  fixedButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Safe area para iOS
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    gap: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  fixedCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  fixedSaveButton: {
    flex: 2,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fixedExpenseButton: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
  },
  fixedIncomeButton: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
  },
  fixedDisabledButton: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  fixedSaveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});