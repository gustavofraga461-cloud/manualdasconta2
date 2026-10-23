import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import GlassCard from "../components/GlassCard";
import BillCard from "../components/BillCard";
import LogoMark from "../components/LogoMark";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { filterBills, monthSummary } from "../utils/bills";
import { formatCurrency, formatMonthLabel } from "../utils/format";

const FILTERS = [
  { id: "todas", label: "Todas" },
  { id: "pagar", label: "A pagar" },
  { id: "pagas", label: "Pagas" },
  { id: "atrasadas", label: "Atrasadas" }
];

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { bills, togglePaid } = useApp();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filter, setFilter] = useState("todas");

  const summary = useMemo(() => monthSummary(bills, year, month), [bills, year, month]);
  const list = useMemo(() => filterBills(bills, filter, year, month), [bills, filter, year, month]);

  const shift = (delta) => {
    const d = new Date(year, month + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth());
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <View>
            <Text style={styles.hello}>Manual das Contas</Text>
            <Text style={styles.sub}>Resumo do mes</Text>
          </View>
          <LogoMark size={46} />
        </View>

        <View style={styles.monthRow}>
          <Pressable onPress={() => shift(-1)} style={styles.navBtn}>
            <Ionicons name="chevron-back" size={18} color={colors.white} />
          </Pressable>
          <Text style={styles.month}>{formatMonthLabel(year, month)}</Text>
          <Pressable onPress={() => shift(1)} style={styles.navBtn}>
            <Ionicons name="chevron-forward" size={18} color={colors.white} />
          </Pressable>
        </View>

        <View style={styles.kpis}>
          <GlassCard style={styles.kpi} accent>
            <Text style={styles.kpiLabel}>Pago</Text>
            <Text style={styles.kpiValue}>{formatCurrency(summary.paid)}</Text>
          </GlassCard>
          <GlassCard style={styles.kpi}>
            <Text style={styles.kpiLabel}>Pendente</Text>
            <Text style={[styles.kpiValue, { color: colors.warning }]}>{formatCurrency(summary.pending)}</Text>
          </GlassCard>
          <GlassCard style={styles.kpi}>
            <Text style={styles.kpiLabel}>Atrasado</Text>
            <Text style={[styles.kpiValue, { color: colors.danger }]}>{formatCurrency(summary.overdue)}</Text>
          </GlassCard>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable key={f.id} onPress={() => setFilter(f.id)} style={[styles.chip, filter === f.id && styles.chipOn]}>
              <Text style={[styles.chipText, filter === f.id && styles.chipTextOn]}>{f.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {list.length === 0 ? (
          <GlassCard>
            <Text style={styles.emptyTitle}>Nenhuma conta neste filtro</Text>
            <Text style={styles.emptySub}>Toque em + para cadastrar vencimentos, parcelas e contas fixas.</Text>
          </GlassCard>
        ) : (
          list.map((bill) => (
            <BillCard
              key={bill.id}
              bill={bill}
              onToggle={(item) => togglePaid(item.id)}
              onPress={() => navigation.navigate("BillDetails", { id: bill.id })}
            />
          ))
        )}
        <View style={{ height: 90 }} />
      </ScrollView>

      <Pressable style={styles.fab} onPress={() => navigation.navigate("AddBill")}>
        <Ionicons name="add" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingTop: 56 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  hello: { color: colors.white, fontSize: 22, fontWeight: "800" },
  sub: { color: colors.muted, marginTop: 4 },
  monthRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 18 },
  month: { color: colors.white, fontWeight: "800", fontSize: 16 },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center"
  },
  kpis: { flexDirection: "row", gap: 8, marginBottom: 16 },
  kpi: { flex: 1 },
  kpiLabel: { color: colors.muted, fontSize: 11, marginBottom: 6 },
  kpiValue: { color: colors.white, fontWeight: "800", fontSize: 13 },
  filters: { gap: 8, paddingBottom: 14 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderWidth: 1,
    borderColor: colors.border
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.muted, fontWeight: "700", fontSize: 12 },
  chipTextOn: { color: colors.white },
  emptyTitle: { color: colors.white, fontWeight: "800", marginBottom: 6 },
  emptySub: { color: colors.muted, lineHeight: 20 },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 8
  }
});
