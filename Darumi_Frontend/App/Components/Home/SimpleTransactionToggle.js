import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
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

const SimpleTransactionToggle = ({ isExpense, onToggle }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = (expense) => {
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
    
    onToggle(expense);
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      {/* Indicador de fondo */}
      <View 
        style={[
          styles.backgroundIndicator,
          {
            backgroundColor: isExpense ? Colors.danger : Colors.success,
          }
        ]} 
      />
      
      <TouchableOpacity
        style={[
          styles.toggleOption,
          isExpense && styles.activeOption
        ]}
        onPress={() => handlePress(true)}
        activeOpacity={0.8}
      >
        <Text style={styles.toggleIcon}>💸</Text>
        <Text style={[
          styles.toggleText,
          isExpense && styles.activeText
        ]}>
          Gasto
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.toggleOption,
          !isExpense && styles.activeOption
        ]}
        onPress={() => handlePress(false)}
        activeOpacity={0.8}
      >
        <Text style={styles.toggleIcon}>💰</Text>
        <Text style={[
          styles.toggleText,
          !isExpense && styles.activeText
        ]}>
          Ingreso
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(20),
    padding: getSpacing(6),
    marginBottom: getSpacing(32),
    borderWidth: getBorderWidth(2),
    borderColor: 'rgba(255, 233, 0, 0.3)',
    ...getShadowSize(4, 8, 0.2),
    position: 'relative',
  },
  backgroundIndicator: {
    position: 'absolute',
    top: getSpacing(6),
    left: getSpacing(6),
    bottom: getSpacing(6),
    width: '50%',
    borderRadius: getBorderRadius(16),
    shadowColor: Colors.primary,
    ...getShadowSize(2, 4, 0.3),
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(20),
    borderRadius: getBorderRadius(16),
    gap: getGap(12),
    zIndex: 1,
  },
  activeOption: {
    // El fondo activo se maneja con el backgroundIndicator
  },
  toggleIcon: {
    fontSize: scaleSize(20),
  },
  toggleText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
  },
  activeText: {
    fontWeight: '700',
    color: Colors.white,
  },
});

export default SimpleTransactionToggle;
