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

## Installation

```sh
npm install react-native-user-activity-detection
```

### iOS Setup

1. Run pod install:
```sh
cd ios && pod install
```

2. Add the native files to your iOS project:
   - Copy `UserActivityModule.h` and `UserActivityModule.m` to your iOS project
   - Make sure they're added to your Xcode project

### Android Setup

1. Add the package to your `MainApplication.java`:

```java
import com.yourapp.useractivity.UserActivityPackage;

// In the getPackages() method:
@Override
protected List<ReactPackage> getPackages() {
    return Arrays.<ReactPackage>asList(
        new MainReactPackage(),
        new UserActivityPackage() // Add this line
    );
}
```

2. Add the native files to your Android project:
   - Copy `UserActivityModule.kt` and `UserActivityPackage.kt` to your Android project
   - Update the package name in the files to match your app

## Usage

### Basic Usage

```typescript
import React from 'react';
import { View, Text, Alert } from 'react-native';
import { useNativeActivityDetection } from 'react-native-user-activity-detection';

const App = () => {
  const { triggerActivity, isModuleAvailable, resetTimer } = useNativeActivityDetection({
    inactivityTimeout: 300000, // 5 minutes
    backgroundTimeout: 120, // 2 minutes
    onInactivity: () => {
      Alert.alert('Session Expired', 'Please login again');
      // Lock the app or navigate to login screen
    },
    onActivity: () => {
      console.log('User is active');
    },
    onBackground: () => {
      console.log('App went to background');
    },
    onForeground: () => {
      console.log('App came to foreground');
    },
  });

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Native Module Available: {isModuleAvailable ? 'Yes' : 'No'}</Text>
      <Text>Activity detection is running...</Text>
    </View>
  );
};

export default App;
```

### Advanced Usage with Redux

```typescript
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNativeActivityDetection } from 'react-native-user-activity-detection';
import { lockApp, unlockApp } from './store/authSlice';

const AppWithRedux = () => {
  const { isAuthenticated, isUnlocked } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const { triggerActivity } = useNativeActivityDetection({
    enabled: isAuthenticated && isUnlocked,
    inactivityTimeout: 480000, // 8 minutes
    backgroundTimeout: 240, // 4 minutes
    onInactivity: () => {
      dispatch(lockApp());
    },
    onActivity: () => {
      // Reset any warning timers
    },
  });

  // Rest of your component...
};
```

## API Reference

### `useNativeActivityDetection(options)`

#### Options

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `inactivityTimeout` | `number` | `480000` | Inactivity timeout in milliseconds |
| `backgroundTimeout` | `number` | `240` | Background timeout in seconds |
| `enabled` | `boolean` | `true` | Whether to enable activity detection |
| `onInactivity` | `() => void` | `undefined` | Callback when user becomes inactive |
| `onActivity` | `() => void` | `undefined` | Callback when user activity is detected |
| `onBackground` | `() => void` | `undefined` | Callback when app goes to background |
| `onForeground` | `() => void` | `undefined` | Callback when app comes to foreground |

#### Returns

| Property | Type | Description |
|----------|------|-------------|
| `triggerActivity` | `() => void` | Manually trigger activity detection |
| `resetTimer` | `() => void` | Reset the inactivity timer |
| `isModuleAvailable` | `boolean` | Whether the native module is available |

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

## Troubleshooting

### Native Module Not Available

If `isModuleAvailable` returns `false`:

1. **iOS**: Ensure you've run `pod install` and the native files are properly added
2. **Android**: Check that the package is added to `MainApplication.java`
3. **Metro**: Try clearing Metro cache: `npx react-native start --reset-cache`

### Activity Not Detected

- Ensure the hook is enabled (`enabled: true`)
- Check that your app has proper touch targets
- Verify native module setup

### Background Detection Issues

- iOS: Check app background execution permissions
- Android: Verify activity lifecycle handling

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)