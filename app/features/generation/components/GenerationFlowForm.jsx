/* eslint-disable react/prop-types */
import { useId } from "react";
import { Text } from "@shopify/polaris";
import {
  ASPECT_RATIOS,
  CAMERA_MOTIONS,
  DURATIONS,
  LANGUAGES,
  PLAN_FLOW,
} from "../constants";
import {
  colors,
  controlHeight,
  fieldStyle,
  primaryButtonStyle,
  sectionLabelStyle,
  selectStyle,
  textareaStyle,
  tileButtonStyle,
} from "../styles";
import { ProductImageRow } from "./ProductImageRow";
import { Stepper } from "./Stepper";

function BaseIcon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

function LanguageIcon() {
  return (
    <BaseIcon>
      <path d="M5 8h10" />
      <path d="M4 4h12" />
      <path d="M9 4c0 6-2 10-5 12" />
      <path d="M9 4c0 4 2 8 5 10" />
      <path d="M13 15h6" />
      <path d="M16 12l-3 8" />
      <path d="M19 12l3 8" />
    </BaseIcon>
  );
}

function MicIcon() {
  return (
    <BaseIcon>
      <path d="M12 3a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Z" />
      <path d="M19 10a7 7 0 0 1-14 0" />
      <path d="M12 17v4" />
      <path d="M8 21h8" />
    </BaseIcon>
  );
}

function UserIcon() {
  return (
    <BaseIcon>
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </BaseIcon>
  );
}

function ImageIcon() {
  return (
    <BaseIcon>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-5-5L5 21" />
    </BaseIcon>
  );
}

function FieldBlock({ label, children, optional = false, rightContent = null }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <label style={sectionLabelStyle}>
          {label}
          {optional ? " (Optional)" : ""}
        </label>
        {rightContent}
      </div>
      {children}
    </div>
  );
}

function CheckBadge() {
  return (
    <span
      style={{
        width: "16px",
        height: "16px",
        borderRadius: "999px",
        background: colors.success,
        color: "#fff",
        fontSize: "11px",
        fontWeight: 700,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      ✓
    </span>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function CrownIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinejoin="round">
      <path d="M12 4l3 5 4-2-1 8H6l-1-8 4 2 3-5z" />
      <path d="M5 19h14v2H5v-2z" />
    </svg>
  );
}

function IconSlot({ imageUrl, fallback }) {
  return (
    <span
      style={{
        width: "24px",
        height: "24px",
        borderRadius: "8px",
        overflow: "hidden",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        background: imageUrl ? "#fff" : "transparent",
        border: imageUrl ? `1px solid ${colors.border}` : "none",
        flexShrink: 0,
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        <span style={{ color: colors.text, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{fallback}</span>
      )}
    </span>
  );
}

function SelectorButton({ label, value, onClick, selected = false, imageUrl = "", icon = "+", disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...tileButtonStyle,
        opacity: disabled ? 0.65 : 1,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
        <IconSlot imageUrl={imageUrl} fallback={icon} />
        <div style={{ fontSize: "14px", fontWeight: 500, color: colors.text, minWidth: 0 }}>
          <span style={{ display: "block", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {value || label}
          </span>
        </div>
      </div>
      {selected ? <CheckBadge /> : <span style={{ color: colors.muted, display: "inline-flex" }}><PlusIcon /></span>}
    </button>
  );
}

function FileUploadButton({ label, value, accept, onChange, selected = false, icon }) {
  const inputId = useId();

  return (
    <>
      <label htmlFor={inputId} style={{ display: "block", cursor: "pointer" }}>
        <div style={{ pointerEvents: "none" }}>
          <SelectorButton
            label={label}
            value={value}
            onClick={() => {}}
            selected={selected}
            icon={icon}
          />
        </div>
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files)}
        style={{ display: "none" }}
      />
    </>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: "36px",
        height: "20px",
        borderRadius: "999px",
        border: "none",
        background: checked ? colors.primary : "#d1d5db",
        position: "relative",
        cursor: "pointer",
        padding: 0,
        transition: "background-color 150ms ease",
      }}
      aria-pressed={checked}
    >
      <span
        style={{
          position: "absolute",
          top: "2px",
          left: checked ? "18px" : "2px",
          width: "16px",
          height: "16px",
          borderRadius: "999px",
          background: "#fff",
          transition: "left 150ms ease",
        }}
      />
    </button>
  );
}

function LanguageSelect({ value, onChange }) {
  const hasValue = Boolean(value);

  return (
    <div style={{ position: "relative", height: controlHeight }}>
      <span
        style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: colors.text,
          fontSize: "14px",
          pointerEvents: "none",
        }}
      >
        <LanguageIcon />
      </span>
      <select value={value} onChange={onChange} style={selectStyle}>
        {LANGUAGES.map((language) => <option key={language} value={language}>{language}</option>)}
      </select>
      <span
        style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          pointerEvents: "none",
        }}
      >
        {hasValue ? <CheckBadge /> : <span style={{ color: colors.muted, display: "inline-flex" }}><ChevronDownIcon /></span>}
      </span>
    </div>
  );
}

