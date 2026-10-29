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

Le front appelle cette API pour les pollutions. Les intercepteurs
`Front/src/app/services/*-mock.ts` sont conservés et activables par ressource dans
`Front/src/environments/` :

- `usePollutionApiMock` : `false`, les pollutions viennent de cette API ;
- `useSignupApiMock` : `true`, car `/auth/signup` n'existe pas encore ici.

### URL de base

- `ng serve` → `http://localhost:3000/api` (lancer l'API avec `npm run dev`)
- build de production → URL du service `pollution-api` sur Render

### Endpoints

Seuls les `GET /pollutions` et `GET /pollutions/:id` sont implémentés pour l'instant ;
les autres lignes décrivent ce que le front attend.

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
