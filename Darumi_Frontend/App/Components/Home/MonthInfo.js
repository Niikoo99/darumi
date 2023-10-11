import { View, Text } from 'react-native'
import React from 'react'

export default function MonthInfo() {    
    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
      };
    const currentDate = new Date();
    const currentMonth = capitalizeFirstLetter(currentDate.toLocaleString('default', { month: 'long' })); // Obtiene el nombre del mes actual
    const currentYear = currentDate.getFullYear(); // Obtiene el año actual
  
  return (
    <View style={{marginTop:40}}>
        <View style={{alignItems:'center'}}>
            <Text style={{fontSize:20, fontWeight:'bold'}}>{currentMonth} {currentYear} </Text>
        </View>
    </View>
  )
}