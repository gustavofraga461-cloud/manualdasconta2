export function formatCurrency(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function toISODate(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISODate(iso) {
  if (!iso) return new Date();
  const [y, m, d] = String(iso).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function formatDate(iso) {
  const d = parseISODate(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  });
}

export function formatMonthLabel(year, month) {
  const d = new Date(year, month, 1);
  const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function todayISO() {
  return toISODate(new Date());
}

export function addMonths(iso, count) {
  const d = parseISODate(iso);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + count);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return toISODate(d);
}

export function addDays(iso, days) {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export function isPast(iso) {
  return parseISODate(iso) < parseISODate(todayISO());
}

export function sameMonth(iso, year, month) {
  const d = parseISODate(iso);
  return d.getFullYear() === year && d.getMonth() === month;
}

export function uid(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function parseMoney(raw) {
  if (typeof raw === "number") return raw;
  const cleaned = String(raw || "")
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}
