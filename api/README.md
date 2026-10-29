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

Au démarrage, `sequelize.sync()` crée la table `pollution` si elle n'existe pas et
y insère un jeu de données d'exemple si elle est vide.

## Déploiement

`../render.yaml` (Blueprint Render) crée la base `pollution-db` et le service
`pollution-api`, qui reçoit `DATABASE_URL` automatiquement.

## Contrat attendu par le front

Tant que ce dossier est vide, les intercepteurs `Front/src/app/services/*-mock.ts`
répondent à la place du serveur (activé par `environment.useApiMock`). Le backend
devra respecter le même contrat pour que le front fonctionne sans modification.

### URL de base

Configurée côté front dans `Front/src/environments/` :

- `ng serve` → `http://localhost:3000/api` (mock actif)
- build de production → `/api` (mock actif lui aussi, faute d'API déployée)

Une fois l'API en ligne, renseigner son URL dans `environment.ts` et passer
`useApiMock` à `false`.

### Endpoints

| Méthode  | Route               | Corps            | Réponse                         |
| -------- | ------------------- | ---------------- | ------------------------------- |
| `POST`   | `/auth/signup`      | `SignupRequest`  | `201` + `SignupResponse`, `409` |
| `GET`    | `/pollutions`       | —                | `200` + `Pollution[]`           |
| `GET`    | `/pollutions/:id`   | —                | `200` + `Pollution`, `404`      |
| `POST`   | `/pollutions`       | `PollutionRequest` | `201` + `Pollution`             |
| `PUT`    | `/pollutions/:id`   | `PollutionRequest` | `200` + `Pollution`, `404`      |
| `DELETE` | `/pollutions/:id`   | —                | `204`, `404`                    |

Les types sont définis dans `Front/src/app/models/`. En cas d'erreur, le corps
peut contenir `{ "message": "..." }`, affiché tel quel à l'utilisateur.
