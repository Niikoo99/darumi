import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Animated,
  Dimensions 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';

const { width: screenWidth } = Dimensions.get('window');

const ModernCategoryGrid = ({ categories, selectedCategory, onCategorySelect, isExpense }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

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

  // Mapeo de categorías a iconos y emojis
  const categoryConfig = {
    'Varios': { icon: 'ellipsis-h', emoji: '📦', color: '#a55eea' },
    'Comida/Restaurante': { icon: 'utensils', emoji: '🍽️', color: '#ff6b6b' },
    'Transporte': { icon: 'car', emoji: '🚗', color: '#4ecdc4' },
    'Mecanica': { icon: 'wrench', emoji: '🔧', color: '#feca57' },
    'Combustibles': { icon: 'gas-pump', emoji: '⛽', color: '#45b7d1' },
    'Vestimenta/Calzado': { icon: 'tshirt', emoji: '👕', color: '#96ceb4' },
    'Electrodomestico': { icon: 'home', emoji: '🏠', color: '#ff9ff3' },
    'Ingresos': { icon: 'money-bill-wave', emoji: '💰', color: '#28a745' }
  };

  // Dividir categorías en principales y adicionales
  const mainCategories = categories.slice(0, 6);
  const additionalCategories = categories.slice(6);

  const getCategoryColors = (isSelected, categoryName) => {
    const config = categoryConfig[categoryName] || categoryConfig['Varios'];
    
    if (isExpense) {
      return {
        backgroundColor: isSelected ? Colors.danger : Colors.backgroundSecondary,
        textColor: isSelected ? Colors.white : Colors.text,
        iconColor: isSelected ? Colors.white : config.color,
        borderColor: isSelected ? Colors.danger : 'rgba(255, 255, 255, 0.1)',
        shadowColor: isSelected ? Colors.danger : Colors.shadow,
      };
    } else {
      return {
        backgroundColor: isSelected ? Colors.success : Colors.backgroundSecondary,
        textColor: isSelected ? Colors.white : Colors.text,
        iconColor: isSelected ? Colors.white : config.color,
        borderColor: isSelected ? Colors.success : 'rgba(255, 255, 255, 0.1)',
        shadowColor: isSelected ? Colors.success : Colors.shadow,
      };
    }
  };

  const CategoryItem = ({ category, isHorizontal = false, onPress }) => {
    const isSelected = selectedCategory === category.Id_categoria;
    const colors = getCategoryColors(isSelected, category.Nombre_categoria);
    const config = categoryConfig[category.Nombre_categoria] || categoryConfig['Varios'];
    
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
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
      
      onPress(category.Id_categoria);
    };

    return (
      <Animated.View
        style={[
          isHorizontal ? styles.categoryItemHorizontal : styles.categoryItem,
          {
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            {
              backgroundColor: colors.backgroundColor,
              borderColor: colors.borderColor,
              borderWidth: 2,
              shadowColor: colors.shadowColor,
            }
          ]}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={[
            styles.iconContainer,
            { 
              backgroundColor: colors.iconColor === Colors.white 
                ? 'rgba(255,255,255,0.3)' 
                : `${colors.iconColor}20` 
            }
          ]}>
            <Text style={styles.emojiIcon}>{config.emoji}</Text>
          </View>
          <Text style={[
            styles.categoryName,
            { color: colors.textColor }
          ]}>
            {category.Nombre_categoria.split('/')[0]}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
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
        <Text style={styles.title}>🏷️ Selecciona una categoría</Text>
      </View>

      {/* Grilla principal */}
      <View style={styles.mainGrid}>
        {mainCategories.map((category) => (
          <CategoryItem
            key={category.Id_categoria}
            category={category}
            onPress={onCategorySelect}
          />
        ))}
      </View>

      {/* Scroll horizontal para categorías adicionales */}
      {additionalCategories.length > 0 && (
        <View style={styles.additionalSection}>
          <Text style={styles.additionalTitle}>Más categorías</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
            decelerationRate="fast"
            snapToInterval={120}
            snapToAlignment="start"
          >
            {additionalCategories.map((category) => (
              <CategoryItem
                key={category.Id_categoria}
                category={category}
                isHorizontal={true}
                onPress={onCategorySelect}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  mainGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  categoryItem: {
    width: '30%',
    marginBottom: 16,
  },
  categoryItemHorizontal: {
    marginRight: 12,
    minWidth: 100,
  },
  categoryButton: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: 100,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emojiIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 14,
  },
  additionalSection: {
    marginTop: 8,
  },
  additionalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  horizontalScroll: {
    paddingRight: 24,
  },
});

export default ModernCategoryGrid;
