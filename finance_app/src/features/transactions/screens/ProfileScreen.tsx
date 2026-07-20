import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser, signOut, updateDemoUserProfile } from '../../../services/authService';

export function ProfileScreen() {
  const user = getCurrentUser();
  const userId = user?.uid || '';
  
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

  // Load custom profile information from AsyncStorage
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      try {
        const savedPhoto = await AsyncStorage.getItem(`profile_photo_${userId}`);
        const savedName = await AsyncStorage.getItem(`profile_name_${userId}`);
        
        if (savedPhoto) {
          setPhotoUri(savedPhoto);
        } else if (user?.photoURL) {
          setPhotoUri(user.photoURL);
        }

        if (savedName) {
          setName(savedName);
          setEditedName(savedName);
        } else {
          const defaultName = user?.displayName || 'User';
          setName(defaultName);
          setEditedName(defaultName);
        }
      } catch (e) {
        console.error('Failed to load profile details:', e);
      }
    };
    loadProfile();
  }, [userId, user]);

  const savePhoto = async (uri: string) => {
    try {
      setPhotoUri(uri);
      await AsyncStorage.setItem(`profile_photo_${userId}`, uri);
      
      // Update firebase or demo user profile state
      if (userId === 'demo_user_123') {
        await updateDemoUserProfile(name, uri);
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to save profile picture.');
    }
  };

  const handleNameSave = async () => {
    const trimmed = editedName.trim();
    if (!trimmed) {
      Alert.alert('Invalid Name', 'Name cannot be empty.');
      return;
    }

    try {
      setName(trimmed);
      setIsEditingName(false);
      await AsyncStorage.setItem(`profile_name_${userId}`, trimmed);

      if (userId === 'demo_user_123') {
        await updateDemoUserProfile(trimmed, photoUri || '');
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to update name.');
    }
  };

  const selectImageSource = () => {
    Alert.alert(
      'Profile Photo',
      'Choose a method to update your profile photo',
      [
        {
          text: 'Camera',
          onPress: openCamera,
        },
        {
          text: 'Gallery',
          onPress: openGallery,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const openCamera = async () => {
    try {
      const result = await launchCamera({
        mediaType: 'photo',
        quality: 0.7,
        saveToPhotos: false,
      });

      if (result.didCancel || result.errorCode) return;
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        await savePhoto(uri);
      }
    } catch (e) {
      console.error('Camera Launch Error:', e);
      Alert.alert('Error', 'Could not open camera.');
    }
  };

  const openGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        selectionLimit: 1,
      });

      if (result.didCancel || result.errorCode) return;
      const uri = result.assets?.[0]?.uri;
      if (uri) {
        await savePhoto(uri);
      }
    } catch (e) {
      console.error('Gallery Launch Error:', e);
      Alert.alert('Error', 'Could not open image library.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <TouchableOpacity style={styles.avatarWrapper} onPress={selectImageSource} activeOpacity={0.8}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#64748B" />
            </View>
          )}
          <View style={styles.cameraIconContainer}>
            <Ionicons name="camera" size={16} color="#FFF" />
          </View>
        </TouchableOpacity>

        {isEditingName ? (
          <View style={styles.editNameRow}>
            <TextInput
              style={styles.nameInput}
              value={editedName}
              onChangeText={setEditedName}
              maxLength={20}
              autoFocus
            />
            <TouchableOpacity style={styles.saveNameBtn} onPress={handleNameSave}>
              <Ionicons name="checkmark-outline" size={20} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveNameBtn} onPress={() => {
              setEditedName(name);
              setIsEditingName(false);
            }}>
              <Ionicons name="close-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.nameRow}>
            <Text style={styles.profileName}>{name}</Text>
            <TouchableOpacity onPress={() => setIsEditingName(true)}>
              <Ionicons name="pencil-outline" size={16} color="#6366F1" style={styles.editIcon} />
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.profileEmail}>{user?.email || 'demo@financeapp.com'}</Text>
      </View>

      {/* Account Settings List */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.menuList}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#6366F1' }]}>
                <Ionicons name="wallet-outline" size={20} color="#FFF" />
              </View>
              <Text style={styles.menuLabel}>Currency</Text>
            </View>
            <Text style={styles.menuValue}>INR (₹)</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#F59E0B' }]}>
                <Ionicons name="notifications-outline" size={20} color="#FFF" />
              </View>
              <Text style={styles.menuLabel}>Notifications</Text>
            </View>
            <Text style={styles.menuValue}>Enabled</Text>
          </View>

          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#10B981' }]}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#FFF" />
              </View>
              <Text style={styles.menuLabel}>Data Sync</Text>
            </View>
            <Text style={styles.menuValue}>Cloud Connected</Text>
          </View>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Info</Text>
        <View style={styles.menuList}>
          <View style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#475569' }]}>
                <Ionicons name="information-circle-outline" size={20} color="#FFF" />
              </View>
              <Text style={styles.menuLabel}>Version</Text>
            </View>
            <Text style={styles.menuValue}>1.0.0 (Expo/CLI)</Text>
          </View>
        </View>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut} activeOpacity={0.8}>
        <Ionicons name="log-out-outline" size={20} color="#FFF" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6366F1',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#6366F1',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1E293B',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  editNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  nameInput: {
    backgroundColor: '#0F172A',
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#6366F1',
    minWidth: 150,
  },
  saveNameBtn: {
    padding: 6,
    backgroundColor: '#0F172A',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profileName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  editIcon: {
    marginLeft: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#94A3B8',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 12,
  },
  menuList: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#F8FAFC',
  },
  menuValue: {
    fontSize: 14,
    color: '#94A3B8',
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#EF4444',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  signOutText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
export default ProfileScreen;
