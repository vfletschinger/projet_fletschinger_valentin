import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";

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
}

export interface PollutionCreationAttributes
  extends Optional<PollutionAttributes, "id" | "description" | "latitude" | "longitude" | "photoUrl"> {}

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
        allowNull: false
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
      },
      observedAt: {
        // DATEONLY est renvoyé sous la forme "YYYY-MM-DD", comme l'attend le front
        type: DataTypes.DATEONLY,
        allowNull: false
      },
      place: {
        type: DataTypes.STRING,
        allowNull: false
      },
      latitude: {
        type: DataTypes.DOUBLE,
        allowNull: true
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: true
      },
      photoUrl: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: ""
      }
    },
    {
      tableName: "pollution",
      freezeTableName: true,
      timestamps: false
    }
  );
}
