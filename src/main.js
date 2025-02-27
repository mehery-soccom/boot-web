import Vue from "vue";
//import App from "./App.vue";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import { BootLoader } from "./@common";

Vue.config.productionTip = false;
Vue.use(BootstrapVue);

new BootLoader()
  .map({
    component: () => import("@/app/App.vue"),
    publicPath: "/default",
  })
  .map({
    name: "customer",
    component: () => import("@/app-customer/AppCustomer.vue"),
    publicPath: "/customer",
  })
  .load(
    window.CONST?.APP || "default"
    //window.CONST.APP_SITE ? "/" + window.CONST.APP_SITE : ""
  );
