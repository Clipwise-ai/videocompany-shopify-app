import { useEffect, useMemo, useRef, useState } from "react";
import { useLoaderData, useLocation } from "react-router";
import { SHOPIFY_BILLING_TEST_MODE } from "../billing-mode.server";
import { authenticate } from "../shopify.server";

const VIDEO_COMPANY_FRONTEND_URL = process.env.VITE_VIDEO_COMPANY_FRONTEND_URL || "http://localhost:3000";
const SHOPIFY_IFRAME_BOOTSTRAP_EVENT = "clipwise:shopify-bootstrap";
const SHOPIFY_IFRAME_READY_EVENT = "clipwise:shopify-ready";

const normalizeProduct = (product) => {
  const images = Array.isArray(product?.images?.nodes)
    ? product.images.nodes.map((image, index) => ({
        id: `${product.id}-image-${index}`,
        url: image?.url || "",
        altText: image?.altText || "",
      }))
    : [];

  return {
    id: product.id,
    title: product.title || "Product",
    description: product.description || "",
    images,
  };
};

const buildSelectedProductPayload = (product, image) => {
  if (!product || !image) return null;

  return {
    id: `${product.id}::${image.id}`,
    clientId: `${product.id}::${image.id}`,
    shopifyProductId: product.id,
    name: product.title,
    title: product.title,
    description: product.description || "",
    url: image.url,
    previewUrl: image.url,
    thumbnail: image.url,
    image,
    images: [image],
    allImages: product.images,
    raw: {
      shopifyProductId: product.id,
      title: product.title,
      description: product.description || "",
      image,
      images: product.images,
    },
    status: "ready",
    progress: 100,
    productTypePolling: false,
  };
};

