/* eslint-disable react/prop-types */
import { Text } from "@shopify/polaris";
import { ASPECT_RATIOS } from "../../constants";
import { fieldStyle, rowBtnStyle, textareaStyle } from "../../styles";
import { ProductImageRow } from "../ProductImageRow";

export function ModelShootForm({ product, form, setField }) {
  return (
    <>
      <ProductImageRow product={product} />

      <div>
        <Text variant="bodySm" tone="subdued">Product description (Optional)</Text>
        <textarea
          value={form.productDescription}
          onChange={(event) => setField("productDescription", event.target.value)}
          placeholder="Describe the product and its features for better results..."
          rows={3}
          style={{ ...textareaStyle, marginTop: "6px" }}
        />
      </div>

      <button type="button" style={rowBtnStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🖼️</span><Text variant="bodySm" fontWeight="medium">Select location</Text>
        </div>
        <span style={{ fontSize: "18px", color: "#6b7280", lineHeight: 1 }}>+</span>
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <button type="button" style={rowBtnStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>👤</span><Text variant="bodySm" fontWeight="medium">Select model</Text>
          </div>
          <span style={{ color: "#6b7280" }}>+</span>
        </button>
        <button type="button" style={rowBtnStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span>📷</span><Text variant="bodySm" fontWeight="medium">Select pose</Text>
          </div>
          <span style={{ color: "#6b7280" }}>+</span>
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <select value={form.variation} onChange={(event) => setField("variation", Number(event.target.value))} style={fieldStyle}>
          {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>No of Variation - {count}</option>)}
        </select>
        <select value={form.aspectRatio} onChange={(event) => setField("aspectRatio", event.target.value)} style={fieldStyle}>
          {ASPECT_RATIOS.map((ratio) => <option key={ratio.value} value={ratio.value}>{ratio.label}</option>)}
        </select>
      </div>

      <textarea
        value={form.customInstructions}
        onChange={(event) => setField("customInstructions", event.target.value)}
        placeholder="(Optional) Directions like camera movement, pacing or overall visual style"
        rows={2}
        style={textareaStyle}
      />
    </>
  );
}
