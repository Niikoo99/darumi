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
  Modal,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';
import ScrollableTransactionForm from '../Components/Home/ScrollableTransactionForm';
import ModernInputField from '../Components/Home/ModernInputField';
import FixedTransactionToggle from '../Components/Home/FixedTransactionToggle';
import PaymentCard from '../Components/PaymentCard';
import ConfirmModal from '../Components/ConfirmModal';
import { usePayments } from '../../hooks/usePayments';
import { formatCurrency } from '../../utils/formatting';
import { 
  scaleSize, 
  scaleFont, 
  getHorizontalPadding, 
  getVerticalPadding, 
  getTitleFontSize, 
  getBodyFontSize, 
  getSmallFontSize, 
  getBorderRadius, 
  getIconSize, 
  getSpacing, 
  getButtonSize, 
  getCardSize, 
  getHeaderSize, 
  getStatsBarSize, 
  getIconContainerSize, 
  getShadowSize, 
  getBorderWidth, 
  getGap, 
  getMinWidth, 
  getMaxWidth 
} from '../../utils/scaling';

export default function UsualPayment() {
  // Hook personalizado para gestión de pagos
  const {
    payments,
    resumen,
    stats,
    loading,
    error,
    isCreating,
    isDeleting,
    createPayment,
    deletePayment,
    toggleActive,
    refresh,
    clearError
  } = usePayments();

  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [newPaymentRecurrencia, setNewPaymentRecurrencia] = useState('mensual');
  const [isExpenseSelected, setIsExpenseSelected] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  
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

  // Calcular balance total usando datos reales
  const totalAmount = stats.totalMontoIngresos - stats.totalMontoPagos;

  const handleAddPayment = async () => {
    if (!newPaymentName.trim() || !newPaymentAmount) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const paymentData = {
        titulo: newPaymentName.trim(),
        monto: parseFloat(newPaymentAmount),
        tipo: isExpenseSelected ? 'Pago' : 'Ingreso',
        recurrencia: newPaymentRecurrencia
      };

      await createPayment(paymentData);
      
      // Limpiar formulario
      setNewPaymentName('');
      setNewPaymentAmount('');
      setNewPaymentRecurrencia('mensual');
      setModalVisible(false);
      
      Alert.alert('Éxito', 'Pago habitual creado correctamente');
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al crear el pago habitual');
    }
  };

  const handleRemovePayment = (id) => {
    const payment = payments.find(p => p.Id_PagoHabitual === id);
    setPaymentToDelete({ id, titulo: payment?.Titulo });
    setConfirmModalVisible(true);
  };

  const confirmDelete = async () => {
    if (!paymentToDelete) return;

    try {
      await deletePayment(paymentToDelete.id);
      setConfirmModalVisible(false);
      setPaymentToDelete(null);
      Alert.alert('Éxito', 'Pago habitual eliminado correctamente');
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al eliminar el pago habitual');
    }
  };

  const handleToggleActive = async (id, active) => {
    try {
      await toggleActive(id, active);
    } catch (error) {
      Alert.alert('Error', error.message || 'Error al cambiar el estado del pago');
    }
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
    <PaymentCard
      payment={item}
      onToggleActive={handleToggleActive}
      onDelete={handleRemovePayment}
      showActions={true}
    />
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
          <Text style={styles.statNumber}>{stats.totalPagos}</Text>
          <Text style={styles.statLabel}>Pagos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{stats.totalIngresos}</Text>
          <Text style={styles.statLabel}>Ingresos</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statNumber, totalAmountStyle]}>
            {formatCurrency(totalAmount)}
          </Text>
          <Text style={styles.statLabel}>Balance</Text>
        </View>
      </View>

      {/* Loading State */}
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Cargando pagos habituales...</Text>
        </View>
      )}

      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={clearError} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Pagos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💸 Pagos Recurrentes</Text>
              <FlatList
                data={payments.filter(payment => payment.Tipo === 'Pago')}
                renderItem={renderPaymentItem}
                keyExtractor={(item) => item.Id_PagoHabitual.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay pagos recurrentes</Text>
                  </View>
                }
              />
            </View>

            {/* Ingresos */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💰 Ingresos Recurrentes</Text>
              <FlatList
                data={payments.filter(payment => payment.Tipo === 'Ingreso')}
                renderItem={renderPaymentItem}
                keyExtractor={(item) => item.Id_PagoHabitual.toString()}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No hay ingresos recurrentes</Text>
                  </View>
                }
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
            <TouchableOpacity 
              style={[styles.addButton, isCreating && styles.disabledButton]} 
              onPress={openModal}
              disabled={isCreating}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <FontAwesome5 name="plus" size={20} color={Colors.white} />
              )}
              <Text style={styles.addButtonText}>
                {isCreating ? 'Creando...' : 'Agregar Pago Habitual'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

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

        {/* Selector de recurrencia */}
        <View style={styles.pickerContainer}>
          <Text style={styles.pickerLabel}>Recurrencia</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={newPaymentRecurrencia}
              onValueChange={setNewPaymentRecurrencia}
              style={styles.picker}
            >
              <Picker.Item label="Mensual" value="mensual" />
              <Picker.Item label="Semanal" value="semanal" />
              <Picker.Item label="Anual" value="anual" />
            </Picker>
          </View>
        </View>

      </ScrollableTransactionForm>

      {/* Modal de Confirmación */}
      <ConfirmModal
        visible={confirmModalVisible}
        title="¿Eliminar pago habitual?"
        message={`¿Estás seguro de que quieres eliminar "${paymentToDelete?.titulo}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmModalVisible(false);
          setPaymentToDelete(null);
        }}
        loading={isDeleting}
      />
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
    ...getHeaderSize(),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getTitleFontSize(),
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: getSpacing(8),
  },
  headerSubtitle: {
    fontSize: getBodyFontSize(),
    color: Colors.textDark,
    opacity: 0.8,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...getStatsBarSize(),
    backgroundColor: Colors.backgroundSecondary,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: getTitleFontSize(18),
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: getSpacing(4),
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  statLabel: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: getHorizontalPadding(),
  },
  section: {
    marginBottom: getSpacing(24),
  },
  sectionTitle: {
    fontSize: getTitleFontSize(20),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: getSpacing(16),
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    borderLeftWidth: getBorderWidth(4),
    borderRadius: getBorderRadius(),
    padding: getSpacing(16),
    marginBottom: getSpacing(12),
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    ...getIconContainerSize(40),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(12),
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(2),
  },
  paymentType: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
  },
  paymentAmountContainer: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: getBodyFontSize(),
    fontWeight: '700',
    marginBottom: getSpacing(4),
    textAlign: 'right',
    flexWrap: 'wrap',
    maxWidth: getMaxWidth(100),
  },
  deleteButton: {
    padding: getSpacing(8),
  },
  totalContainer: {
    marginBottom: getSpacing(24),
  },
  totalCard: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(),
    borderColor: Colors.primary,
    borderRadius: getBorderRadius(),
    padding: getSpacing(20),
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    marginBottom: getSpacing(8),
  },
  totalAmount: {
    fontSize: getTitleFontSize(32),
    fontWeight: '800',
    marginBottom: getSpacing(4),
  },
  totalAmountPositive: {
    color: Colors.success,
  },
  totalAmountNegative: {
    color: Colors.danger,
  },
  totalSubtext: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    ...getButtonSize(),
    borderRadius: getBorderRadius(),
    gap: getGap(8),
  },
  addButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.textDark,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: getGap(16),
    marginTop: getSpacing(24),
    marginBottom: getSpacing(24),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: getSpacing(18),
    paddingHorizontal: getSpacing(24),
    borderRadius: getBorderRadius(),
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: getBorderWidth(),
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...getShadowSize(2, 4, 0.1),
  },
  cancelButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveButton: {
    flex: 1,
    borderRadius: getBorderRadius(),
    ...getShadowSize(4, 8, 0.3),
    paddingVertical: getSpacing(18),
    paddingHorizontal: getSpacing(24),
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
    fontSize: getBodyFontSize(),
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
    paddingHorizontal: getSpacing(24),
    paddingVertical: getSpacing(20),
    paddingBottom: Platform.OS === 'ios' ? scaleSize(34) : getSpacing(20), // Safe area para iOS
    borderTopWidth: getBorderWidth(1),
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    gap: getGap(16),
    ...getShadowSize(4, 8, 0.1),
  },
  fixedCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: getBorderWidth(),
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: getBorderRadius(),
    paddingVertical: getSpacing(16),
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedCancelButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
  },
  fixedSaveButton: {
    flex: 2,
    borderRadius: getBorderRadius(),
    paddingVertical: getSpacing(16),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    ...getShadowSize(4, 8, 0.3),
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
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.white,
  },
  
  // Nuevos estilos para estados de carga y error
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getSpacing(40),
  },
  
  loadingText: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    marginTop: getSpacing(16),
  },
  
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(40),
  },
  
  errorText: {
    fontSize: getBodyFontSize(),
    color: Colors.danger,
    textAlign: 'center',
    marginBottom: getSpacing(16),
  },
  
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: getSpacing(24),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(),
  },
  
  retryButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.white,
  },
  
  emptyContainer: {
    paddingVertical: getSpacing(20),
    alignItems: 'center',
  },
  
  emptyText: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  
  disabledButton: {
    opacity: 0.6,
  },
  
  // Estilos para el selector de recurrencia
  pickerContainer: {
    marginBottom: getSpacing(20),
  },
  
  pickerLabel: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(8),
  },
  
  pickerWrapper: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  
  picker: {
    height: getSpacing(50),
    color: Colors.text,
  },
});