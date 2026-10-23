import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "../components/GlassCard";
import { colors } from "../theme/colors";
import { useApp } from "../context/AppContext";
import { availableMonths, categoryHistory, monthSummary } from "../utils/bills";
import { formatCurrency, formatMonthLabel } from "../utils/format";
import { getCategory } from "../constants/categories";

export default function HistoryScreen() {
  const { bills } = useApp();
  const months = useMemo(() => availableMonths(bills), [bills]);
  const [selected, setSelected] = useState(months[0]);
  const [year, month] = (selected || "2026-10").split("-").map(Number);
  const mIndex = (month || 1) - 1;
  const summary = monthSummary(bills, year, mIndex);
  const cats = categoryHistory(bills, year, mIndex);
  const max = Math.max(1, ...cats.map((c) => c.total));

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Historico</Text>
      <Text style={styles.sub}>Lancamentos e gastos por categoria</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.months}>
        {months.map((m) => {
          const [y, mo] = m.split("-").map(Number);
          return (
            <Pressable key={m} onPress={() => setSelected(m)} style={[styles.chip, selected === m && styles.chipOn]}>
              <Text style={[styles.chipText, selected === m && styles.chipTextOn]}>{formatMonthLabel(y, mo - 1)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.kpis}>
        <Stat label="Total" value={formatCurrency(summary.total)} />
        <Stat label="Pago" value={formatCurrency(summary.paid)} color={colors.success} />
        <Stat label="Atrasado" value={formatCurrency(summary.overdue)} color={colors.danger} />
      </View>

      {cats.length === 0 ? (
        <GlassCard>
          <Text style={styles.empty}>Sem lancamentos neste mes.</Text>
        </GlassCard>
      ) : (
        cats.map((item) => {
          const cat = getCategory(item.category);
          return (
            <GlassCard key={item.category} style={{ marginBottom: 10 }}>
              <View style={styles.catHead}>
                <View style={styles.catLeft}>
                  <Ionicons name={cat.icon} size={18} color={cat.color} />
                  <Text style={styles.catName}>{cat.label}</Text>
                </View>
                <Text style={styles.catTotal}>{formatCurrency(item.total)}</Text>
              </View>
              <View style={styles.barBg}>
                <View style={[styles.bar, { width: `${(item.total / max) * 100}%`, backgroundColor: cat.color }]} />
              </View>
              <Text style={styles.catMeta}>
                Pago {formatCurrency(item.paid)}  •  Pendente {formatCurrency(item.pending)}  •  Atrasado {formatCurrency(item.overdue)}
              </Text>
            </GlassCard>
          );
        })
      )}
    </ScrollView>
  );
}

function Stat({ label, value, color = colors.white }) {
  return (
    <GlassCard style={{ flex: 1 }}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 18, paddingTop: 56, paddingBottom: 40 },
  h1: { color: colors.white, fontSize: 26, fontWeight: "800" },
  sub: { color: colors.muted, marginTop: 4, marginBottom: 16 },
  months: { gap: 8, paddingBottom: 16 },
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
  chipTextOn: { color: colors.white },
  kpis: { flexDirection: "row", gap: 8, marginBottom: 16 },
  kpiLabel: { color: colors.muted, fontSize: 11, marginBottom: 6 },
  kpiValue: { fontWeight: "800", fontSize: 13 },
  empty: { color: colors.muted },
  catHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  catLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  catName: { color: colors.white, fontWeight: "800" },
  catTotal: { color: colors.white, fontWeight: "800" },
  barBg: { height: 8, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 99, marginTop: 10, overflow: "hidden" },
  bar: { height: 8, borderRadius: 99 },
  catMeta: { color: colors.muted, marginTop: 8, fontSize: 11 }
});
