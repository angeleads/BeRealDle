import React from 'react';
import { View } from 'react-native';
import GameTile from './GameTile';

interface GameBoardProps {
  guesses: string[];
  currentGuess: string;
  targetWord: string;
  wordLength: number;
  maxAttempts: number;
}

const GameBoard: React.FC<GameBoardProps> = ({ guesses, currentGuess, targetWord, wordLength, maxAttempts }) => {
  const getLetterState = (letter: string, index: number, word: string): 'correct' | 'present' | 'absent' | 'empty' => {
    if (!letter) return 'empty';
    if (word[index] === letter) return 'correct';
    if (word.includes(letter)) return 'present';
    return 'absent';
  };

  return (
    <View className="mb-4">
      {Array.from({ length: maxAttempts }).map((_, rowIndex) => (
        <View key={rowIndex} className="flex-row justify-center my-1">
          {Array.from({ length: wordLength }).map((_, colIndex) => {
            const letter = guesses[rowIndex]?.[colIndex] || (rowIndex === guesses.length ? currentGuess[colIndex] : '');
            const state = guesses[rowIndex] 
              ? getLetterState(letter, colIndex, targetWord) 
              : 'empty';
            return (
              <View key={colIndex} className="mx-1">
                <GameTile letter={letter} state={state} />
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

export default GameBoard;