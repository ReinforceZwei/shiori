import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react", "@wxt-dev/auto-icons"],
  dev: {
    server: { port: 9000 },
  },
  manifest: ({ browser, manifestVersion }) => ({
    name: "Shiori Chan",
    commands: {
      // Chrome uses Manifest V3 with _execute_action
      // Firefox uses Manifest V2 with _execute_browser_action
      [manifestVersion === 2 ? "_execute_browser_action" : "_execute_action"]: {
        suggested_key: {
          default: "Ctrl+Shift+F",
        },
      },
    },
  }),
});
