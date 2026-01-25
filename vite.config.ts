
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {
      API_KEY: process.env.API_KEY,
      API_KEY_SECONDARY: process.env.API_KEY_SECONDARY,
      API_KEY_TERTIARY: process.env.API_KEY_TERTIARY,
      SUPABASE_URL: 'https://xgfzvqdcolrjysfqxqfm.supabase.co',
      SUPABASE_ANON_KEY: 'sb_publishable_O5N997Cs1xun3vtKfF8VZg_WEdrinf3'
    },
    'global': 'window'
  }
});
