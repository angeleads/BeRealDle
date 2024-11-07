import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { auth, db } from "../../library/firebaseConfig";
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { Ionicons } from "@expo/vector-icons";

export default function UserProfile() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    fetchUserData();
    checkIfFollowing();
  }, [id]);

  const fetchUserData = async () => {
    if (id) {
      const userDoc = await getDoc(doc(db, "users", id as string));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    }
  };

  const checkIfFollowing = async () => {
    if (auth.currentUser && id) {
      const currentUserDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const currentUserData = currentUserDoc.data();
      setIsFollowing(currentUserData?.following?.includes(id));
    }
  };

  const handleFollowUnfollow = async () => {
    if (auth.currentUser && id) {
      const currentUserRef = doc(db, "users", auth.currentUser.uid);
      const targetUserRef = doc(db, "users", id as string);

      if (isFollowing) {
        await updateDoc(currentUserRef, {
          following: arrayRemove(id),
        });
        await updateDoc(targetUserRef, {
          followers: arrayRemove(auth.currentUser.uid),
        });
      } else {
        await updateDoc(currentUserRef, {
          following: arrayUnion(id),
        });
        await updateDoc(targetUserRef, {
          followers: arrayUnion(auth.currentUser.uid),
        });
      }

      setIsFollowing(!isFollowing);
      fetchUserData();
    }
  };

  if (!userData) {
    return <View><Text>Loading...</Text></View>;
  }

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="bg-black h-44 rounded-b-3xl">
        <View className="mt-24 items-center">
          <Image
            source={{
              uri: userData.profilePicture || "https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg",
            }}
            className="w-32 h-32 rounded-full border-4 border-white"
          />
        </View>
      </View>

      <View className="mt-16 px-6">
        <View className="bg-white rounded-xl shadow-md p-6 mb-4">
          <Text className="text-2xl font-bold mb-2">{userData.username}</Text>
          <Text className="text-gray-600 mb-4">{userData.email}</Text>
          <View className="flex-row justify-between mb-6">
            <Text className="text-gray-600 text-lg font-bold"> {userData.followers?.length || 0} Followers</Text>
            <Text className="text-gray-600 text-lg font-bold"> {userData.following?.length || 0} Following</Text>
          </View>
          <TouchableOpacity
            onPress={handleFollowUnfollow}
            className={`py-3 rounded-xl ${isFollowing ? 'bg-gray-300' : 'bg-black'}`}
          >
            <Text className={`text-center font-bold ${isFollowing ? 'text-black' : 'text-white'}`}>
              {isFollowing ? 'Unfollow' : 'Follow'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="absolute top-12 right-6">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}