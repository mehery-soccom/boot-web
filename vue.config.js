const appConfig = require("./src/app.config.js");

process.env.VUE_APP_VERSION = require('./package.json').version;
process.env.VUE_APP_TIMESTAMP = Date.now();

const appName = process.env.VUE_APP_NAME || "default";
const publicPath = appConfig.getPublicPath(appName);
const appPath = appConfig.getAppPath(appName);

console.log("PAGES",appConfig.getPages())

module.exports = {
  runtimeCompiler: true,
  productionSourceMap: false,
  filenameHashing: false,

  publicPath: process.env.NODE_ENV === "production" ? "./" : "/",
  configureWebpack: config => {
    // Set output filename format
    //config.output = config.output || {};
    ///config.output.filename = "app-[name].js";

    // Add Webpack alias for `@app`
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "@app": require("path").resolve(__dirname, `src/${appPath}`)
    };

    // Ensure Webpack handles .mjs files correctly
    config.module = config.module || {};
    config.module.rules = config.module.rules || [];
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      use: {
        loader: "babel-loader",
        options: {
          presets: ["@babel/preset-env"]
        }
      },
      type: "javascript/auto"
    });
  },
  //pages: appConfig.getPages()
};
