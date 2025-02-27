import Vue from "vue";
import Router from "vue-router";

import AppConfig from "./AppConfig";

Vue.use(Router);

export default {
  options: {},
  _inst_: null,
  instance() {
    return this._inst_;
  },
  route: function (options) {
    let appName = AppConfig.config().getAppName();
    console.log(1, options, appName);
    if (options.app == appName) {
      this.options = options;
    }
    return { options };
  },
  router: function (_router) {
    console.log("_router", _router);
    let appName = AppConfig.config().getAppName();
    console.log(2, this.options, appName);
    let router = new Router({
      mode: "history",
      base: this.options.base,
      scrollBehavior:
        this.options.scrollBehavior ||
        function () {
          return window.scrollTo({ top: 0, behavior: "smooth" });
        },
      routes: this.options.routes,
    });

    var options = this.options;
    options.beforeEach =
      options.beforeEach ||
      function (to, from, next) {
        next();
      };

    options.accessDenied =
      options.accessDenied ||
      function (to, from, next) {
        next(false);
      };

    options.matchNotFound =
      options.matchNotFound ||
      function (to, from, next) {
        if (options.matchNotFoundExternal) {
          document.location.href = to.fullPath;
        } else {
          next();
        }
      };

    router.beforeEach((to, from, next) => {
      console.log("beforeEach", from.path, "-->", to.path, to.matched[0]?.meta);
      if (!to.matched || to.matched.length == 0) {
        console.log("matchNotFound");
        options.matchNotFound(to, from, next);
      } else if (
        !to.matched.some(function (record) {
          if (!record.meta || !window.CONST?.APP_USER_ROLE) return true;
          let APP_USER_ROLE = Array.isArray(window.CONST.APP_USER_ROLE)
            ? window.CONST.APP_USER_ROLE
            : [window.CONST.APP_USER_ROLE];
          let role = Array.isArray(record.meta.role)
            ? record.meta.role || []
            : [record.meta.role];
          console.log("Required", role, "Assigned", APP_USER_ROLE);
          if (!role.length || !role[0]) {
            return true;
          }
          for (var r in role) {
            if (role[r] && APP_USER_ROLE.indexOf(role[r]) > -1) {
              return true;
            }
          }
          console.log("NoRoleFound");
          return false;
        })
      ) {
        console.log("NextFailed");
        options.accessDenied(to, from, next);
      } else {
        console.log("NextDone");
        options.beforeEach(to, from, next);
      }
    });
    this._inst_ = router;
    return router;
  },
};
