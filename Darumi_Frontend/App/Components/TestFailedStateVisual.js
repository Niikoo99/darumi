/**
 * Componente de prueba para verificar el estado visual "Fallido"
 * Este componente simula diferentes estados de objetivos para testing
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../assets/shared/Colors';
import { formatCurrency } from '../utils/formatting';
import { 
  getSpacing, 
  getBorderRadius, 
  getBorderWidth, 
  getBodyFontSize, 
  getSmallFontSize,
  getIconSize,
  getShadowSize,
  getTitleFontSize
} from '../utils/scaling';

// Datos de prueba para diferentes estados de objetivos
const testObjectives = [
  {
    id: 1,
    titulo: "Control de Gastos Generales",
    descripcion: "Mantener gastos bajo control",
    estado: "En progreso",
    actual: 180000,
    meta: 250000,
    color: Colors.primary,
    icono: "chart-line"
  },
  {
    id: 2,
    titulo: "Límite Restaurantes",
    descripcion: "Controlar gastos en restaurantes",
    estado: "Fallido",
    actual: 60000,
    meta: 50000,
    color: Colors.danger,
    icono: "utensils"
  },
  {
    id: 3,
    titulo: "Gastos Supermercado",
    descripcion: "Presupuesto mensual de supermercado",
    estado: "Fallido",
    actual: 260000,
    meta: 250000,
    color: Colors.danger,
    icono: "shopping-cart"
  },
  {
    id: 4,
    titulo: "Transporte",
    descripcion: "Gastos de transporte público",
    estado: "Cumplido",
    actual: 45000,
    meta: 50000,
    color: Colors.success,
    icono: "bus"
  }
];

const TestFailedStateVisual = () => {
  // Función para determinar el color de consumo
  const getConsumptionColor = (percentage) => {
    if (percentage <= 75) return Colors.success;
    if (percentage <= 90) return Colors.warning;
    if (percentage <= 100) return '#F44336';
    return '#D32F2F';
  };

  // Función para determinar el estado del consumo
  const getConsumptionState = (percentage) => {
    if (percentage <= 75) return 'safe';
    if (percentage <= 90) return 'warning';
    if (percentage <= 100) return 'danger';
    return 'failed';
  };

  const renderProgressBar = (objetivo) => {
    // Calcular el porcentaje real basado en valor_actual / valor_objetivo
    const porcentajeReal = (objetivo.actual / objetivo.meta) * 100;
    const porcentajeRedondeado = Math.round(porcentajeReal);
    
    // Para objetivos fallidos, usar color rojo de peligro
    const isFailed = objetivo.estado === 'Fallido';
    const consumptionColor = isFailed ? Colors.danger : getConsumptionColor(porcentajeReal);
    const consumptionState = isFailed ? 'failed' : getConsumptionState(porcentajeReal);
    
    // Estilo dinámico para el texto según el estado
    const getTextStyle = () => {
      const baseStyle = styles.progressText;
      if (consumptionState === 'failed' || isFailed) {
        return [baseStyle, { color: Colors.danger, fontWeight: '700' }];
      } else if (consumptionState === 'danger') {
        return [baseStyle, { color: '#F44336', fontWeight: '600' }];
      } else if (consumptionState === 'warning') {
        return [baseStyle, { color: '#FFA500', fontWeight: '600' }];
      }
      return baseStyle;
    };
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${Math.min(porcentajeReal, 100)}%`,
                backgroundColor: consumptionColor,
              },
            ]}
          />
          {/* Barra de fondo para mostrar el exceso cuando se supera el 100% */}
          {porcentajeReal > 100 && (
            <View
              style={[
                styles.progressFill,
                styles.progressExcess,
                {
                  width: `${porcentajeReal - 100}%`,
                  backgroundColor: Colors.dangerDark,
                },
              ]}
            />
          )}
        </View>
        <Text style={getTextStyle()}>{porcentajeRedondeado}% consumido</Text>
      </View>
    );
  };

  const renderObjectiveCard = (objetivo) => (
    <View
      key={objetivo.id}
      style={[
        styles.objectiveCard,
        {
          borderColor: objetivo.estado === 'Fallido' ? Colors.danger : objetivo.color,
        },
      ]}
    >
      <View style={styles.objectiveHeader}>
        <View style={[styles.iconContainer, { backgroundColor: `${objetivo.color}20` }]}>
          <FontAwesome5 name={objetivo.icono} size={24} color={objetivo.color} />
        </View>
        <View style={styles.objectiveInfo}>
          <Text style={styles.objectiveTitle}>{objetivo.titulo}</Text>
          <Text style={styles.objectiveDescription}>{objetivo.descripcion}</Text>
        </View>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: objetivo.estado === 'Fallido' ? Colors.danger : objetivo.color }
        ]}>
          <Text style={styles.statusText}>{objetivo.estado}</Text>
        </View>
      </View>

      {(objetivo.estado === "En progreso" || objetivo.estado === "Fallido") && (
        <View style={styles.progressSection}>
          {renderProgressBar(objetivo)}
          <View style={styles.progressDetails}>
            <Text style={styles.progressAmount}>
              {formatCurrency(objetivo.actual)} / {formatCurrency(objetivo.meta)}
            </Text>
          </View>
        </View>
      )}

      {objetivo.estado === "Cumplido" && (
        <View style={styles.completedSection}>
          <FontAwesome5 name="check-circle" size={20} color={Colors.success} />
          <Text style={styles.completedText}>¡Objetivo completado!</Text>
          <Text style={styles.pointsText}>+{Math.floor((objetivo.meta - objetivo.actual) * 0.1)} puntos</Text>
        </View>
      )}

      {objetivo.estado === "Fallido" && (
        <View style={styles.failedSection}>
          <View style={styles.failedHeader}>
            <FontAwesome5 name="times-circle" size={20} color={Colors.danger} />
            <Text style={styles.failedText}>Objetivo excedido</Text>
          </View>
          <Text style={styles.failedReason}>
            Has gastado {Math.round((objetivo.actual / objetivo.meta) * 100)}% de tu límite de {formatCurrency(objetivo.meta)}
          </Text>
          <Text style={styles.failedExcess}>
            Exceso: {formatCurrency(objetivo.actual - objetivo.meta)}
          </Text>
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🧪 Test: Estado Visual "Fallido"</Text>
        <Text style={styles.headerSubtitle}>Verificación de cambios visuales</Text>
      </View>
      
      <View style={styles.content}>
        {testObjectives.map(renderObjectiveCard)}
      </View>
      
      <View style={styles.testInfo}>
        <Text style={styles.testInfoTitle}>📋 Casos de Prueba:</Text>
        <Text style={styles.testInfoText}>• Objetivo 1: En progreso (72% - Normal)</Text>
        <Text style={styles.testInfoText}>• Objetivo 2: Fallido (120% - Exceso)</Text>
        <Text style={styles.testInfoText}>• Objetivo 3: Fallido (104% - Exceso)</Text>
        <Text style={styles.testInfoText}>• Objetivo 4: Cumplido (90% - Completado)</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingVertical: getSpacing(20),
    paddingHorizontal: getSpacing(16),
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
  content: {
    padding: getSpacing(16),
  },
  objectiveCard: {
    backgroundColor: Colors.backgroundCard,
    borderWidth: getBorderWidth(),
    borderRadius: getBorderRadius(),
    padding: getSpacing(20),
    marginBottom: getSpacing(16),
  },
  objectiveHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(16),
  },
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(16),
    borderRadius: getBorderRadius(25),
  },
  objectiveInfo: {
    flex: 1,
  },
  objectiveTitle: {
    fontSize: getTitleFontSize(18),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(4),
  },
  objectiveDescription: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: getSpacing(12),
    paddingVertical: getSpacing(6),
    borderRadius: getBorderRadius(16),
  },
  statusText: {
    fontSize: getSmallFontSize(),
    fontWeight: '600',
    color: Colors.textDark,
  },
  progressSection: {
    marginTop: getSpacing(16),
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(8),
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.borderLight,
    marginRight: getSpacing(12),
    borderRadius: getBorderRadius(4),
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    borderRadius: getBorderRadius(4),
  },
  progressExcess: {
    position: 'absolute',
    right: 0,
    opacity: 0.8,
  },
  progressText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
  },
  progressDetails: {
    alignItems: 'center',
  },
  progressAmount: {
    fontSize: getSmallFontSize(),
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
  },
  completedSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.completed,
    padding: getSpacing(12),
    borderRadius: getBorderRadius(12),
    marginTop: getSpacing(16),
  },
  completedText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.success,
    marginLeft: getSpacing(8),
    flex: 1,
  },
  pointsText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.success,
  },
  failedSection: {
    backgroundColor: Colors.failed,
    padding: getSpacing(12),
    borderRadius: getBorderRadius(12),
    marginTop: getSpacing(16),
  },
  failedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getSpacing(8),
  },
  failedText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.danger,
    marginLeft: getSpacing(8),
  },
  failedReason: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    marginBottom: getSpacing(4),
  },
  failedExcess: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.danger,
  },
  testInfo: {
    backgroundColor: Colors.backgroundSecondary,
    padding: getSpacing(16),
    margin: getSpacing(16),
    borderRadius: getBorderRadius(),
  },
  testInfoTitle: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: getSpacing(8),
  },
  testInfoText: {
    fontSize: getSmallFontSize(),
    color: Colors.textSecondary,
    marginBottom: getSpacing(4),
  },
});

export default TestFailedStateVisual;
