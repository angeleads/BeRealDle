// CommentSection.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  Timestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../library/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

interface Post {
  id: string;
  imageUrl: string;
}

interface Comment {
  id: string;
  userId: string;
  text: string;
  createdAt: Timestamp;
}

interface UserData {
  profilePicture: string;
  name: string;
}

interface CommentSectionProps {
  post: Post;
  onClose: () => void;
  userData: { [key: string]: UserData };
}

export default function CommentSection({
  post,
  onClose,
  userData,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const q = query(
      collection(db, "comments"),
      where("postId", "==", post.id),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as Comment[];
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [post.id]);

  const addComment = async () => {
    if (newComment.trim() && auth.currentUser) {
      await addDoc(collection(db, "comments"), {
        postId: post.id,
        userId: auth.currentUser.uid,
        text: newComment.trim(),
        createdAt: Timestamp.now(),
      });
      setNewComment("");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <View className="flex-1 bg-black">
        <TouchableOpacity
          onPress={onClose}
          className="absolute top-12 left-4 z-10"
        >
          <Ionicons name="close" size={30} color="white" />
        </TouchableOpacity>
        <Image
          source={{ uri: post.imageUrl }}
          className="w-full h-2/4 rounded-xl"
        />
        <ScrollView className="flex-1 p-6">
          {comments.map((comment) => (
            <View key={comment.id} className="flex-row mb-4">
              <Image
                source={{
                  uri:
                    userData[comment.userId]?.profilePicture ||
                    "https://i.pinimg.com/736x/83/bc/8b/83bc8b88cf6bc4b4e04d153a418cde62.jpg",
                }}
                className="w-16 h-16 rounded-full mr-2"
              />
              <View className="flex-1 rounded-lg p-4">
                <Text className="text-white font-bold text-lg">
                  {userData[comment.userId]?.name || "Unknown User"}
                </Text>
                <Text className="text-white text-lg">{comment.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
        <View className="flex-row items-center p-10 bg-black">
          <TextInput
            className="flex-1 bg-slate-300 text-black rounded-full px-4 py-6 mr-2"
            placeholder="Add a comment..."
            placeholderTextColor="gray"
            value={newComment}
            onChangeText={setNewComment}
          />
          <TouchableOpacity onPress={addComment} className="pl-6">
            <Ionicons name="send" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
