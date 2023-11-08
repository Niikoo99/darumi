import { View, Text, Button } from 'react-native'
import { useAuth } from '@clerk/clerk-expo';
import React from 'react'

export default function Settings() {
    const { isLoaded,signOut } = useAuth();
  return (
    <View>
      <Text>Settings</Text>
      <Button title='SignOut'
                onPress={() =>signOut()}></Button>
    </View>
  )
}