import React from "react";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../theme/colors";

export default function LogoMark({ size = 88, withWordmark = false }) {
  const s = size;
  return (
    <View style={styles.wrap}>
      <Svg width={s} height={s} viewBox="0 0 128 128">
        <Circle cx="64" cy="64" r="60" fill="#18181B" />
        <Circle cx="64" cy="64" r="60" stroke="#E50914" strokeWidth="4" fill="none" />
        <Rect x="38" y="34" width="52" height="62" rx="10" fill="#FFFFFF" />
        <Rect x="38" y="34" width="52" height="16" rx="10" fill="#E50914" />
        <Rect x="38" y="42" width="52" height="8" fill="#E50914" />
        <Rect x="54" y="28" width="20" height="10" rx="5" fill="#A1A1AA" />
        <Circle cx="50" cy="64" r="3" fill="#A1A1AA" />
        <Circle cx="64" cy="64" r="3" fill="#A1A1AA" />
        <Circle cx="78" cy="64" r="3" fill="#A1A1AA" />
        <Circle cx="50" cy="78" r="3" fill="#A1A1AA" />
        <Circle cx="64" cy="78" r="3" fill="#A1A1AA" />
        <Circle cx="78" cy="78" r="3" fill="#E50914" />
        <Circle cx="92" cy="92" r="16" fill="#E50914" stroke="#FFFFFF" strokeWidth="3" />
        <Path
          d="M84 92 L90 98 L102 84"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
      {withWordmark ? (
        <View style={styles.word}>
          <Text style={styles.title}>MANUAL DAS CONTAS</Text>
          <View style={styles.line} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  word: { marginTop: 14, alignItems: "center" },
  title: {
    color: colors.white,
    fontSize: 16,
    letterSpacing: 2.4,
    fontWeight: "800"
  },
  line: {
    marginTop: 8,
    width: 72,
    height: 3,
    borderRadius: 99,
    backgroundColor: colors.primary
  }
});
