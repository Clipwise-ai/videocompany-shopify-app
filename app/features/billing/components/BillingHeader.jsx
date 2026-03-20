/* eslint-disable react/prop-types */
export function BillingHeader({ currentPlan, showLinkedAccountGate, subscribeQuery }) {
  return (
    <section style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 28, lineHeight: 1.1, fontWeight: 700, color: "#111827" }}>Billing</div>
      {currentPlan && !showLinkedAccountGate ? (
        <a href={`/app/billing?cancel=1&${subscribeQuery}`} style={{ textDecoration: "none" }}>
          <button type="button" style={{ height: 42, borderRadius: 999, border: "1px solid #FCA5A5", background: "#FEF2F2", color: "#B91C1C", padding: "0 16px", fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            Cancel current plan
          </button>
        </a>
      ) : null}
    </section>
  );
}
