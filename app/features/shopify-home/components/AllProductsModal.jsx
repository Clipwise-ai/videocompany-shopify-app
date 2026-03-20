/* eslint-disable react/prop-types */
import {
  getPrimaryProductImageUrl,
  getProductImages,
} from "../utils/products";

export function AllProductsModal({
  isOpen,
  products,
  selectedProduct,
  isMobileViewport,
  isTabletViewport,
  modalProductColumns,
  onSelectProduct,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: isMobileViewport ? "12px" : isTabletViewport ? "16px" : "24px",
      }}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClose();
        }
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: isMobileViewport ? "10px" : "12px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          width: "100%",
          maxWidth: isMobileViewport ? "100%" : isTabletViewport ? "92vw" : "1080px",
          height: isMobileViewport ? "min(100%, calc(100dvh - 24px))" : "auto",
          maxHeight: isMobileViewport ? "calc(100dvh - 24px)" : "86vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        role="dialog"
        aria-modal="true"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: isMobileViewport ? "14px 16px" : "18px 20px",
            borderBottom: "1px solid #e1e3e5",
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600 }}>
            All Products ({products.length})
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              color: "#6b7280",
              fontSize: "20px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div
          style={{
            overflowY: "auto",
            padding: isMobileViewport ? "14px" : isTabletViewport ? "16px" : "20px",
            display: "grid",
            gridTemplateColumns: `repeat(${modalProductColumns}, minmax(0, 1fr))`,
            gap: isMobileViewport ? "10px" : "12px",
            alignItems: "stretch",
          }}
        >
          {products.map((product) => {
            const isSelected = selectedProduct?.id === product.id;
            const productImages = getProductImages(product);
            const hasMultipleImages = productImages.length > 1;

            return (
              <button
                type="button"
                key={product.id}
                onClick={() => onSelectProduct(product)}
                style={{
                  position: "relative",
                  cursor: "pointer",
                  padding: 0,
                  background: isSelected ? "#f0f7ff" : "#ffffff",
                  border: isSelected ? "2.5px solid #2563eb" : "1px solid #edf2f7",
                  borderRadius: "12px",
                  boxShadow: isSelected
                    ? "0 4px 12px rgba(37, 99, 235, 0.12)"
                    : "0 1px 3px rgba(0,0,0,0.02)",
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  minHeight: isMobileViewport
                    ? "168px"
                    : isTabletViewport
                      ? "210px"
                      : "236px",
                  overflow: "hidden",
                }}
              >
                {hasMultipleImages ? (
                  <div
                    style={{
                      position: "absolute",
                      top: "8px",
                      left: "8px",
                      background: "rgba(15, 23, 42, 0.72)",
                      color: "#fff",
                      borderRadius: "999px",
                      padding: "3px 8px",
                      fontSize: "11px",
                      fontWeight: 700,
                      zIndex: 2,
                    }}
                  >
                    {productImages.length} images
                  </div>
                ) : null}
                <div
                  style={{
                    width: "100%",
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#fcfcfc",
                    padding: isMobileViewport ? "6px" : "10px",
                  }}
                >
                  {productImages.length > 0 ? (
                    <img
                      src={getPrimaryProductImageUrl(product)}
                      alt={productImages[0]?.altText || product.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <div style={{ fontSize: 12, color: "#6b7280" }}>No Image</div>
                  )}
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)",
                    textAlign: "left",
                    padding: isMobileViewport
                      ? "22px 10px 9px 10px"
                      : "26px 12px 10px 12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: isMobileViewport ? "12px" : "14px",
                      fontWeight: 700,
                      color: "#ffffff",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                      textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                      lineHeight: 1.2,
                    }}
                  >
                    {product.title}
                  </div>
                </div>
                {isSelected ? (
                  <div
                    style={{
                      position: "absolute",
                      top: "6px",
                      right: "6px",
                      background: "#2563eb",
                      color: "#fff",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      zIndex: 3,
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
