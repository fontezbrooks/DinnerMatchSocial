import React, { useCallback } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  withSequence,
  withTiming,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface RestaurantItem {
  id: string;
  name: string;
  imageUrl?: string;
  rating?: number;
  priceLevel?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  url?: string;
  categories?: string[];
}

interface SwipeCardProps {
  item: RestaurantItem;
  onSwipe: (direction: 'like' | 'dislike' | 'skip', item: RestaurantItem) => void;
  isActive: boolean;
  index: number;
}

const SWIPE_THRESHOLD = screenWidth * 0.3;
const ROTATION_ANGLE = 30;

export const SwipeCard: React.FC<SwipeCardProps> = ({
  item,
  onSwipe,
  isActive,
  index,
}) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handleSwipeComplete = useCallback(
    (direction: 'like' | 'dislike' | 'skip') => {
      onSwipe(direction, item);
    },
    [onSwipe, item]
  );

  const gesture = Gesture.Pan()
    .enabled(isActive)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;

      // Calculate rotation based on horizontal movement
      rotate.value = interpolate(
        event.translationX,
        [-screenWidth / 2, 0, screenWidth / 2],
        [-ROTATION_ANGLE, 0, ROTATION_ANGLE]
      );

      // Calculate opacity for swipe feedback
      const absTranslateX = Math.abs(event.translationX);
      opacity.value = interpolate(
        absTranslateX,
        [0, SWIPE_THRESHOLD],
        [1, 0.7]
      );
    })
    .onEnd((event) => {
      const absTranslateX = Math.abs(event.translationX);
      const velocity = Math.abs(event.velocityX);

      // Determine if swipe is strong enough
      const shouldSwipe = absTranslateX > SWIPE_THRESHOLD || velocity > 500;

      if (shouldSwipe) {
        // Determine direction
        if (event.translationX > 0) {
          // Swipe right - like
          translateX.value = withTiming(screenWidth * 1.5, { duration: 300 });
          rotate.value = withTiming(ROTATION_ANGLE * 2, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 });
          runOnJS(handleSwipeComplete)('like');
        } else if (event.translationX < 0) {
          // Swipe left - dislike
          translateX.value = withTiming(-screenWidth * 1.5, { duration: 300 });
          rotate.value = withTiming(-ROTATION_ANGLE * 2, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 });
          runOnJS(handleSwipeComplete)('dislike');
        } else if (event.translationY < -SWIPE_THRESHOLD) {
          // Swipe up - skip
          translateY.value = withTiming(-screenHeight, { duration: 300 });
          scale.value = withTiming(0.5, { duration: 300 });
          opacity.value = withTiming(0, { duration: 300 });
          runOnJS(handleSwipeComplete)('skip');
        }
      } else {
        // Spring back to center
        translateX.value = withSpring(0, { damping: 20 });
        translateY.value = withSpring(0, { damping: 20 });
        rotate.value = withSpring(0, { damping: 20 });
        opacity.value = withSpring(1, { damping: 20 });
        scale.value = withSpring(1, { damping: 20 });
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const cardStyle = useAnimatedStyle(() => {
    const baseScale = isActive ? 1 : 0.95 - index * 0.05;
    const baseOpacity = isActive ? 1 : 1 - index * 0.1;
    const baseY = isActive ? 0 : index * 10;

    return {
      transform: [
        { scale: baseScale },
        { translateY: baseY },
      ],
      opacity: baseOpacity,
      zIndex: isActive ? 1000 : 1000 - index,
    };
  });

  const likeIndicatorStyle = useAnimatedStyle(() => {
    const showLike = translateX.value > 50;
    return {
      opacity: showLike ?
        interpolate(translateX.value, [50, SWIPE_THRESHOLD], [0, 1]) : 0,
    };
  });

  const dislikeIndicatorStyle = useAnimatedStyle(() => {
    const showDislike = translateX.value < -50;
    return {
      opacity: showDislike ?
        interpolate(translateX.value, [-50, -SWIPE_THRESHOLD], [0, 1]) : 0,
    };
  });

  const skipIndicatorStyle = useAnimatedStyle(() => {
    const showSkip = translateY.value < -50;
    return {
      opacity: showSkip ?
        interpolate(translateY.value, [-50, -SWIPE_THRESHOLD], [0, 1]) : 0,
    };
  });

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Ionicons key={i} name="star" size={16} color="#FFD700" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <Ionicons key="half" name="star-half" size={16} color="#FFD700" />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <Ionicons
          key={`empty-${i}`}
          name="star-outline"
          size={16}
          color="#FFD700"
        />
      );
    }

    return stars;
  };

  return (
    <Animated.View style={[styles.container, cardStyle]} entering={FadeIn} exiting={FadeOut}>
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.card, animatedStyle]}>
          {/* Swipe Indicators */}
          <Animated.View style={[styles.indicator, styles.likeIndicator, likeIndicatorStyle]}>
            <Ionicons name="heart" size={40} color="#4CAF50" />
            <Text style={[styles.indicatorText, { color: '#4CAF50' }]}>LIKE</Text>
          </Animated.View>

          <Animated.View style={[styles.indicator, styles.dislikeIndicator, dislikeIndicatorStyle]}>
            <Ionicons name="close" size={40} color="#F44336" />
            <Text style={[styles.indicatorText, { color: '#F44336' }]}>PASS</Text>
          </Animated.View>

          <Animated.View style={[styles.indicator, styles.skipIndicator, skipIndicatorStyle]}>
            <Ionicons name="arrow-up" size={40} color="#FF9800" />
            <Text style={[styles.indicatorText, { color: '#FF9800' }]}>SKIP</Text>
          </Animated.View>

          {/* Restaurant Image */}
          <View style={styles.imageContainer}>
            {item.imageUrl ? (
              <Image source={{ uri: item.imageUrl }} style={styles.image} />
            ) : (
              <View style={[styles.image, styles.placeholderImage]}>
                <Ionicons name="restaurant" size={60} color="#ccc" />
              </View>
            )}
          </View>

          {/* Restaurant Info */}
          <View style={styles.infoContainer}>
            <Text style={styles.restaurantName}>{item.name}</Text>

            {item.cuisine && (
              <Text style={styles.cuisine}>{item.cuisine}</Text>
            )}

            {item.rating && (
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {renderStarRating(item.rating)}
                </View>
                <Text style={styles.ratingText}>({item.rating.toFixed(1)})</Text>
              </View>
            )}

            {item.priceLevel && (
              <Text style={styles.priceLevel}>
                {'$'.repeat(parseInt(item.priceLevel))}
              </Text>
            )}

            {item.address && (
              <View style={styles.addressContainer}>
                <Ionicons name="location-outline" size={14} color="#666" />
                <Text style={styles.address}>{item.address}</Text>
              </View>
            )}

            {item.categories && item.categories.length > 0 && (
              <View style={styles.categoriesContainer}>
                {item.categories.slice(0, 3).map((category, index) => (
                  <View key={index} style={styles.categoryTag}>
                    <Text style={styles.categoryText}>{category}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: screenWidth - 40,
    height: screenHeight * 0.7,
    alignSelf: 'center',
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  likeIndicator: {
    top: 60,
    right: 20,
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  dislikeIndicator: {
    top: 60,
    left: 20,
    borderWidth: 3,
    borderColor: '#F44336',
  },
  skipIndicator: {
    top: 20,
    alignSelf: 'center',
    borderWidth: 3,
    borderColor: '#FF9800',
  },
  indicatorText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  imageContainer: {
    height: '60%',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoContainer: {
    flex: 1,
    padding: 20,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cuisine: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  priceLevel: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#1976d2',
    fontWeight: '500',
  },
});

export default SwipeCard;