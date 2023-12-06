import { View, Text } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Home from '../Screens/Home'
import Categories from '../Screens/Categories'
import Achievement from '../Screens/Achievement'
import UsualPayment from '../Screens/UsualPayment'
import Settings from '../Screens/Settings'
import { Icon } from 'react-native-elements'

const Tab=createBottomTabNavigator()
const screenOptions = (route, color) => {
  let iconName
  switch (route.name) {
      case "Home":
          iconName = "home-analytics"
          break;
      case "UsualPayment":
          iconName = "cash-check"
          break;
      case "Achievement":
          iconName = "trophy-outline"
          break;
      case "Categories":
          iconName = "shape-outline"
          break;
      case "Settings":
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

export default function TabNavigation() {
  return (
    <Tab.Navigator
            initialRouteName='Home'            
            screenOptions={({route }) => ({
                tabBarIcon: ({ color}) => screenOptions(route, color), 
                headerShown:false,
                inactiveTintColor: "#443e10",
                activeTintColor:"#c7af04"
            })}
        >
        <Tab.Screen name='Home' 
                    component={Home}
                    options={{ title: "Inicio" }}/>
        <Tab.Screen name='UsualPayment' 
                    component={UsualPayment}
                    options={{ title: "Pagos habituales"}}/>
        <Tab.Screen name='Categories' 
                    component={Categories}
                    options={{ title: "Categorías"}}/>
        <Tab.Screen name='Achievement' 
                    component={Achievement}
                    options={{ title: "Logros"}}/>
        <Tab.Screen name='Settings' 
                    component={Settings}
                    options={{ title: "Opciones"}}/>
    </Tab.Navigator>
  )
}