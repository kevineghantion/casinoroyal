import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'https://api.commerce.coinbase.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy, options) => {
          proxy.on('proxyReq', (proxyReq, req, res) => {
            if (req.url === '/api/crypto-deposit') {
              proxyReq.setHeader('X-CC-Api-Key', 'ebe0c643-cbac-43ae-b083-76b90bd749e5');
              proxyReq.setHeader('X-CC-Version', '2018-03-22');
            }
          });
        }
      }
    }
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
