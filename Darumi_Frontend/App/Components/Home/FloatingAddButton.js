import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  scaleSize, 
  getBodyFontSize, 
  getBorderRadius, 
  getSpacing, 
  getShadowSize 
} from '../../../utils/scaling';

const FloatingAddButton = ({ onPress, isExpense = true }) => {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getButtonStyle = () => {
    if (isExpense) {
      return {
        backgroundColor: '#dc3545',
        shadowColor: '#dc3545',
      };
    }
    return {
      backgroundColor: '#28a745',
      shadowColor: '#28a745',
    };
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity
        style={[styles.button, getButtonStyle()]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <FontAwesome5 
          name={isExpense ? "minus" : "plus"} 
          size={scaleSize(24)} 
          color="white" 
        />
      </TouchableOpacity>
      
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {isExpense ? 'Gasto' : 'Ingreso'}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: scaleSize(30),
    right: scaleSize(30),
    alignItems: 'center',
    zIndex: 1000,
  },
  button: {
    width: scaleSize(64),
    height: scaleSize(64),
    borderRadius: scaleSize(32),
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadowSize(8, 16, 0.3),
  },
  labelContainer: {
    marginTop: getSpacing(8),
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(6),
    borderRadius: getBorderRadius(12),
  },
  label: {
    color: 'white',
    fontSize: scaleSize(12),
    fontWeight: '600',
  },
});

export default FloatingAddButton;
