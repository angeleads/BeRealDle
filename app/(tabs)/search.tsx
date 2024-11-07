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
import { Link, useRouter } from "expo-router";
import { RefreshControl } from "react-native";

interface User {
  id: string;
  username: string;
  profilePicture: string;
}

export default function Search() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [friends, setFriends] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFriends();
    setRefreshing(false);
  };

  const fetchFriendData = async (friendId: string) => {
    const friendDoc = await getDoc(doc(db, "users", friendId));
    if (friendDoc.exists()) {
      const friendData = friendDoc.data();
      return {
        id: friendId,
        username: friendData.username,
        profilePicture: friendData.profilePicture,
      };
    }
    return null;
  };

  const fetchFriends = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      const userData = userDoc.data();
      if (userData && userData.following) {
        setFriends(userData.following);
        const friendData = await Promise.all(
          userData.following.map(fetchFriendData)
        );
        setUsers(friendData.filter((user): user is User => user !== null));
      }
    }
  };

  const searchUsers = async (querySample: string) => {
    if (querySample.length > 0) {
      const q = query(
        collection(db, "users"),
        where("username", ">=", querySample),
        where("username", "<=", querySample + "\uf8ff")
      );
      const querySnapshot = await getDocs(q);
      const userResults: User[] = [];
      querySnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        if (doc.id !== auth.currentUser?.uid) {
          userResults.push({
            id: doc.id,
            username: userData.username,
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
      const friendRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        following: arrayUnion(userId),
      });

      await updateDoc(friendRef, {
        followers: arrayUnion(auth.currentUser.uid),
      });

      fetchFriends();
    }
  };

  const removeFriend = async (userId: string) => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const friendRef = doc(db, "users", userId);

      await updateDoc(userRef, {
        following: arrayRemove(userId),
      });

      await updateDoc(friendRef, {
        followers: arrayRemove(auth.currentUser.uid),
      });
      fetchFriends();
    }
  };

  const navigateToProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View className="flex-row items-center justify-between py-4 border-b border-gray-200">
      <Link href={`profile/${item.id}` as unknown as string} asChild>
        <TouchableOpacity
          className="flex-row items-center flex-1"
          onPress={() => navigateToProfile(item.id)}
        >
          <Image
            source={{ uri: item.profilePicture }}
            className="w-12 h-12 rounded-full mr-4"
          />
          <Text className="text-lg font-semibold">{item.username}</Text>
        </TouchableOpacity>
      </Link>
      {friends.includes(item.id) ? (
        <TouchableOpacity
          onPress={() => removeFriend(item.id)}
          className="flex-row items-center bg-gray-600 px-3 py-2 rounded-full"
        >
          <Ionicons name="close-circle-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-1">Unfollow</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => addFriend(item.id)}
          className="flex-row items-center bg-gray-950 px-3 py-2 rounded-full"
        >
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-bold ml-1">Follow</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-white p-4">
      <View className="mb-4 flex-row items-center bg-gray-300 rounded-full px-4 py-6 mt-5">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput
          className="flex-1 ml-2 text-gray-800"
          placeholder="Add or search a friend"
          placeholderTextColor="gray"
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            searchUsers(text);
          }}
        />
      </View>
      <FlatList
        data={
          searchQuery.length > 0
            ? users
            : users.filter((user) => friends.includes(user.id))
        }
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}