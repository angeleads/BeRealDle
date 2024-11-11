import React, { useState, useEffect } from "react";
import { View, Alert, Text, SafeAreaView } from "react-native";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { db, auth } from "../../library/firebaseConfig";
import GameBoard from "../../components/Wordle/GameBoard";
import Keyboard from "../../components/Wordle/Keyboard";
import { fetchRandomWord } from "../../utils/wordUtils";
import { useRouter } from "expo-router";

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const COOLDOWN_TIME = 5 * 60 * 1000; // 5 minutes for testing

export default function WordleGame() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [usedLetters, setUsedLetters] = useState<Record<string, "correct" | "present" | "absent">>({});
  const [gameOver, setGameOver] = useState(false);
  const [winCount, setWinCount] = useState(0);
  const [nextGameTime, setNextGameTime] = useState<Date | null>(null);
  const [canPlay, setCanPlay] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkGameAvailability();
  }, []);

  const checkGameAvailability = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      if (userData) {
        setWinCount(userData.wordleWins || 0);
        const lastPlayTime = userData.lastWordlePlay?.toDate();
        if (lastPlayTime) {
          const nextTime = new Date(lastPlayTime.getTime() + COOLDOWN_TIME);
          setNextGameTime(nextTime);
          if (nextTime > new Date()) {
            setCanPlay(false);
          } else {
            setCanPlay(true);
            fetchWord();
          }
        } else {
          setCanPlay(true);
          fetchWord();
        }
      }
    }
  };

  const fetchWord = async () => {
    const word = await fetchRandomWord();
    setTargetWord(word.toUpperCase());
    console.log(word);
  };

  const updateLastPlayTime = async (completed: boolean) => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        lastWordlePlay: new Date(),
        wordleCompleted: completed
      });
    }
  };

  const handleKeyPress = (key: string) => {
    if (gameOver || !canPlay) return;

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

  const checkGuess = async () => {
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
      await updateWinCount();
      await updateLastPlayTime(true);
      setGameOver(true);
      Alert.alert(
        "Congratulations!",
        `You guessed the word! Total wins: ${winCount + 1}. You can now post your BeReal!`,
        [{ text: "OK", onPress: () => router.push("/bereal") }]
      );
    } else if (newGuesses.length === MAX_ATTEMPTS) {
      await updateLastPlayTime(false);
      setGameOver(true);
      Alert.alert("Game Over", `The word was ${targetWord}. Better luck tomorrow!`);
    }
  };

  const updateWinCount = async () => {
    if (auth.currentUser) {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        wordleWins: increment(1)
      });
      setWinCount(prevCount => prevCount + 1);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-between p-4">
        <View className="flex justify-center items-center">
          <Text className="text-xl font-bold">You won {winCount} wordle(s) already!</Text>
          {!canPlay && nextGameTime && (
            <Text className="text-xl font-bold text-red-500">
              Next game available at: {nextGameTime.toLocaleTimeString()}
            </Text>
          )}
        </View>
        {canPlay ? (
          <>
            <GameBoard
              guesses={guesses}
              currentGuess={currentGuess}
              targetWord={targetWord}
              wordLength={WORD_LENGTH}
              maxAttempts={MAX_ATTEMPTS}
            />
            <Keyboard onKeyPress={handleKeyPress} usedLetters={usedLetters} />
          </>
        ) : (
          <Text className="text-center font-bold text-xl">Come back later to play again!</Text>
        )}
      </View>
    </SafeAreaView>
  );
}