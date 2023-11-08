import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Button } from 'react-native';

export default function UsualPayment() {
  const [payments, setPayments] = useState([
    { id: '1', name: 'Alquiler', amount: 1000 },
    { id: '2', name: 'Servicios', amount: 200 },
    // Agrega más pagos habituales según sea necesario
  ]);

  const [newPaymentName, setNewPaymentName] = useState('');
  const [newPaymentAmount, setNewPaymentAmount] = useState('');

  const totalAmount = payments.reduce((total, payment) => total + payment.amount, 0);

  const handleAddPayment = () => {
    if (newPaymentName && newPaymentAmount) {
      const newPayment = {
        id: Math.random().toString(),
        name: newPaymentName,
        amount: parseFloat(newPaymentAmount),
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

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pagos Habituales</Text>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.paymentItem}>
            <Text style={styles.paymentName}>{item.name}</Text>
            <Text style={styles.paymentAmount}>${item.amount}</Text>
            <TouchableOpacity onPress={() => handleRemovePayment(item.id)}>
              <Text style={styles.deleteButton}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Total:</Text>
        <Text style={styles.totalAmount}>${totalAmount}</Text>
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
      <Button title="Agregar Pago" onPress={handleAddPayment} />
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
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    elevation: 2,
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
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 18,
    color: '#007bff',
  },
  input: {
    height: 40,
    borderColor: '#007bff',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
});
