import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Categories from '../views/Categories'
import Achievements from '../views/Achievements'

const Stack = createStackNavigator()

export default function AchievementsStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen
            name='achievements'
            component={Achievements}
            options={{title: "Logros"}}
        />
    </Stack.Navigator>
  )
}