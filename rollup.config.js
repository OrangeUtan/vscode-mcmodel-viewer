import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";
import path from "path";
import fs from "fs";

const production = !process.env.ROLLUP_WATCH;

export default fs
  .readdirSync(path.join(__dirname, "src", "webviews", "pages"))
  .map((input) => {
    const name = input.split(".")[0];
    return {
      input: "src/webviews/pages/" + input,
      output: {
        sourcemap: true,
        format: "iife",
        name: "app",
        file: "dist/webviews/" + name + ".js",
      },
      plugins: [
        svelte({
          dev: !production,
          emitCss: true,
          preprocess: sveltePreprocess(),
        }),
        resolve({
          browser: true,
          dedupe: ["svelte"],
        }),
        commonjs(),
        typescript({
          tsconfig: "src/webviews/tsconfig.json",
          sourceMap: !production,
          inlineSources: !production,
        }),
        css({output: 'bundle.css'}),
        production && terser(),
      ],
      watch: {
        clearScreen: false,
      },
    };
  });