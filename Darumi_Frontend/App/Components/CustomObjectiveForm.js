import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';
import objectivesService from '../../services/graphql';
import { formatCurrency } from '../../utils/formatting';

const { height: screenHeight } = Dimensions.get('window');

const CustomObjectiveForm = ({ visible, onClose, onSuccess, userIdentifier }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [objectiveTypes, setObjectiveTypes] = useState([]);
  
  // Form data
  const [titulo, setTitulo] = useState('');
  const [valorObjetivo, setValorObjetivo] = useState('');
  const [tipoObjetivo, setTipoObjetivo] = useState(1);
  const [categoriaObjetivo, setCategoriaObjetivo] = useState(null);
  const [multiplicador, setMultiplicador] = useState('1');
  const [descripcion, setDescripcion] = useState('');

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Load data on mount
  useEffect(() => {
    if (visible) {
      loadFormData();
      // Animar entrada del modal
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
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animar salida del modal
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
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      
      const [categoriesData, typesData] = await Promise.all([
        objectivesService.getCategories(),
        objectivesService.getObjectiveTypes()
      ]);
      
      setCategories(categoriesData);
      setObjectiveTypes(typesData);
      
      // Reset form
      setTitulo('');
      setValorObjetivo('');
      setTipoObjetivo(1);
      setCategoriaObjetivo(null);
      setMultiplicador('1');
      setDescripcion('');
      
    } catch (error) {
      console.error('Error loading form data:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos del formulario');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (!titulo.trim()) {
      errors.push('El título es requerido');
    } else if (titulo.length > 50) {
      errors.push('El título no puede exceder 50 caracteres');
    }
    
    const valor = parseFloat(valorObjetivo);
    if (!valor || valor <= 0) {
      errors.push('El valor objetivo debe ser mayor que 0');
    } else if (valor > 1000000) {
      errors.push('El valor objetivo no puede exceder $1,000,000');
    }
    
    if (tipoObjetivo === 2 && !categoriaObjetivo) {
      errors.push('La categoría es requerida para objetivos por categoría');
    }
    
    const mult = parseFloat(multiplicador);
    if (mult && (mult < 0.1 || mult > 10)) {
      errors.push('El multiplicador debe estar entre 0.1 y 10');
    }
    
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      Alert.alert('Error de validación', errors.join('\n'));
      return;
    }
    
    try {
      setLoading(true);
      
      const objectiveData = {
        titulo: titulo.trim(),
        valorObjetivo: parseFloat(valorObjetivo),
        tipoObjetivo: tipoObjetivo,
        categoriaObjetivo: tipoObjetivo === 2 ? categoriaObjetivo : null,
        multiplicador: parseFloat(multiplicador),
        descripcion: descripcion.trim()
      };
      
      const resultado = await objectivesService.createCustomObjective(userIdentifier, objectiveData);
      
      if (resultado.success) {
        Alert.alert(
          '🎉 ¡Objetivo Creado!',
          resultado.message,
          [
            {
              text: '¡Genial!',
              onPress: () => {
                onSuccess && onSuccess(resultado.objetivo);
                onClose();
              }
            }
          ]
        );
      } else {
        if (resultado.errores && resultado.errores.length > 0) {
          Alert.alert('Error', resultado.errores.join('\n'));
        } else {
          Alert.alert('Error', resultado.message);
        }
      }
      
    } catch (error) {
      console.error('Error creating objective:', error);
      Alert.alert('Error', 'No se pudo crear el objetivo. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Animated.View 
            style={[
              styles.container,
              {
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim }
                ]
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.modalIndicator} />
              <Text style={styles.title}>🎯 Crear Objetivo</Text>
              <Text style={styles.subtitle}>Personaliza tu meta financiera</Text>
            </View>

            <ScrollView 
              style={styles.scrollContainer}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {loading && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={Colors.primary} />
                  <Text style={styles.loadingText}>Cargando datos...</Text>
                </View>
              )}

              {/* Form Fields */}
              <View style={styles.form}>
                {/* Título */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <FontAwesome5 name="bullseye" size={16} color={Colors.primary} />
                    <Text style={styles.label}>Título del Objetivo</Text>
                    <Text style={styles.required}>*</Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={titulo}
                      onChangeText={setTitulo}
                      placeholder="Ej: Control gastos restaurantes"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      maxLength={50}
                      editable={!loading}
                    />
                  </View>
                  <View style={styles.fieldFooter}>
                    <Text style={styles.characterCount}>{titulo.length}/50</Text>
                  </View>
                </View>

                {/* Valor Objetivo */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <FontAwesome5 name="dollar-sign" size={16} color={Colors.primary} />
                    <Text style={styles.label}>Valor Objetivo</Text>
                    <Text style={styles.required}>*</Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={valorObjetivo}
                      onChangeText={setValorObjetivo}
                      placeholder="0"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    💡 Máximo de gasto permitido para este objetivo
                  </Text>
                </View>

                {/* Tipo de Objetivo */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <FontAwesome5 name="list" size={16} color={Colors.primary} />
                    <Text style={styles.label}>Tipo de Objetivo</Text>
                    <Text style={styles.required}>*</Text>
                  </View>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={tipoObjetivo}
                      onValueChange={setTipoObjetivo}
                      enabled={!loading}
                      style={styles.picker}
                    >
                      {objectiveTypes.map((type) => (
                        <Picker.Item
                          key={type.id}
                          label={type.nombre}
                          value={type.id}
                        />
                      ))}
                    </Picker>
                  </View>
                  <Text style={styles.helperText}>
                    {tipoObjetivo === 1 
                      ? '📊 Controla todos los gastos del mes'
                      : '🎯 Controla gastos de una categoría específica'
                    }
                  </Text>
                </View>

                {/* Categoría (solo para tipo 2) */}
                {tipoObjetivo === 2 && (
                  <View style={styles.fieldContainer}>
                    <View style={styles.labelContainer}>
                      <FontAwesome5 name="tag" size={16} color={Colors.primary} />
                      <Text style={styles.label}>Categoría</Text>
                      <Text style={styles.required}>*</Text>
                    </View>
                    <View style={styles.pickerContainer}>
                      <Picker
                        selectedValue={categoriaObjetivo}
                        onValueChange={setCategoriaObjetivo}
                        enabled={!loading}
                        style={styles.picker}
                      >
                        <Picker.Item label="Selecciona una categoría" value={null} />
                        {categories.map((category) => (
                          <Picker.Item
                            key={category.id}
                            label={category.nombre}
                            value={category.id}
                          />
                        ))}
                      </Picker>
                    </View>
                  </View>
                )}

                {/* Multiplicador */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <FontAwesome5 name="star" size={16} color={Colors.primary} />
                    <Text style={styles.label}>Multiplicador de Puntos</Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={styles.textInput}
                      value={multiplicador}
                      onChangeText={setMultiplicador}
                      placeholder="1"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      keyboardType="numeric"
                      editable={!loading}
                    />
                  </View>
                  <Text style={styles.helperText}>
                    ⭐ Factor para calcular puntos al completar (0.1 - 10)
                  </Text>
                </View>

                {/* Descripción */}
                <View style={styles.fieldContainer}>
                  <View style={styles.labelContainer}>
                    <FontAwesome5 name="edit" size={16} color={Colors.primary} />
                    <Text style={styles.label}>Descripción</Text>
                    <Text style={styles.optional}>(opcional)</Text>
                  </View>
                  <View style={styles.inputContainer}>
                    <TextInput
                      style={[styles.textInput, styles.textArea]}
                      value={descripcion}
                      onChangeText={setDescripcion}
                      placeholder="Describe tu objetivo..."
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      multiline
                      numberOfLines={3}
                      editable={!loading}
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Fixed Action Buttons */}
            <View style={styles.fixedButtonsContainer}>
              <TouchableOpacity
                style={styles.fixedCancelButton}
                onPress={handleClose}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={styles.fixedCancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.fixedSubmitButton,
                  loading && styles.fixedDisabledButton
                ]}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <View style={styles.fixedLoadingContainer}>
                    <ActivityIndicator size="small" color={Colors.white} />
                    <Text style={styles.fixedLoadingText}>Creando...</Text>
                  </View>
                ) : (
                  <Text style={styles.fixedSubmitButtonText}>Crear Objetivo</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    flex: 1,
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
    paddingBottom: 100, // Espacio para los botones fijos
    minHeight: screenHeight * 0.4,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  form: {
    paddingVertical: 20,
  },
  fieldContainer: {
    marginBottom: 28,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  required: {
    fontSize: 16,
    color: Colors.danger,
    fontWeight: '700',
  },
  optional: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    fontStyle: 'italic',
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: Colors.backgroundSecondary,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 4,
  },
  textInput: {
    padding: 18,
    fontSize: 16,
    color: Colors.text,
    fontFamily: 'System',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: Colors.backgroundSecondary,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 4,
    elevation: 4,
  },
  picker: {
    height: 60,
    color: Colors.text,
  },
  fieldFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  helperText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8,
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    gap: 16,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  submitButton: {
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  // Fixed Action Buttons (igual que otros formularios)
  fixedButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: 24,
    paddingVertical: 20,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20, // Safe area para iOS
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    gap: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  fixedCancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fixedCancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  fixedSubmitButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fixedSubmitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  fixedDisabledButton: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  fixedLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  fixedLoadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
};

export default CustomObjectiveForm;
