import { ClerkProvider, SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { View, Image, Text, FlatList, StyleSheet } from 'react-native'
import Colors from '../../../assets/shared/Colors'
import app from './../../../assets/images/darumi.png'
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
      console.log('Consultando gastos del mes actual')
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

  const styles = StyleSheet.create({
    appImage:{
        width:40,
        height:40,
        objectFit:'contain',
        marginTop:5
    },
    heading:{
        fontSize:20,
        fontWeight:'bold',
        color:Colors.canary

    }
})

  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
        {currentMonth} {currentYear}
      </Text>
      
      <FlatList
        style={{ marginBottom: 25, marginTop: 15, alignContent: 'left', width: '90%', height: '55%' }}
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ fontSize: 14, fontWeight: 'semibold', marginBottom: 5, marginTop: 5, display: 'flex' }}>
            <Image source={app}
                    style={{width:50, height:50, borderRadius:99}}/>
                    
            <Text style={{fontSize: 20, fontWeight: 'bold'}}>
              {item.Titulo_gasto} - ${item.Monto_gasto}
            </Text>
            <Text style={{fontSize: 16, fontWeight: 'semibold'}}>
              - {item.Detalle_gasto} -
            </Text>
            <Text style={{fontSize: 14, fontWeight: 'semibold', color: '#000'}}>
              {item.Nombre_categoria}
            </Text>
          </View>
        )}
      />
    </View>
  );
}