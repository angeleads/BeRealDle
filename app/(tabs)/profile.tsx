import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { auth, db, storage } from '../../library/firebaseConfig';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState(user?.photoURL || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setPhoneNumber(userData.phoneNumber || '');
        setProfilePicture(userData.profilePicture || '');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (user) {
      try {
        await updateProfile(user, { displayName, photoURL: profilePicture });
        await updateDoc(doc(db, 'users', user.uid), {
          name: displayName,
          phoneNumber,
          profilePicture,
        });
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully!');
      } catch (error) {
        console.error('Error updating profile:', error);
        Alert.alert('Error', 'Failed to update profile. Please try again.');
      }
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: any) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `profilePictures/${user?.uid}`);
    
    try {
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      setProfilePicture(downloadURL);
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-violet-400 h-44 rounded-b-3xl">
        <View className="mt-24 items-center">
          <TouchableOpacity onPress={pickImage}>
            <Image
              source={{ uri: profilePicture || 'https://via.placeholder.com/150' }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
            <View className="absolute bottom-0 right-0 bg-white rounded-full p-1">
              <Ionicons name="camera" size={20} color="black" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      <View className="mt-16 px-6">
        <View className="bg-white rounded-xl shadow-md p-6 mb-4">
          {isEditing ? (
            <>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                className="border-b border-gray-300 py-2 mb-4 text-black"
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Email"
                className="border-b border-gray-300 py-2 mb-4 text-black"
              />
              <TouchableOpacity
                onPress={handleSaveProfile}
                className="bg-violet-400 py-3 rounded-xl">
                <Text className="text-white text-center font-bold">Save Profile</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold mb-2">Hey {displayName}!</Text>
              <Text className="text-gray-600 mb-2">{email}</Text>
              <Text className="text-gray-600 mb-4">{phoneNumber}</Text>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="bg-violet-400 py-3 rounded-xl">
                <Text className="text-white text-center font-bold">Edit Profile</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View className="bg-white rounded-xl shadow-md p-6 mb-4">
          <TouchableOpacity className="flex-row items-center mb-4">
            <Ionicons name="settings-outline" size={24} color="black" className="mr-4" />
            <Text className="text-lg">Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center mb-4">
            <Ionicons name="help-circle-outline" size={24} color="black" className="mr-4" />
            <Text className="text-lg">Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons name="information-circle-outline" size={24} color="black" className="mr-4" />
            <Text className="text-lg">About</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="bg-red-400 py-3 rounded-lg mb-8"
        >
          <Text className="text-white text-center font-bold">Logout</Text>
        </TouchableOpacity>
      </View>

      <View className="absolute top-12 right-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}