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
import React, { useEffect, useState, useCallback } from "react";
import { TouchableOpacity, View, Text, Alert } from "react-native";
import { BlurView } from "expo-blur";
import Camera from "../../components/BeReal/Camera";
import Posts from "../../components/BeReal/Posts";
import { db, auth } from "../../library/firebaseConfig";
import { useRouter, useFocusEffect } from "expo-router";

interface Post {
  id: string;
  imageUrl: string;
  createdAt: Timestamp | Date | { seconds: number; nanoseconds: number } | undefined;
  userId: string;
  comments?: Comment[];
}

export default function BeReal() {
  const [showCamera, setShowCamera] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [canAccessBeReal, setCanAccessBeReal] = useState(false);
  const router = useRouter();

  const checkBeRealAccess = useCallback(async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();
      if (userData && userData.wordleCompleted) {
        setCanAccessBeReal(true);
      } else {
        setCanAccessBeReal(false);
      }
    }
  }, []);

  const fetchPosts = useCallback(async () => {
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
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkBeRealAccess();
      fetchPosts();
    }, [checkBeRealAccess, fetchPosts])
  );

  const handleNewPost = (newPost: Post) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]);
    setShowCamera(false);
  };

  const handleCameraPress = () => {
    if (canAccessBeReal) {
      setShowCamera(true);
    } else {
      Alert.alert(
        "BeReal Locked",
        "You need to complete today's Wordle to access BeReal!",
        [{ text: "OK", onPress: () => router.push("/wordle") }]
      );
    }
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
          {canAccessBeReal ? (
            <Posts posts={posts} />
          ) : (
            <BlurView intensity={100} style={{ flex: 1 }}>
              <View className="flex-1 justify-center items-center">
                <Text className="text-white text-2xl text-center">
                  Complete today's Wordle to unlock BeReal!
                </Text>
              </View>
            </BlurView>
          )}
          <View className="absolute bottom-10 w-full flex flex-row justify-center items-center">
            <TouchableOpacity
              className="flex flex-row justify-center items-center rounded-full bg-white w-16 h-16"
              onPress={handleCameraPress}
            >
              <Ionicons name="camera" size={30} color="black" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}