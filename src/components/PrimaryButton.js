import React from "react";
import { Pressable, Text, StyleSheet, ActivityIndicator } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../theme/colors";

export default function PrimaryButton({ title, onPress, loading, disabled, style }) {
  return (
    <Pressable onPress={onPress} disabled={disabled || loading} style={[styles.press, style]}>
      <LinearGradient colors={["#FF2E4D", "#E50914"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.text}>{title}</Text>}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  press: { borderRadius: radius.md, overflow: "hidden" },
  btn: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  text: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 15,
    letterSpacing: 0.4
  }
});
