import { NextFunction, Request, Response } from "express";
import { UniqueConstraintError, ValidationError } from "sequelize";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Pour `router.param("id", ...)` : un id qui n'est pas un UUID ferait échouer la requête SQL,
 * on répond donc directement « introuvable » sans interroger la base.
 */
export const requireUuid =
  (notFound: (res: Response, id: string) => void) =>
  (_req: Request, res: Response, next: NextFunction, id: string): void => {
    if (UUID_PATTERN.test(id)) {
      next();
    } else {
      notFound(res, id);
    }
  };

/** Renvoie la chaîne nettoyée de ses espaces, ou `undefined` si la valeur n'est pas une chaîne. */
export const trimmed = (value: unknown): string | undefined =>
  typeof value === "string" ? value.trim() : undefined;

/**
 * Traduit une erreur Sequelize en réponse HTTP : 409 pour un doublon, 400 pour une donnée
 * refusée par les validations du modèle, 500 sinon. Le corps reste `{ message }`, format
 * attendu par le front.
 */
export const sendError = (res: Response, err: unknown, context: string): void => {
  // UniqueConstraintError hérite de ValidationError : on le teste en premier
  if (err instanceof UniqueConstraintError) {
    res.status(409).json({ message: `${context} : cette valeur est déjà utilisée.` });
    return;
  }
  if (err instanceof ValidationError) {
    res.status(400).json({ message: err.errors.map((error) => error.message).join(" ") });
    return;
  }
  const message = err instanceof Error ? err.message : String(err);
  res.status(500).json({ message: `${context} : ${message}` });
};
