import { defineConfig } from "vite";
import { ViteEjsPlugin } from "vite-plugin-ejs";
import { home, about } from "./src/ts/data";
import classnames from "classnames";

export default defineConfig({
  plugins: [
    ViteEjsPlugin({
      classnames,
      data: {
        home,
        about,
      },
    }),
  ],
});
