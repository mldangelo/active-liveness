const path = require("path");
const webpack = require("webpack"); // add this

module.exports = {
  entry: "./src/client/script.tsx",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
    alias: {
      react: "preact/compat",
      "react-dom/test-utils": "preact/test-utils",
      "react-dom": "preact/compat", // Must be below test-utils
      "react/jsx-runtime": "preact/jsx-runtime",
    },
  },
  output: {
    filename: "script.js",
    path: path.resolve(__dirname, "public"), // output the bundle to the public directory
  },
  // Add the following devServer configuration
  devServer: {
    static: path.join(__dirname, "public"),
    hot: true,
    port: 3000,
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
};
