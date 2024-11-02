import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface GameTileProps {
  letter: string;
  state: 'correct' | 'present' | 'absent' | 'empty' | 'unused';
}

const GameTile: React.FC<GameTileProps> = ({ letter, state }) => {
  const backgroundColor = {
    correct: '#6aaa64',
    present: '#c9b458',
    absent: '#787c7e',
    empty: '#ffffff',
    unused: '#d3d6da',
  }[state];

  return (
    <View style={[styles.tile, { backgroundColor }]}>
      <Text style={styles.letter}>{letter}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#d3d6da',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  letter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
});

export default GameTile;