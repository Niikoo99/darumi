import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Colors from '../../../assets/shared/Colors';

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
    borderRadius: 20,
    padding: 6,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: 'rgba(255, 233, 0, 0.3)',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  backgroundIndicator: {
    position: 'absolute',
    top: 6,
    left: 6,
    bottom: 6,
    width: '50%',
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    gap: 12,
    zIndex: 1,
  },
  activeOption: {
    // El fondo activo se maneja con el backgroundIndicator
  },
  toggleIcon: {
    fontSize: 20,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  activeText: {
    fontWeight: '700',
    color: Colors.white,
  },
});

export default SimpleTransactionToggle;
