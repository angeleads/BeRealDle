import React, { useState, useEffect } from "react";
import { View, Text, Image, ScrollView } from "react-native";
import { Timestamp, collection, getDocs } from "firebase/firestore";
import { db } from "../../library/firebaseConfig";

interface Post {
  id: string;
  imageUrl: string;
  createdAt: Timestamp | Date | { seconds: number; nanoseconds: number } | undefined;
  userId: string;
}

interface PostsProps {
  posts: Post[];
}

interface UserData {
  name: string;
  profilePicture: string;
}

export default function Posts({ posts }: PostsProps) {
  const [userData, setUserData] = useState<{ [key: string]: UserData }>({});

  useEffect(() => {
    const fetchUserData = async () => {
      const usersCollection = collection(db, "users");
      const usersSnapshot = await getDocs(usersCollection);
      const userDataMap: { [key: string]: UserData } = {};
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data && data.username && data.profilePicture) {
          userDataMap[doc.id] = {
            name: data.username,
            profilePicture: data.profilePicture
          };
        }
      });
      setUserData(userDataMap);
    };

    fetchUserData();
  }, []);

  const formatDate = (createdAt: Post["createdAt"]) => {
    if (!createdAt) return "Date unavailable";
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate().toLocaleTimeString();
    } else if (createdAt instanceof Date) {
      return createdAt.toLocaleTimeString();
    } else if ('seconds' in createdAt) {
      return new Date(createdAt.seconds * 1000).toLocaleTimeString();
    } else {
      return "Date unavailable";
    }
  };

  return (
    <ScrollView className="flex-1 p-4">
      {posts.map((post, index) => (
      <View key={`${post.id}-${index}`} className="rounded-lg mb-4 shadow-md">
          <View className="flex-row items-center p-4">
            <Image
              source={{ uri: userData[post.userId]?.profilePicture || 'https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg' }}
              className="w-10 h-10 rounded-full"
            />
            <Text className="text-white ml-3 text-lg font-semibold">
              {userData[post.userId]?.name || "Unknown User"}
            </Text>
            <Text className="text-white ml-auto">
              {formatDate(post.createdAt)}
            </Text>
          </View>
          <Image
            source={{ uri: post.imageUrl }}
            className="w-full h-96 rounded-lg mb-5"
          />
        </View>
      ))}
    </ScrollView>
  );
}