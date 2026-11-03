import { Application, Router } from "express";
import userController from "../controllers/user.controllers";
import { requireUuid } from "../utils/http";

export default (app: Application): void => {
  const router = Router();

  // Toutes les routes /:id refusent d'emblée un id qui n'est pas un UUID
  router.param("id", requireUuid(userController.notFound));

  // Route GET /api/users
  router.get("/", userController.getAll);

  // Route POST /api/users
  router.post("/", userController.create);

  // Route POST /api/users/login (authentification fictive)
  router.post("/login", userController.login);

  // Route DELETE /api/users/:id
  router.delete("/:id", userController.remove);

  app.use("/api/users", router);
};
