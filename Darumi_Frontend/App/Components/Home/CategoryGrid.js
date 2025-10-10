import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
        backgroundColor: isSelected ? Colors.danger : Colors.backgroundSecondary,
        textColor: isSelected ? Colors.white : Colors.text,
        iconColor: isSelected ? Colors.white : Colors.danger,
        borderColor: isSelected ? Colors.danger : Colors.borderLight
      };
    } else {
      return {
        backgroundColor: isSelected ? Colors.success : Colors.backgroundSecondary,
        textColor: isSelected ? Colors.white : Colors.text,
        iconColor: isSelected ? Colors.white : Colors.success,
        borderColor: isSelected ? Colors.success : Colors.borderLight
      };
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏷️ Categoría</Text>
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
                  borderWidth: 2
                }
              ]}
              onPress={() => onCategorySelect(category.Id_categoria)}
              activeOpacity={0.7}
            >
              <View style={[
                styles.iconContainer,
                { backgroundColor: colors.iconColor === Colors.white ? 'rgba(255,255,255,0.3)' : `${colors.iconColor}20` }
              ]}>
                <FontAwesome5 
                  name={iconName} 
                  size={getIconSize(16)} 
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
    marginBottom: getSpacing(24),
  },
  title: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(16),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryItem: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: getBorderRadius(16),
    padding: getSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(12),
    ...getShadowSize(2, 3.84, 0.1),
  },
  iconContainer: {
    width: getIconSize(32),
    height: getIconSize(32),
    borderRadius: getBorderRadius(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getSpacing(8),
  },
  categoryName: {
    fontSize: scaleSize(12),
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: scaleSize(14),
  },
});

export default CategoryGrid;
