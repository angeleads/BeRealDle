import React from "react";
import {
  View,
  TouchableOpacity,
  Text,
  Dimensions,
  StyleSheet,
} from "react-native";

const KEYS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

interface KeyboardProps {
  onKeyPress: (key: string) => void;
  usedLetters: Record<string, "correct" | "present" | "absent">;
}

const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, usedLetters }) => {
  const screenWidth = Dimensions.get("window").width;
  const keyWidth = (screenWidth - 20) / 10;
  const keyHeight = keyWidth * 1.5;

  const getKeyColor = (key: string) => {
    switch (usedLetters[key]) {
      case "correct":
        return "#6aaa64";
      case "present":
        return "#c9b458";
      case "absent":
        return "#787c7e";
      default:
        return "#edeef0";
    }
  };

  return (
    <View style={styles.keyboard}>
      {KEYS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((key) => (
            <View key={key} style={styles.keyWrapper}>
              <TouchableOpacity
                style={[
                  styles.key,
                  {
                    width:
                      key === "ENTER" || key === "⌫"
                        ? keyWidth * 1.5
                        : keyWidth,
                    height: keyHeight,
                    backgroundColor: getKeyColor(key),
                  },
                ]}
                onPress={() => onKeyPress(key)}
              >
                <Text style={styles.keyText}>{key === "⌫" ? "←" : key}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  keyboard: {
    width: "100%",
    padding: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  keyWrapper: {
    margin: 1,
  },
  key: {
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "gray",
  },
  keyText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
});

export default Keyboard;
