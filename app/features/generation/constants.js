export const DJANGO_BACKEND_URL =
  import.meta.env.VITE_DJANGO_BACKEND_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:8000";

export const CLIPWISE_AUTH_STORAGE_KEY = "clipwise-shopify-auth";

export const CLIPWISE_ENDPOINTS = {
  login: "/core/api/login/",
  register: "/core/api/register/",
  firebaseAuth: "/core/api/firebase-auth/",
  refresh: "/core/api/refresh/",
  logout: "/core/api/logout/",
  userContext: "/core/api/user-context/",
};

export const PLAN_FLOW = {
  UGC: "ugc",
  UGC_CLONE: "ugc_clone",
  ACTOR: "actor",
  MODEL: "model",
  PRODUCT_BACKGROUND: "product_background",
  BROLL: "broll",
  IMAGE_TO_VIDEO: "image_to_video",
  TEXT_TO_IMAGE: "text_to_image",
  VIDEO_TO_TEXT: "video_to_text",
  STATIC_AD: "static_ad",
};

export const TEMPLATE_NAME_TO_FLOW = {
  ugc_video: PLAN_FLOW.UGC,
  ugc_clone: PLAN_FLOW.UGC_CLONE,
  ugc_actor_video: PLAN_FLOW.ACTOR,
  ugc_model_shoot: PLAN_FLOW.MODEL,
  ugc_product_background: PLAN_FLOW.PRODUCT_BACKGROUND,
  b_roll_video: PLAN_FLOW.BROLL,
  image_to_video: PLAN_FLOW.IMAGE_TO_VIDEO,
  text_to_image: PLAN_FLOW.TEXT_TO_IMAGE,
  video_to_text: PLAN_FLOW.VIDEO_TO_TEXT,
  static_ad: PLAN_FLOW.STATIC_AD,
};

export const FLOW_META = {
  [PLAN_FLOW.UGC]: {
    label: "UGC",
    description: "Product-led UGC videos with an AI actor",
    emoji: "🎬",
    generates: "video",
  },
  [PLAN_FLOW.UGC_CLONE]: {
    label: "Clone Yourself",
    description: "Clone face and voice for product videos",
    emoji: "👥",
    generates: "video",
  },
  [PLAN_FLOW.ACTOR]: {
    label: "Talking Head",
    description: "Actor-led videos with voice and background",
    emoji: "🗣️",
    generates: "video",
  },
  [PLAN_FLOW.MODEL]: {
    label: "Model Shoot",
    description: "Generate model/product variations and optional video",
    emoji: "📸",
    generates: "image",
  },
  [PLAN_FLOW.PRODUCT_BACKGROUND]: {
    label: "Product Background",
    description: "Generate product shots with AI backgrounds",
    emoji: "🖼️",
    generates: "image",
  },
  [PLAN_FLOW.BROLL]: {
    label: "Bulk B-roll",
    description: "Generate multiple b-roll situations from your product",
    emoji: "🎥",
    generates: "image",
  },
  [PLAN_FLOW.IMAGE_TO_VIDEO]: {
    label: "Image To Video",
    description: "Animate the selected product image into video",
    emoji: "🎞️",
    generates: "video",
  },
  [PLAN_FLOW.TEXT_TO_IMAGE]: {
    label: "Text To Image",
    description: "Generate new product creative from text prompts",
    emoji: "✨",
    generates: "image",
  },
  [PLAN_FLOW.VIDEO_TO_TEXT]: {
    label: "Video To Text",
    description: "Extract script or transcript from an uploaded video",
    emoji: "📝",
    generates: "text",
  },
  [PLAN_FLOW.STATIC_AD]: {
    label: "Static Posts",
    description: "Generate static ad creatives for the selected product",
    emoji: "🧾",
    generates: "image",
  },
};

export const ASPECT_RATIOS = [
  { value: "9:16", label: "9:16 (Vertical)" },
  { value: "16:9", label: "16:9 (Horizontal)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "match_input_image", label: "Match input image" },
];

export const LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Hindi",
  "Portuguese",
];

export const CAMERA_MOTIONS = [
  "Static Shot",
  "Zoom In",
  "Zoom Out",
  "Pan Left",
  "Pan Right",
  "Tilt Up",
  "Tilt Down",
  "Dolly In",
  "Dolly Out",
];

export const DURATIONS = [
  { value: 3, label: "3 seconds" },
  { value: 5, label: "5 seconds" },
];

export const defaultFormState = {
  script: "",
  subtitles: false,
  directives: "",
  language: "English",
  productDescription: "",
  videoContext: "",
  aspectRatio: "9:16",
  variation: 2,
  adFormat: "",
  adType: "",
  customInstructions: "",
  prompt: "",
  duration: 3,
  cameraMotion: "Static Shot",
  generateVideoAfterImages: false,
  videoPrompt: "",
  productVideoPrompt: "",
  videoUrl: "",
  transcript: "",
  voiceCloneLanguage: "English",
};
