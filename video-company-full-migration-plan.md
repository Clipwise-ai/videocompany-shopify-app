# Video Company Full Migration Plan

Goal: replicate the `video-company-frontend` planning experience inside the Shopify app as closely as possible, using Tailwind for UI migration, while keeping Shopify product selection and the existing backend APIs.

Scope:
- exact left panel UI/UX
- exact right panel generated output/history/instruction areas
- exact modal structure for product, voice, avatar, background, pose, preview
- same flow-specific field rendering by video format
- same backend/API behavior where possible
- Shopify app remains embedded, but UX should feel like the frontend planning screen

Out of scope for this document:
- backend feature creation from scratch
- changing business logic without a frontend reference
- replacing Shopify auth/session architecture

## Frontend Source Of Truth

Primary page/container:
- [`VideoCompanyPlan.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/pages/plan/VideoCompanyPlan.jsx)

Primary left panel:
- [`VideoCompanyPlanCard.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/VideoCompanyPlanCard.jsx)

Primary right panel/history:
- [`PlanHistoryPanel.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/PlanHistoryPanel.jsx)

Flow files:
- [`UgcActorFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/UgcActorFlow.jsx)
- [`UgcCloneFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/UgcCloneFlow.jsx)
- [`BrollFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/BrollFlow.jsx)
- [`ModelBackgroundFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/ModelBackgroundFlow.jsx)
- [`StaticAdFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/StaticAdFlow.jsx)
- [`ImageToVideoFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/ImageToVideoFlow.jsx)
- [`TextToImageFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/TextToImageFlow.jsx)
- [`TextToAudioFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/TextToAudioFlow.jsx)
- [`VideoToTextFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/VideoToTextFlow.jsx)
- [`AvatarLipsyncFlow.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/flows/AvatarLipsyncFlow.jsx)

Selection modals:
- [`ProductSelectionModal.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/ProductSelectionModal.jsx)
- [`VideocompanyVoiceSelectionModal.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/VideocompanyVoiceSelectionModal.jsx)
- [`VideocompanyAvatarSelectionModal.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/VideocompanyAvatarSelectionModal.jsx)
- [`VideocompanyBackgroundSelectionModal.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/VideocompanyBackgroundSelectionModal.jsx)
- [`VideocompanyPoseSelectionModal.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/VideocompanyPoseSelectionModal.jsx)

