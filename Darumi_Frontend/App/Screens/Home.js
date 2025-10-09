import { View, Text, Button, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView, Animated  } from 'react-native';
import React, { useState, useEffect  } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      if (isSignedIn) {
        setLoading(true);
        try {
          // Fetch categories
          const categoriesResponse = await axios.get(`http://192.168.1.131:3000/categorias/`);
          setData(categoriesResponse.data);

          // Find the category with Nombre_categoria "Ingresos" and store its Id_categoria
          const ingresosCategory = categoriesResponse.data.find(category => category.Nombre_categoria === 'Ingresos');
          if (ingresosCategory) {
            setCategoriaIngresos(ingresosCategory.Id_categoria);
          }

          // Fetch transactions
          const transactionsResponse = await axios.get(`http://192.168.1.131:3000/gastos/`, { 
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

    fetchData();
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
      .post('http://192.168.1.131:3000/gastos', {
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
        const categoriesResponse = await axios.get(`http://192.168.1.131:3000/categorias/`);
        setData(categoriesResponse.data);

        // Find the category with Nombre_categoria "Ingresos" and store its Id_categoria
        const ingresosCategory = categoriesResponse.data.find(category => category.Nombre_categoria === 'Ingresos');
        if (ingresosCategory) {
          setCategoriaIngresos(ingresosCategory.Id_categoria);
        }

        // Fetch transactions
        const transactionsResponse = await axios.get(`http://192.168.1.131:3000/gastos/`, { 
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

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Balance Progress Card */}
        <BalanceProgressCard
          balance={financialData.balance}
          availableMoney={financialData.availableMoney}
          spentMoney={financialData.totalExpenses}
        />

        {/* Financial Summary Cards */}
        <FinancialSummaryCards
          expenses={financialData.totalExpenses}
          income={financialData.totalIncome}
          balance={financialData.balance}
        />

        {/* Quick Actions */}
        <QuickActions
          onAddExpense={handleQuickAddExpense}
          onAddIncome={handleQuickAddIncome}
        />

        {/* Category Chart */}
        <CategoryChart categories={categoryData} />

        {/* Enhanced Transaction List */}
        <EnhancedTransactionList
          transactions={transactions}
          onTransactionPress={(transaction) => console.log('Transaction pressed:', transaction)}
          onEditTransaction={handleEditItem}
        />
      </ScrollView>

      {/* Floating Add Button */}
      <FloatingAddButton
        onPress={openModal}
        isExpense={isExpensesSelected}
      />
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
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {isExpensesSelected ? 'Nuevo Gasto' : 'Nuevo Ingreso'}
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
              placeholderTextColor="#999"
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={editModalVisible}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Editar balance</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Titulo"
                keyboardType="default"
                value={editedTitle}
                onChangeText={(text) => setEditedTitle(text)}
                placeholderTextColor="#333" // Color del texto de placeholder                
              />
              <TextInput
                style={styles.input}
                placeholder="Detalle"
                keyboardType="default"
                value={editedDetail}
                onChangeText={(text) => setEditedDetail(text)}
                placeholderTextColor="#333" // Color del texto de placeholder
              />
              <TextInput
                style={styles.input}
                placeholder="Valor"
                keyboardType="numeric"
                value={editedAmount.toString()}
                onChangeText={(text) => setEditedAmount(text)}
                color={editedAmount > 0 ? "green" : "red"}
                placeholderTextColor="#333" // Color del texto de placeholder
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
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.15,
    shadowRadius: 40,
    elevation: 20,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  detailInput: {
    width: '100%',
    padding: 16,
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#1a1a1a',
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
    backgroundColor: '#dc3545',
  },
  incomeButton: {
    backgroundColor: '#28a745',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: '#27A9E1',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: '#333',
    fontSize: 16,
    borderRadius: 5,
  },
  picker: {
    height: 50,
    width: '100%',
    borderColor: '#27A9E1',
    borderWidth: 1,
    marginBottom: 10,
    color: '#333',
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
    color: '#333',
    marginLeft: 5,
  },
  selectedText: {
    color: '#27A9E1',
  },
  icon: {
    marginRight: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  
});
