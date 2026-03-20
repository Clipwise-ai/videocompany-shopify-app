import { redirect } from "react-router";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { useState } from "react";
import { Form, useActionData, useLoaderData } from "react-router";
import { getStoredShop } from "../../shop-cookie.server";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  const requestedShop = String(url.searchParams.get("shop") || "").trim();
  const storedShop = getStoredShop(request);

  if (!requestedShop && storedShop) {
    throw redirect(`/auth/login?shop=${encodeURIComponent(storedShop)}`);
  }

  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const action = async ({ request }) => {
  const requestClone = request.clone();
  const formData = await requestClone.formData();
  const submittedShop = String(formData.get("shop") || "").trim();
  const storedShop = getStoredShop(request);

  if (!submittedShop && storedShop) {
    throw redirect(`/auth/login?shop=${encodeURIComponent(storedShop)}`);
  }

  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <AppProvider embedded={false}>
      <s-page>
        <Form method="post">
          <s-section heading="Log in">
            <s-text-field
              name="shop"
              label="Shop domain"
              details="example.myshopify.com"
              value={shop}
              onChange={(e) => setShop(e.currentTarget.value)}
              autocomplete="on"
              error={errors.shop}
            ></s-text-field>
            <s-button type="submit">Log in</s-button>
          </s-section>
        </Form>
      </s-page>
    </AppProvider>
  );
}