export const loader = async ({ request }) => {
  const { admin, session, billing } = await authenticate.admin(request);
  const url = new URL(request.url);

  const [productsResponse, shopResponse, billingResponse] = await Promise.all([
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
  const activeSubscription = billingResponse?.appSubscriptions?.[0] || null;

  return {
    appOrigin: url.origin,
    frontendUrl: VIDEO_COMPANY_FRONTEND_URL,
    products,
    shop: shopJson?.data?.shop || null,
    sessionShop: session.shop,
  };
};

export default function AppHomePage() {
  const { appOrigin, frontendUrl, products, shop, sessionShop } = useLoaderData();
  const location = useLocation();
  const iframeRef = useRef(null);
  const [isIframeReady, setIsIframeReady] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1440 : window.innerWidth,
  );
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || "");
  const [selectedProductImages, setSelectedProductImages] = useState(() => {
    const firstProduct = products[0];
    if (!firstProduct?.images?.[0]) return [];
    return [
      {
        id: `${firstProduct.id}-image-0`,
        url: firstProduct.images[0].url,
        altText: firstProduct.images[0].altText || "",
      },
    ];
  });
  const [showAllProductsModal, setShowAllProductsModal] = useState(false);

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
    if (typeof window === "undefined") return undefined;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const expectedOrigin = new URL(frontendUrl).origin;

    const handleMessage = (event) => {
      if (event.origin !== expectedOrigin) return;

      if (event.data?.type === SHOPIFY_IFRAME_READY_EVENT) {
        setIsIframeReady(true);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [frontendUrl]);

  useEffect(() => {
    if (!isIframeReady || !iframeRef.current?.contentWindow || !iframeBootstrapPayload) return;

    iframeRef.current.contentWindow.postMessage(
      {
        type: SHOPIFY_IFRAME_BOOTSTRAP_EVENT,
        payload: iframeBootstrapPayload,
      },
      new URL(frontendUrl).origin,
    );
  }, [frontendUrl, iframeBootstrapPayload, isIframeReady]);

  const iframeSrc = `${frontendUrl.replace(/\/$/, "")}/shopify?parentOrigin=${encodeURIComponent(appOrigin)}`;

  const getProductImages = (product) =>
    Array.isArray(product?.images) ? product.images : [];

  const getPrimaryProductImageUrl = (product) => product?.images?.[0]?.url || "";

  const handleSelectProduct = (product) => {
    setSelectedProductId(product.id);
    const nextImages = getProductImages(product).map((image, index) => ({
      id: `${product.id}-image-${index}`,
      url: image?.url || "",
      altText: image?.altText || "",
    }));
    setSelectedProductImages(nextImages.slice(0, 1));
  };

  const handleToggleProductImage = (image) => {
    if (!image?.id) return;
    setSelectedProductImages((prev) => {
      const exists = prev.some((item) => item.id === image.id);
      if (exists) {
        if (prev.length === 1) return prev;
        return prev.filter((item) => item.id !== image.id);
      }
      return [image, ...prev].slice(0, 1);
    });
  };

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
          <div style={{ fontSize: 16, fontWeight: 600 }}>Select products to create creative content</div>
        </div>

        <div className="vc-scroll-hide" style={{ overflowX: "auto" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", minWidth: "max-content" }}>
            {visibleProducts.map((product) => {
              const isSelected = selectedProduct?.id === product.id;
              const productImages = getProductImages(product);
              const hasMultipleImages = productImages.length > 1;

              return (
                <div
                  key={product.id}
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
                    onClick={() => handleSelectProduct(product)}
                    style={{
                      width: "100%",
                      padding: 0,
                      borderRadius: "14px",
                      overflow: "hidden",
                      border: isSelected ? "2px solid #2563eb" : "1px solid #e5e7eb",
                      background: "#ffffff",
                      boxShadow: isSelected ? "0 6px 18px rgba(37, 99, 235, 0.12)" : "0 1px 3px rgba(15, 23, 42, 0.06)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ position: "relative", width: "100%", aspectRatio: "1 / 0.88", background: "#f8fafc" }}>
                      {productImages.length > 0 ? (
                        <img
                          src={getPrimaryProductImageUrl(product)}
                          alt={productImages[0]?.altText || product.title}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      ) : (
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280", fontSize: 12 }}>
                          No image
                        </div>
                      )}
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(15,23,42,0.85) 0%, rgba(15,23,42,0) 58%)" }} />
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
                    <div className="vc-scroll-hide" style={{ marginTop: "10px", overflow: "visible", paddingBottom: "2px", paddingRight: "10px", width: "max-content", minWidth: "100%", boxSizing: "border-box" }}>
                      <div style={{ display: "inline-flex", gap: "8px", minWidth: "max-content" }}>
                        {productImages.map((image, index) => {
                          const imageId = `${product.id}-image-${index}`;
                          const normalizedImage = { id: imageId, url: image?.url || "", altText: image?.altText || "" };
                          const isImageSelected = selectedProductImages.some((item) => item.id === imageId);
                          return (
                            <button
                              key={imageId}
                              type="button"
                              onClick={() => handleToggleProductImage(normalizedImage)}
                              style={{
                                width: "54px",
                                minWidth: "54px",
                                height: "54px",
                                borderRadius: "10px",
                                overflow: "hidden",
                                border: isImageSelected ? "2px solid #2563eb" : "1px solid #e5e7eb",
                                background: "#ffffff",
                                boxShadow: isImageSelected ? "0 4px 10px rgba(37, 99, 235, 0.12)" : "0 1px 2px rgba(15, 23, 42, 0.04)",
                                cursor: "pointer",
                                position: "relative",
                                padding: 0,
                              }}
                            >
                              <img src={image?.url || ""} alt={image?.altText || `${product.title} ${index + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                              {isImageSelected ? (
                                <div style={{ position: "absolute", top: "4px", right: "4px", background: "#2563eb", color: "#fff", borderRadius: "999px", width: "16px", height: "16px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}

            {products.length > 10 ? (
              <button
                type="button"
                onClick={() => setShowAllProductsModal(true)}
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
                <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "999px", background: "#eff6ff", fontSize: "22px", lineHeight: 1 }}>+</span>
                <span style={{ fontSize: "14px", lineHeight: 1.2 }}>View all ({products.length})</span>
              </button>
            ) : null}
          </div>
        </div>
      </div>

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

      {showAllProductsModal ? (
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
          onClick={() => setShowAllProductsModal(false)}
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
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: isMobileViewport ? "14px 16px" : "18px 20px", borderBottom: "1px solid #e1e3e5" }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>All Products ({products.length})</div>
              <button type="button" onClick={() => setShowAllProductsModal(false)} style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#6b7280", fontSize: "20px", lineHeight: 1 }}>×</button>
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
                    onClick={() => {
                      handleSelectProduct(product);
                      setShowAllProductsModal(false);
                    }}
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      padding: 0,
                      background: isSelected ? "#f0f7ff" : "#ffffff",
                      border: isSelected ? "2.5px solid #2563eb" : "1px solid #edf2f7",
                      borderRadius: "12px",
                      boxShadow: isSelected ? "0 4px 12px rgba(37, 99, 235, 0.12)" : "0 1px 3px rgba(0,0,0,0.02)",
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      minHeight: isMobileViewport ? "168px" : isTabletViewport ? "210px" : "236px",
                      overflow: "hidden",
                    }}
                  >
                    {hasMultipleImages ? (
                      <div style={{ position: "absolute", top: "8px", left: "8px", background: "rgba(15, 23, 42, 0.72)", color: "#fff", borderRadius: "999px", padding: "3px 8px", fontSize: "11px", fontWeight: 700, zIndex: 2 }}>
                        {productImages.length} images
                      </div>
                    ) : null}
                    <div style={{ width: "100%", flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#fcfcfc", padding: isMobileViewport ? "6px" : "10px" }}>
                      {productImages.length > 0 ? (
                        <img src={getPrimaryProductImageUrl(product)} alt={productImages[0]?.altText || product.title} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "8px" }} />
                      ) : (
                        <div style={{ fontSize: 12, color: "#6b7280" }}>No Image</div>
                      )}
                    </div>
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%)", textAlign: "left", padding: isMobileViewport ? "22px 10px 9px 10px" : "26px 12px 10px 12px" }}>
                      <div style={{ fontSize: isMobileViewport ? "12px" : "14px", fontWeight: 700, color: "#ffffff", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", textShadow: "0 1px 2px rgba(0,0,0,0.4)", lineHeight: 1.2 }}>
                        {product.title}
                      </div>
                    </div>
                    {isSelected ? (
                      <div style={{ position: "absolute", top: "6px", right: "6px", background: "#2563eb", color: "#fff", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
