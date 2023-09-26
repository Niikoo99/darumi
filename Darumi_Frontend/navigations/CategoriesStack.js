import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'

import Categories from '../views/Categories'

const Stack = createStackNavigator()

export default function CategoriesStack() {
  return (
    <Stack.Navigator>
        <Stack.Screen
            name='categories'
            component={Categories}
            options={{tabBarShowLabel: false}}
        />
    </Stack.Navigator>
  )
}