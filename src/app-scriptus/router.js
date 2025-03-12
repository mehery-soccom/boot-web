import { BootRouter } from "@/@common";

export default BootRouter.route({
  app: "scriptus",
  base: "/scriptus/",
  routes: [
    {
      path: "/",
      redirect: "/home",
      name: "root",
    },
    // Dashboards
    {
      path: "/home",
      name: "HomePage",
      component: () => import("./Modules/ChatHome.vue"),
    },
  ],
});
