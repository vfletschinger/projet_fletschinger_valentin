# api — Backend

API Express + Sequelize branchée sur PostgreSQL. Le front Angular se trouve dans `../Front`.

## Lancer en local

1. `npm install`
2. Créer `api/.env` (ignoré par git) avec l'URL de la base, par exemple l'« External
   Database URL » de la base Render :

   ```
   DATABASE_URL=postgresql://user:motdepasse@hote.oregon-postgres.render.com/pollution_db
   ```

3. `npm run dev` → http://localhost:3000/api/pollutions

Au démarrage, `sequelize.sync()` crée les tables `pollution` et `users` si elles
n'existent pas, puis insère un jeu de pollutions d'exemple si la table est vide.

Côté front, `ng serve` interroge directement cette API (`useApiMock: false` dans
`environment.development.ts`) : lancer `npm run dev` ici avant `ng serve` dans `../Front`.

## Organisation

- `src/models/` : entités Sequelize et leurs validations (`*.model.ts`)
- `src/controllers/` : logique des requêtes (`findAll`, `findByPk`, `create`, `update`, `destroy`)
- `src/routes/` : association verbe HTTP + chemin → contrôleur
- `src/utils/` : helpers partagés (réponses d'erreur, hachage du mot de passe)

## Déploiement

`../render.yaml` (Blueprint Render) crée la base `pollution-db` et le service
`pollution-api`, qui reçoit `DATABASE_URL` automatiquement.

## Contrat attendu par le front

Le front s'appuie sur ce contrat ; ses intercepteurs `Front/src/app/services/*-mock.ts`
le reproduisent quand `environment.useApiMock` vaut `true` (pour travailler sans base).

### Endpoints

| Méthode  | Route                  | Corps              | Réponse                         |
| -------- | ---------------------- | ------------------ | ------------------------------- |
| `GET`    | `/api/users`           | —                  | `200` + `User[]`                |
| `POST`   | `/api/users`           | `UserRequest`      | `201` + `User`, `400`, `409`    |
| `POST`   | `/api/users/login`     | `LoginRequest`     | `200` + `User`, `400`, `401`    |
| `DELETE` | `/api/users/:id`       | —                  | `204`, `404`                    |
| `GET`    | `/api/pollutions`      | —                  | `200` + `Pollution[]`           |
| `GET`    | `/api/pollutions/:id`  | —                  | `200` + `Pollution`, `404`      |
| `POST`   | `/api/pollutions`      | `PollutionRequest` | `201` + `Pollution`, `400`      |
| `PUT`    | `/api/pollutions/:id`  | `PollutionRequest` | `200` + `Pollution`, `400`, `404` |
| `DELETE` | `/api/pollutions/:id`  | —                  | `204`, `404`                    |

Les types sont définis dans `Front/src/app/models/`. Le mot de passe est haché (scrypt)
avant l'écriture et n'est jamais renvoyé. En cas d'erreur, le corps contient
`{ "message": "..." }`, affiché tel quel à l'utilisateur.

`POST /api/users/login` est une authentification **fictive** : elle vérifie le couple
login / mot de passe et renvoie le compte, sans jeton ni session. Les autres routes ne
contrôlent donc pas qui les appelle ; seul le front restreint l'accès à certains écrans.
