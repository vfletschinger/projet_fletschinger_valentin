# api — Backend

Dossier réservé à l'API du projet (à venir).

Le front Angular se trouve dans `../Front`.

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
