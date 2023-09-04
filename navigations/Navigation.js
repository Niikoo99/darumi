import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

import DarumiStack from './DarumiStack'
import UsualPaymentsStack from './UsualPaymentsStack'
import CategoriesStack from './CategoriesStack'
import AchievementsStack from './AchievementsStack'
import SettingsStack from './SettingsStack'
import { Icon } from 'react-native-elements'


const Tab = createBottomTabNavigator()

export default function Navigation() {
    const screenOptions = (route, color) => {
        let iconName
        switch (route.name) {
            case "home":
                iconName = "home-analytics"
                break;
            case "usual-payments":
                iconName = "cash-check"
                break;
            case "achievements":
                iconName = "trophy-outline"
                break;
            case "categories":
                iconName = "shape-outline"
                break;
            case "settings":
                iconName = "cog-outline"
                break;
        }

        return (
            <Icon
                type='material-community'
                name={iconName}
                size={22}
                color={color}
            />
        )
    }
  return (
    <NavigationContainer>
        <Tab.Navigator
            initialRouteName='home'
            tabBarOptions= {{
                inactiveTintColor: "#443e10",
                activeTintColor:"#c7af04"
            }}
            screenOptions={({route }) => ({
                tabBarIcon: ({ color}) => screenOptions(route, color)
            })}
        >
            <Tab.Screen 
                name="home"
                component={DarumiStack}
                options={{ title: "Inicio" }}
            />
            <Tab.Screen 
                name="usual-payments"
                component={UsualPaymentsStack}
                options={{ title: "Pagos habituales"}}
            />
            <Tab.Screen 
                name="categories"
                component={CategoriesStack}
                options={{ title: "Categorías"}}
            />
            <Tab.Screen 
                name="achievements"
                component={AchievementsStack}
                options={{ title: "Logros"}}
            />
            <Tab.Screen 
                name="settings"
                component={SettingsStack}
                options={{ title: "Opciones"}}
            />
        </Tab.Navigator>
    </NavigationContainer>
  )
}