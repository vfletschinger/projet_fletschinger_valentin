# api — Backend

Dossier réservé à l'API du projet (à venir).

Le front Angular se trouve dans `../Front`.

## Contrat attendu par le front

Tant que ce dossier est vide, l'intercepteur `Front/src/app/services/api-mock.ts`
répond à la place du serveur (activé par `environment.useApiMock`). Le backend
devra respecter le même contrat pour que le front fonctionne sans modification.

### URL de base

Configurée côté front dans `Front/src/environments/` :

- `ng serve` → `http://localhost:3000/api` (mock actif)
- build de production → `/api` (même origine, appels réels)
