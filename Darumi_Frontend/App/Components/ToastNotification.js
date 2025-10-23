import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { 
  getHorizontalPadding, 
  getVerticalPadding, 
  getBodyFontSize, 
  getSmallFontSize, 
  getBorderRadius, 
  getIconSize, 
  getSpacing, 
  getShadowSize, 
  getGap
} from '../../utils/scaling';

const { width: screenWidth } = Dimensions.get('window');

// Tipos de notificación
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

// Configuración de tipos - Colores directos que funcionan
const NOTIFICATION_CONFIG = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    backgroundColor: '#28a745',
    icon: 'check-circle',
    iconColor: '#ffffff',
    textColor: '#ffffff',
  },
  [NOTIFICATION_TYPES.ERROR]: {
    backgroundColor: '#dc3545',
    icon: 'times-circle',
    iconColor: '#ffffff',
    textColor: '#ffffff',
  },
  [NOTIFICATION_TYPES.WARNING]: {
    backgroundColor: '#ffc107',
    icon: 'exclamation-triangle',
    iconColor: '#000000',
    textColor: '#000000',
  },
  [NOTIFICATION_TYPES.INFO]: {
    backgroundColor: '#007bff',
    icon: 'info-circle',
    iconColor: '#ffffff',
    textColor: '#ffffff',
  },
};

const ToastNotification = ({ 
  visible, 
  type = NOTIFICATION_TYPES.INFO, 
  title, 
  message, 
  duration = 4000, 
  onPress, 
  actionText = 'Ver detalles',
  showAction = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timeoutRef = useRef(null);

  const config = NOTIFICATION_CONFIG[type];

  useEffect(() => {
    if (visible && !isVisible) {
      showToast();
    } else if (!visible && isVisible) {
      hideToast();
    }
  }, [visible]);

  const showToast = () => {
    setIsVisible(true);
    
    // Resetear animaciones
    slideAnim.setValue(-200);
    opacityAnim.setValue(0);
    
    // Animación de entrada
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss después del tiempo especificado
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      hideToast();
    }, duration);
  };

  const hideToast = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
    hideToast();
  };

  const handleDismiss = () => {
    hideToast();
  };

  if (!isVisible) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} pointerEvents="box-none">
      <Animated.View
        style={[
          styles.toast,
          {
            backgroundColor: config.backgroundColor,
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.toastContent}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <View style={styles.toastLeft}>
            <View style={styles.iconContainer}>
              <FontAwesome5 
                name={config.icon} 
                size={getIconSize(20)} 
                color={config.iconColor} 
              />
            </View>
            
            <View style={styles.textContainer}>
              {title && (
                <Text style={[styles.title, { color: config.textColor }]}>
                  {title}
                </Text>
              )}
              <Text style={[styles.message, { color: config.textColor }]}>
                {message}
              </Text>
            </View>
          </View>

          <View style={styles.toastRight}>
            {showAction && (
              <TouchableOpacity
                style={[styles.actionButton, { 
                  backgroundColor: config.textColor === '#ffffff' 
                    ? 'rgba(255, 255, 255, 0.2)' 
                    : 'rgba(0, 0, 0, 0.2)' 
                }]}
                onPress={handlePress}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionText, { color: config.textColor }]}>
                  {actionText}
                </Text>
                <FontAwesome5 
                  name="arrow-right" 
                  size={getIconSize(12)} 
                  color={config.textColor} 
                />
              </TouchableOpacity>
            )}
            
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              activeOpacity={0.7}
            >
              <FontAwesome5 
                name="times" 
                size={getIconSize(14)} 
                color={config.textColor} 
              />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
};

// Hook simplificado basado en el SimpleToastTest que funciona
export const useToastNotification = () => {
  const [toastData, setToastData] = useState({
    visible: false,
    type: NOTIFICATION_TYPES.INFO,
    title: '',
    message: '',
    duration: 4000,
    onPress: null,
    actionText: 'Ver detalles',
    showAction: true,
  });

  const showToast = (options) => {
    // Ocultar toast actual si está visible
    if (toastData.visible) {
      setToastData(prev => ({ ...prev, visible: false }));
    }
    
    // Mostrar nuevo toast después de un delay
    setTimeout(() => {
      setToastData({
        visible: true,
        type: NOTIFICATION_TYPES.INFO,
        title: '',
        message: '',
        duration: 4000,
        onPress: null,
        actionText: 'Ver detalles',
        showAction: true,
        ...options,
      });
    }, 100);
  };

  const hideToast = () => {
    setToastData(prev => ({ ...prev, visible: false }));
  };

  const showSuccess = (title, message, options = {}) => {
    showToast({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      ...options,
    });
  };

  const showError = (title, message, options = {}) => {
    showToast({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message,
      ...options,
    });
  };

  const showWarning = (title, message, options = {}) => {
    showToast({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      ...options,
    });
  };

  const showInfo = (title, message, options = {}) => {
    showToast({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      ...options,
    });
  };

  return {
    toast: toastData,
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: getHorizontalPadding(),
    paddingTop: getVerticalPadding(),
  },
  toast: {
    borderRadius: getBorderRadius(12),
    marginHorizontal: getHorizontalPadding(),
    ...getShadowSize(8, 16, 0.2),
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing(12),
    paddingHorizontal: getSpacing(16),
  },
  toastLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: getSpacing(12),
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: getBodyFontSize(),
    fontWeight: '600',
    marginBottom: getSpacing(2),
  },
  message: {
    fontSize: getSmallFontSize(),
    opacity: 0.9,
    lineHeight: getSmallFontSize() * 1.4,
  },
  toastRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: getSpacing(6),
    paddingHorizontal: getSpacing(10),
    borderRadius: getBorderRadius(16),
    marginRight: getSpacing(8),
  },
  actionText: {
    fontSize: getSmallFontSize(),
    fontWeight: '600',
    marginRight: getSpacing(4),
  },
  dismissButton: {
    padding: getSpacing(4),
  },
});

export default ToastNotification;