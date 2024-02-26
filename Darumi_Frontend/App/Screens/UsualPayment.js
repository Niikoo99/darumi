import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 } from '@expo/vector-icons';

export default function UsualPayment() {
  const [payments, setPayments] = useState([
    { id: '1', name: 'Alquiler', amount: 1000, type: 'Pago' },
    { id: '2', name: 'Servicios', amount: 200, type: 'Pago' },
    { id: '3', name: 'Salario', amount: 2500, type: 'Ingreso' },
    // Agrega más pagos habituales según sea necesario
  ]);

  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');
  const [paymentType, setPaymentType] = useState('Pago'); // Default to 'Pago'

  const totalAmount = payments.reduce((total, payment) => {
    if (payment.type === 'Pago') {
      return total - payment.amount; // Subtract payment amount from total for expenses
    } else {
      return total + payment.amount; // Add payment amount to total for incomes
    }
  }, 0);

  const handleAddPayment = () => {
    if (newPaymentName && newPaymentAmount) {
      const newPayment = {
        id: Math.random().toString(),
        name: newPaymentName,
        amount: parseFloat(newPaymentAmount),
        type: paymentType,
      };
      setPayments([...payments, newPayment]);
      setNewPaymentName('');
      setNewPaymentAmount('');
    }
  };

  const handleRemovePayment = (id) => {
    const updatedPayments = payments.filter((payment) => payment.id !== id);
    setPayments(updatedPayments);
  };

  const totalAmountStyle = totalAmount >= 0 ? styles.totalAmountPositive : styles.totalAmountNegative;
  
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pagos Habituales</Text>
      <FlatList
        data={payments.filter(payment => payment.type === 'Pago')} // Filter payments by type
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.paymentItem}>
            <Text style={styles.paymentName}>{item.name}</Text>
            <Text style={styles.incomeAmount}>${Math.abs(item.amount)}</Text>            
            <TouchableOpacity onPress={() => handleRemovePayment(item.id)}>
              <FontAwesome5 name="trash-alt" size={20} color="black" />
            </TouchableOpacity>
          </View>
        )}
      />
      <Text style={styles.header}>Ingresos Habituales</Text>
      <FlatList
        data={payments.filter(payment => payment.type === 'Ingreso')} // Filter incomes by type
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.paymentItem}>
            <Text style={styles.paymentName}>{item.name}</Text>
            <Text style={styles.expenseAmount}>${Math.abs(item.amount)}</Text>            
            <TouchableOpacity onPress={() => handleRemovePayment(item.id)}>
              <FontAwesome5 name="trash-alt" size={20} color="black" />
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={[styles.totalAmount, totalAmountStyle]}>${totalAmount}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Nombre del pago"
        value={newPaymentName}
        onChangeText={(text) => setNewPaymentName(text)}
      />
      <TextInput
        style={styles.input}
        placeholder="Monto"
        keyboardType="numeric"
        value={newPaymentAmount}
        onChangeText={(text) => setNewPaymentAmount(text)}
      />
      <Picker
        selectedValue={paymentType}
        onValueChange={(value) => setPaymentType(value)}
        style={styles.input}
      >
        <Picker.Item label="Pago" value="Pago" />
        <Picker.Item label="Ingreso" value="Ingreso" />
      </Picker>
      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.addButton}
          onPress={handleAddPayment}
        >
          <FontAwesome5 name='balance-scale' size={20} color="white" style={styles.icon} />
          <Text style={styles.addButtonLabel}>Agregar</Text>
        </TouchableOpacity>      
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  paymentName: {
    fontSize: 16,
    color: '#333',
  },
  paymentAmount: {
    fontSize: 16,
    color: '#007bff',
  },
  deleteButton: {
    color: '#ff4500',
    fontSize: 14,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
  },
  totalAmountPositive: {
    color: 'green',
  },
  totalAmountNegative: {
    color: 'red',
  },
  input: {
    height: 40,
    borderColor: '#007bff',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    marginLeft: 20,
    marginRight: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',    
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
    width: '37%'
  },
  addButtonLabel: {
    fontSize: 20,
    fontWeight: 'bold',    
    color: 'white',
    marginLeft: 15,
  },
  icon: {
    marginRight: 5,
  },
  expenseAmount: {
    color: '#dc3545', // Dark red for expenses
  },
  incomeAmount: {
    color: '#28a745', // Dark green for incomes
  },
});