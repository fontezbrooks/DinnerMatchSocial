import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { performanceMonitor, PerformanceReport } from '../utils/PerformanceMonitor';

interface BenchmarkResult {
  testName: string;
  target: number;
  actual: number;
  status: 'pass' | 'warning' | 'fail';
  unit: string;
}

export default function ResultsScreen() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkResult[]>([]);

  useEffect(() => {
    const currentReport = performanceMonitor.getPerformanceReport();
    setReport(currentReport);

    // Calculate benchmark results
    const benchmarkResults: BenchmarkResult[] = [
      {
        testName: '60 FPS Target',
        target: 60,
        actual: currentReport.averageFps,
        status: currentReport.averageFps >= 58 ? 'pass' :
                currentReport.averageFps >= 45 ? 'warning' : 'fail',
        unit: 'FPS',
      },
      {
        testName: 'Memory Usage Limit',
        target: 150,
        actual: currentReport.peakMemory,
        status: currentReport.peakMemory <= 100 ? 'pass' :
                currentReport.peakMemory <= 150 ? 'warning' : 'fail',
        unit: 'MB',
      },
      {
        testName: 'Frame Drop Threshold',
        target: 5,
        actual: currentReport.frameDrops,
        status: currentReport.frameDrops <= 3 ? 'pass' :
                currentReport.frameDrops <= 8 ? 'warning' : 'fail',
        unit: 'drops',
      },
      {
        testName: 'Session Duration',
        target: 300,
        actual: currentReport.sessionDuration,
        status: 'pass', // Always pass for duration tracking
        unit: 's',
      },
    ];

    setBenchmarks(benchmarkResults);
  }, []);

  const getStatusColor = (status: BenchmarkResult['status']) => {
    switch (status) {
      case 'pass': return '#4CAF50';
      case 'warning': return '#FF9800';
      case 'fail': return '#F44336';
    }
  };

  const getStatusIcon = (status: BenchmarkResult['status']) => {
    switch (status) {
      case 'pass': return '✅';
      case 'warning': return '⚠️';
      case 'fail': return '❌';
    }
  };

  const getOverallScore = () => {
    const passCount = benchmarks.filter(b => b.status === 'pass').length;
    const totalTests = benchmarks.length - 1; // Exclude duration test
    return Math.round((passCount / totalTests) * 100);
  };

  const generateReport = () => {
    if (!report) return '';

    const score = getOverallScore();
    const passedTests = benchmarks.filter(b => b.status === 'pass').length;

    return `DinnerMatch Performance Test Results
═══════════════════════════════════════

🎯 Overall Score: ${score}% (${passedTests}/${benchmarks.length - 1} tests passed)

📊 Performance Metrics:
├─ Average FPS: ${report.averageFps} (Target: ≥58)
├─ Peak Memory: ${report.peakMemory.toFixed(1)}MB (Target: ≤150MB)
├─ Frame Drops: ${report.frameDrops} (Target: ≤5)
├─ Total Swipes: ${report.totalSwipes}
├─ Session Duration: ${Math.round(report.sessionDuration)}s
└─ Gesture Count: ${report.gestureCount}

🔍 Detailed Analysis:
${benchmarks.map(b => `${getStatusIcon(b.status)} ${b.testName}: ${b.actual}${b.unit}`).join('\n')}

📱 Device Performance:
• React Native v0.81.5 with New Architecture
• Expo Router v6 with optimized routing
• React Native Gesture Handler v2.24
• React Native Reanimated v4.1

Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
  };

  const shareResults = async () => {
    try {
      await Share.share({
        message: generateReport(),
        title: 'DinnerMatch Performance Test Results',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share results');
    }
  };

  if (!report) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Generating Performance Report...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const overallScore = getOverallScore();
  const scoreColor = overallScore >= 80 ? '#4CAF50' :
                    overallScore >= 60 ? '#FF9800' : '#F44336';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Performance Results</Text>
          <Text style={styles.subtitle}>React Native Swipe Performance Analysis</Text>
        </View>

        {/* Overall Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Overall Performance Score</Text>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {overallScore}%
          </Text>
          <Text style={styles.scoreDescription}>
            {overallScore >= 90 ? '🎉 Excellent Performance!' :
             overallScore >= 80 ? '✅ Good Performance' :
             overallScore >= 60 ? '⚠️ Acceptable Performance' :
             '❌ Performance Issues Detected'}
          </Text>
        </View>

        {/* Benchmark Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benchmark Results</Text>
          {benchmarks.map((benchmark, index) => (
            <View key={index} style={styles.benchmarkRow}>
              <View style={styles.benchmarkInfo}>
                <Text style={styles.benchmarkName}>{benchmark.testName}</Text>
                <Text style={styles.benchmarkTarget}>
                  Target: {benchmark.target}{benchmark.unit}
                </Text>
              </View>
              <View style={styles.benchmarkResult}>
                <Text style={[styles.benchmarkValue, { color: getStatusColor(benchmark.status) }]}>
                  {benchmark.actual.toFixed(1)}{benchmark.unit}
                </Text>
                <Text style={styles.benchmarkStatus}>
                  {getStatusIcon(benchmark.status)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Detailed Metrics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detailed Metrics</Text>

          <View style={styles.metricGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{report.averageFps}</Text>
              <Text style={styles.metricLabel}>Avg FPS</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{report.minFps}</Text>
              <Text style={styles.metricLabel}>Min FPS</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{report.maxFps}</Text>
              <Text style={styles.metricLabel}>Max FPS</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{report.peakMemory.toFixed(0)}</Text>
              <Text style={styles.metricLabel}>Peak MB</Text>
            </View>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricRowLabel}>Total Swipes:</Text>
            <Text style={styles.metricRowValue}>{report.totalSwipes}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricRowLabel}>Frame Drops:</Text>
            <Text style={[styles.metricRowValue, { color: report.frameDrops <= 5 ? '#4CAF50' : '#F44336' }]}>
              {report.frameDrops}
            </Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricRowLabel}>Session Duration:</Text>
            <Text style={styles.metricRowValue}>{Math.round(report.sessionDuration)}s</Text>
          </View>
        </View>

        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Technical Details</Text>
          <Text style={styles.deviceInfo}>
            • React Native v0.81.5 with New Architecture{'\n'}
            • Expo Router v6 with typed routes{'\n'}
            • React Native Gesture Handler v2.24{'\n'}
            • React Native Reanimated v4.1{'\n'}
            • Optimized image rendering with Expo Image{'\n'}
            • Memory-efficient card stack management
          </Text>
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationList}>
            {report.averageFps < 58 && (
              <Text style={styles.recommendation}>
                📉 Consider optimizing animations or reducing visual complexity
              </Text>
            )}
            {report.peakMemory > 150 && (
              <Text style={styles.recommendation}>
                💾 Memory usage is high - implement image caching optimizations
              </Text>
            )}
            {report.frameDrops > 8 && (
              <Text style={styles.recommendation}>
                ⚡ Too many frame drops - review gesture handling performance
              </Text>
            )}
            {overallScore >= 90 && (
              <Text style={styles.recommendation}>
                🎉 Excellent performance! Ready for production deployment
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.shareButton} onPress={shareResults}>
          <Text style={styles.shareButtonText}>Share Results</Text>
        </TouchableOpacity>

        <Link href="/" asChild>
          <TouchableOpacity style={styles.backButton}>
            <Text style={styles.backButtonText}>Run Another Test</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreDescription: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  benchmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  benchmarkInfo: {
    flex: 1,
  },
  benchmarkName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  benchmarkTarget: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  benchmarkResult: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  benchmarkValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  benchmarkStatus: {
    fontSize: 16,
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  metricRowLabel: {
    fontSize: 16,
    color: '#333',
  },
  metricRowValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceInfo: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recommendationList: {
    gap: 8,
  },
  recommendation: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});