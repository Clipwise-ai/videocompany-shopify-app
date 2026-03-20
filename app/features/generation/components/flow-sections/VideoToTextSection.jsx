/* eslint-disable react/prop-types */
import { VideoToTextScriptPanel } from "./VideoToTextScriptPanel";
import { VideoToTextSourcePanel } from "./VideoToTextSourcePanel";

export function VideoToTextSection({
  form,
  setField,
  selectedResources,
  onUploadVideoSource,
  onRemoveResource,
  isGenerating,
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
      <VideoToTextSourcePanel
        form={form}
        setField={setField}
        selectedResources={selectedResources}
        onUploadVideoSource={onUploadVideoSource}
        onRemoveResource={onRemoveResource}
      />
      <VideoToTextScriptPanel form={form} isGenerating={isGenerating} />
    </div>
  );
}
