import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import PrimaryButton from "../components/PrimaryButton";
import { colors, radius } from "../theme/colors";
import { CATEGORIES, NOTIFY_OPTIONS, RECURRENCE_TYPES } from "../constants/categories";
import { useApp } from "../context/AppContext";
import { parseMoney, todayISO } from "../utils/format";

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}

export default function AddBillScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { addFromForm, settings, bills, updateBill } = useApp();
  const editing = bills.find((b) => b.id === route.params?.id);

  const [title, setTitle] = useState(editing?.title || "");
  const [amount, setAmount] = useState(editing ? String(editing.amount).replace(".", ",") : "");
  const [category, setCategory] = useState(editing?.category || "moradia");
  const [dueDate, setDueDate] = useState(editing?.dueDate || todayISO());
  const [recurrence, setRecurrence] = useState(editing?.recurrence || "unica");
  const [installments, setInstallments] = useState(editing?.totalInstallments ? String(editing.totalInstallments) : "12");
  const [endDate, setEndDate] = useState("");
  const [barcode, setBarcode] = useState(editing?.barcode || "");
  const [notes, setNotes] = useState(editing?.notes || "");
  const [notifyHour, setNotifyHour] = useState(editing?.notifyHour || settings.defaultNotifyHour || "08:00");
  const [notifyOffsets, setNotifyOffsets] = useState(editing?.notifyOffsets || settings.defaultNotifyOffsets || ["due"]);
  const [saving, setSaving] = useState(false);

  const canSave = title.trim() && parseMoney(amount) > 0 && dueDate;

  const preview = useMemo(() => {
    if (recurrence === "parcelada") return `${installments || 1} parcelas automaticas`;
    if (recurrence === "fixa") return endDate ? `Mensal ate ${endDate}` : "Mensal sem data limite";
    return "Lancamento unico";
  }, [recurrence, installments, endDate]);

  const toggleOffset = (id) => {
    setNotifyOffsets((curr) => (curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id]));
  };

  const submit = async () => {
    if (!canSave) {
      Alert.alert("Campos obrigatorios", "Informe titulo, valor e vencimento.");
      return;
    }
    setSaving(true);
    try {
      const form = {
        title,
        amount: parseMoney(amount),
        category,
        dueDate,
        recurrence,
        installments: Number(installments) || 1,
        endDate: endDate || null,
        barcode,
        notes,
        notifyHour,
        notifyOffsets: notifyOffsets.length ? notifyOffsets : ["due"]
      };
      if (editing) {
        await updateBill(editing.id, {
          title: form.title,
          amount: form.amount,
          category: form.category,
          dueDate: form.dueDate,
          barcode: form.barcode,
          notes: form.notes,
          notifyHour: form.notifyHour,
          notifyOffsets: form.notifyOffsets
        });
      } else {
        await addFromForm(form);
      }
      navigation.goBack();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Ionicons name="chevron-back" size={20} color={colors.white} />
          <Text style={styles.backText}>Voltar</Text>
        </Pressable>
        <Text style={styles.h1}>{editing ? "Editar conta" : "Nova conta"}</Text>
        <Text style={styles.sub}>{preview}</Text>

        <Field label="Nome / titulo">
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Ex: Aluguel, Nubank, Luz"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </Field>

        <Field label="Valor (R$)">
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0,00"
            placeholderTextColor={colors.muted}
            keyboardType={Platform.OS === "web" ? "decimal" : "numeric"}
            style={styles.input}
          />
        </Field>

        <Field label="Categoria">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {CATEGORIES.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[styles.cat, category === c.id && { backgroundColor: c.color }]}
              >
                <Ionicons name={c.icon} size={16} color={category === c.id ? "#fff" : c.color} />
                <Text style={[styles.catText, category === c.id && { color: "#fff" }]}>{c.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </Field>

        <Field label="Data de vencimento (AAAA-MM-DD)">
          <TextInput value={dueDate} onChangeText={setDueDate} placeholder="2026-10-23" placeholderTextColor={colors.muted} style={styles.input} />
        </Field>

        <Field label="Recorrencia">
          <View style={styles.rowWrap}>
            {RECURRENCE_TYPES.map((r) => (
              <Pressable key={r.id} onPress={() => setRecurrence(r.id)} style={[styles.chip, recurrence === r.id && styles.chipOn]}>
                <Text style={[styles.chipText, recurrence === r.id && styles.chipTextOn]}>{r.label}</Text>
              </Pressable>
            ))}
          </View>
        </Field>

        {recurrence === "parcelada" ? (
          <Field label="Numero de parcelas">
            <TextInput value={installments} onChangeText={setInstallments} keyboardType="numeric" style={styles.input} />
          </Field>
        ) : null}

        {recurrence === "fixa" ? (
          <Field label="Data limite (opcional, AAAA-MM-DD)">
            <TextInput
              value={endDate}
              onChangeText={setEndDate}
              placeholder="Deixe vazio para sem fim"
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </Field>
        ) : null}

        <Field label="Codigo de barras / chave PIX">
          <TextInput
            value={barcode}
            onChangeText={setBarcode}
            placeholder="Cole o codigo ou chave"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </Field>

        <Field label="Anotacoes">
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Observacoes"
            placeholderTextColor={colors.muted}
            style={[styles.input, { height: 90, textAlignVertical: "top" }]}
            multiline
          />
        </Field>

        <Field label="Horario do alerta">
          <TextInput value={notifyHour} onChangeText={setNotifyHour} placeholder="08:00" placeholderTextColor={colors.muted} style={styles.input} />
        </Field>

        <Field label="Quando notificar">
          <View style={styles.rowWrap}>
            {NOTIFY_OPTIONS.map((o) => (
              <Pressable
                key={o.id}
                onPress={() => toggleOffset(o.id)}
                style={[styles.chip, notifyOffsets.includes(o.id) && styles.chipOn]}
              >
                <Text style={[styles.chipText, notifyOffsets.includes(o.id) && styles.chipTextOn]}>{o.label}</Text>
              </Pressable>
            ))}
          </View>
        </Field>

        <PrimaryButton title={editing ? "Salvar alteracoes" : "Salvar conta"} onPress={submit} loading={saving} disabled={!canSave} />
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingTop: 52 },
  back: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: colors.white, fontWeight: "700" },
  h1: { color: colors.white, fontSize: 26, fontWeight: "800" },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 18 },
  field: { marginBottom: 16 },
  label: { color: colors.muted, marginBottom: 8, fontWeight: "700", fontSize: 12 },
  input: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    color: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12
  },
  row: { gap: 8 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  cat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border
  },
  catText: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  chipTextOn: { color: colors.white }
});
