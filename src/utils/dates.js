export const pad = n => String(n).padStart(2, '0');
export const localDateKey = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
export const todayKey = () => localDateKey(new Date());
export function parseDate(value) {
  const [y, m, d] = String(value || '').split('-').map(Number);
  return new Date(y || 2000, (m || 1)-1, d || 1, 12, 0, 0);
}
export function money(value) {
  return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
export function isOverdue(bill) {
  return bill.status !== 'paid' && bill.dueDate < todayKey();
}
export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}`;
}
export function monthLabel(key) {
  const [y,m] = key.split('-').map(Number);
  return new Date(y, m-1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}
export function generateOccurrences(form) {
  const base = parseDate(form.dueDate);
  const amount = Number(String(form.amount).replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Informe um valor maior que zero.');
  if (!form.title.trim()) throw new Error('Informe o nome da conta.');
  const count = form.recurrence === 'installments' ? Math.max(1, Math.min(120, Number(form.installments) || 1))
    : form.recurrence === 'monthly' ? (form.endDate ? Math.max(1, Math.min(120, monthDiff(base, parseDate(form.endDate)) + 1)) : 24)
    : 1;
  const total = form.recurrence === 'installments' ? count : null;
  const idBase = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base.getFullYear(), base.getMonth() + i, Math.min(base.getDate(), new Date(base.getFullYear(), base.getMonth()+i+1, 0).getDate()), 12);
    return {
      id: `${idBase}-${i}`, groupId: idBase, title: form.title.trim(),
      amount: Math.round(amount * 100) / 100, category: form.category,
      dueDate: localDateKey(d), status: 'pending', recurrence: form.recurrence,
      installmentNumber: total ? i+1 : null, installmentTotal: total,
      paymentCode: form.paymentCode.trim(), notes: form.notes.trim(),
      notifyDays: Number(form.notifyDays), notifyTime: form.notifyTime || '08:00',
      notificationId: null, createdAt: new Date().toISOString()
    };
  });
}
function monthDiff(a,b) { return (b.getFullYear()-a.getFullYear())*12 + b.getMonth()-a.getMonth(); }
