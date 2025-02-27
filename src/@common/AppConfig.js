var CONFIG = {
  getAppName() {
    let slectedAppName = window.CONST?.APP;
    if (!slectedAppName) {
      for (let key in this.apps) {
        let app = this.apps[key];
        if (window.location.pathname.indexOf(app.publicPath) === 0) {
          slectedAppName = key;
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
        entry: app.entry,
        template: app.template,
        filename: app.filename,
        title: app.title,
        chunks: app.chunks,
      };
    }
    return pages;
  },
  getApp(appName) {
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
