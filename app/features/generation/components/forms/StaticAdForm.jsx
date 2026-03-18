/* eslint-disable react/prop-types */
import { Text } from "@shopify/polaris";
import { LANGUAGES } from "../../constants";
import { fieldStyle, rowBtnStyle, textareaStyle } from "../../styles";
import { ProductImageRow } from "../ProductImageRow";

export function StaticAdForm({ product, form, setField }) {
  return (
    <>
      <ProductImageRow product={product} />

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
        <select value={form.adFormat} onChange={(event) => setField("adFormat", event.target.value)} style={fieldStyle}>
          <option value="square">Square</option>
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
        </select>
        <select value={form.adType} onChange={(event) => setField("adType", event.target.value)} style={fieldStyle}>
          <option value="product_focused">Product focused</option>
          <option value="lifestyle">Lifestyle</option>
          <option value="promotional">Promotional</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <select value={form.variation} onChange={(event) => setField("variation", Number(event.target.value))} style={fieldStyle}>
          {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>Variations - {count}</option>)}
        </select>
        <select value={form.language} onChange={(event) => setField("language", event.target.value)} style={fieldStyle}>
          {LANGUAGES.map((language) => <option key={language} value={language}>{language}</option>)}
        </select>
      </div>

      <button type="button" style={rowBtnStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>📎</span><Text variant="bodySm" fontWeight="medium">Select reference ad (Optional)</Text>
        </div>
        <span style={{ color: "#6b7280" }}>+</span>
      </button>

      <div>
        <Text variant="bodySm" tone="subdued">Custom instructions (Optional)</Text>
        <textarea
          value={form.customInstructions}
          onChange={(event) => setField("customInstructions", event.target.value)}
          placeholder="e.g., Use bright colors, focus on sustainability, include CTA"
          rows={2}
          style={{ ...textareaStyle, marginTop: "6px" }}
        />
      </div>
    </>
  );
}
