/* eslint-disable react/prop-types */
import { Text } from "@shopify/polaris";
import { ASPECT_RATIOS } from "../../constants";
import { fieldStyle, rowBtnStyle, textareaStyle } from "../../styles";
import { ProductImageRow } from "../ProductImageRow";

export function BrollForm({ product, form, setField }) {
  return (
    <>
      <ProductImageRow product={product} />

      <div>
        <Text variant="bodySm" fontWeight="semibold">Video context</Text>
        <textarea
          value={form.videoContext}
          onChange={(event) => setField("videoContext", event.target.value)}
          placeholder="Describe the scene or context for the b-roll..."
          rows={3}
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

      <select value={form.aspectRatio} onChange={(event) => setField("aspectRatio", event.target.value)} style={fieldStyle}>
        {ASPECT_RATIOS.map((ratio) => <option key={ratio.value} value={ratio.value}>{ratio.label}</option>)}
      </select>

      <button type="button" style={rowBtnStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span>🖼️</span><Text variant="bodySm" fontWeight="medium">Select location</Text>
        </div>
        <span style={{ color: "#6b7280" }}>+</span>
      </button>
    </>
  );
}
