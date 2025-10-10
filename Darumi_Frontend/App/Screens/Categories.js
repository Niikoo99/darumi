import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Animated } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';
import { buildApiUrl, getEndpoints } from '../../config/api';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import { formatCurrency } from '../../utils/formatting';
import { 
  scaleSize, 
  scaleFont, 
  getHorizontalPadding, 
  getVerticalPadding, 
  getTitleFontSize, 
  getBodyFontSize, 
  getSmallFontSize, 
  getBorderRadius, 
  getIconSize, 
  getSpacing, 
  getButtonSize, 
  getCardSize, 
  getHeaderSize, 
  getStatsBarSize, 
  getIconContainerSize, 
  getShadowSize, 
  getBorderWidth, 
  getGap, 
  getMinWidth, 
  getMaxWidth 
} from '../../utils/scaling';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { isSignedIn, user } = useUser();
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    fetchCategories();
    
    // Animación de entrada
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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

  const fetchCategories = async () => {
    if (isSignedIn) {
      try {
        const response = await axios.get(buildApiUrl(getEndpoints().CATEGORIES + '/'));
        setCategories(response.data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const getCategoryIcon = (categoryName) => {
    const iconMap = {
      'Alimentación': 'utensils',
      'Transporte': 'car',
      'Entretenimiento': 'gamepad',
      'Salud': 'heartbeat',
      'Educación': 'graduation-cap',
      'Ropa': 'tshirt',
      'Hogar': 'home',
      'Servicios': 'tools',
      'Ingresos': 'money-bill-wave',
      'Otros': 'ellipsis-h',
    };
    return iconMap[categoryName] || 'tag';
  };

  const getCategoryColor = (index) => {
    const colors = [
      Colors.primary,
      Colors.success,
      Colors.danger,
      Colors.warning,
      '#9C27B0',
      '#FF5722',
      '#2196F3',
      '#4CAF50',
      '#FF9800',
      '#E91E63',
    ];
    return colors[index % colors.length];
  };

  const renderCategoryCard = ({ item, index }) => {
    const iconName = getCategoryIcon(item.Nombre_categoria);
    const categoryColor = getCategoryColor(index);
    
    return (
      <Animated.View
        style={[
          styles.categoryCard,
          {
            borderColor: categoryColor,
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.categoryContent}
          onPress={() => setSelectedCategory(item)}
          activeOpacity={0.8}
        >
          <View style={[styles.iconContainer, { backgroundColor: `${categoryColor}20` }]}>
            <FontAwesome5 name={iconName} size={24} color={categoryColor} />
          </View>
          <Text style={styles.categoryName}>{item.Nombre_categoria}</Text>
          <Text style={styles.categoryId}>ID: {item.Id_categoria}</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando categorías...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Gamificado */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📂 Mis Categorías</Text>
        <Text style={styles.headerSubtitle}>Organiza tus gastos por categoría</Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>Categorías</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>8</Text>
          <Text style={styles.statLabel}>Activas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>2</Text>
          <Text style={styles.statLabel}>Nuevas</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>Todas las Categorías</Text>
          
          <FlatList
            data={categories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.Id_categoria.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.categoryRow}
            contentContainerStyle={styles.categoryGrid}
          />

          {/* Categoría Seleccionada */}
          {selectedCategory && (
            <Animated.View
              style={[
                styles.selectedCategoryCard,
                {
                  transform: [{ scale: scaleAnim }],
                  opacity: fadeAnim,
                },
              ]}
            >
              <View style={styles.selectedHeader}>
                <FontAwesome5 
                  name={getCategoryIcon(selectedCategory.Nombre_categoria)} 
                  size={32} 
                  color={Colors.primary} 
                />
                <Text style={styles.selectedTitle}>{selectedCategory.Nombre_categoria}</Text>
              </View>
              <Text style={styles.selectedDescription}>
                Esta categoría te ayuda a organizar tus gastos relacionados con {selectedCategory.Nombre_categoria.toLowerCase()}.
              </Text>
              <View style={styles.selectedStats}>
                <View style={styles.selectedStat}>
                  <Text style={styles.selectedStatNumber}>12</Text>
                  <Text style={styles.selectedStatLabel}>Transacciones</Text>
                </View>
                <View style={styles.selectedStat}>
                  <Text style={styles.selectedStatNumber}>{formatCurrency(2450)}</Text>
                  <Text style={styles.selectedStatLabel}>Total</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {/* Acciones Rápidas */}
          <View style={styles.quickActions}>
            <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5 name="plus" size={20} color={Colors.white} />
                <Text style={styles.actionButtonText}>Nueva Categoría</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome5 name="edit" size={20} color={Colors.white} />
                <Text style={styles.actionButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: getTitleFontSize(18),
    color: Colors.text,
    opacity: 0.7,
  },
  header: {
    backgroundColor: Colors.primary,
    ...getHeaderSize(),
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: getTitleFontSize(),
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: getSpacing(8),
  },
  headerSubtitle: {
    fontSize: getBodyFontSize(),
    color: Colors.textDark,
    opacity: 0.8,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    ...getStatsBarSize(),
    backgroundColor: Colors.backgroundSecondary,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: getTitleFontSize(18),
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: getSpacing(4),
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  statLabel: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: getHorizontalPadding(),
  },
  sectionTitle: {
    fontSize: getTitleFontSize(20),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: getSpacing(16),
  },
  categoryGrid: {
    paddingBottom: getSpacing(20),
  },
  categoryRow: {
    justifyContent: 'space-between',
    marginBottom: getSpacing(16),
  },
  categoryCard: {
    flex: 1,
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(),
    borderRadius: getBorderRadius(),
    marginHorizontal: getSpacing(8),
    overflow: 'hidden',
  },
  categoryContent: {
    padding: getSpacing(20),
    alignItems: 'center',
  },
  iconContainer: {
    ...getIconContainerSize(60),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(12),
  },
  categoryName: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: getSpacing(4),
  },
  categoryId: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
  },
  selectedCategoryCard: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(),
    borderColor: Colors.primary,
    borderRadius: getBorderRadius(),
    padding: getSpacing(20),
    marginTop: getSpacing(20),
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(16),
  },
  selectedTitle: {
    fontSize: getTitleFontSize(24),
    fontWeight: '700',
    color: Colors.primary,
    marginLeft: getSpacing(16),
  },
  selectedDescription: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    lineHeight: scaleSize(20),
    marginBottom: getSpacing(16),
  },
  selectedStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  selectedStat: {
    alignItems: 'center',
  },
  selectedStatNumber: {
    fontSize: getBodyFontSize(),
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: getSpacing(4),
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  selectedStatLabel: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
  },
  quickActions: {
    marginTop: getSpacing(32),
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    ...getButtonSize(),
    borderRadius: getBorderRadius(),
    flexDirection: 'row',
    alignItems: 'center',
    gap: getGap(8),
  },
  actionButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.textDark,
  },
});