/* eslint-disable react/prop-types */
import { colors } from "../styles";

export function ProductImageRow({ product, bridge }) {
  const imageUrl = product?.images?.nodes?.[0]?.url || "";
  const productType = bridge?.productType || "";
  const isPreparing = bridge?.status === "loading";
  const statusLabel = isPreparing ? "Analyzing image" : productType || "Product";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "4px" }}>
      <p style={{ display: "block", fontSize: "14px", fontWeight: 500, color: colors.text, margin: 0 }}>
        {statusLabel}
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
