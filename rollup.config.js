import svelte from "rollup-plugin-svelte";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import css from "rollup-plugin-css-only";
import sveltePreprocess from "svelte-preprocess";
import typescript from "@rollup/plugin-typescript";

const production = !process.env.ROLLUP_WATCH;

export default {
  input: "src/webview/main.ts",
  output: {
    sourcemap: true,
    format: "iife",
    name: "app",
    file: "dist/webview/main.js",
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
      tsconfig: "src/webview/tsconfig.json",
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