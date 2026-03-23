import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3001,
	  // This allows your specific ngrok URL through the security filter
    allowedHosts: ['unruminative-kaelyn-semirationalized.ngrok-free.dev'],
  },
});
