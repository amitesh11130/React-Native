import React, { useEffect } from 'react';
import { StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { configureGoogleSignIn } from './src/services/authService';
import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  useEffect(() => {
    // Configure Google Sign-in on mount
    try {
      configureGoogleSignIn();
    } catch (e) {
      console.error('Error configuring Google Sign-in:', e);
    }
  }, []);

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1E293B" />
        <RootNavigator />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
});

export default App;
