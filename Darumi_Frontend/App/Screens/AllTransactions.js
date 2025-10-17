import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Animated,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { useUser } from '@clerk/clerk-react';
import Colors from '../../assets/shared/Colors';
import { formatCurrency } from '../../utils/formatting';
import TransactionsService from '../../services/transactionsService';
import FloatingAddButton from '../Components/AllTransactions/FloatingAddButton';
import TransactionSkeleton from '../Components/AllTransactions/TransactionSkeleton';
import DateRangeFilter from '../Components/AllTransactions/DateRangeFilter';
import {
  scaleSize,
  getBodyFontSize,
  getTitleFontSize,
  getBorderRadius,
  getSpacing,
  getShadowSize,
  getBorderWidth,
  getIconSize,
  getMaxWidth,
  getMinWidth,
  getMinHeight,
  getGap,
  getHorizontalPadding,
  getVerticalPadding,
} from '../../utils/scaling';

const { width: screenWidth } = Dimensions.get('window');

export default function AllTransactions({ navigation }) {
  const { user } = useUser();
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estados de filtros
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('all'); // 'all', 'gasto', 'ingreso'
  const [sortBy, setSortBy] = useState('date'); // 'date' o 'amount'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' o 'desc'
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Estados de UI
  const [showUnifiedFiltersModal, setShowUnifiedFiltersModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [isExpenseSelected, setIsExpenseSelected] = useState(true);

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
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
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    if (user) {
      fetchData();
    }
  }, [user]);

  // Separar el useEffect de filtros para evitar doble refresh
  useEffect(() => {
    // Solo aplicar filtros si ya tenemos transacciones cargadas y hay filtros activos
    if (transactions.length > 0 && (
      searchText.trim() || 
      selectedCategory || 
      selectedType !== 'all' || 
      minAmount || 
      maxAmount || 
      dateRange.start || 
      dateRange.end
    )) {
      applyFilters();
    }
  }, [searchText, selectedCategory, selectedType, sortBy, sortOrder, minAmount, maxAmount, dateRange]);

  const fetchData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Fetch categories using new service
      const categoriesResponse = await TransactionsService.getCategories();
      setCategories(categoriesResponse.categories || []);

      // Fetch transactions using new service
      const transactionsResponse = await TransactionsService.getTransactions({
        Id_Usuario: user.id,
        limit: 1000 // Get all transactions for initial load
      });
      const transactionsData = transactionsResponse.data || [];
      setTransactions(transactionsData);
      
      // Inicializar filteredTransactions con todas las transacciones
      setFilteredTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Construir filtros para el backend
      const filters = {
        Id_Usuario: user.id,
        search: searchText.trim() || undefined,
        category: selectedCategory || undefined,
        type: selectedType !== 'all' ? selectedType : undefined,
        min: minAmount || undefined,
        max: maxAmount || undefined,
        from: dateRange.start || undefined,
        to: dateRange.end || undefined,
        order: `${sortBy}_${sortOrder}`,
        limit: 1000 // Get all filtered results
      };

      // Limpiar filtros vacíos
      Object.keys(filters).forEach(key => {
        if (filters[key] === undefined || filters[key] === '') {
          delete filters[key];
        }
      });

      console.log('🔍 Applying filters:', filters);
      const response = await TransactionsService.getTransactions(filters);
      setFilteredTransactions(response.data || []);
    } catch (error) {
      console.error('Error applying filters:', error);
      setError(error);
      // Fallback to local filtering if API fails
      applyLocalFilters();
    } finally {
      setLoading(false);
    }
  };

  const applyLocalFilters = () => {
    let filtered = [...transactions];

    // Filtro de búsqueda por texto
    if (searchText.trim()) {
      filtered = filtered.filter(transaction =>
        transaction.title?.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.description?.toLowerCase().includes(searchText.toLowerCase()) ||
        transaction.category?.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filtro por categoría
    if (selectedCategory) {
      filtered = filtered.filter(transaction =>
        transaction.category === selectedCategory
      );
    }

    // Filtro por monto mínimo
    if (minAmount) {
      filtered = filtered.filter(transaction =>
        Math.abs(transaction.amount) >= parseFloat(minAmount)
      );
    }

    // Filtro por monto máximo
    if (maxAmount) {
      filtered = filtered.filter(transaction =>
        Math.abs(transaction.amount) <= parseFloat(maxAmount)
      );
    }

    // Filtro por rango de fechas
    if (dateRange.start) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const startDate = new Date(dateRange.start);
        return transactionDate >= startDate;
      });
    }

    if (dateRange.end) {
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const endDate = new Date(dateRange.end);
        return transactionDate <= endDate;
      });
    }

    // Ordenamiento
    filtered.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === 'date') {
        comparison = new Date(a.date) - new Date(b.date);
      } else if (sortBy === 'amount') {
        comparison = Math.abs(a.amount) - Math.abs(b.amount);
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredTransactions(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setSelectedCategory('');
    setSelectedType('all');
    setMinAmount('');
    setMaxAmount('');
    setDateRange({ start: '', end: '' });
    setSortBy('date');
    setSortOrder('desc');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getCategoryIcon = (categoryName) => {
    const categoryConfig = {
      'Comida/Restaurante': { icon: 'hamburger', color: '#ff6b6b' },
      'Transporte': { icon: 'car', color: '#4ecdc4' },
      'Combustibles': { icon: 'gas-pump', color: '#45b7d1' },
      'Vestimenta/Calzado': { icon: 'tshirt', color: '#96ceb4' },
      'Mecanica': { icon: 'wrench', color: '#feca57' },
      'Electrodomestico': { icon: 'home', color: '#ff9ff3' },
      'Varios': { icon: 'ellipsis-h', color: '#a55eea' },
      'Ingresos': { icon: 'money-bill-wave', color: '#28a745' },
    };
    return categoryConfig[categoryName] || categoryConfig['Varios'];
  };

  const renderTransactionItem = (item, index) => {
    const isExpense = item.amount < 0;
    const config = getCategoryIcon(item.category);

    return (
      <Animated.View
        key={item.id || index}
        style={[
          styles.transactionItem,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Left side: Icon and main info */}
        <View style={styles.transactionLeft}>
          <View style={[styles.transactionIcon, { backgroundColor: config.color }]}>
            <FontAwesome5 name={config.icon} size={getIconSize(20)} color="white" />
          </View>
          <View style={styles.transactionInfo}>
            <Text style={styles.transactionTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            {item.description && (
              <Text style={styles.transactionDetail} numberOfLines={1}>
                {item.description}
              </Text>
            )}
          </View>
        </View>

        {/* Right side: Amount and date */}
        <View style={styles.transactionRight}>
          <Text style={[
            styles.amountText,
            isExpense ? styles.expenseAmount : styles.incomeAmount
          ]}>
            {isExpense ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
          </Text>
          <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
        </View>
      </Animated.View>
    );
  };

  const renderFilters = () => (
    <Animated.View
      style={[
        styles.filtersContainer,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      {/* Barra de búsqueda simplificada */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <FontAwesome5 name="search" size={getIconSize(16)} color={Colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar transacciones..."
            placeholderTextColor={Colors.textSecondary}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <FontAwesome5 name="times" size={getIconSize(16)} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Botón unificado de filtros */}
        <TouchableOpacity
          style={styles.unifiedFiltersButton}
          onPress={() => setShowUnifiedFiltersModal(true)}
        >
          <FontAwesome5 name="filter" size={getIconSize(18)} color={Colors.primary} />
          {(selectedType !== 'all' || selectedCategory || minAmount || maxAmount || dateRange.start || dateRange.end) && (
            <View style={styles.filterIndicator} />
          )}
        </TouchableOpacity>
      </View>


    </Animated.View>
  );

  const renderUnifiedFiltersModal = () => (
    <Modal
      visible={showUnifiedFiltersModal}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => setShowUnifiedFiltersModal(false)}
    >
      <View style={styles.fullScreenModalContainer}>
        <Animated.View
          style={[
            styles.fullScreenModalContent,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.fullScreenModalHeader}>
            <View style={styles.modalHeaderTop}>
              <TouchableOpacity
                style={styles.modalBackButton}
                onPress={() => setShowUnifiedFiltersModal(false)}
              >
                <FontAwesome5 name="arrow-left" size={getIconSize(20)} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.fullScreenModalTitle}>Filtros y Ordenamiento</Text>
              <View style={styles.modalHeaderSpacer} />
            </View>
            
            {/* Indicador de filtros activos */}
            {(selectedType !== 'all' || selectedCategory || minAmount || maxAmount || dateRange.start || dateRange.end) && (
              <View style={styles.activeFiltersIndicator}>
                <FontAwesome5 name="filter" size={getIconSize(12)} color={Colors.primary} />
                <Text style={styles.activeFiltersText}>Filtros activos</Text>
              </View>
            )}
          </View>
          
          <ScrollView 
            style={styles.fullScreenModalScroll} 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.fullScreenModalScrollContent}
          >
            {/* Filtro por tipo de transacción */}
            <View style={styles.filterCard}>
              <View style={styles.filterCardHeader}>
                <FontAwesome5 name="list-alt" size={getIconSize(18)} color={Colors.primary} />
                <Text style={styles.filterCardTitle}>Tipo de Transacción</Text>
              </View>
              <View style={styles.typeFilterContainer}>
                <TouchableOpacity
                  style={[
                    styles.typeFilterOption,
                    selectedType === 'all' && styles.typeFilterOptionActive
                  ]}
                  onPress={() => setSelectedType('all')}
                >
                  <FontAwesome5 name="list" size={getIconSize(16)} color={selectedType === 'all' ? Colors.textDark : Colors.textSecondary} />
                  <Text style={[
                    styles.typeFilterText,
                    selectedType === 'all' && styles.typeFilterTextActive
                  ]}>
                    Todas
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeFilterOption,
                    selectedType === 'gasto' && styles.typeFilterOptionActive
                  ]}
                  onPress={() => setSelectedType('gasto')}
                >
                  <FontAwesome5 name="arrow-down" size={getIconSize(16)} color={selectedType === 'gasto' ? Colors.textDark : Colors.danger} />
                  <Text style={[
                    styles.typeFilterText,
                    selectedType === 'gasto' && styles.typeFilterTextActive
                  ]}>
                    Gastos
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.typeFilterOption,
                    selectedType === 'ingreso' && styles.typeFilterOptionActive
                  ]}
                  onPress={() => setSelectedType('ingreso')}
                >
                  <FontAwesome5 name="arrow-up" size={getIconSize(16)} color={selectedType === 'ingreso' ? Colors.textDark : Colors.success} />
                  <Text style={[
                    styles.typeFilterText,
                    selectedType === 'ingreso' && styles.typeFilterTextActive
                  ]}>
                    Ingresos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Filtro por categoría */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Categoría</Text>
              <TouchableOpacity
                style={styles.categoryFilterButton}
                onPress={() => {
                  setShowUnifiedFiltersModal(false);
                  setShowCategoryModal(true);
                }}
              >
                <FontAwesome5 name="tags" size={getIconSize(16)} color={Colors.primary} />
                <Text style={styles.categoryFilterText}>
                  {selectedCategory || 'Todas las categorías'}
                </Text>
                <FontAwesome5 name="chevron-right" size={getIconSize(12)} color={Colors.primary} />
              </TouchableOpacity>
            </View>

            {/* Filtro por monto */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Rango de Monto</Text>
              <View style={styles.amountInputsContainer}>
                <View style={styles.amountInputWrapper}>
                  <FontAwesome5 name="dollar-sign" size={getIconSize(16)} color={Colors.primary} />
                  <TextInput
                    style={styles.amountInput}
                    placeholder="Mínimo"
                    placeholderTextColor={Colors.textSecondary}
                    value={minAmount}
                    onChangeText={setMinAmount}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.amountSeparator}>-</Text>
                <View style={styles.amountInputWrapper}>
                  <FontAwesome5 name="dollar-sign" size={getIconSize(16)} color={Colors.primary} />
                  <TextInput
                    style={styles.amountInput}
                    placeholder="Máximo"
                    placeholderTextColor={Colors.textSecondary}
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Filtro por fecha */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Rango de Fechas</Text>
              <DateRangeFilter
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </View>

            {/* Ordenamiento */}
            <View style={styles.filterCard}>
              <View style={styles.filterCardHeader}>
                <FontAwesome5 name="sort" size={getIconSize(18)} color={Colors.primary} />
                <Text style={styles.filterCardTitle}>Ordenar por</Text>
              </View>
              
              {/* Opciones de ordenamiento */}
              <View style={styles.sortOptionsContainer}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortBy === 'date' && styles.sortOptionActive
                  ]}
                  onPress={() => setSortBy('date')}
                >
                  <View style={styles.sortOptionLeft}>
                    <FontAwesome5 name="calendar-alt" size={getIconSize(16)} color={sortBy === 'date' ? Colors.primary : Colors.textSecondary} />
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === 'date' && styles.sortOptionTextActive
                    ]}>
                      Fecha
                    </Text>
                  </View>
                  {sortBy === 'date' && (
                    <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.primary} />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    sortBy === 'amount' && styles.sortOptionActive
                  ]}
                  onPress={() => setSortBy('amount')}
                >
                  <View style={styles.sortOptionLeft}>
                    <FontAwesome5 name="dollar-sign" size={getIconSize(16)} color={sortBy === 'amount' ? Colors.primary : Colors.textSecondary} />
                    <Text style={[
                      styles.sortOptionText,
                      sortBy === 'amount' && styles.sortOptionTextActive
                    ]}>
                      Monto
                    </Text>
                  </View>
                  {sortBy === 'amount' && (
                    <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              </View>

              {/* Dirección del ordenamiento */}
              <View style={styles.sortDirectionContainer}>
                <Text style={styles.sortDirectionLabel}>Dirección:</Text>
                <View style={styles.sortDirectionButtons}>
                  <TouchableOpacity
                    style={[
                      styles.sortDirectionButton,
                      sortOrder === 'desc' && styles.sortDirectionButtonActive
                    ]}
                    onPress={() => setSortOrder('desc')}
                  >
                    <FontAwesome5 
                      name="arrow-down" 
                      size={getIconSize(14)} 
                      color={sortOrder === 'desc' ? Colors.textDark : Colors.textSecondary} 
                    />
                    <Text style={[
                      styles.sortDirectionText,
                      sortOrder === 'desc' && styles.sortDirectionTextActive
                    ]}>
                      Descendente
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.sortDirectionButton,
                      sortOrder === 'asc' && styles.sortDirectionButtonActive
                    ]}
                    onPress={() => setSortOrder('asc')}
                  >
                    <FontAwesome5 
                      name="arrow-up" 
                      size={getIconSize(14)} 
                      color={sortOrder === 'asc' ? Colors.textDark : Colors.textSecondary} 
                    />
                    <Text style={[
                      styles.sortDirectionText,
                      sortOrder === 'asc' && styles.sortDirectionTextActive
                    ]}>
                      Ascendente
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Botones de acción fijos */}
          <View style={styles.fullScreenModalActions}>
            <TouchableOpacity 
              style={styles.fullScreenModalClearButton} 
              onPress={() => {
                clearFilters();
                setShowUnifiedFiltersModal(false);
              }}
            >
              <FontAwesome5 name="times" size={getIconSize(16)} color={Colors.text} />
              <Text style={styles.fullScreenModalClearButtonText}>Limpiar Filtros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.fullScreenModalApplyButton}
              onPress={() => setShowUnifiedFiltersModal(false)}
            >
              <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.textDark} />
              <Text style={styles.fullScreenModalApplyButtonText}>Aplicar Filtros</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderCategoryModal = () => (
    <Modal
      visible={showCategoryModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCategoryModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            styles.categoryModalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtrar por Categoría</Text>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setShowCategoryModal(false)}
            >
              <FontAwesome5 name="times" size={getIconSize(20)} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.categoryModalScroll} showsVerticalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.categoryModalOption,
                selectedCategory === '' && styles.categoryModalOptionActive
              ]}
              onPress={() => {
                setSelectedCategory('');
                setShowCategoryModal(false);
              }}
            >
              <View style={styles.categoryModalOptionLeft}>
                <View style={[styles.categoryModalIcon, { backgroundColor: Colors.primary }]}>
                  <FontAwesome5 name="list" size={getIconSize(16)} color={Colors.textDark} />
                </View>
                <Text style={[
                  styles.categoryModalOptionText,
                  selectedCategory === '' && styles.categoryModalOptionTextActive
                ]}>
                  Todas las categorías
                </Text>
              </View>
              {selectedCategory === '' && (
                <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.primary} />
              )}
            </TouchableOpacity>

            {categories.map((category) => {
              const config = getCategoryIcon(category.name);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryModalOption,
                    selectedCategory === category.name && styles.categoryModalOptionActive
                  ]}
                  onPress={() => {
                    setSelectedCategory(category.name);
                    setShowCategoryModal(false);
                  }}
                >
                  <View style={styles.categoryModalOptionLeft}>
                    <View style={[styles.categoryModalIcon, { backgroundColor: config.color }]}>
                      <FontAwesome5 name={config.icon} size={getIconSize(16)} color="white" />
                    </View>
                    <Text style={[
                      styles.categoryModalOptionText,
                      selectedCategory === category.name && styles.categoryModalOptionTextActive
                    ]}>
                      {category.name}
                    </Text>
                  </View>
                  {selectedCategory === category.name && (
                    <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderAdvancedFiltersModal = () => (
    <Modal
      visible={showAdvancedFiltersModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowAdvancedFiltersModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            styles.advancedFiltersModalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filtros Avanzados</Text>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setShowAdvancedFiltersModal(false)}
            >
              <FontAwesome5 name="times" size={getIconSize(20)} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.advancedFiltersScroll} showsVerticalScrollIndicator={false}>
            {/* Filtro por monto */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Rango de Monto</Text>
              <View style={styles.amountInputsContainer}>
                <View style={styles.amountInputWrapper}>
                  <FontAwesome5 name="dollar-sign" size={getIconSize(16)} color={Colors.primary} />
                  <TextInput
                    style={styles.amountInput}
                    placeholder="Mínimo"
                    placeholderTextColor={Colors.textSecondary}
                    value={minAmount}
                    onChangeText={setMinAmount}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={styles.amountSeparator}>-</Text>
                <View style={styles.amountInputWrapper}>
                  <FontAwesome5 name="dollar-sign" size={getIconSize(16)} color={Colors.primary} />
                  <TextInput
                    style={styles.amountInput}
                    placeholder="Máximo"
                    placeholderTextColor={Colors.textSecondary}
                    value={maxAmount}
                    onChangeText={setMaxAmount}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* Filtro por fecha */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Rango de Fechas</Text>
              <DateRangeFilter
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </View>

            {/* Ordenamiento */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Ordenar por</Text>
              <TouchableOpacity
                style={styles.sortButton}
                onPress={() => {
                  setShowAdvancedFiltersModal(false);
                  setShowSortModal(true);
                }}
              >
                <FontAwesome5 name="sort" size={getIconSize(16)} color={Colors.primary} />
                <Text style={styles.sortButtonText}>
                  {sortBy === 'date' ? 'Fecha' : 'Monto'} ({sortOrder === 'desc' ? 'Desc' : 'Asc'})
                </Text>
                <FontAwesome5 name="chevron-right" size={getIconSize(12)} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Botones de acción */}
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalClearButton} 
              onPress={() => {
                clearFilters();
                setShowAdvancedFiltersModal(false);
              }}
            >
              <Text style={styles.modalClearButtonText}>Limpiar Filtros</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalApplyButton}
              onPress={() => setShowAdvancedFiltersModal(false)}
            >
              <Text style={styles.modalApplyButtonText}>Aplicar</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            styles.sortModalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Ordenar Transacciones</Text>
            <TouchableOpacity
              style={styles.modalCloseIcon}
              onPress={() => setShowSortModal(false)}
            >
              <FontAwesome5 name="times" size={getIconSize(20)} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.sortSection}>
            <Text style={styles.sortSectionTitle}>Ordenar por</Text>
            
            <TouchableOpacity
              style={[
                styles.sortOption,
                sortBy === 'date' && styles.sortOptionActive
              ]}
              onPress={() => setSortBy('date')}
            >
              <View style={styles.sortOptionLeft}>
                <FontAwesome5 name="calendar-alt" size={getIconSize(16)} color={Colors.primary} />
                <Text style={[
                  styles.sortOptionText,
                  sortBy === 'date' && styles.sortOptionTextActive
                ]}>
                  Fecha
                </Text>
              </View>
              {sortBy === 'date' && <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.primary} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sortOption,
                sortBy === 'amount' && styles.sortOptionActive
              ]}
              onPress={() => setSortBy('amount')}
            >
              <View style={styles.sortOptionLeft}>
                <FontAwesome5 name="dollar-sign" size={getIconSize(16)} color={Colors.primary} />
                <Text style={[
                  styles.sortOptionText,
                  sortBy === 'amount' && styles.sortOptionTextActive
                ]}>
                  Monto
                </Text>
              </View>
              {sortBy === 'amount' && <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.primary} />}
            </TouchableOpacity>
          </View>

          <View style={styles.sortSection}>
            <Text style={styles.sortSectionTitle}>Dirección</Text>
            <View style={styles.sortOrderContainer}>
              <TouchableOpacity
                style={[
                  styles.sortOrderButton,
                  sortOrder === 'desc' && styles.sortOrderButtonActive
                ]}
                onPress={() => setSortOrder('desc')}
              >
                <FontAwesome5 name="arrow-down" size={getIconSize(14)} color={sortOrder === 'desc' ? Colors.textDark : Colors.textSecondary} />
                <Text style={[
                  styles.sortOrderText,
                  sortOrder === 'desc' && styles.sortOrderTextActive
                ]}>
                  Descendente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sortOrderButton,
                  sortOrder === 'asc' && styles.sortOrderButtonActive
                ]}
                onPress={() => setSortOrder('asc')}
              >
                <FontAwesome5 name="arrow-up" size={getIconSize(14)} color={sortOrder === 'asc' ? Colors.textDark : Colors.textSecondary} />
                <Text style={[
                  styles.sortOrderText,
                  sortOrder === 'asc' && styles.sortOrderTextActive
                ]}>
                  Ascendente
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.modalApplyButton}
            onPress={() => setShowSortModal(false)}
          >
            <Text style={styles.modalApplyButtonText}>Aplicar</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );

  const renderEmptyState = () => (
    <Animated.View
      style={[
        styles.emptyState,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <FontAwesome5 name="receipt" size={getIconSize(64)} color={Colors.textSecondary} />
      <Text style={styles.emptyStateTitle}>No hay transacciones</Text>
      <Text style={styles.emptyStateSubtitle}>
        {searchText || selectedCategory || minAmount || maxAmount || dateRange.start || dateRange.end
          ? 'No se encontraron transacciones con los filtros aplicados'
          : 'Aún no has registrado ninguna transacción'}
      </Text>
      {(searchText || selectedCategory || minAmount || maxAmount || dateRange.start || dateRange.end) && (
        <TouchableOpacity style={styles.clearFiltersButton} onPress={clearFilters}>
          <Text style={styles.clearFiltersButtonText}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <FontAwesome5 name="arrow-left" size={getIconSize(20)} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>📋 Todas las transacciones</Text>
          <Text style={styles.headerSubtitle}>
            {filteredTransactions.length} transacciones encontradas
          </Text>
        </View>
      </Animated.View>

      {/* Filtros */}
      {renderFilters()}

      {/* Lista de transacciones */}
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.transactionsList}>
            {[...Array(5)].map((_, index) => (
              <TransactionSkeleton key={index} />
            ))}
          </View>
        ) : filteredTransactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {filteredTransactions.map((item, index) => renderTransactionItem(item, index))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>

      {/* Modales */}
      {renderUnifiedFiltersModal()}
      {renderCategoryModal()}
      {renderSortModal()}

      {/* Botón flotante para agregar transacción */}
      <FloatingAddButton
        onPress={() => {
          // Por ahora solo navegamos de vuelta al dashboard
          // En el futuro se podría abrir un modal de creación rápida
          navigation.goBack();
        }}
        isExpense={isExpenseSelected}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: getSpacing(12),
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: getBorderWidth(),
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: getSpacing(12),
    padding: getSpacing(6),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: getTitleFontSize(18),
    fontWeight: '700',
    color: Colors.text,
    marginBottom: getSpacing(2),
  },
  headerSubtitle: {
    fontSize: scaleSize(13),
    color: Colors.textSecondary,
  },
  filtersContainer: {
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: getSpacing(16),
    borderBottomWidth: getBorderWidth(),
    borderBottomColor: Colors.border,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(16),
    gap: getGap(12),
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(12),
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: getSpacing(12),
    fontSize: getBodyFontSize(),
    color: Colors.text,
  },
  unifiedFiltersButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(12),
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterIndicator: {
    position: 'absolute',
    top: getSpacing(8),
    right: getSpacing(8),
    width: getSpacing(8),
    height: getSpacing(8),
    borderRadius: getBorderRadius(4),
    backgroundColor: Colors.danger,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: getVerticalPadding(),
  },
  transactionsList: {
    gap: getGap(8), // Reducido de 12 para más densidad
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(12), // Reducido de 18 para más compacto
    borderRadius: getBorderRadius(16),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    ...getShadowSize(2, 4, 0.1),
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: getSpacing(12), // Reducido de 16
  },
  transactionIcon: {
    width: getIconSize(44), // Reducido de 48 para más compacto
    height: getIconSize(44), // Reducido de 48 para más compacto
    borderRadius: getBorderRadius(22), // Ajustado proporcionalmente
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(12), // Reducido de 16
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(2), // Reducido de 3
    lineHeight: getBodyFontSize() * 1.15, // Reducido de 1.2
  },
  transactionCategory: {
    fontSize: scaleSize(13),
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: getSpacing(1), // Reducido de 2
    opacity: 0.8,
  },
  transactionDetail: {
    fontSize: scaleSize(11),
    color: Colors.textSecondary,
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: getSpacing(1), // Añadido para separación mínima
  },
  transactionRight: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: getSpacing(90), // Reducido de 100
  },
  amountText: {
    fontSize: scaleSize(18),
    fontWeight: '800',
    textAlign: 'right',
    marginBottom: getSpacing(2), // Reducido de 3
    letterSpacing: 0.5,
    lineHeight: scaleSize(18) * 1.1, // Añadido para consistencia
  },
  transactionDate: {
    fontSize: scaleSize(11),
    color: Colors.textSecondary,
    fontWeight: '400',
    opacity: 0.7,
  },
  expenseAmount: {
    color: Colors.danger,
  },
  incomeAmount: {
    color: Colors.success,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: getSpacing(40),
  },
  loadingText: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: getSpacing(60),
  },
  emptyStateTitle: {
    fontSize: getTitleFontSize(18),
    fontWeight: '600',
    color: Colors.text,
    marginTop: getSpacing(16),
    marginBottom: getSpacing(8),
  },
  emptyStateSubtitle: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: getSpacing(24),
  },
  clearFiltersButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: getSpacing(24),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(8),
  },
  clearFiltersButtonText: {
    fontSize: getBodyFontSize(),
    color: Colors.textDark,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: getBorderRadius(20),
    borderTopRightRadius: getBorderRadius(20),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    ...getShadowSize(8, 32, 0.3),
  },
  categoryModalContent: {
    maxHeight: screenWidth * 0.8,
  },
  sortModalContent: {
    paddingBottom: getSpacing(20),
  },
  advancedFiltersModalContent: {
    maxHeight: screenWidth * 0.9,
  },
  unifiedFiltersModalContent: {
    maxHeight: screenWidth * 0.95,
  },
  fullScreenModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fullScreenModalContent: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  fullScreenModalHeader: {
    backgroundColor: Colors.backgroundSecondary,
    paddingTop: getSpacing(50),
    paddingBottom: getSpacing(20),
    paddingHorizontal: getSpacing(20),
    borderBottomWidth: getBorderWidth(),
    borderBottomColor: Colors.border,
  },
  modalHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(12),
  },
  modalBackButton: {
    padding: getSpacing(8),
    marginRight: getSpacing(12),
  },
  fullScreenModalTitle: {
    fontSize: getTitleFontSize(20),
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  modalHeaderSpacer: {
    width: getSpacing(40),
  },
  activeFiltersIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(6),
    borderRadius: getBorderRadius(16),
    alignSelf: 'flex-start',
  },
  activeFiltersText: {
    fontSize: scaleSize(12),
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: getSpacing(6),
  },
  fullScreenModalScroll: {
    flex: 1,
  },
  fullScreenModalScrollContent: {
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(20),
    paddingBottom: getSpacing(100), // Espacio para botones fijos
  },
  filterCard: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(16),
    padding: getSpacing(20),
    marginBottom: getSpacing(16),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    ...getShadowSize(2, 8, 0.1),
  },
  filterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(16),
  },
  filterCardTitle: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '600',
    marginLeft: getSpacing(12),
  },
  unifiedFiltersScroll: {
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(16),
  },
  advancedFiltersScroll: {
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(16),
  },
  filterSection: {
    marginBottom: getSpacing(24),
  },
  filterSectionTitle: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '600',
    marginBottom: getSpacing(12),
  },
  amountInputsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getGap(12),
  },
  amountInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  amountInput: {
    flex: 1,
    marginLeft: getSpacing(8),
    fontSize: getBodyFontSize(),
    color: Colors.text,
  },
  amountSeparator: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  typeFilterContainer: {
    flexDirection: 'row',
    gap: getGap(8),
  },
  typeFilterOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(16),
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  typeFilterOptionActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeFilterText: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: getSpacing(8),
  },
  typeFilterTextActive: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  categoryFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  categoryFilterText: {
    flex: 1,
    marginLeft: getSpacing(12),
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '500',
  },
  sortOptionsContainer: {
    marginBottom: getSpacing(16),
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(16),
    backgroundColor: Colors.background,
    borderRadius: getBorderRadius(12),
    marginBottom: getSpacing(8),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  sortOptionActive: {
    backgroundColor: Colors.backgroundCard,
    borderColor: Colors.primary,
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sortOptionText: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '500',
    marginLeft: getSpacing(12),
  },
  sortOptionTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  sortDirectionContainer: {
    marginTop: getSpacing(8),
  },
  sortDirectionLabel: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '600',
    marginBottom: getSpacing(12),
  },
  sortDirectionButtons: {
    flexDirection: 'row',
    gap: getGap(8),
  },
  sortDirectionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  sortDirectionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortDirectionText: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: getSpacing(8),
  },
  sortDirectionTextActive: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(16),
    borderBottomWidth: getBorderWidth(),
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: getTitleFontSize(18),
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  modalCloseIcon: {
    padding: getSpacing(8),
  },
  categoryModalScroll: {
    maxHeight: scaleSize(400),
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(16),
  },
  categoryModalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    backgroundColor: Colors.background,
    borderRadius: getBorderRadius(12),
    marginBottom: getSpacing(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  categoryModalOptionActive: {
    backgroundColor: Colors.backgroundCard,
    borderColor: Colors.primary,
  },
  categoryModalOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryModalIcon: {
    width: getIconSize(32),
    height: getIconSize(32),
    borderRadius: getBorderRadius(16),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(12),
  },
  categoryModalOptionText: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '500',
  },
  categoryModalOptionTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  sortSection: {
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(16),
  },
  sortSectionTitle: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '600',
    marginBottom: getSpacing(12),
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(16),
    backgroundColor: Colors.background,
    borderRadius: getBorderRadius(12),
    marginBottom: getSpacing(8),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  sortOptionActive: {
    backgroundColor: Colors.backgroundCard,
    borderColor: Colors.primary,
  },
  sortOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sortOptionText: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '500',
    marginLeft: getSpacing(12),
  },
  sortOptionTextActive: {
    color: Colors.text,
    fontWeight: '600',
  },
  sortOrderContainer: {
    flexDirection: 'row',
    gap: getGap(12),
  },
  sortOrderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  sortOrderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortOrderText: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: getSpacing(8),
  },
  sortOrderTextActive: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  modalApplyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: getSpacing(16),
    marginHorizontal: getSpacing(20),
    borderRadius: getBorderRadius(12),
    alignItems: 'center',
    marginTop: getSpacing(16),
  },
  modalApplyButtonText: {
    fontSize: getBodyFontSize(),
    color: Colors.textDark,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(16),
    gap: getGap(12),
    borderTopWidth: getBorderWidth(),
    borderTopColor: Colors.border,
  },
  modalClearButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: getSpacing(16),
    borderRadius: getBorderRadius(12),
    alignItems: 'center',
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  modalClearButtonText: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '600',
  },
  fullScreenModalActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: getSpacing(20),
    paddingVertical: getSpacing(20),
    paddingBottom: getSpacing(30),
    borderTopWidth: getBorderWidth(),
    borderTopColor: Colors.border,
    flexDirection: 'row',
    gap: getGap(12),
  },
  fullScreenModalClearButton: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingVertical: getSpacing(16),
    borderRadius: getBorderRadius(12),
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    flexDirection: 'row',
  },
  fullScreenModalClearButtonText: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '600',
    marginLeft: getSpacing(8),
  },
  fullScreenModalApplyButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: getSpacing(16),
    borderRadius: getBorderRadius(12),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...getShadowSize(4, 12, 0.2),
  },
  fullScreenModalApplyButtonText: {
    fontSize: getBodyFontSize(),
    color: Colors.textDark,
    fontWeight: '700',
    marginLeft: getSpacing(8),
  },
});
