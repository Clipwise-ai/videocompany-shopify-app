/* eslint-disable react/prop-types */
import { Text } from "@shopify/polaris";
import { PLAN_FLOW } from "../constants";
import {
  colors,
  ctaHeight,
  primaryButtonStyle,
} from "../styles";
import { ProductImageRow } from "./ProductImageRow";
import { BrollSection } from "./flow-sections/BrollSection";
import { CloneSection } from "./flow-sections/CloneSection";
import { ImageToVideoSection } from "./flow-sections/ImageToVideoSection";
import { ModelProductSection } from "./flow-sections/ModelProductSection";
import { StaticAdSection } from "./flow-sections/StaticAdSection";
import { TextToImageSection } from "./flow-sections/TextToImageSection";
import { UgcActorSection } from "./flow-sections/UgcActorSection";
import { VideoToTextSection } from "./flow-sections/VideoToTextSection";
import { CrownIcon } from "./shared/GenerationIcons";

function FlowSection(props) {
  const {
    flow,
    form,
    setField,
    product,
    bridge,
    selectedResources,
    staticAdAssets,
    textModels,
    videoModels,
    onOpenPicker,
    onUploadSubjectImage,
    onUploadVoiceSample,
    onUploadVideoSource,
    onRemoveResource,
    isGenerating,
    voiceActionLabel,
    actorActionLabel,
    backgroundLabel,
    backgroundActionLabel,
  } = props;

  if (flow === PLAN_FLOW.UGC || flow === PLAN_FLOW.ACTOR) {
    return <UgcActorSection flow={flow} form={form} setField={setField} product={product} bridge={bridge} selectedResources={selectedResources} voiceActionLabel={voiceActionLabel} actorActionLabel={actorActionLabel} backgroundLabel={backgroundLabel} backgroundActionLabel={backgroundActionLabel} onOpenPicker={onOpenPicker} />;
  }

  if (flow === PLAN_FLOW.UGC_CLONE) {
    return <CloneSection form={form} setField={setField} selectedResources={selectedResources} backgroundLabel={backgroundLabel} backgroundActionLabel={backgroundActionLabel} onOpenPicker={onOpenPicker} onUploadSubjectImage={onUploadSubjectImage} onUploadVoiceSample={onUploadVoiceSample} />;
  }

  if (flow === PLAN_FLOW.BROLL) {
    return <BrollSection form={form} setField={setField} selectedResources={selectedResources} backgroundLabel={backgroundLabel} backgroundActionLabel={backgroundActionLabel} onOpenPicker={onOpenPicker} />;
  }

  if (flow === PLAN_FLOW.STATIC_AD) {
    return <StaticAdSection form={form} setField={setField} staticAdAssets={staticAdAssets} selectedResources={selectedResources} onOpenPicker={onOpenPicker} />;
  }

  if (flow === PLAN_FLOW.MODEL || flow === PLAN_FLOW.PRODUCT_BACKGROUND) {
    return <ModelProductSection flow={flow} form={form} setField={setField} selectedResources={selectedResources} backgroundLabel={backgroundLabel} backgroundActionLabel={backgroundActionLabel} actorActionLabel={actorActionLabel} onOpenPicker={onOpenPicker} />;
  }

  if (flow === PLAN_FLOW.IMAGE_TO_VIDEO) {
    return <ImageToVideoSection form={form} setField={setField} videoModels={videoModels} />;
  }

  if (flow === PLAN_FLOW.TEXT_TO_IMAGE) {
    return <TextToImageSection form={form} setField={setField} textModels={textModels} />;
  }

  if (flow === PLAN_FLOW.VIDEO_TO_TEXT) {
    return <VideoToTextSection form={form} setField={setField} selectedResources={selectedResources} onUploadVideoSource={onUploadVideoSource} onRemoveResource={onRemoveResource} isGenerating={isGenerating} />;
  }

  return null;
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
  const isGenerateDisabled =
    isGenerating || isPreparingProduct || authState?.status !== "connected";
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
      onMouseEnter={(event) => {
        event.currentTarget.style.background = "#dbeafe";
      }}
      onMouseLeave={(event) => {
        event.currentTarget.style.background = "#eff6ff";
      }}
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
        <span
          style={{
            fontSize: "12px",
            fontWeight: 500,
            color: "rgba(255,255,255,0.92)",
          }}
        >
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
  onRemoveResource = () => {},
  onGenerate,
  isGenerating,
  generationLabel,
  generationError,
  isUpgradeRequired = false,
  onUpgrade,
  useExternalScrollContainer = false,
  hideFooter = false,
}) {
  const backgroundLabel =
    flow === PLAN_FLOW.PRODUCT_BACKGROUND ? "Select background" : "Select location";
  const backgroundActionLabel = selectedResources.background
    ? `Change ${flow === PLAN_FLOW.PRODUCT_BACKGROUND ? "background" : "location"}`
    : backgroundLabel;
  const voiceActionLabel = selectedResources.voice ? "Change voice" : "Select voice";
  const actorActionLabel = selectedResources.avatar
    ? `Change ${flow === PLAN_FLOW.UGC ? "actor" : flow === PLAN_FLOW.MODEL ? "model" : "avatar"}`
    : flow === PLAN_FLOW.UGC
      ? "Select actor"
      : flow === PLAN_FLOW.MODEL
        ? "Select model"
        : "Select avatar";
  const bodyWrapperStyle = useExternalScrollContainer
    ? { display: "flex", flexDirection: "column", gap: "10px" }
    : {
        flex: 1,
        minHeight: 0,
        overflowY: "auto",
        paddingRight: "4px",
        paddingBottom: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      };
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: useExternalScrollContainer ? "auto" : "100%",
        minHeight: 0,
      }}
    >
      <div style={bodyWrapperStyle}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
          {flow === PLAN_FLOW.UGC || flow === PLAN_FLOW.ACTOR || flow === PLAN_FLOW.UGC_CLONE ? null : (
            <ProductImageRow product={product} bridge={bridge} />
          )}
          {bridge?.status === "error" ? <Text as="p" tone="critical">{bridge.error}</Text> : null}
        </div>

        <FlowSection
          flow={flow}
          form={form}
          setField={setField}
          product={product}
          bridge={bridge}
          selectedResources={selectedResources}
          staticAdAssets={staticAdAssets}
          textModels={textModels}
          videoModels={videoModels}
          onOpenPicker={onOpenPicker}
          onUploadSubjectImage={onUploadSubjectImage}
          onUploadVoiceSample={onUploadVoiceSample}
          onUploadVideoSource={onUploadVideoSource}
          onRemoveResource={onRemoveResource}
          isGenerating={isGenerating}
          voiceActionLabel={voiceActionLabel}
          actorActionLabel={actorActionLabel}
          backgroundLabel={backgroundLabel}
          backgroundActionLabel={backgroundActionLabel}
        />

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
