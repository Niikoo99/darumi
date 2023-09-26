import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Home from '../views/account/Home'

const Stack = createStackNavigator()

export default function DarumiStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen
            name='home'
            component={Home}
            options={{tabBarShowLabel: false}}
        />
    </Stack.Navigator>
  )
}