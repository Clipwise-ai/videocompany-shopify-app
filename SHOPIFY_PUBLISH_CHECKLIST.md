# Shopify Publish Checklist

## Code Already Handled

- Billing test/live mode is controlled by `SHOPIFY_BILLING_TEST_MODE`
- Live billing now requires explicit plan prices:
  - `SHOPIFY_STARTER_MONTHLY_PRICE`
  - `SHOPIFY_CREATOR_MONTHLY_PRICE`
- Required compliance webhooks are registered in the app config
- Billing approval, billing check, and cancellation all use the shared test/live flag

## Values You Must Set Before Publish

### Shopify app host

Update both config files:

- `shopify.app.toml`
- `shopify.app.videocompany2.toml`

Replace:

- `application_url = "https://example.com"`
- `redirect_urls = [ "https://example.com/auth/callback", "https://example.com/auth/shopify/callback" ]`

with your real deployed Shopify app hostname.

This must be the hostname serving the Node Shopify app, not just the static frontend or Django API.

### Shopify app environment

Set these on the deployed Shopify app:

- `SHOPIFY_APP_URL`
- `SHOPIFY_BILLING_TEST_MODE=false`
- `SHOPIFY_STARTER_MONTHLY_PRICE=<real starter monthly price>`
- `SHOPIFY_CREATOR_MONTHLY_PRICE=<real creator monthly price>`
- `DJANGO_BACKEND_URL=<real crm-generic base url>`
- `SHOPIFY_INTERNAL_SYNC_SECRET=<shared secret>`
- `SCOPES=read_products`

### Django backend environment

Set this on `crm-generic`:

- `SHOPIFY_INTERNAL_SYNC_SECRET=<same shared secret>`

## Backend Data You Must Seed

For the `video_company` platform, ensure `PaymentPlan` rows exist and are active with:

- `shopify_plan_key_monthly = starter_monthly`
- `shopify_plan_key_monthly = creator_monthly`

or the matching yearly keys if/when yearly plans are added.

The backend sync path resolves plan mapping from these fields.

## Required Publish QA

1. Install app on a Shopify dev store.
2. Open embedded app and confirm product loading works.
3. Subscribe to Starter and confirm:
   - Shopify approves billing
   - backend `ShopifyStoreConnection` is created/updated
   - backend `Subscription` is active
   - backend `PaymentTransaction` is created
   - credits are granted once
4. Re-open app and confirm billing is recognized without re-purchase.
5. Cancel plan and confirm backend status updates.
6. Uninstall app and confirm backend cancellation/disconnect state updates.
7. Replay the same webhook or sync event and confirm no duplicate credits are added.

## Release Rule

Do not publish with:

- `SHOPIFY_BILLING_TEST_MODE=true`
- `application_url = "https://example.com"`
- missing live plan price env vars
- missing backend plan mappings
