import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Settings from '../views/Settings'

const Stack = createStackNavigator()

export default function SettingsStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen
            name='settings'
            component={Settings}
            options={{title: "Opciones"}}
        />
    </Stack.Navigator>
  )
}