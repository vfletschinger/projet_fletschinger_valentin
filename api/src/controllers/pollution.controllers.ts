import { Request, Response } from "express";
import db from "../models";
import { PollutionCreationAttributes } from "../models/pollutions.model";
import { sendError, trimmed } from "../utils/http";

const Pollutions = db.pollutions;

export const notFound = (res: Response, id: string): void => {
  res.status(404).json({ message: `Aucune pollution trouvée avec l'id=${id}.` });
};

/**
 * Ne retient du corps que les champs modifiables par le client (jamais l'id) ; les validations
 * du modèle se chargent ensuite de refuser les valeurs manquantes ou incohérentes.
 */
const pollutionFromBody = (body: Record<string, unknown>): PollutionCreationAttributes => ({
  title: trimmed(body.title) as string,
  type: trimmed(body.type) as string,
  description: trimmed(body.description) ?? "",
  observedAt: trimmed(body.observedAt) as string,
  place: trimmed(body.place) as string,
  latitude: (body.latitude as number | null | undefined) ?? null,
  longitude: (body.longitude as number | null | undefined) ?? null,
  photoUrl: trimmed(body.photoUrl) ?? ""
});

/**
 * Récupère la liste de toutes les pollutions, les plus récentes d'abord.
 */
export const getAll = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.findAll({
      order: [["observedAt", "DESC"]]
    });
    res.status(200).json(data);
  } catch (err: unknown) {
    sendError(res, err, "Erreur lors de la récupération des pollutions");
  }
};

/**
 * Récupère une pollution par son identifiant.
 */
export const getById = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    const data = await Pollutions.findByPk(id);
    if (data) {
      res.status(200).json(data);
    } else {
      notFound(res, id);
    }
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors de la récupération de la pollution id=${id}`);
  }
};

/**
 * Enregistre une nouvelle pollution et la renvoie avec l'id attribué par la base.
 */
export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await Pollutions.create(pollutionFromBody(req.body ?? {}));
    res.status(201).json(data);
  } catch (err: unknown) {
    sendError(res, err, "Erreur lors de la création de la pollution");
  }
};

/**
 * Remplace les champs d'une pollution existante.
 */
export const update = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    const pollution = await Pollutions.findByPk(id);
    if (!pollution) {
      notFound(res, id);
      return;
    }
    const data = await pollution.update(pollutionFromBody(req.body ?? {}));
    res.status(200).json(data);
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors de la modification de la pollution id=${id}`);
  }
};

/**
 * Supprime une pollution.
 */
export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = String(req.params.id);
  try {
    const deleted = await Pollutions.destroy({ where: { id } });
    if (deleted) {
      res.status(204).end();
    } else {
      notFound(res, id);
    }
  } catch (err: unknown) {
    sendError(res, err, `Erreur lors de la suppression de la pollution id=${id}`);
  }
};

export default { getAll, getById, create, update, remove, notFound };
