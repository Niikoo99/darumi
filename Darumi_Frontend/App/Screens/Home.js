import { View, Text, Button, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView, Animated, Platform } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-react';
import { useNavigation } from '@react-navigation/native';
import Header from '../Components/Home/Header';
import CategoryGrid from '../Components/Home/CategoryGrid';
import ModernCategoryGrid from '../Components/Home/ModernCategoryGrid';
import TransactionTypeToggle from '../Components/Home/TransactionTypeToggle';
import SimpleTransactionToggle from '../Components/Home/SimpleTransactionToggle';
import FixedTransactionToggle from '../Components/Home/FixedTransactionToggle';
import OptimizedAmountInput from '../Components/Home/OptimizedAmountInput';
import IntelligentAutocomplete from '../Components/Home/IntelligentAutocomplete';
import ModernInputField from '../Components/Home/ModernInputField';
import ScrollableTransactionForm from '../Components/Home/ScrollableTransactionForm';
import FixedActionButtons from '../Components/Home/FixedActionButtons';
import SimpleFixedActionButtons from '../Components/Home/SimpleFixedActionButtons';
import BalanceProgressCard from '../Components/Home/BalanceProgressCard';
import CategoryChart from '../Components/Home/CategoryChart';
import TopCategoryCard from '../Components/Home/TopCategoryCard';
import FinancialSummaryCards from '../Components/Home/FinancialSummaryCards';
import QuickActions from '../Components/Home/QuickActions';
import EnhancedTransactionList from '../Components/Home/EnhancedTransactionList';
import FloatingAddButton from '../Components/Home/FloatingAddButton';
import PaymentsSummary from '../Components/Home/PaymentsSummary';
import { usePayments } from '../../hooks/usePayments';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';
import { buildApiUrl, getEndpoints, testConnection } from '../../config/api';
import { formatCurrency } from '../../utils/formatting';
import AutoScaleCurrencyText from '../Components/AutoScaleCurrencyText';
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
  getInputSize, 
  getModalSize, 
  getHeaderSize, 
  getStatsBarSize, 
  getScrollContentSize, 
  getFloatingButtonSize, 
  getIconContainerSize, 
  getProgressBarSize, 
  getBadgeSize, 
  getShadowSize, 
  getBorderWidth, 
  getGap, 
  // getMinWidth, // Temporarily commented out
  getMaxWidth, 
  getLineHeight, 
  getMinHeight, 
  getMaxHeight, 
  getFontSize 
} from '../../utils/scaling';

// Temporary local function to replace getMinWidth
const getMinWidth = (baseMinWidth = 80) => scaleSize(baseMinWidth);

