import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  bills: "@mdc/bills",
  settings: "@mdc/settings"
};

export const DEFAULT_SETTINGS = {
  lockEnabled: false,
  lockMethod: "pin",
  biometricsEnabled: true,
  defaultNotifyHour: "08:00",
  defaultNotifyOffsets: ["due", "1d"]
};

export async function loadBills() {
  const raw = await AsyncStorage.getItem(KEYS.bills);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function saveBills(bills) {
  await AsyncStorage.setItem(KEYS.bills, JSON.stringify(bills));
}

export async function loadSettings() {
  const raw = await AsyncStorage.getItem(KEYS.settings);
  if (!raw) return { ...DEFAULT_SETTINGS };
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveSettings(settings) {
  await AsyncStorage.setItem(KEYS.settings, JSON.stringify(settings));
}

export async function clearAll() {
  await AsyncStorage.multiRemove([KEYS.bills, KEYS.settings]);
}
