import React, { useEffect, useRef, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { View, Button, Dimensions, Text, TouchableOpacity, Animated, ActivityIndicator } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { useOAuth, useUser  } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from "../../hooks/warmUpBrowser";
import Colors from "../../assets/shared/Colors";
import { buildApiUrl } from "../../config/api";
import axios from 'axios';
import { 
  scaleSize, 
  getBodyFontSize, 
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getIconSize
} from '../../utils/scaling';
 
WebBrowser.maybeCompleteAuthSession();
 
const SignInWithOAuth = () => {
  // Warm up the android browser to improve UX
  // https://docs.expo.dev/guides/authentication/#improving-user-experience
  useWarmUpBrowser();
 
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const {isLoaded, isSignedIn, user} = useUser();
  
  // Estados para animaciones y carga
  const [isLoading, setIsLoading] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
 
  const onPress = React.useCallback(async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Animación de presión
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    
    try {
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow();
 
      if (createdSessionId) {
        setActive({ session: createdSessionId });
        
           
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  useEffect(() => {
    if (user) {
      console.log('🔐 Registrando usuario:', {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      });
      
      axios
        .post(buildApiUrl('/usuarios'), null, {
          params: {
            Apellido_usuario: user.lastName || '',
            Nombre_usuario: user.firstName || '',
            Identifier_usuario: user.id,
          },
        })
        .then((response) => {
          console.log('✅ Usuario registrado/actualizado:', response.data);
        })
        .catch((error) => {
          console.error('❌ Error registrando usuario:', error);
        });
    }
  }, [user]); // Add user as a dependency to the useEffect hook
 
  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <TouchableOpacity 
        onPress={onPress}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        disabled={isLoading}
        style={[
          styles.button,
          isPressed && styles.buttonPressed,
          isLoading && styles.buttonLoading
        ]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isPressed ? [Colors.primaryDark, Colors.canary] : Colors.gradientPrimary}
          style={styles.buttonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={Colors.night} />
              <Text style={[styles.buttonText, styles.loadingText]}>
                Iniciando sesión...
              </Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <FontAwesome5 
                name="google" 
                size={getIconSize(18)} 
                color={Colors.night} 
                style={styles.googleIcon}
              />
              <Text style={styles.buttonText}>
                Iniciar Sesión con Google
              </Text>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = {
  button: {
    width: Dimensions.get('window').width * 0.85,
    height: scaleSize(56),
    borderRadius: getBorderRadius(28),
    overflow: 'hidden',
    ...getShadowSize(),
  },
  buttonPressed: {
    transform: [{ scale: 0.98 }],
  },
  buttonLoading: {
    opacity: 0.8,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing(20),
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: getSpacing(12),
  },
  buttonText: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.night,
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: getSpacing(10),
  },
};

export default SignInWithOAuth;