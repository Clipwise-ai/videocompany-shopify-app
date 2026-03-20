/* eslint-disable react/prop-types */
import { colors } from "../../styles";

export function VideoToTextScriptPanel({ form, isGenerating }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", borderRadius: "8px", border: `1px solid ${colors.border}`, background: "#f9fafb", padding: "12px", flex: 1, minHeight: "180px" }}>
      <h3 style={{ margin: 0, fontSize: "12px", fontWeight: 500, color: "#111827", flexShrink: 0 }}>Script</h3>
      <div style={{ marginTop: "8px", flex: 1, display: "flex", flexDirection: "column", borderRadius: "6px", border: `1px solid ${colors.border}`, background: "#fff", padding: "8px" }}>
        {form.generatedScript ? (
          <textarea readOnly value={form.generatedScript} style={{ height: "100%", minHeight: "120px", width: "100%", resize: "none", border: "none", background: "transparent", padding: 0, fontSize: "14px", lineHeight: "20px", color: "#111827", outline: "none", fontFamily: "inherit" }} />
        ) : (
          <div style={{ display: "flex", height: "100%", minHeight: "120px", alignItems: "center", justifyContent: "center" }}>
            {isGenerating ? <p style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563" }}>Processing... (GENERATING)</p> : null}
          </div>
        )}
      </div>
      <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", flexShrink: 0 }}>
        <button disabled={!form.generatedScript} type="button" style={{ display: "inline-flex", height: "36px", alignItems: "center", justifyContent: "center", gap: "8px", borderRadius: "8px", border: `1px solid ${colors.border}`, padding: "0 12px", fontSize: "12px", fontWeight: 500, background: form.generatedScript ? "#fff" : "#f3f4f6", color: form.generatedScript ? "#374151" : "#9ca3af", cursor: form.generatedScript ? "pointer" : "not-allowed" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          Copy script
        </button>
        <button disabled={!form.generatedScript} type="button" style={{ display: "inline-flex", height: "36px", alignItems: "center", justifyContent: "center", borderRadius: "8px", border: `1px solid ${colors.border}`, padding: "0 12px", fontSize: "12px", fontWeight: 500, background: form.generatedScript ? "#fff" : "#f3f4f6", color: form.generatedScript ? "#374151" : "#9ca3af", cursor: form.generatedScript ? "pointer" : "not-allowed" }}>
          Create UGC
        </button>
      </div>
    </div>
  );
}
