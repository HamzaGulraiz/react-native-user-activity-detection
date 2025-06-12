// src/types.ts

export interface UserActivityEvent {
  timestamp: number;
}

export interface ActivityDetectionOptions {
  /**
   * Inactivity timeout in milliseconds (default: 480000 - 8 minutes)
   */
  inactivityTimeout?: number;

  /**
   * Background timeout in seconds (default: 240 - 4 minutes)
   */
  backgroundTimeout?: number;

  /**
   * Whether to enable the hook (default: true)
   */
  enabled?: boolean;

  /**
   * Callback function called when user becomes inactive
   */
  onInactivity?: () => void;

  /**
   * Callback function called when user activity is detected
   */
  onActivity?: () => void;

  /**
   * Callback function called when app goes to background
   */
  onBackground?: () => void;

  /**
   * Callback function called when app comes to foreground
   */
  onForeground?: () => void;
}

export interface ActivityDetectionResult {
  /**
   * Function to manually trigger activity detection
   */
  triggerActivity: () => void;

  /**
   * Whether the native module is available
   */
  isModuleAvailable: boolean;

  /**
   * Reset the inactivity timer
   */
  resetTimer: () => void;
}