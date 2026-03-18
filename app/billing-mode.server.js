function parseBooleanEnv(value, defaultValue) {
  if (value == null || value === "") return defaultValue;

  const normalized = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;

  return defaultValue;
}

export const SHOPIFY_BILLING_TEST_MODE = parseBooleanEnv(
  process.env.SHOPIFY_BILLING_TEST_MODE,
  true,
);

