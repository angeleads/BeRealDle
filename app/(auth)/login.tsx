import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../../library/firebaseConfig";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("User logged in successfully:", userCredential.user.uid);
      router.push("/(tabs)/wordle");
    } catch (error: any) {
      setErrorMessage("The email and/or the password are incorrect!");
      console.error("Error logging in:", error.message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <View className="bg-gray-800 rounded-3xl p-8 shadow-lg">
          <Text className="text-4xl font-bold text-indigo-400 text-center">
            Welcome back
          </Text>
          <Text className="text-4xl font-bold text-indigo-400 mb-6 text-center">
            to BeRealDle
          </Text>

          {errorMessage ? (
            <Text className="text-red-500 text-sm mb-4 text-center">
              {errorMessage}
            </Text>
          ) : null}

          <View className="space-y-2">
            <View className="border border-gray-600 rounded-xl mb-3">
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                className="px-4 py-4 text-white"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="border border-gray-600 rounded-xl flex-row items-center">
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={passwordHidden}
                className="flex-1 px-4 py-4 text-white"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setPasswordHidden(!passwordHidden)}
                className="pr-4"
              >
                <Ionicons
                  name={passwordHidden ? "eye-outline" : "eye-off-outline"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            className="bg-indigo-600 mt-6 py-3 rounded-2xl"
          >
            <Text className="text-white font-bold text-center text-lg">
              Login
            </Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-400 text-lg">You don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/signup")}>
              <Text className="text-indigo-400 font-bold text-lg">Sign up</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
