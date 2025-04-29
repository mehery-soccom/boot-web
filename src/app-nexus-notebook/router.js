import { BootRouter } from "@/@common";

export default BootRouter.route({
  app: "nexus/notebook",
  base: "/nexus/notebook/",
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
      component: () => import("./Modules/Home.vue"),
    },
  ],
});
