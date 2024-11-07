import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  collection,
  where,
  getDoc,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  query,
} from "firebase/firestore";
import { db, auth } from "../../library/firebaseConfig";
import { Ionicons } from "@expo/vector-icons";

interface User {
  id: string;
  name: string;
  profilePicture: string;
}

export default function FriendSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<string[]>([]);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();
      if (userData && userData.friends) {
        setFriends(userData.friends);
      }
    }
  };

  const searchUsers = async (querySample: string) => {
    if (querySample.length > 0) {
      const q = query(
        collection(db, "users"),
        where("name", ">=", querySample),
        where("name", "<=", querySample + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const userResults: User[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        if (doc.id !== auth.currentUser?.uid) {
          userResults.push({
            id: doc.id,
            name: userData.name,
            profilePicture: userData.profilePicture,
          });
        }
      });
      setUsers(userResults);
    } else {
      setUsers([]);
    }
  };

  const addFriend = async (userId: string) => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        friends: arrayUnion(userId),
      });
      setFriends([...friends, userId]);
    }
  };

  const removeFriend = async (userId: string) => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        friends: arrayRemove(userId),
      });
      setFriends(friends.filter((id) => id !== userId));
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View className="flex-row items-center py-4 border-b border-gray-200">
      <Image
        source={{ uri: item.profilePicture }}
        className="w-12 h-12 rounded-full mr-4"
      />
      <Text className="flex-1 text-lg">{item.name}</Text>
      {friends.includes(item.id) ? (
        <TouchableOpacity
          onPress={() => removeFriend(item.id)}
          className="flex-row items-center bg-red-500 px-3 py-2 rounded-full"
        >
          <Ionicons name="close-circle-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-1">Remove</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => addFriend(item.id)}
          className="flex-row items-center bg-green-500 px-3 py-2 rounded-full"
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-1">Add</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-4">
        <TextInput
          className="bg-gray-100 px-4 py-2 rounded-full"
          placeholder="Add or search a friend"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchUsers(text);
          }}
        />
      </View>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        className="flex-1"
      />
    </View>
  );
}