import { View, Text, Image, StyleSheet, Dimensions, TouchableOpacity, ScrollView, Animated } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons'
import app from './../../assets/images/darumi.png'
import Colors from '../../assets/shared/Colors'
import SignInWithOAuth from '../Components/SignInWithOAuth'
import { 
  scaleSize, 
  scaleFont, 
  getHorizontalPadding, 
  getVerticalPadding, 
  getTitleFontSize, 
  getBodyFontSize, 
  getBorderRadius, 
  getSpacing, 
  getButtonSize, 
  getCardSize, 
  getShadowSize, 
  getBorderWidth,
  getIconSize
} from '../../utils/scaling'

export default function Login() {
  const [currentBenefit, setCurrentBenefit] = useState(0)
  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const scaleAnim = useRef(new Animated.Value(0.9)).current

  const benefits = [
    {
      icon: 'chart-line',
      title: 'Entiende tus finanzas',
      description: 'Visualiza tus gastos y ingresos de forma clara'
    },
    {
      icon: 'bullseye',
      title: 'Alcanza tus metas',
      description: 'Define objetivos de ahorro y sigue tu progreso'
    },
    {
      icon: 'wallet',
      title: 'Registra fácilmente',
      description: 'Agrega transacciones con solo unos toques'
    }
  ]

  useEffect(() => {
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()

    // Carrusel automático de beneficios
    const interval = setInterval(() => {
      setCurrentBenefit((prev) => (prev + 1) % benefits.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <LinearGradient
      colors={Colors.gradientBackground}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.contentContainer,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}
        >
          {/* Logo y título */}
          <View style={styles.headerSection}>
            <Image source={app} style={styles.appImage} />
            <Text style={styles.heading}>Darumi</Text>
            <Text style={styles.subheading}>Ahorrar tiene su premio</Text>
          </View>

          {/* Carrusel de beneficios */}
          <View style={styles.benefitsSection}>
            <View style={styles.benefitCard}>
              <FontAwesome5 
                name={benefits[currentBenefit].icon} 
                size={getIconSize(40)} 
                color={Colors.canary} 
                style={styles.benefitIcon}
              />
              <Text style={styles.benefitTitle}>{benefits[currentBenefit].title}</Text>
              <Text style={styles.benefitDescription}>{benefits[currentBenefit].description}</Text>
            </View>
            
            {/* Indicadores del carrusel */}
            <View style={styles.carouselIndicators}>
              {benefits.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.indicator,
                    index === currentBenefit && styles.activeIndicator
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Botón de inicio de sesión */}
          <View style={styles.loginSection}>
            <SignInWithOAuth />
          </View>

          {/* Enlaces legales */}
          <View style={styles.legalSection}>
            <TouchableOpacity style={styles.legalLink}>
              <Text style={styles.legalText}>Política de Privacidad</Text>
            </TouchableOpacity>
            <Text style={styles.legalSeparator}>•</Text>
            <TouchableOpacity style={styles.legalLink}>
              <Text style={styles.legalText}>Términos y Condiciones</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: getVerticalPadding(40),
  },
  contentContainer: {
    alignItems: 'center',
    width: '100%',
  },
  
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginBottom: getSpacing(40),
  },
  appImage: {
    width: scaleSize(180),
    height: scaleSize(180),
    resizeMode: 'contain',
    marginBottom: getSpacing(20),
  },
  heading: {
    fontSize: getTitleFontSize(36),
    fontWeight: 'bold',
    color: Colors.canary,
    marginBottom: getSpacing(8),
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subheading: {
    fontSize: getBodyFontSize(18),
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 0.5,
  },

  // Benefits Section
  benefitsSection: {
    width: '100%',
    marginBottom: getSpacing(40),
  },
  benefitCard: {
    backgroundColor: Colors.backgroundCard,
    paddingVertical: getVerticalPadding(30),
    paddingHorizontal: getHorizontalPadding(20),
    borderRadius: getBorderRadius(20),
    alignItems: 'center',
    borderWidth: getBorderWidth(1),
    borderColor: Colors.border,
    ...getShadowSize(),
    marginBottom: getSpacing(20),
  },
  benefitIcon: {
    marginBottom: getSpacing(15),
  },
  benefitTitle: {
    fontSize: getTitleFontSize(20),
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: getSpacing(8),
  },
  benefitDescription: {
    fontSize: getBodyFontSize(14),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: scaleSize(8),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    backgroundColor: Colors.textSecondary,
    marginHorizontal: scaleSize(4),
    opacity: 0.4,
  },
  activeIndicator: {
    backgroundColor: Colors.canary,
    opacity: 1,
    width: scaleSize(12),
    height: scaleSize(8),
    borderRadius: scaleSize(4),
  },

  // Login Section
  loginSection: {
    width: '100%',
    marginBottom: getSpacing(30),
  },

  // Legal Section
  legalSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  legalLink: {
    paddingVertical: getVerticalPadding(8),
    paddingHorizontal: getHorizontalPadding(12),
  },
  legalText: {
    fontSize: getBodyFontSize(12),
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    fontSize: getBodyFontSize(12),
    color: Colors.textSecondary,
    marginHorizontal: getSpacing(8),
  },
});
