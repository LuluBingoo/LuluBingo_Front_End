export type CurrencySetting = "birr" | "usd" | "eur";

const CURRENCY_TO_ISO: Record<CurrencySetting, string> = {
  birr: "ETB",
  usd: "USD",
  eur: "EUR",
};

const CURRENCY_LABEL: Record<CurrencySetting, string> = {
  birr: "ETB",
  usd: "USD",
  eur: "EUR",
};

export const normalizeCurrency = (value: unknown): CurrencySetting => {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "usd" || normalized === "eur" || normalized === "birr") {
    return normalized;
  }
  return "birr";
};

export const getCurrencySetting = (): CurrencySetting => {
  return normalizeCurrency(localStorage.getItem("currency"));
};

export const setCurrencySetting = (value: unknown) => {
  const normalized = normalizeCurrency(value);
  localStorage.setItem("currency", normalized);
  return normalized;
};

export const getCurrencyLabel = (value?: unknown): string => {
  const currency = value ? normalizeCurrency(value) : getCurrencySetting();
  return CURRENCY_LABEL[currency];
};

export const formatCurrency = (
  amount: string | number,
  value?: unknown,
): string => {
  const currency = value ? normalizeCurrency(value) : getCurrencySetting();
  const numeric = Number.parseFloat(String(amount));
  const safeAmount = Number.isFinite(numeric) ? numeric : 0;

  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: CURRENCY_TO_ISO[currency],
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
};
