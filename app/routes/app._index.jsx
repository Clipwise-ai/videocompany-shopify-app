import { useEffect, useMemo } from "react";
import { useLoaderData } from "react-router";
import { SHOPIFY_BILLING_TEST_MODE } from "../billing-mode.server";
import { ShopifyHomePage } from "../features/shopify-home/components/ShopifyHomePage";
import { useShopifyIframeBridge } from "../features/shopify-home/hooks/useShopifyIframeBridge";
import { useViewportWidth } from "../features/shopify-home/hooks/useViewportWidth";
import { useShopifyHomeStore } from "../features/shopify-home/store/useShopifyHomeStore";
import {
  buildSelectedProductPayload,
  normalizeProduct,
} from "../features/shopify-home/utils/products";
import { authenticate } from "../shopify.server";

// eslint-disable-next-line no-undef
const VIDEO_COMPANY_FRONTEND_URL = process.env.VITE_VIDEO_COMPANY_FRONTEND_URL || "http://localhost:3000";

export const loader = async ({ request }) => {
  const { admin, session, billing } = await authenticate.admin(request);
  const url = new URL(request.url);

  const [productsResponse, shopResponse] = await Promise.all([
    admin.graphql(`
      {
        products(first: 24) {
          nodes {
            id
            title
            description
            images(first: 6) {
              nodes {
                url
                altText
              }
            }
          }
        }
      }
    `),
    admin.graphql(`
      {
        shop {
          id
          name
          myshopifyDomain
        }
      }
    `),
    billing.check({
      plans: ["starter_monthly", "creator_monthly"],
      isTest: SHOPIFY_BILLING_TEST_MODE,
    }),
  ]);

  const productsJson = await productsResponse.json();
  const shopJson = await shopResponse.json();
  const products = (productsJson?.data?.products?.nodes || []).map(normalizeProduct);

  return {
    appOrigin: url.origin,
    frontendUrl: VIDEO_COMPANY_FRONTEND_URL,
    products,
    shop: shopJson?.data?.shop || null,
    sessionShop: session.shop,
  };
};

export default function AppHomePage() {
  const { appOrigin, frontendUrl, products } = useLoaderData();
  const viewportWidth = useViewportWidth();
  const {
    selectedProductId,
    selectedProductImages,
    showAllProductsModal,
    initializeProducts,
    selectProduct,
    toggleProductImage,
    setShowAllProductsModal,
  } = useShopifyHomeStore();

  const selectedProduct = useMemo(
    () => products.find((product) => product.id === selectedProductId) || products[0] || null,
    [products, selectedProductId],
  );
  const visibleProducts = useMemo(() => {
    const baseProducts = Array.isArray(products) ? products : [];
    if (!selectedProduct?.id) {
      return baseProducts.slice(0, 10);
    }

    const defaultVisible = baseProducts.slice(0, 10);
    if (defaultVisible.some((product) => product.id === selectedProduct.id)) {
      return defaultVisible;
    }

    const selected = baseProducts.find((product) => product.id === selectedProduct.id) || selectedProduct;
    const leadingProducts = baseProducts.filter((product) => product.id !== selectedProduct.id).slice(0, 9);
    return [...leadingProducts, selected];
  }, [products, selectedProduct]);
  const isTabletViewport = viewportWidth <= 1024;
  const isMobileViewport = viewportWidth <= 640;
  const isCompactDesktopViewport = viewportWidth <= 1280;
  const modalProductColumns = isMobileViewport ? 2 : isTabletViewport ? (viewportWidth <= 820 ? 3 : 4) : isCompactDesktopViewport ? 4 : 5;
  const selectedImage = selectedProductImages[0] || null;
  const iframeSelectedProduct = useMemo(
    () => buildSelectedProductPayload(selectedProduct, selectedImage),
    [selectedImage, selectedProduct],
  );
  const iframeBootstrapPayload = useMemo(() => {
    if (!iframeSelectedProduct) return null;
    return {
      source: "shopify",
      parentOrigin: appOrigin,
      postLoginRedirect: "/plan/new",
      selectedProduct: iframeSelectedProduct,
      selectedProducts: [iframeSelectedProduct],
      selectedProductDescription: selectedProduct?.description || "",
    };
  }, [appOrigin, iframeSelectedProduct, selectedProduct?.description]);

  useEffect(() => {
    initializeProducts(products);
  }, [initializeProducts, products]);

  const { iframeRef, iframeSrc } = useShopifyIframeBridge({
    appOrigin,
    frontendUrl,
    iframeBootstrapPayload,
  });

  const handleSelectProduct = (product) => {
    selectProduct(product);
    setShowAllProductsModal(false);
  };

  return (
    <ShopifyHomePage
      iframeRef={iframeRef}
      iframeSrc={iframeSrc}
      products={products}
      visibleProducts={visibleProducts}
      selectedProduct={selectedProduct}
      selectedProductImages={selectedProductImages}
      showAllProductsModal={showAllProductsModal}
      isMobileViewport={isMobileViewport}
      isTabletViewport={isTabletViewport}
      modalProductColumns={modalProductColumns}
      onSelectProduct={handleSelectProduct}
      onToggleProductImage={toggleProductImage}
      onShowAllProducts={() => setShowAllProductsModal(true)}
      onCloseAllProducts={() => setShowAllProductsModal(false)}
    />
  );
}
