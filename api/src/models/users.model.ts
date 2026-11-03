import { Sequelize, DataTypes, Model, Optional, ModelStatic } from "sequelize";
import { hashPassword } from "../utils/password";

/** Ligne de la table `users` ; `password` contient l'empreinte, jamais le mot de passe en clair. */
export interface UserAttributes {
  id: string;
  login: string;
  password: string;
  lastName: string;
  firstName: string;
  email: string;
  createdAt: Date;
}

export interface UserCreationAttributes extends Optional<UserAttributes, "id" | "createdAt"> {}

export interface UserInstance extends Model<UserAttributes, UserCreationAttributes>, UserAttributes {}

export type UserModel = ModelStatic<UserInstance>;

export default function defineUsers(sequelize: Sequelize): UserModel {
  const Users = sequelize.define<UserInstance>(
    "user",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      login: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Le login est requis." }
        }
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Le mot de passe est requis." }
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Le nom est requis." }
        }
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: { msg: "Le prénom est requis." }
        }
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: { msg: "Format d'email invalide." }
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      tableName: "users",
      hooks: {
        // Les validations portent sur le mot de passe saisi ; on le hache juste avant l'écriture
        beforeSave: async (user) => {
          if (user.changed("password")) {
            user.password = await hashPassword(user.password);
          }
        }
      }
    }
  );

  // L'empreinte du mot de passe ne sort jamais de l'API : toute réponse JSON l'écarte
  Users.prototype.toJSON = function (this: UserInstance) {
    const { password: _password, ...user } = this.get();
    return user;
  };

  return Users;
}
