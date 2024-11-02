import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { Timestamp, collection, getDocs } from 'firebase/firestore';
import { db } from '../../library/firebaseConfig';

interface Post {
  id: string;
  imageUrl: string;
  createdAt: Timestamp | Date | { seconds: number; nanoseconds: number } | undefined;
  userId: string;
}

interface PostsProps {
  posts: Post[];
}

export default function Posts({ posts }: PostsProps) {
  const [usernames, setUsernames] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchUsernames = async () => {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const userMap: { [key: string]: string } = {};
      usersSnapshot.forEach(doc => {
        const data = doc.data();
        if (data && data.name) {
          userMap[doc.id] = data.name;
        }
      });
      setUsernames(userMap);
    };

    fetchUsernames();
  }, []);

  const formatDate = (createdAt: Post['createdAt']) => {
    if (createdAt instanceof Timestamp) {
      return createdAt.toDate().toLocaleTimeString();
    } else if (createdAt instanceof Date) {
      return createdAt.toLocaleTimeString();
    } else if (createdAt && 'seconds' in createdAt) {
      return new Date(createdAt.seconds * 1000).toLocaleTimeString();
    } else {
      return 'Date unavailable';
    }
  };

  return (
    <View className="flex-1 bg-gray-900 p-4">
      <Text className="flex justify-center items-center text-2xl font-bold text-white mb-4 pt-20">BeRealDle</Text>
      {posts.length > 0 ? (
        <ScrollView className="flex-1">
          {posts.map((post) => (
            <View key={post.id} className="rounded-lg mb-4 shadow-md">
              <View className="flex-row items-center p-4">
                <Image source={{ uri: post.imageUrl }} className="w-10 h-10 rounded-full" />
                <Text className="text-white ml-3 font-semibold">{usernames[post.userId] || 'Unknown User'}</Text>
              </View>
              <Image source={{ uri: post.imageUrl }} className="w-full h-64 object-cover" />
              <View className="p-4">
                <Text className="text-white text-sm">{formatDate(post.createdAt)}</Text>
              </View>
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