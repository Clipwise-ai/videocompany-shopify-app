import { create } from "zustand";
import { getFirstProductImage } from "../utils/products";

function buildProductImages(product) {
  return (product?.images || []).map((image, index) => ({
    id: `${product.id}-image-${index}`,
    url: image?.url || "",
    altText: image?.altText || "",
  }));
}

export const useShopifyHomeStore = create((set, get) => ({
  products: [],
  selectedProductId: "",
  selectedProductImages: [],
  showAllProductsModal: false,
  initializeProducts(products) {
    const safeProducts = Array.isArray(products) ? products : [];
    const currentSelectedProduct = safeProducts.find(
      (product) => product.id === get().selectedProductId,
    );
    const fallbackProduct = currentSelectedProduct || safeProducts[0] || null;

    set({
      products: safeProducts,
      selectedProductId: fallbackProduct?.id || "",
      selectedProductImages: fallbackProduct ? getFirstProductImage(fallbackProduct) : [],
    });
  },
  selectProduct(product) {
    if (!product?.id) return;

    set({
      selectedProductId: product.id,
      selectedProductImages: buildProductImages(product).slice(0, 1),
    });
  },
  toggleProductImage(image) {
    if (!image?.id) return;

    set((state) => {
      const exists = state.selectedProductImages.some((item) => item.id === image.id);

      if (exists) {
        if (state.selectedProductImages.length === 1) {
          return state;
        }

        return {
          selectedProductImages: state.selectedProductImages.filter(
            (item) => item.id !== image.id,
          ),
        };
      }

      return {
        selectedProductImages: [image, ...state.selectedProductImages].slice(0, 1),
      };
    });
  },
  setShowAllProductsModal(showAllProductsModal) {
    set({ showAllProductsModal });
  },
}));
