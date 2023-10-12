import { View, Text, Image } from 'react-native'
import React from 'react'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'; 

export default function Header() {
    const {isLoaded, isSignedIn, user} = useUser();
    if(!isLoaded||!isSignedIn)
    {
        return null
    }
  return (
    <View style= {{
        display:'flex', 
        flexDirection:'column',
        gap:7,
        alignItems:'center'
        }}>
        
        <View style= {{
            display:'flex', 
            flexDirection:'row',
            gap:7,
            justifyContent: 'space-between'
            }}>
            <Ionicons name="trophy-outline" 
                    size={30} 
                    color="black"
                    style={{padding:60}} /> 
            <Image source={{uri:user.imageUrl}}
                        style={{width:100, height:100, borderRadius:99}}/>
            <Ionicons   name="notifications-outline" 
                    size={30} 
                    color="black"
                    style={{padding:60}} />
        </View>

        <View style= {{
            display:'flex', 
            flexDirection:'row'
            }}>
            <View>
                <Text style={{fontSize:22, alignSelf:'center'}}>Bienvenido 👋</Text>
                <Text style={{
                    fontSize:24,
                    fontWeight:'bold'}}>{user.fullName}</Text>
            </View>
        </View>
    </View>
  )
}