import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import Home from '../views/home'
import Achievements from '../views/Achievements'
import Categories from '../views/Categories'
import UsualPayments from '../views/UsualPayments'
import Settings from '../views/Settings'


const Tab = createBottomTabNavigator()

export default function Navigation() {
  return (
    <NavigationContainer>
        <Tab.Navigator>
            <Tab.Screen 
                name="home"
                component={Home}
                options={{ title: "Inicio" }}
            />
            <Tab.Screen 
                name="usual-payments"
                component={UsualPayments}
                options={{ title: "Pagos habituales"}}
            />
            <Tab.Screen 
                name="categories"
                component={Categories}
                options={{ title: "Categorías"}}
            />
            <Tab.Screen 
                name="achievements"
                component={Achievements}
                options={{ title: "Logros"}}
            />
            <Tab.Screen 
                name="settings"
                component={Settings}
                options={{ title: "Opciones"}}
            />
        </Tab.Navigator>
    </NavigationContainer>
  )
}