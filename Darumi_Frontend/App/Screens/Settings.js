import { View, Text, Button } from 'react-native'
import React from 'react'

export default function Settings() {
  return (
    <View>
      <Text>Settings</Text>
      <Button title='SignOut'
                onPress={() =>signOut()}></Button>
    </View>
  )
}