import { addMonths, isPast, sameMonth, todayISO, uid } from "./format";

export function computeStatus(bill) {
  if (bill.paid) return "paga";
  if (isPast(bill.dueDate)) return "atrasada";
  return "pendente";
}

export function withStatus(bill) {
  return { ...bill, status: computeStatus(bill) };
}

export function generateBillsFromForm(form) {
  const groupId = uid("grp");
  const createdAt = new Date().toISOString();
  const base = {
    groupId,
    title: form.title.trim(),
    amount: Number(form.amount) || 0,
    category: form.category,
    barcode: form.barcode.trim(),
    notes: form.notes.trim(),
    notifyOffsets: form.notifyOffsets,
    notifyHour: form.notifyHour,
    recurrence: form.recurrence,
    createdAt,
    paid: false
  };

  if (form.recurrence === "unica") {
    return [
      withStatus({
        ...base,
        id: uid("bill"),
        dueDate: form.dueDate,
        installment: null,
        totalInstallments: null
      })
    ];
  }

  if (form.recurrence === "parcelada") {
    const total = Math.max(1, Number(form.installments) || 1);
    const list = [];
    for (let i = 0; i < total; i += 1) {
      list.push(
        withStatus({
          ...base,
          id: uid("bill"),
          dueDate: addMonths(form.dueDate, i),
          installment: i + 1,
          totalInstallments: total
        })
      );
    }
    return list;
  }

  const list = [];
  const horizon = form.endDate ? 240 : 24;
  for (let i = 0; i < horizon; i += 1) {
    const due = addMonths(form.dueDate, i);
    if (form.endDate && due > form.endDate) break;
    list.push(
      withStatus({
        ...base,
        id: uid("bill"),
        dueDate: due,
        installment: null,
        totalInstallments: null,
        endless: !form.endDate
      })
    );
  }
  return list;
}

export function monthSummary(bills, year, month) {
  const ofMonth = bills.filter((b) => sameMonth(b.dueDate, year, month)).map(withStatus);
  const paid = ofMonth.filter((b) => b.status === "paga");
  const pending = ofMonth.filter((b) => b.status === "pendente");
  const overdue = ofMonth.filter((b) => b.status === "atrasada");
  const sum = (arr) => arr.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
  return {
    paid: sum(paid),
    pending: sum(pending),
    overdue: sum(overdue),
    total: sum(ofMonth),
    count: ofMonth.length
  };
}

export function filterBills(bills, filter, year, month) {
  return bills
    .map(withStatus)
    .filter((b) => sameMonth(b.dueDate, year, month))
    .filter((b) => {
      if (filter === "todas") return true;
      if (filter === "pagar") return b.status === "pendente";
      if (filter === "pagas") return b.status === "paga";
      if (filter === "atrasadas") return b.status === "atrasada";
      return true;
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}

export function categoryHistory(bills, year, month) {
  const ofMonth = bills.filter((b) => sameMonth(b.dueDate, year, month));
  const map = {};
  ofMonth.forEach((b) => {
    const key = b.category || "outros";
    if (!map[key]) map[key] = { category: key, paid: 0, pending: 0, overdue: 0, total: 0 };
    const status = computeStatus(b);
    const amount = Number(b.amount) || 0;
    map[key].total += amount;
    if (status === "paga") map[key].paid += amount;
    else if (status === "atrasada") map[key].overdue += amount;
    else map[key].pending += amount;
  });
  return Object.values(map).sort((a, b) => b.total - a.total);
}

export function availableMonths(bills) {
  const set = new Set();
  bills.forEach((b) => {
    if (b.dueDate) set.add(b.dueDate.slice(0, 7));
  });
  const now = todayISO().slice(0, 7);
  set.add(now);
  return Array.from(set).sort().reverse();
}

export function extendEndlessBills(bills) {
  const groups = {};
  bills.forEach((b) => {
    if (b.recurrence === "fixa" && b.endless) {
      if (!groups[b.groupId]) groups[b.groupId] = [];
      groups[b.groupId].push(b);
    }
  });
  const extra = [];
  Object.values(groups).forEach((list) => {
    const last = [...list].sort((a, b) => a.dueDate.localeCompare(b.dueDate)).pop();
    const horizon = addMonths(todayISO(), 18);
    if (last && last.dueDate < horizon) {
      let cursor = last.dueDate;
      while (cursor < horizon) {
        cursor = addMonths(cursor, 1);
        extra.push(
          withStatus({
            ...last,
            id: uid("bill"),
            dueDate: cursor,
            paid: false,
            createdAt: new Date().toISOString()
          })
        );
      }
    }
  });
  return extra.length ? [...bills, ...extra] : bills;
}
