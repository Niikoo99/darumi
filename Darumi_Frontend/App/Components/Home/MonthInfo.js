import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { View, Text, FlatList } from 'react-native'
import React, { useState, useEffect  } from 'react';
import axios from 'axios';

export default function MonthInfo() {

  const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };
  const currentDate = new Date();
  const currentMonth = capitalizeFirstLetter(
    currentDate.toLocaleString('default', { month: 'long' })
  ); // Obtiene el nombre del mes actual
  const currentYear = currentDate.getFullYear(); // Obtiene el año actual
  const [data, setData] = useState([]);

  const {isLoaded, isSignedIn, user} = useUser();
    if(!isLoaded||!isSignedIn)
    {
        return null
    }

  // Muestra los gastos del mes actual para todos los usuarios, cambiar por el usuario logueado con logintoken
  useEffect(() => {
    if (user) {
      axios
        .get(`http://192.168.1.131:3000/gastos/`, { params: { Id_Usuario: user.id } })
        .then((response) => {
          setData(response.data);
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  }, [user]); // Depend on 'user' so the effect runs whenever 'user' changes

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        {currentMonth} {currentYear}
      </Text>
      
      <FlatList
        style={{ marginBottom: 25, marginTop: 15 }}
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Text style={{ fontSize: 14, fontWeight: 'semibold', marginBottom: 5, marginTop: 5 }}>
            Categoría: {item.Nombre_categoria} - Título: {item.Titulo_gasto} - Monto: ${item.Monto_gasto}
          </Text>
        )}
      />
    </View>
  );
}