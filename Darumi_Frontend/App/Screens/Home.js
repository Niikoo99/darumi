import { View, Text, Button, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView, Animated  } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-react';
import Header from '../Components/Home/Header';
import CategoryGrid from '../Components/Home/CategoryGrid';
import TransactionTypeToggle from '../Components/Home/TransactionTypeToggle';
import OptimizedAmountInput from '../Components/Home/OptimizedAmountInput';
import IntelligentAutocomplete from '../Components/Home/IntelligentAutocomplete';
import BalanceProgressCard from '../Components/Home/BalanceProgressCard';
import CategoryChart from '../Components/Home/CategoryChart';
import FinancialSummaryCards from '../Components/Home/FinancialSummaryCards';
import QuickActions from '../Components/Home/QuickActions';
import EnhancedTransactionList from '../Components/Home/EnhancedTransactionList';
import FloatingAddButton from '../Components/Home/FloatingAddButton';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';
import { buildApiUrl, getEndpoints, testConnection } from '../../config/api';

export default function Home() {
  
  const { isLoaded, signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [isExpensesSelected, setIsExpensesSelected] = useState(true); // State to track whether expenses or income is selected  
  const [categoriaIngresos, setCategoriaIngresos] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor_Detalle, setValorDetalle] = useState('');
  const [valor_Monto, setValorMonto] = useState('');
  const [valor_Titulo, setValorTitulo] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [data, setData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState('');
  const {isSignedIn, user} = useUser();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDetail, setEditedDetail] = useState('');
  const [editedAmount, setEditedAmount] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Estados para el dashboard
  const [financialData, setFinancialData] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0,
    availableMoney: 3500, // Monto fijo disponible por el usuario
  });
  const [categoryData, setCategoryData] = useState([]);
  
  // Estados para animaciones
  const [modalAnimation] = useState(new Animated.Value(0));
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

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
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (isSignedIn) {
        setLoading(true);
        try {
          console.log('🚀 Iniciando fetch de datos...');
          console.log('👤 Usuario:', user.id);
          
          // Fetch categories
          const categoriesUrl = buildApiUrl(getEndpoints().CATEGORIES + '/');
          console.log('📂 Fetching categories from:', categoriesUrl);
          const categoriesResponse = await axios.get(categoriesUrl);
          console.log('✅ Categories response:', categoriesResponse.data);
          setData(categoriesResponse.data);

          // Find the category with Nombre_categoria "Ingresos" and store its Id_categoria
          const ingresosCategory = categoriesResponse.data.find(category => category.Nombre_categoria === 'Ingresos');
          if (ingresosCategory) {
            setCategoriaIngresos(ingresosCategory.Id_categoria);
          }

          // Fetch transactions
          const transactionsResponse = await axios.get(buildApiUrl(getEndpoints().GASTOS + '/'), { 
            params: { Id_Usuario: user.id } 
          });
          setTransactions(transactionsResponse.data);

          // Calculate financial data
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          
          const monthlyTransactions = transactionsResponse.data.filter(transaction => {
            const transactionDate = new Date(transaction.Fecha_creacion_gasto);
            return transactionDate.getMonth() + 1 === currentMonth && 
                   transactionDate.getFullYear() === currentYear;
          });

          const totalExpenses = monthlyTransactions
            .filter(t => t.Monto_gasto < 0)
            .reduce((sum, t) => sum + Math.abs(t.Monto_gasto), 0);
          
          const totalIncome = monthlyTransactions
            .filter(t => t.Monto_gasto > 0)
            .reduce((sum, t) => sum + t.Monto_gasto, 0);

          const balance = totalIncome - totalExpenses;

          setFinancialData({
            totalExpenses,
            totalIncome,
            balance,
            availableMoney: 3500, // Monto fijo disponible
          });

          // Calculate category data
          const categoryTotals = {};
          monthlyTransactions.forEach(transaction => {
            const categoryName = transaction.Nombre_categoria;
            if (!categoryTotals[categoryName]) {
              categoryTotals[categoryName] = 0;
            }
            categoryTotals[categoryName] += Math.abs(transaction.Monto_gasto);
          });

          const categoryArray = Object.entries(categoryTotals)
            .map(([name, total]) => ({ name, total }))
            .sort((a, b) => b.total - a.total);

          setCategoryData(categoryArray);

        } catch (error) {
          console.error('❌ Error fetching data:', error);
          console.error('❌ Error details:', {
            message: error.message,
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url
          });
          setError(error);
          setDebugInfo(`❌ Error: ${error.message}`);
        } finally {
          setLoading(false);
        }
      }
    };

    // Probar conexión primero
    testConnection().then(isConnected => {
      const connectionStatus = isConnected ? '✅ OK' : '❌ FALLO';
      console.log('🔌 Conexión con backend:', connectionStatus);
      setDebugInfo(`🔌 Conexión: ${connectionStatus}`);
      if (isConnected) {
        fetchData();
      }
    });
  }, [isSignedIn, user]);

  const handleGuardar = () => {
    const Monto_gasto = isExpensesSelected ? -valor_Monto : valor_Monto;
    const auxIdCategory = isExpensesSelected ? categoriaSeleccionada : categoriaIngresos;

    console.log('Request Params:', {
      Monto_gasto,
      Id_categoria: auxIdCategory,
      Titulo_gasto: valor_Titulo,
      Detalle_gasto: valor_Detalle,
      Id_usuario: user.id,
    });

    axios
      .post(buildApiUrl(getEndpoints().GASTOS), {
        Monto_gasto,
        Id_categoria: auxIdCategory,
        Titulo_gasto: valor_Titulo,
        Detalle_gasto: valor_Detalle,
        Id_usuario: user.id,
      })
      .then((response) => {
        console.log('Gasto guardado:', response.data);
        setValorMonto('');
        setValorDetalle('');
        setValorTitulo('');
        setCategoriaSeleccionada('');
        setModalVisible(false);
        
        // Refresh data after saving
        fetchData();
      })
      .catch((error) => {
        console.error(error);
      });

    console.log('Handle guardar called');
  };

  // Función para refrescar datos (extraída del useEffect)
  const fetchData = async () => {
    if (isSignedIn) {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await axios.get(buildApiUrl(getEndpoints().CATEGORIES + '/'));
        setData(categoriesResponse.data);

        // Find the category with Nombre_categoria "Ingresos" and store its Id_categoria
        const ingresosCategory = categoriesResponse.data.find(category => category.Nombre_categoria === 'Ingresos');
        if (ingresosCategory) {
          setCategoriaIngresos(ingresosCategory.Id_categoria);
        }

        // Fetch transactions
        const transactionsResponse = await axios.get(buildApiUrl(getEndpoints().GASTOS + '/'), { 
          params: { Id_Usuario: user.id } 
        });
        setTransactions(transactionsResponse.data);

        // Calculate financial data
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        
        const monthlyTransactions = transactionsResponse.data.filter(transaction => {
          const transactionDate = new Date(transaction.Fecha_creacion_gasto);
          return transactionDate.getMonth() + 1 === currentMonth && 
                 transactionDate.getFullYear() === currentYear;
        });

        const totalExpenses = monthlyTransactions
          .filter(t => t.Monto_gasto < 0)
          .reduce((sum, t) => sum + Math.abs(t.Monto_gasto), 0);
        
        const totalIncome = monthlyTransactions
          .filter(t => t.Monto_gasto > 0)
          .reduce((sum, t) => sum + t.Monto_gasto, 0);

        const balance = totalIncome - totalExpenses;

        setFinancialData({
          totalExpenses,
          totalIncome,
          balance,
          availableMoney: 3500, // Monto fijo disponible
        });

        // Calculate category data
        const categoryTotals = {};
        monthlyTransactions.forEach(transaction => {
          const categoryName = transaction.Nombre_categoria;
          if (!categoryTotals[categoryName]) {
            categoryTotals[categoryName] = 0;
          }
          categoryTotals[categoryName] += Math.abs(transaction.Monto_gasto);
        });

        const categoryArray = Object.entries(categoryTotals)
          .map(([name, total]) => ({ name, total }))
          .sort((a, b) => b.total - a.total);

        setCategoryData(categoryArray);

      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handlers para acciones rápidas
  const handleQuickAddExpense = () => {
    setIsExpensesSelected(true);
    openModal();
  };

  const handleQuickAddIncome = () => {
    setIsExpensesSelected(false);
    openModal();
  };

  const handleToggleSwitch = (isExpense) => {
    setIsExpensesSelected(isExpense);
    // Limpiar categoría seleccionada al cambiar tipo
    setCategoriaSeleccionada('');
  };

  // Función para manejar sugerencias del autocompletado
  const handleSuggestionAccept = (categoryId) => {
    setCategoriaSeleccionada(categoryId);
  };

  // Función para manejar selección de categoría desde la grilla
  const handleCategorySelect = (categoryId) => {
    setCategoriaSeleccionada(categoryId);
  };

  // Función para animar la apertura del modal
  const openModal = () => {
    setModalVisible(true);
    Animated.timing(modalAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Función para animar el cierre del modal
  const closeModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      // Limpiar formulario al cerrar
      setValorTitulo('');
      setValorDetalle('');
      setValorMonto('');
      setCategoriaSeleccionada('');
    });
  };

  // Function to handle editing an item
  const handleEditItem = (item) => {
    setSelectedItem(item); // Set the selected item for editing

    setEditedTitle(item.Titulo_gasto);
    setEditedDetail(item.Detalle_gasto);
    setEditedAmount(item.Monto_gasto);

    // Show the Edit modal
    setEditModalVisible(true);
  };

  // Function to handle updating the item (called from the modal)
  const handleUpdateItem = async (editedData) => {
    // Implement logic to update the item using the edited data
    console.log('Updated data:', editedData);
    setEditModalVisible(false); // Hide the modal after updating
  };

  const renderItem = ({ item }) => {
    if (!item || item.Nombre_categoria === 'Ingresos') {
      return null; // Return null if item is undefined
    }
  
    if (!data || !Array.isArray(data)) {
      return null; // Return null if data is not available or not an array
    }

    if (item.Nombre_categoria === 'Ingresos'){
      setCategoriaIngresos(item.Id_categoria);
      console.log(item);
    }
  
    return (
      <Picker.Item label={item.Nombre_categoria} value={item.Id_categoria} />
    );
  };

  const filteredData = data.filter(item => item.Nombre_categoria !== 'Ingresos');  

  const renderStats = () => (
    <Animated.View
      style={[
        styles.statsContainer,
        {
          transform: [{ scale: scaleAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.statCard}>
        <FontAwesome5 name="chart-line" size={20} color={Colors.primary} />
        <Text style={styles.statNumber}>${financialData.balance.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Balance</Text>
      </View>
      <View style={styles.statCard}>
        <FontAwesome5 name="arrow-down" size={20} color={Colors.danger} />
        <Text style={styles.statNumber}>${financialData.totalExpenses.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Gastos</Text>
      </View>
      <View style={styles.statCard}>
        <FontAwesome5 name="arrow-up" size={20} color={Colors.success} />
        <Text style={styles.statNumber}>${financialData.totalIncome.toLocaleString()}</Text>
        <Text style={styles.statLabel}>Ingresos</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Debug Info */}
      {debugInfo && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>{debugInfo}</Text>
        </View>
      )}
      
      {/* Header Gamificado */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <Text style={styles.headerTitle}>🏠 Dashboard</Text>
        <Text style={styles.headerSubtitle}>Tu resumen financiero personal</Text>
        {user && (
          <Text style={styles.welcomeText}>¡Hola, {user.firstName || 'Usuario'}!</Text>
        )}
      </Animated.View>
      
      {/* Stats Bar */}
      {renderStats()}

      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Progress Card */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <BalanceProgressCard
            balance={financialData.balance}
            availableMoney={financialData.availableMoney}
            spentMoney={financialData.totalExpenses}
          />
        </Animated.View>

        {/* Financial Summary Cards */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <FinancialSummaryCards
            expenses={financialData.totalExpenses}
            income={financialData.totalIncome}
            balance={financialData.balance}
          />
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <QuickActions
            onAddExpense={handleQuickAddExpense}
            onAddIncome={handleQuickAddIncome}
          />
        </Animated.View>

        {/* Category Chart */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <CategoryChart categories={categoryData} />
        </Animated.View>

        {/* Enhanced Transaction List */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <EnhancedTransactionList
            transactions={transactions}
            onTransactionPress={(transaction) => console.log('Transaction pressed:', transaction)}
            onEditTransaction={handleEditItem}
          />
        </Animated.View>
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingAddButton
        onPress={openModal}
        isExpense={isExpensesSelected}
      />
      
      {/* Modal Principal */}
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
                  translateY: modalAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                }],
                opacity: modalAnimation,
              }
            ]}
          >
            {/* Indicador superior */}
            <View style={styles.modalIndicator} />
            
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isExpensesSelected ? '💸 Nuevo Gasto' : '💰 Nuevo Ingreso'}
              </Text>
              <Text style={styles.modalSubtitle}>
                Registra tu transacción rápidamente
              </Text>
            </View>

            {/* Toggle Gastos/Ingresos */}
            <TransactionTypeToggle 
              isExpense={isExpensesSelected}
              onToggle={handleToggleSwitch}
            />

            {/* Campo de título con autocompletado */}
            <IntelligentAutocomplete
              value={valor_Titulo}
              onChangeText={setValorTitulo}
              placeholder={isExpensesSelected ? "¿En qué gastaste?" : "¿De dónde viene este ingreso?"}
              categories={data}
              onSuggestionAccept={handleSuggestionAccept}
            />

            {/* Campo de detalle */}
            <TextInput
              style={styles.detailInput}
              placeholder="Detalle adicional (opcional)"
              value={valor_Detalle}
              onChangeText={setValorDetalle}
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={2}
            />

            {/* Grilla de categorías */}
            {isExpensesSelected && (
              <CategoryGrid
                categories={filteredData}
                selectedCategory={categoriaSeleccionada}
                onCategorySelect={handleCategorySelect}
                isExpense={true}
              />
            )}

            {/* Campo de monto optimizado */}
            <OptimizedAmountInput
              value={valor_Monto}
              onChangeText={setValorMonto}
              isExpense={isExpensesSelected}
              placeholder="0"
            />

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={closeModal}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.saveButton,
                  isExpensesSelected ? styles.expenseButton : styles.incomeButton
                ]} 
                onPress={handleGuardar}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Indicador superior */}
            <View style={styles.modalIndicator} />
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Editar Transacción</Text>
              <Text style={styles.modalSubtitle}>Modifica los detalles de tu transacción</Text>
            </View>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Título"
                keyboardType="default"
                value={editedTitle}
                onChangeText={(text) => setEditedTitle(text)}
                placeholderTextColor={Colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Detalle"
                keyboardType="default"
                value={editedDetail}
                onChangeText={(text) => setEditedDetail(text)}
                placeholderTextColor={Colors.textSecondary}
              />
              <TextInput
                style={styles.input}
                placeholder="Valor"
                keyboardType="numeric"
                value={editedAmount.toString()}
                onChangeText={(text) => setEditedAmount(text)}
                placeholderTextColor={Colors.textSecondary}
              />
              <View style={styles.buttonsContainer}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setEditModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateItem}>
                  <Text style={styles.saveButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
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
    marginBottom: 4,
  },
  welcomeText: {
    fontSize: 14,
    color: Colors.textDark,
    opacity: 0.9,
    fontWeight: '600',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: Colors.backgroundSecondary,
    marginBottom: 20,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for floating button
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 2,
    borderColor: Colors.border,
    borderBottomWidth: 0,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  detailInput: {
    width: '100%',
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderRadius: 16,
    fontSize: 16,
    backgroundColor: Colors.backgroundSecondary,
    color: Colors.text,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 60,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  expenseButton: {
    backgroundColor: Colors.danger,
  },
  incomeButton: {
    backgroundColor: Colors.success,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: Colors.borderLight,
    borderWidth: 2,
    marginBottom: 16,
    paddingHorizontal: 16,
    color: Colors.text,
    fontSize: 16,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: Colors.primary,
    borderWidth: 1,
    marginBottom: 10,
    color: Colors.text,
    fontSize: 16,
    borderRadius: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: 5,
  },
  selectedText: {
    color: Colors.primary,
  },
  icon: {
    marginRight: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 2,
    borderColor: Colors.borderLight,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textDark,
  },
  debugContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  debugText: {
    fontSize: 14,
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
});