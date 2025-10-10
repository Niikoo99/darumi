/**
 * Formatea un valor numérico a una cadena de moneda
 * para la configuración regional de Argentina (es-AR).
 * @param {number} value El número a formatear.
 * @returns {string} El número formateado como moneda.
 */
export const formatCurrency = (value) => {
  // Maneja casos donde el valor no sea un número válido.
  const numberValue = typeof value === 'number' ? value : 0;

  const formattedNumber = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(numberValue)); // Formatea el valor absoluto para manejar el signo negativo

  // Añade el signo negativo manualmente si corresponde
  const sign = numberValue < 0 ? '- ' : '';

  return `${sign}$ ${formattedNumber}`;
};
