import { Dimensions } from 'react-native';

// Ancho del dispositivo de diseño de referencia (iPhone 13)
const GUIDELINE_BASE_WIDTH = 390;

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Escala un tamaño horizontalmente basado en el ancho de la pantalla actual.
 * @param {number} size El tamaño en el diseño de referencia.
 * @returns {number} El tamaño calculado para la pantalla actual.
 */
export const scaleSize = (size) => (screenWidth / GUIDELINE_BASE_WIDTH) * size;

/**
 * Escala el tamaño de una fuente, con un factor de moderación para
 * evitar que el texto sea demasiado grande en pantallas muy anchas.
 * @param {number} size El tamaño de fuente en el diseño de referencia.
 * @param {number} [factor=0.5] El factor de moderación.
 * @returns {number} El tamaño de fuente calculado.
 */
export const scaleFont = (size, factor = 0.5) => size + (scaleSize(size) - size) * factor;

/**
 * Verifica si la pantalla es pequeña (ancho menor a 375px).
 * @returns {boolean} True si la pantalla es pequeña.
 */
export const isSmallScreen = () => screenWidth < 375;

/**
 * Verifica si la pantalla es grande (ancho mayor a 414px).
 * @returns {boolean} True si la pantalla es grande.
 */
export const isLargeScreen = () => screenWidth > 414;

/**
 * Obtiene el padding horizontal recomendado basado en el tamaño de pantalla.
 * @returns {number} El padding horizontal recomendado.
 */
export const getHorizontalPadding = () => {
  if (isSmallScreen()) return scaleSize(16);
  if (isLargeScreen()) return scaleSize(24);
  return scaleSize(20);
};

/**
 * Obtiene el padding vertical recomendado basado en el tamaño de pantalla.
 * @returns {number} El padding vertical recomendado.
 */
export const getVerticalPadding = () => {
  if (isSmallScreen()) return scaleSize(12);
  if (isLargeScreen()) return scaleSize(20);
  return scaleSize(16);
};

/**
 * Obtiene el tamaño de fuente recomendado para títulos basado en el tamaño de pantalla.
 * @param {number} baseSize Tamaño base del título.
 * @returns {number} El tamaño de fuente recomendado.
 */
export const getTitleFontSize = (baseSize = 28) => {
  if (isSmallScreen()) return scaleFont(baseSize * 0.9);
  if (isLargeScreen()) return scaleFont(baseSize * 1.1);
  return scaleFont(baseSize);
};

/**
 * Obtiene el tamaño de fuente recomendado para texto normal basado en el tamaño de pantalla.
 * @param {number} baseSize Tamaño base del texto.
 * @returns {number} El tamaño de fuente recomendado.
 */
export const getBodyFontSize = (baseSize = 14) => {
  if (isSmallScreen()) return scaleFont(baseSize * 0.9);
  if (isLargeScreen()) return scaleFont(baseSize * 1.1);
  return scaleFont(baseSize);
};

/**
 * Obtiene el border radius recomendado basado en el tamaño de pantalla.
 * @param {number} baseSize Tamaño base del border radius.
 * @returns {number} El border radius recomendado.
 */
export const getBorderRadius = (baseSize = 16) => {
  if (isSmallScreen()) return scaleSize(baseSize * 0.9);
  if (isLargeScreen()) return scaleSize(baseSize * 1.1);
  return scaleSize(baseSize);
};

/**
 * Obtiene el tamaño de icono recomendado basado en el tamaño de pantalla.
 * @param {number} baseSize Tamaño base del icono.
 * @returns {number} El tamaño de icono recomendado.
 */
export const getIconSize = (baseSize = 20) => {
  if (isSmallScreen()) return scaleSize(baseSize * 0.9);
  if (isLargeScreen()) return scaleSize(baseSize * 1.1);
  return scaleSize(baseSize);
};

/**
 * Obtiene el espaciado recomendado basado en el tamaño de pantalla.
 * @param {number} baseSize Tamaño base del espaciado.
 * @returns {number} El espaciado recomendado.
 */
export const getSpacing = (baseSize = 16) => {
  if (isSmallScreen()) return scaleSize(baseSize * 0.8);
  if (isLargeScreen()) return scaleSize(baseSize * 1.2);
  return scaleSize(baseSize);
};

