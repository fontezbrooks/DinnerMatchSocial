// Performance monitoring utilities
export interface PerformanceMetrics {
  fps: number;
  averageFps: number;
  memoryUsage: number;
  renderTime: number;
  gesturesToFps: number[];
  timestamp: number;
}

export interface PerformanceReport {
  sessionDuration: number;
  totalSwipes: number;
  averageFps: number;
  minFps: number;
  maxFps: number;
  averageMemory: number;
  peakMemory: number;
  gestureCount: number;
  frameDrops: number;
  launchTime: number;
}

class PerformanceMonitor {
  private frameCount = 0;
  private lastTime = performance.now();
  private fps = 60;
  private fpsHistory: number[] = [];
  private memoryHistory: number[] = [];
  private gestureCount = 0;
  private frameDrops = 0;
  private sessionStartTime = 0;
  private launchTime = 0;
  private listeners: ((metrics: PerformanceMetrics) => void)[] = [];

  constructor() {
    this.sessionStartTime = performance.now();
    this.launchTime = performance.now();
    this.startFpsMonitoring();
  }

  private startFpsMonitoring() {
    const measureFps = () => {
      const currentTime = performance.now();
      this.frameCount++;

      // Calculate FPS every 500ms
      if (currentTime - this.lastTime >= 500) {
        const timeElapsed = (currentTime - this.lastTime) / 1000;
        const currentFps = Math.round(this.frameCount / timeElapsed);

        this.fps = currentFps;
        this.fpsHistory.push(currentFps);

        // Keep only last 120 readings (1 minute at 500ms intervals)
        if (this.fpsHistory.length > 120) {
          this.fpsHistory.shift();
        }

        // Count frame drops (FPS below 55)
        if (currentFps < 55) {
          this.frameDrops++;
        }

        this.frameCount = 0;
        this.lastTime = currentTime;

        this.notifyListeners();
      }

      requestAnimationFrame(measureFps);
    };

    requestAnimationFrame(measureFps);
  }

  public trackGesture() {
    this.gestureCount++;
  }

  public getMemoryUsage(): number {
    // Estimate memory usage (React Native doesn't have direct memory API)
    // This is an approximation based on performance metrics
    if ((performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }

    // Fallback estimation based on various factors
    const estimatedMemory =
      50 + // Base app memory
      (this.fpsHistory.length * 0.1) + // History tracking
      (this.gestureCount * 0.01); // Gesture interactions

    return Math.min(estimatedMemory, 200); // Cap at 200MB
  }

  public getCurrentMetrics(): PerformanceMetrics {
    const memoryUsage = this.getMemoryUsage();
    this.memoryHistory.push(memoryUsage);

    if (this.memoryHistory.length > 60) {
      this.memoryHistory.shift();
    }

    return {
      fps: this.fps,
      averageFps: this.getAverageFps(),
      memoryUsage,
      renderTime: performance.now() - this.lastTime,
      gesturesToFps: this.fpsHistory.slice(-10),
      timestamp: performance.now(),
    };
  }

  public getPerformanceReport(): PerformanceReport {
    const sessionDuration = (performance.now() - this.sessionStartTime) / 1000;
    const averageMemory = this.memoryHistory.reduce((a, b) => a + b, 0) / this.memoryHistory.length || 0;
    const peakMemory = Math.max(...this.memoryHistory, 0);

    return {
      sessionDuration,
      totalSwipes: this.gestureCount,
      averageFps: this.getAverageFps(),
      minFps: Math.min(...this.fpsHistory, 60),
      maxFps: Math.max(...this.fpsHistory, 0),
      averageMemory,
      peakMemory,
      gestureCount: this.gestureCount,
      frameDrops: this.frameDrops,
      launchTime: this.launchTime,
    };
  }

  private getAverageFps(): number {
    if (this.fpsHistory.length === 0) return 60;
    return Math.round(this.fpsHistory.reduce((a, b) => a + b, 0) / this.fpsHistory.length);
  }

  public subscribe(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    const metrics = this.getCurrentMetrics();
    this.listeners.forEach(listener => listener(metrics));
  }

  public reset() {
    this.frameCount = 0;
    this.fpsHistory = [];
    this.memoryHistory = [];
    this.gestureCount = 0;
    this.frameDrops = 0;
    this.sessionStartTime = performance.now();
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for using performance metrics
import { useEffect, useState } from 'react';

export const usePerformanceMetrics = () => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>(() =>
    performanceMonitor.getCurrentMetrics()
  );

  useEffect(() => {
    return performanceMonitor.subscribe(setMetrics);
  }, []);

  return metrics;
};