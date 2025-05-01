import { BootRouter } from "@/@common";
// import { component } from "vue/types/umd";

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
    {
      path : "/explore",
      name : "Explorer",
      component : () => import("./Modules/QAPairsTable.vue")
    },
    {
      path : "/createDocs",
      name : "Create Docs",
      component : () => import("./Modules/CreateDocs.vue")
    }
  ],
});