function ProductUploadBlock({ product, bridge }) {
  const imageUrl = product?.images?.nodes?.[0]?.url || "";
  const productType = bridge?.productType || "";
  const isPreparing = bridge?.status === "loading";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "4px" }}>
      <p style={{ display: "block", fontSize: "14px", fontWeight: 500, color: colors.text, margin: 0 }}>
        {isPreparing ? "Analyzing image..." : productType || "Product"}
      </p>
      
      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "4px" }}>
        <div
          style={{
            position: "relative",
            width: "56px",
            height: "56px",
            borderRadius: "8px",
            overflow: "hidden",
            border: `2px solid ${colors.border}`,
            background: colors.bg,
            flexShrink: 0,
          }}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product?.title || "Product"}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function GenerationActionFooter({
  format,
  bridge,
  authState,
  onGenerate,
  isGenerating,
  generationLabel,
  isUpgradeRequired = false,
  onUpgrade,
}) {
  const isPreparingProduct = bridge?.status === "loading";
  const isGenerateDisabled = isGenerating || isPreparingProduct || authState?.status !== "connected";
  const generateButtonLabel = isGenerating
    ? "Generating..."
    : authState?.status !== "connected"
      ? "Connect with Clipwise to continue"
      : isPreparingProduct
        ? "Preparing product..."
        : generationLabel || `Generate ${format?.generates || "media"}`;
  const generateSubLabel = format?.generates === "video" ? "~35 Credits / 30s" : "";

  return isUpgradeRequired ? (
    <button
      type="button"
      onClick={onUpgrade}
      style={{
        width: "100%",
        minHeight: ctaHeight,
        borderRadius: "999px",
        background: "#eff6ff",
        color: "#3b82f6",
        border: "1px solid #bfdbfe",
        fontSize: "15px",
        fontWeight: 600,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "0 18px",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#dbeafe"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "#eff6ff"; }}
    >
      Upgrade plan <CrownIcon />
    </button>
  ) : (
    <button
      type="button"
      onClick={onGenerate}
      disabled={isGenerateDisabled}
      style={{
        ...primaryButtonStyle,
        background: isGenerateDisabled ? colors.disabled : colors.primary,
        cursor: isGenerateDisabled ? "not-allowed" : "pointer",
      }}
    >
      <span>{generateButtonLabel}</span>
      {!isGenerating && generateSubLabel ? (
        <span style={{ fontSize: "12px", fontWeight: 500, color: "rgba(255,255,255,0.92)" }}>
          ({generateSubLabel})
        </span>
      ) : null}
    </button>
  );
}

export function GenerationFlowForm({
  flow,
  format,
  product,
  form,
  setField,
  bridge,
  authState,
  selectedResources,
  staticAdAssets,
  textModels,
  videoModels,
  onOpenPicker,
  onUploadSubjectImage,
  onUploadVoiceSample,
  onUploadVideoSource,
  onGenerate,
  isGenerating,
  generationLabel,
  generationError,
  isUpgradeRequired = false,
  onUpgrade,
  useExternalScrollContainer = false,
  hideFooter = false,
}) {
  const backgroundLabel = flow === PLAN_FLOW.PRODUCT_BACKGROUND ? "Select background" : "Select location";
  const backgroundActionLabel = selectedResources.background ? `Change ${flow === PLAN_FLOW.PRODUCT_BACKGROUND ? "background" : "location"}` : backgroundLabel;
  const voiceActionLabel = selectedResources.voice ? "Change voice" : "Select voice";
  const actorActionLabel = selectedResources.avatar
    ? `Change ${flow === PLAN_FLOW.UGC ? "actor" : flow === PLAN_FLOW.MODEL ? "model" : "avatar"}`
    : flow === PLAN_FLOW.UGC ? "Select actor" : flow === PLAN_FLOW.MODEL ? "Select model" : "Select avatar";
  const bodyWrapperStyle = useExternalScrollContainer
    ? { display: "flex", flexDirection: "column", gap: "10px" }
    : { flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "4px", paddingBottom: "12px", display: "flex", flexDirection: "column", gap: "10px" };
  const footerStyle = useExternalScrollContainer
    ? {
        position: "sticky",
        bottom: 0,
        flexShrink: 0,
        background: "#ffffff",
        paddingTop: "16px",
        paddingBottom: "8px",
        borderTop: `1px solid ${colors.border}`,
        marginTop: "16px",
        zIndex: 2,
      }
    : {
        flexShrink: 0,
        background: "#ffffff",
        paddingTop: "16px",
        paddingBottom: "8px",
        borderTop: `1px solid ${colors.border}`,
      };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: useExternalScrollContainer ? "auto" : "100%", minHeight: 0 }}>
      <div style={bodyWrapperStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
          {(flow === PLAN_FLOW.UGC || flow === PLAN_FLOW.ACTOR || flow === PLAN_FLOW.UGC_CLONE) ? null : <ProductImageRow product={product} bridge={bridge} />}
          {bridge?.status === "error" ? <Text as="p" tone="critical">{bridge.error}</Text> : null}
        </div>

        {(flow === PLAN_FLOW.UGC || flow === PLAN_FLOW.ACTOR) ? (
          <>
          <FieldBlock
            label="Add script"
            rightContent={(
              <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "14px", color: colors.text }}>
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

          {flow === PLAN_FLOW.UGC ? <ProductUploadBlock product={product} bridge={bridge} /> : null}

          {flow === PLAN_FLOW.UGC ? (
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
            {(flow === PLAN_FLOW.UGC || flow === PLAN_FLOW.ACTOR) ? (
              <SelectorButton
                label={flow === PLAN_FLOW.UGC ? "Select actor" : "Select avatar"}
                value={actorActionLabel}
                onClick={() => onOpenPicker("avatar")}
                selected={Boolean(selectedResources.avatar)}
                imageUrl={selectedResources.avatar?.thumbnail || selectedResources.avatar?.image || selectedResources.avatar?.url || ""}
                icon={<UserIcon />}
              />
            ) : null}
            {(flow === PLAN_FLOW.UGC || flow === PLAN_FLOW.ACTOR) ? (
              <SelectorButton
                label={backgroundLabel}
                value={backgroundActionLabel}
                onClick={() => onOpenPicker("background")}
                selected={Boolean(selectedResources.background)}
                imageUrl={selectedResources.background?.thumbnail || selectedResources.background?.image || selectedResources.background?.url || ""}
                icon={<ImageIcon />}
              />
            ) : null}
          </div>
          </>
        ) : null}

        {flow === PLAN_FLOW.UGC_CLONE ? (
          <>
          <FieldBlock label="Add script">
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", flexShrink: 0 }}>
            <LanguageSelect value={form.language} onChange={(event) => setField("language", event.target.value)} />
            <FileUploadButton
              label="Upload face photo"
              value={selectedResources.subjectImage?.name || "Upload face photo"}
              accept="image/*"
              onChange={onUploadSubjectImage}
              selected={Boolean(selectedResources.subjectImage?.name)}
              icon={<UserIcon />}
            />
            <FileUploadButton
              label="Upload voice sample"
              value={selectedResources.clonedVoice?.name || "Upload voice sample"}
              accept="audio/*"
              onChange={onUploadVoiceSample}
              selected={Boolean(selectedResources.clonedVoice?.name)}
              icon={<MicIcon />}
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
        ) : null}

        {flow === PLAN_FLOW.BROLL ? (
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
                <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
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
                <option key={value} value={value}>Variations - {value}</option>
              ))}
            </select>
          </div>
          </>
        ) : null}

        {flow === PLAN_FLOW.STATIC_AD ? (
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
                <option key={value} value={value}>Variations - {value}</option>
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
        ) : null}

        {(flow === PLAN_FLOW.MODEL || flow === PLAN_FLOW.PRODUCT_BACKGROUND) ? (
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
                <option key={value} value={value}>Variations - {value}</option>
              ))}
            </select>
            <select value={form.aspectRatio} onChange={(event) => setField("aspectRatio", event.target.value)} style={fieldStyle}>
              {ASPECT_RATIOS.filter((ratio) => ratio.value !== "match_input_image").map((ratio) => (
                <option key={ratio.value} value={ratio.value}>{ratio.label}</option>
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
          <div
            style={{
              ...tileButtonStyle,
              cursor: "default",
            }}
          >
            <span style={{ fontSize: "14px", color: colors.text }}>Auto-generate video from first image</span>
            <Toggle checked={form.generateVideoAfterImages} onChange={(checked) => setField("generateVideoAfterImages", checked)} />
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
                  {CAMERA_MOTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
                <select value={String(form.duration)} onChange={(event) => setField("duration", Number(event.target.value))} style={fieldStyle}>
                  {DURATIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </div>
            </>
          ) : null}
          </>
        ) : null}

        {flow === PLAN_FLOW.IMAGE_TO_VIDEO ? (
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
              {CAMERA_MOTIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "8px" }}>
            <select value={String(form.duration)} onChange={(event) => setField("duration", Number(event.target.value))} style={fieldStyle}>
              {DURATIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
          </>
        ) : null}

        {flow === PLAN_FLOW.TEXT_TO_IMAGE ? (
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
              {ASPECT_RATIOS.map((ratio) => <option key={ratio.value} value={ratio.value}>{ratio.label}</option>)}
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
        ) : null}

        {flow === PLAN_FLOW.VIDEO_TO_TEXT ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <div style={{ borderRadius: "8px", border: `1px solid ${colors.border}`, background: "#f9fafb", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${colors.border}`, background: "#fff" }}>
              <button
                type="button"
                onClick={() => setField("videoSourceType", "url")}
                style={{
                  height: "44px",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "colors 0.2s",
                  border: "none",
                  background: (!form.videoSourceType || form.videoSourceType === "url") ? "#eff6ff" : "transparent",
                  color: (!form.videoSourceType || form.videoSourceType === "url") ? "#1d4ed8" : "#374151",
                  borderBottom: (!form.videoSourceType || form.videoSourceType === "url") ? "2px solid #2563eb" : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                Paste URL
              </button>
              <button
                type="button"
                onClick={() => setField("videoSourceType", "upload")}
                style={{
                  height: "44px",
                  fontSize: "14px",
                  fontWeight: 500,
                  transition: "colors 0.2s",
                  border: "none",
                  background: form.videoSourceType === "upload" ? "#eff6ff" : "transparent",
                  color: form.videoSourceType === "upload" ? "#1d4ed8" : "#374151",
                  borderBottom: form.videoSourceType === "upload" ? "2px solid #2563eb" : "2px solid transparent",
                  cursor: "pointer",
                }}
              >
                Upload Video
              </button>
            </div>
            
            <div style={{ padding: "12px" }}>
              {(!form.videoSourceType || form.videoSourceType === "url") ? (
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                  </span>
                  <input
                    type="url"
                    value={form.videoUrl || ""}
                    onChange={(event) => setField("videoUrl", event.target.value)}
                    placeholder="Paste video link"
                    style={{
                      height: "44px",
                      width: "100%",
                      borderRadius: "8px",
                      border: `1px solid ${colors.border}`,
                      background: "#fff",
                      paddingLeft: "36px",
                      paddingRight: "12px",
                      fontSize: "14px",
                      color: "#111827",
                      outline: "none",
                      boxSizing: "border-box"
                    }}
                  />
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {selectedResources.uploadedVideo?.name ? (
                     <div style={{ position: "relative", overflow: "hidden", borderRadius: "12px", border: `1px solid ${colors.border}`, background: "#f9fafb" }}>
                        <div style={{ display: "flex", aspectRatio: "16/9", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#6b7280" }}>
                          <video src={selectedResources.uploadedVideo.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} controls />
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveResource("uploadedVideo")}
                          style={{ position: "absolute", right: "8px", top: "8px", display: "inline-flex", height: "32px", alignItems: "center", justifyContent: "center", gap: "4px", borderRadius: "6px", background: "rgba(0,0,0,0.7)", padding: "0 8px", fontSize: "12px", fontWeight: 500, color: "#fff", border: "none", cursor: "pointer" }}
                        >
                          Delete
                        </button>
                     </div>
                  ) : (
                    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "16/9", border: `2px dashed ${colors.border}`, borderRadius: "12px", background: "#fff", cursor: "pointer" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "20px", paddingBottom: "24px", color: "#6b7280" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600 }}>Drag & drop video here</p>
                        <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>or click to upload (MP4, MOV, WEBM)</p>
                      </div>
                      <input type="file" accept="video/*" style={{ display: "none" }} onChange={(event) => onUploadVideoSource(event.target.files)} />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", borderRadius: "8px", border: `1px solid ${colors.border}`, background: "#f9fafb", padding: "12px", flex: 1, minHeight: "180px" }}>
            <h3 style={{ margin: 0, fontSize: "12px", fontWeight: 500, color: "#111827", flexShrink: 0 }}>Script</h3>
            <div style={{ marginTop: "8px", flex: 1, display: "flex", flexDirection: "column", borderRadius: "6px", border: `1px solid ${colors.border}`, background: "#fff", padding: "8px" }}>
               {form.generatedScript ? (
                 <textarea
                   readOnly
                   value={form.generatedScript}
                   style={{ height: "100%", minHeight: "120px", width: "100%", resize: "none", border: "none", background: "transparent", padding: 0, fontSize: "14px", lineHeight: "20px", color: "#111827", outline: "none", fontFamily: "inherit" }}
                 />
               ) : (
                 <div style={{ display: "flex", height: "100%", minHeight: "120px", alignItems: "center", justifyContent: "center" }}>
                   {isGenerating ? (
                      <p style={{ fontSize: "14px", fontWeight: 500, color: "#4b5563" }}>Processing... (GENERATING)</p>
                   ) : null}
                 </div>
               )}
            </div>
            <div style={{ marginTop: "12px", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", flexShrink: 0 }}>
              <button disabled={!form.generatedScript} type="button" style={{ display: "inline-flex", height: "36px", alignItems: "center", justifyContent: "center", gap: "8px", borderRadius: "8px", border: `1px solid ${colors.border}`, padding: "0 12px", fontSize: "12px", fontWeight: 500, background: form.generatedScript ? "#fff" : "#f3f4f6", color: form.generatedScript ? "#374151" : "#9ca3af", cursor: form.generatedScript ? "pointer" : "not-allowed" }}>
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                 Copy script
              </button>
              <button disabled={!form.generatedScript} type="button" style={{ display: "inline-flex", height: "36px", alignItems: "center", justifyContent: "center", borderRadius: "8px", border: `1px solid ${colors.border}`, padding: "0 12px", fontSize: "12px", fontWeight: 500, background: form.generatedScript ? "#fff" : "#f3f4f6", color: form.generatedScript ? "#374151" : "#9ca3af", cursor: form.generatedScript ? "pointer" : "not-allowed" }}>
                 Create UGC
              </button>
            </div>
          </div>
          </div>
        ) : null}

        {generationError ? <Text as="p" tone="critical">{generationError}</Text> : null}
      </div>

      {hideFooter ? null : (
        <div style={footerStyle}>
          <GenerationActionFooter
            format={format}
            bridge={bridge}
            authState={authState}
            onGenerate={onGenerate}
            isGenerating={isGenerating}
            generationLabel={generationLabel}
            isUpgradeRequired={isUpgradeRequired}
            onUpgrade={onUpgrade}
          />
        </div>
      )}
    </div>
  );
}
