import {resolve} from 'path';
import {defineConfig} from 'vite';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  build: {
    minify: false,
    target: 'esnext',
    lib: {
      /* global __dirname */
      entry: resolve(__dirname, 'src/main.js'),
      name: 'Heretto Help',
      fileName: 'lib/main',
      formats: ['es']
    },
    rollupOptions: {
      output: {
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name || '')) {
            return 'assets/images/[name][extname]';
          }

          if (/\.css$/.test(name || '')) {
            return 'assets/styles/[name][extname]';
          }

          return 'assets/[name][extname]';
        }
      }
    }
  },
  css: {
    preprocessorOptions: {
      less: {
        math: 'always',
        relativeUrls: true,
        javascriptEnabled: true
      }
    },
    postcss: {
      plugins: [autoprefixer()]
    }
  }
});