/**
 * Obtiene el tamaño de header recomendado basado en el tamaño de pantalla.
 * @param {number} basePadding Padding base del header.
 * @param {number} baseBorderRadius Border radius base del header.
 * @returns {object} Objeto con padding y borderRadius recomendados.
 */
export const getHeaderSize = (basePadding = 20, baseBorderRadius = 24) => ({
  padding: scaleSize(basePadding),
  borderBottomLeftRadius: scaleSize(baseBorderRadius),
  borderBottomRightRadius: scaleSize(baseBorderRadius),
});

/**
 * Obtiene el tamaño de stats bar recomendado basado en el tamaño de pantalla.
 * @param {number} basePadding Padding base del stats bar.
 * @param {number} baseMargin Margin base del stats bar.
 * @returns {object} Objeto con padding y margin recomendados.
 */
export const getStatsBarSize = (basePadding = 20, baseMargin = 20) => ({
  padding: scaleSize(basePadding),
  marginBottom: scaleSize(baseMargin),
});

/**
 * Obtiene el tamaño de tab bar recomendado basado en el tamaño de pantalla.
 * @param {number} baseHeight Altura base del tab bar.
 * @param {number} basePadding Padding base del tab bar.
 * @returns {object} Objeto con height y padding recomendados.
 */
export const getTabBarSize = (baseHeight = 80, basePadding = 20) => ({
  height: scaleSize(baseHeight),
  paddingBottom: scaleSize(basePadding),
  paddingTop: scaleSize(basePadding * 0.5),
});

/**
 * Obtiene el tamaño de icon container recomendado basado en el tamaño de pantalla.
 * @param {number} baseSize Tamaño base del icon container.
 * @returns {object} Objeto con width y height recomendados.
 */
export const getIconContainerSize = (baseSize = 50) => ({
  width: scaleSize(baseSize),
  height: scaleSize(baseSize),
  borderRadius: scaleSize(baseSize / 2),
});

/**
 * Obtiene el tamaño de shadow recomendado basado en el tamaño de pantalla.
 * @param {number} baseOffset Offset base del shadow.
 * @param {number} baseRadius Radius base del shadow.
 * @param {number} baseOpacity Opacity base del shadow.
 * @returns {object} Objeto con shadow recomendado.
 */
export const getShadowSize = (baseOffset = 4, baseRadius = 8, baseOpacity = 0.2) => ({
  shadowOffset: {
    width: 0,
    height: scaleSize(baseOffset),
  },
  shadowRadius: scaleSize(baseRadius),
  shadowOpacity: baseOpacity,
  elevation: scaleSize(baseOffset),
});

/**
 * Obtiene el tamaño de border recomendado basado en el tamaño de pantalla.
 * @param {number} baseWidth Ancho base del border.
 * @returns {number} El ancho del border recomendado.
 */
export const getBorderWidth = (baseWidth = 2) => scaleSize(baseWidth);

/**
 * Obtiene el tamaño de gap recomendado basado en el tamaño de pantalla.
 * @param {number} baseGap Gap base.
 * @returns {number} El gap recomendado.
 */
export const getGap = (baseGap = 16) => scaleSize(baseGap);

/**
 * Obtiene el tamaño de min width recomendado basado en el tamaño de pantalla.
 * @param {number} baseMinWidth Min width base.
 * @returns {number} El min width recomendado.
 */
export const getMinWidth = (baseMinWidth = 80) => scaleSize(baseMinWidth);

/**
 * Obtiene el tamaño de max width recomendado basado en el tamaño de pantalla.
 * @param {number} baseMaxWidth Max width base.
 * @returns {number} El max width recomendado.
 */
export const getMaxWidth = (baseMaxWidth = 100) => scaleSize(baseMaxWidth);

/**
 * Obtiene el tamaño de min height recomendado basado en el tamaño de pantalla.
 * @param {number} baseMinHeight Min height base.
 * @returns {number} El min height recomendado.
 */
export const getMinHeight = (baseMinHeight = 60) => scaleSize(baseMinHeight);

/**
 * Obtiene el tamaño de fuente pequeño recomendado basado en el tamaño de pantalla.
 * @param {number} baseSize Tamaño base del texto pequeño.
 * @returns {number} El tamaño de fuente pequeño recomendado.
 */
