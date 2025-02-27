import appConfig from "@/app-config";

export default {
  install(Vue) {
    const appName = appConfig.getAppName();
    const appPath = ('default' == appName) ? "app" : `app-${appName}`;
    const app = appConfig.apps[appName] || appConfig.apps["default"];

    Vue.prototype.$appConfig = { name: appName, publicPath: app.publicPath };

    // Load Component Dynamically
    Vue.prototype.$getAppComponent = () => app.component();

    // Load Router Dynamically
    Vue.prototype.$getRouter = () => import(`@/${appPath}/router`);
  },
};
