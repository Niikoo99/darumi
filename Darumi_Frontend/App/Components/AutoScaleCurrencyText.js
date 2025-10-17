import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { getBodyFontSize, getTitleFontSize } from '../../utils/scaling';
import Colors from '../../assets/shared/Colors';

/**
 * Componente que renderiza montos de moneda con escalado automático
 * para evitar que se partan en múltiples líneas.
 * 
 * Características:
 * - Un único <Text> con adjustsFontSizeToFit
 * - Narrow No-Break Space (\u202F) entre símbolo y número
 * - Soporte para accesibilidad con allowFontScaling
 * - Formato consistente con Intl.NumberFormat
 * 
 * @param {Object} props - Propiedades del componente
 * @param {number} props.value - Valor numérico a mostrar
 * @param {string} [props.variant='balance'] - Variante de estilo para diferentes contextos
 * @param {number} [props.minScale=0.6] - Escala mínima de fuente (0.1 - 1.0)
 * @param {number} [props.maxFontSize] - Tamaño máximo de fuente
 * @param {Object} [props.style] - Estilos adicionales
 * @param {string} [props.testID] - ID para testing
 */
const AutoScaleCurrencyText = ({
  value,
  variant = 'balance',
  minScale = 0.6,
  maxFontSize,
  style,
  testID,
}) => {
  // Validar minScale
  const validMinScale = Math.max(0.1, Math.min(1.0, minScale));

  // Obtener tamaño de fuente base según variante
  const getBaseFontSize = () => {
    switch (variant) {
      case 'small':
        return getBodyFontSize(12);
      case 'large':
        return getTitleFontSize(28);
      case 'balance':
        return getTitleFontSize(24);
      case 'expense':
      case 'income':
        return getBodyFontSize(16);
      default:
        return getBodyFontSize(16);
    }
  };

  // Formatear el valor como moneda argentina
  const formatCurrencyValue = (val) => {
    const numberValue = typeof val === 'number' ? val : 0;
    
    // Usar Intl.NumberFormat con style: 'currency' para formato consistente
    const formattedNumber = new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(numberValue));

    // Añadir signo negativo manualmente si corresponde
    const sign = numberValue < 0 ? '- ' : '';
    
    // Reemplazar espacios normales por Narrow No-Break Space (\u202F)
    // para evitar que el símbolo $ se separe del número
    return `${sign}${formattedNumber.replace(/\s/g, '\u202F')}`;
  };

  // Estilos base según variante
  const getVariantStyles = () => {
    const baseFontSize = getBaseFontSize();
    const fontSize = maxFontSize ? Math.min(maxFontSize, baseFontSize) : baseFontSize;

    const baseStyles = {
      fontSize,
      fontWeight: '700',
      textAlign: 'center',
    };

    // Colores según variante (solo aplicar si no se pasa color en style)
    switch (variant) {
      case 'expense':
        return { ...baseStyles, color: Colors.danger };
      case 'income':
        return { ...baseStyles, color: Colors.success };
      case 'balance':
        return { ...baseStyles, color: Colors.primary };
      case 'small':
        return baseStyles; // No aplicar color por defecto para 'small'
      default:
        return { ...baseStyles, color: Colors.text };
    }
  };

  const variantStyles = getVariantStyles();
  
  // Usar StyleSheet.flatten para manejar correctamente arrays y objetos de estilos
  const flattenedStyle = StyleSheet.flatten(style);
  
  // Filtrar propiedades que no son de estilo válidas para Text
  const validStyleProps = {};
  if (flattenedStyle) {
    Object.keys(flattenedStyle).forEach(key => {
      // Solo incluir propiedades que son válidas para el estilo de Text
      if (!['numberOfLines', 'adjustsFontSizeToFit', 'minimumFontScale', 'allowFontScaling', 'ellipsizeMode'].includes(key)) {
        validStyleProps[key] = flattenedStyle[key];
      }
    });
  }
  
  const combinedStyles = {
    ...variantStyles,
    ...validStyleProps,
    // Si se pasa un color en style, tiene prioridad sobre el color de la variante
    ...(validStyleProps?.color && { color: validStyleProps.color }),
  };

  return (
    <Text
      style={combinedStyles}
      testID={testID}
      // Propiedades críticas para evitar corte de línea (como props directas)
      numberOfLines={1}
      adjustsFontSizeToFit={true}
      minimumFontScale={validMinScale}
      allowFontScaling={true}
      ellipsizeMode="clip"
    >
      {formatCurrencyValue(value)}
    </Text>
  );
};

export default AutoScaleCurrencyText;
