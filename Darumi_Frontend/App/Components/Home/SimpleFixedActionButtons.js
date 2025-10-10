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
  getGap
} from '../../../utils/scaling';

const { width: screenWidth } = Dimensions.get('window');

const SimpleFixedActionButtons = ({ 
  onCancel, 
  onSave, 
  isExpense, 
  isDisabled = false,
  isLoading = false 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
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
        backgroundColor: Colors.danger,
        shadowColor: Colors.danger,
        textColor: Colors.white,
      };
    } else {
      return {
        backgroundColor: Colors.success,
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
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
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
            { backgroundColor: isDisabled ? '#666' : buttonColors.backgroundColor }
          ]}
          onPress={handleSavePress}
          activeOpacity={0.8}
          disabled={isDisabled || isLoading}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
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
    backgroundColor: Colors.background,
    paddingHorizontal: getSpacing(24),
    paddingTop: getSpacing(20),
    paddingBottom: getSpacing(32),
    zIndex: 100,
    borderTopWidth: getBorderWidth(),
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
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
  loadingText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.white,
  },
});

export default SimpleFixedActionButtons;
