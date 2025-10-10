import { View, Text, Image } from 'react-native'
import React from 'react'
import { useUser } from '@clerk/clerk-expo'
import { Ionicons } from '@expo/vector-icons'; 

export default function Header() {
    const { isLoaded, isSignedIn, user } = useUser();
    if (!isLoaded || !isSignedIn) {
        return null;
    }
    // Este componente ahora está oculto porque el header se maneja directamente en Home.js
    return null;
}
