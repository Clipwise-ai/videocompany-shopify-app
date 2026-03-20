/* eslint-disable react/prop-types */
import {
  getPrimaryProductImageUrl,
  getProductImages,
} from "../utils/products";

function ImageSelectionRow({
  product,
  selectedProductImages,
  onToggleProductImage,
}) {
  const productImages = getProductImages(product);

  return (
    <div
      className="vc-scroll-hide"
      style={{
        marginTop: "10px",
        overflow: "visible",
        paddingBottom: "2px",
        paddingRight: "10px",
        width: "max-content",
        minWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "inline-flex", gap: "8px", minWidth: "max-content" }}>
        {productImages.map((image, index) => {
          const imageId = `${product.id}-image-${index}`;
          const normalizedImage = {
            id: imageId,
            url: image?.url || "",
            altText: image?.altText || "",
          };
          const isImageSelected = selectedProductImages.some(
            (item) => item.id === imageId,
          );

          return (
            <button
              key={imageId}
              type="button"
              onClick={() => onToggleProductImage(normalizedImage)}
              style={{
                width: "54px",
                minWidth: "54px",
                height: "54px",
                borderRadius: "10px",
                overflow: "hidden",
                border: isImageSelected ? "2px solid #2563eb" : "1px solid #e5e7eb",
                background: "#ffffff",
                boxShadow: isImageSelected
                  ? "0 4px 10px rgba(37, 99, 235, 0.12)"
                  : "0 1px 2px rgba(15, 23, 42, 0.04)",
                cursor: "pointer",
                position: "relative",
                padding: 0,
              }}
            >
              <img
                src={image?.url || ""}
                alt={image?.altText || `${product.title} ${index + 1}`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {isImageSelected ? (
                <div
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "#2563eb",
                    color: "#fff",
                    borderRadius: "999px",
                    width: "16px",
                    height: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg
                    width="10"
                    height="10"
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
  );
}

export function ProductCard({
  product,
  isSelected,
  selectedProductImages,
  onSelectProduct,
  onToggleProductImage,
}) {
  const productImages = getProductImages(product);
  const hasMultipleImages = productImages.length > 1;

  return (
    <div
      style={{
        width: "152px",
        minWidth: "152px",
        position: "relative",
        zIndex: isSelected ? 2 : 1,
        overflow: "visible",
      }}
    >
      <button
        type="button"
        onClick={() => onSelectProduct(product)}
        style={{
          width: "100%",
          padding: 0,
          borderRadius: "14px",
          overflow: "hidden",
          border: isSelected ? "2px solid #2563eb" : "1px solid #e5e7eb",
          background: "#ffffff",
          boxShadow: isSelected
            ? "0 6px 18px rgba(37, 99, 235, 0.12)"
            : "0 1px 3px rgba(15, 23, 42, 0.06)",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 0.88",
            background: "#f8fafc",
          }}
        >
          {productImages.length > 0 ? (
            <img
              src={getPrimaryProductImageUrl(product)}
              alt={productImages[0]?.altText || product.title}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                fontSize: 12,
              }}
            >
              No image
            </div>
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 58%)",
            }}
          />
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
              }}
            >
              {productImages.length} images
            </div>
          ) : null}
          <div
            style={{
              position: "absolute",
              left: "10px",
              right: "10px",
              bottom: "10px",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              textAlign: "left",
            }}
          >
            {product.title}
          </div>
        </div>
      </button>

      {isSelected && hasMultipleImages ? (
        <ImageSelectionRow
          product={product}
          selectedProductImages={selectedProductImages}
          onToggleProductImage={onToggleProductImage}
        />
      ) : null}
    </div>
  );
}
