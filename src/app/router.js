import { BootRouter } from "@/@common";

export default BootRouter.route({
  app: "default",
  base: "/default",
  routes: [
    // Dashboards
    {
      path: "/app/chat",
      name: "customer-chat",
      component: () => import("./Modules/NoteBook.vue"),
    },
  ],
});
