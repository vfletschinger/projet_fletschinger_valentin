import express, { Application, Request, Response } from "express";
import cors, { CorsOptions } from "cors";
import db from "./models";
import initRoutes from "./routes";

const app: Application = express();

const corsOptions: CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type, Authorization",
  exposedHeaders: "Authorization"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// health checks
app.get("/", (_req: Request, res: Response) => {
  res.json({ message: "Welcome to Pollution API." });
});

app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "OK" });
});

db.sequelize
  .sync()
  .then(async () => {
    console.log("Synced db.");
    try {
      const count = await db.pollutions.count();
      if (count === 0) {
        await db.pollutions.bulkCreate([
          {
            title: "Bidons abandonnés",
            type: "Chimique",
            description: "Trois bidons percés au bord du ruisseau.",
            observedAt: "2026-09-12",
            place: "Quai de Seine, Paris",
            latitude: 48.8566,
            longitude: 2.3522
          },
          {
            title: "Sacs plastiques sur la plage",
            type: "Plastique",
            description: "Une vingtaine de sacs coincés dans les rochers.",
            observedAt: "2026-10-03",
            place: "Plage du Prado, Marseille",
            latitude: 43.2598,
            longitude: 5.3747
          },
          {
            title: "Gravats en lisière de forêt",
            type: "Dépôt sauvage",
            description: "Dépôt de gravats et de plaques de plâtre.",
            observedAt: "2026-08-20",
            place: "Forêt de Fontainebleau",
            latitude: 48.4047,
            longitude: 2.7016
          }
        ]);
        console.log("Jeu de données initial pour la table pollution inséré avec succès.");
      }
    } catch (seedErr: unknown) {
      console.warn("Remarque : impossible d'insérer les données d'initialisation :", seedErr);
    }
  })
  .catch((err: Error) => {
    console.log("Failed to sync db: " + err.message);
  });


initRoutes(app);

// set port, listen on 0.0.0.0 for Render and container environments
const PORT = Number(process.env.PORT) || 3000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}.`);
});

export default app;
