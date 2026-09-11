import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { copyFile } from 'node:fs/promises';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-apache-spa-fallback',
      async writeBundle(outputOptions) {
        const outputDirectory = outputOptions.dir ?? path.resolve(__dirname, 'dist');
        await copyFile(path.resolve(__dirname, 'public', '.htaccess'), path.resolve(outputDirectory, '.htaccess'));
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
});
