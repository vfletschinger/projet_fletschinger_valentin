import { randomBytes, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";

const KEY_LENGTH = 64;

// Version asynchrone : le calcul (volontairement coûteux) ne bloque pas les autres requêtes
const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number
) => Promise<Buffer>;

/** Empreinte « sel:hash » calculée avec scrypt (module natif `crypto`, aucune dépendance). */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const hash = await scryptAsync(password, salt, KEY_LENGTH);
  return `${salt}:${hash.toString("hex")}`;
};

/** Recalcule l'empreinte avec le sel stocké et la compare en temps constant. */
export const verifyPassword = async (password: string, stored: string): Promise<boolean> => {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) {
    return false;
  }
  const expected = Buffer.from(hash, "hex");
  return timingSafeEqual(await scryptAsync(password, salt, expected.length), expected);
};
