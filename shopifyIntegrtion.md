# Shopify Integration API Guide

This document describes the Shopify billing integration added for the `video_company` platform.

It is written for:
- the Shopify app/backend team sending billing webhooks into this backend
- frontend engineers who need to know which APIs exist, what data they return, and what state to show

## Important

These Shopify endpoints are **internal signed endpoints**.

- Base path: `/api/shopify/internal/`
- They are protected by HMAC headers using `SHOPIFY_INTERNAL_SYNC_SECRET`
- They should **not** be called directly from a browser or public frontend, because the signing secret must stay server-side

Recommended usage:
- Shopify frontend -> your Shopify app backend
- Shopify app backend -> these internal Clipwise endpoints

## Authentication

Every request to `/api/shopify/internal/*` must include:

- `X-CLIPWISE-SIGNATURE`
- `X-CLIPWISE-TIMESTAMP`

The backend verifies:
- timestamp is within 300 seconds
- body is valid UTF-8
- signature matches:

```text
sha256(secret, "{timestamp}.{request_full_path}.{raw_body}")
```

Notes:
- For `GET` endpoints, `request_full_path` includes query params.
- Signature may be sent as raw hex or `sha256=<hex>`.
- Invalid signature returns `403`.

Typical permission failure response:

```json
{
  "detail": "Invalid Shopify sync signature."
}
```

The exact `detail` message may also be:
- `Missing Shopify sync signature headers.`
- `Invalid Shopify sync timestamp.`
- `Expired Shopify sync timestamp.`
- `Invalid Shopify sync payload.`
- `Invalid Shopify sync signature.`

## Data Model Expectations

### Company

The company may store:

- `video_company_shopify_customer_id`

This is used to resolve the company from Shopify requests when `company_id` is not sent.

Rules:
- optional
- unique for non-null / non-empty values
- can be linked during successful sync/cancel flows

### PaymentPlan

Each Shopify plan must map to an internal `PaymentPlan` using:

- `shopify_plan_key_monthly`
- `shopify_plan_key_yearly`
- `shopify_display_plan_name`

`plan_key` in incoming Shopify payloads is resolved against those fields.

## Status Mapping

Incoming Shopify billing status is mapped like this:

- `ACTIVE` -> local `active`
- `ACCEPTED` -> local `pending`
- `PENDING` -> local `pending`
- `PAST_DUE` -> local `past_due`
- `FROZEN` -> local `suspended`
- `CANCELLED`, `CANCELED`, `DECLINED`, `EXPIRED` -> local `canceled`

Special rule:
- if Shopify sends a canceled status but `current_period_end` is still in the future, the local subscription stays `active` and `cancel_at_period_end=true`

## Endpoint Summary

Available internal endpoints:

- `POST /api/shopify/internal/subscription-sync/`
- `POST /api/shopify/internal/subscription-cancel/`
- `GET /api/shopify/internal/subscription-status/`
- `GET /api/shopify/internal/pricing-catalog/`

## 1. Subscription Sync

Endpoint:

```text
POST /api/shopify/internal/subscription-sync/
```

Purpose:
- create or update the local Shopify subscription
- optionally create a local `PaymentTransaction`
- add credits for successful paid purchase / renewal events

### Request body

```json
{
  "company_id": "uuid-optional",
  "customer_id": "shopify-customer-id-optional-if-company-id-present",
  "shop": {
    "domain": "my-store.myshopify.com",
    "shop_id": "123456",
    "email": "owner@example.com",
    "name": "My Store"
  },
  "billing": {
    "provider": "shopify",
    "subscription_id": "gid://shopify/AppSubscription/123",
    "status": "ACTIVE",
    "plan_key": "pro-monthly",
    "interval": "EVERY_30_DAYS",
    "currency": "USD",
    "amount": "29.00",
    "test": false,
    "current_period_start": "2026-03-19T10:00:00Z",
    "current_period_end": "2026-04-19T10:00:00Z",
    "cancelled_at": null,
    "line_item_id": "gid://shopify/AppSubscriptionLineItem/456"
  },
  "event": {
    "type": "subscription_purchased",
    "source": "shopify_webhook",
    "occurred_at": "2026-03-19T10:00:01Z",
    "event_id": "shopify-event-123"
  }
}
```

### Required fields

Top level:
- `billing`
- `event`
- at least one of `company_id` or `customer_id`

Inside `billing`:
- `subscription_id`
- `status`
- `plan_key`

Also required when status is one of:
- `ACTIVE`
- `ACCEPTED`
- `PAST_DUE`
- `PENDING`
- `FROZEN`

In those cases, `billing.current_period_end` is required.

Inside `event`:
- `type`
- `event_id`

### Important behavior

Company resolution:
- If `company_id` is sent, that company is used.
- If `customer_id` is sent, it can also be stored on the company for future resolution.
- If only `customer_id` is sent, backend resolves the company by `video_company_shopify_customer_id`.

