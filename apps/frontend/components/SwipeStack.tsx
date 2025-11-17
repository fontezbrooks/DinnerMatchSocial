import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';

import SwipeCard, { RestaurantItem } from './SwipeCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface SwipeStackProps {
  items: RestaurantItem[];
  onSwipe: (direction: 'like' | 'dislike' | 'skip', item: RestaurantItem) => void;
  onStackEmpty?: () => void;
  maxVisibleCards?: number;
  isEnabled?: boolean;
}

export const SwipeStack: React.FC<SwipeStackProps> = ({
  items,
  onSwipe,
  onStackEmpty,
  maxVisibleCards = 3,
  isEnabled = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardStack, setCardStack] = useState<RestaurantItem[]>(
    items.slice(0, maxVisibleCards)
  );

  const stackOffset = useSharedValue(0);

  // Update card stack when items change
  useEffect(() => {
    if (items.length > 0) {
      const newStack = items.slice(currentIndex, currentIndex + maxVisibleCards);
      setCardStack(newStack);
    }
  }, [items, currentIndex, maxVisibleCards]);

  // Handle card swiped
  const handleSwipe = useCallback(
    (direction: 'like' | 'dislike' | 'skip', item: RestaurantItem) => {
      if (!isEnabled) return;

      // Call parent callback
      onSwipe(direction, item);

      // Animate stack movement
      stackOffset.value = withSpring(
        stackOffset.value - 1,
        { damping: 20 },
        () => {
          runOnJS(() => {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);

            // Check if we've reached the end
            if (nextIndex >= items.length) {
              onStackEmpty?.();
            }

            // Reset animation offset
            stackOffset.value = 0;
          })();
        }
      );
    },
    [onSwipe, currentIndex, items.length, onStackEmpty, isEnabled, stackOffset]
  );

  // Reset stack
  const resetStack = useCallback(() => {
    setCurrentIndex(0);
    stackOffset.value = 0;
  }, [stackOffset]);

  // Get visible cards for current state
  const getVisibleCards = () => {
    const visibleCards = [];
    for (let i = 0; i < maxVisibleCards && currentIndex + i < items.length; i++) {
      const item = items[currentIndex + i];
      if (item) {
        visibleCards.push({
          item,
          index: i,
          isActive: i === 0,
        });
      }
    }
    return visibleCards;
  };

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: stackOffset.value * 10 }, // Subtle movement
      ],
    };
  });

  if (items.length === 0) {
    return <View style={styles.emptyContainer} />;
  }

  const visibleCards = getVisibleCards();

  return (
    <Animated.View style={[styles.container, containerAnimatedStyle]}>
      {visibleCards.map(({ item, index, isActive }) => (
        <SwipeCard
          key={`${item.id}-${currentIndex + index}`}
          item={item}
          onSwipe={handleSwipe}
          isActive={isActive && isEnabled}
          index={index}
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default SwipeStack;