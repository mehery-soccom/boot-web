const appConfig = require("./src/app.config.js");

const appName = process.env.VUE_APP_NAME || "default";
const publicPath = appConfig.getPublicPath(appName);
const appPath = appConfig.getAppPath(appName);

module.exports = {
  runtimeCompiler: true,
  productionSourceMap: false,
  filenameHashing: false,
  
  publicPath: publicPath,
  configureWebpack: {
    resolve: {
      alias: {
        "@app": require("path").resolve(__dirname, `src/${appPath}`),
      },
    },
  },
  //pages: appConfig.getPages(),
};
