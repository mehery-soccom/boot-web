import './preloader'
import Vue from "vue";
//import App from "./App.vue";
import BootstrapVue from "bootstrap-vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue/dist/bootstrap-vue.css";
import { BootLoader } from "./@common";
import appConfig from "./app.config.js";

Vue.config.productionTip = false;
Vue.use(BootstrapVue);

new BootLoader(appConfig)
  .modules({
  })
  .mount();
