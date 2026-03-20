/* eslint-disable react/prop-types */
import { ASPECT_RATIOS, CAMERA_MOTIONS, DURATIONS, PLAN_FLOW } from "../../constants";
import { colors, fieldStyle, textareaStyle, tileButtonStyle } from "../../styles";
import {
  FieldBlock,
  ImageIcon,
  SelectorButton,
  Toggle,
  UserIcon,
} from "../shared/GenerationControls";

export function ModelProductSection({
  flow,
  form,
  setField,
  selectedResources,
  backgroundLabel,
  backgroundActionLabel,
  actorActionLabel,
  onOpenPicker,
}) {
  return (
    <>
      <FieldBlock label="Product description" optional>
        <textarea
          value={form.productDescription}
          onChange={(event) => setField("productDescription", event.target.value)}
          rows={3}
          style={textareaStyle}
          placeholder="Optional product description."
        />
      </FieldBlock>
      <FieldBlock label="Custom instructions">
        <textarea
          value={form.customInstructions}
          onChange={(event) => setField("customInstructions", event.target.value)}
          rows={3}
          style={textareaStyle}
          placeholder="Instructions for shot style, composition, or creative direction."
        />
      </FieldBlock>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <select value={String(form.variation)} onChange={(event) => setField("variation", Number(event.target.value))} style={fieldStyle}>
          {[1, 2, 3, 4, 5, 6].map((value) => (
            <option key={value} value={value}>
              Variations - {value}
            </option>
          ))}
        </select>
        <select value={form.aspectRatio} onChange={(event) => setField("aspectRatio", event.target.value)} style={fieldStyle}>
          {ASPECT_RATIOS.filter((ratio) => ratio.value !== "match_input_image").map((ratio) => (
            <option key={ratio.value} value={ratio.value}>
              {ratio.label}
            </option>
          ))}
        </select>
      </div>
      <SelectorButton
        label={backgroundLabel}
        value={backgroundActionLabel}
        onClick={() => onOpenPicker("background")}
        selected={Boolean(selectedResources.background)}
        imageUrl={selectedResources.background?.thumbnail || selectedResources.background?.image || selectedResources.background?.url || ""}
        icon={<ImageIcon />}
      />
      {flow === PLAN_FLOW.MODEL ? (
        <>
          <SelectorButton
            label="Select model"
            value={actorActionLabel}
            onClick={() => onOpenPicker("avatar")}
            selected={Boolean(selectedResources.avatar)}
            imageUrl={selectedResources.avatar?.thumbnail || selectedResources.avatar?.image || selectedResources.avatar?.url || ""}
            icon={<UserIcon />}
          />
          <SelectorButton
            label="Select pose"
            value={selectedResources.pose ? "Change pose" : "Select pose"}
            onClick={() => onOpenPicker("pose")}
            selected={Boolean(selectedResources.pose)}
            imageUrl={selectedResources.pose?.thumbnail || selectedResources.pose?.image || selectedResources.pose?.url || ""}
            icon="⟂"
          />
        </>
      ) : null}
      <div style={{ ...tileButtonStyle, cursor: "default" }}>
        <span style={{ fontSize: "14px", color: colors.text }}>
          Auto-generate video from first image
        </span>
        <Toggle
          checked={form.generateVideoAfterImages}
          onChange={(checked) => setField("generateVideoAfterImages", checked)}
        />
      </div>
      {form.generateVideoAfterImages ? (
        <>
          <FieldBlock label="Video prompt" optional>
            <textarea
              value={form.videoPrompt}
              onChange={(event) => setField("videoPrompt", event.target.value)}
              rows={2}
              style={textareaStyle}
              placeholder="Optional prompt to animate the generated image."
            />
          </FieldBlock>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            <select value={form.cameraMotion} onChange={(event) => setField("cameraMotion", event.target.value)} style={fieldStyle}>
              {CAMERA_MOTIONS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            <select value={String(form.duration)} onChange={(event) => setField("duration", Number(event.target.value))} style={fieldStyle}>
              {DURATIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : null}
    </>
  );
}
