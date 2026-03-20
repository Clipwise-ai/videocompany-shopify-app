/* eslint-disable react/prop-types */
import {
  FieldBlock,
  FileUploadButton,
  ImageIcon,
  LanguageSelect,
  MicIcon,
  SelectorButton,
  UserIcon,
} from "../shared/GenerationControls";
import { SelectorButton as SelectionButton } from "../shared/GenerationSelectionControls";
import { textareaStyle } from "../../styles";

export function CloneSection({
  form,
  setField,
  selectedResources,
  backgroundLabel,
  backgroundActionLabel,
  onOpenPicker,
  onUploadSubjectImage,
  onUploadVoiceSample,
}) {
  return (
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
          SelectorButton={SelectionButton}
        />
        <FileUploadButton
          label="Upload voice sample"
          value={selectedResources.clonedVoice?.name || "Upload voice sample"}
          accept="audio/*"
          onChange={onUploadVoiceSample}
          selected={Boolean(selectedResources.clonedVoice?.name)}
          icon={<MicIcon />}
          SelectorButton={SelectionButton}
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
