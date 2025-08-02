// src/useNativeActivityDetection.ts
import { useEffect, useRef, useCallback, useMemo } from 'react';
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
    debug = false,
  } = options;

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundTimeSpent = useRef<Date | null>(null);
  const eventEmitterRef = useRef<NativeEventEmitter | null>(null);
  const subscriptionRef = useRef<any>(null);
  const appStateSubscriptionRef = useRef<any>(null);
  const isInitializedRef = useRef(false);

  // Memoize stable values to prevent unnecessary re-creates
  const stableCallbacks = useMemo(
    () => ({
      onInactivity,
      onActivity,
      onBackground,
      onForeground,
    }),
    [onInactivity, onActivity, onBackground, onForeground]
  );

  // Handle inactivity timeout - memoized with stable dependencies
  const handleInactivity = useCallback(() => {
    if (!enabled) return;
    stableCallbacks.onInactivity?.();
  }, [enabled, stableCallbacks.onInactivity]);

  // Reset the inactivity timer - stable reference
  const resetInactivityTimer = useCallback(() => {
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    if (enabled) {
      timeoutIdRef.current = setTimeout(handleInactivity, inactivityTimeout);
      if (debug) console.log('⏱️ Inactivity timer reset');
    }
  }, [enabled, inactivityTimeout, handleInactivity, debug]);

  // Handle user activity - stable reference
  const handleUserActivity = useCallback(() => {
    if (!enabled) return;
    stableCallbacks.onActivity?.();
    resetInactivityTimer();
  }, [enabled, stableCallbacks.onActivity, resetInactivityTimer]);

  // Check module availability - stable reference
  const checkModuleAvailability = useCallback(async (): Promise<boolean> => {
    try {
      if (
        UserActivityDetection &&
        typeof UserActivityDetection.isAvailable === 'function'
      ) {
        return await UserActivityDetection.isAvailable();
      }
      return false;
    } catch (error) {
      if (debug) {
        console.warn(
          `⚠️ Native activity module not available on ${Platform.OS}:`,
          error
        );
      }
      return false;
    }
  }, [debug]);

  // Handle app state changes - stable reference
  const handleAppStateChange = useCallback(
    async (nextAppState: string) => {
      if (!enabled) return;

      try {
        if (nextAppState === 'active') {
          stableCallbacks.onForeground?.();

          if (backgroundTimeSpent.current) {
            const timeSpentInBackground = Math.floor(
              (Date.now() - backgroundTimeSpent.current.getTime()) / 1000
            );

            if (debug) {
              console.log(
                '⏱️ App came to foreground, background time:',
                timeSpentInBackground
              );
            }

            if (timeSpentInBackground >= backgroundTimeout / 1000) {
              backgroundTimeSpent.current = null;
              handleInactivity();
              return;
            }
            backgroundTimeSpent.current = null;
          }
          handleUserActivity();
        } else if (
          nextAppState === 'background' ||
          nextAppState === 'inactive'
        ) {
          if (debug) {
            console.log('⏱️ App went to background');
          }
          backgroundTimeSpent.current = new Date();
          stableCallbacks.onBackground?.();
        }
      } catch (error) {
        console.error('Error handling app state change:', error);
      }
    },
    [
      enabled,
      backgroundTimeout,
      debug,
      stableCallbacks,
      handleInactivity,
      handleUserActivity,
    ]
  );

  // Handle native activity events - stable reference
  const handleNativeActivity = useCallback(() => {
    handleUserActivity();
  }, [handleUserActivity]);

  // Cleanup function - stable reference
  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (appStateSubscriptionRef.current) {
      appStateSubscriptionRef.current.remove();
      appStateSubscriptionRef.current = null;
    }
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
      timeoutIdRef.current = null;
    }
    eventEmitterRef.current = null;
    backgroundTimeSpent.current = null;
    isInitializedRef.current = false;
  }, []);

  // Setup native tracking - stable reference
  const setupNativeTracking = useCallback(async () => {
    try {
      // Clean up existing subscriptions
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

      const isAvailable = await checkModuleAvailability();

      if (isAvailable && enabled) {
        eventEmitterRef.current = new NativeEventEmitter(UserActivityDetection);
        subscriptionRef.current = eventEmitterRef.current.addListener(
          'UserActivityDetected',
          handleNativeActivity
        );
        resetInactivityTimer();

        if (debug) {
          console.log('✅ Native activity tracking setup complete');
        }
      }
    } catch (error) {
      console.error('Error setting up native tracking:', error);
    }
  }, [
    checkModuleAvailability,
    enabled,
    handleNativeActivity,
    resetInactivityTimer,
    debug,
  ]);

  // Main setup effect - runs only when necessary
  useEffect(() => {
    if (isInitializedRef.current) return;

    const initialize = async () => {
      try {
        await setupNativeTracking();

        // Setup app state listener
        appStateSubscriptionRef.current = AppState.addEventListener(
          'change',
          handleAppStateChange
        );

        isInitializedRef.current = true;

        if (debug) {
          console.log('🚀 Activity detection initialized');
        }
      } catch (error) {
        console.error('Error initializing activity detection:', error);
      }
    };

    initialize();

    return cleanup;
  }, []); // Empty dependency array - runs only once

  // Effect to handle enabled state changes
  useEffect(() => {
    if (!isInitializedRef.current) return;

    if (enabled) {
      resetInactivityTimer();
    } else {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    }
  }, [enabled, resetInactivityTimer]);

  // Memoize return object to prevent unnecessary re-renders
  return useMemo(
    () => ({
      resetTimer: resetInactivityTimer,
      isModuleAvailable: !!UserActivityDetection,
    }),
    [resetInactivityTimer]
  );
};
