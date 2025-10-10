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
  const [paymentType, setPaymentType] = useState('Pago');
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
          ${Math.abs(item.amount).toLocaleString()}
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
            ${Math.abs(totalAmount).toLocaleString()}
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
                ${totalAmount.toLocaleString()}
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

      {/* Modal para Agregar Pago */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{
                  translateY: modalAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0],
                  }),
                }],
                opacity: modalAnim,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Pago Habitual</Text>
              <Text style={styles.modalSubtitle}>Agrega un pago o ingreso recurrente</Text>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre del pago"
              placeholderTextColor={Colors.textSecondary}
              value={newPaymentName}
              onChangeText={setNewPaymentName}
            />

            <TextInput
              style={styles.input}
              placeholder="Monto"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
              value={newPaymentAmount}
              onChangeText={setNewPaymentAmount}
            />

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={paymentType}
                onValueChange={setPaymentType}
                style={styles.picker}
              >
                <Picker.Item label="Pago" value="Pago" color={Colors.text} />
                <Picker.Item label="Ingreso" value="Ingreso" color={Colors.text} />
              </Picker>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddPayment}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
    fontSize: 24,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 4,
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
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
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
  modalBackground: {
    flex: 1,
    backgroundColor: Colors.backgroundModal,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 16,
  },
  pickerContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderRadius: 16,
    marginBottom: 24,
  },
  picker: {
    height: 50,
    color: Colors.textDark,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
});