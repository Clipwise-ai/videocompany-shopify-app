/* eslint-disable react/prop-types */
import { CAMERA_MOTIONS, DURATIONS } from "../../constants";
import { fieldStyle, textareaStyle } from "../../styles";
import { FieldBlock } from "../shared/GenerationControls";

export function ImageToVideoSection({ form, setField, videoModels }) {
  return (
    <>
      <FieldBlock label="Prompt">
        <textarea
          value={form.prompt}
          onChange={(event) => setField("prompt", event.target.value)}
          rows={3}
          style={textareaStyle}
          placeholder="Describe how the selected product image should animate."
        />
      </FieldBlock>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <select value={form.videoModel || ""} onChange={(event) => setField("videoModel", event.target.value)} style={fieldStyle}>
          <option value="">Default model</option>
          {(videoModels || []).map((item) => (
            <option key={item.id || item.key || item.value} value={item.id || item.key || item.value}>
              {item.display_name || item.displayName || item.label || item.name || item.id}
            </option>
          ))}
        </select>
        <select value={form.cameraMotion} onChange={(event) => setField("cameraMotion", event.target.value)} style={fieldStyle}>
          {CAMERA_MOTIONS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
        <select value={String(form.duration)} onChange={(event) => setField("duration", Number(event.target.value))} style={fieldStyle}>
          {DURATIONS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
