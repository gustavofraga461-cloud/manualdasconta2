import React, { useRef } from "react";
import { View, Text, Pressable, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { colors, radius } from "../theme/colors";
import { getCategory } from "../constants/categories";
import { formatCurrency, formatDate } from "../utils/format";
import { computeStatus } from "../utils/bills";

export default function BillCard({ bill, onToggle, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const status = computeStatus(bill);
  const cat = getCategory(bill.category);

  const animate = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true })
    ]).start();
  };

  const statusMeta = {
    paga: { label: "Paga", color: colors.success, bg: colors.successDim, icon: "checkmark-circle" },
    pendente: { label: "A pagar", color: colors.warning, bg: colors.warningDim, icon: "time" },
    atrasada: { label: "Atrasada", color: colors.danger, bg: colors.dangerDim, icon: "alert-circle" }
  }[status];

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable onPress={onPress} style={styles.card}>
        <View style={[styles.iconWrap, { backgroundColor: `${cat.color}22` }]}>
          <Ionicons name={cat.icon} size={20} color={cat.color} />
        </View>
        <View style={styles.mid}>
          <Text style={styles.title} numberOfLines={1}>
            {bill.title}
          </Text>
          <Text style={styles.meta}>
            {formatDate(bill.dueDate)}
            {bill.installment ? `  •  ${bill.installment}/${bill.totalInstallments}` : ""}
            {bill.recurrence === "fixa" ? "  •  Fixa" : ""}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusMeta.bg }]}>
            <Ionicons name={statusMeta.icon} size={12} color={statusMeta.color} />
            <Text style={[styles.badgeText, { color: statusMeta.color }]}>{statusMeta.label}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <Text style={styles.amount}>{formatCurrency(bill.amount)}</Text>
          <Pressable
            onPress={async () => {
              animate();
              try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              } catch {}
              onToggle(bill);
            }}
            style={[styles.toggle, bill.paid ? styles.toggleOn : styles.toggleOff]}
          >
            <Ionicons name={bill.paid ? "checkmark" : "ellipse-outline"} size={18} color={bill.paid ? "#fff" : colors.muted} />
          </Pressable>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 10
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  mid: { flex: 1, marginHorizontal: 12 },
  title: { color: colors.white, fontWeight: "700", fontSize: 15 },
  meta: { color: colors.muted, fontSize: 12, marginTop: 3 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99
  },
  badgeText: { fontSize: 11, fontWeight: "700" },
  right: { alignItems: "flex-end", gap: 8 },
  amount: { color: colors.white, fontWeight: "800", fontSize: 14 },
  toggle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center"
  },
  toggleOn: { backgroundColor: colors.success },
  toggleOff: { backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: colors.border }
});
