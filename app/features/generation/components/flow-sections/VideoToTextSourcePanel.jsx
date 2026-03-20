/* eslint-disable react/prop-types, jsx-a11y/media-has-caption, jsx-a11y/label-has-associated-control */
import { colors } from "../../styles";

function VideoSourceTabs({ form, setField }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", borderBottom: `1px solid ${colors.border}`, background: "#fff" }}>
      <button type="button" onClick={() => setField("videoSourceType", "url")} style={{ height: "44px", fontSize: "14px", fontWeight: 500, transition: "colors 0.2s", border: "none", background: !form.videoSourceType || form.videoSourceType === "url" ? "#eff6ff" : "transparent", color: !form.videoSourceType || form.videoSourceType === "url" ? "#1d4ed8" : "#374151", borderBottom: !form.videoSourceType || form.videoSourceType === "url" ? "2px solid #2563eb" : "2px solid transparent", cursor: "pointer" }}>Paste URL</button>
      <button type="button" onClick={() => setField("videoSourceType", "upload")} style={{ height: "44px", fontSize: "14px", fontWeight: 500, transition: "colors 0.2s", border: "none", background: form.videoSourceType === "upload" ? "#eff6ff" : "transparent", color: form.videoSourceType === "upload" ? "#1d4ed8" : "#374151", borderBottom: form.videoSourceType === "upload" ? "2px solid #2563eb" : "2px solid transparent", cursor: "pointer" }}>Upload Video</button>
    </div>
  );
}

function UrlInput({ form, setField }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af", pointerEvents: "none" }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
      </span>
      <input type="url" value={form.videoUrl || ""} onChange={(event) => setField("videoUrl", event.target.value)} placeholder="Paste video link" style={{ height: "44px", width: "100%", borderRadius: "8px", border: `1px solid ${colors.border}`, background: "#fff", paddingLeft: "36px", paddingRight: "12px", fontSize: "14px", color: "#111827", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function UploadedVideoState({ selectedResources, onRemoveResource }) {
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: "12px", border: `1px solid ${colors.border}`, background: "#f9fafb" }}>
      <div style={{ display: "flex", aspectRatio: "16/9", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#6b7280" }}>
        <video src={selectedResources.uploadedVideo.url} style={{ width: "100%", height: "100%", objectFit: "cover" }} controls />
      </div>
      <button type="button" onClick={() => onRemoveResource("uploadedVideo")} style={{ position: "absolute", right: "8px", top: "8px", display: "inline-flex", height: "32px", alignItems: "center", justifyContent: "center", gap: "4px", borderRadius: "6px", background: "rgba(0,0,0,0.7)", padding: "0 8px", fontSize: "12px", fontWeight: 500, color: "#fff", border: "none", cursor: "pointer" }}>Delete</button>
    </div>
  );
}

function UploadPrompt({ onUploadVideoSource }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", aspectRatio: "16/9", border: `2px dashed ${colors.border}`, borderRadius: "12px", background: "#fff", cursor: "pointer" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: "20px", paddingBottom: "24px", color: "#6b7280" }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "12px" }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
        <p style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 600 }}>Drag & drop video here</p>
        <p style={{ margin: 0, fontSize: "12px", color: "#9ca3af" }}>or click to upload (MP4, MOV, WEBM)</p>
      </div>
      <input type="file" accept="video/*" aria-label="Upload video file" style={{ display: "none" }} onChange={(event) => onUploadVideoSource(event.target.files)} />
    </label>
  );
}

export function VideoToTextSourcePanel({
  form,
  setField,
  selectedResources,
  onUploadVideoSource,
  onRemoveResource,
}) {
  const isUrlMode = !form.videoSourceType || form.videoSourceType === "url";

  return (
    <div style={{ borderRadius: "8px", border: `1px solid ${colors.border}`, background: "#f9fafb", overflow: "hidden" }}>
      <VideoSourceTabs form={form} setField={setField} />
      <div style={{ padding: "12px" }}>
        {isUrlMode ? <UrlInput form={form} setField={setField} /> : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {selectedResources.uploadedVideo?.name ? <UploadedVideoState selectedResources={selectedResources} onRemoveResource={onRemoveResource} /> : <UploadPrompt onUploadVideoSource={onUploadVideoSource} />}
          </div>
        )}
      </div>
    </div>
  );
}
