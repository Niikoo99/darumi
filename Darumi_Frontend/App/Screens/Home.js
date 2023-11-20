import { View, Text, Button, Modal, TextInput, StyleSheet } from 'react-native';
import React, { useState, useEffect  } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import Header from '../Components/Home/Header';
import MonthInfo from '../Components/Home/MonthInfo';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';

export default function Home() {
  
  const { isLoaded, signOut } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [data, setData] = useState('');

  useEffect(() => {
    axios.get('http://192.168.1.132:3000/api/data')
      .then(response => {
        setData(response.data.message);
        console.log(response.data.message);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);  

  const handleGuardarGasto = () => {
    // Aquí puedes manejar la lógica para guardar el gasto
    // Por ejemplo, enviar los datos a una API o almacenarlos localmente
    console.log('Categoría:', categoriaSeleccionada);
    console.log('Valor:', valor);
    // Lógica adicional para guardar el gasto
    // ...
    // Cerrar el modal después de guardar el gasto
    setCategoriaSeleccionada('');
    setModalVisible(false);
  };  

  return (
    <View style={{ padding: 20, marginTop: 25 }}>
      <Header />
      <MonthInfo/>
      <Button title="Agregar Gasto" onPress={() => setModalVisible(true)} />
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
            value={valor}
            onChangeText={(text) => setValor(text)}
            placeholderTextColor="#333" // Color del texto de placeholder
          />
          <TextInput
            style={styles.input}
            placeholder="Detalle"
            keyboardType="default"
            value={valor}
            onChangeText={(text) => setValor(text)}
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
            value={valor}
            onChangeText={(text) => setValor(text)}
            placeholderTextColor="#333" // Color del texto de placeholder
          />
          <View style={styles.buttonsContainer}>
            <Button title="Guardar" onPress={handleGuardarGasto} color="#007bff" />
            <Button title="Cancelar" onPress={() => setModalVisible(false)} color="#dc3545" />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff', // Fondo blanco para el modal
    padding: 20,
  },
  modalHeader: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 20,
    color: '#007bff', // Color del encabezado
  },
  picker: {
    height: 50,
    width: '80%',
    borderColor: '#007bff', // Color del borde del input
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#333', // Color del texto del input
  },
  input: {
    width: '80%',
    height: 40,
    borderColor: '#007bff', // Color del borde del input
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    color: '#333', // Color del texto del input
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    paddingTop: 20,
    marginTop: 20,
  },
});
