import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';

const OptimizedAmountInput = ({ value, onChangeText, isExpense, placeholder = "0" }) => {
  const [isFocused, setIsFocused] = useState(false);

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
  };

  const getAmountColors = () => {
    if (isExpense) {
      return {
        textColor: Colors.danger,
        borderColor: isFocused ? Colors.danger : Colors.borderLight,
        backgroundColor: isFocused ? Colors.backgroundCard : Colors.backgroundSecondary,
        currencyColor: Colors.danger
      };
    } else {
      return {
        textColor: Colors.success,
        borderColor: isFocused ? Colors.success : Colors.borderLight,
        backgroundColor: isFocused ? Colors.backgroundCard : Colors.backgroundSecondary,
        currencyColor: Colors.success
      };
    }
  };

  const colors = getAmountColors();

  return (
    <View style={styles.container}>
      <View style={[
        styles.inputContainer,
        {
          borderColor: colors.borderColor,
          backgroundColor: colors.backgroundColor,
        }
      ]}>
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
          placeholderTextColor={Colors.textSecondary}
          keyboardType="numeric"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={10}
          returnKeyType="done"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    paddingVertical: 0,
  },
});

export default OptimizedAmountInput;
