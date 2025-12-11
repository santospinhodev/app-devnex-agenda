const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const formatCurrency = (value: string | number) => {
  const numeric = typeof value === "number" ? value : Number(value);
  if (Number.isNaN(numeric)) {
    return "R$ 0,00";
  }
  return currencyFormatter.format(numeric);
};

export const formatDuration = (minutes: number) => {
  if (!Number.isFinite(minutes)) {
    return "-";
  }
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;
  if (hours <= 0) {
    return `${remaining} min`;
  }
  if (remaining === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remaining}m`;
};

export const normalizeCurrencyInput = (input: string) => {
  if (!input) {
    return "";
  }
  const digits = input.replace(/[^0-9.,]/g, "").replace(/,/g, ".");
  const parts = digits.split(".");
  if (parts.length === 1) {
    return parts[0];
  }
  const integer = parts.shift() ?? "0";
  const decimals = parts.join("");
  return `${integer}.${decimals}`;
};

export const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
};

export const extractInitials = (name: string) => {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join("");
};
