import { View, Text, Image } from 'react-native'
import React from 'react'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'; 

export default function Header() {
    const { isLoaded, isSignedIn, user } = useUser();
    if (!isLoaded || !isSignedIn) {
        return null;
    }
    return (
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingBottom: 10,
            backgroundColor:'#E0E0E0'
        }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 25, marginLeft: 20, marginTop: 10 }}>
                <Ionicons name="trophy-outline" size={24} color="black" />
                <Image
                    source={{ uri: user.imageUrl }}
                    style={{ width: 60, height: 60, borderRadius: 40, marginLeft: 10 }}
                />
            </View>
            <View style={{ alignItems: 'center', marginLeft: 30, marginRight: 20}}>
                <Text style={{ fontSize: 18, textAlign: 'right' }}>Bienvenido</Text>
                <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'right' }}>{user.fullName}</Text>
            </View>
        </View>
    )
}
