/* eslint-disable no-underscore-dangle */
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  entry: "./src/webSocket_server/index.ts",
  mode: "production",
  target: "node",

  output: {
    filename: "index.js",
    path: resolve(__dirname, "dist"),
  },
  externals: {
    bufferutil: "bufferutil",
    "utf-8-validate": "utf-8-validate",
  },
  plugins: [],
  module: {
    rules: [
      {
        test: /\.ts?$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
