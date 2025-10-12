import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigation from './TabNavigation';
import AllTransactions from '../Screens/AllTransactions';
import Colors from '../../assets/shared/Colors';
import { 
  getBorderRadius, 
  getShadowSize, 
  getBorderWidth 
} from '../../utils/scaling';

const Stack = createStackNavigator();

export default function StackNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        cardStyle: {
          backgroundColor: Colors.background,
        },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigation}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen 
        name="AllTransactions" 
        component={AllTransactions}
        options={{
          headerShown: false,
          presentation: 'card',
          cardStyle: {
            backgroundColor: Colors.background,
          },
        }}
      />
    </Stack.Navigator>
  );
}
