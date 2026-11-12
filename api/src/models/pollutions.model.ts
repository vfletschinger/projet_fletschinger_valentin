import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

/** Miroir de `POLLUTION_TYPES` dans `Front/src/app/models/pollution.ts`. */
export const POLLUTION_TYPES = ["Plastique", "Chimique", "Dépôt sauvage", "Eau", "Air", "Autre"];

/** Miroir de `Front/src/app/models/pollution.ts` : le front consomme ces champs tels quels. */
export interface PollutionAttributes {
  id: string;
  title: string;
  type: string;
  description: string;
  observedAt: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string;
  dangerIndex: number;
}

export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id" | "description" | "latitude" | "longitude" | "photoUrl" | "dangerIndex"> {}

export interface PollutionInstance
  extends Model<PollutionAttributes, PollutionCreationAttributes>,
    PollutionAttributes {}

export type PollutionModel = ModelStatic<PollutionInstance>;

export default function definePollutions(sequelize: Sequelize): PollutionModel {
  return sequelize.define<PollutionInstance>(
    "pollution",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Le titre est requis." }
        }
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isIn: {
            args: [POLLUTION_TYPES],
            msg: `Le type doit être l'un de : ${POLLUTION_TYPES.join(", ")}.`
          }
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
      },
      observedAt: {
        // DATEONLY est renvoyé sous la forme "YYYY-MM-DD", comme l'attend le front
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          isDate: { args: true, msg: "La date d'observation est invalide." },
          notInFuture(value: string) {
            if (value > new Date().toISOString().slice(0, 10)) {
              throw new Error("La date d'observation ne peut pas être dans le futur.");
            }
          }
        }
      },
      place: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Le lieu est requis." }
        }
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        validate: {
          min: { args: [-90], msg: "La latitude doit être comprise entre -90 et 90." },
          max: { args: [90], msg: "La latitude doit être comprise entre -90 et 90." }
        }
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        validate: {
          min: { args: [-180], msg: "La longitude doit être comprise entre -180 et 180." },
          max: { args: [180], msg: "La longitude doit être comprise entre -180 et 180." }
        }
      },
      photoUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
      },
      dangerIndex: {
        // Indice de dangerosité, traduit en niveau (Faible → Dangereuse) côté front
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: { msg: "L'indice de dangerosité doit être un nombre entier." },
          min: { args: [0], msg: "L'indice de dangerosité doit être positif ou nul." }
        }
      }
    },
    {
      tableName: "pollution",
      freezeTableName: true,
      timestamps: false
    }
  );
}
