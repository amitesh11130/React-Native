import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { signInWithGoogle, signInWithDemo } from '../../../services/authService';

export function LoginScreen() {
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      console.warn('Google Sign-In Error:', e);
      Alert.alert(
        'Google Sign-In Failed',
        e?.message || 'If you are using an emulator without Google Play services or missing SHA-1 config, please use the Demo Bypass button below.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = async () => {
    setLoading(true);
    try {
      await signInWithDemo();
    } catch (e: any) {
      Alert.alert('Demo Sign-In Failed', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Ionicons name="wallet-outline" size={60} color="#6366F1" />
        </View>
        <Text style={styles.title}>Antigravity Finance</Text>
        <Text style={styles.subtitle}>Smart tracking for your personal wealth</Text>
      </View>

      <View style={styles.buttonContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#6366F1" />
        ) : (
          <>
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
              activeOpacity={0.8}
            >
              <Ionicons name="logo-google" size={20} color="#FFFFFF" style={styles.btnIcon} />
              <Text style={styles.googleButtonText}>Sign In with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.demoButton}
              onPress={handleDemoSignIn}
              activeOpacity={0.8}
            >
              <Ionicons name="bug-outline" size={20} color="#94A3B8" style={styles.btnIcon} />
              <Text style={styles.demoButtonText}>Developer Demo Access</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.footerText}>
        Secure storage powered by AsyncStorage and Firebase
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonContainer: {
    marginBottom: 40,
    gap: 16,
  },
  googleButton: {
    flexDirection: 'row',
    backgroundColor: '#4285F4',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4285F4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  demoButton: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  demoButtonText: {
    color: '#E2E8F0',
    fontSize: 15,
    fontWeight: '600',
  },
  btnIcon: {
    marginRight: 10,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#475569',
  },
});
export default LoginScreen;
