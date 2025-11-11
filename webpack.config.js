const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    background: path.resolve(__dirname, "src", "background.ts"),
    content: path.resolve(__dirname, "src", "content.ts"),
    options: path.resolve(__dirname, "src", "options.ts"),
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name].js",
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "manifest.json" },
        { from: "src/options.html", to: "options.html" },
        { from: "src/styles.css", to: "styles.css" },
      ],
    }),
  ],
};
