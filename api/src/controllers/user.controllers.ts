import { Request, Response } from "express";
import { UniqueConstraintError } from "sequelize";
import db from "../models";
import { sendError, trimmed } from "../utils/http";
import { verifyPassword } from "../utils/password";

const Users = db.users;

export const notFound = (res: Response, id: string): void => {
  res.status(404).json({ message: `Aucun utilisateur trouvé avec l'id=${id}.` });
};

/**
 * Liste les utilisateurs inscrits, du plus récent au plus ancien (sans mot de passe).
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Users.findAll({
      order: [["createdAt", "DESC"]]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    sendError(res, err, "Erreur lors de la récupération des utilisateurs");
  }
};

/**
 * Crée un compte. Le login et l'email doivent être libres (409 sinon).
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  const body: Record<string, unknown> = req.body ?? {};
  const login = trimmed(body.login) ?? "";
  const email = (trimmed(body.email) ?? "").toLowerCase();

  try {
    const user = await Users.create({
      login,
      email,
      password: typeof body.password === "string" ? body.password : "",
      lastName: trimmed(body.lastName) ?? "",
      firstName: trimmed(body.firstName) ?? ""
    });
    res.status(201).json(user);
  } catch (err: unknown) {
    // Les contraintes UNIQUE de la table indiquent quel champ est déjà utilisé
    if (err instanceof UniqueConstraintError) {
      const message =
        err.errors[0]?.path === "email"
          ? `L'email « ${email} » est déjà associé à un compte.`
          : `Le login « ${login} » est déjà pris.`;
      res.status(409).json({ message });
      return;
    }
    sendError(res, err, "Erreur lors de la création de l'utilisateur");
  }
};

/**
 * Authentification fictive : vérifie le couple login / mot de passe et renvoie le compte,
 * sans émettre de jeton ni ouvrir de session. Le front garde l'utilisateur connecté en mémoire.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const body: Record<string, unknown> = req.body ?? {};
  const login = trimmed(body.login) ?? "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!login || !password) {
    res.status(400).json({ message: "Le login et le mot de passe sont requis." });
    return;
  }

  try {
    const user = await Users.findOne({ where: { login } });
    // Même réponse que le login soit inconnu ou le mot de passe faux : on ne révèle pas les comptes
    if (!user || !(await verifyPassword(password, user.password))) {
      res.status(401).json({ message: "Login ou mot de passe incorrect." });
      return;
    }
    res.status(200).json(user);
  } catch (err: unknown) {
    sendError(res, err, "Erreur lors de la connexion");
  }
};

/**
 * Supprime un compte.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    const deleted = await Users.destroy({ where: { id } });
    if (deleted) {
      res.status(204).end();
    } else {
      notFound(res, id);
    }
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors de la suppression de l'utilisateur id=${id}`);
  }
};

export default { getAll, create, login, remove, notFound };
