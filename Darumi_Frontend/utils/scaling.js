import { Dimensions } from 'react-native';

const GUIDELINE_BASE_WIDTH = 390;
const { width: screenWidth } = Dimensions.get('window');

export const scaleSize = (size) => (screenWidth / GUIDELINE_BASE_WIDTH) * size;

export const getMinWidth = (baseMinWidth = 80) => scaleSize(baseMinWidth);
export const getMaxWidth = (baseMaxWidth = 100) => scaleSize(baseMaxWidth);
export const getMinHeight = (baseMinHeight = 60) => scaleSize(baseMinHeight);

export const scaleFont = (size, factor = 0.5) => size + (scaleSize(size) - size) * factor;
export const getBodyFontSize = (baseSize = 14) => scaleFont(baseSize);
export const getTitleFontSize = (baseSize = 28) => scaleFont(baseSize);
export const getSmallFontSize = (baseSize = 12) => scaleFont(baseSize);

export const isSmallScreen = () => screenWidth < 375;
export const isLargeScreen = () => screenWidth > 414;

export const getHorizontalPadding = () => {
  if (isSmallScreen()) return scaleSize(16);
  if (isLargeScreen()) return scaleSize(24);
  return scaleSize(20);
};

export const getVerticalPadding = () => {
  if (isSmallScreen()) return scaleSize(12);
  if (isLargeScreen()) return scaleSize(20);
  return scaleSize(16);
};

export const getBorderRadius = (baseSize = 16) => scaleSize(baseSize);
export const getIconSize = (baseSize = 20) => scaleSize(baseSize);
export const getSpacing = (baseSize = 16) => scaleSize(baseSize);
export const getBorderWidth = (baseWidth = 2) => scaleSize(baseWidth);
export const getGap = (baseGap = 16) => scaleSize(baseGap);

export const getHeaderSize = (basePadding = 20, baseBorderRadius = 24) => ({
  padding: scaleSize(basePadding),
  borderBottomLeftRadius: scaleSize(baseBorderRadius),
  borderBottomRightRadius: scaleSize(baseBorderRadius),
});

export const getStatsBarSize = (basePadding = 20, baseMargin = 20) => ({
  padding: scaleSize(basePadding),
  marginBottom: scaleSize(baseMargin),
});

export const getTabBarSize = (baseHeight = 80, basePadding = 20) => ({
  height: scaleSize(baseHeight),
  paddingBottom: scaleSize(basePadding),
  paddingTop: scaleSize(basePadding * 0.5),
});

export const getIconContainerSize = (baseSize = 50) => ({
  width: scaleSize(baseSize),
  height: scaleSize(baseSize),
  borderRadius: scaleSize(baseSize / 2),
});

export const getShadowSize = (baseOffset = 4, baseRadius = 8, baseOpacity = 0.2) => ({
  shadowOffset: {
    width: 0,
    height: scaleSize(baseOffset),
  },
  shadowRadius: scaleSize(baseRadius),
  shadowOpacity: baseOpacity,
  elevation: scaleSize(baseOffset),
});

export const getButtonSize = (baseHeight = 50, basePadding = 16) => ({
  height: scaleSize(baseHeight),
  paddingHorizontal: scaleSize(basePadding),
  paddingVertical: scaleSize(basePadding * 0.75),
});

export const getCardSize = (basePadding = 20, baseMargin = 16) => ({
  padding: scaleSize(basePadding),
  marginBottom: scaleSize(baseMargin),
});

export const getModalSize = (baseWidth = 350, baseHeight = 500) => ({
  width: scaleSize(baseWidth),
  height: scaleSize(baseHeight),
});

export const getScrollContentSize = (basePadding = 20) => ({
  paddingHorizontal: scaleSize(basePadding),
  paddingVertical: scaleSize(basePadding * 0.75),
});

export const getFloatingButtonSize = (baseSize = 60) => ({
  width: scaleSize(baseSize),
  height: scaleSize(baseSize),
  borderRadius: scaleSize(baseSize / 2),
});

export const getProgressBarSize = (baseHeight = 8, baseRadius = 4) => ({
  height: scaleSize(baseHeight),
  borderRadius: scaleSize(baseRadius),
});

export const getInputSize = (baseHeight = 50, basePadding = 16, baseRadius = 12) => ({
  height: scaleSize(baseHeight),
  paddingHorizontal: scaleSize(basePadding),
  paddingVertical: scaleSize(basePadding * 0.75),
  borderRadius: scaleSize(baseRadius),
  fontSize: getBodyFontSize(),
});

export const getBadgeSize = (basePadding = 8, baseRadius = 12, baseMinWidth = 60) => ({
  paddingHorizontal: scaleSize(basePadding),
  paddingVertical: scaleSize(basePadding * 0.5),
  borderRadius: scaleSize(baseRadius),
  minWidth: scaleSize(baseMinWidth),
  alignItems: 'center',
  justifyContent: 'center',
});