let CONFIG = {
  getAppName() {
    let slectedAppName = window.CONST?.APP;
    if (!slectedAppName) {
      for (let key in this.apps) {
        let app = this.apps[key];
        if (window.location.pathname.indexOf(app.context) === 0) {
          slectedAppName = key;
          break;
        }
      }
    }
    return slectedAppName || "default"; // Read from global config
  },
  getAppPath(appName) {
    return "default" == appName ? "app" : `app-${appName}`;
  },
  getPublicPath(appName) {
    return this.getApp(appName)?.publicPath || "/";
  },
  getPages() {
    let pages = {};
    for (let key in this.apps) {
      let app = this.apps[key];
      pages[key] = {
        entry: app.entry || './src/main.js',
        template: app.template || 'public/index.html',
        filename: app.filename || 'index.html',
        title: app.title || key,
        chunks: app.chunks || ['chunk-vendors', 'chunk-common', key],
      };
    }
    return pages;
  },
  getApp(appName) {
    if(!appName) appName = this.getAppName();
    return this.apps[appName];
  },
};

module.exports = {
  extend(config) {
    CONFIG = {
      ...CONFIG,
      ...config,
    };
    return CONFIG;
  },
  config(){
    return CONFIG
  }
};
