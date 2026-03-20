/* eslint-disable react/prop-types */
import { Text } from "@shopify/polaris";
import { ASPECT_RATIOS } from "../../constants";
import { fieldStyle, textareaStyle } from "../../styles";
import { FieldBlock } from "../shared/GenerationControls";

export function TextToImageSection({ form, setField, textModels }) {
  return (
    <>
      <FieldBlock label="Prompt">
        <textarea
          value={form.prompt}
          onChange={(event) => setField("prompt", event.target.value)}
          rows={4}
          style={textareaStyle}
          placeholder="Describe the image you want Clipwise to generate."
        />
      </FieldBlock>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <select value={form.aspectRatio} onChange={(event) => setField("aspectRatio", event.target.value)} style={fieldStyle}>
          {ASPECT_RATIOS.map((ratio) => (
            <option key={ratio.value} value={ratio.value}>
              {ratio.label}
            </option>
          ))}
        </select>
        <select value={form.textModel || ""} onChange={(event) => setField("textModel", event.target.value)} style={fieldStyle}>
          <option value="">Default model</option>
          {(textModels || []).map((item) => (
            <option key={item.id || item.key || item.value} value={item.id || item.key || item.value}>
              {item.display_name || item.displayName || item.label || item.name || item.id}
            </option>
          ))}
        </select>
      </div>
      <Text as="p" tone="subdued">
        The selected Shopify product image will be sent as the reference media for this prompt.
      </Text>
    </>
  );
}
