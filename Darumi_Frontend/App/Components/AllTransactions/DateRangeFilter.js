import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../../assets/shared/Colors';
import {
  scaleSize,
  getBodyFontSize,
  getTitleFontSize,
  getBorderRadius,
  getSpacing,
  getShadowSize,
  getBorderWidth,
  getIconSize,
  getMinWidth,
} from '../../../utils/scaling';

const DateRangeFilter = ({ dateRange, onDateRangeChange }) => {
  const [showModal, setShowModal] = useState(false);

  const predefinedRanges = [
    {
      label: 'Última semana',
      value: {
        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
    {
      label: 'Último mes',
      value: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
    {
      label: 'Últimos 3 meses',
      value: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
    {
      label: 'Este año',
      value: {
        start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        end: new Date().toISOString().split('T')[0],
      },
    },
  ];

  const formatDateRange = () => {
    if (!dateRange.start && !dateRange.end) {
      return 'Seleccionar fechas';
    }
    
    const start = dateRange.start ? new Date(dateRange.start).toLocaleDateString('es-AR') : '';
    const end = dateRange.end ? new Date(dateRange.end).toLocaleDateString('es-AR') : '';
    
    if (start && end) {
      return `${start} - ${end}`;
    } else if (start) {
      return `Desde ${start}`;
    } else if (end) {
      return `Hasta ${end}`;
    }
    
    return 'Seleccionar fechas';
  };

  const handlePresetSelect = (preset) => {
    onDateRangeChange(preset.value);
    setShowModal(false);
  };

  const clearDateRange = () => {
    onDateRangeChange({ start: '', end: '' });
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowModal(true)}
      >
        <FontAwesome5 name="calendar-alt" size={getIconSize(14)} color={Colors.primary} />
        <Text style={styles.dateButtonText}>{formatDateRange()}</Text>
        <FontAwesome5 name="chevron-down" size={getIconSize(12)} color={Colors.primary} />
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar rango de fechas</Text>
            
            <ScrollView style={styles.presetsContainer}>
              {predefinedRanges.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetOption}
                  onPress={() => handlePresetSelect(preset)}
                >
                  <FontAwesome5 name="calendar" size={getIconSize(16)} color={Colors.textSecondary} />
                  <Text style={styles.presetText}>{preset.label}</Text>
                  <FontAwesome5 name="chevron-right" size={getIconSize(12)} color={Colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearDateRange}
              >
                <Text style={styles.clearButtonText}>Limpiar fechas</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.closeButtonText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: getSpacing(12), // Reducido de 16
    paddingVertical: getSpacing(10), // Reducido de 12
    borderRadius: getBorderRadius(10), // Reducido de 12
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    marginBottom: getSpacing(8),
  },
  dateButtonText: {
    flex: 1,
    marginLeft: getSpacing(8), // Reducido de 12
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '500',
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
    width: '90%',
    maxWidth: getMinWidth(400),
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
  presetsContainer: {
    maxHeight: scaleSize(300),
    marginBottom: getSpacing(20),
  },
  presetOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing(16),
    paddingHorizontal: getSpacing(12),
    backgroundColor: Colors.background,
    borderRadius: getBorderRadius(8),
    marginBottom: getSpacing(8),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  presetText: {
    flex: 1,
    marginLeft: getSpacing(12),
    fontSize: getBodyFontSize(),
    color: Colors.text,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    gap: getSpacing(12),
  },
  clearButton: {
    flex: 1,
    backgroundColor: Colors.danger,
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(8),
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: getBodyFontSize(),
    color: Colors.white,
    fontWeight: '600',
  },
  closeButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(8),
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: getBodyFontSize(),
    color: Colors.textDark,
    fontWeight: '600',
  },
});

export default DateRangeFilter;