Shared modal/layout helpers:
- [`SelectResourceModal.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/SelectResourceModal.jsx)
- [`ModalFilterControls.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/ModalFilterControls.jsx)
- [`SelectResourceModalSkeleton.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/SelectResourceModalSkeleton.jsx)

Utilities:
- [`planutil.js`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/pages/plan/planutil.js)
- [`videoCompanyPlanPrefill.js`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/utils/videoCompanyPlanPrefill.js)
- [`useVideoCompanyProductFlow.js`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/hooks/useVideoCompanyProductFlow.js)

## Video Format Inventory To Support

Based on frontend flow mapping in [`planutil.js`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/pages/plan/planutil.js):

- `ugc_video` -> UGC
- `ugc_clone` -> Clone yourself
- `ugc_actor_video` -> Talking head / Actor
- `avatar_lipsync` -> Lipsync
- `ugc_model_shoot` -> Model shoot
- `ugc_product_background` -> Product background
- `b_roll_video` -> Bulk b-roll
- `image_to_video` -> Image to video
- `text_to_image` -> Generate image
- `text_to_audio` -> Generate audio
- `video_to_text` -> Extract script / Video to text
- `static_ad` -> Static posts / Static ad

Rule:
- no hardcoded fake formats in Shopify
- backend `video-formats` endpoint remains source of truth
- UI should switch by backend format `templateName` and `id`

## Shopify Target Area

Current Shopify files to migrate into Tailwind-first structure:
- [`app/routes/app._index.jsx`](/Users/bamacharanchhandogi/Work/videocompanytest/app/routes/app._index.jsx)
- [`app/features/generation/components/GenerationFlowForm.jsx`](/Users/bamacharanchhandogi/Work/videocompanytest/app/features/generation/components/GenerationFlowForm.jsx)
- [`app/features/generation/components/GeneratedOutputsPanel.jsx`](/Users/bamacharanchhandogi/Work/videocompanytest/app/features/generation/components/GeneratedOutputsPanel.jsx)
- [`app/features/generation/components/CreateTypeDropdown.jsx`](/Users/bamacharanchhandogi/Work/videocompanytest/app/features/generation/components/CreateTypeDropdown.jsx)
- [`app/features/generation/components/ResourcePickerModal.jsx`](/Users/bamacharanchhandogi/Work/videocompanytest/app/features/generation/components/ResourcePickerModal.jsx)

## Migration Strategy

Use Tailwind for all newly migrated UI layers.

Keep:
- Shopify embedded app shell
- Shopify product loading/auth/session
- existing Clipwise API clients

Replace progressively:
- inline style-heavy UI
- generic picker modal structure
- simplified output panel
- simplified left panel field layout

## Phases

### Phase 1: App Shell Parity

Replicate the high-level layout of frontend planning screen:
- viewport-height shell
- left panel sticky
- right panel sticky
- internal scroll areas only
- mobile behavior pattern

Tasks:
- create Tailwind layout wrapper component for Shopify planning screen
- move current inline layout styles into Tailwind classes
- preserve current sticky generate footer and internal scroll behavior

Pass criteria:
- left and right panel structure matches frontend shell behavior
- no page-jump caused by local layout

### Phase 2: Create Type + Left Panel Base

Replicate the base left card from frontend:
- create type dropdown
- field section spacing
- labels, helper text, control sizing
- footer CTA styling

Tasks:
- port core panel spacing and typography from `VideoCompanyPlanCard.jsx`
- migrate current form card to Tailwind
- normalize button, input, textarea, selector tile styles

Pass criteria:
- left panel visually matches frontend base card before flow-specific details

### Phase 3: Product Selection Experience

Replicate the product layer:
- selected product row/tile in left panel
- product selection modal
- product thumbnails
- product state/loading states

Tasks:
- rebuild Shopify product grid and `View all` modal using frontend product modal structure where sensible
- map Shopify products into frontend-like product card UI
- keep Shopify as the data source, but match frontend presentation

Pass criteria:
- product tile and product modal feel frontend-exact, while still using Shopify product data

### Phase 4: Resource Picker Modal Parity

Replicate exact modal families:
- Voice modal
- Avatar modal
- Background modal
- Pose modal

Tasks:
- split current generic picker into dedicated Tailwind modal components
- copy structure from frontend modal files
- preserve bookmark/filter/tab behaviors
- preserve API wiring already working in Shopify

Pass criteria:
- modal structure and controls match frontend, not “approximate”

### Phase 5: UGC + Talking Head

Replicate:
- UGC flow
- Talking head / Actor flow

Tasks:
- port UI structure from `UgcActorFlow.jsx`
- match selector row, script area, subtitle toggle, product description, actor/location sections
- keep current Shopify API wiring

Pass criteria:
- UGC and Talking head look and behave like frontend left panel

### Phase 6: Clone Yourself

Replicate:
- clone form
- upload tile UI
- location and language controls

Tasks:
- port visual structure from `UgcCloneFlow.jsx`
- keep clone face image and voice sample upload logic
- match upload tiles and validation states

Pass criteria:
- clone screen is frontend-parity, not browser-default upload UI

### Phase 7: Bulk B-roll

Replicate:
- stepper
- situation field
- variations
- history/review behavior for generated b-roll assets

Tasks:
- port left panel from `BrollFlow.jsx`
- port right-side review/history states relevant to b-roll
- ensure b-roll workflow outputs appear in right panel correctly

Pass criteria:
- b-roll flow matches frontend structure and generated results handling

### Phase 8: Model Shoot + Product Background

Replicate:
- model shoot
- product background

Tasks:
- port left panel patterns from `ModelBackgroundFlow.jsx` and `VideoCompanyPlan.jsx`
- port variation grid/review behavior where relevant
- preserve current working workflow APIs

Pass criteria:
- both image-generation flows visually match frontend and use correct API payloads

### Phase 9: Static Posts / Static Ad

Replicate:
- ad format
- ad type
- reference ad picker
- static ad review flow

Tasks:
- port UI and modal structure from `StaticAdFlow.jsx`
- port reference ad modal styling
- preserve current backend request path

Pass criteria:
- static ad flow matches frontend fields, modal structure, and result handling

### Phase 10: Image To Video / Generate Image / Generate Audio / Video To Text / Lipsync

Replicate:
- image to video
- text to image
- text to audio
- video to text
- avatar lipsync

Tasks:
- create Shopify Tailwind flow components matching each frontend flow file
- map current service functions into the same flow entry points
- preserve selected video format and templateName handling

Pass criteria:
- every format visible in frontend has a matching Shopify left panel and working flow

### Phase 11: Right Panel Full Migration

Replicate full right-side behavior from frontend:
- generated outputs
- history feed
- instruction/review states
- media cards
- preview modals
- loading cards
- error cards

Source of truth:
- [`PlanHistoryPanel.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/PlanHistoryPanel.jsx)
- [`MediaPreviewModal.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/MediaPreviewModal.jsx)
- [`HistorySampleTabs.jsx`](/Users/bamacharanchhandogi/Work/video-company-frontend/src/components/components-plan/HistorySampleTabs.jsx)

Tasks:
- rebuild Shopify `GeneratedOutputsPanel` into a Tailwind history/review panel
- add preview modal parity
- map current output records into frontend-style cards

Pass criteria:
- right panel is no longer simplified; it feels like frontend history/review UI

### Phase 12: State + Prefill + Flow Resume

Replicate the important frontend state behaviors:
- prefill/resume
- flow-aware selected format state
- variation phase state
- history hydration where possible

Tasks:
- study `videoCompanyPlanPrefill.js`
- map existing Shopify state into reusable Tailwind flow containers
- ensure switching formats does not leak stale fields

Pass criteria:
- Shopify planning UX behaves like frontend when changing formats or revisiting generated items

### Phase 13: Cleanup

Tasks:
- remove dead inline-style code
- reduce route file size further
- split Tailwind components by flow
- centralize reusable UI primitives

Pass criteria:
- no giant route-driven UI file
- flow components are isolated and readable

## Recommended Tailwind Component Structure

Suggested target inside Shopify app:

- `app/features/video-company/layout/`
- `app/features/video-company/flows/`
- `app/features/video-company/modals/`
- `app/features/video-company/history/`
- `app/features/video-company/ui/`
- `app/features/video-company/utils/`

Examples:
- `layout/VideoCompanyShell.jsx`
- `layout/VideoCompanyLeftPanel.jsx`
- `layout/VideoCompanyRightPanel.jsx`
- `flows/UgcActorFlow.jsx`
- `flows/UgcCloneFlow.jsx`
- `flows/BrollFlow.jsx`
- `flows/ModelBackgroundFlow.jsx`
- `flows/StaticAdFlow.jsx`
- `modals/VoiceSelectionModal.jsx`
- `modals/AvatarSelectionModal.jsx`
- `modals/BackgroundSelectionModal.jsx`
- `history/PlanHistoryPanel.jsx`

## API Wiring Rule

UI migration rule:
- do not rewrite working backend clients unless needed
- move current API calls into flow-specific containers
- keep Shopify service files as the backend integration layer

Expected backend connections already available or partially available in Shopify:
- video formats
- voices
- avatars
- backgrounds
- poses
- bookmarks
- workflow start/status
- media upload/status
- subject variations
- image-to-video
- text-to-image
- video-to-text
- static ad resources

## Execution Order

Recommended working order:
1. Phase 1
2. Phase 2
3. Phase 4
4. Phase 5
5. Phase 6
6. Phase 7
7. Phase 8
8. Phase 9
9. Phase 10
10. Phase 11
11. Phase 12
12. Phase 13

Why this order:
- shell and base panel first
- modals early because many flows depend on them
- common/high-traffic flows next
- right panel/history after left flows are stable

## Review Checklist For Each Phase

For every migrated phase, check:
- exact visual parity with frontend
- responsive behavior
- sticky/scroll behavior
- no stale fields from other formats
- backend format id/template mapping still correct
- no hardcoded format source
- Shopify embedded layout still stable

## Current Direction

Tailwind is now available in Shopify, so all new migration work should prefer Tailwind components instead of adding more inline style objects.
