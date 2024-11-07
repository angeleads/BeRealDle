import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { auth, db, storage } from "../../library/firebaseConfig";
import {
  signOut,
  updateProfile,
  updateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState(auth.currentUser);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUsername(userData.username || "");
        setEmail(userData.email || "");
        setProfilePicture(userData.profilePicture || "");
        setFollowers(userData.followers?.length || 0);
        setFollowing(userData.following?.length || 0);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (user) {
      try {
        await updateProfile(user, {
          displayName: username,
          photoURL: profilePicture,
        });

        if (email !== user.email) {
          const credential = EmailAuthProvider.credential(
            user.email!,
            prompt("Please enter your current password") || ""
          );
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, email);
        }

        await updateDoc(doc(db, "users", user.uid), {
          username,
          profilePicture,
          email,
        });

        setIsEditing(false);
        Alert.alert("Success", "Profile updated successfully!");
        await user.reload();
        setUser(auth.currentUser);
        fetchUserData();
      } catch (error) {
        console.error("Error updating profile:", error);
        Alert.alert("Error", "Failed to update profile. Please try again.");
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

  const uploadImage = async (uri: string) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    const fileRef = ref(storage, `profilePictures/${user?.uid}`);

    try {
      await uploadBytes(fileRef, blob);
      const downloadURL = await getDownloadURL(fileRef);
      setProfilePicture(downloadURL);
    } catch (error) {
      console.error("Error uploading image:", error);
      Alert.alert("Error", "Failed to upload image. Please try again.");
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-black h-44 rounded-b-3xl">
        <View className="mt-24 items-center">
          <Image
            source={{
              uri:
                profilePicture ||
                "https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg",
            }}
            className="w-32 h-32 rounded-full border-4 border-white"
          />
          <TouchableOpacity
            onPress={pickImage}
            className="absolute bottom-0 right-48 bg-white rounded-full p-1"
          >
            <Ionicons name="camera" size={20} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-16 px-6">
        <View className="bg-white rounded-xl shadow-md p-6 mb-4">
          {isEditing ? (
            <>
              <TextInput
                value={username}
                onChangeText={setUsername}
                placeholder="Username"
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
                className="bg-black py-3 rounded-xl mb-2"
              >
                <Text className="text-white text-center font-bold">
                  Save Profile
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                className="bg-gray-300 py-3 rounded-xl"
              >
                <Text className="text-black text-center font-bold">
                  Cancel
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-2xl font-bold mb-2">Hi {username}! 👋🏼</Text>
              <Text className="text-gray-600 mb-2">{email}</Text>
              <View className="flex-row justify-between mb-4">
                <Text className="text-gray-600 text-lg font-bold">{followers} Followers</Text>
                <Text className="text-gray-600 text-lg font-bold">{following} Following</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                className="bg-black py-3 rounded-xl"
              >
                <Text className="text-white text-center font-bold">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <View className="bg-white rounded-xl shadow-md p-6 mb-4">
          <TouchableOpacity className="flex-row items-center mb-4">
            <Ionicons
              name="settings-outline"
              size={24}
              color="black"
              className="mr-4"
            />
            <Text className="text-lg">Settings</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center mb-4">
            <Ionicons
              name="help-circle-outline"
              size={24}
              color="black"
              className="mr-4"
            />
            <Text className="text-lg">Help & Support</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-row items-center">
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="black"
              className="mr-4"
            />
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
    </ScrollView>
  );
}