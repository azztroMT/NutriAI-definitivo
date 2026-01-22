
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.API_KEY_SECONDARY': JSON.stringify(process.env.API_KEY_SECONDARY),
    'process.env.API_KEY_TERTIARY': JSON.stringify(process.env.API_KEY_TERTIARY)
  }
});
