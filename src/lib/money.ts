import type { Currency } from "./types";

export const PLATFORM_FEE_RATE = 0.1; // AmplyGo keeps 10% - ver Perguntas e questionamentos, pergunta 7

export const CURRENCIES: Currency[] = ["USD", "EUR", "BRL"];

export const CURRENCY_LABEL: Record<Currency, string> = {
  USD: "US Dollar ($)",
  EUR: "Euro (€)",
  BRL: "Real (R$)",
};

// Static, approximate FX rates relative to 1 USD. There is no live exchange
// feed in this MVP — update these here if you need fresher numbers. All three
// currencies use 2 decimal subunits, so integer "cents" convert with the same
// ratio math.
const RATE_PER_USD: Record<Currency, number> = {
  USD: 1,
  EUR: 0.92,
  BRL: 5.4,
};

const LOCALE: Record<Currency, string> = {
  USD: "en-US",
  EUR: "de-DE",
  BRL: "pt-BR",
};

export function centsToDollars(cents: number): number {
  return cents / 100;
}

/** Convert an integer amount (minor units) between currencies via a USD base. */
export function convertCents(cents: number | null | undefined, from: Currency, to: Currency): number {
  const value = cents ?? 0;
  if (from === to) return value;
  return Math.round((value / RATE_PER_USD[from]) * RATE_PER_USD[to]);
}

export function formatCents(cents: number | null | undefined, currency: Currency = "USD"): string {
  const value = (cents ?? 0) / 100;
  return value.toLocaleString(LOCALE[currency], { style: "currency", currency });
}

/** Convert from a source currency and format in the target currency, in one step. */
export function formatConverted(
  cents: number | null | undefined,
  from: Currency,
  to: Currency
): string {
  return formatCents(convertCents(cents, from, to), to);
}

export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100);
}

/** Estimated max views a budget can pay for, at a given CPM. */
export function estimatedViews(budgetCents: number, cpmCents: number): number {
  if (cpmCents <= 0) return 0;
  return Math.floor((budgetCents / cpmCents) * 1000);
}

/** Gross cost charged to the company for a number of views at a CPM. */
export function grossCostCents(views: number, cpmCents: number): number {
  return Math.round((views / 1000) * cpmCents);
}

export interface Split {
  grossCents: number;
  creatorNetCents: number;
  platformFeeCents: number;
}

/** Splits the gross CPM cost into creator payout (90%) and AmplyGo fee (10%). */
export function splitPayment(views: number, cpmCents: number): Split {
  const grossCents = grossCostCents(views, cpmCents);
  const platformFeeCents = Math.round(grossCents * PLATFORM_FEE_RATE);
  const creatorNetCents = grossCents - platformFeeCents;
  return { grossCents, creatorNetCents, platformFeeCents };
}
