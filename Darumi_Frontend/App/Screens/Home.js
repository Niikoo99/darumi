import { View, Text, Button, Modal, TextInput, StyleSheet} from 'react-native';
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
    
    <View style={{ padding: 20, marginTop: 25 }}>
    <Header />
      <MonthInfo />
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
