import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // For a free app without deep customer data storage, 
  // logging the request is often sufficient validation for now.

  return new Response("ok", { status: 200 });
};
