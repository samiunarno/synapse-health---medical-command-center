import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: false,
          process: true,
        },
        protocolImports: true,
      }),
    ],
    define: {
      'process.env.ZHIPU_API_KEY': JSON.stringify(env.ZHIPU_API_KEY),
      'process.env.ZHIPU_BASE_URL': JSON.stringify(env.ZHIPU_BASE_URL),
      'process.env.ZHIPU_MODEL': JSON.stringify(env.ZHIPU_MODEL),
      global: 'globalThis',
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
        'formdata-polyfill/esm.min.js': path.resolve(__dirname, 'src/lib/formdata-dummy.ts'),
        'formdata-polyfill': path.resolve(__dirname, 'src/lib/formdata-dummy.ts'),
        'node-fetch': path.resolve(__dirname, 'src/lib/fetch-dummy.ts'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
