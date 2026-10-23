/**
 * Centralized API configuration for Speech Studio frontend.
 * Uses VITE_API_BASE_URL from Vite environment variables, falling back to the deployed backend URL on Render.
 */
export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://multilanguage-xjdc.onrender.com'
).replace(/\/+$/, '');
