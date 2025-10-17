import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import AutoScaleCurrencyText from '../AutoScaleCurrencyText';
import { 
  scaleSize, 
  getBodyFontSize, 
  getTitleFontSize,
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getBorderWidth,
  getGap,
  getIconSize
} from '../../../utils/scaling';

/**
 * Componente reutilizable para mostrar las categorías principales (gastos o ingresos)
 * @param {Object} props - Props del componente
 * @param {string} props.title - Título de la tarjeta
 * @param {Array} props.data - Array de categorías con sus datos
 * @param {number} props.totalAmount - Monto total para calcular porcentajes
 * @param {string} props.themeColor - Color temático para la tarjeta
 * @param {boolean} props.isLoading - Estado de carga
 */
const TopCategoryCard = ({ 
  title, 
  data = [], 
  totalAmount = 0, 
  themeColor = Colors.primary, 
  isLoading = false 
}) => {
  
  // Mapeo de iconos para las categorías
  const categoryIconMap = {
    'Comida/Restaurante': 'hamburger',
    'Transporte': 'car',
    'Combustibles': 'gas-pump',
    'Vestimenta/Calzado': 'tshirt',
    'Mecanica': 'wrench',
    'Electrodomestico': 'home',
    'Varios': 'ellipsis-h',
    'Ingresos': 'money-bill-wave',
    'Salud': 'heartbeat',
    'Educación': 'graduation-cap',
    'Entretenimiento': 'gamepad',
    'Servicios': 'tools',
    'Hogar': 'home',
    'Otros': 'ellipsis-h'
  };

  // Función para obtener el icono de una categoría (memoizada)
  const getCategoryIcon = useMemo(() => {
    return (categoryName) => {
      return categoryIconMap[categoryName] || 'ellipsis-h';
    };
  }, []);

  // Función para renderizar el skeleton loader
  const renderSkeletonLoader = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((index) => (
        <View key={index} style={styles.skeletonItem}>
          <View style={[styles.skeletonIcon, { backgroundColor: Colors.borderLight }]} />
          <View style={styles.skeletonInfo}>
            <View style={[styles.skeletonText, { backgroundColor: Colors.borderLight, width: '60%' }]} />
            <View style={[styles.skeletonText, { backgroundColor: Colors.borderLight, width: '40%' }]} />
          </View>
          <View style={styles.skeletonRight}>
            <View style={[styles.skeletonBar, { backgroundColor: Colors.borderLight }]} />
            <View style={[styles.skeletonText, { backgroundColor: Colors.borderLight, width: '30%' }]} />
          </View>
        </View>
      ))}
    </View>
  );

  // Función para renderizar el estado vacío
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <FontAwesome5 name="chart-bar" size={getIconSize(32)} color={Colors.textSecondary} />
      <Text style={styles.emptyText}>No hay datos para mostrar</Text>
    </View>
  );

  // Función para renderizar las categorías (memoizada)
  const renderCategories = useMemo(() => {
    if (!data || data.length === 0) {
      return (
        <View style={styles.emptyState}>
          <FontAwesome5 name="chart-bar" size={getIconSize(32)} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No hay datos para mostrar</Text>
        </View>
      );
    }

    return (
      <View style={styles.chartContainer}>
        {data.map((category, index) => {
          const iconName = getCategoryIcon(category.categoryName);
          const percentage = category.percentage || 0;
          
          return (
            <View key={category.categoryName || index} style={styles.chartItem}>
              <View style={styles.chartLeftSection}>
                <View style={[styles.chartIcon, { backgroundColor: themeColor }]}>
                  <FontAwesome5 
                    name={iconName} 
                    size={getIconSize(20)} 
                    color="white" 
                    solid={true}
                  />
                </View>
                <View style={styles.chartInfo}>
                  <Text style={styles.chartCategory}>{category.categoryName}</Text>
                  <AutoScaleCurrencyText 
                    value={category.totalAmount} 
                    variant="small"
                    style={[styles.chartAmount, { color: themeColor }]}
                    testID={`category-amount-${index}`}
                  />
                </View>
              </View>
              
              <View style={styles.chartRightSection}>
                <View style={styles.chartBar}>
                  <View 
                    style={[
                      styles.chartBarFill, 
                      { 
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: themeColor
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chartPercentage}>{Math.round(percentage)}%</Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  }, [data, themeColor, getCategoryIcon]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <FontAwesome5 
            name={title.includes('Gastos') ? 'chart-line' : 'arrow-up'} 
            size={getIconSize(18)} 
            color={themeColor} 
            solid={true}
            style={styles.titleIcon}
          />
          <Text style={styles.title}>{title}</Text>
        </View>
        {totalAmount > 0 && (
          <AutoScaleCurrencyText 
            value={totalAmount} 
            variant="small"
            style={[styles.totalAmount, { color: themeColor }]}
          />
        )}
      </View>
      
      {isLoading ? renderSkeletonLoader() : renderCategories}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(20),
    padding: getSpacing(24),
    marginBottom: getSpacing(20),
    borderWidth: getBorderWidth(2),
    borderColor: Colors.border,
    ...getShadowSize(8, 32, 0.1),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getSpacing(20),
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleIcon: {
    marginRight: getSpacing(12),
  },
  title: {
    fontSize: getTitleFontSize(18),
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  totalAmount: {
    fontSize: getBodyFontSize(14),
    fontWeight: '700',
    marginLeft: getSpacing(12),
  },
  chartContainer: {
    gap: getGap(16),
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getSpacing(8),
    paddingHorizontal: getSpacing(12),
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(1),
    borderColor: Colors.borderLight,
  },
  chartLeftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: getSpacing(12),
  },
  chartIcon: {
    width: getIconSize(36),
    height: getIconSize(36),
    borderRadius: getBorderRadius(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: getSpacing(12),
  },
  chartInfo: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  chartCategory: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(2),
  },
  chartAmount: {
    fontSize: scaleSize(12),
    fontWeight: '500',
  },
  chartRightSection: {
    alignItems: 'flex-end',
    minWidth: scaleSize(80),
  },
  chartBar: {
    height: scaleSize(6),
    backgroundColor: Colors.borderLight,
    borderRadius: getBorderRadius(3),
    overflow: 'hidden',
    width: scaleSize(60),
    marginBottom: getSpacing(4),
  },
  chartBarFill: {
    height: '100%',
    borderRadius: getBorderRadius(3),
  },
  chartPercentage: {
    fontSize: scaleSize(10),
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: getSpacing(40),
  },
  emptyText: {
    fontSize: scaleSize(14),
    color: Colors.textSecondary,
    marginTop: getSpacing(8),
  },
  // Estilos para el skeleton loader
  skeletonContainer: {
    gap: getGap(16),
  },
  skeletonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: getSpacing(8),
    paddingHorizontal: getSpacing(12),
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(1),
    borderColor: Colors.borderLight,
  },
  skeletonIcon: {
    width: getIconSize(36),
    height: getIconSize(36),
    borderRadius: getBorderRadius(18),
    marginRight: getSpacing(12),
  },
  skeletonInfo: {
    flex: 1,
    marginRight: getSpacing(12),
  },
  skeletonText: {
    height: scaleSize(12),
    borderRadius: getBorderRadius(6),
    marginBottom: getSpacing(4),
  },
  skeletonRight: {
    alignItems: 'flex-end',
    minWidth: scaleSize(80),
  },
  skeletonBar: {
    height: scaleSize(6),
    borderRadius: getBorderRadius(3),
    width: scaleSize(60),
    marginBottom: getSpacing(4),
  },
});

export default TopCategoryCard;
