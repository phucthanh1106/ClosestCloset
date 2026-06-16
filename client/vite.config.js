import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// When you run npm run dev, Vite starts a local server on your Mac that handles Vite Proxy
// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables based on the current working directory
  const env = loadEnv(mode, process.cwd(), '');

  // Fallback to localhost if no specific VITE_PROXY_TARGET is provided
  const proxyTarget = env.VITE_PROXY_TARGET || "http://localhost:4000";
  const chatbotTarget = env.VITE_PROXY_TARGET || "http://localhost:8000"

  return {
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        "/api": {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
        "/chatbot-api": {
          target:chatbotTarget,
          changeOrigin: true,
        }
      },
    },
  };
});
