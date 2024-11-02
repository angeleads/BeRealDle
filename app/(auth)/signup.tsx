import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc } from 'firebase/firestore';
import { auth, db } from "../../library/firebaseConfig";
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SignUp() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordHidden, setPasswordHidden] = useState(true);
  const [confirmPasswordHidden, setConfirmPasswordHidden] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const togglePasswordVisibility = () => {
    setPasswordHidden(!passwordHidden);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordHidden(!confirmPasswordHidden);
  };

  const handleSignUp = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, 'users', user.uid), {
        userId: user.uid,
        username: username,
        email: email,
      });
      console.log("User signed up successfully:", user.uid);
      router.push('/(tabs)/wordle');
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      setErrorMessage("Error signing up. Please try again.");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-violet-400">
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center px-6"
      >
        <View className="bg-gray-800 rounded-3xl p-8 shadow-lg">
          <Text className="text-4xl font-bold text-indigo-400 mb-6 text-center">Sign Up</Text>
          
          {errorMessage ? (
            <Text className="text-red-500 text-sm mb-4 text-center">{errorMessage}</Text>
          ) : null}

          <View className="space-y-4">
            <View className="border border-gray-600 rounded-xl mb-3 ">
              <TextInput
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
                className="px-4 py-3 text-white "
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                autoCapitalize="none"
              />
            </View>

            <View className="border border-gray-600 rounded-xl mb-3">
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                className="px-4 py-3 text-white "
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View className="border border-gray-600 rounded-xl mb-3 flex-row items-center">
              <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={passwordHidden}
                className="flex-1 px-4 py-3 text-white "
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={togglePasswordVisibility} className="pr-4">
                <Ionicons
                  name={passwordHidden ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>

            <View className="border border-gray-600 rounded-xl flex-row items-center">
              <TextInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={confirmPasswordHidden}
                className="flex-1 px-4 py-3 text-white"
                placeholderTextColor="rgba(255, 255, 255, 0.7)"
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={toggleConfirmPasswordVisibility} className="pr-4">
                <Ionicons
                  name={confirmPasswordHidden ? 'eye-outline' : 'eye-off-outline'}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            className="bg-indigo-600 mt-6 py-3 rounded-2xl"
          >
            <Text className="text-white font-bold text-center text-lg">Sign Up</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center mt-6">
            <Text className="text-gray-400">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text className="text-indigo-400 font-bold">Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}