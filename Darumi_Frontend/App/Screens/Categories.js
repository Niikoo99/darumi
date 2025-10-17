import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Animated, Modal, TextInput, Alert } from 'react-native';
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
  getMaxWidth,
  getFloatingButtonSize,
  getModalSize,
  getInputSize
} from '../../utils/scaling';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editCategoryName, setEditCategoryName] = useState('');
  const { isSignedIn, user } = useUser();
  
  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const fabScaleAnim = useRef(new Animated.Value(0)).current;

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
      Animated.spring(fabScaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay: 300,
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

  // Filtrar categorías por búsqueda
  const filteredCategories = categories.filter(category =>
    category.Nombre_categoria.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Funciones para manejar categorías
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    try {
      const response = await axios.post(buildApiUrl(getEndpoints().CATEGORIES + '/'), {
        Nombre_categoria: newCategoryName.trim()
      });
      
      setCategories([...categories, response.data]);
      setNewCategoryName('');
      setShowAddModal(false);
      Alert.alert('Éxito', 'Categoría creada exitosamente');
    } catch (error) {
      console.error('Error adding category:', error);
      
      if (error.response?.status === 400) {
        Alert.alert('Error', error.response.data.error || 'Datos inválidos');
      } else if (error.response?.status === 409) {
        Alert.alert('Error', 'Ya existe una categoría con ese nombre');
      } else {
        Alert.alert('Error', 'No se pudo crear la categoría. Inténtalo de nuevo.');
      }
    }
  };

  const handleEditCategory = async () => {
    if (!editCategoryName.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para la categoría');
      return;
    }

    try {
      const response = await axios.put(buildApiUrl(getEndpoints().CATEGORIES + '/' + editingCategory.Id_categoria), {
        Nombre_categoria: editCategoryName.trim()
      });
      
      setCategories(categories.map(cat => 
        cat.Id_categoria === editingCategory.Id_categoria 
          ? response.data
          : cat
      ));
      setEditCategoryName('');
      setEditingCategory(null);
      setShowEditModal(false);
      Alert.alert('Éxito', 'Categoría actualizada exitosamente');
    } catch (error) {
      console.error('Error updating category:', error);
      
      if (error.response?.status === 400) {
        Alert.alert('Error', error.response.data.error || 'Datos inválidos');
      } else if (error.response?.status === 404) {
        Alert.alert('Error', 'La categoría no fue encontrada');
      } else if (error.response?.status === 409) {
        Alert.alert('Error', 'Ya existe una categoría con ese nombre');
      } else {
        Alert.alert('Error', 'No se pudo actualizar la categoría. Inténtalo de nuevo.');
      }
    }
  };

  const handleDeleteCategory = (category) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro de que quieres eliminar la categoría "${category.Nombre_categoria}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await axios.delete(buildApiUrl(getEndpoints().CATEGORIES + '/' + category.Id_categoria));
              setCategories(categories.filter(cat => cat.Id_categoria !== category.Id_categoria));
              Alert.alert('Éxito', 'Categoría eliminada exitosamente');
            } catch (error) {
              console.error('Error deleting category:', error);
              
              // Manejar diferentes tipos de errores
              if (error.response?.status === 400) {
                const errorMessage = error.response.data.error;
                const usageCount = error.response.data.usageCount;
                Alert.alert(
                  'No se puede eliminar', 
                  `${errorMessage}. Esta categoría tiene ${usageCount} transacción(es) asociada(s).`
                );
              } else if (error.response?.status === 404) {
                Alert.alert('Error', 'La categoría no fue encontrada');
              } else {
                Alert.alert('Error', 'No se pudo eliminar la categoría. Inténtalo de nuevo.');
              }
            }
          }
        }
      ]
    );
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.Nombre_categoria);
    setShowEditModal(true);
  };

  const renderCategoryCard = ({ item, index }) => {
    const iconName = getCategoryIcon(item.Nombre_categoria);
    const categoryColor = getCategoryColor(index);
    
    return (
      <Animated.View
        style={[
          styles.modernCategoryCard,
          {
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.cardContent}>
          {/* Left side - Icon and color indicator */}
          <View style={styles.cardLeft}>
            <View style={[styles.categoryIconContainer, { backgroundColor: `${categoryColor}20` }]}>
              <FontAwesome5 name={iconName} size={getIconSize(20)} color={categoryColor} />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{item.Nombre_categoria}</Text>
              <Text style={styles.categoryId}>ID: {item.Id_categoria}</Text>
            </View>
          </View>
          
          {/* Right side - Action buttons */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton]}
              onPress={() => openEditModal(item)}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="edit" size={getIconSize(14)} color={Colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDeleteCategory(item)}
              activeOpacity={0.7}
            >
              <FontAwesome5 name="trash" size={getIconSize(14)} color={Colors.danger} />
            </TouchableOpacity>
          </View>
        </View>
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
        <Text style={styles.headerTitle}>📂 Gestión de Categorías</Text>
        <Text style={styles.headerSubtitle}>Organiza y administra tus categorías</Text>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categories.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredCategories.length}</Text>
          <Text style={styles.statLabel}>Mostradas</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{categories.length - filteredCategories.length}</Text>
          <Text style={styles.statLabel}>Filtradas</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <FontAwesome5 name="search" size={getIconSize(16)} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar categorías..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Todas las Categorías'}
          </Text>
          
          <FlatList
            data={filteredCategories}
            renderItem={renderCategoryCard}
            keyExtractor={(item) => item.Id_categoria.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.categoriesList}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {filteredCategories.length === 0 && (
            <View style={styles.emptyState}>
              <FontAwesome5 name="search" size={getIconSize(48)} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>
                {searchQuery ? 'No se encontraron categorías' : 'No hay categorías disponibles'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {searchQuery ? 'Intenta con otro término de búsqueda' : 'Agrega tu primera categoría'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabScaleAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setShowAddModal(true)}
          activeOpacity={0.8}
        >
          <FontAwesome5 name="plus" size={getIconSize(24)} color={Colors.textDark} />
        </TouchableOpacity>
      </Animated.View>

      {/* Add Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>➕ Nueva Categoría</Text>
              <Text style={styles.modalSubtitle}>Crea una nueva categoría para organizar tus gastos</Text>
            </View>
            
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre de la categoría"
                placeholderTextColor={Colors.textSecondary}
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewCategoryName('');
                  }}
                >
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleAddCategory}
                >
                  <Text style={styles.modalConfirmButtonText}>Crear</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditModal}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalBackground}>
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>✏️ Editar Categoría</Text>
              <Text style={styles.modalSubtitle}>Modifica el nombre de la categoría</Text>
            </View>
            
            <View style={styles.modalContent}>
              <TextInput
                style={styles.modalInput}
                placeholder="Nombre de la categoría"
                placeholderTextColor={Colors.textSecondary}
                value={editCategoryName}
                onChangeText={setEditCategoryName}
                autoFocus={true}
              />
              
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={() => {
                    setShowEditModal(false);
                    setEditCategoryName('');
                    setEditingCategory(null);
                  }}
                >
                  <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalConfirmButton}
                  onPress={handleEditCategory}
                >
                  <Text style={styles.modalConfirmButtonText}>Guardar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  
  // Header Styles (matching UsualPayment and Achievement)
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
  
  // Search Bar Styles
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: getBorderRadius(12),
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderWidth: 1,
    borderColor: Colors.borderLight,
    marginHorizontal: getHorizontalPadding(),
    marginBottom: getSpacing(16),
  },
  searchIcon: {
    marginRight: getSpacing(12),
  },
  searchInput: {
    flex: 1,
    fontSize: getBodyFontSize(),
    color: Colors.text,
  },
  
  // Stats Bar Styles (matching UsualPayment and Achievement)
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
  
  // Scroll and Content Styles
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: getHorizontalPadding(),
    paddingBottom: getSpacing(100), // Space for FAB
  },
  sectionTitle: {
    fontSize: getTitleFontSize(20),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(16),
    marginTop: getSpacing(8),
  },
  
  // Modern Category Card Styles
  modernCategoryCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(16),
    borderWidth: 1,
    borderColor: Colors.borderLight,
    ...getShadowSize(2, 8, 0.1),
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: getSpacing(20),
  },
  cardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryIconContainer: {
    ...getIconContainerSize(48),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(16),
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(2),
  },
  categoryId: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
  },
  cardActions: {
    flexDirection: 'row',
    gap: getSpacing(8),
  },
  actionButton: {
    ...getIconContainerSize(36),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: getBorderRadius(8),
  },
  editButton: {
    backgroundColor: `${Colors.primary}20`,
  },
  deleteButton: {
    backgroundColor: `${Colors.danger}20`,
  },
  
  // List Styles
  categoriesList: {
    paddingBottom: getSpacing(20),
  },
  separator: {
    height: getSpacing(12),
  },
  
  // Empty State Styles
  emptyState: {
    alignItems: 'center',
    paddingVertical: getSpacing(40),
  },
  emptyStateText: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginTop: getSpacing(16),
    marginBottom: getSpacing(8),
  },
  emptyStateSubtext: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Floating Action Button Styles
  fabContainer: {
    position: 'absolute',
    bottom: getSpacing(24),
    right: getHorizontalPadding(),
    zIndex: 1000,
  },
  fab: {
    ...getFloatingButtonSize(60),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...getShadowSize(4, 12, 0.3),
  },
  
  // Modal Styles
  modalBackground: {
    flex: 1,
    backgroundColor: Colors.backgroundModal,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
  },
  modalContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(20),
    width: '100%',
    maxWidth: scaleSize(400),
    ...getShadowSize(8, 20, 0.3),
  },
  modalHeader: {
    padding: getSpacing(24),
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: {
    fontSize: getTitleFontSize(20),
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: getSpacing(4),
  },
  modalSubtitle: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
  },
  modalContent: {
    padding: getSpacing(24),
  },
  modalInput: {
    ...getInputSize(),
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    color: Colors.text,
    marginBottom: getSpacing(24),
  },
  modalButtons: {
    flexDirection: 'row',
    gap: getSpacing(12),
  },
  modalCancelButton: {
    flex: 1,
    ...getButtonSize(),
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: getBorderRadius(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  modalConfirmButton: {
    flex: 1,
    ...getButtonSize(),
    backgroundColor: Colors.primary,
    borderRadius: getBorderRadius(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalConfirmButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.textDark,
  },
});