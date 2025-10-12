import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import {
  scaleSize,
  getIconSize,
  getSpacing,
  getBorderRadius,
  getShadowSize,
  getFloatingButtonSize,
} from '../../../utils/scaling';

const FloatingAddButton = ({ onPress, isExpense = true }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animación de entrada
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = () => {
    // Animación de pulsación
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

    // Animación de rotación del ícono
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      rotateAnim.setValue(0);
    });

    onPress();
  };

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { rotate: rotateInterpolate },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={[
          styles.button,
          isExpense ? styles.expenseButton : styles.incomeButton,
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <FontAwesome5
          name="plus"
          size={getIconSize(24)}
          color={Colors.textDark}
          solid
        />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? scaleSize(90) : scaleSize(80),
    right: scaleSize(20),
    zIndex: 1000,
  },
  button: {
    ...getFloatingButtonSize(),
    borderRadius: getBorderRadius(28),
    alignItems: 'center',
    justifyContent: 'center',
    ...getShadowSize(8, 32, 0.3),
  },
  expenseButton: {
    backgroundColor: Colors.danger,
    shadowColor: Colors.danger,
  },
  incomeButton: {
    backgroundColor: Colors.success,
    shadowColor: Colors.success,
  },
});

export default FloatingAddButton;
