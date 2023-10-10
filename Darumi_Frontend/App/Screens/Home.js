import { View, Text, Button } from 'react-native'
import React from 'react'
import { useAuth } from '@clerk/clerk-expo';
import Header from '../Components/Home/Header';

export default function Home() {
    const { isLoaded,signOut } = useAuth();
  return (
    <View style={{padding:20, 
                  marginTop:25}}>
      <Header/>
        {/* <Button title='SignOut'
                onPress={() =>signOut()}></Button> */}
    </View>
  )
}