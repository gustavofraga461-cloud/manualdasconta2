import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const PIN_KEY = "mdc_pin";
const PATTERN_KEY = "mdc_pattern";

export async function savePin(pin) {
  if (Platform.OS === "web") {
    globalThis.__mdcPin = pin;
    return;
  }
  await SecureStore.setItemAsync(PIN_KEY, pin);
}

export async function getPin() {
  if (Platform.OS === "web") return globalThis.__mdcPin || "";
  return (await SecureStore.getItemAsync(PIN_KEY)) || "";
}

export async function savePattern(dots) {
  const value = JSON.stringify(dots);
  if (Platform.OS === "web") {
    globalThis.__mdcPattern = value;
    return;
  }
  await SecureStore.setItemAsync(PATTERN_KEY, value);
}

export async function getPattern() {
  if (Platform.OS === "web") return JSON.parse(globalThis.__mdcPattern || "[]");
  const raw = await SecureStore.getItemAsync(PATTERN_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function hasHardware() {
  if (Platform.OS === "web") return false;
  try {
    return await LocalAuthentication.hasHardwareAsync();
  } catch {
    return false;
  }
}

export async function isBiometricEnrolled() {
  if (Platform.OS === "web") return false;
  try {
    return await LocalAuthentication.isEnrolledAsync();
  } catch {
    return false;
  }
}

export async function authenticateBiometrics() {
  if (Platform.OS === "web") return false;
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Desbloquear Manual das Contas",
      cancelLabel: "Usar PIN",
      disableDeviceFallback: false
    });
    return result.success;
  } catch {
    return false;
  }
}

export function samePattern(a, b) {
  if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
  return a.every((v, i) => v === b[i]);
}
