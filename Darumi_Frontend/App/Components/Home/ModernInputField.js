import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Animated 
} from 'react-native';
import Colors from '../../../assets/shared/Colors';

const ModernInputField = ({ 
  label, 
  placeholder, 
  value, 
  onChangeText, 
  multiline = false, 
  numberOfLines = 1,
  isOptional = false,
  keyboardType = 'default'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const focusAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnim, {
      toValue: 1,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnim, {
      toValue: 0,
      tension: 100,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255, 255, 255, 0.1)', Colors.primary],
  });

  const backgroundColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.backgroundSecondary, 'rgba(255, 233, 0, 0.1)'],
  });

  const shadowOpacity = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.1, 0.2],
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }
      ]}
    >
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {isOptional && (
          <Text style={styles.optionalLabel}>(opcional)</Text>
        )}
      </View>
      
      <Animated.View 
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor,
            shadowOpacity,
          }
        ]}
      >
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput
          ]}
          placeholder={placeholder}
          placeholderTextColor="rgba(255, 255, 255, 0.5)"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={multiline}
          numberOfLines={numberOfLines}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? 'top' : 'center'}
          returnKeyType={multiline ? 'default' : 'next'}
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  optionalLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 4,
  },
  input: {
    padding: 18,
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'System',
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
});

export default ModernInputField;
