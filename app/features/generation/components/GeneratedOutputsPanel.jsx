/* eslint-disable react/prop-types */
import { Text } from "@shopify/polaris";

function PendingCard({ item }) {
  return (
    <div
      style={{
        border: "1px dashed #cbd5e1",
        borderRadius: "12px",
        padding: "16px",
        background: "#f8fafc",
      }}
    >
      <Text variant="bodyMd" as="p" fontWeight="semibold">{item.title || "Generation in progress"}</Text>
      <Text as="p" tone="subdued">{item.message || "Waiting for Clipwise output..."}</Text>
    </div>
  );
}

function MediaCard({ item }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        overflow: "hidden",
        background: "white",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div style={{ 
        aspectRatio: "1 / 1.1", 
        background: "#f8fafc", 
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderBottom: "1px solid #f1f5f9"
      }}>
        {item.mediaType === "video" ? (
          <video 
            src={item.url} 
            controls 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
        ) : item.mediaType === "text" ? (
          <div style={{ 
            padding: "20px", 
            whiteSpace: "pre-wrap", 
            height: "100%", 
            overflowY: "auto",
            fontSize: "13px",
            lineHeight: "1.5",
            color: "#334155"
          }}>
            <Text as="p">{item.text || ""}</Text>
          </div>
        ) : (
          <img 
            src={item.url} 
            alt={item.title} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
        )}
      </div>
      <div style={{ padding: "14px", flexGrow: 1 }}>
        <Text variant="bodyMd" as="p" fontWeight="bold" style={{ marginBottom: "4px", color: "#1e293b" }}>{item.title || "Generated output"}</Text>
        {item.formatName ? (
          <div style={{ display: "inline-block", background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px" }}>
            <Text variant="bodySm" tone="subdued">{item.formatName}</Text>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function GeneratedOutputsPanel({ outputs, bridgeStatus }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{
        // background: "#ffffff",
        borderRadius: "0",
        padding: "20px 24px",
        flex: 1,
        minHeight: 0,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", height: "100%" }}>
          <div style={{ padding: "8px 4px 0 4px" }}>
            <Text variant="headingMd" as="h2">Generated Outputs</Text>
          </div>

          <div className="vc-scroll-hide" style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "4px" }}>
            {outputs.length === 0 ? (
              <div style={{ padding: "20px 0" }}>
                <Text as="p" tone="subdued">No generated outputs yet.</Text>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                {outputs.map((item) => (
                  item.status && item.status !== "completed" && !item.url && !item.text
                    ? <PendingCard key={item.id} item={item} />
                    : <MediaCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
