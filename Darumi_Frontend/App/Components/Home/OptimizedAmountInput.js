import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';

const PremiumAmountInput = ({ value, onChangeText, isExpense, placeholder = "0" }) => {
  const [isFocused, setIsFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const formatAmount = (text) => {
    // Remover caracteres no numéricos excepto punto decimal
    const cleaned = text.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return parts[0] + '.' + parts.slice(1).join('');
    }
    
    return cleaned;
  };

  const handleTextChange = (text) => {
    const formatted = formatAmount(text);
    onChangeText(formatted);
    
    // Animación de pulso al escribir
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.05,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getAmountColors = () => {
    if (isExpense) {
      return {
        textColor: Colors.danger,
        borderColor: isFocused ? Colors.danger : 'rgba(255, 255, 255, 0.1)',
        backgroundColor: isFocused ? 'rgba(220, 53, 69, 0.1)' : Colors.backgroundSecondary,
        currencyColor: Colors.danger,
        shadowColor: isFocused ? Colors.danger : Colors.shadow,
      };
    } else {
      return {
        textColor: Colors.success,
        borderColor: isFocused ? Colors.success : 'rgba(255, 255, 255, 0.1)',
        backgroundColor: isFocused ? 'rgba(40, 167, 69, 0.1)' : Colors.backgroundSecondary,
        currencyColor: Colors.success,
        shadowColor: isFocused ? Colors.success : Colors.shadow,
      };
    }
  };

  const colors = getAmountColors();

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

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
      <View style={styles.header}>
        <Text style={styles.title}>💰 Monto</Text>
      </View>
      
      <Animated.View 
        style={[
          styles.inputContainer,
          {
            borderColor: colors.borderColor,
            backgroundColor: colors.backgroundColor,
            shadowColor: colors.shadowColor,
            transform: [{ scale: pulseAnim }],
          }
        ]}
      >
        <View style={styles.amountDisplay}>
          <Text style={[styles.currencySymbol, { color: colors.currencyColor }]}>
            $
          </Text>
          <TextInput
            style={[
              styles.amountInput,
              { color: colors.textColor }
            ]}
            value={value}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            keyboardType="numeric"
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={10}
            returnKeyType="done"
            textAlign="center"
            selectTextOnFocus={true}
          />
        </View>
        <Text style={styles.hintText}>
          {isFocused ? 'Ingresa el monto' : 'Toca para ingresar el monto'}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },
  inputContainer: {
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  currencySymbol: {
    fontSize: 32,
    fontWeight: '700',
    marginRight: 12,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 0,
    minWidth: 150,
  },
  hintText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default PremiumAmountInput;
