/* eslint-disable react/prop-types */
import { fieldStyle, textareaStyle } from "../../styles";
import {
  FieldBlock,
  ImageIcon,
  LanguageSelect,
  SelectorButton,
} from "../shared/GenerationControls";

export function StaticAdSection({
  form,
  setField,
  staticAdAssets,
  selectedResources,
  onOpenPicker,
}) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <select value={form.adFormat} onChange={(event) => setField("adFormat", event.target.value)} style={fieldStyle}>
          <option value="">Ad format</option>
          {(staticAdAssets?.adFormats || []).map((item) => (
            <option key={item.key || item.value || item.id} value={item.key || item.value || item.id}>
              {item.display_name || item.displayName || item.label || item.key}
            </option>
          ))}
        </select>
        <select value={form.adType} onChange={(event) => setField("adType", event.target.value)} style={fieldStyle}>
          <option value="">Ad type</option>
          {(staticAdAssets?.adTypes || []).map((item) => (
            <option key={item.key || item.value || item.id} value={item.key || item.value || item.id}>
              {item.display_name || item.displayName || item.label || item.key}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <LanguageSelect value={form.language} onChange={(event) => setField("language", event.target.value)} />
        <select value={String(form.variation)} onChange={(event) => setField("variation", Number(event.target.value))} style={fieldStyle}>
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <option key={value} value={value}>
              Variations - {value}
            </option>
          ))}
        </select>
      </div>
      <FieldBlock label="Product description" optional>
        <textarea
          value={form.productDescription}
          onChange={(event) => setField("productDescription", event.target.value)}
          rows={3}
          style={textareaStyle}
          placeholder="Optional product description for static ad planning."
        />
      </FieldBlock>
      <SelectorButton
        label="Reference ad"
        value={selectedResources.referenceAd?.name || "Select reference ad"}
        onClick={() => onOpenPicker("referenceAd")}
        selected={Boolean(selectedResources.referenceAd)}
        imageUrl={selectedResources.referenceAd?.thumbnail || selectedResources.referenceAd?.image || selectedResources.referenceAd?.url || ""}
        icon={<ImageIcon />}
      />
      <FieldBlock label="Custom instructions">
        <textarea
          value={form.customInstructions}
          onChange={(event) => setField("customInstructions", event.target.value)}
          rows={3}
          style={textareaStyle}
          placeholder="Instructions for brand tone, CTA, layout, or visual direction."
        />
      </FieldBlock>
    </>
  );
}
