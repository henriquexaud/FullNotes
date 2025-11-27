# FullNotes Monorepo (Frontend + Backend)

Estrutura:

- `backend/` — FullNotes Back-end (Node.js + Express + TypeScript, porta 4000)
- `frontend/` — FullNotes Front-end (Vite + React + TypeScript, dev server com proxy para backend)

Para rodar localmente em desenvolvimento (em terminais separados):

```bash
# backend
cd backend
npm install
npm run dev

# frontend
cd frontend
npm install
npm run dev
```

O frontend faz fetch para `/api/hello` que é encaminhado para o backend durante o dev.

Este repositório também expõe um CRUD simples de notas (mockado em memória) no backend.

Endpoints principais:

- `GET /api/notes`
- `POST /api/notes`
- `PUT /api/notes/:id`
- `DELETE /api/notes/:id`

Veja `backend/README.md` para exemplos com `curl`.

**Visualizar dados no backend:**

Abra http://localhost:4000/notas em seu navegador — página com auto-refresh de 3s mostrando todas as notas salvas em tempo real.

## Docker

Se você quiser rodar ambos com Docker, siga os passos abaixo.

Instalar Docker no macOS (se ainda não tiver):

- Via Homebrew (instala o Docker Desktop):

```bash
brew install --cask docker
open /Applications/Docker.app
# aguarde o Docker iniciar
```

- Alternativa (sem Docker Desktop): `colima` + `docker` CLI:

```bash
brew install colima docker
colima start
```

Verifique instalação:

```bash
docker --version
docker compose version
```

Build e subir os serviços (no root do projeto):

```bash
docker compose up --build
```

Isso expõe:

- Backend: `http://localhost:4000`
- Frontend (static via nginx): `http://localhost:5173` (o nginx no container proxy `/api` para o backend)

Para derrubar os serviços:

```bash
docker compose down
```
