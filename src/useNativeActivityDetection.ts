// src/useNativeActivityDetection.ts
import { useEffect, useRef, useCallback } from 'react';
import {
  NativeModules,
  NativeEventEmitter,
  Platform,
  AppState,
} from 'react-native';
import type {
  ActivityDetectionOptions,
  ActivityDetectionResult,
} from './types';

const { UserActivityDetection } = NativeModules;

// Default constants
const DEFAULT_INACTIVITY_TIMEOUT = 480 * 1000; // 8 minutes
const DEFAULT_BACKGROUND_TIMEOUT = 240; // 4 minutes

/**
 * Hook that uses native modules to detect user inactivity
 * @param options Configuration options for activity detection
 * @returns Object with activity detection methods and status
 */
export const useNativeActivityDetection = (
  options: ActivityDetectionOptions = {}
): ActivityDetectionResult => {
  const {
    inactivityTimeout = DEFAULT_INACTIVITY_TIMEOUT,
    backgroundTimeout = DEFAULT_BACKGROUND_TIMEOUT,
    enabled = true,
    onInactivity,
    onActivity,
    onBackground,
    onForeground,
  } = options;

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeSpent = useRef<Date | null>(null);
  const eventEmitterRef = useRef<NativeEventEmitter | null>(null);
  const subscriptionRef = useRef<any>(null);

  // Handle inactivity timeout
  const handleInactivity = useCallback(() => {
    if (!enabled) return;
    onInactivity?.();
  }, [enabled, onInactivity]);

  // Reset the inactivity timer
  const resetInactivityTimer = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }
    if (enabled) {
      timeoutIdRef.current = setTimeout(handleInactivity, inactivityTimeout);
    }
  }, [enabled, inactivityTimeout, handleInactivity]);

  // Handle user activity
  const handleUserActivity = useCallback(() => {
    if (!enabled) return;
    onActivity?.();
    resetInactivityTimer();
  }, [enabled, onActivity, resetInactivityTimer]);

  // Check if native module is available
  const checkModuleAvailability = useCallback(async (): Promise<boolean> => {
    try {
      if (
        UserActivityDetection &&
        typeof UserActivityDetection.isAvailable === 'function'
      ) {
        const isAvailable = await UserActivityDetection.isAvailable();
        return isAvailable;
      }
      return false;
    } catch (error) {
      console.warn(
        `Native activity module not available on ${Platform.OS}:`,
        error
      );
      return false;
    }
  }, []);

  // Handle app state changes
  const handleAppStateChange = useCallback(
    async (nextAppState: string) => {
      if (!enabled) return;

      if (nextAppState === 'active') {
        onForeground?.();

        if (backgroundTimeSpent.current) {
          const timeSpentInBackground = Math.floor(
            (new Date().getTime() - backgroundTimeSpent.current.getTime()) /
              1000
          );

          if (timeSpentInBackground >= backgroundTimeout) {
            handleInactivity();
            return;
          } else {
            backgroundTimeSpent.current = null;
          }
        }
        handleUserActivity();
      } else if (nextAppState === 'background' || nextAppState === 'inactive') {
        onBackground?.();
        backgroundTimeSpent.current = new Date();
      }
    },
    [
      enabled,
      backgroundTimeout,
      handleInactivity,
      handleUserActivity,
      onForeground,
      onBackground,
    ]
  );

  // Handle native activity events
  const handleNativeActivity = useCallback(() => {
    handleUserActivity();
  }, [handleUserActivity]);

  // Setup native tracking
  const setupNativeTracking = useCallback(async () => {
    const isAvailable = await checkModuleAvailability();

    if (isAvailable && enabled) {
      // Set up event listener for native activity events
      eventEmitterRef.current = new NativeEventEmitter(UserActivityDetection);
      subscriptionRef.current = eventEmitterRef.current.addListener(
        'UserActivityDetected',
        handleNativeActivity
      );

      // Initialize the timer
      resetInactivityTimer();
    }
  }, [
    checkModuleAvailability,
    enabled,
    handleNativeActivity,
    resetInactivityTimer,
  ]);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    eventEmitterRef.current = null;
    backgroundTimeSpent.current = null;
  }, []);

  // Main effect
  useEffect(() => {
    if (!enabled) {
      cleanup();
      return;
    }

    setupNativeTracking();

    const appStateSubscription = AppState.addEventListener(
      'change',
      handleAppStateChange
    );

    return () => {
      cleanup();
      appStateSubscription?.remove();
    };
  }, [enabled, setupNativeTracking, handleAppStateChange, cleanup]);

  // Manual trigger function
  const triggerActivity = useCallback(() => {
    if (
      UserActivityDetection &&
      typeof UserActivityDetection.resetInactivityTimer === 'function'
    ) {
      UserActivityDetection.resetInactivityTimer();
    }
    handleUserActivity();
  }, [handleUserActivity]);

  return {
    triggerActivity,
    resetTimer: resetInactivityTimer,
    isModuleAvailable: !!UserActivityDetection,
  };
};
