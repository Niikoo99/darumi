import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import UsualPayments from '../views/UsualPayments'

const Stack = createStackNavigator()

export default function UsualPaymentsStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen
            name='usualPayments'
            component={UsualPayments}
            options={{title: "Pagos Habituales"}}
        />
    </Stack.Navigator>
  )
}