export function normalizeProduct(product) {
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
}

export function buildSelectedProductPayload(product, image) {
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
}

export function getProductImages(product) {
  return Array.isArray(product?.images) ? product.images : [];
}

export function getPrimaryProductImageUrl(product) {
  return product?.images?.[0]?.url || "";
}

export function getFirstProductImage(product) {
  if (!product?.images?.[0]) return [];

  return [
    {
      id: `${product.id}-image-0`,
      url: product.images[0].url,
      altText: product.images[0].altText || "",
    },
  ];
}
