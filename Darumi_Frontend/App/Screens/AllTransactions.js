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
  const [showFilters, setShowFilters] = useState(false);
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

  useEffect(() => {
    applyFilters();
  }, [transactions, searchText, selectedCategory, selectedType, sortBy, sortOrder, minAmount, maxAmount, dateRange]);

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
      setTransactions(transactionsResponse.data || []);
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
        <View style={[styles.transactionIcon, { backgroundColor: config.color }]}>
          <FontAwesome5 name={config.icon} size={getIconSize(20)} color="white" />
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={styles.transactionCategory}>{item.category}</Text>
            <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
          </View>
          {item.description && (
            <Text style={styles.transactionDetail} numberOfLines={1}>
              {item.description}
            </Text>
          )}
        </View>

        <View style={styles.transactionAmount}>
          <Text style={[
            styles.amountText,
            isExpense ? styles.expenseAmount : styles.incomeAmount
          ]}>
            {isExpense ? '-' : '+'}{formatCurrency(Math.abs(item.amount))}
          </Text>
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
      {/* Barra de búsqueda */}
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

      {/* Filtros de tipo */}
      <View style={styles.typeFilters}>
        <TouchableOpacity
          style={[
            styles.typeFilterChip,
            selectedType === 'all' && styles.typeFilterChipActive
          ]}
          onPress={() => setSelectedType('all')}
        >
          <FontAwesome5 name="list" size={getIconSize(14)} color={selectedType === 'all' ? Colors.textDark : Colors.textSecondary} />
          <Text style={[
            styles.typeFilterChipText,
            selectedType === 'all' && styles.typeFilterChipTextActive
          ]}>
            Todas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeFilterChip,
            selectedType === 'gasto' && styles.typeFilterChipActive
          ]}
          onPress={() => setSelectedType('gasto')}
        >
          <FontAwesome5 name="arrow-down" size={getIconSize(14)} color={selectedType === 'gasto' ? Colors.textDark : Colors.danger} />
          <Text style={[
            styles.typeFilterChipText,
            selectedType === 'gasto' && styles.typeFilterChipTextActive
          ]}>
            Gastos
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeFilterChip,
            selectedType === 'ingreso' && styles.typeFilterChipActive
          ]}
          onPress={() => setSelectedType('ingreso')}
        >
          <FontAwesome5 name="arrow-up" size={getIconSize(14)} color={selectedType === 'ingreso' ? Colors.textDark : Colors.success} />
          <Text style={[
            styles.typeFilterChipText,
            selectedType === 'ingreso' && styles.typeFilterChipTextActive
          ]}>
            Ingresos
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filtros de categoría */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFilters}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            selectedCategory === '' && styles.filterChipActive
          ]}
          onPress={() => setSelectedCategory('')}
        >
          <Text style={[
            styles.filterChipText,
            selectedCategory === '' && styles.filterChipTextActive
          ]}>
            Todas las categorías
          </Text>
        </TouchableOpacity>

        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.filterChip,
              selectedCategory === category.name && styles.filterChipActive
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Text style={[
              styles.filterChipText,
              selectedCategory === category.name && styles.filterChipTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Filtros avanzados */}
      <View style={styles.advancedFilters}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <FontAwesome5 name="filter" size={getIconSize(16)} color={Colors.primary} />
          <Text style={styles.filterButtonText}>Filtros avanzados</Text>
          <FontAwesome5 
            name={showFilters ? "chevron-up" : "chevron-down"} 
            size={getIconSize(12)} 
            color={Colors.primary} 
          />
        </TouchableOpacity>

        {showFilters && (
          <Animated.View
            style={[
              styles.advancedFiltersContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Filtro por monto */}
            <View style={styles.amountFilter}>
              <Text style={styles.filterLabel}>Rango de monto</Text>
              <View style={styles.amountInputs}>
                <TextInput
                  style={styles.amountInput}
                  placeholder="Mínimo"
                  placeholderTextColor={Colors.textSecondary}
                  value={minAmount}
                  onChangeText={setMinAmount}
                  keyboardType="numeric"
                />
                <Text style={styles.amountSeparator}>-</Text>
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

            {/* Filtro por fecha */}
            <View style={styles.dateFilter}>
              <Text style={styles.filterLabel}>Rango de fechas</Text>
              <DateRangeFilter
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </View>

            {/* Botones de acción */}
            <View style={styles.filterActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Limpiar filtros</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Ordenamiento */}
      <View style={styles.sortContainer}>
        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setShowSortModal(true)}
        >
          <FontAwesome5 name="sort" size={getIconSize(16)} color={Colors.primary} />
          <Text style={styles.sortButtonText}>
            Ordenar por: {sortBy === 'date' ? 'Fecha' : 'Monto'} ({sortOrder === 'desc' ? 'Desc' : 'Asc'})
          </Text>
          <FontAwesome5 name="chevron-down" size={getIconSize(12)} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const renderSortModal = () => (
    <Modal
      visible={showSortModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSortModal(false)}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContent,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.modalTitle}>Ordenar por</Text>
          
          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => {
              setSortBy('date');
              setShowSortModal(false);
            }}
          >
            <Text style={styles.sortOptionText}>Fecha</Text>
            {sortBy === 'date' && <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.primary} />}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => {
              setSortBy('amount');
              setShowSortModal(false);
            }}
          >
            <Text style={styles.sortOptionText}>Monto</Text>
            {sortBy === 'amount' && <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.primary} />}
          </TouchableOpacity>

          <View style={styles.sortOrderContainer}>
            <Text style={styles.sortOrderLabel}>Orden:</Text>
            <TouchableOpacity
              style={styles.sortOrderButton}
              onPress={() => setSortOrder('desc')}
            >
              <Text style={[
                styles.sortOrderText,
                sortOrder === 'desc' && styles.sortOrderTextActive
              ]}>
                Descendente
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.sortOrderButton}
              onPress={() => setSortOrder('asc')}
            >
              <Text style={[
                styles.sortOrderText,
                sortOrder === 'asc' && styles.sortOrderTextActive
              ]}>
                Ascendente
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowSortModal(false)}
          >
            <Text style={styles.modalCloseButtonText}>Cerrar</Text>
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

      {/* Modal de ordenamiento */}
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
    paddingVertical: getVerticalPadding(),
    backgroundColor: Colors.backgroundSecondary,
    borderBottomWidth: getBorderWidth(),
    borderBottomColor: Colors.border,
  },
  backButton: {
    marginRight: getSpacing(16),
    padding: getSpacing(8),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: getTitleFontSize(20),
    fontWeight: '700',
    color: Colors.text,
    marginBottom: getSpacing(4),
  },
  headerSubtitle: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
  },
  filtersContainer: {
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: getVerticalPadding(),
    borderBottomWidth: getBorderWidth(),
    borderBottomColor: Colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(12),
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    marginBottom: getSpacing(16),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: getSpacing(12),
    fontSize: getBodyFontSize(),
    color: Colors.text,
  },
  typeFilters: {
    flexDirection: 'row',
    marginBottom: getSpacing(16),
    gap: getGap(8),
  },
  typeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(20),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    flex: 1,
  },
  typeFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeFilterChipText: {
    fontSize: scaleSize(14),
    color: Colors.textSecondary,
    fontWeight: '500',
    marginLeft: getSpacing(8),
  },
  typeFilterChipTextActive: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  quickFilters: {
    marginBottom: getSpacing(16),
  },
  filterChip: {
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(8),
    borderRadius: getBorderRadius(20),
    marginRight: getSpacing(8),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: scaleSize(14),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: Colors.textDark,
    fontWeight: '600',
  },
  advancedFilters: {
    marginBottom: getSpacing(16),
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  filterButtonText: {
    flex: 1,
    marginLeft: getSpacing(12),
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '500',
  },
  advancedFiltersContent: {
    marginTop: getSpacing(16),
    padding: getSpacing(16),
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  amountFilter: {
    marginBottom: getSpacing(16),
  },
  filterLabel: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '600',
    marginBottom: getSpacing(8),
  },
  amountInputs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(8),
    borderRadius: getBorderRadius(8),
    fontSize: getBodyFontSize(),
    color: Colors.text,
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  amountSeparator: {
    marginHorizontal: getSpacing(8),
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
  },
  dateFilter: {
    marginBottom: getSpacing(16),
  },
  dateInputs: {
    flexDirection: 'row',
    gap: getGap(8),
  },
  dateInput: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(8),
    borderRadius: getBorderRadius(8),
    fontSize: getBodyFontSize(),
    color: Colors.text,
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  clearButton: {
    backgroundColor: Colors.danger,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(8),
    borderRadius: getBorderRadius(8),
  },
  clearButtonText: {
    fontSize: getBodyFontSize(),
    color: Colors.white,
    fontWeight: '600',
  },
  sortContainer: {
    marginBottom: getSpacing(8),
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  sortButtonText: {
    flex: 1,
    marginLeft: getSpacing(12),
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '500',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: getVerticalPadding(),
  },
  transactionsList: {
    gap: getGap(12),
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    ...getShadowSize(2, 4, 0.1),
  },
  transactionIcon: {
    width: getIconSize(48),
    height: getIconSize(48),
    borderRadius: getBorderRadius(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(16),
  },
  transactionDetails: {
    flex: 1,
    marginRight: getSpacing(12),
  },
  transactionTitle: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(4),
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing(2),
  },
  transactionCategory: {
    fontSize: scaleSize(14),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  transactionDate: {
    fontSize: scaleSize(12),
    color: Colors.textSecondary,
  },
  transactionDetail: {
    fontSize: scaleSize(12),
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: scaleSize(14),
    fontWeight: '700',
    textAlign: 'right',
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(16),
    padding: getSpacing(24),
    width: screenWidth * 0.8,
    maxWidth: getMaxWidth(400),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    ...getShadowSize(8, 32, 0.3),
  },
  modalTitle: {
    fontSize: getTitleFontSize(18),
    fontWeight: '700',
    color: Colors.text,
    marginBottom: getSpacing(20),
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getSpacing(12),
    borderBottomWidth: getBorderWidth(),
    borderBottomColor: Colors.border,
  },
  sortOptionText: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '500',
  },
  sortOrderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: getSpacing(16),
    marginBottom: getSpacing(20),
  },
  sortOrderLabel: {
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '600',
    marginRight: getSpacing(12),
  },
  sortOrderButton: {
    backgroundColor: Colors.background,
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(8),
    borderRadius: getBorderRadius(8),
    marginRight: getSpacing(8),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  sortOrderText: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  sortOrderTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: Colors.primary,
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(8),
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: getBodyFontSize(),
    color: Colors.textDark,
    fontWeight: '600',
  },
});
