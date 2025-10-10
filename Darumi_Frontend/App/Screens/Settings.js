import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Animated } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import React, { useRef, useEffect } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';

// Import the app logo
import appLogo from './../../assets/images/darumi.png';
import { 
  scaleSize, 
  scaleFont, 
  getHorizontalPadding, 
  getVerticalPadding, 
  getTitleFontSize, 
  getBodyFontSize, 
  getSmallFontSize, 
  getBorderRadius, 
  getIconSize, 
  getSpacing, 
  getButtonSize, 
  getCardSize, 
  getHeaderSize, 
  getIconContainerSize, 
  getShadowSize, 
  getBorderWidth, 
  getGap, 
  getMinWidth, 
  getMaxWidth 
} from '../../utils/scaling';

export default function Settings() {
    const { isLoaded, signOut } = useAuth();
    
    // Animaciones
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;
    const logoAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Animación de entrada
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.timing(logoAnim, {
                toValue: 1,
                duration: 1200,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSignOut = () => {
        Animated.timing(fadeAnim, {
            toValue: 0.5,
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            signOut();
        });
    };

    const settingsOptions = [
        {
            id: 'profile',
            title: 'Perfil',
            subtitle: 'Gestiona tu información personal',
            icon: 'user',
            color: Colors.primary,
        },
        {
            id: 'notifications',
            title: 'Notificaciones',
            subtitle: 'Configura las alertas de la app',
            icon: 'bell',
            color: Colors.warning,
        },
        {
            id: 'privacy',
            title: 'Privacidad',
            subtitle: 'Controla tu privacidad y seguridad',
            icon: 'shield-alt',
            color: Colors.success,
        },
        {
            id: 'backup',
            title: 'Respaldo',
            subtitle: 'Respalda y restaura tus datos',
            icon: 'cloud-upload-alt',
            color: '#2196F3',
        },
        {
            id: 'help',
            title: 'Ayuda',
            subtitle: 'Centro de ayuda y soporte',
            icon: 'question-circle',
            color: '#9C27B0',
        },
    ];

    const renderSettingOption = ({ item }) => (
        <Animated.View
            style={[
                styles.settingCard,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: fadeAnim,
                },
            ]}
        >
            <TouchableOpacity style={styles.settingContent} activeOpacity={0.8}>
                <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                    <FontAwesome5 name={item.icon} size={20} color={item.color} />
                </View>
                <View style={styles.settingInfo}>
                    <Text style={styles.settingTitle}>{item.title}</Text>
                    <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                </View>
                <FontAwesome5 name="chevron-right" size={16} color={Colors.textSecondary} />
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <View style={styles.container}>
            {/* Header Gamificado */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>⚙️ Configuración</Text>
                <Text style={styles.headerSubtitle}>Personaliza tu experiencia</Text>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Logo y Info de la App */}
                    <Animated.View
                        style={[
                            styles.logoSection,
                            {
                                transform: [{ scale: logoAnim }],
                                opacity: logoAnim,
                            },
                        ]}
                    >
                        <Image source={appLogo} style={styles.logo} />
                        <Text style={styles.appName}>Darumi</Text>
                        <Text style={styles.appVersion}>Versión 1.0.0</Text>
                        <Text style={styles.appDescription}>
                            Tu compañero inteligente para el control financiero personal.
                            Gestiona tus gastos, ahorra dinero y alcanza tus objetivos financieros.
                        </Text>
                    </Animated.View>

                    {/* Opciones de Configuración */}
                    <View style={styles.settingsSection}>
                        <Text style={styles.sectionTitle}>Configuración</Text>
                        {settingsOptions.map((option) => (
                            <Animated.View
                                key={option.id}
                                style={[
                                    styles.settingCard,
                                    {
                                        transform: [{ scale: scaleAnim }],
                                        opacity: fadeAnim,
                                    },
                                ]}
                            >
                                <TouchableOpacity style={styles.settingContent} activeOpacity={0.8}>
                                    <View style={[styles.iconContainer, { backgroundColor: `${option.color}20` }]}>
                                        <FontAwesome5 name={option.icon} size={20} color={option.color} />
                                    </View>
                                    <View style={styles.settingInfo}>
                                        <Text style={styles.settingTitle}>{option.title}</Text>
                                        <Text style={styles.settingSubtitle}>{option.subtitle}</Text>
                                    </View>
                                    <FontAwesome5 name="chevron-right" size={16} color={Colors.textSecondary} />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Estadísticas de la App */}
                    <View style={styles.statsSection}>
                        <Text style={styles.sectionTitle}>Estadísticas</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statNumber}>45</Text>
                                <Text style={styles.statLabel}>Días usando</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statNumber}>127</Text>
                                <Text style={styles.statLabel}>Transacciones</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statNumber}>8</Text>
                                <Text style={styles.statLabel}>Objetivos</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statNumber}>1,250</Text>
                                <Text style={styles.statLabel}>Puntos</Text>
                            </View>
                        </View>
                    </View>

                    {/* Botón de Cerrar Sesión */}
                    <Animated.View
                        style={[
                            styles.signOutSection,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: fadeAnim,
                            },
                        ]}
                    >
                        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                            <FontAwesome5 name="sign-out-alt" size={20} color={Colors.white} />
                            <Text style={styles.signOutText}>Cerrar Sesión</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        backgroundColor: Colors.primary,
        ...getHeaderSize(),
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: getTitleFontSize(),
        fontWeight: '800',
        color: Colors.textDark,
        marginBottom: getSpacing(8),
    },
    headerSubtitle: {
        fontSize: getBodyFontSize(),
        color: Colors.textDark,
        opacity: 0.8,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: getHorizontalPadding(),
    },
    logoSection: {
        alignItems: 'center',
        backgroundColor: Colors.backgroundCard,
        borderWidth: getBorderWidth(),
        borderColor: Colors.primary,
        borderRadius: getBorderRadius(20),
        padding: getSpacing(30),
        marginBottom: getSpacing(24),
    },
    logo: {
        width: scaleSize(120),
        height: scaleSize(120),
        marginBottom: getSpacing(16),
    },
    appName: {
        fontSize: getTitleFontSize(32),
        fontWeight: '800',
        color: Colors.primary,
        marginBottom: getSpacing(8),
    },
    appVersion: {
        fontSize: getBodyFontSize(),
        color: Colors.textSecondary,
        marginBottom: getSpacing(16),
    },
    appDescription: {
        fontSize: getBodyFontSize(),
        color: Colors.textSecondary,
        textAlign: 'center',
        lineHeight: scaleSize(20),
    },
    settingsSection: {
        marginBottom: getSpacing(24),
    },
    sectionTitle: {
        fontSize: getTitleFontSize(20),
        fontWeight: '600',
        color: Colors.primary,
        marginBottom: getSpacing(16),
    },
    settingCard: {
        backgroundColor: Colors.backgroundCard,
        borderWidth: getBorderWidth(),
        borderColor: Colors.border,
        borderRadius: getBorderRadius(),
        marginBottom: getSpacing(12),
        overflow: 'hidden',
    },
    settingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: getSpacing(20),
    },
    iconContainer: {
        ...getIconContainerSize(50),
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: getSpacing(16),
    },
    settingInfo: {
        flex: 1,
    },
    settingTitle: {
        fontSize: getTitleFontSize(18),
        fontWeight: '600',
        color: Colors.text,
        marginBottom: getSpacing(4),
    },
    settingSubtitle: {
        fontSize: getBodyFontSize(),
        color: Colors.textSecondary,
    },
    statsSection: {
        marginBottom: getSpacing(24),
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        backgroundColor: Colors.backgroundCard,
        borderWidth: getBorderWidth(),
        borderColor: Colors.border,
        borderRadius: getBorderRadius(),
        padding: getSpacing(20),
        alignItems: 'center',
        width: '48%',
        marginBottom: getSpacing(12),
    },
    statNumber: {
        fontSize: getTitleFontSize(24),
        fontWeight: '700',
        color: Colors.primary,
        marginBottom: getSpacing(4),
    },
    statLabel: {
        fontSize: getSmallFontSize(),
        color: Colors.textSecondary,
        textAlign: 'center',
    },
    signOutSection: {
        marginTop: getSpacing(20),
    },
    signOutButton: {
        backgroundColor: Colors.danger,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        ...getButtonSize(),
        borderRadius: getBorderRadius(),
        gap: getGap(8),
    },
    signOutText: {
        fontSize: getBodyFontSize(),
        fontWeight: '600',
        color: Colors.white,
    },
});
