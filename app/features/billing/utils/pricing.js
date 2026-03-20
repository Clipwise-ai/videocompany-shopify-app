export const PLAN_LABELS = {
  lite_v2: "Starter",
  starter: "Starter",
  pro_v2: "Creator",
  creator: "Creator",
  studio_v2: "Business",
};

export const ENTERPRISE_FEATURES = [
  "Dedicated creative manager",
  "Dedicated video editor",
  "Fully managed creative execution",
  "Custom actors & voices",
  "Custom ad formats & templates",
  "High-volume campaign support",
  "API & workflow integrations",
  "Done-for-you delivery",
];

export function normalizePlanKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/_v\d+$/, "")
    .replace(/\s+/g, "_");
}

export function toNumber(value) {
  if (value == null) return null;
  if (typeof value === "string" && value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPriceValue(value) {
  const numericValue = toNumber(value);
  if (numericValue == null) return "0";
  return Number.isInteger(numericValue)
    ? numericValue.toString()
    : numericValue.toFixed(2).replace(/\.?0+$/, "");
}

export function buildFeaturesForPlan(plan) {
  const normalizedKey = normalizePlanKey(plan?.name || plan?.id);

  if (normalizedKey === "lite" || normalizedKey === "starter") {
    return [
      `${plan.credit_units} credits / month`,
      "Video length: Upto 2 min",
      "UGC videos (product + AI actor)",
      "Talking avatar videos (1000+ actors)",
      "Product shoot images & videos",
      "Model + product shoots (200+ poses)",
      "No watermark",
    ];
  }

  if (normalizedKey === "pro" || normalizedKey === "creator") {
    return [
      `${plan.credit_units} credits / month`,
      "Everything in Starter",
      "Video length: Upto 5 min",
      "Custom actor creation",
      "Brand-specific actor & asset curation",
      "Advanced Ad Agent (high-converting formats)",
      "On-demand actor additions",
      "Priority on-call support",
      "Faster rendering",
    ];
  }

  return [
    `${plan.credit_units} credits / month`,
    `~${plan.approx_videos} videos/month`,
    "Priority generation",
    "Priority support within one hour",
    "General commercial terms",
  ];
}

export function findBackendPlanForKey({
  backendProducts,
  billingCycle,
  planKey,
  planConfig,
}) {
  const normalizedLabel = normalizePlanKey(planConfig?.label);
  return (
    backendProducts.find((product) => {
      const cycleKey =
        billingCycle === "yearly"
          ? product?.shopify_plan_key_yearly
          : product?.shopify_plan_key_monthly;
      return cycleKey === planKey;
    }) ||
    backendProducts.find((product) => normalizePlanKey(product?.name) === normalizedLabel) ||
    null
  );
}

export function buildPlanCards({
  activePlanKeys,
  billingPlans,
  backendProducts,
  billingCycle,
  displayCurrentPlanKey,
  hasLinkedCompany,
  hasAuthenticatedIframeSession,
  backendSubscription,
  currentPlan,
  recommendedPlan,
  showLinkedAccountGate,
}) {
  return activePlanKeys.map((planKey, index) => {
    const plan = billingPlans[planKey];
    const backendPlan = findBackendPlanForKey({
      backendProducts,
      billingCycle,
      planKey,
      planConfig: plan,
    });
    const isCurrent =
      hasLinkedCompany &&
      hasAuthenticatedIframeSession &&
      displayCurrentPlanKey === planKey &&
      Boolean(backendSubscription || currentPlan);
    const isPopular = backendPlan
      ? normalizePlanKey(backendPlan.name) === recommendedPlan
      : index === 1;
    const displayAmount = backendPlan
      ? billingCycle === "yearly"
        ? toNumber(backendPlan.yearly_per_month_price) ?? toNumber(plan.yearlyAmount) ?? toNumber(plan.amount) / 12
        : toNumber(backendPlan.monthly_discounted_price) ?? toNumber(backendPlan.monthly_price) ?? toNumber(plan.amount)
      : billingCycle === "yearly"
        ? toNumber(plan.yearlyAmount) ?? toNumber(plan.amount) / 12
        : toNumber(plan.amount);
    const yearlyTotal = backendPlan
      ? billingCycle === "yearly"
        ? toNumber(backendPlan.yearly_discounted_price) ?? toNumber(backendPlan.yearly_price)
        : null
      : billingCycle === "yearly"
        ? toNumber(plan.amount)
        : null;

    return {
      key: planKey,
      label:
        backendPlan?.shopify_display_plan_name ||
        backendPlan?.display_name ||
        PLAN_LABELS[normalizePlanKey(backendPlan?.name)] ||
        plan.label,
      priceDisplay: formatPriceValue(displayAmount),
      yearlyTotalDisplay: yearlyTotal == null ? null : formatPriceValue(yearlyTotal),
      description: `*Up to ${backendPlan?.approx_videos || (plan.label === "Starter" ? 15 : 65)} Videos per month`,
      features: backendPlan ? buildFeaturesForPlan(backendPlan) : plan.features,
      isCurrent,
      isPopular,
      isLocked: showLinkedAccountGate,
    };
  });
}
