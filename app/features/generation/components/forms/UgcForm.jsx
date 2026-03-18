/* eslint-disable react/prop-types, jsx-a11y/label-has-associated-control */
import { Text } from "@shopify/polaris";
import { LANGUAGES } from "../../constants";
import { fieldStyle, rowBtnStyle, textareaStyle } from "../../styles";
import { ProductImageRow } from "../ProductImageRow";

export function UgcForm({ product, form, setField }) {
  return (
    <>
      <ProductImageRow product={product} />

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <Text variant="bodySm" fontWeight="semibold">Add script</Text>
          <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#374151", cursor: "pointer" }}>
            Generate subtitles
            <span
              role="switch"
              aria-checked={form.subtitles}
              tabIndex={0}
              onClick={() => setField("subtitles", !form.subtitles)}
              onKeyDown={(event) => event.key === "Enter" && setField("subtitles", !form.subtitles)}
              style={{
                display: "inline-block", width: "36px", height: "20px", borderRadius: "10px",
                background: form.subtitles ? "#3b5bdb" : "#d1d5db", position: "relative", cursor: "pointer", transition: "background 0.2s",
              }}
            >
              <span style={{
                position: "absolute", top: "3px", left: form.subtitles ? "18px" : "3px",
                width: "14px", height: "14px", borderRadius: "50%", background: "white", transition: "left 0.2s",
              }} />
            </span>
          </label>
        </div>
        <textarea
          value={form.script}
          onChange={(event) => setField("script", event.target.value)}
          placeholder="Enter your script here..."
          rows={4}
          style={textareaStyle}
        />
      </div>

      <div>
        <Text variant="bodySm" fontWeight="semibold">Directive instructions</Text>
        <textarea
          value={form.directives}
          onChange={(event) => setField("directives", event.target.value)}
          placeholder="(Optional) Directions like camera movement, pacing, transitions, or overall visual style"
          rows={2}
          style={{ ...textareaStyle, marginTop: "6px" }}
        />
      </div>

      <div>
        <Text variant="bodySm" tone="subdued">Product description (Optional)</Text>
        <textarea
          value={form.productDescription}
          onChange={(event) => setField("productDescription", event.target.value)}
          placeholder="Describe the product and its features for better results..."
          rows={2}
          style={{ ...textareaStyle, marginTop: "6px" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <select value={form.language} onChange={(event) => setField("language", event.target.value)} style={fieldStyle}>
          {LANGUAGES.map((language) => <option key={language} value={language}>{language}</option>)}
        </select>
        <button type="button" style={rowBtnStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🎤</span><Text variant="bodySm" fontWeight="medium">Select voice</Text>
          </div>
          <span style={{ color: "#6b7280" }}>+</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button type="button" style={rowBtnStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>👤</span><Text variant="bodySm" fontWeight="medium">Select actor</Text>
          </div>
          <span style={{ color: "#6b7280" }}>+</span>
        </button>
        <button type="button" style={rowBtnStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🖼️</span><Text variant="bodySm" fontWeight="medium">Select location</Text>
          </div>
          <span style={{ color: "#6b7280" }}>+</span>
        </button>
      </div>
    </>
  );
}
