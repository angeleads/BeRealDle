import React from 'react';
import { View } from 'react-native';
import GameTile from './GameTile';

interface GameRowProps {
  word: string;
  wordLength: number;
}

const GameRow: React.FC<GameRowProps> = ({ word, wordLength }) => {
  return (
    <View className="flex-row space-x-2">
      {Array.from({ length: wordLength }).map((_, index) => (
        <GameTile key={index} letter={word[index] || ''} state={'correct'} />
      ))}
    </View>
  );
};

export default GameRow;