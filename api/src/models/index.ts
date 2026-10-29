import { Sequelize } from "sequelize";
import definePollutions, { PollutionModel } from "./pollutions.model";

// Render injecte DATABASE_URL (cf. render.yaml) ; en local, la renseigner dans api/.env
const connectionUrl = process.env.DATABASE_URL;
if (!connectionUrl) {
  throw new Error("DATABASE_URL manquante : renseignez-la dans api/.env (voir api/README.md).");
}

const isLocalHost = connectionUrl.includes("localhost") || connectionUrl.includes("127.0.0.1");
const useSsl =
  process.env.DB_SSL === "true" ||
  (process.env.DB_SSL !== "false" && !isLocalHost);

const sequelize = new Sequelize(connectionUrl, {
  dialect: "postgres",
  dialectOptions: useSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      }
    : {},
  define: {
    timestamps: false
  }
});

export interface Database {
  Sequelize: typeof Sequelize;
  sequelize: Sequelize;
  pollutions: PollutionModel;
}

export const db: Database = {
  Sequelize,
  sequelize,
  pollutions: definePollutions(sequelize)
};

export default db;
