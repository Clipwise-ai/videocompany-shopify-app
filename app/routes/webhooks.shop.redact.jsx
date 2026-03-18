import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Since you don't store much data, we just acknowledge the request.
  // If you later add a database that stores specific customer data, 
  // you would delete the shop's data here.

  return new Response();
};
