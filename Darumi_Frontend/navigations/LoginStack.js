import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Login from '../views/account/Login'

const Stack = createStackNavigator()

export default function LoginStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen
            name='login'
            component={Login}
            options={{title: "Inicio"}}
        />
    </Stack.Navigator>
  )
}