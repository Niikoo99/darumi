import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import app from './../../assets/images/darumi.png'
import Colors from '../../assets/shared/Colors'
import SignInWithOAuth from '../Components/SignInWithOAuth'

export default function Login() {
  return (
    <View style={styles.container}>
      <Image source={app} style={styles.appImage} />
      <View style={styles.contentContainer}>
        <Text style={styles.heading}>Darumi</Text>
        <Text style={styles.subheading}>Ahorrar tiene su premio</Text>
        <SignInWithOAuth style={styles.signInButton} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // Center content vertically
    backgroundColor: Colors.night,
    paddingTop: 50, // Adjust as needed for status bar height
  },
  contentContainer: {
    backgroundColor: '#F5F5DC',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 30,
    borderRadius: 10,
  },
  appImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    marginBottom: 20, // Adjust margin bottom to create space between image and content
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 18,
    color: 'black',
    marginBottom: 20,
  },
  signInButton: {
    // Apply custom styles for your sign-in button
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
});
