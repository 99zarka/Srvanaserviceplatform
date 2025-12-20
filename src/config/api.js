const BASE_URL = import.meta.env.MODE === 'production'
  ? "https://srvanabackend-268062404120.us-central1.run.app/api"
  : "http://localhost:8000/api";

export const AI_CHAT_BASE_URL = BASE_URL + '/ai';

// Cloudinary configuration for direct frontend uploads
export const CLOUDINARY_CLOUD_NAME = "dpcqmcm0x"; // Replace with your actual Cloudinary cloud name
export const CLOUDINARY_UPLOAD_PRESET = "ml_default"; // Replace with your actual Cloudinary upload preset

export default BASE_URL;
