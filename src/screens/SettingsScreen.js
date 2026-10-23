import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, TextInput, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../components/GlassCard";
import PinPad from "../components/PinPad";
import PatternLock from "../components/PatternLock";
import PrimaryButton from "../components/PrimaryButton";
import LogoMark from "../components/LogoMark";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { hasHardware, isBiometricEnrolled, savePattern, savePin } from "../utils/auth";
import { NOTIFY_OPTIONS } from "../constants/categories";
import { ensureNotificationPermission } from "../utils/notifications";

export default function SettingsScreen() {
  const { settings, updateSettings } = useApp();
  const [lockEnabled, setLockEnabled] = useState(settings.lockEnabled);
  const [method, setMethod] = useState(settings.lockMethod || "pin");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [step, setStep] = useState("one");
  const [bio, setBio] = useState(settings.biometricsEnabled);
  const [hw, setHw] = useState(false);
  const [hour, setHour] = useState(settings.defaultNotifyHour || "08:00");
  const [offsets, setOffsets] = useState(settings.defaultNotifyOffsets || ["due"]);

  useEffect(() => {
    (async () => {
      const ok = (await hasHardware()) && (await isBiometricEnrolled());
      setHw(ok);
    })();
  }, []);

  const persistLock = async (enabled, extra = {}) => {
    setLockEnabled(enabled);
    await updateSettings({ lockEnabled: enabled, ...extra });
  };

  const finishPin = async (confirmed) => {
    if (pin !== confirmed) {
      Alert.alert("PIN diferente", "Os dois PINs nao coincidem.");
      setPin("");
      setPin2("");
      setStep("one");
      return;
    }
    await savePin(confirmed);
    await persistLock(true, { lockMethod: "pin" });
    Alert.alert("Pronto", "Bloqueio por PIN ativado.");
    setPin("");
    setPin2("");
    setStep("one");
  };

  const finishPattern = async (dots) => {
    await savePattern(dots);
    await persistLock(true, { lockMethod: "pattern" });
    Alert.alert("Pronto", "Bloqueio por padrao ativado.");
  };

  const toggleOffset = (id) => {
    const next = offsets.includes(id) ? offsets.filter((x) => x !== id) : [...offsets, id];
    setOffsets(next);
    updateSettings({ defaultNotifyOffsets: next.length ? next : ["due"] });
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.head}>
        <LogoMark size={64} />
        <Text style={styles.h1}>Configuracoes</Text>
        <Text style={styles.sub}>Seguranca, alertas e identidade</Text>
      </View>

      <GlassCard style={{ marginBottom: 14 }}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Bloquear ao abrir</Text>
            <Text style={styles.rowSub}>PIN, padrao ou biometria</Text>
          </View>
          <Switch
            value={lockEnabled}
            onValueChange={async (v) => {
              if (!v) {
                await persistLock(false);
                return;
              }
              // Show the credential setup first; only persist enabled after a PIN/pattern is saved.
              setLockEnabled(true);
            }}
            trackColor={{ false: "#3f3f46", true: colors.primary }}
            thumbColor="#fff"
          />
        </View>
      </GlassCard>

      {lockEnabled ? (
        <GlassCard style={{ marginBottom: 14 }}>
          <Text style={styles.section}>Metodo de desbloqueio</Text>
          <View style={styles.methods}>
            <Pressable onPress={() => setMethod("pin")} style={[styles.method, method === "pin" && styles.methodOn]}>
              <Ionicons name="keypad-outline" size={18} color={colors.white} />
              <Text style={styles.methodText}>PIN</Text>
            </Pressable>
            <Pressable onPress={() => setMethod("pattern")} style={[styles.method, method === "pattern" && styles.methodOn]}>
              <Ionicons name="grid-outline" size={18} color={colors.white} />
              <Text style={styles.methodText}>Padrao</Text>
            </Pressable>
          </View>

          {method === "pin" ? (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.rowSub}>{step === "one" ? "Crie um PIN de 4 digitos" : "Confirme o PIN"}</Text>
              {step === "one" ? (
                <PinPad
                  value={pin}
                  onChange={setPin}
                  onComplete={(v) => {
                    setPin(v);
                    setStep("two");
                  }}
                />
              ) : (
                <PinPad value={pin2} onChange={setPin2} onComplete={finishPin} />
              )}
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              <Text style={styles.rowSub}>Desenhe um padrao com pelo menos 4 pontos</Text>
              <PatternLock onComplete={finishPattern} />
            </View>
          )}

          <View style={[styles.row, { marginTop: 8 }]}>
            <View>
              <Text style={styles.rowTitle}>Biometria</Text>
              <Text style={styles.rowSub}>{hw ? "Disponivel neste aparelho" : "Indisponivel neste ambiente"}</Text>
            </View>
            <Switch
              value={bio}
              disabled={!hw && Platform.OS !== "web"}
              onValueChange={async (v) => {
                setBio(v);
                await updateSettings({ biometricsEnabled: v });
              }}
              trackColor={{ false: "#3f3f46", true: colors.primary }}
              thumbColor="#fff"
            />
          </View>
        </GlassCard>
      ) : null}

      <GlassCard style={{ marginBottom: 14 }}>
        <Text style={styles.section}>Notificacoes padrao</Text>
        <Text style={styles.rowSub}>Usadas em novas contas</Text>
        <TextInput
          value={hour}
          onChangeText={async (v) => {
            setHour(v);
            await updateSettings({ defaultNotifyHour: v });
          }}
          style={styles.input}
          placeholder="08:00"
          placeholderTextColor={colors.muted}
        />
        <View style={styles.wrap}>
          {NOTIFY_OPTIONS.map((o) => (
            <Pressable key={o.id} onPress={() => toggleOffset(o.id)} style={[styles.chip, offsets.includes(o.id) && styles.chipOn]}>
              <Text style={[styles.chipText, offsets.includes(o.id) && styles.chipTextOn]}>{o.label}</Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton
          title="Permitir notificacoes"
          style={{ marginTop: 12 }}
          onPress={async () => {
            const ok = await ensureNotificationPermission();
            Alert.alert(ok ? "Permissao concedida" : "Permissao recusada", ok ? "Alertas de vencimento ativos." : "Ative nas configuracoes do sistema.");
          }}
        />
      </GlassCard>

      <GlassCard>
        <Text style={styles.section}>Sobre</Text>
        <Text style={styles.about}>Manual das Contas 1.0.0</Text>
        <Text style={styles.rowSub}>App offline de controle de contas, parcelas e vencimentos.</Text>
      </GlassCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingTop: 56, paddingBottom: 40 },
  head: { alignItems: "center", marginBottom: 18 },
  h1: { color: colors.white, fontSize: 24, fontWeight: "800", marginTop: 10 },
  sub: { color: colors.muted, marginTop: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowTitle: { color: colors.white, fontWeight: "800" },
  rowSub: { color: colors.muted, marginTop: 4, fontSize: 12 },
  section: { color: colors.white, fontWeight: "800", marginBottom: 8 },
  methods: { flexDirection: "row", gap: 8, marginTop: 8 },
  method: {
    flex: 1,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border
  },
  methodOn: { backgroundColor: colors.primaryDim, borderColor: colors.primary },
  methodText: { color: colors.white, fontWeight: "700" },
  input: {
    marginTop: 10,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    color: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  wrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: "700", fontSize: 11 },
  chipTextOn: { color: colors.white },
  about: { color: colors.white, fontWeight: "700", marginBottom: 4 }
});
