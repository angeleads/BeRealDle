import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Camera from "../../components/BeReal/Camera";
import Posts from "../../components/BeReal/Posts";
import { db } from "../../library/firebaseConfig";

interface Post {
  id: string;
  imageUrl: string;
  createdAt: Timestamp | Date | { seconds: number; nanoseconds: number } | undefined;
  userId: string;
}

export default function BeReal() {
  const [showCamera, setShowCamera] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newPosts = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Fetched post data:", data);  // Add this line
        return {
          id: doc.id,
          userId: data.userId,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt ? new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds) : undefined,
        };
      }) as Post[];
      console.log("All fetched posts:", newPosts);  // Add this line
      setPosts(newPosts);
    });
    return unsubscribe;
  }, []);

  const handleNewPost = (newPost: Post) => {
    setPosts((prevPosts) => {
      // Check if a post with the same ID already exists
      const existingPostIndex = prevPosts.findIndex(post => post.id === newPost.id);
      if (existingPostIndex !== -1) {
        // If it exists, update the existing post
        const updatedPosts = [...prevPosts];
        updatedPosts[existingPostIndex] = newPost;
        return updatedPosts;
      } else {
        // If it doesn't exist, add the new post
        return [newPost, ...prevPosts];
      }
    });
    console.log("New post received:", newPost);  // Add this line
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setShowCamera(false);
  };

  return (
    <View className="flex-1 bg-black">
      {showCamera ? (
        <Camera
          onCapture={handleNewPost}
          onClose={() => setShowCamera(false)}
        />
      ) : (
        <>
        <Posts posts={posts.map(post => ({ ...post, key: post.id }))} />
          <View className="absolute bottom-10 w-full flex flex-row justify-center items-center">
            <TouchableOpacity
              className="flex flex-row justify-center items-center rounded-full bg-white w-16 h-16"
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}