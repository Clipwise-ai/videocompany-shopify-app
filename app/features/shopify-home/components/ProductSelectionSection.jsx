/* eslint-disable react/prop-types */
import { ProductCard } from "./ProductCard";

export function ProductSelectionSection({
  products,
  visibleProducts,
  selectedProduct,
  selectedProductImages,
  onSelectProduct,
  onToggleProductImage,
  onShowAllProducts,
}) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "2px",
        padding: "16px 20px",
        flexShrink: 0,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
      }}
    >
      <div style={{ marginBottom: "15px", display: "flex", alignItems: "center" }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>
          Select products to create creative content
        </div>
      </div>

      <div className="vc-scroll-hide" style={{ overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: "max-content" }}>
          {visibleProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isSelected={selectedProduct?.id === product.id}
              selectedProductImages={selectedProductImages}
              onSelectProduct={onSelectProduct}
              onToggleProductImage={onToggleProductImage}
            />
          ))}

          {products.length > 10 ? (
            <button
              type="button"
              onClick={onShowAllProducts}
              style={{
                width: "152px",
                minWidth: "152px",
                height: "133.76px",
                aspectRatio: "1 / 0.88",
                borderRadius: "14px",
                border: "1px dashed #cbd5e1",
                background: "#f8fafc",
                color: "#2563eb",
                cursor: "pointer",
                fontWeight: 700,
                padding: "14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.04)",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "40px",
                  height: "40px",
                  borderRadius: "999px",
                  background: "#eff6ff",
                  fontSize: "22px",
                  lineHeight: 1,
                }}
              >
                +
              </span>
              <span style={{ fontSize: "14px", lineHeight: 1.2 }}>
                View all ({products.length})
              </span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
