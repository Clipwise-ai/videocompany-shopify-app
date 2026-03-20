/* eslint-disable react/prop-types */
import { ENTERPRISE_FEATURES } from "../utils/pricing";

function FeatureList({ features, accent = { bg: "#EEF2FF", color: "#4338CA" } }) {
  return (
    <ul style={{ display: "flex", flexDirection: "column", gap: 14, margin: 0, padding: 0, listStyle: "none", flexGrow: 1 }}>
      {features.map((feature) => (
        <li key={feature} style={{ display: "flex", alignItems: "start", gap: 12, color: "#4B5563", fontSize: 16, lineHeight: 1.6 }}>
          <span aria-hidden="true" style={{ marginTop: 4, width: 20, height: 20, minWidth: 20, borderRadius: 999, background: accent.bg, color: accent.color, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800 }}>✓</span>
          <span>{feature}</span>
        </li>
      ))}
    </ul>
  );
}

function PlanCard({ plan, baseQuery }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: "100%" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 384, padding: "12px 12px", height: "100%" }}>
        {plan.isPopular ? (
          <div style={{ position: "absolute", top: -4, right: 40, zIndex: 2 }}>
            <div style={{ background: "#ffffff", border: "1px solid #C7D2FE", borderRadius: 10, padding: 3, boxShadow: "0 8px 20px rgba(17, 24, 39, 0.06)" }}>
              <div style={{ background: "#4F46E5", color: "#ffffff", borderRadius: 8, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>Cheapest price</div>
            </div>
          </div>
        ) : null}

        <div style={{ height: "100%", background: "#ffffff", color: "#111827", border: "2px solid #E5E7EB", borderRadius: 40, boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)", padding: "34px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ marginLeft: "auto", background: "#F5F7FF", color: "#5B6BCF", fontSize: 14, fontWeight: 500, borderRadius: 18, padding: "8px 16px", border: "1px solid #C7D2FE" }}>{plan.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "end", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 600, letterSpacing: "-0.05em" }}>${plan.priceDisplay}</span>
              <span style={{ fontSize: 28, lineHeight: 1, fontWeight: 500, color: "#6B7280" }}>/mo</span>
            </div>
            <div style={{ color: "#374151", fontSize: 16, fontWeight: 600, marginTop: -4 }}>{plan.description}</div>
            {plan.yearlyTotalDisplay ? <div style={{ color: "#6B7280", fontSize: 14, lineHeight: 1.4 }}>(Billed <span style={{ fontWeight: 700 }}>${plan.yearlyTotalDisplay}</span> yearly)</div> : null}
          </div>

          <div style={{ width: "100%", display: "flex", justifyContent: "center", marginTop: 2 }}>
            {plan.isCurrent ? (
              <button type="button" disabled style={{ width: "100%", height: 48, borderRadius: 999, border: "2px solid #E5E7EB", background: "#F3F4F6", color: "#9CA3AF", fontSize: 16, fontWeight: 500, cursor: "not-allowed" }}>Current Plan</button>
            ) : plan.isLocked ? (
              <button type="button" onClick={() => window.location.assign(`/app?${baseQuery}`)} style={{ width: "100%", height: 48, borderRadius: 999, border: "2px solid #F59E0B", background: "#FFF7ED", color: "#B45309", fontSize: 16, fontWeight: 600, cursor: "pointer" }}>Login to continue</button>
            ) : (
              <a href={plan.subscribeHref} style={{ display: "block", width: "100%", textDecoration: "none" }}>
                <button type="button" style={{ width: "100%", height: 48, borderRadius: 999, border: plan.isPopular ? "2px solid #4F46E5" : "2px solid #C7D2FE", background: plan.isPopular ? "#4F46E5" : "#ffffff", color: plan.isPopular ? "#ffffff" : "#4F46E5", fontSize: 16, fontWeight: plan.isPopular ? 700 : 500, cursor: "pointer" }}>
                  {plan.isPopular ? "Subscribe" : `Upgrade to ${plan.label}`}
                </button>
              </a>
            )}
          </div>

          <FeatureList features={plan.features} />
        </div>
      </div>
    </div>
  );
}

function EnterpriseCard() {
  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%", maxWidth: "100%" }}>
      <div style={{ position: "relative", width: "100%", maxWidth: 384, padding: "12px 12px", height: "100%" }}>
        <div style={{ height: "100%", background: "#ffffff", color: "#111827", border: "2px solid #E5E7EB", borderRadius: 40, boxShadow: "0 1px 3px rgba(15, 23, 42, 0.06)", padding: "34px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ marginLeft: "auto", background: "#F3F4F6", color: "#6B7280", fontSize: 14, fontWeight: 500, borderRadius: 18, padding: "8px 16px", border: "1px solid #E5E7EB" }}>Enterprise</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "end", gap: 6, flexWrap: "wrap" }}>
              <span style={{ visibility: "hidden", fontSize: 20, fontWeight: 500 }}>$0/mo</span>
              <span style={{ fontSize: 56, lineHeight: 0.95, fontWeight: 600, letterSpacing: "-0.05em" }}>Custom</span>
            </div>
            <div style={{ color: "#374151", fontSize: 16, fontWeight: 600, marginTop: -4 }}>*Tailored for your organization</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7280", fontSize: 16 }}>
              <span style={{ marginRight: 8 }}>✉</span>
              <span>sales@videocompany.ai</span>
            </div>
            <a href="https://calendly.com/centraclienta/new-meeting" target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", textDecoration: "none" }}>
              <button type="button" style={{ width: "100%", height: 48, borderRadius: 999, border: "2px solid #C7D2FE", background: "#ffffff", color: "#4F46E5", fontSize: 16, fontWeight: 500, cursor: "pointer" }}>Contact us</button>
            </a>
          </div>
          <FeatureList features={ENTERPRISE_FEATURES} accent={{ bg: "#EFF6FF", color: "#60A5FA" }} />
        </div>
      </div>
    </div>
  );
}

export function BillingPlanCards({ planCards, showDesktopThreeColumnLayout, baseQuery }) {
  const pricingLayoutStyle = showDesktopThreeColumnLayout
    ? { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", justifyItems: "center", alignItems: "stretch", gap: 0, marginTop: 56 }
    : { display: "flex", justifyContent: "center", flexWrap: "wrap", alignItems: "stretch", gap: 0, marginTop: 56 };

  return (
    <section style={pricingLayoutStyle}>
      {planCards.map((plan) => (
        <PlanCard key={plan.key} plan={plan} baseQuery={baseQuery} />
      ))}
      <EnterpriseCard />
    </section>
  );
}
