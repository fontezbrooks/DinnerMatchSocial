import React, { useCallback } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  extrapolate,
} from 'react-native-reanimated';
import { Image } from 'expo-image';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.7;
const ROTATION_THRESHOLD = screenWidth * 0.3;

export interface CardData {
  id: string;
  name: string;
  age: number;
  image: string;
  bio: string;
}

interface SwipeCardProps {
  card: CardData;
  index: number;
  onSwipe: (direction: 'left' | 'right' | 'up', cardId: string) => void;
  isActive: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = React.memo(({ card, index, onSwipe, isActive }) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(isActive ? 1 : 0.95);
  const opacity = useSharedValue(isActive ? 1 : 0.8);

  const animateOut = useCallback((direction: 'left' | 'right' | 'up') => {
    'worklet';
    const targetX = direction === 'left' ? -screenWidth * 1.5 :
                   direction === 'right' ? screenWidth * 1.5 : 0;
    const targetY = direction === 'up' ? -screenHeight * 1.5 : 0;

    translateX.value = withTiming(targetX, { duration: 300 });
    translateY.value = withTiming(targetY, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 });

    runOnJS(onSwipe)(direction, card.id);
  }, [onSwipe, card.id, translateX, translateY, opacity]);

  const gestureHandler = useAnimatedGestureHandler<
    PanGestureHandlerGestureEvent,
    { startX: number; startY: number }
  >({
    onStart: (_, context) => {
      context.startX = translateX.value;
      context.startY = translateY.value;
    },
    onActive: (event, context) => {
      translateX.value = context.startX + event.translationX;
      translateY.value = context.startY + event.translationY;
    },
    onEnd: (event) => {
      const velocity = Math.sqrt(
        event.velocityX * event.velocityX + event.velocityY * event.velocityY
      );

      // Check for quick upward swipe (super like)
      if (event.velocityY < -1000 && Math.abs(event.translationY) > 50) {
        animateOut('up');
        return;
      }

      // Check for horizontal swipe
      if (Math.abs(translateX.value) > ROTATION_THRESHOLD || Math.abs(event.velocityX) > 800) {
        const direction = translateX.value > 0 ? 'right' : 'left';
        animateOut(direction);
      } else {
        // Snap back to center
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-screenWidth, 0, screenWidth],
      [-30, 0, 30],
      extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
      zIndex: isActive ? 1000 - index : 100 - index,
    };
  });

  const likeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [0, screenWidth * 0.3],
      [0, 1],
      extrapolate.CLAMP
    ),
  }));

  const nopeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateX.value,
      [-screenWidth * 0.3, 0],
      [1, 0],
      extrapolate.CLAMP
    ),
  }));

  const superLikeOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-screenHeight * 0.2, 0],
      [1, 0],
      extrapolate.CLAMP
    ),
  }));

  return (
    <PanGestureHandler onGestureEvent={gestureHandler} enabled={isActive}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: card.image }}
            style={styles.image}
            contentFit="cover"
            cachePolicy="memory-disk"
            priority="high"
            recyclingKey={card.id}
          />

          {/* Action Overlays */}
          <Animated.View style={[styles.actionOverlay, styles.likeOverlay, likeOpacity]}>
            <Text style={[styles.actionText, styles.likeText]}>LIKE</Text>
          </Animated.View>

          <Animated.View style={[styles.actionOverlay, styles.nopeOverlay, nopeOpacity]}>
            <Text style={[styles.actionText, styles.nopeText]}>NOPE</Text>
          </Animated.View>

          <Animated.View style={[styles.actionOverlay, styles.superLikeOverlay, superLikeOpacity]}>
            <Text style={[styles.actionText, styles.superLikeText]}>SUPER LIKE</Text>
          </Animated.View>
        </View>

        <View style={styles.infoContainer}>
          <Text style={styles.name}>
            {card.name}, {card.age}
          </Text>
          <Text style={styles.bio} numberOfLines={3}>
            {card.bio}
          </Text>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
});

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '80%',
  },
  infoContainer: {
    padding: 16,
    height: '20%',
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  bio: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  actionOverlay: {
    position: 'absolute',
    top: 50,
    borderWidth: 4,
    borderRadius: 8,
    padding: 8,
    zIndex: 1,
  },
  likeOverlay: {
    right: 20,
    borderColor: '#4CAF50',
    transform: [{ rotate: '-15deg' }],
  },
  nopeOverlay: {
    left: 20,
    borderColor: '#F44336',
    transform: [{ rotate: '15deg' }],
  },
  superLikeOverlay: {
    alignSelf: 'center',
    top: 30,
    borderColor: '#2196F3',
  },
  actionText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  likeText: {
    color: '#4CAF50',
  },
  nopeText: {
    color: '#F44336',
  },
  superLikeText: {
    color: '#2196F3',
  },
});

export default SwipeCard;