export default function Home() {
  const navigation = useNavigation();
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
  const {isSignedIn, user} = useUser();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDetail, setEditedDetail] = useState('');
  const [editedAmount, setEditedAmount] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  
  // Hook para pagos habituales
  const { payments, resumen, refresh: refreshPayments } = usePayments();
  
  // Estados para el dashboard
  const [financialData, setFinancialData] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    balance: 0,
    availableMoney: 0, // Se calculará dinámicamente basado en el balance
  });
  const [categoryData, setCategoryData] = useState([]);
  
  // Estados para las nuevas tarjetas de categorías
  const [topExpenses, setTopExpenses] = useState(null);
  const [topIncomes, setTopIncomes] = useState(null);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  
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

  // Función para cargar datos de categorías usando los nuevos endpoints
  const fetchCategoryReports = async () => {
    if (!isSignedIn || !user?.id) return;
    
    setIsLoadingCategories(true);
    try {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      console.log('📊 Fetching category reports for month:', currentMonth);
      
      const [expensesRes, incomesRes] = await Promise.all([
        axios.get(buildApiUrl('/api/reports/top-expenses'), {
          params: { 
            Id_Usuario: user.id,
            month: currentMonth,
            limit: 3
          }
        }),
        axios.get(buildApiUrl('/api/reports/top-incomes'), {
          params: { 
            Id_Usuario: user.id,
            month: currentMonth,
            limit: 3
          }
        })
      ]);
      
      setTopExpenses(expensesRes.data);
      setTopIncomes(incomesRes.data);
      
    } catch (error) {
      console.error('❌ Error fetching category reports:', error);
      // No establecer error aquí para no afectar la funcionalidad principal
    } finally {
      setIsLoadingCategories(false);
    }
  };

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

          // Calcular balance incluyendo pagos habituales
          let balance = totalIncome - totalExpenses;
          
          // Si hay resumen de pagos habituales, incluirlo en el cálculo
          if (resumen) {
            balance += resumen.balance || 0;
          }

          setFinancialData({
            totalExpenses,
            totalIncome,
            balance,
            availableMoney: totalIncome, // Dinero disponible basado en los ingresos totales
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

    // Fetch data directamente
    fetchData();
    
    // Fetch category reports usando los nuevos endpoints
    fetchCategoryReports();
  }, [isSignedIn, user]);

  const handleGuardar = async () => {
    // Validación del formulario
    const errors = {};
    
    if (!valor_Titulo.trim()) {
      errors.title = 'Por favor ingresa un título para la transacción';
    }
    
    if (!valor_Monto || isNaN(valor_Monto) || parseFloat(valor_Monto) <= 0) {
      errors.amount = 'Por favor ingresa un monto válido';
    }
    
    if (isExpensesSelected && !categoriaSeleccionada) {
      errors.category = 'Por favor selecciona una categoría para el gasto';
    }
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    setFormErrors({});
    setIsSaving(true);
    
    try {
      const Monto_gasto = isExpensesSelected ? -valor_Monto : valor_Monto;
      const auxIdCategory = isExpensesSelected ? categoriaSeleccionada : categoriaIngresos;

      console.log('Request Params:', {
        Monto_gasto,
        Id_categoria: auxIdCategory,
        Titulo_gasto: valor_Titulo,
        Detalle_gasto: valor_Detalle,
        Id_usuario: user.id,
      });

      const response = await axios.post(buildApiUrl(getEndpoints().GASTOS), {
        Monto_gasto,
        Id_categoria: auxIdCategory,
        Titulo_gasto: valor_Titulo,
        Detalle_gasto: valor_Detalle,
        Id_usuario: user.id,
      });

      console.log('Gasto guardado:', response.data);
      
      // Limpiar formulario
      setValorMonto('');
      setValorDetalle('');
      setValorTitulo('');
      setCategoriaSeleccionada('');
      setModalVisible(false);
      
      // Refresh data after saving
      await fetchData();
      await fetchCategoryReports();
    } catch (error) {
      console.error('Error al guardar:', error);
      setFormErrors({ general: 'Error al guardar la transacción. Inténtalo de nuevo.' });
    } finally {
      setIsSaving(false);
    }
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
          availableMoney: totalIncome, // Dinero disponible basado en los ingresos totales
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
      setFormErrors({});
      setIsSaving(false);
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
        <AutoScaleCurrencyText 
          value={financialData.balance} 
          variant="balance"
          testID="balance-stat"
        />
        <Text style={styles.statLabel}>Balance</Text>
      </View>
      <View style={styles.statCard}>
        <FontAwesome5 name="arrow-down" size={20} color={Colors.danger} />
        <AutoScaleCurrencyText 
          value={financialData.totalExpenses} 
          variant="expense"
          testID="expenses-stat"
        />
        <Text style={styles.statLabel}>Gastos</Text>
      </View>
      <View style={styles.statCard}>
        <FontAwesome5 name="arrow-up" size={20} color={Colors.success} />
        <AutoScaleCurrencyText 
          value={financialData.totalIncome} 
          variant="income"
          testID="income-stat"
        />
        <Text style={styles.statLabel}>Ingresos</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Saludo Compacto */}
      <View style={styles.compactHeader}>
        <Text style={styles.compactGreeting} numberOfLines={1} allowFontScaling={true}>
          Hola, {user?.firstName || 'Usuario'}
        </Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Progress Card - Elemento Principal */}
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

        {/* Quick Actions - Acciones Principales */}
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

        {/* Top Categories - Gastos e Ingresos Separados */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <TopCategoryCard
            title="Top Gastos del Mes"
            data={topExpenses?.topCategories || []}
            totalAmount={topExpenses?.totalExpenses || 0}
            themeColor="#F87171" // Rojo/rosa para gastos
            isLoading={isLoadingCategories}
          />
        </Animated.View>

        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <TopCategoryCard
            title="Top Ingresos del Mes"
            data={topIncomes?.topCategories || []}
            totalAmount={topIncomes?.totalIncomes || 0}
            themeColor="#4ADE80" // Verde para ingresos
            isLoading={isLoadingCategories}
          />
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
            onViewAll={() => navigation.navigate('AllTransactions')}
          />
        </Animated.View>

         {/* Payments Summary */}
        <Animated.View
          style={[
            {
              transform: [{ scale: scaleAnim }],
              opacity: fadeAnim,
            },
          ]}
        >
          <PaymentsSummary
            payments={payments}
            resumen={resumen}
            onRefresh={refreshPayments}
          />
        </Animated.View>
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingAddButton
        onPress={openModal}
        isExpense={isExpensesSelected}
      />
      
      {/* Modal Principal Rediseñado */}
      <ScrollableTransactionForm
        isVisible={modalVisible}
        onClose={closeModal}
        title={isExpensesSelected ? '💸 Nuevo Gasto' : '💰 Nuevo Ingreso'}
        subtitle="Registra tu transacción rápidamente"
        fixedTopComponent={
          <FixedTransactionToggle 
            isExpense={isExpensesSelected}
            onToggle={handleToggleSwitch}
          />
        }
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
                (isSaving || !valor_Titulo.trim() || !valor_Monto || (isExpensesSelected && !categoriaSeleccionada)) 
                  ? styles.fixedDisabledButton 
                  : (isExpensesSelected ? styles.fixedExpenseButton : styles.fixedIncomeButton)
              ]} 
              onPress={handleGuardar}
              activeOpacity={0.8}
              disabled={isSaving || !valor_Titulo.trim() || !valor_Monto || (isExpensesSelected && !categoriaSeleccionada)}
            >
              {isSaving ? (
                <View style={styles.fixedLoadingContainer}>
                  <Text style={styles.fixedLoadingText}>Guardando...</Text>
                </View>
              ) : (
                <Text style={styles.fixedSaveButtonText}>
                  {isExpensesSelected ? 'Guardar Gasto' : 'Guardar Ingreso'}
                </Text>
              )}
            </TouchableOpacity>
          </>
        }
      >
        {/* Campo de título */}
        <ModernInputField
          label="¿En qué gastaste?"
          placeholder={isExpensesSelected ? "Ej: Supermercado, Uber, Gasolina..." : "Ej: Salario, Venta, Freelance..."}
          value={valor_Titulo}
          onChangeText={setValorTitulo}
          keyboardType="default"
        />

        {/* Campo de monto premium */}
        <OptimizedAmountInput
          value={valor_Monto}
          onChangeText={setValorMonto}
          isExpense={isExpensesSelected}
          placeholder="0"
        />

        {/* Grilla de categorías moderna */}
        {isExpensesSelected && (
          <ModernCategoryGrid
            categories={filteredData}
            selectedCategory={categoriaSeleccionada}
            onCategorySelect={handleCategorySelect}
            isExpense={true}
          />
        )}

        {/* Campo de detalle */}
        <ModernInputField
          label="Detalle adicional"
          placeholder="Agrega más detalles sobre esta transacción..."
          value={valor_Detalle}
          onChangeText={setValorDetalle}
          multiline={true}
          numberOfLines={3}
          isOptional={true}
        />

        {/* Mensajes de error */}
        {Object.keys(formErrors).length > 0 && (
          <View style={styles.errorContainer}>
            {Object.values(formErrors).map((error, index) => (
              <Text key={index} style={styles.errorText}>
                {error}
              </Text>
            ))}
          </View>
        )}

      </ScrollableTransactionForm>

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
  compactHeader: {
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: getSpacing(12),
    backgroundColor: Colors.background,
  },
  compactGreeting: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'left',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    ...getScrollContentSize(),
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: getBorderRadius(24),
    borderTopRightRadius: getBorderRadius(24),
    ...getModalSize(),
    width: '100%',
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    borderBottomWidth: 0,
    ...getShadowSize(10, 20, 0.3),
  },
  modalIndicator: {
    width: scaleSize(40),
    height: scaleSize(4),
    backgroundColor: Colors.border,
    borderRadius: scaleSize(2),
    alignSelf: 'center',
    marginTop: getSpacing(8),
    marginBottom: getSpacing(16),
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: getSpacing(24),
    paddingBottom: getSpacing(16),
    borderBottomWidth: getBorderWidth(1),
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: getTitleFontSize(24),
    fontWeight: '700',
    color: Colors.text,
    marginBottom: getSpacing(8),
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  detailInput: {
    width: '100%',
    padding: getSpacing(16),
    borderWidth: getBorderWidth(),
    borderColor: Colors.borderLight,
    borderRadius: getBorderRadius(),
    fontSize: getBodyFontSize(),
    backgroundColor: Colors.backgroundSecondary,
    color: Colors.text,
    marginBottom: getSpacing(20),
    textAlignVertical: 'top',
    minHeight: getMinHeight(60),
  },
  actionButtons: {
    flexDirection: 'row',
    gap: getGap(12),
    marginTop: getSpacing(8),
  },
  expenseButton: {
    backgroundColor: Colors.danger,
  },
  incomeButton: {
    backgroundColor: Colors.success,
  },
  inputContainer: {
    marginBottom: getSpacing(20),
  },
  input: {
    width: '100%',
    ...getInputSize(),
    borderColor: Colors.borderLight,
    borderWidth: getBorderWidth(),
    marginBottom: getSpacing(16),
    color: Colors.text,
    fontSize: getBodyFontSize(),
    borderRadius: getBorderRadius(),
    backgroundColor: Colors.backgroundSecondary,
  },
  picker: {
    ...getInputSize(),
    width: '100%',
    borderColor: Colors.primary,
    borderWidth: getBorderWidth(1),
    marginBottom: getSpacing(10),
    color: Colors.text,
    fontSize: getBodyFontSize(),
    borderRadius: scaleSize(5),
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: getSpacing(20),
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: getBodyFontSize(),
    fontWeight: 'bold',
    color: Colors.text,
    marginLeft: getSpacing(5),
  },
  selectedText: {
    color: Colors.primary,
  },
  icon: {
    marginRight: getSpacing(5),
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: getSpacing(16),
  },
  cancelButton: {
    flex: 1,
    ...getButtonSize(),
    borderRadius: getBorderRadius(),
    backgroundColor: Colors.backgroundCard,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(8),
    borderWidth: getBorderWidth(),
    borderColor: Colors.borderLight,
  },
  cancelButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 1,
    ...getButtonSize(),
    borderRadius: getBorderRadius(),
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadowSize(),
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.textDark,
  },
  debugContainer: {
    backgroundColor: Colors.backgroundSecondary,
    padding: getSpacing(12),
    marginHorizontal: getHorizontalPadding(),
    marginBottom: getSpacing(10),
    borderRadius: scaleSize(8),
    borderWidth: getBorderWidth(1),
    borderColor: Colors.border,
  },
  debugText: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    textAlign: 'center',
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    borderWidth: getBorderWidth(1),
    borderColor: Colors.danger,
    borderRadius: getBorderRadius(12),
    padding: getSpacing(16),
    marginBottom: getSpacing(16),
  },
  errorText: {
    fontSize: getBodyFontSize(),
    color: Colors.danger,
    fontWeight: '500',
    marginBottom: getSpacing(4),
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
  fixedLoadingContainer: {
    alignItems: 'center',
  },
  fixedLoadingText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.white,
  },
});