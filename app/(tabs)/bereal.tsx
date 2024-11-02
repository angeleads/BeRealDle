// BeReal.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Camera from '../../components/BeReal/Camera';
import Posts from '../../components/BeReal/Posts';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../library/firebaseConfig';

export default function BeReal() {
  const [showCamera, setShowCamera] = useState(false);
  const [posts, setPosts] = useState<{ id: string; [key: string]: any }[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'), limit(10));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const newPosts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPosts(newPosts);
    });
    return unsubscribe;
  }, []);

  const handleNewPost = (newPost: { [key: string]: any; id: string; }) => {
    setPosts(prevPosts => [newPost, ...prevPosts]);
    setShowCamera(false);
  };

  return (
    <View className="flex-1 bg-black">
      {showCamera ? (
        <Camera onCapture={handleNewPost} onClose={() => setShowCamera(false)} />
      ) : (
        <>
          <Posts posts={posts} />
          <TouchableOpacity className="flex justify-center items-center rounded-full bg-violet-400 bottom-10 w-16 h-16" onPress={() => setShowCamera(true)}>
            <Ionicons name="camera" size={30} color="white" />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    backgroundColor: '#dfd3e8',
    borderRadius: 20,
    padding: 15,
  },
});