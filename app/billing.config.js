import { BillingInterval } from "@shopify/shopify-app-react-router/server";
import { SHOPIFY_BILLING_TEST_MODE } from "./billing-mode.server";

export const FREE_PLAN = "free";
export const STARTER_MONTHLY_PLAN = "starter_monthly";
export const CREATOR_MONTHLY_PLAN = "creator_monthly";
export const STARTER_YEARLY_PLAN = "starter_yearly";
export const CREATOR_YEARLY_PLAN = "creator_yearly";

function parsePlanAmount(envKey, testFallbackAmount) {
  const raw = process.env[envKey];

  if (raw != null && raw !== "") {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      throw new Error(`${envKey} must be a positive number.`);
    }
    return parsed;
  }

  if (SHOPIFY_BILLING_TEST_MODE) {
    return testFallbackAmount;
  }

  throw new Error(
    `${envKey} must be configured when SHOPIFY_BILLING_TEST_MODE=false.`,
  );
}

function parseOptionalAmount(envKey, fallbackAmount) {
  const raw = process.env[envKey];
  if (raw == null || raw === "") {
    return fallbackAmount;
  }

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${envKey} must be a positive number.`);
  }

  return parsed;
}

export const SHOPIFY_BILLING_PLANS = {
  [STARTER_MONTHLY_PLAN]: {
    label: "Starter",
    backendPlanKey: "starter_monthly",
    amount: parsePlanAmount("SHOPIFY_STARTER_MONTHLY_PRICE", 0.1),
    yearlyAmount: parseOptionalAmount("SHOPIFY_STARTER_YEARLY_MONTHLY_EQUIVALENT", 0.04),
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    description: "For smaller brands getting started with AI video generation.",
    features: [
      "Up to 15 videos per month",
      "315 credits / month",
      "UGC + product flows",
      "Shopify embedded access",
    ],
  },
  [STARTER_YEARLY_PLAN]: {
    label: "Starter",
    backendPlanKey: "starter_yearly",
    amount: parsePlanAmount("SHOPIFY_STARTER_YEARLY_PRICE", 0.48),
    yearlyAmount: parseOptionalAmount("SHOPIFY_STARTER_YEARLY_MONTHLY_EQUIVALENT", 0.04),
    currencyCode: "USD",
    interval: BillingInterval.Annual,
    description: "For smaller brands getting started with AI video generation.",
    features: [
      "Up to 15 videos per month",
      "315 credits / month",
      "UGC + product flows",
      "Shopify embedded access",
    ],
  },
  [CREATOR_MONTHLY_PLAN]: {
    label: "Creator",
    backendPlanKey: "creator_monthly",
    amount: parsePlanAmount("SHOPIFY_CREATOR_MONTHLY_PRICE", 0.2),
    yearlyAmount: parseOptionalAmount("SHOPIFY_CREATOR_YEARLY_MONTHLY_EQUIVALENT", 0.08),
    currencyCode: "USD",
    interval: BillingInterval.Every30Days,
    description: "For higher-volume Shopify brands running frequent campaigns.",
    features: [
      "Up to 65 videos per month",
      "1275 credits / month",
      "Everything in Starter",
      "Priority generation support",
    ],
  },
  [CREATOR_YEARLY_PLAN]: {
    label: "Creator",
    backendPlanKey: "creator_yearly",
    amount: parsePlanAmount("SHOPIFY_CREATOR_YEARLY_PRICE", 0.96),
    yearlyAmount: parseOptionalAmount("SHOPIFY_CREATOR_YEARLY_MONTHLY_EQUIVALENT", 0.08),
    currencyCode: "USD",
    interval: BillingInterval.Annual,
    description: "For higher-volume Shopify brands running frequent campaigns.",
    features: [
      "Up to 65 videos per month",
      "1275 credits / month",
      "Everything in Starter",
      "Priority generation support",
    ],
  },
};

export const SHOPIFY_PAID_PLAN_KEYS = Object.keys(SHOPIFY_BILLING_PLANS);
