import React from "react";
import { View, Text, StyleSheet, Pressable, Alert, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import GlassCard from "../components/GlassCard";
import PrimaryButton from "../components/PrimaryButton";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { getCategory } from "../constants/categories";
import { formatCurrency, formatDate } from "../utils/format";
import { computeStatus } from "../utils/bills";

export default function BillDetailsScreen() {
  const navigation = useNavigation();
  const { id } = useRoute().params || {};
  const { bills, togglePaid, deleteBill, deleteGroup } = useApp();
  const bill = bills.find((b) => b.id === id);

  if (!bill) {
    return (
      <View style={styles.page}>
        <Text style={styles.missing}>Conta nao encontrada.</Text>
      </View>
    );
  }

  const cat = getCategory(bill.category);
  const status = computeStatus(bill);

  const confirmDelete = () => {
    Alert.alert("Excluir", "Deseja excluir so esta conta ou todo o grupo (parcelas/fixas)?", [
      { text: "Cancelar", style: "cancel" },
      { text: "So esta", onPress: async () => { await deleteBill(bill.id); navigation.goBack(); } },
      { text: "Grupo inteiro", style: "destructive", onPress: async () => { await deleteGroup(bill.groupId); navigation.goBack(); } }
    ]);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Pressable onPress={() => navigation.goBack()} style={styles.back}>
        <Ionicons name="chevron-back" size={20} color={colors.white} />
        <Text style={styles.backText}>Voltar</Text>
      </Pressable>
      <Text style={styles.h1}>{bill.title}</Text>
      <Text style={styles.amount}>{formatCurrency(bill.amount)}</Text>

      <GlassCard style={{ marginTop: 16 }}>
        <Row icon={cat.icon} color={cat.color} label="Categoria" value={cat.label} />
        <Row icon="calendar-outline" label="Vencimento" value={formatDate(bill.dueDate)} />
        <Row icon="flag-outline" label="Status" value={status.toUpperCase()} danger={status === "atrasada"} />
        <Row
          icon="repeat-outline"
          label="Recorrencia"
          value={
            bill.recurrence === "parcelada"
              ? `Parcela ${bill.installment}/${bill.totalInstallments}`
              : bill.recurrence === "fixa"
                ? "Fixa mensal"
                : "Unica"
          }
        />
        <Row icon="time-outline" label="Alerta" value={`${(bill.notifyOffsets || []).join(", ") || "due"} • ${bill.notifyHour || "08:00"}`} />
        {bill.barcode ? <Row icon="barcode-outline" label="Codigo / PIX" value={bill.barcode} /> : null}
        {bill.notes ? <Row icon="document-text-outline" label="Notas" value={bill.notes} /> : null}
      </GlassCard>

      <View style={{ height: 16 }} />
      <PrimaryButton title={bill.paid ? "Marcar como pendente" : "Marcar como paga"} onPress={() => togglePaid(bill.id)} />
      <Pressable style={styles.edit} onPress={() => navigation.navigate("AddBill", { id: bill.id })}>
        <Text style={styles.editText}>Editar dados</Text>
      </Pressable>
      <Pressable style={styles.del} onPress={confirmDelete}>
        <Text style={styles.delText}>Excluir</Text>
      </Pressable>
    </ScrollView>
  );
}

function Row({ icon, label, value, color = colors.muted, danger }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={16} color={color} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={[styles.rowValue, danger && { color: colors.danger }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingTop: 52, paddingBottom: 40 },
  back: { flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 10 },
  backText: { color: colors.white, fontWeight: "700" },
  h1: { color: colors.white, fontSize: 26, fontWeight: "800" },
  amount: { color: colors.primarySoft, fontSize: 22, fontWeight: "800", marginTop: 6 },
  missing: { color: colors.muted, marginTop: 80, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowLabel: { color: colors.muted, fontWeight: "700" },
  rowValue: { color: colors.white, flex: 1, textAlign: "right" },
  edit: { marginTop: 14, alignItems: "center", padding: 12 },
  editText: { color: colors.white, fontWeight: "700" },
  del: { alignItems: "center", padding: 12 },
  delText: { color: colors.danger, fontWeight: "800" }
});
