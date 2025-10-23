import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '../../assets/shared/Colors';
import objectivesService from '../../services/graphql';
import { formatCurrency } from '../../utils/formatting';
import { 
  scaleSize, 
  scaleFont, 
  getHorizontalPadding, 
  getVerticalPadding, 
  getTitleFontSize, 
  getBodyFontSize, 
  getSmallFontSize, 
  getBorderRadius, 
  getIconSize, 
  getSpacing, 
  getButtonSize, 
  getCardSize, 
  getHeaderSize, 
  getStatsBarSize, 
  getIconContainerSize, 
  getProgressBarSize, 
  getBadgeSize, 
  getShadowSize, 
  getBorderWidth, 
  getGap, 
  getMinWidth, 
  getMaxWidth 
} from '../../utils/scaling';

const { height: screenHeight } = Dimensions.get('window');

// Constants for objective types
const OBJECTIVE_TYPES = {
  GENERAL_EXPENSES: 1,
  CATEGORY_EXPENSES: 2
};

const CustomObjectiveForm = ({ visible, onClose, onSuccess, userIdentifier }) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [objectiveTypes, setObjectiveTypes] = useState([]);
  
  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [titulo, setTitulo] = useState('');
  const [valorObjetivo, setValorObjetivo] = useState('');
  const [tipoObjetivo, setTipoObjetivo] = useState(1);
  const [categoriaObjetivo, setCategoriaObjetivo] = useState(null);
  const [descripcion, setDescripcion] = useState('');

  // Animaciones
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const stepAnim = useRef(new Animated.Value(0)).current;

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
      // Reset wizard state
      setCurrentStep(1);
    setTitulo('');
    setValorObjetivo('');
    setTipoObjetivo(1);
    setCategoriaObjetivo(null);
    setDescripcion('');
      
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

  // Animate step transitions
  useEffect(() => {
    Animated.timing(stepAnim, {
      toValue: currentStep,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentStep]);

  const loadFormData = async () => {
    try {
      setLoading(true);
      
      const [categoriesData, typesData] = await Promise.all([
        objectivesService.getCategories(),
        objectivesService.getObjectiveTypes()
      ]);
      
      setCategories(categoriesData);
      
      // Fallback data para tipos de objetivos si la API no devuelve datos
      const fallbackTypes = [
        { id: 1, nombre: 'Gastos generales' },
        { id: 2, nombre: 'Gastos por categoria' }
      ];
      
      // Usar datos de la API si están disponibles, sino usar fallback
      const finalTypes = typesData && typesData.length > 0 ? typesData : fallbackTypes;
      
      setObjectiveTypes(finalTypes);
      
    } catch (error) {
      console.error('Error loading form data:', error);
      
      // En caso de error, usar datos de fallback
      const fallbackTypes = [
        { id: 1, nombre: 'Gastos generales' },
        { id: 2, nombre: 'Gastos por categoria' }
      ];
      
      setObjectiveTypes(fallbackTypes);
      setCategories([]);
      
      Alert.alert('Error', 'No se pudieron cargar los datos del formulario. Usando configuración por defecto.');
    } finally {
      setLoading(false);
    }
  };

  const validateStep1 = () => {
    return tipoObjetivo !== null;
  };

  const validateStep2 = () => {
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
    
    if (tipoObjetivo === OBJECTIVE_TYPES.CATEGORY_EXPENSES && !categoriaObjetivo) {
      errors.push('La categoría es requerida para objetivos por categoría');
    }
    
    return errors;
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
      }
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    }
  };

  const handleSubmit = async () => {
    const errors = validateStep2();
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
        categoriaObjetivo: tipoObjetivo === OBJECTIVE_TYPES.CATEGORY_EXPENSES ? categoriaObjetivo : null,
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

  // Dynamic modal sizing based on current step
  const getModalHeight = () => {
    if (currentStep === 1) {
      // Step 1 has fewer elements, can be smaller
      return {
        maxHeight: screenHeight * 0.9,
        minHeight: screenHeight * 0.7,
      };
    } else {
      // Step 2 has more form fields, needs more space
      return {
        maxHeight: screenHeight * 0.95,
        minHeight: screenHeight * 0.8,
      };
    }
  };

  const modalHeight = getModalHeight();

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
      <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
      <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
    </View>
  );

  const renderStep1 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: stepAnim }]}>
        <View style={styles.stepHeader}>
          <FontAwesome5 name="list" size={getIconSize(28)} color={Colors.primary} />
          <Text style={styles.stepTitle}>Tipo de Objetivo</Text>
          <Text style={styles.stepSubtitle}>Selecciona cómo quieres controlar tus gastos</Text>
        </View>

      <View style={styles.optionsContainer}>
        {objectiveTypes.map((type) => (
          <TouchableOpacity
            key={type.id}
            style={[
              styles.optionCard,
              tipoObjetivo === type.id && styles.optionCardSelected
            ]}
            onPress={() => setTipoObjetivo(type.id)}
            activeOpacity={0.8}
          >
            <View style={styles.optionIcon}>
              <FontAwesome5 
                name={type.id === OBJECTIVE_TYPES.GENERAL_EXPENSES ? "chart-line" : "tag"} 
                size={getIconSize(24)} 
                color={tipoObjetivo === type.id ? Colors.white : Colors.primary} 
              />
            </View>
            <View style={styles.optionContent}>
              <Text style={[
                styles.optionTitle,
                tipoObjetivo === type.id && styles.optionTitleSelected
              ]}>
                {type.nombre}
              </Text>
              <Text style={[
                styles.optionDescription,
                tipoObjetivo === type.id && styles.optionDescriptionSelected
              ]}>
                {type.id === OBJECTIVE_TYPES.GENERAL_EXPENSES 
                  ? 'Controla todos los gastos del mes'
                  : 'Controla gastos de una categoría específica'
                }
              </Text>
            </View>
            {tipoObjetivo === type.id && (
              <View style={styles.optionCheck}>
                <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.white} />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );

  const renderStep2 = () => (
    <Animated.View style={[styles.stepContainer, { opacity: stepAnim }]}>
      <View style={styles.stepHeader}>
        <FontAwesome5 name="edit" size={getIconSize(28)} color={Colors.primary} />
        <Text style={styles.stepTitle}>Completar Detalles</Text>
        <Text style={styles.stepSubtitle}>Define los detalles de tu objetivo</Text>
      </View>

      <View style={styles.formContainer}>
        {/* Título */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Título del Objetivo</Text>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInputWithCounter}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Ej: Control gastos restaurantes"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              maxLength={50}
              editable={!loading}
            />
            <Text style={styles.characterCount}>{titulo.length}/50</Text>
          </View>
        </View>

        {/* Valor Objetivo */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Máximo de gasto permitido para este objetivo</Text>
          <View style={styles.textInputContainer}>
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
        </View>

        {/* Categoría (solo para objetivos por categoría) */}
        {tipoObjetivo === OBJECTIVE_TYPES.CATEGORY_EXPENSES && (
          <View style={styles.fieldContainer}>
            <Text style={styles.fieldLabel}>Categoría</Text>
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

        {/* Descripción */}
        <View style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>Descripción (opcional)</Text>
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
    </Animated.View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
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
              maxHeight: modalHeight.maxHeight,
              minHeight: modalHeight.minHeight,
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🎯 Crear Objetivo</Text>
            <Text style={styles.subtitle}>Asistente paso a paso</Text>
            {renderStepIndicator()}
          </View>

          {/* Content */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
            bounces={true}
            alwaysBounceVertical={false}
            nestedScrollEnabled={true}
          >
            {loading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.primary} />
                <Text style={styles.loadingText}>Cargando datos...</Text>
              </View>
            )}

            {!loading && currentStep === 1 && renderStep1()}
            {!loading && currentStep === 2 && renderStep2()}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {currentStep === 1 ? (
              <>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={handleClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.nextButton, !validateStep1() && styles.disabledButton]}
                  onPress={handleNext}
                  disabled={loading || !validateStep1()}
                >
                  <Text style={styles.nextButtonText}>Siguiente</Text>
                  <FontAwesome5 name="arrow-right" size={getIconSize(16)} color={Colors.white} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={handleBack}
                  disabled={loading}
                >
                  <FontAwesome5 name="arrow-left" size={getIconSize(16)} color={Colors.primary} />
                  <Text style={styles.backButtonText}>Atrás</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.submitButton, loading && styles.disabledButton]}
                  onPress={handleSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <View style={styles.loadingButtonContainer}>
                      <ActivityIndicator size="small" color={Colors.white} />
                      <Text style={styles.submitButtonText}>Creando...</Text>
                    </View>
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Crear Objetivo</Text>
                      <FontAwesome5 name="check" size={getIconSize(16)} color={Colors.white} />
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = {
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getSpacing(4),
  },
  container: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: getBorderRadius(20),
    width: '96%',
    maxHeight: screenHeight * 0.95,
    minHeight: screenHeight * 0.8,
    ...getShadowSize(-10, 20, 0.3),
    borderWidth: getBorderWidth(1),
    borderColor: Colors.border,
  },
  header: {
    backgroundColor: Colors.primary,
    paddingTop: getSpacing(4),
    paddingBottom: getSpacing(8),
    paddingHorizontal: getHorizontalPadding(),
    borderTopLeftRadius: getBorderRadius(20),
    borderTopRightRadius: getBorderRadius(20),
    alignItems: 'center',
  },
  title: {
    fontSize: getTitleFontSize(22),
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: getSpacing(4),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: getBodyFontSize(13),
    color: 'rgba(26, 26, 26, 0.8)',
    textAlign: 'center',
    marginBottom: getSpacing(8),
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: scaleSize(12),
    height: scaleSize(12),
    borderRadius: scaleSize(6),
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
  },
  stepDotActive: {
    backgroundColor: Colors.textDark,
  },
  stepLine: {
    width: scaleSize(40),
    height: scaleSize(2),
    backgroundColor: 'rgba(26, 26, 26, 0.3)',
    marginHorizontal: getSpacing(8),
  },
  stepLineActive: {
    backgroundColor: Colors.textDark,
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
  },
  scrollContent: {
    paddingHorizontal: getHorizontalPadding(),
    paddingTop: getSpacing(12),
    paddingBottom: getSpacing(16),
    flexGrow: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: getSpacing(40),
  },
  loadingText: {
    marginTop: getSpacing(16),
    fontSize: getBodyFontSize(16),
    color: Colors.textSecondary,
  },
  stepContainer: {
    flexGrow: 1,
  },
  stepHeader: {
    alignItems: 'center',
    marginBottom: getSpacing(8),
  },
  stepTitle: {
    fontSize: getTitleFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginTop: getSpacing(8),
    marginBottom: getSpacing(4),
    textAlign: 'center',
  },
  stepSubtitle: {
    fontSize: getBodyFontSize(12),
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: getSpacing(16),
  },
  optionsContainer: {
    gap: getGap(8),
    paddingBottom: getSpacing(12),
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(10),
    padding: getSpacing(12),
    borderWidth: getBorderWidth(1),
    borderColor: 'rgba(255, 255, 255, 0.1)',
    ...getShadowSize(1, 2, 0.1),
  },
  optionCardSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionIcon: {
    ...getIconContainerSize(40),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: getBorderRadius(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: getSpacing(12),
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.text,
    marginBottom: getSpacing(4),
  },
  optionTitleSelected: {
    color: Colors.white,
  },
  optionDescription: {
    fontSize: getSmallFontSize(13),
    color: Colors.textSecondary,
    lineHeight: getSpacing(18),
  },
  optionDescriptionSelected: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  optionCheck: {
    ...getIconContainerSize(24),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: getBorderRadius(12),
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    gap: getGap(12),
  },
  fieldContainer: {
    gap: getGap(6),
  },
  fieldLabel: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.text,
  },
  textInputContainer: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(2),
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: getSpacing(14),
    paddingVertical: getSpacing(12),
    fontSize: getBodyFontSize(16),
    color: Colors.text,
    ...getShadowSize(2, 4, 0.1),
  },
  textInputWithCounter: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(2),
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: getSpacing(14),
    paddingVertical: getSpacing(12),
    paddingRight: getSpacing(50), // Add space for character counter
    fontSize: getBodyFontSize(16),
    color: Colors.text,
    ...getShadowSize(2, 4, 0.1),
  },
  textArea: {
    minHeight: scaleSize(60),
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: Colors.backgroundCard,
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(2),
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: getSpacing(14),
    paddingVertical: getSpacing(12),
    ...getShadowSize(2, 4, 0.1),
  },
  picker: {
    height: scaleSize(40),
    color: Colors.text,
  },
  characterCount: {
    position: 'absolute',
    bottom: getSpacing(8),
    right: getSpacing(12),
    fontSize: getSmallFontSize(11),
    color: 'rgba(255, 255, 255, 0.4)',
    backgroundColor: 'transparent',
    pointerEvents: 'none',
  },
  actionButtons: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.backgroundSecondary,
    paddingHorizontal: getHorizontalPadding(),
    paddingVertical: getSpacing(12),
    paddingBottom: Platform.OS === 'ios' ? getSpacing(16) : getSpacing(12),
    borderTopWidth: getBorderWidth(1),
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    flexDirection: 'row',
    gap: getGap(12),
    ...getShadowSize(0, -2, 0.1),
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: getBorderWidth(1),
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.text,
  },
  nextButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getGap(6),
    ...getShadowSize(0, 2, 0.2),
  },
  nextButtonText: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.white,
  },
  backButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: getBorderWidth(1),
    borderColor: Colors.primary,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getGap(6),
  },
  backButtonText: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.primary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    borderRadius: getBorderRadius(12),
    paddingVertical: getSpacing(12),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getGap(6),
    ...getShadowSize(0, 2, 0.2),
  },
  submitButtonText: {
    fontSize: getBodyFontSize(16),
    fontWeight: '600',
    color: Colors.white,
  },
  disabledButton: {
    backgroundColor: Colors.textSecondary,
    ...getShadowSize(0, 0, 0),
  },
  loadingButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getGap(8),
  },
};

export default CustomObjectiveForm;