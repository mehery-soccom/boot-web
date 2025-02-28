import Vue from "vue";

import BootRouter from "./BootRouter";
import AppWrapper from "./AppWrapper";

import axios from "axios";
import service from "./services/DataService";

export default function Bootloader(appConfig) {
  let configs = {};
  let MODULES = {
    service,
  };

  this.map = function (...apps) {
    if (apps) {
      apps.map(function (app) {
        configs[app.name || "default"] = app;
      });
    }
    return this;
  };

  this.getApp = function (appName) {
    return configs[appName];
  };

  this.modules = function (modules) {
    MODULES = {
      ...modules,
    };
    return this;
  };

  for (let key in appConfig.apps) {
    let app = appConfig.apps[key];
    app.name = key;
    this.map(app);
  }

  this.setup = function () {
    axios.defaults.withCredentials = true;
    // axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*';
    axios.defaults.baseURL = (function () {
      var origin = window.location.origin;
      let context = appConfig.getApp().context;
      if (context) {
        return origin + context;
      }
      return origin;
    })();
    console.log("baseURL====", axios.defaults.baseURL);
    console.log("location.pathname====", location.pathname);
  };

  this.mount = function (appName, site = "") {
    appName = appName || appConfig.getAppName();
    var config = configs[appName] || configs.dev;
    if (config?.alias) {
      appName = config.alias;
      config = configs[appName];
    }
    console.log("App", appName, config);
    if (!config) {
      throw `Connot Find App(${appName}:${site})`;
    }

    const appPath = "default" == appName ? "app" : `app-${appName}`;
    const appComponent = "default" == appName ? "app" : `app-${appName}`;

    if (typeof config.beforeLoad == "function") {
      config.beforeLoad();
    }

    this.setup();

    Vue.component(`${appPath}`, config.component);
    console.log(`@/${appPath}${site}/router`);
    import(`@/${appPath + site}/router`).then(function (router) {
      new Vue({
        el: "#app",
        //store,service,i18n,
        ...MODULES,
        router: BootRouter.router(router.default),
        template: `<AppWrapper app="${appComponent}"/>`,
        components: { AppWrapper },
      });
    });
  };
}