Plan resolution:
- `billing.plan_key` must match one Shopify plan key on an internal `PaymentPlan`.

Idempotency:
- `event.event_id` is used as the main idempotency key for transaction creation.

Subscription upsert:
- local subscription provider is `shopify`
- local subscription identity is `billing.subscription_id`
- existing Shopify subscriptions cannot be reassigned to another company

Transaction creation:
- transactions are created only for paid Shopify status `ACTIVE`
- initial purchase events are recognized from:
  - `subscription_approved`
  - `subscription_purchased`
- renewal events are recognized when `event.type` contains `renew`
- renewals only create a new transaction if `current_period_end` advanced beyond the previous period end

Credits:
- credits are granted from the mapped `PaymentPlan`
- yearly vs monthly credits are inferred from `plan_key` or `interval`
- test charges create a transaction with `0` credited units

Cancellation state during sync:
- if Shopify status is canceled but the period is still active, local subscription is kept active with `cancel_at_period_end=true`

### Success response

```json
{
  "success": true,
  "subscription_id": "local-subscription-uuid",
  "provider_subscription_id": "gid://shopify/AppSubscription/123",
  "transaction_id": "local-payment-transaction-uuid",
  "customer_id": "shopify-customer-id"
}
```

`transaction_id` can be `null` when:
- the event was not billable
- the event was idempotent / already processed
- the billing period did not advance on a renewal replay

### Error responses

`400` examples:

```json
{
  "error": "No PaymentPlan found for Shopify plan key 'pro-monthly'."
}
```

```json
{
  "error": "No user found for company <company-id>"
}
```

`409` examples:

```json
{
  "error": "Shopify customer id is already linked to another company."
}
```

```json
{
  "success": false,
  "error": "Local Shopify subscription not found for idempotent sync result.",
  "transaction_id": "existing-transaction-uuid"
}
```

`400` serializer validation errors use DRF’s normal shape, for example:

```json
{
  "billing": {
    "plan_key": "This field is required for subscription sync."
  }
}
```

## 2. Subscription Cancel

Endpoint:

```text
POST /api/shopify/internal/subscription-cancel/
```

Purpose:
- mark the local Shopify subscription canceled or cancel-at-period-end

### Request body

```json
{
  "company_id": "uuid-optional",
  "customer_id": "shopify-customer-id-optional-if-company-id-present",
  "shop": {
    "domain": "my-store.myshopify.com",
    "shop_id": "123456"
  },
  "billing": {
    "subscription_id": "gid://shopify/AppSubscription/123",
    "cancelled_at": "2026-03-25T10:00:00Z"
  },
  "event": {
    "type": "subscription_cancelled",
    "source": "shopify_webhook",
    "occurred_at": "2026-03-25T10:00:00Z",
    "event_id": "shopify-cancel-event-123"
  }
}
```

### Required fields

Top level:
- `event`
- at least one of `company_id` or `customer_id`

Optional:
- `billing`
- `billing.subscription_id`

If `billing.subscription_id` is omitted:
- backend cancels the latest Shopify subscription for that company on `video_company`

### Important behavior

- If subscription has a future `end_date`, backend sets:
  - `cancel_at_period_end=true`
  - `cancellation_reason="Cancelled through Shopify"`
  - `cancellation_date=<cancel timestamp>`
- If subscription is already expired / not in paid term, backend calls local cancel immediately.

Retry/idempotency behavior:
- if `billing.cancelled_at` is missing, backend preserves the existing cancellation timestamp on retries when possible
- `shopify_cancelled_at` in subscription meta also preserves the old value when the event did not provide one

### Success response

```json
{
  "success": true,
  "subscription_id": "local-subscription-uuid"
}
```

### Error responses

`409` if no local Shopify subscription could be found:

```json
{
  "success": false,
  "error": "Local Shopify subscription not found for cancellation."
}
```

`409` if customer id uniqueness conflicts:

```json
{
  "error": "Shopify customer id is already linked to another company."
}
```

## 3. Subscription Status

Endpoint:

```text
GET /api/shopify/internal/subscription-status/?company_id=<uuid>
```

or

```text
GET /api/shopify/internal/subscription-status/?customer_id=<shopify-customer-id>
```

Purpose:
- get the current local subscription state for a company
- use this to decide what Shopify UI should show

### Required query params

At least one of:
- `company_id`
- `customer_id`

### Response

```json
{
  "company_id": "company-uuid",
  "customer_id": "shopify-customer-id",
  "has_active_subscription": true,
  "subscription": {
    "id": "local-subscription-uuid",
    "provider": "shopify",
    "provider_subscription_id": "gid://shopify/AppSubscription/123",
    "status": "active",
    "plan_id": "payment-plan-uuid",
    "cancel_at_period_end": false,
    "billing_cycle": "monthly",
    "end_date": "2026-04-19T10:00:00+00:00"
  }
}
```

### Semantics

`subscription`:
- returns the current local subscription object if found
- this can still be present for suspended subscriptions, because frontend may still need plan/provider context

