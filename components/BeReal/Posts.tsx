import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import {
  Timestamp,
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../library/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";
import CommentSection from "./Comments";

interface Post {
  id: string;
  imageUrl: string;
  createdAt:
    | Timestamp
    | Date
    | { seconds: number; nanoseconds: number }
    | undefined;
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
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const userIds = [...new Set(posts.map((post) => post.userId))];
      const userDataMap: { [key: string]: UserData } = {};

      for (const userId of userIds) {
        const userDoc = await getDoc(doc(db, "users", userId));
        const data = userDoc.data();
        if (data && data.username && data.profilePicture) {
          userDataMap[userId] = {
            name: data.username,
            profilePicture: data.profilePicture,
          };
        }
      }

      setUserData(userDataMap);
    };

    fetchUserData();
  }, [posts]);

  const formatDate = (createdAt: Post["createdAt"]) => {
    if (!createdAt) return "Date unavailable";
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate().toLocaleTimeString();
    } else if (createdAt instanceof Date) {
      return createdAt.toLocaleTimeString();
    } else if ("seconds" in createdAt) {
      return new Date(createdAt.seconds * 1000).toLocaleTimeString();
    } else {
      return "Date unavailable";
    }
  };

  const openComments = (post: Post) => {
    setSelectedPost(post);
  };

  const closeComments = () => {
    setSelectedPost(null);
  };

  return (
    <ScrollView className="flex-1 p-4">
      {posts.map((post, index) => (
        <View key={`${post.id}-${index}`} className="rounded-xl mb-4 shadow-md">
          <View className="flex-row items-center p-4">
            <Image
              source={{
                uri:
                  userData[post.userId]?.profilePicture ||
                  "https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg",
              }}
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
          <TouchableOpacity
            onPress={() => openComments(post)}
            className="absolute bottom-6 right-2 bg-black rounded-full p-2"
          >
            <Ionicons name="chatbubble" size={24} color="white" />
          </TouchableOpacity>
        </View>
      ))}
      <Modal
        visible={selectedPost !== null}
        animationType="slide"
        onRequestClose={closeComments}
      >
        {selectedPost && (
          <CommentSection
            post={selectedPost}
            onClose={closeComments}
            userData={userData}
          />
        )}
      </Modal>
    </ScrollView>
  );
}
