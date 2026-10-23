import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { parseISODate } from "./format";
import { NOTIFY_OPTIONS } from "../constants/categories";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false
  })
});

export async function ensureNotificationPermission() {
  if (Platform.OS === "web") return false;
  if (!Device.isDevice && Platform.OS !== "android") return false;
  const settings = await Notifications.getPermissionsAsync();
  let granted = settings.granted || settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  if (!granted) {
    const req = await Notifications.requestPermissionsAsync();
    granted = req.granted || req.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;
  }
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("contas", {
      name: "Contas a pagar",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#E50914",
      sound: "default"
    });
  }
  return granted;
}

function buildTrigger(dueDate, daysBefore, hourStr) {
  const [hh, mm] = String(hourStr || "08:00").split(":").map((n) => Number(n) || 0);
  const date = parseISODate(dueDate);
  date.setDate(date.getDate() - (daysBefore || 0));
  date.setHours(hh, mm, 0, 0);
  if (date.getTime() <= Date.now()) return null;
  return date;
}

export async function scheduleBillNotifications(bill) {
  if (Platform.OS === "web") return [];
  const ids = [];
  const offsets = bill.notifyOffsets || ["due"];
  for (const offsetId of offsets) {
    const option = NOTIFY_OPTIONS.find((o) => o.id === offsetId) || NOTIFY_OPTIONS[0];
    const when = buildTrigger(bill.dueDate, option.days, bill.notifyHour);
    if (!when) continue;
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: bill.paid ? "Conta atualizada" : "Conta a vencer",
          body:
            option.days === 0
              ? `${bill.title} vence hoje • ${formatBody(bill)}`
              : `${bill.title} vence em ${option.days} dia(s) • ${formatBody(bill)}`,
          sound: true,
          data: { billId: bill.id }
        },
        trigger: when
      });
      ids.push(id);
    } catch {
      // ignore schedule errors on unsupported platforms
    }
  }
  return ids;
}

function formatBody(bill) {
  const amount = Number(bill.amount) || 0;
  return amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export async function cancelIds(ids) {
  if (!ids || !ids.length || Platform.OS === "web") return;
  await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id).catch(() => null)));
}

export async function rescheduleAll(bills) {
  if (Platform.OS === "web") return bills;
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => null);
  const next = [];
  for (const bill of bills) {
    if (bill.paid) {
      next.push({ ...bill, notificationIds: [] });
      continue;
    }
    const notificationIds = await scheduleBillNotifications(bill);
    next.push({ ...bill, notificationIds });
  }
  return next;
}
