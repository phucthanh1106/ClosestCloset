// API Configuration
// Uses environment variable in production, falls back to relative path for development proxy


// import.meta.env.DEV (Boolean)
// true in development
// false in production

// import.meta.env.PROD (Boolean)
// true in production
// false in development

// import.meta.env.MODE (String)
// Returns "development" or "production"
// How your current setup works:

// Development: VITE_API_BASE_URL is undefined → uses empty string "" → Vite proxy redirects to localhost:4000
// Production: VITE_API_BASE_URL = https://closestcloset-backend.onrender.com → uses full URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const CHATBOT_API_BASE_URL = import.meta.env.VITE_CHATBOT_API_BASE_URL || "";

export default API_BASE_URL;
