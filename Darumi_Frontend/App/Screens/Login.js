import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import app from './../../assets/images/darumi.png'
import Colors from '../../assets/shared/Colors'
import SignInWithOAuth from '../Components/SignInWithOAuth'

export default function Login() {
  return (
    <View style={{alignItems:'center', backgroundColor:Colors.night}}>
        <Image source={app}
                    style={styles.appImage}/>
        <View style={{backgroundColor:Colors.mgreen,
                        padding:70,
                        alignItems:'center',
                        marginTop:-30}}>
            <Text style={styles.heading}>Darumi</Text>
            <Text style={styles.heading}>Ahorrar tiene su premio</Text>
            <SignInWithOAuth/>
        </View>
    </View>
  )
}

const styles = StyleSheet.create({
        appImage:{
            width:350,
            height:500,
            objectFit:'contain',
            marginTop:-50
        },
        heading:{
            fontSize:20,
            fontWeight:'bold',
            color:Colors.canary

        }
})