import React from 'react';
import { Image, Text, StyleSheet, View, ScrollView, TouchableOpacity, TextInput, Button, Alert } from 'react-native';
import { BlurView } from 'expo-blur';

import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../../utils/firebase-config';
import Navigation from '../../navigations/Navigation';
const uri = 'https://img.myloview.com/canvas-prints/daruma-doll-and-sakura-flower-seamless-pattern-background-700-225728352.jpg';


function LoginScreen()
{
    const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const handleCreateAccount = () => {
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Account created!')
            const user = userCredential.user;
            console.log(user)
        })
        .catch(error => {
            console.log(error)
            Alert.alert(error.message)
        })
    }

    const handleSignIn = () => {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Signed in!')
            const user = userCredential.user;
            console.log(user)
        })
        .catch(error => {
            console.log(error)
        })
    }

    return (
        <View style={styles.container}>
        <Image source={{ uri }} style={[styles.image, StyleSheet.absoluteFill]} />
        <ScrollView contentContainerStyle= {{
            flex: 1,
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }} >
            <BlurView intensity={100}>
            <View style={styles.login}>
                <View>
                <Text style={{paddingTop:100, fontSize: 17, fontWeight: '400', color: 'black'}}>E-mail</Text>
                <TextInput onChangeText={(text) => setEmail(text)} style={styles.input} placeholder='yourusername@example.com'/>
                </View>
                <View>
                <Text style={{paddingTop:20, fontSize: 17, fontWeight: '400', color: 'black'}}>Password</Text>
                <TextInput onChangeText={(text) => setPassword(text)} style={styles.input} placeholder='your password' secureTextEntry={true}/>
                </View>
                <TouchableOpacity onPress={handleSignIn} style={[styles.button, {backgroundColor: '#00000090'}]} >
                <Text style={{fontSize: 17, fontWeight: '400', color: 'black'}}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreateAccount} style={[styles.button, {backgroundColor: '#000000'}]}>
                <Text style={{fontSize: 17, fontWeight: '400', color: 'white'}}>Create Account</Text>
                </TouchableOpacity>
            </View>
            </BlurView>
            
        </ScrollView>
        </View>
    );
}

export default function Login() {
     const [email, setEmail] = React.useState('')
    const [password, setPassword] = React.useState('')

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    const handleCreateAccount = () => {
        createUserWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Account created!')
            const user = userCredential.user;
            console.log(user)
        })
        .catch(error => {
            console.log(error)
            Alert.alert(error.message)
        })
    }

    const handleSignIn = () => {
        signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            console.log('Signed in!')
            const user = userCredential.user;
            console.log(user)
        })
        .catch(error => {
            console.log(error)
        })
    }

    return (
        <View style={styles.container}>
        <Image source={{ uri }} style={[styles.image, StyleSheet.absoluteFill]} />
        <ScrollView contentContainerStyle= {{
            flex: 1,
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
        }} >
            <BlurView intensity={100}>
            <View style={styles.login}>
                <View>
                <Text style={{paddingTop:100, fontSize: 17, fontWeight: '400', color: 'black'}}>E-mail</Text>
                <TextInput onChangeText={(text) => setEmail(text)} style={styles.input} placeholder='yourusername@example.com'/>
                </View>
                <View>
                <Text style={{paddingTop:20, fontSize: 17, fontWeight: '400', color: 'black'}}>Password</Text>
                <TextInput onChangeText={(text) => setPassword(text)} style={styles.input} placeholder='your password' secureTextEntry={true}/>
                </View>
                <TouchableOpacity onPress={handleSignIn} style={[styles.button, {backgroundColor: '#00000090'}]} >
                <Text style={{fontSize: 17, fontWeight: '400', color: 'black'}}>Login</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCreateAccount} style={[styles.button, {backgroundColor: '#000000'}]}>
                <Text style={{fontSize: 17, fontWeight: '400', color: 'white'}}>Create Account</Text>
                </TouchableOpacity>
            </View>
            </BlurView>
            
        </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    login:{
      width: 350,
      height: 500,
      borderColor: '#000',
      borderWidth: 2,
      borderRadius: 10,
      alignItems: 'center',
    },
    input: {
      width: 250,
      height: 40,
      borderColor: '#000',
      borderWidth: 2,
      borderRadius: 10,
      padding: 10,
      marginVertical: 10,
      backgroundColor: '#00000090',
      marginBottom: 20,
    },
    button: {
      width: 250,
      height: 40,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 10,
      borderColor: '#000',
      borderWidth: 1,
    }
  
  });