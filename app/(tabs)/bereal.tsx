import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  where,
  doc,
  getDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import Camera from "../../components/BeReal/Camera";
import Posts from "../../components/BeReal/Posts";
import { db, auth } from "../../library/firebaseConfig";

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
    const fetchPosts = async () => {
      if (!auth.currentUser) return;

      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();
      const following = userData?.following || [];
      const relevantUsers = [auth.currentUser.uid, ...following];

      const q = query(
        collection(db, "posts"),
        where("userId", "in", relevantUsers),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const newPosts = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt
              ? new Timestamp(data.createdAt.seconds, data.createdAt.nanoseconds)
              : undefined,
          };
        }) as Post[];
        setPosts(newPosts);
      });

      return unsubscribe;
    };

    fetchPosts();
  }, []);

  const handleNewPost = (newPost: Post) => {
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