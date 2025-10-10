import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions 
} from 'react-native';
import Colors from '../../../assets/shared/Colors';
import { 
  scaleSize, 
  getBodyFontSize, 
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getBorderWidth,
  getGap,
  getIconSize
} from '../../../utils/scaling';

const { width: screenWidth } = Dimensions.get('window');

const FixedActionButtons = ({ 
  onCancel, 
  onSave, 
  isExpense, 
  isDisabled = false,
  isLoading = false 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSavePress = () => {
    if (isDisabled || isLoading) return;
    
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
    
    onSave();
  };

  const handleCancelPress = () => {
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
    
    onCancel();
  };

  const getButtonColors = () => {
    if (isExpense) {
      return {
        gradient: [Colors.danger, '#c82333'],
        shadowColor: Colors.danger,
        textColor: Colors.white,
      };
    } else {
      return {
        gradient: [Colors.success, '#20c997'],
        shadowColor: Colors.success,
        textColor: Colors.white,
      };
    }
  };

  const buttonColors = getButtonColors();

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        }
      ]}
    >
      {/* Fondo con gradiente simulado */}
      <View style={styles.gradientBackground} />
      
      <View style={styles.buttonsContainer}>
        {/* Botón Cancelar */}
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={handleCancelPress}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>

        {/* Botón Guardar */}
        <TouchableOpacity 
          style={[
            styles.saveButton,
            isDisabled && styles.disabledButton,
            { backgroundColor: isDisabled ? '#666' : buttonColors.gradient[0] }
          ]}
          onPress={handleSavePress}
          activeOpacity={0.8}
          disabled={isDisabled || isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Animated.View style={styles.loadingSpinner} />
              <Text style={styles.loadingText}>Guardando...</Text>
            </View>
          ) : (
            <Text style={[
              styles.saveButtonText,
              { color: buttonColors.textColor }
            ]}>
              {isExpense ? 'Guardar Gasto' : 'Guardar Ingreso'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: getSpacing(24),
    paddingTop: getSpacing(20),
    paddingBottom: getSpacing(32),
    zIndex: 100,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.background,
    opacity: 0.9,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: getGap(16),
  },
  cancelButton: {
    flex: 1,
    paddingVertical: getSpacing(18),
    paddingHorizontal: getSpacing(24),
    borderRadius: getBorderRadius(16),
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: getBorderWidth(2),
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...getShadowSize(2, 4, 0.1),
  },
  cancelButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveButton: {
    flex: 1,
    borderRadius: getBorderRadius(16),
    shadowColor: Colors.primary,
    ...getShadowSize(4, 8, 0.3),
    paddingVertical: getSpacing(18),
    paddingHorizontal: getSpacing(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getGap(8),
  },
  loadingSpinner: {
    width: getIconSize(16),
    height: getIconSize(16),
    borderWidth: getBorderWidth(2),
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: Colors.white,
    borderRadius: getBorderRadius(8),
    // La animación se manejará con Animated.loop en el componente padre
  },
  loadingText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.white,
  },
});

export default FixedActionButtons;
