import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, radius } from "../theme/colors";

export default function PinPad({ value, onChange, length = 4, onComplete }) {
  const digits = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"];

  const press = (key) => {
    if (key === "") return;
    if (key === "del") {
      onChange(value.slice(0, -1));
      return;
    }
    if (value.length >= length) return;
    const next = value + key;
    onChange(next);
    if (next.length === length && onComplete) onComplete(next);
  };

  return (
    <View>
      <View style={styles.dots}>
        {Array.from({ length }).map((_, i) => (
          <View key={i} style={[styles.dot, i < value.length && styles.dotOn]} />
        ))}
      </View>
      <View style={styles.grid}>
        {digits.map((key, i) => (
          <Pressable
            key={`${key}-${i}`}
            onPress={() => press(key)}
            style={({ pressed }) => [styles.key, key === "" && styles.keyEmpty, pressed && key !== "" && styles.keyPressed]}
          >
            {key === "del" ? (
              <Ionicons name="backspace-outline" size={22} color={colors.white} />
            ) : (
              <Text style={styles.keyText}>{key}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dots: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 22 },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: colors.muted
  },
  dotOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: 276,
    alignSelf: "center"
  },
  key: {
    width: 76,
    height: 76,
    margin: 8,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  keyEmpty: { backgroundColor: "transparent", borderColor: "transparent" },
  keyPressed: { backgroundColor: colors.primaryDim },
  keyText: { color: colors.white, fontSize: 22, fontWeight: "700" }
});
