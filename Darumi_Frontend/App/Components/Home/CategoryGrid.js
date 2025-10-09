import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const CategoryGrid = ({ categories, selectedCategory, onCategorySelect, isExpense }) => {
  // Mapeo de categorías a iconos
  const categoryIcons = {
    'Varios': 'ellipsis-h',
    'Comida/Restaurante': 'utensils',
    'Transporte': 'car',
    'Mecanica': 'wrench',
    'Combustibles': 'gas-pump',
    'Vestimenta/Calzado': 'tshirt',
    'Electrodomestico': 'home',
    'Ingresos': 'money-bill-wave'
  };

  // Colores dinámicos basados en tipo de transacción
  const getCategoryColors = (isSelected) => {
    if (isExpense) {
      return {
        backgroundColor: isSelected ? '#dc3545' : '#f8f9fa',
        textColor: isSelected ? 'white' : '#1a1a1a',
        iconColor: isSelected ? 'white' : '#dc3545',
        borderColor: isSelected ? '#dc3545' : 'transparent'
      };
    } else {
      return {
        backgroundColor: isSelected ? '#28a745' : '#f8f9fa',
        textColor: isSelected ? 'white' : '#1a1a1a',
        iconColor: isSelected ? 'white' : '#28a745',
        borderColor: isSelected ? '#28a745' : 'transparent'
      };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Categoría</Text>
      <View style={styles.grid}>
        {categories.map((category) => {
          const isSelected = selectedCategory === category.Id_categoria;
          const colors = getCategoryColors(isSelected);
          const iconName = categoryIcons[category.Nombre_categoria] || 'ellipsis-h';
          
          return (
            <TouchableOpacity
              key={category.Id_categoria}
              style={[
                styles.categoryItem,
                {
                  backgroundColor: colors.backgroundColor,
                  borderColor: colors.borderColor,
                  borderWidth: colors.borderColor !== 'transparent' ? 2 : 0
                }
              ]}
              onPress={() => onCategorySelect(category.Id_categoria)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: colors.iconColor === 'white' ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.1)' }
              ]}>
                <FontAwesome5 
                  name={iconName} 
                  size={16} 
                  color={colors.iconColor} 
                />
              </View>
              <Text style={[
                styles.categoryName,
                { color: colors.textColor }
              ]}>
                {category.Nombre_categoria.split('/')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default CategoryGrid;
