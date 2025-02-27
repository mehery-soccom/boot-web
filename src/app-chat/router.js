import { BootRouter } from "@/@common";

export default BootRouter.route({
  app: "chat",
  base: "/chat/",
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
      component: () => import("./Modules/HomePage.vue"),
    },
  ],
});
