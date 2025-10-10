// import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import Login from './App/Screens/Login';
import Colors from './assets/shared/Colors';
import SignInWithOAuth from './App/Components/SignInWithOAuth';
import TabNavigation from './App/Navigations/TabNavigation';

export default function App() {
  
  return (
    <ClerkProvider publishableKey={"pk_test_YXNzdXJpbmctYmxvd2Zpc2gtMzQuY2xlcmsuYWNjb3VudHMuZGV2JA"}>
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="transparent" translucent={true} />
        <SignedIn>          
          <NavigationContainer>
            <TabNavigation/>
          </NavigationContainer>
        </SignedIn>
        <SignedOut>
          <Login/>
        </SignedOut>        
      </SafeAreaView>
    </ClerkProvider> 
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: StatusBar.currentHeight
  },
});
