import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import { 
  scaleSize, 
  getBodyFontSize, 
  getTitleFontSize,
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getBorderWidth,
  // getMinWidth // Temporarily commented out
} from '../../../utils/scaling';

// Temporary local function to replace getMinWidth
const getMinWidth = (baseMinWidth = 80) => scaleSize(baseMinWidth);

const PremiumAmountInput = ({ value, onChangeText, isExpense, placeholder = "0" }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [displayValue, setDisplayValue] = useState(value || '');
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

  // Sincronizar displayValue con value
  useEffect(() => {
    setDisplayValue(value || '');
  }, [value]);

  const formatAmount = (text) => {
    // Remover caracteres no numéricos excepto punto y coma decimal
    const cleaned = text.replace(/[^0-9.,]/g, '');
    
    // Si hay tanto punto como coma, mantener solo la coma (formato argentino)
    if (cleaned.includes('.') && cleaned.includes(',')) {
      // Mantener solo la coma, eliminar puntos
      return cleaned.replace(/\./g, '');
    }
    
    // Si solo hay punto, convertir a coma (formato argentino)
    if (cleaned.includes('.') && !cleaned.includes(',')) {
      return cleaned.replace('.', ',');
    }
    
    // Evitar múltiples comas decimales
    const parts = cleaned.split(',');
    if (parts.length > 2) {
      return parts[0] + ',' + parts.slice(1).join('');
    }
    
    // Limitar a máximo 2 decimales
    if (parts.length === 2 && parts[1].length > 2) {
      return parts[0] + ',' + parts[1].substring(0, 2);
    }
    
    return cleaned;
  };

  const formatForDisplay = (value) => {
    if (!value || value === '') return '';
    
    // Convertir coma decimal a punto para parseFloat
    const normalized = value.replace(',', '.');
    const numValue = parseFloat(normalized);
    
    if (isNaN(numValue)) return value;
    
    // Formatear usando Intl.NumberFormat para formato argentino completo
    const formatted = new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(numValue);
    
    return formatted;
  };

  const parseFormattedValue = (formattedValue) => {
    if (!formattedValue) return '';
    
    // Remover puntos de miles y convertir coma decimal a punto
    const cleaned = formattedValue.replace(/\./g, '').replace(',', '.');
    
    return cleaned;
  };

  const handleTextChange = (text) => {
    // Solo limpiar caracteres no válidos, sin formatear
    const cleaned = formatAmount(text);
    setDisplayValue(cleaned);
    onChangeText(cleaned);
    
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
    
    // Formatear solo cuando se pierde el foco
    const formatted = formatForDisplay(displayValue);
    setDisplayValue(formatted);
    
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
            value={displayValue}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.3)"
            keyboardType="decimal-pad"
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
    marginBottom: getSpacing(32),
  },
  header: {
    marginBottom: getSpacing(16),
  },
  title: {
    fontSize: getTitleFontSize(18),
    fontWeight: '700',
    color: Colors.text,
  },
  inputContainer: {
    borderRadius: getBorderRadius(20),
    padding: getSpacing(24),
    borderWidth: getBorderWidth(2),
    ...getShadowSize(4, 8, 0.1),
    alignItems: 'center',
  },
  amountDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(16),
  },
  currencySymbol: {
    fontSize: scaleSize(32),
    fontWeight: '700',
    marginRight: getSpacing(12),
  },
  amountInput: {
    fontSize: scaleSize(32),
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 0,
    minWidth: getMinWidth(150),
  },
  hintText: {
    fontSize: scaleSize(14),
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});

export default PremiumAmountInput;
