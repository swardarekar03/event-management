// Central API config
// During local dev → http://localhost:5000/api
// On Vercel (production) → set VITE_API_BASE_URL in Vercel env vars
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://event-management-ak5b.onrender.com/api";
