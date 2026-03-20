/* eslint-disable react/prop-types */
import { ASPECT_RATIOS } from "../../constants";
import { fieldStyle, textareaStyle } from "../../styles";
import { Stepper } from "../Stepper";
import { FieldBlock, ImageIcon, SelectorButton } from "../shared/GenerationControls";

export function BrollSection({
  form,
  setField,
  selectedResources,
  backgroundLabel,
  backgroundActionLabel,
  onOpenPicker,
}) {
  return (
    <>
      <div style={{ marginBottom: "16px", marginTop: "12px" }}>
        <Stepper mode="bulk" step="situation" />
      </div>
      <FieldBlock label="Situation">
        <textarea
          value={form.videoContext}
          onChange={(event) => setField("videoContext", event.target.value)}
          rows={4}
          style={textareaStyle}
          placeholder="Describe the B-roll shot or action (single or multi images)."
        />
      </FieldBlock>
      <FieldBlock label="Product description" optional>
        <textarea
          value={form.productDescription}
          onChange={(event) => setField("productDescription", event.target.value)}
          rows={3}
          style={textareaStyle}
          placeholder="Optional product description."
        />
      </FieldBlock>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", flexShrink: 0 }}>
        <select value={form.aspectRatio} onChange={(event) => setField("aspectRatio", event.target.value)} style={fieldStyle}>
          {ASPECT_RATIOS.filter((ratio) => ratio.value !== "match_input_image").map((ratio) => (
            <option key={ratio.value} value={ratio.value}>
              {ratio.label}
            </option>
          ))}
        </select>
        <SelectorButton
          label={backgroundLabel}
          value={backgroundActionLabel}
          onClick={() => onOpenPicker("background")}
          selected={Boolean(selectedResources.background)}
          imageUrl={selectedResources.background?.thumbnail || selectedResources.background?.image || selectedResources.background?.url || ""}
          icon={<ImageIcon />}
        />
        <select value={String(form.variation)} onChange={(event) => setField("variation", Number(event.target.value))} style={fieldStyle}>
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <option key={value} value={value}>
              Variations - {value}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
