import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import { 
  scaleSize, 
  getBodyFontSize, 
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getBorderWidth,
  getIconSize
} from '../../../utils/scaling';

const IntelligentAutocomplete = ({ 
  value, 
  onChangeText, 
  placeholder = "¿En qué gastaste?", 
  categories = [],
  onSuggestionAccept 
}) => {
  const [suggestion, setSuggestion] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  // Base de datos de palabras clave para autocompletado
  const keywordMapping = {
    'supermercado': { category: 'Comida/Restaurante', icon: 'utensils' },
    'comida': { category: 'Comida/Restaurante', icon: 'utensils' },
    'restaurante': { category: 'Comida/Restaurante', icon: 'utensils' },
    'uber': { category: 'Transporte', icon: 'car' },
    'taxi': { category: 'Transporte', icon: 'car' },
    'transporte': { category: 'Transporte', icon: 'car' },
    'gasolina': { category: 'Combustibles', icon: 'gas-pump' },
    'combustible': { category: 'Combustibles', icon: 'gas-pump' },
    'gas': { category: 'Combustibles', icon: 'gas-pump' },
    'ropa': { category: 'Vestimenta/Calzado', icon: 'tshirt' },
    'vestimenta': { category: 'Vestimenta/Calzado', icon: 'tshirt' },
    'calzado': { category: 'Vestimenta/Calzado', icon: 'tshirt' },
    'reparacion': { category: 'Mecanica', icon: 'wrench' },
    'mecanica': { category: 'Mecanica', icon: 'wrench' },
    'taller': { category: 'Mecanica', icon: 'wrench' },
    'electrodomestico': { category: 'Electrodomestico', icon: 'home' },
    'electrodomesticos': { category: 'Electrodomestico', icon: 'home' },
    'salario': { category: 'Ingresos', icon: 'money-bill-wave' },
    'sueldo': { category: 'Ingresos', icon: 'money-bill-wave' },
    'ingreso': { category: 'Ingresos', icon: 'money-bill-wave' },
  };

  useEffect(() => {
    if (value && value.length > 2) {
      const lowerValue = value.toLowerCase();
      
      // Buscar coincidencias en las palabras clave
      for (const [keyword, mapping] of Object.entries(keywordMapping)) {
        if (lowerValue.includes(keyword)) {
          // Buscar la categoría correspondiente en la lista de categorías
          const category = categories.find(cat => cat.Nombre_categoria === mapping.category);
          if (category) {
            setSuggestion({
              categoryId: category.Id_categoria,
              categoryName: mapping.category,
              icon: mapping.icon,
              keyword: keyword
            });
            
            // Animar la aparición de la sugerencia
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 200,
              useNativeDriver: true,
            }).start();
            return;
          }
        }
      }
    }
    
    // Si no hay coincidencias, ocultar sugerencia
    if (suggestion) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setSuggestion(null);
      });
    }
  }, [value, categories]);

  const handleSuggestionAccept = () => {
    if (suggestion && onSuggestionAccept) {
      onSuggestionAccept(suggestion.categoryId);
    }
  };

  const handleSuggestionDismiss = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSuggestion(null);
    });
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        autoCapitalize="none"
        returnKeyType="next"
      />
      
      {suggestion && (
        <Animated.View 
          style={[
            styles.suggestionContainer,
            { opacity: fadeAnim }
          ]}
        >
          <TouchableOpacity 
            style={styles.suggestion}
            onPress={handleSuggestionAccept}
            activeOpacity={0.7}
          >
            <View style={styles.suggestionIcon}>
              <FontAwesome5 
                name={suggestion.icon} 
                size={getIconSize(16)} 
                color="white" 
              />
            </View>
            <View style={styles.suggestionText}>
              <Text style={styles.suggestionTitle}>
                Sugerencia: {suggestion.categoryName}
              </Text>
              <Text style={styles.suggestionSubtitle}>
                Basado en "{suggestion.keyword}"
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleSuggestionDismiss}
              style={styles.dismissButton}
            >
              <FontAwesome5 name="times" size={getIconSize(14)} color={Colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: getSpacing(20),
  },
  input: {
    width: '100%',
    padding: getSpacing(16),
    borderWidth: getBorderWidth(2),
    borderColor: Colors.borderLight,
    borderRadius: getBorderRadius(16),
    fontSize: getBodyFontSize(),
    backgroundColor: Colors.backgroundSecondary,
    color: Colors.textDark,
  },
  suggestionContainer: {
    marginTop: getSpacing(8),
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(2),
    borderColor: Colors.border,
    borderRadius: getBorderRadius(12),
    padding: getSpacing(12),
    ...getShadowSize(2, 3.84, 0.1),
  },
  suggestionIcon: {
    width: getIconSize(32),
    height: getIconSize(32),
    borderRadius: getBorderRadius(16),
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(12),
  },
  suggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(2),
  },
  suggestionSubtitle: {
    fontSize: scaleSize(12),
    color: Colors.textSecondary,
  },
  dismissButton: {
    padding: getSpacing(8),
  },
});

export default IntelligentAutocomplete;
