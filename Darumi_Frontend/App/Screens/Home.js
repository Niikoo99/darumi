import { View, Text, Button, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView  } from 'react-native';
import React, { useState, useEffect  } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-react';
import Header from '../Components/Home/Header';
import MonthInfo from '../Components/Home/MonthInfo';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const {isSignedIn, user} = useUser();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDetail, setEditedDetail] = useState('');
  const [editedAmount, setEditedAmount] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (isSignedIn) {
        setLoading(true);
        try {
          const response = await axios.get(`http://192.168.1.131:3000/categorias/`);
          setData(response.data);

          // Find the category with Nombre_categoria "Ingresos" and store its Id_categoria
          const ingresosCategory = response.data.find(category => category.Nombre_categoria === 'Ingresos');
          if (ingresosCategory) {
            setCategoriaIngresos(ingresosCategory.Id_categoria);
          }

          console.log(categoriaIngresos);
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
      })
      .catch((error) => {
        console.error(error);
      });

    console.log('Handle guardar called');
  };

  const handleToggleSwitch = () => {
    setIsExpensesSelected(!isExpensesSelected); // Toggle between expenses and income
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
      <MonthInfo onEditItem={handleEditItem}/>
      <TouchableOpacity style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <FontAwesome5 name='balance-scale' size={20} color="white" style={styles.icon} />
        <Text style={styles.addButtonLabel}>Agregar</Text>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Agregar balance</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Titulo"
                keyboardType="default"
                value={valor_Titulo}
                onChangeText={(text) => setValorTitulo(text)}
                placeholderTextColor="#333" // Color del texto de placeholder
              />
              <TextInput
                style={styles.input}
                placeholder="Detalle"
                keyboardType="default"
                value={valor_Detalle}
                onChangeText={(text) => setValorDetalle(text)}
                placeholderTextColor="#333" // Color del texto de placeholder
              />
              {isExpensesSelected && data && data.length > 0 ? (
                <Picker
                  selectedValue={categoriaSeleccionada}
                  onValueChange={(itemValue) => setCategoriaSeleccionada(itemValue)}
                  style={styles.picker}
                  renderItem={renderItem}
                >
                  {filteredData.map((item) => (
                    <Picker.Item label={item.Nombre_categoria} value={item.Id_categoria} key={item.Id_categoria} />
                  ))}
                </Picker>
              ) : null}
              <View style={styles.switchContainer}>
              <TouchableOpacity onPress={handleToggleSwitch} style={[styles.switchButton, isExpensesSelected ? styles.selectedSwitch : null]}>
                <FontAwesome5 name="money-bill-wave" size={20} color="#333" style={styles.icon} />
                <Text style={[styles.switchText, isExpensesSelected ? styles.selectedText : null]}>Gasto</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleToggleSwitch} style={[styles.switchButton, !isExpensesSelected ? styles.selectedSwitch : null]}>
                <FontAwesome5 name="money-bill-alt" size={20} color="#333" style={styles.icon} />
                <Text style={[styles.switchText, !isExpensesSelected ? styles.selectedText : null]}>Ingreso</Text>
              </TouchableOpacity>
            </View>
              <TextInput
                style={styles.input}
                placeholder="Valor"
                keyboardType="numeric"
                value={valor_Monto}
                onChangeText={(text) => setValorMonto(text)}
                color={isExpensesSelected ? "red" : "green"}
                placeholderTextColor="#333" // Color del texto de placeholder
              />
            </View>      
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleGuardar}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
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
    alignItems: 'center',
    backgroundColor: '#F5F5F5', // Light gray background color
    paddingTop: 30, // Adjust as needed for status bar height
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '80%',
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#27A9E1',
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
    backgroundColor: '#dc3545',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Adjust as needed to make space for the button
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  addButton: {
    backgroundColor: '#27A9E1',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',    
  },
  addButtonLabel: {
    fontSize: 20,
    fontWeight: 'bold',    
    color: 'white',
    marginLeft: 15,
  },
});
