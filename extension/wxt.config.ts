import { defineConfig } from 'wxt';

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  dev: {
    server: { port: 9000 },
  },
  manifest: {
    name: 'Shiori Chan',
  }
});