`has_active_subscription`:
- true only when the returned subscription is actually entitled
- logic:
  - `subscription.subscription_is_active == true`
  - or `cancel_at_period_end == true`

This means:
- suspended subscription can return `subscription != null` and `has_active_subscription=false`
- canceled-but-paid-through subscription can return `has_active_subscription=true`

If company cannot be resolved, response is still `200`:

```json
{
  "company_id": null,
  "customer_id": "unknown-customer-id",
  "has_active_subscription": false,
  "subscription": null
}
```

## 4. Pricing Catalog

Endpoint:

```text
GET /api/shopify/internal/pricing-catalog/
```

Purpose:
- return available Shopify-compatible plan catalog for `video_company`

### Response

```json
{
  "platform_slug": "video_company",
  "products": [
    {
      "...": "PaymentPlan.get_plans_for_platform(...) response"
    }
  ],
  "recommended_plan": "pro_v2",
  "special_event_discount_tag": {
    "enabled": "true",
    "text": "Weekend sale"
  }
}
```

Notes:
- this endpoint uses `listing_visible_only=False`
- hidden-but-valid Shopify plans can still be returned if configured that way in the backend

## Webhook / Event Guidance

The backend expects your Shopify-side integration layer to normalize Shopify events into the request shape above.

### Purchase webhook -> call `subscription-sync`

Use when:
- first purchase is approved
- first paid subscription becomes active

Recommended values:
- `event.type`: `subscription_purchased` or `subscription_approved`
- `event.source`: `shopify_webhook`
- `billing.status`: usually `ACTIVE`

### Renewal webhook -> call `subscription-sync`

Use when:
- Shopify renews billing for the next period

Recommended values:
- `event.type`: include the word `renew`
- example: `subscription_renewed`

Important:
- to grant another set of credits, `current_period_end` must move forward compared to the previous synced period

### Cancel webhook -> usually call `subscription-cancel`

Use when:
- the merchant cancels in Shopify billing

If cancel occurs immediately after a status sync that already marks the subscription canceled with future `current_period_end`, backend will still preserve paid-through behavior correctly.

Recommended values:
- `event.type`: `subscription_cancelled`
- `billing.cancelled_at`: send this when Shopify provides it
- `billing.subscription_id`: recommended, but optional

## Frontend Integration Notes

### Do not call these internal APIs directly from browser code

Because of HMAC signing, frontend should call your Shopify backend/proxy, not these endpoints directly.

### Typical Shopify app screen flow

1. App loads inside Shopify admin.
2. Shopify frontend asks your Shopify backend for current subscription status.
3. Your Shopify backend calls:
   - `GET /api/shopify/internal/subscription-status/`
4. Shopify frontend asks your Shopify backend for pricing catalog.
5. Your Shopify backend calls:
   - `GET /api/shopify/internal/pricing-catalog/`
6. Shopify frontend decides what to show:
   - if `has_active_subscription=true`, show active plan state
   - if `subscription.cancel_at_period_end=true`, show “active until <end_date>”
   - if `subscription.status="suspended"`, show recovery / billing issue UI
   - if no subscription, show Shopify purchase options

### UI rules aligned with current backend behavior

- Shopify-origin subscriptions must be cancelled from Shopify
- Website checkout uses Stripe/PayPal and remains separate
- Current subscription state is shared locally through the same `Subscription` model
- Shopify UI should use:
  - `has_active_subscription`
  - `subscription.status`
  - `subscription.cancel_at_period_end`
  - `subscription.end_date`
  - `subscription.billing_cycle`

### Suggested frontend display logic

- `has_active_subscription=true` and `cancel_at_period_end=false`
  - show active plan
- `has_active_subscription=true` and `cancel_at_period_end=true`
  - show active-until-end-date and “cancels at period end”
- `has_active_subscription=false` and `subscription.status="suspended"`
  - show billing issue / recovery state
- `subscription=null`
  - show available Shopify plans

## Example Signed Request Pseudocode

```js
const body = JSON.stringify(payload);
const timestamp = String(Math.floor(Date.now() / 1000));
const fullPath = "/api/shopify/internal/subscription-sync/";
const dataToSign = `${timestamp}.${fullPath}.${body}`;
const signature = createHmac("sha256", SHOPIFY_INTERNAL_SYNC_SECRET)
  .update(dataToSign)
  .digest("hex");

fetch(BASE_URL + fullPath, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-CLIPWISE-TIMESTAMP": timestamp,
    "X-CLIPWISE-SIGNATURE": `sha256=${signature}`
  },
  body
});
```

For `GET` requests, sign the full path including query string and use an empty body:

```text
{timestamp}.{full_path_with_query}.
```

## Backend Files

Main implementation files:
- `core/payments/shopify/urls.py`
- `core/payments/shopify/views.py`
- `core/payments/shopify/schemas.py`
- `core/payments/shopify/services.py`
- `core/models.py`
- `video/settings.py`
