import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useNativeActivityDetection } from 'react-native-user-activity-detection';

// Memoized components to prevent unnecessary re-renders
const StatusDisplay = React.memo<{
  isModuleAvailable: boolean;
  isEnabled: boolean;
  activityCount: number;
  lastActivity: string;
}>(({ isModuleAvailable, isEnabled, activityCount, lastActivity }) => (
  <View style={styles.statusContainer}>
    <Text style={styles.statusText}>
      Native Module: {isModuleAvailable ? '✅ Available' : '❌ Not Available'}
    </Text>
    <Text style={styles.statusText}>
      Detection: {isEnabled ? '✅ Enabled' : '❌ Disabled'}
    </Text>
    <Text style={styles.statusText}>Activity Count: {activityCount}</Text>
    <Text style={styles.statusText}>
      Last Activity: {lastActivity || 'None'}
    </Text>
  </View>
));

const InfoSection = React.memo(() => (
  <View style={styles.infoContainer}>
    <Text style={styles.infoTitle}>How it works:</Text>
    <Text style={styles.infoText}>
      • Touch anywhere on the screen to trigger activity
    </Text>
    <Text style={styles.infoText}>
      • Scroll this view to trigger activity
    </Text>
    <Text style={styles.infoText}>
      • After 10 seconds of inactivity, you'll get an alert
    </Text>
    <Text style={styles.infoText}>
      • Put the app in background for 5+ seconds to test background detection
    </Text>
  </View>
));

const DemoItem = React.memo<{ item: number }>(({ item }) => {
  const handlePress = useCallback(() => {
    console.log(`Demo item ${item} pressed`);
  }, [item]);

  return (
    <TouchableOpacity style={styles.demoItem} onPress={handlePress}>
      <Text style={styles.demoItemText}>Demo Item {item}</Text>
    </TouchableOpacity>
  );
});

const DemoArea = React.memo(() => {
  const demoItems = useMemo(() => [1, 2, 3, 4, 5], []);

  return (
    <View style={styles.demoArea}>
      <Text style={styles.demoTitle}>Demo Area</Text>
      <Text style={styles.demoText}>
        This is a demo area where you can interact to test the activity
        detection. Try scrolling, tapping, or swiping in this area.
      </Text>
      {demoItems.map((item) => (
        <DemoItem key={item} item={item} />
      ))}
    </View>
  );
});

const App: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [activityCount, setActivityCount] = useState(0);
  const [lastActivity, setLastActivity] = useState<string>('');

  // Memoize callback functions to prevent re-creation on each render
  const handleInactivity = useCallback(() => {
    Alert.alert(
      'Inactivity Detected',
      'You have been inactive for 10 seconds!',
      [
        {
          text: 'OK',
          onPress: () => resetTimer(),
        },
      ]
    );
  }, []);

  const handleActivity = useCallback(() => {
    setActivityCount((prev) => prev + 1);
    setLastActivity(new Date().toLocaleTimeString());
  }, []);

  const handleBackground = useCallback(() => {
    console.log('App went to background');
  }, []);

  const handleForeground = useCallback(() => {
    console.log('App came to foreground');
  }, []);

  // Memoize the options object
  const activityOptions = useMemo(() => ({
    enabled: isEnabled,
    inactivityTimeout: 10000, // 10 seconds for demo
    backgroundTimeout: 5000, // 5 seconds for demo
    onInactivity: handleInactivity,
    onActivity: handleActivity,
    onBackground: handleBackground,
    onForeground: handleForeground,
    debug: true,
  }), [isEnabled, handleInactivity, handleActivity, handleBackground, handleForeground]);

  const { isModuleAvailable, resetTimer } = useNativeActivityDetection(activityOptions);

  // Memoize toggle handler
  const handleToggleEnabled = useCallback(() => {
    setIsEnabled((prev) => !prev);
  }, []);

  // Memoize button content to prevent re-renders
  const toggleButtonText = useMemo(
    () => `${isEnabled ? 'Disable' : 'Enable'} Detection`,
    [isEnabled]
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>User Activity Detection Demo</Text>

        <StatusDisplay
          isModuleAvailable={isModuleAvailable}
          isEnabled={isEnabled}
          activityCount={activityCount}
          lastActivity={lastActivity}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.toggleButton]}
            onPress={handleToggleEnabled}
          >
            <Text style={styles.buttonText}>{toggleButtonText}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.resetButton]}
            onPress={resetTimer}
          >
            <Text style={styles.buttonText}>Reset Timer</Text>
          </TouchableOpacity>
        </View>

        <InfoSection />
        <DemoArea />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
  },
  resetButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
  demoArea: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    minHeight: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  demoText: {
    fontSize: 14,
    marginBottom: 15,
    color: '#666',
  },
  demoItem: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  demoItemText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});

export default App;