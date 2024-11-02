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
  username: string;
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
            username: data.username,
            profilePicture: data.profilePicture
          };
        }
      });
      setUserData(userDataMap);
    };

    fetchUserData();
  }, []);

  const formatDate = (createdAt: Post["createdAt"]) => {
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate().toLocaleTimeString();
    } else if (createdAt instanceof Date) {
      return createdAt.toLocaleTimeString();
    } else if (createdAt && "seconds" in createdAt) {
      return new Date(createdAt.seconds * 1000).toLocaleTimeString();
    } else {
      return "Date unavailable";
    }
  };

  return (
    <View className="flex-1 p-4">
      {posts.length > 0 ? (
        <ScrollView className="flex-1">
          {posts.map((post) => (
            <View key={post.id} className="rounded-lg mb-4 shadow-md">
              <View className="flex-row items-center p-4">
                <Image
                  source={{ uri: userData[post.userId]?.profilePicture || 'https://via.placeholder.com/40' }}
                  className="w-10 h-10 rounded-full"
                />
                <Text className="text-white ml-3 text-lg font-semibold">
                  {userData[post.userId]?.username || "Unknown User"}
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
      ) : (
        <View className="flex-1 justify-center items-center">
          <Text className="text-white text-lg">No BeReals for now</Text>
        </View>
      )}
    </View>
  );
}