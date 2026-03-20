/* eslint-disable react/prop-types */
export function BillingHero({ billingCycle, onBillingCycleChange, specialDiscountText }) {
  return (
    <section style={{ textAlign: "center", padding: "28px 0 20px" }}>
      <h1 style={{ margin: "0 0 12px", fontSize: "clamp(34px, 5vw, 56px)", lineHeight: 1.02, fontWeight: 600, color: "#111827", letterSpacing: "-0.04em" }}>
        Our Pricing Plan
      </h1>
      <p style={{ maxWidth: 700, margin: "0 auto", fontSize: "clamp(16px, 2vw, 18px)", lineHeight: 1.4, color: "#6B7280", fontWeight: 500 }}>
        Choose the plan that fits your needs. You can always update it later.
      </p>

      <div style={{ position: "relative", display: "inline-flex", alignItems: "center", marginTop: 32, justifyContent: "center", width: 400, maxWidth: "100%", isolation: "isolate" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 0, padding: 4, borderRadius: 12, border: "1px solid #E5E7EB", background: "#ffffff", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)", height: 56, position: "relative", zIndex: 5 }}>
          <button type="button" aria-pressed={billingCycle === "monthly"} onClick={() => onBillingCycleChange("monthly")} style={{ appearance: "none", WebkitAppearance: "none", minWidth: 92, border: "none", borderRadius: 8, padding: "10px 18px", background: billingCycle === "monthly" ? "#EEF2FF" : "transparent", color: billingCycle === "monthly" ? "#4338CA" : "#6B7280", fontSize: 16, fontWeight: 700, cursor: "pointer", position: "relative", zIndex: 3 }}>
            Monthly
          </button>
          <button type="button" aria-pressed={billingCycle === "yearly"} onClick={() => onBillingCycleChange("yearly")} style={{ appearance: "none", WebkitAppearance: "none", minWidth: 92, border: "none", borderRadius: 8, padding: "10px 18px", background: billingCycle === "yearly" ? "#EEF2FF" : "transparent", color: billingCycle === "yearly" ? "#4338CA" : "#6B7280", fontSize: 16, fontWeight: 700, cursor: "pointer", position: "relative", zIndex: 3 }}>
            Yearly <span style={{ color: "#D1D5DB" }}>●</span>
          </button>
        </div>
        <div style={{ position: "absolute", right: -38, top: 26, transform: "rotate(8deg)", background: "#4F46E5", color: "#fff", borderRadius: 12, padding: 4, fontSize: 12, fontWeight: 800, lineHeight: 1.15, boxShadow: "0 12px 24px rgba(79, 70, 229, 0.22)", pointerEvents: "none", zIndex: 1 }}>
          <div style={{ border: "1px solid rgba(255,255,255,0.9)", borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
            {specialDiscountText ? specialDiscountText.toUpperCase() : "LIMITED TIME OFFER"}
            <br />
            60% OFF
          </div>
        </div>
      </div>
    </section>
  );
}
