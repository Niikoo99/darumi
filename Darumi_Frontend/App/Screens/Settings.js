import { View, Text, Button, Image, StyleSheet } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import React from 'react';

// Import the app logo
import appLogo from './../../assets/images/darumi.png';

export default function Settings() {
    const { isLoaded, signOut } = useAuth();
    return (
        <View style={styles.container}>
            <View style={styles.upperSection}>
                <Text style={styles.header}>Configuración</Text>
                <Button title='Cerrar sesión' onPress={() => signOut()} style={styles.signOutButton} />
            </View>
            <Image source={appLogo} style={styles.logo} />
            <View style={styles.lowerSection}>
                <Text style={styles.header}>Acerca de</Text>
                <Text style={styles.aboutText}>
                  Acá va a estar la info de la app, pero todavia no tenemos el texto
                  así que lo mejor que puedo ofrecer es este placeholder
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    upperSection: {
        position: 'absolute',
        top: 40,
        paddingHorizontal: 20,
    },
    lowerSection: {
        marginTop: 20,
        alignItems: 'center',
    },
    logo: {
        width: 150,
        height: 150,
        marginBottom: 20,
    },
    header: {
        fontSize: 24,
        marginBottom: 20,
    },
    signOutButton: {
        borderRadius: 10,
        backgroundColor: '#007bff', // Blue color for the button
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    aboutText: {
        textAlign: 'center',
        marginHorizontal: 20,
        fontSize: 16,
    },
});
