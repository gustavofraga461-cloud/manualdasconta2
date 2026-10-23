import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import LogoMark from "../components/LogoMark";
import PinPad from "../components/PinPad";
import PatternLock from "../components/PatternLock";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { authenticateBiometrics, getPattern, getPin, hasHardware, isBiometricEnrolled, samePattern } from "../utils/auth";

export default function LockScreen() {
  const { settings, setUnlocked } = useApp();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [bio, setBio] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = settings.biometricsEnabled && (await hasHardware()) && (await isBiometricEnrolled());
      setBio(ok);
      if (ok) {
        const success = await authenticateBiometrics();
        if (success) setUnlocked(true);
      }
    })();
  }, [settings.biometricsEnabled, setUnlocked]);

  const checkPin = async (next) => {
    const stored = await getPin();
    if (next === stored) {
      setError("");
      setUnlocked(true);
    } else {
      setError("PIN incorreto");
      setPin("");
    }
  };

  const checkPattern = async (dots) => {
    const stored = await getPattern();
    if (samePattern(dots, stored)) {
      setError("");
      setUnlocked(true);
    } else {
      setError("Padrao incorreto");
    }
  };

  return (
    <View style={styles.page}>
      <StatusBar style="light" />
      <LogoMark size={96} withWordmark />
      <Text style={styles.hint}>
        {settings.lockMethod === "pattern" ? "Desenhe seu padrao" : "Digite seu PIN"}
      </Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {settings.lockMethod === "pattern" ? (
        <PatternLock onComplete={checkPattern} error={!!error} />
      ) : (
        <PinPad value={pin} onChange={setPin} onComplete={checkPin} />
      )}

      {bio ? (
        <Pressable
          style={styles.bio}
          onPress={async () => {
            const success = await authenticateBiometrics();
            if (success) setUnlocked(true);
          }}
        >
          <Ionicons name="finger-print" size={22} color={colors.white} />
          <Text style={styles.bioText}>Usar biometria</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: "center",
    justifyContent: "center",
    padding: 24
  },
  hint: { color: colors.muted, marginTop: 18, marginBottom: 18 },
  error: { color: colors.danger, marginBottom: 10, fontWeight: "700" },
  bio: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.06)"
  },
  bioText: { color: colors.white, fontWeight: "700" }
});
