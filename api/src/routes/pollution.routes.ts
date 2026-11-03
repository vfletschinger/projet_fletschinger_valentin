import { Application, Router } from "express";
import pollutionController from "../controllers/pollution.controllers";
import { requireUuid } from "../utils/http";

export default (app: Application): void => {
  const router = Router();

  // Toutes les routes /:id refusent d'emblée un id qui n'est pas un UUID
  router.param("id", requireUuid(pollutionController.notFound));

  // Route GET /api/pollutions
  router.get("/", pollutionController.getAll);

  // Route GET /api/pollutions/:id
  router.get("/:id", pollutionController.getById);

  // Route POST /api/pollutions
  router.post("/", pollutionController.create);

  // Route PUT /api/pollutions/:id
  router.put("/:id", pollutionController.update);

  // Route DELETE /api/pollutions/:id
  router.delete("/:id", pollutionController.remove);

  // Exposition sous /api/pollutions et /api/pollution (singulier et pluriel)
  app.use("/api/pollutions", router);
  app.use("/api/pollution", router);
};
