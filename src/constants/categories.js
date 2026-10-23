export const CATEGORIES = [
  { id: "moradia", label: "Moradia", icon: "home-outline", color: "#60A5FA" },
  { id: "alimentacao", label: "Alimentacao", icon: "restaurant-outline", color: "#F59E0B" },
  { id: "cartao", label: "Cartao", icon: "card-outline", color: "#E50914" },
  { id: "saude", label: "Saude", icon: "medkit-outline", color: "#22C55E" },
  { id: "lazer", label: "Lazer", icon: "game-controller-outline", color: "#A78BFA" },
  { id: "transporte", label: "Transporte", icon: "car-outline", color: "#38BDF8" },
  { id: "educacao", label: "Educacao", icon: "school-outline", color: "#FB7185" },
  { id: "servicos", label: "Servicos", icon: "construct-outline", color: "#94A3B8" },
  { id: "internet", label: "Internet", icon: "wifi-outline", color: "#34D399" },
  { id: "outros", label: "Outros", icon: "ellipsis-horizontal-outline", color: "#A1A1AA" }
];

export const NOTIFY_OPTIONS = [
  { id: "due", label: "No dia do vencimento", days: 0 },
  { id: "1d", label: "1 dia antes", days: 1 },
  { id: "2d", label: "2 dias antes", days: 2 },
  { id: "3d", label: "3 dias antes", days: 3 },
  { id: "7d", label: "1 semana antes", days: 7 }
];

export const RECURRENCE_TYPES = [
  { id: "unica", label: "Conta unica" },
  { id: "fixa", label: "Fixa / mensal" },
  { id: "parcelada", label: "Parcelada" }
];

export function getCategory(id) {
  return CATEGORIES.find((item) => item.id === id) || CATEGORIES[CATEGORIES.length - 1];
}
