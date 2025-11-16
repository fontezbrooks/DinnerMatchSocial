import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import SwipeCard from '../components/SwipeCard';
import Timer from '../components/Timer';
import PerformanceOverlay from '../components/PerformanceOverlay';
import { useSwipeStack } from '../hooks/useSwipeStack';
import { TEST_CARDS } from '../utils/testData';
import { performanceMonitor, usePerformanceMetrics } from '../utils/PerformanceMonitor';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.9;
const CARD_HEIGHT = screenHeight * 0.7;

const TIMER_DURATION = 5 * 60; // 5 minutes in seconds

export default function HomeScreen() {
  const [sessionActive, setSessionActive] = useState(false);
  const [showPerformanceOverlay, setShowPerformanceOverlay] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);

  const swipeStack = useSwipeStack(TEST_CARDS);
  const performanceMetrics = usePerformanceMetrics();
  const stats = swipeStack.getStats();

  useEffect(() => {
    if (swipeStack.isComplete && sessionActive) {
      handleSessionComplete();
    }
  }, [swipeStack.isComplete, sessionActive]);

  const startSession = () => {
    setSessionActive(true);
    setSessionStartTime(Date.now());
    swipeStack.reset();
    performanceMonitor.reset();
  };

  const handleTimeUp = () => {
    if (sessionActive) {
      handleSessionComplete();
    }
  };

  const handleSessionComplete = () => {
    setSessionActive(false);
    const report = performanceMonitor.getPerformanceReport();

    Alert.alert(
      'Session Complete!',
      `Performance Summary:\n\n` +
      `• Total Swipes: ${stats.totalSwipes}\n` +
      `• Average FPS: ${report.averageFps}\n` +
      `• Peak Memory: ${report.peakMemory.toFixed(1)}MB\n` +
      `• Frame Drops: ${report.frameDrops}\n\n` +
      `View detailed results?`,
      [
        { text: 'Continue Testing', onPress: startSession },
        { text: 'View Results', onPress: () => {} }, // Will link to results screen
      ]
    );
  };

  const resetSession = () => {
    setSessionActive(false);
    swipeStack.reset();
    performanceMonitor.reset();
    setSessionStartTime(null);
  };

  const visibleCards = swipeStack.getVisibleCards(3);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>DinnerMatch Performance Test</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.perfButton}
            onPress={() => setShowPerformanceOverlay(!showPerformanceOverlay)}
          >
            <Text style={styles.perfButtonText}>📊</Text>
          </TouchableOpacity>
          <Link href="/results" asChild>
            <TouchableOpacity style={styles.resultsButton}>
              <Text style={styles.resultsButtonText}>Results</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Timer */}
      {sessionActive && (
        <Timer
          duration={TIMER_DURATION}
          onTimeUp={handleTimeUp}
          isActive={sessionActive}
        />
      )}

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.totalSwipes}</Text>
          <Text style={styles.statLabel}>Swipes</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{stats.remaining}</Text>
          <Text style={styles.statLabel}>Remaining</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: getFpsColor(performanceMetrics.fps) }]}>
            {performanceMetrics.fps}
          </Text>
          <Text style={styles.statLabel}>FPS</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: getMemoryColor(performanceMetrics.memoryUsage) }]}>
            {performanceMetrics.memoryUsage.toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>MB</Text>
        </View>
      </View>

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {!sessionActive && (
          <View style={styles.startScreen}>
            <Text style={styles.startTitle}>Ready to Test Performance?</Text>
            <Text style={styles.startDescription}>
              Swipe through 50 cards in 5 minutes while we monitor:
              {'\n'}• FPS during animations
              {'\n'}• Memory usage
              {'\n'}• Gesture responsiveness
              {'\n'}• Overall app performance
            </Text>
            <TouchableOpacity style={styles.startButton} onPress={startSession}>
              <Text style={styles.startButtonText}>Start Performance Test</Text>
            </TouchableOpacity>
          </View>
        )}

        {sessionActive && visibleCards.map(({ card, index, isActive }) => (
          <SwipeCard
            key={card.id}
            card={card}
            index={index}
            onSwipe={swipeStack.handleSwipe}
            isActive={isActive}
          />
        ))}
      </View>

      {/* Controls */}
      {sessionActive && (
        <View style={styles.controls}>
          <TouchableOpacity style={styles.controlButton} onPress={resetSession}>
            <Text style={styles.controlButtonText}>Reset</Text>
          </TouchableOpacity>

          <Text style={styles.instructions}>
            ← Nope • ↑ Super Like • → Like
          </Text>
        </View>
      )}

      {/* Performance Overlay */}
      <PerformanceOverlay
        visible={showPerformanceOverlay}
        onToggle={() => setShowPerformanceOverlay(false)}
      />
    </SafeAreaView>
  );
}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
  },
  perfButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfButtonText: {
    fontSize: 16,
  },
  resultsButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#4CAF50',
    borderRadius: 20,
    justifyContent: 'center',
  },
  resultsButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  startScreen: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  startTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  startDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startButton: {
    backgroundColor: '#E91E63',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  controls: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  controlButton: {
    backgroundColor: '#666',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
  },
  controlButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});