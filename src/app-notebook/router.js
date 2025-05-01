import { BootRouter } from "@/@common";

export default BootRouter.route({
  app: "notebook",
  base: "/notebook/",
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
      component: () => import("./Modules/NotebookHome.vue"),
    },
  ],
});
