/* eslint-disable react/prop-types */
import { ProductImageRow } from "../ProductImageRow";
import {
  FieldBlock,
  ImageIcon,
  LanguageSelect,
  MicIcon,
  SelectorButton,
  Toggle,
  UserIcon,
} from "../shared/GenerationControls";
import { colors, textareaStyle } from "../../styles";

export function UgcActorSection({
  flow,
  form,
  setField,
  product,
  bridge,
  selectedResources,
  voiceActionLabel,
  actorActionLabel,
  backgroundLabel,
  backgroundActionLabel,
  onOpenPicker,
}) {
  return (
    <>
      <FieldBlock
        label="Add script"
        rightContent={(
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "14px",
              color: colors.text,
            }}
          >
            <span>Generate subtitles</span>
            <Toggle checked={form.subtitles} onChange={(checked) => setField("subtitles", checked)} />
          </div>
        )}
      >
        <textarea
          value={form.script}
          onChange={(event) => setField("script", event.target.value)}
          rows={5}
          style={{ ...textareaStyle, minHeight: "98px" }}
          placeholder="Enter your script here..."
        />
      </FieldBlock>

      <FieldBlock label="Directive instructions">
        <textarea
          value={form.directives}
          onChange={(event) => setField("directives", event.target.value)}
          rows={3}
          style={textareaStyle}
          placeholder="(Optional) Directions like camera movement, pacing, transitions, or overall visual style"
        />
      </FieldBlock>

      {flow === "ugc" ? <ProductImageRow product={product} bridge={bridge} /> : null}

      {flow === "ugc" ? (
        <FieldBlock label="Product description" optional>
          <textarea
            value={form.productDescription}
            onChange={(event) => setField("productDescription", event.target.value)}
            rows={3}
            style={textareaStyle}
            placeholder="Describe the product and its features for better results..."
          />
        </FieldBlock>
      ) : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", flexShrink: 0 }}>
        <LanguageSelect value={form.language} onChange={(event) => setField("language", event.target.value)} />
        <SelectorButton
          label="Select voice"
          value={voiceActionLabel}
          onClick={() => onOpenPicker("voice")}
          selected={Boolean(selectedResources.voice)}
          icon={<MicIcon />}
        />
        <SelectorButton
          label={flow === "ugc" ? "Select actor" : "Select avatar"}
          value={actorActionLabel}
          onClick={() => onOpenPicker("avatar")}
          selected={Boolean(selectedResources.avatar)}
          imageUrl={selectedResources.avatar?.thumbnail || selectedResources.avatar?.image || selectedResources.avatar?.url || ""}
          icon={<UserIcon />}
        />
        <SelectorButton
          label={backgroundLabel}
          value={backgroundActionLabel}
          onClick={() => onOpenPicker("background")}
          selected={Boolean(selectedResources.background)}
          imageUrl={selectedResources.background?.thumbnail || selectedResources.background?.image || selectedResources.background?.url || ""}
          icon={<ImageIcon />}
        />
      </div>
    </>
  );
}
