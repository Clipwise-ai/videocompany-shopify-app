import { DJANGO_BACKEND_URL } from "../constants";

export async function createProductMedia({
  accessToken,
  selectedProduct,
  createType,
  form,
  shop,
}) {
  const imageUrl = selectedProduct?.images?.nodes?.[0]?.url;

  return fetch(`${DJANGO_BACKEND_URL}/video-company/api/v1/media/products/create/`, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      url: imageUrl,
      name: selectedProduct.title,
      description: form.productDescription,
      meta: {
        create_type: createType,
        ...form,
        shop: { id: shop.id, name: shop.name, domain: shop.myshopifyDomain },
      },
    }),
  });
}
