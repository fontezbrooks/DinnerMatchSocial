import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

interface TimerProps {
  timeRemaining: number;
  totalTime: number;
  isActive: boolean;
  size?: number;
  strokeWidth?: number;
  warningThreshold?: number;
  criticalThreshold?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const Timer: React.FC<TimerProps> = ({
  timeRemaining,
  totalTime,
  isActive,
  size = 120,
  strokeWidth = 8,
  warningThreshold = 30,
  criticalThreshold = 10,
}) => {
  const progress = useSharedValue(1);
  const scale = useSharedValue(1);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Update progress when timeRemaining changes
  useEffect(() => {
    const newProgress = totalTime > 0 ? timeRemaining / totalTime : 0;
    progress.value = withTiming(newProgress, { duration: 1000 });

    // Scale animation for critical time
    if (timeRemaining <= criticalThreshold && isActive) {
      scale.value = withTiming(1.1, { duration: 500 }, () => {
        scale.value = withTiming(1, { duration: 500 });
      });
    }
  }, [timeRemaining, totalTime, isActive, criticalThreshold, progress, scale]);

  // Derived value for stroke dash offset
  const strokeDashoffset = useDerivedValue(() => {
    return circumference - (progress.value * circumference);
  });

  // Animated style for the container
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  // Animated props for the progress circle
  const animatedProps = useAnimatedProps(() => {
    // Color interpolation based on time remaining
    let color = '#4CAF50'; // Green
    if (timeRemaining <= criticalThreshold) {
      color = '#F44336'; // Red
    } else if (timeRemaining <= warningThreshold) {
      color = '#FF9800'; // Orange
    }

    return {
      strokeDashoffset: strokeDashoffset.value,
      stroke: color,
    };
  });

  // Text color based on time remaining
  const getTextColor = () => {
    if (timeRemaining <= criticalThreshold) return '#F44336';
    if (timeRemaining <= warningThreshold) return '#FF9800';
    return '#4CAF50';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeText = () => {
    if (!isActive) return 'PAUSED';
    if (timeRemaining <= 0) return 'TIME UP';
    return formatTime(timeRemaining);
  };

  const getSubText = () => {
    if (timeRemaining <= criticalThreshold && isActive) {
      return 'Hurry up!';
    }
    if (timeRemaining <= warningThreshold && isActive) {
      return 'Time running out';
    }
    return 'Make your choice';
  };

  return (
    <Animated.View style={[styles.container, { width: size, height: size }, containerStyle]}>
      {/* Background circle */}
      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#E0E0E0"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          fill="transparent"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          animatedProps={animatedProps}
        />
      </Svg>

      {/* Timer text */}
      <View style={styles.textContainer}>
        <Text style={[styles.timeText, { color: getTextColor() }]}>
          {getTimeText()}
        </Text>
        <Text style={styles.subText}>
          {getSubText()}
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 2,
  },
});

export default Timer;