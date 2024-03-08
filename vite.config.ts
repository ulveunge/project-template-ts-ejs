import { defineConfig } from "vite";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { home, about } from "./src/ts/data";
import classnames from "classnames";
import ViteBEMHelperPlugin from "./src/ts/plugins/vite-plugin-bem-helper";

export default defineConfig({
  plugins: [
    ViteBEMHelperPlugin(),
    ViteEjsPlugin({
      classnames,
      data: {
        home,
        about,
      },
    }),
  ],
});
