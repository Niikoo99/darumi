import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import { formatCurrency } from '../../../utils/formatting';

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
                <FontAwesome5 name={config.icon} size={16} color="white" />
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
            <FontAwesome5 name="chart-bar" size={32} color={Colors.textSecondary} />
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
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 32,
    elevation: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
    color: Colors.text,
  },
  chartContainer: {
    gap: 12,
  },
  chartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chartIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chartInfo: {
    flex: 1,
  },
  chartCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  chartAmount: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    flexWrap: 'wrap',
  },
  chartBar: {
    height: 8,
    backgroundColor: Colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    width: 80,
  },
  chartBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});

export default CategoryChart;
