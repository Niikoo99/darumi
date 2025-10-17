import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  Animated, 
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Modal
} from 'react-native';
import Colors from '../../../assets/shared/Colors';
import { 
  scaleSize, 
  getBodyFontSize, 
  getTitleFontSize,
  getBorderRadius, 
  getSpacing, 
  getShadowSize,
  getBorderWidth,
  getGap
} from '../../../utils/scaling';

const { height: screenHeight } = Dimensions.get('window');

const ScrollableTransactionForm = ({ 
  children, 
  isVisible, 
  onClose,
  title,
  subtitle,
  actionButtons,
  fixedTopComponent
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Animated.View 
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }
          ]}
        >
          {/* Componente fijo en la parte superior */}
          {fixedTopComponent && (
            <View style={styles.fixedTopContainer}>
              {fixedTopComponent}
            </View>
          )}

          {/* Contenido scrollable */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            alwaysBounceVertical={false}
          >
            {children}
          </ScrollView>

          {/* Action Buttons */}
          {actionButtons && (
            <View style={styles.actionButtonsContainer}>
              {actionButtons}
            </View>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing(16),
  },
  container: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(24),
    width: '98%',
    maxHeight: screenHeight * 0.92,
    minHeight: screenHeight * 0.85,
    ...getShadowSize(-10, 20, 0.3),
    borderWidth: getBorderWidth(2),
    borderColor: Colors.border,
    paddingBottom: Platform.OS === 'ios' ? scaleSize(100) : getSpacing(80), // Aumentado el espacio para los botones
  },
  fixedTopContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: getSpacing(28),
    paddingVertical: getSpacing(4),
    borderTopLeftRadius: getBorderRadius(24),
    borderTopRightRadius: getBorderRadius(24),
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    paddingHorizontal: getSpacing(28),
    paddingTop: getSpacing(24),
    paddingBottom: getSpacing(32), // Aumentado para dar más espacio a los botones
    minHeight: screenHeight * 0.6,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: getSpacing(28),
    paddingVertical: getSpacing(16),
    paddingBottom: Platform.OS === 'ios' ? scaleSize(24) : getSpacing(16), // Reducido el safe area
    borderTopWidth: getBorderWidth(),
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    gap: getGap(16),
    ...getShadowSize(-4, 8, 0.1),
  },
});

export default ScrollableTransactionForm;
