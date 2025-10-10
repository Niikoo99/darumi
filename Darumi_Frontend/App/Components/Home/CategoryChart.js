import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import { formatCurrency } from '../../../utils/formatting';
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
          
          return (
            <View key={category.id || index} style={styles.chartItem}>
              <View style={[styles.chartIcon, { backgroundColor: config.color }]}>
                <FontAwesome5 name={config.icon} size={getIconSize(16)} color="white" />
              </View>
              
              <View style={styles.chartInfo}>
                <Text style={styles.chartCategory}>{category.name}</Text>
                <Text style={styles.chartAmount}>{formatCurrency(category.total)}</Text>
              </View>
              
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
    gap: getGap(12),
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getGap(12),
  },
  chartIcon: {
    width: getIconSize(40),
    height: getIconSize(40),
    borderRadius: getBorderRadius(20),
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartInfo: {
    flex: 1,
  },
  chartCategory: {
    fontSize: scaleSize(14),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(2),
  },
  chartAmount: {
    fontSize: scaleSize(11),
    color: Colors.textSecondary,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  chartBar: {
    height: scaleSize(8),
    backgroundColor: Colors.borderLight,
    borderRadius: getBorderRadius(4),
    overflow: 'hidden',
    width: scaleSize(80),
  },
  chartBarFill: {
    height: '100%',
    borderRadius: getBorderRadius(4),
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
