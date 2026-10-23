import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loadBills, loadSettings, saveBills, saveSettings, DEFAULT_SETTINGS } from "../utils/storage";
import { extendEndlessBills, generateBillsFromForm, withStatus } from "../utils/bills";
import { ensureNotificationPermission, rescheduleAll } from "../utils/notifications";
import { getPin, getPattern, savePin, savePattern } from "../utils/auth";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [bills, setBills] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [unlocked, setUnlocked] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [storedBills, loadedSettings] = await Promise.all([loadBills(), loadSettings()]);
        const storedSettings = { ...loadedSettings };

        // Migrate credentials saved by older versions out of plain AsyncStorage.
        // If secure storage fails, keep the app usable and disable the legacy lock rather than lock users out.
        try {
          if (typeof storedSettings.pin === "string" && storedSettings.pin) {
            if (!(await getPin())) await savePin(storedSettings.pin);
            delete storedSettings.pin;
          }
          if (Array.isArray(storedSettings.pattern) && storedSettings.pattern.length) {
            const securePattern = await getPattern();
            if (!securePattern.length) await savePattern(storedSettings.pattern);
            delete storedSettings.pattern;
          }
          await saveSettings(storedSettings);
        } catch (migrationError) {
          console.warn("Nao foi possivel migrar as credenciais antigas:", migrationError);
          delete storedSettings.pin;
          delete storedSettings.pattern;
          storedSettings.lockEnabled = false;
          await saveSettings(storedSettings).catch(() => null);
        }

        const extended = extendEndlessBills(storedBills.map(withStatus));
        if (!active) return;
        setBills(extended);
        setSettings(storedSettings);
        setUnlocked(!storedSettings.lockEnabled);
        if (extended.length !== storedBills.length) await saveBills(extended);
        // Permission failures must not leave the app stuck on the loading screen.
        await ensureNotificationPermission().catch(() => false);
      } catch (error) {
        console.warn("Falha ao inicializar o Manual das Contas:", error);
        if (active) {
          setBills([]);
          setSettings(DEFAULT_SETTINGS);
          setUnlocked(true);
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => { active = false; };
  }, []);

  const persistBills = async (next) => {
    const normalized = next.map(withStatus);
    setBills(normalized);
    await saveBills(normalized);
    return normalized;
  };

  const persistSettings = async (next) => {
    setSettings(next);
    await saveSettings(next);
    return next;
  };

  const value = useMemo(
    () => ({
      ready,
      bills,
      settings,
      unlocked,
      setUnlocked,
      async addFromForm(form) {
        const created = generateBillsFromForm(form);
        const merged = await persistBills([...bills, ...created]);
        const scheduled = await rescheduleAll(merged);
        await persistBills(scheduled);
        return created;
      },
      async updateBill(id, patch) {
        const next = bills.map((b) => (b.id === id ? withStatus({ ...b, ...patch }) : b));
        const scheduled = await rescheduleAll(await persistBills(next));
        await persistBills(scheduled);
      },
      async togglePaid(id) {
        const next = bills.map((b) =>
          b.id === id ? withStatus({ ...b, paid: !b.paid, paidAt: !b.paid ? new Date().toISOString() : null }) : b
        );
        const scheduled = await rescheduleAll(await persistBills(next));
        await persistBills(scheduled);
      },
      async deleteBill(id) {
        const next = bills.filter((b) => b.id !== id);
        const scheduled = await rescheduleAll(await persistBills(next));
        await persistBills(scheduled);
      },
      async deleteGroup(groupId) {
        const next = bills.filter((b) => b.groupId !== groupId);
        const scheduled = await rescheduleAll(await persistBills(next));
        await persistBills(scheduled);
      },
      async updateSettings(patch) {
        return persistSettings({ ...settings, ...patch });
      }
    }),
    [ready, bills, settings, unlocked]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
