# Backend (Express + TypeScript)

Port: 4000

Instalação:

```bash
cd backend
npm install
```

Rodar em desenvolvimento:

```bash
npm run dev
```

Build e start:

```bash
npm run build
npm run start
```

Endpoint de exemplo: `GET /api/hello` → `{ "message": "Hello from backend" }`

**Visualização em tempo real:**

- `GET /notas` → HTML interativa com auto-refresh (acesse em http://localhost:4000/notas)

CRUD de notas (mockado, em memória):

- `GET /api/notes` → lista todas as notas
- `GET /api/notes/:id` → obtém uma nota
- `POST /api/notes` → cria uma nota (body: `{ "title": string, "content": string }`)
- `PUT /api/notes/:id` → atualiza uma nota (body: `{ "title"?, "content"? }`)
- `DELETE /api/notes/:id` → remove uma nota

Exemplos usando `curl`:

```bash
# listar
curl http://localhost:4000/api/notes

# criar
curl -X POST http://localhost:4000/api/notes -H 'Content-Type: application/json' -d '{"title":"Minha nota","content":"..."}'

# atualizar
curl -X PUT http://localhost:4000/api/notes/1 -H 'Content-Type: application/json' -d '{"title":"Novo título"}'

# deletar
curl -X DELETE http://localhost:4000/api/notes/1
```
