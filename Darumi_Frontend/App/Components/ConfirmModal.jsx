import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  Dimensions 
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';
import { 
  getSpacing, 
  getBorderRadius, 
  getBorderWidth, 
  getBodyFontSize, 
  getTitleFontSize,
  getShadowSize
} from '../../utils/scaling';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Modal de confirmación reutilizable
 * Diseño coherente con el estilo Darumi
 */
const ConfirmModal = ({
  visible,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  type = 'warning', // 'warning', 'danger', 'info', 'success'
  icon,
  loading = false
}) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Obtener colores según el tipo
  const getTypeColors = () => {
    switch (type) {
      case 'danger':
        return {
          primary: Colors.danger,
          background: `${Colors.danger}10`,
          border: `${Colors.danger}30`,
        };
      case 'success':
        return {
          primary: Colors.success,
          background: `${Colors.success}10`,
          border: `${Colors.success}30`,
        };
      case 'info':
        return {
          primary: Colors.primary,
          background: `${Colors.primary}10`,
          border: `${Colors.primary}30`,
        };
      case 'warning':
      default:
        return {
          primary: Colors.warning,
          background: `${Colors.warning}10`,
          border: `${Colors.warning}30`,
        };
    }
  };

  // Obtener icono según el tipo
  const getTypeIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'danger':
        return 'exclamation-triangle';
      case 'success':
        return 'check-circle';
      case 'info':
        return 'info-circle';
      case 'warning':
      default:
        return 'exclamation-triangle';
    }
  };

  const colors = getTypeColors();
  const iconName = getTypeIcon();

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.modal}>
            {/* Icono */}
            <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
              <FontAwesome5 
                name={iconName} 
                size={32} 
                color={colors.primary} 
              />
            </View>

            {/* Título */}
            {title && (
              <Text style={styles.title}>
                {title}
              </Text>
            )}

            {/* Mensaje */}
            {message && (
              <Text style={styles.message}>
                {message}
              </Text>
            )}

            {/* Botones */}
            <View style={styles.buttonsContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.cancelButton]}
                onPress={onCancel}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>
                  {cancelText}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.button, 
                  styles.confirmButton,
                  { backgroundColor: colors.primary }
                ]}
                onPress={onConfirm}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.confirmButtonText}>
                      Procesando...
                    </Text>
                  </View>
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {confirmText}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing(20),
  },
  
  modalContainer: {
    width: '100%',
    maxWidth: screenWidth * 0.9,
  },
  
  modal: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(16),
    padding: getSpacing(24),
    alignItems: 'center',
    ...getShadowSize(8, 16, 0.3),
  },
  
  iconContainer: {
    width: getSpacing(64),
    height: getSpacing(64),
    borderRadius: getSpacing(32),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: getSpacing(16),
  },
  
  title: {
    fontSize: getTitleFontSize(20),
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: getSpacing(12),
  },
  
  message: {
    fontSize: getBodyFontSize(),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: getSpacing(20),
    marginBottom: getSpacing(24),
  },
  
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: getSpacing(12),
  },
  
  button: {
    flex: 1,
    paddingVertical: getSpacing(14),
    paddingHorizontal: getSpacing(20),
    borderRadius: getBorderRadius(8),
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: getSpacing(48),
  },
  
  cancelButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
  },
  
  confirmButton: {
    ...getShadowSize(2, 4, 0.2),
  },
  
  cancelButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.text,
  },
  
  confirmButtonText: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    color: Colors.white,
  },
  
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getSpacing(8),
  },
});

export default ConfirmModal;
