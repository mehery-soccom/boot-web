const AppConfig = require("./@common/AppConfig");

module.exports = AppConfig.extend({
  apps: {
    chat: {
      // entry: "./src/main.js",
      // template: "public/app-customer.html",
      // filename: "app-customer.html",
      // title: "Customer Aapp",
      // chunks: ["chunk-vendors", "chunk-common", "customer"],
      component: () => import("@/app-chat/AppChat.vue"),
      context: "/chat",
      entry: './src/main.js',
    },
    default: {
      component: () => import("@/app/App.vue"),
      context : "/",
      entry: './src/main.js',
    },
  },
});
