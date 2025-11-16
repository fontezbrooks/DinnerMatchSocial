import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolateColor,
  runOnJS,
} from 'react-native-reanimated';

interface TimerProps {
  duration: number; // in seconds
  onTimeUp: () => void;
  isActive: boolean;
}

const Timer: React.FC<TimerProps> = ({ duration, onTimeUp, isActive }) => {
  const timeLeft = useSharedValue(duration);
  const progress = useSharedValue(1);
  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>();

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const updateTimer = () => {
    'worklet';
    if (!startTimeRef.current) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const remaining = Math.max(0, duration - elapsed);

    timeLeft.value = Math.floor(remaining);
    progress.value = remaining / duration;

    if (remaining <= 0) {
      runOnJS(onTimeUp)();
    }
  };

  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      timeLeft.value = duration;
      progress.value = 1;

      intervalRef.current = setInterval(() => {
        updateTimer();
      }, 100); // Update every 100ms for smooth animation
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, duration]);

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
      backgroundColor: interpolateColor(
        progress.value,
        [0, 0.3, 0.6, 1],
        ['#F44336', '#FF9800', '#FFC107', '#4CAF50']
      ),
    };
  });

  const timerTextStyle = useAnimatedStyle(() => {
    const textColor = interpolateColor(
      progress.value,
      [0, 0.3, 1],
      ['#F44336', '#FF9800', '#333333']
    );

    const scale = timeLeft.value <= 10 && timeLeft.value > 0 ?
      withTiming(1.1, { duration: 500 }) : 1;

    return {
      color: textColor,
      transform: [{ scale }],
    };
  });

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.timeText, timerTextStyle]}>
        {formatTime(timeLeft.value)}
      </Animated.Text>
      <View style={styles.progressBar}>
        <Animated.View style={[styles.progressFill, progressBarStyle]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  timeText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});

export default Timer;