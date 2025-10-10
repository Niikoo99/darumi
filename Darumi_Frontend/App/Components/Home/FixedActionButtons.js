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
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
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
    gap: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: Colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  saveButton: {
    flex: 1,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    paddingVertical: 18,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    shadowOpacity: 0.1,
    elevation: 2,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingSpinner: {
    width: 16,
    height: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: Colors.white,
    borderRadius: 8,
    // La animación se manejará con Animated.loop en el componente padre
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
});

export default FixedActionButtons;
