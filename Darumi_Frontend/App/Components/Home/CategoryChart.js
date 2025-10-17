import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import { formatCurrency } from '../../../utils/formatting';
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

const CategoryChart = ({ categories = [] }) => {
  // Mapeo de categorías a iconos y colores
  const categoryConfig = {
    'Comida/Restaurante': { icon: 'hamburger', color: '#ff6b6b' },
    'Transporte': { icon: 'car', color: '#4ecdc4' },
    'Combustibles': { icon: 'gas-pump', color: '#45b7d1' },
    'Vestimenta/Calzado': { icon: 'tshirt', color: '#96ceb4' },
    'Mecanica': { icon: 'wrench', color: '#feca57' },
    'Electrodomestico': { icon: 'home', color: '#ff9ff3' },
    'Varios': { icon: 'ellipsis-h', color: '#a55eea' },
  };

  // Ordenar categorías por monto (descendente) y tomar las top 3
  const topCategories = categories
    .sort((a, b) => Math.abs(b.total) - Math.abs(a.total))
    .slice(0, 3);

  const maxAmount = topCategories.length > 0 ? Math.abs(topCategories[0].total) : 1;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📊 Top Categorías del Mes</Text>
      
      <View style={styles.chartContainer}>
        {topCategories.map((category, index) => {
          const config = categoryConfig[category.name] || categoryConfig['Varios'];
          const percentage = maxAmount > 0 ? (Math.abs(category.total) / maxAmount) * 100 : 0;
          
          // Determinar si es gasto o ingreso basado en el nombre de la categoría
          const isIncome = category.name === 'Ingresos';
          const isExpense = !isIncome && category.total < 0;
          
          return (
            <View key={category.id || index} style={styles.chartItem}>
              <View style={styles.chartLeftSection}>
                <View style={[styles.chartIcon, { backgroundColor: config.color }]}>
                  <FontAwesome5 name={config.icon} size={getIconSize(16)} color="white" />
                </View>
                <View style={styles.chartInfo}>
                  <Text style={styles.chartCategory}>{category.name}</Text>
                  <AutoScaleCurrencyText 
                    value={category.total} 
                    variant="small"
                    style={[
                      styles.chartAmount,
                      isIncome ? { color: Colors.success } : 
                      isExpense ? { color: Colors.danger } : 
                      { color: Colors.text }
                    ]}
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
                        width: `${percentage}%`,
                        backgroundColor: config.color
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.chartPercentage}>{Math.round(percentage)}%</Text>
              </View>
            </View>
          );
        })}
        
        {topCategories.length === 0 && (
          <View style={styles.emptyState}>
            <FontAwesome5 name="chart-bar" size={getIconSize(32)} color={Colors.textSecondary} />
            <Text style={styles.emptyText}>No hay datos para mostrar</Text>
          </View>
        )}
      </View>
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
  title: {
    fontSize: getTitleFontSize(18),
    fontWeight: '600',
    marginBottom: getSpacing(20),
    color: Colors.text,
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
    color: Colors.textSecondary,
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
});

export default CategoryChart;
