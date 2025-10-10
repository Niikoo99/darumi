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
  actionButtons 
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
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.modalIndicator} />
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: Colors.backgroundSecondary,
    borderTopLeftRadius: getBorderRadius(24),
    borderTopRightRadius: getBorderRadius(24),
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.6,
    ...getShadowSize(-10, 20, 0.3),
    borderWidth: getBorderWidth(2),
    borderColor: Colors.border,
    borderBottomWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? scaleSize(100) : getSpacing(80), // Espacio para los botones fijos
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: getSpacing(8),
    paddingBottom: getSpacing(20),
    paddingHorizontal: getSpacing(24),
    borderTopLeftRadius: getBorderRadius(24),
    borderTopRightRadius: getBorderRadius(24),
    alignItems: 'center',
  },
  modalIndicator: {
    width: scaleSize(40),
    height: scaleSize(4),
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
    borderRadius: getBorderRadius(2),
    marginBottom: getSpacing(16),
  },
  title: {
    fontSize: getTitleFontSize(24),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: getSpacing(8),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: scaleSize(14),
    color: 'rgba(26, 26, 26, 0.8)',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    paddingHorizontal: getSpacing(24),
    paddingTop: getSpacing(24),
    paddingBottom: getSpacing(20), // Reducido porque el contenedor ya tiene paddingBottom
    minHeight: screenHeight * 0.4,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: getSpacing(24),
    paddingVertical: getSpacing(20),
    paddingBottom: Platform.OS === 'ios' ? scaleSize(34) : getSpacing(20), // Safe area para iOS
    borderTopWidth: getBorderWidth(),
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    gap: getGap(16),
    ...getShadowSize(-4, 8, 0.1),
  },
});

export default ScrollableTransactionForm;
