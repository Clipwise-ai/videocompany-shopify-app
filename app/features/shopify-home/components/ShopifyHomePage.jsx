/* eslint-disable react/prop-types */
import { AllProductsModal } from "./AllProductsModal";
import { ProductSelectionSection } from "./ProductSelectionSection";

export function ShopifyHomePage({
  iframeRef,
  iframeSrc,
  products,
  visibleProducts,
  selectedProduct,
  selectedProductImages,
  showAllProductsModal,
  isMobileViewport,
  isTabletViewport,
  modalProductColumns,
  onSelectProduct,
  onToggleProductImage,
  onShowAllProducts,
  onCloseAllProducts,
}) {
  return (
    <div
      style={{
        height: "calc(100dvh - 40px)",
        background: "#F5F5F7",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        padding: "5px",
        boxSizing: "border-box",
        gap: "12px",
      }}
    >
      <style>{`
        .vc-scroll-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .vc-scroll-hide::-webkit-scrollbar {
          width: 0;
          height: 0;
          display: none;
        }
      `}</style>

      <ProductSelectionSection
        products={products}
        visibleProducts={visibleProducts}
        selectedProduct={selectedProduct}
        selectedProductImages={selectedProductImages}
        onSelectProduct={onSelectProduct}
        onToggleProductImage={onToggleProductImage}
        onShowAllProducts={onShowAllProducts}
      />

      <div
        style={{
          flex: 1,
          minHeight: 0,
          background: "#ffffff",
          border: "1px solid #e5e7eb",
          borderRadius: "2px",
          overflow: "hidden",
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.03)",
        }}
      >
        <iframe
          ref={iframeRef}
          title="Video Company frontend"
          src={iframeSrc}
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            background: "#F5F5F7",
          }}
        />
      </div>

      <AllProductsModal
        isOpen={showAllProductsModal}
        products={products}
        selectedProduct={selectedProduct}
        isMobileViewport={isMobileViewport}
        isTabletViewport={isTabletViewport}
        modalProductColumns={modalProductColumns}
        onSelectProduct={onSelectProduct}
        onClose={onCloseAllProducts}
      />
    </div>
  );
}
