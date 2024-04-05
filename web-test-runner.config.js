import {vitePlugin} from '@remcovaes/web-test-runner-vite-plugin';

export default {
  files: 'src/**/*.test.js',
  plugins: [vitePlugin()]
};
