import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Camera from "../../components/BeReal/Camera";
import Posts from "../../components/BeReal/Posts";
import { db } from "../../library/firebaseConfig";

export default function BeReal() {
  const [showCamera, setShowCamera] = useState(false);
  const [posts, setPosts] = useState<{ id: string; [key: string]: any }[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "posts"),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(newPosts);
    });
    return unsubscribe;
  }, []);

  const handleNewPost = (newPost: { [key: string]: any; id: string }) => {
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
          <Posts posts={posts} />
          <TouchableOpacity
            className="flex justify-center items-center rounded-full bg-gray-950 bottom-10 w-16 h-16"
            onPress={() => setShowCamera(true)}
          >
            <Ionicons name="camera" size={30} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
