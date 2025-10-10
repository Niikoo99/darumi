import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';

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
                size={16} 
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
              <FontAwesome5 name="times" size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.borderLight,
    borderRadius: 16,
    fontSize: 16,
    backgroundColor: Colors.backgroundSecondary,
    color: Colors.textDark,
  },
  suggestionContainer: {
    marginTop: 8,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 12,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  suggestionText: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  dismissButton: {
    padding: 8,
  },
});

export default IntelligentAutocomplete;
