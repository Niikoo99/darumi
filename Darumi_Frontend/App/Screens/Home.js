import { View, Text, Button, Modal, TextInput, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect  } from 'react';
import { ClerkProvider, SignedIn, SignedOut, useUser, useAuth } from '@clerk/clerk-react';
import Header from '../Components/Home/Header';
import MonthInfo from '../Components/Home/MonthInfo';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function Home() {
  
  const { isLoaded, signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [categoria, setCategoria] = useState('');
  const [valor_Detalle, setValorDetalle] = useState('');
  const [valor_Monto, setValorMonto] = useState('');
  const [valor_Titulo, setValorTitulo] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [data, setData] = useState('');
  const {isSignedIn, user} = useUser();
  const handleGuardarGasto = () => {
    console.log('Request Params:', {
      Monto_gasto: valor_Monto,
      Categoria_gasto: categoriaSeleccionada,
      Titulo_gasto: valor_Titulo,
      Detalle_gasto: valor_Detalle,
      Id_usuario: user.id,
    });

    axios
      .post('http://192.168.1.131:3000/gastos', {
        Monto_gasto: valor_Monto,
        Categoria_gasto: categoriaSeleccionada,
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

    console.log('Handle guardar gasto called');
  };

  return (
    
    <View style={styles.container}>
    <Header />
      <MonthInfo/>
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonLabel}>Agregar Gasto</Text>
     </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.modalContainer}>
          <Text style={styles.modalHeader}>Agregar Gasto</Text>
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
          <Picker
            selectedValue={categoriaSeleccionada}
            onValueChange={(itemValue) => setCategoriaSeleccionada(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Seleccione una categoría" value="" />
            <Picker.Item label="Comida" value="Comida" />
            <Picker.Item label="Transporte" value="Transporte" />
            <Picker.Item label="Entretenimiento" value="Entretenimiento" />
            {/* Agrega más categorías según sea necesario */}
          </Picker>
          <TextInput
            style={styles.input}
            placeholder="Valor"
            keyboardType="numeric"
            value={valor_Monto}
            onChangeText={(text) => setValorMonto(text)}
            placeholderTextColor="#333" // Color del texto de placeholder
          />
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleGuardarGasto}>
              <Text style={styles.saveButtonText}>Guardar</Text>
            </TouchableOpacity>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  modalHeader: {
    fontSize: 28, // Increased font size for emphasis
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#27A9E1', // Changed header color to match the theme
  },
  picker: {
    height: 50,
    width: '80%', // Adjusted width for slightly wider input fields
    borderColor: '#27A9E1',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#333',
    fontSize: 16, // Increased font size for better readability
    borderRadius: 5, // Added border radius for rounded corners
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#27A9E1',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#333',
    fontSize: 16,
    borderRadius: 5,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    paddingTop: 20,
    marginTop: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100, // Adjust as needed to make space for the button
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#27A9E1', // Changed the background color to match the login screen
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: '#dc3545',
    borderRadius: 10, // Increased border radius for a rounder button
    paddingVertical: 10,
    paddingHorizontal: 20, // Added horizontal padding for better spacing
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#007bff',
    borderRadius: 10, // Increased border radius for a rounder button
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginLeft: 20, // Added margin between the buttons
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
