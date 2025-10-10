import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { FontAwesome5 } from '@expo/vector-icons'
import Home from '../Screens/Home'
import Categories from '../Screens/Categories'
import Achievement from '../Screens/Achievement'
import UsualPayment from '../Screens/UsualPayment'
import Settings from '../Screens/Settings'
import Colors from '../../assets/shared/Colors'

const Tab = createBottomTabNavigator()

const screenOptions = (route, color, focused) => {
  let iconName
  let iconSize = focused ? 24 : 20
  
  switch (route.name) {
      case "Home":
          iconName = "home"
          break;
      case "UsualPayment":
          iconName = "credit-card"
          break;
      case "Achievement":
          iconName = "trophy"
          break;
      case "Categories":
          iconName = "folder"
          break;
      case "Settings":
          iconName = "cog"
          break;
  }

  return (
      <FontAwesome5
          name={iconName}
          size={iconSize}
          color={color}
          solid={focused}
      />
  )
}

export default function TabNavigation() {
  return (
    <Tab.Navigator
      initialRouteName='Home'            
      screenOptions={({ route, focused }) => ({
        tabBarIcon: ({ color }) => screenOptions(route, color, focused), 
        headerShown: false,
        inactiveTintColor: Colors.textSecondary,
        activeTintColor: Colors.primary,
        tabBarStyle: {
          backgroundColor: Colors.backgroundSecondary,
          borderTopColor: Colors.border,
          borderTopWidth: 2,
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
          shadowColor: Colors.shadow,
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          marginHorizontal: 4,
          marginVertical: 4,
        },
      })}
    >
      <Tab.Screen 
        name='Home' 
        component={Home}
        options={{ 
          title: "Inicio",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.activeIconContainer
            ]}>
              <FontAwesome5
                name="home"
                size={focused ? 24 : 20}
                color={focused ? Colors.textDark : color}
                solid={focused}
              />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name='UsualPayment' 
        component={UsualPayment}
        options={{ 
          title: "Pagos",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.activeIconContainer
            ]}>
              <FontAwesome5
                name="credit-card"
                size={focused ? 24 : 20}
                color={focused ? Colors.textDark : color}
                solid={focused}
              />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name='Achievement' 
        component={Achievement}
        options={{ 
          title: "Logros",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.activeIconContainer
            ]}>
              <FontAwesome5
                name="trophy"
                size={focused ? 24 : 20}
                color={focused ? Colors.textDark : color}
                solid={focused}
              />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name='Categories' 
        component={Categories}
        options={{ 
          title: "Categorías",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.activeIconContainer
            ]}>
              <FontAwesome5
                name="folder"
                size={focused ? 24 : 20}
                color={focused ? Colors.textDark : color}
                solid={focused}
              />
            </View>
          )
        }}
      />
      <Tab.Screen 
        name='Settings' 
        component={Settings}
        options={{ 
          title: "Config",
          tabBarIcon: ({ color, focused }) => (
            <View style={[
              styles.iconContainer,
              focused && styles.activeIconContainer
            ]}>
              <FontAwesome5
                name="cog"
                size={focused ? 24 : 20}
                color={focused ? Colors.textDark : color}
                solid={focused}
              />
            </View>
          )
        }}
      />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  activeIconContainer: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
})