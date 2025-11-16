import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { usePerformanceMetrics } from '../utils/PerformanceMonitor';

interface PerformanceOverlayProps {
  visible: boolean;
  onToggle: () => void;
}

const PerformanceOverlay: React.FC<PerformanceOverlayProps> = ({ visible, onToggle }) => {
  const metrics = usePerformanceMetrics();
  const [expanded, setExpanded] = useState(false);
  const overlayOpacity = useSharedValue(visible ? 1 : 0);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    transform: [
      { scale: withSpring(visible ? 1 : 0.8, { damping: 15 }) },
    ],
  }));

  React.useEffect(() => {
    overlayOpacity.value = withSpring(visible ? 1 : 0);
  }, [visible]);

  if (!visible) return null;

  const getFpsColor = (fps: number) => {
    if (fps >= 58) return '#4CAF50'; // Green
    if (fps >= 45) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  const getMemoryColor = (memory: number) => {
    if (memory <= 100) return '#4CAF50'; // Green
    if (memory <= 150) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <Animated.View style={[styles.overlay, overlayStyle]}>
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Performance</Text>
          <TouchableOpacity onPress={onToggle} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickStats}>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: getFpsColor(metrics.fps) }]}>
              {metrics.fps}
            </Text>
            <Text style={styles.statLabel}>FPS</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: getMemoryColor(metrics.memoryUsage) }]}>
              {metrics.memoryUsage.toFixed(0)}
            </Text>
            <Text style={styles.statLabel}>MB</Text>
          </View>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Average FPS:</Text>
            <Text style={[styles.detailValue, { color: getFpsColor(metrics.averageFps) }]}>
              {metrics.averageFps}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Memory Usage:</Text>
            <Text style={[styles.detailValue, { color: getMemoryColor(metrics.memoryUsage) }]}>
              {metrics.memoryUsage.toFixed(1)} MB
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Render Time:</Text>
            <Text style={styles.detailValue}>
              {metrics.renderTime.toFixed(1)}ms
            </Text>
          </View>

          <View style={styles.fpsGraph}>
            <Text style={styles.graphLabel}>FPS History:</Text>
            <View style={styles.graphContainer}>
              {metrics.gesturesToFps.slice(-20).map((fps, index) => (
                <View
                  key={index}
                  style={[
                    styles.graphBar,
                    {
                      height: `${(fps / 60) * 100}%`,
                      backgroundColor: getFpsColor(fps),
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 12,
    padding: 12,
    minWidth: 150,
    maxWidth: 250,
    zIndex: 1000,
  },
  header: {
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#ccc',
    fontSize: 10,
    marginTop: 2,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detailLabel: {
    color: '#ccc',
    fontSize: 12,
  },
  detailValue: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  fpsGraph: {
    marginTop: 8,
  },
  graphLabel: {
    color: '#ccc',
    fontSize: 10,
    marginBottom: 4,
  },
  graphContainer: {
    flexDirection: 'row',
    height: 30,
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  graphBar: {
    width: 3,
    backgroundColor: '#4CAF50',
    marginHorizontal: 0.5,
  },
});

export default PerformanceOverlay;