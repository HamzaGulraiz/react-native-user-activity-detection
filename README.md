# react-native-user-activity-detection

A React Native library for detecting user activity and handling app inactivity with native module support for iOS and Android. Perfect for implementing auto-lock functionality, session management, and security features.

## Features

- 🚀 **Native Performance**: Uses native modules for efficient activity detection
- 📱 **Cross-Platform**: Supports both iOS and Android
- ⚡ **TypeScript Support**: Fully typed with TypeScript
- 🎯 **Customizable**: Configurable timeouts and callbacks
- 🔒 **Security Focused**: Ideal for apps requiring auto-lock functionality
- 📊 **Background Detection**: Handles app background/foreground transitions
- 🎮 **Touch & Scroll Detection**: Detects various user interactions
- 🔄 **Optimized Performance**: Built-in render optimization to prevent excessive re-renders

![demo](https://postimg.cc/jLjXN2z3). ![demo](https://postimg.cc/k6z8gRnY)

## Installation

```sh
npm install react-native-user-activity-detection
```

### iOS Setup

1. Run pod install:

```sh
cd ios && pod install
```

### Android Setup

1. Run ./gradlew build:

```sh
cd android && ./gradlew build
```

## Usage

### Basic Usage

```typescript
import React, { useCallback, useMemo } from 'react';
import { View, Text, Alert } from 'react-native';
import { useNativeActivityDetection } from 'react-native-user-activity-detection';

const App = () => {
  // Memoize callbacks to prevent unnecessary re-renders
  const handleInactivity = useCallback(() => {
    Alert.alert('Session Expired', 'Please login again');
    // Lock the app or navigate to login screen
  }, []);

  const handleActivity = useCallback(() => {
    console.log('User is active');
  }, []);

  const handleBackground = useCallback(() => {
    console.log('App went to background');
  }, []);

  const handleForeground = useCallback(() => {
    console.log('App came to foreground');
  }, []);

  // Memoize options object to prevent hook re-initialization
  const activityOptions = useMemo(() => ({
    inactivityTimeout: 300000, // 5 minutes
    backgroundTimeout: 120, // 2 minutes
    onInactivity: handleInactivity,
    onActivity: handleActivity,
    onBackground: handleBackground,
    onForeground: handleForeground,
    debug: false
  }), [handleInactivity, handleActivity, handleBackground, handleForeground]);

  const { isModuleAvailable, resetTimer } = useNativeActivityDetection(activityOptions);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Native Module Available: {isModuleAvailable ? 'Yes' : 'No'}</Text>
      <Text>Activity detection is running...</Text>
    </View>
  );
};

export default App;
```

### Performance-Optimized Usage

For best performance in complex applications, follow these patterns:

```typescript
import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { useNativeActivityDetection } from 'react-native-user-activity-detection';

// Memoize components that don't need frequent updates
const StatusDisplay = React.memo<{
  isModuleAvailable: boolean;
  isEnabled: boolean;
  activityCount: number;
}>(({ isModuleAvailable, isEnabled, activityCount }) => (
  <View>
    <Text>Module: {isModuleAvailable ? '✅' : '❌'}</Text>
    <Text>Enabled: {isEnabled ? '✅' : '❌'}</Text>
    <Text>Activity Count: {activityCount}</Text>
  </View>
));

const OptimizedApp = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activityCount, setActivityCount] = useState(0);

  // Stable callback references
  const handleInactivity = useCallback(() => {
    Alert.alert('Inactivity Detected', 'You have been inactive!');
  }, []);

  const handleActivity = useCallback(() => {
    setActivityCount(prev => prev + 1);
  }, []);

  const toggleEnabled = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  // Memoized options prevent hook re-initialization
  const options = useMemo(() => ({
    enabled: isEnabled,
    inactivityTimeout: 10000,
    backgroundTimeout: 5000,
    onInactivity: handleInactivity,
    onActivity: handleActivity,
    debug: __DEV__
  }), [isEnabled, handleInactivity, handleActivity]);

  const { isModuleAvailable, resetTimer } = useNativeActivityDetection(options);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <StatusDisplay
        isModuleAvailable={isModuleAvailable}
        isEnabled={isEnabled}
        activityCount={activityCount}
      />

      <TouchableOpacity onPress={toggleEnabled}>
        <Text>{isEnabled ? 'Disable' : 'Enable'} Detection</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resetTimer}>
        <Text>Reset Timer</Text>
      </TouchableOpacity>
    </View>
  );
};

export default OptimizedApp;
```

### Advanced Usage with Redux

```typescript
import React, { useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNativeActivityDetection } from 'react-native-user-activity-detection';
import { lockApp, unlockApp, updateActivity } from './store/authSlice';

const AppWithRedux = () => {
  const { isAuthenticated, isUnlocked } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Memoize dispatch callbacks
  const handleInactivity = useCallback(() => {
    dispatch(lockApp());
  }, [dispatch]);

  const handleActivity = useCallback(() => {
    dispatch(updateActivity());
  }, [dispatch]);

  // Memoize options to prevent unnecessary hook re-initialization
  const options = useMemo(
    () => ({
      enabled: isAuthenticated && isUnlocked,
      inactivityTimeout: 480000, // 8 minutes
      backgroundTimeout: 240, // 4 minutes
      onInactivity: handleInactivity,
      onActivity: handleActivity,
      debug: false,
    }),
    [isAuthenticated, isUnlocked, handleInactivity, handleActivity]
  );

  useNativeActivityDetection(options);

  // Rest of your component...
};
```

## API Reference

### `useNativeActivityDetection(options)`

#### Options

| Parameter           | Type         | Default     | Description                             |
| ------------------- | ------------ | ----------- | --------------------------------------- |
| `inactivityTimeout` | `number`     | `480000`    | Inactivity timeout in milliseconds      |
| `backgroundTimeout` | `number`     | `240`       | Background timeout in seconds           |
| `enabled`           | `boolean`    | `true`      | Whether to enable activity detection    |
| `onInactivity`      | `() => void` | `undefined` | Callback when user becomes inactive     |
| `onActivity`        | `() => void` | `undefined` | Callback when user activity is detected |
| `onBackground`      | `() => void` | `undefined` | Callback when app goes to background    |
| `onForeground`      | `() => void` | `undefined` | Callback when app comes to foreground   |
| `debug`             | `boolean`    | `false`     | Enable debug logging                    |

#### Returns

| Property            | Type         | Description                            |
| ------------------- | ------------ | -------------------------------------- |
| `resetTimer`        | `() => void` | Reset the inactivity timer             |
| `isModuleAvailable` | `boolean`    | Whether the native module is available |

## Performance Best Practices

### 1. Memoize Callback Functions

Always wrap your callback functions with `useCallback` to prevent unnecessary re-renders:

```typescript
const handleInactivity = useCallback(() => {
  // Your logic here
}, []);
```

### 2. Memoize Options Object

Wrap the options object in `useMemo` to prevent hook re-initialization:

```typescript
const options = useMemo(
  () => ({
    inactivityTimeout: 300000,
    onInactivity: handleInactivity,
    // ... other options
  }),
  [handleInactivity]
);
```

### 3. Use React.memo for Components

Memoize components that don't need frequent updates:

```typescript
const StatusComponent = React.memo(({ status }) => (
  <Text>{status}</Text>
));
```

### 4. Avoid Inline Functions

Don't pass inline functions as callbacks:

```typescript
// ❌ Bad - creates new function on every render
useNativeActivityDetection({
  onInactivity: () => console.log('inactive'),
});

// ✅ Good - stable reference
const handleInactivity = useCallback(() => {
  console.log('inactive');
}, []);

useNativeActivityDetection({
  onInactivity: handleInactivity,
});
```

## How It Works

### Native Module Integration

The library uses native modules to detect user interactions at the platform level:

- **iOS**: Intercepts touch events and system notifications
- **Android**: Uses touch listeners and activity lifecycle callbacks

### Activity Detection

1. **Touch Events**: Detects taps, swipes, and other touch interactions
2. **Scroll Events**: Monitors scrolling activity in views
3. **App State Changes**: Tracks when the app goes to background/foreground
4. **System Events**: Listens to relevant system-level activity indicators

### Timer Management

- Maintains an inactivity timer that resets on user activity
- Separate handling for background time tracking
- Automatic cleanup of timers and listeners
- Optimized to prevent memory leaks and excessive re-renders

### Performance Optimizations

- **Stable References**: All internal callbacks maintain stable references
- **Single Initialization**: Hook initializes only once, preventing redundant setups
- **Efficient Cleanup**: Proper cleanup of all subscriptions and timers
- **Memoized Returns**: Return values are memoized to prevent unnecessary re-renders

## Troubleshooting

### Native Module Not Available

If `isModuleAvailable` returns `false`:

1. **iOS**: Ensure you've run `pod install`
2. **Android**: Ensure you've run `./gradlew build`
3. **Metro**: Try clearing Metro cache: `npx react-native start --reset-cache`
4. **Clean Build**: Try cleaning and rebuilding your project

### Activity Not Detected

- Ensure the hook is enabled (`enabled: true`)
- Check that your app has proper touch targets
- Verify native module setup
- Enable debug mode to see activity logs

### Performance Issues / Excessive Re-renders

- Ensure callbacks are wrapped with `useCallback`
- Memoize the options object with `useMemo`
- Use `React.memo` for components that don't need frequent updates
- Avoid passing inline functions as callbacks

### Background Detection Issues

- **iOS**: Check app background execution permissions
- **Android**: Verify activity lifecycle handling
- Test background timeout values are appropriate for your use case

## Migration Guide

### From v1.x to v2.x

The hook now requires memoized callbacks for optimal performance:

```typescript
// v1.x - may cause performance issues
useNativeActivityDetection({
  onInactivity: () => console.log('inactive'),
});

// v2.x - optimized approach
const handleInactivity = useCallback(() => {
  console.log('inactive');
}, []);

const options = useMemo(
  () => ({
    onInactivity: handleInactivity,
  }),
  [handleInactivity]
);

useNativeActivityDetection(options);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made by ❤️ with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)

## Author

👤 **Hamza Gulraiz**

## 📬 Contact Me

<p>
  <a href="mailto:devhamzagulraiz@gmail.com">
    <img alt="Email" src="https://img.shields.io/badge/email-D14836?style=for-the-badge&logo=gmail&logoColor=white"/>
  </a>
  <a href="https://www.linkedin.com/in/hamza-gulraiz-b1a105251/" target="_blank">
    <img alt="LinkedIn" src="https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white"/>
  </a>
  <a href="https://github.com/HamzaGulraiz" target="_blank">
    <img alt="GitHub" src="https://img.shields.io/badge/github-181717?style=for-the-badge&logo=github&logoColor=white"/>
  </a>
  <a href="https://stackoverflow.com/users/23890926/hamza-gulraiz" target="_blank">
    <img alt="StackOverflow" src="https://img.shields.io/badge/stack%20overflow-FE7A16?style=for-the-badge&logo=stack-overflow&logoColor=white"/>
  </a>
  <a href="https://www.npmjs.com/~dev-hamza" target="_blank">
    <img alt="npm" src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white"/>
  </a>
  <a href="https://www.instagram.com/hamza_gulraiz" target="_blank">
    <img alt="Instagram" src="https://img.shields.io/badge/instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white"/>
  </a>
  <a href="https://www.facebook.com/drago.power" target="_blank">
    <img alt="Facebook" src="https://img.shields.io/badge/facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white"/>
  </a>
</p>

---