export const getSmallFontSize = (baseSize = 12) => {
  if (isSmallScreen()) return scaleFont(baseSize * 0.9);
  if (isLargeScreen()) return scaleFont(baseSize * 1.1);
  return scaleFont(baseSize);
};

/**
 * Obtiene el tamaño de botón recomendado basado en el tamaño de pantalla.
 * @param {number} baseHeight Altura base del botón.
 * @param {number} basePadding Padding base del botón.
 * @returns {object} Objeto con height y padding recomendados.
 */
export const getButtonSize = (baseHeight = 50, basePadding = 16) => ({
  height: scaleSize(baseHeight),
  paddingHorizontal: scaleSize(basePadding),
  paddingVertical: scaleSize(basePadding * 0.75),
});

/**
 * Obtiene el tamaño de card recomendado basado en el tamaño de pantalla.
 * @param {number} basePadding Padding base del card.
 * @param {number} baseMargin Margin base del card.
 * @returns {object} Objeto con padding y margin recomendados.
 */
export const getCardSize = (basePadding = 20, baseMargin = 16) => ({
  padding: scaleSize(basePadding),
  marginBottom: scaleSize(baseMargin),
});

/**
 * Obtiene el tamaño de modal recomendado basado en el tamaño de pantalla.
 * @param {number} baseWidth Ancho base del modal.
 * @param {number} baseHeight Altura base del modal.
 * @returns {object} Objeto con width y height recomendados.
 */
export const getModalSize = (baseWidth = 350, baseHeight = 500) => ({
  width: scaleSize(baseWidth),
  height: scaleSize(baseHeight),
});

/**
 * Obtiene el tamaño de contenido de scroll recomendado basado en el tamaño de pantalla.
 * @param {number} basePadding Padding base del contenido.
 * @returns {object} Objeto con padding recomendado.
 */
export const getScrollContentSize = (basePadding = 20) => ({
  paddingHorizontal: scaleSize(basePadding),
  paddingVertical: scaleSize(basePadding * 0.75),
});

/**
 * Obtiene el tamaño de botón flotante recomendado basado en el tamaño de pantalla.
 * @param {number} baseSize Tamaño base del botón flotante.
 * @returns {object} Objeto con width y height recomendados.
 */
export const getFloatingButtonSize = (baseSize = 60) => ({
  width: scaleSize(baseSize),
  height: scaleSize(baseSize),
  borderRadius: scaleSize(baseSize / 2),
});

/**
 * Obtiene el tamaño de barra de progreso recomendado basado en el tamaño de pantalla.
 * @param {number} baseHeight Altura base de la barra.
 * @param {number} baseRadius Radio base de la barra.
 * @returns {object} Objeto con height y borderRadius recomendados.
 */
export const getProgressBarSize = (baseHeight = 8, baseRadius = 4) => ({
  height: scaleSize(baseHeight),
  borderRadius: scaleSize(baseRadius),
});

/**
 * Obtiene el tamaño de input recomendado basado en el tamaño de pantalla.
 * @param {number} baseHeight Altura base del input.
 * @param {number} basePadding Padding base del input.
 * @param {number} baseRadius Radio base del input.
 * @returns {object} Objeto con height, padding y borderRadius recomendados.
 */
export const getInputSize = (baseHeight = 50, basePadding = 16, baseRadius = 12) => ({
  height: scaleSize(baseHeight),
  paddingHorizontal: scaleSize(basePadding),
  paddingVertical: scaleSize(basePadding * 0.75),
  borderRadius: scaleSize(baseRadius),
  fontSize: getBodyFontSize(),
});

/**
 * Obtiene el tamaño de badge recomendado basado en el tamaño de pantalla.
 * @param {number} basePadding Padding base del badge.
 * @param {number} baseRadius Radio base del badge.
 * @param {number} baseMinWidth Ancho mínimo base del badge.
 * @returns {object} Objeto con padding, borderRadius y minWidth recomendados.
 */
export const getBadgeSize = (basePadding = 8, baseRadius = 12, baseMinWidth = 60) => ({
  paddingHorizontal: scaleSize(basePadding),
  paddingVertical: scaleSize(basePadding * 0.5),
  borderRadius: scaleSize(baseRadius),
  minWidth: scaleSize(baseMinWidth),
  alignItems: 'center',
  justifyContent: 'center',
});