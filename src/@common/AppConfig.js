module.exports = {
  extend(config) {
    return {
      getAppName() {
        return window.CONST?.APP || "default"; // Read from global config
      },
      getAppPath(appName) {
        return "default" == appName ? "app" : `app-${appName}`;
      },
      getPublicPath(appName) {
        return this.getApp(appName)?.publicPath || "/"
      },
      getPages(){
        let pages = {};
        for(let key in this.apps){
            let app = this.apps[key];
            pages[key] = {
                entry: app.entry,
                template: app.template,
                filename: app.filename,
                title: app.title,
                chunks: app.chunks
            }
        }
        return pages;
      },
      getApp(appName){
        return this.apps[appName];
      },
      ...config,
    };
  },
};
