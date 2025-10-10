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

const { height: screenHeight } = Dimensions.get('window');

const ScrollableTransactionForm = ({ 
  children, 
  isVisible, 
  onClose,
  title,
  subtitle 
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
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: screenHeight * 0.9,
    minHeight: screenHeight * 0.6,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: -10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderBottomWidth: 0,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: 8,
    paddingBottom: 20,
    paddingHorizontal: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    alignItems: 'center',
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
    borderRadius: 2,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(26, 26, 26, 0.8)',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 24,
    minHeight: screenHeight * 0.5,
  },
});

export default ScrollableTransactionForm;
