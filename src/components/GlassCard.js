import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, radius } from "../theme/colors";

export default function GlassCard({ children, style, accent = false }) {
  return (
    <View style={[styles.shadow, style]}>
      <LinearGradient
        colors={
          accent
            ? ["rgba(229,9,20,0.22)", "rgba(24,24,27,0.92)"]
            : ["rgba(255,255,255,0.08)", "rgba(24,24,27,0.78)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {children}
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  card: {
    padding: 16
  }
});
