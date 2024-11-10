import React, { useState, useEffect } from "react";
import { View, Alert, Text, SafeAreaView } from "react-native";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../../library/firebaseConfig";
import GameBoard from "../../components/Wordle/GameBoard";
import Keyboard from "../../components/Wordle/Keyboard";
import { fetchRandomWord } from "../../utils/wordUtils";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

export default function WordleGame() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [usedLetters, setUsedLetters] = useState<
    Record<string, "correct" | "present" | "absent">
  >({});
  const [gameOver, setGameOver] = useState(false);
  const [winCount, setWinCount] = useState(0);

  useEffect(() => {
    fetchWord();
  }, []);

  const fetchWinCount = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
      if (userDoc.exists()) {
        setWinCount(userDoc.data().wordleWins || 0);
      }
    }
  };

  useEffect(() => {
    fetchWord();
    fetchWinCount();
  }, []);

  const updateWinCount = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        wordleWins: increment(1)
      });
      setWinCount(prevCount => prevCount + 1);
    }
  };

  const fetchWord = async () => {
    const word = await fetchRandomWord();
    setTargetWord(word.toUpperCase());
    console.log(word);
  };

  const handleKeyPress = (key: string) => {
    if (gameOver) return;

    if (key === "⌫") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (key === "ENTER") {
      if (currentGuess.length === WORD_LENGTH) {
        checkGuess();
      }
    } else if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => prev + key);
    }
  };

  const checkGuess = () => {
    const newGuesses = [...guesses, currentGuess];
    setGuesses(newGuesses);

    const newUsedLetters = { ...usedLetters };
    const targetLetters = targetWord.split("");

    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = currentGuess[i].toUpperCase();
      if (targetWord[i] === letter) {
        newUsedLetters[letter] = "correct";
        targetLetters[i] = "";
      }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      const letter = currentGuess[i].toUpperCase();
      if (targetWord[i] !== letter) {
        const index = targetLetters.indexOf(letter);
        if (index !== -1) {
          newUsedLetters[letter] =
            newUsedLetters[letter] === "correct" ? "correct" : "present";
          targetLetters[index] = "";
        } else {
          newUsedLetters[letter] = newUsedLetters[letter] || "absent";
        }
      }
    }

    setUsedLetters(newUsedLetters);
    setCurrentGuess("");

    if (currentGuess.toUpperCase() === targetWord) {
      updateWinCount();
      Alert.alert("Congratulations!", `You guessed the word! Total wins: ${winCount + 1} You can now post your BeReal!`);
      setGameOver(true);
    } else if (newGuesses.length === MAX_ATTEMPTS) {
      Alert.alert("Game Over", `The word was ${targetWord}`);
      setGameOver(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-between p-4">
        <View className="flex justify-center items-center">
          <Text className="text-xl font-bold">Wins: {winCount}</Text>
        </View>
        <GameBoard
          guesses={guesses}
          currentGuess={currentGuess}
          targetWord={targetWord}
          wordLength={WORD_LENGTH}
          maxAttempts={MAX_ATTEMPTS}
        />
        <Keyboard onKeyPress={handleKeyPress} usedLetters={usedLetters} />
      </View>
    </SafeAreaView>
  );
}
