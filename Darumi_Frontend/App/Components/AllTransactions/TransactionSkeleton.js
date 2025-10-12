import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
} from 'react-native';
import Colors from '../../../assets/shared/Colors';
import {
  getBorderRadius,
  getSpacing,
  getShadowSize,
  getBorderWidth,
  getIconSize,
} from '../../../utils/scaling';

const TransactionSkeleton = () => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, []);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.container}>
      <View style={styles.transactionItem}>
        {/* Ícono */}
        <Animated.View
          style={[
            styles.iconSkeleton,
            { opacity: shimmerOpacity },
          ]}
        />
        
        {/* Detalles */}
        <View style={styles.detailsContainer}>
          <Animated.View
            style={[
              styles.titleSkeleton,
              { opacity: shimmerOpacity },
            ]}
          />
          <View style={styles.metaContainer}>
            <Animated.View
              style={[
                styles.categorySkeleton,
                { opacity: shimmerOpacity },
              ]}
            />
            <Animated.View
              style={[
                styles.dateSkeleton,
                { opacity: shimmerOpacity },
              ]}
            />
          </View>
        </View>
        
        {/* Monto */}
        <Animated.View
          style={[
            styles.amountSkeleton,
            { opacity: shimmerOpacity },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(6),
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundCard,
    paddingHorizontal: getSpacing(16),
    paddingVertical: getSpacing(12),
    borderRadius: getBorderRadius(12),
    borderWidth: getBorderWidth(),
    borderColor: Colors.border,
    ...getShadowSize(2, 4, 0.1),
  },
  iconSkeleton: {
    width: getIconSize(48),
    height: getIconSize(48),
    borderRadius: getBorderRadius(24),
    backgroundColor: Colors.textSecondary,
    marginRight: getSpacing(16),
  },
  detailsContainer: {
    flex: 1,
    marginRight: getSpacing(12),
  },
  titleSkeleton: {
    height: getSpacing(16),
    backgroundColor: Colors.textSecondary,
    borderRadius: getBorderRadius(4),
    marginBottom: getSpacing(4),
    width: '70%',
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: getSpacing(2),
  },
  categorySkeleton: {
    height: getSpacing(12),
    backgroundColor: Colors.textSecondary,
    borderRadius: getBorderRadius(4),
    width: '40%',
  },
  dateSkeleton: {
    height: getSpacing(12),
    backgroundColor: Colors.textSecondary,
    borderRadius: getBorderRadius(4),
    width: '30%',
  },
  amountSkeleton: {
    height: getSpacing(16),
    backgroundColor: Colors.textSecondary,
    borderRadius: getBorderRadius(4),
    width: getSpacing(60),
  },
});

export default TransactionSkeleton;
