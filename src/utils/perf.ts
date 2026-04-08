import { useEffect, useRef, useState, useCallback } from "react";
import { Text, View, StyleSheet } from "react-native";
import React from "react";

// Global to pass timing data between tab press and screen render
declare global {
  var __PERF_TAB_PRESS_START: number | undefined;
}

/**
 * Call this in each tab screen. It measures the time from the tab press
 * event to the screen's first render/mount.
 */
export function useRenderTimer(
  onMeasure: (ms: number) => void
) {
  const measured = useRef(false);

  useEffect(() => {
    if (global.__PERF_TAB_PRESS_START && !measured.current) {
      measured.current = true;
      const delta = performance.now() - global.__PERF_TAB_PRESS_START;
      global.__PERF_TAB_PRESS_START = undefined;
      onMeasure(delta);
    }
    // Reset for next navigation
    return () => {
      measured.current = false;
    };
  });
}

/**
 * Overlay that displays the last transition time and a running average.
 */
export function PerfOverlay() {
  const [last, setLast] = useState<number | null>(null);
  const [avg, setAvg] = useState<number | null>(null);
  const history = useRef<number[]>([]);

  const record = useCallback((ms: number) => {
    history.current.push(ms);
    setLast(ms);
    const sum = history.current.reduce((a, b) => a + b, 0);
    setAvg(sum / history.current.length);
  }, []);

  // Wire this overlay as the global perf reporter
  useEffect(() => {
    setPerfReporter(record);
    return () => setPerfReporter(() => {});
  }, [record]);

  const color =
    last === null ? "#888" : last < 100 ? "#4CAF50" : last < 300 ? "#FF9800" : "#F44336";

  return React.createElement(
    View,
    { style: styles.overlay, pointerEvents: "none" },
    React.createElement(
      Text,
      { style: [styles.text, { color }] },
      last !== null
        ? `Last: ${last.toFixed(0)}ms | Avg: ${avg?.toFixed(0)}ms`
        : "Waiting for tab switch..."
    )
  );
}

// Export a context-free way for screens to report measurements
let _reportFn: ((ms: number) => void) | null = null;
export function setPerfReporter(fn: (ms: number) => void) {
  _reportFn = fn;
}
export function reportTransition(ms: number) {
  _reportFn?.(ms);
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  text: {
    fontSize: 14,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
});
