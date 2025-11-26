import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Simple in-memory mock store for notes
type Note = {
  id: number;
  title: string;
  content: string;
};

let notes: Note[] = [
  { id: 1, title: 'Primeira nota', content: 'Conteúdo da primeira nota' },
  { id: 2, title: 'Segunda nota', content: 'Conteúdo da segunda nota' },
];
let nextId = 3;

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from backend' });
});

// CRUD endpoints for notes
app.get('/api/notes', (_req, res) => {
  res.json(notes);
});

app.get('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((n) => n.id === id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  res.json(note);
});

app.post('/api/notes', (req, res) => {
  const { title, content } = req.body as Partial<Note>;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const note: Note = { id: nextId++, title, content: content || '' };
  notes.push(note);
  console.log('Created note', note.id);
  res.status(201).json(note);
});

app.put('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  const { title, content } = req.body as Partial<Note>;
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Note not found' });
  const updated: Note = { ...notes[idx], title: title ?? notes[idx].title, content: content ?? notes[idx].content };
  notes[idx] = updated;
  console.log('Updated note', id);
  res.json(updated);
});

app.delete('/api/notes/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = notes.findIndex((n) => n.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Note not found' });
  notes.splice(idx, 1);
  console.log('Deleted note', id);
  res.status(204).send();
});

// HTML visualization page
app.get('/notas', (_req, res) => {
  const notasHTML = notes
    .map(
      (note) => `
    <div style="border: 1px solid #ccc; padding: 12px; margin: 8px 0; border-radius: 4px;">
      <h3 style="margin: 0 0 8px 0;">${note.title}</h3>
      <p style="margin: 0 0 12px 0; color: #666;">${note.content}</p>
      <small style="color: #999;">ID: ${note.id}</small>
    </div>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Backend — Visualização de Notas</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      padding: 24px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
      border-radius: 8px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      padding: 24px;
    }
    h1 {
      color: #333;
      margin-bottom: 8px;
      font-size: 28px;
    }
    .info {
      color: #666;
      margin-bottom: 24px;
      font-size: 14px;
    }
    .notes-list {
      margin-top: 24px;
    }
    .note-item {
      border: 1px solid #e0e0e0;
      padding: 16px;
      margin: 12px 0;
      border-radius: 6px;
      background: #f9f9f9;
      transition: all 0.2s ease;
    }
    .note-item:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      border-color: #667eea;
    }
    .note-title {
      font-weight: 600;
      color: #333;
      margin-bottom: 8px;
      font-size: 16px;
    }
    .note-content {
      color: #666;
      margin-bottom: 12px;
      font-size: 14px;
      line-height: 1.5;
    }
    .note-id {
      color: #999;
      font-size: 12px;
    }
    .empty {
      text-align: center;
      color: #999;
      padding: 40px 20px;
      font-style: italic;
    }
    .api-links {
      background: #f0f0f0;
      padding: 12px;
      border-radius: 4px;
      margin-top: 20px;
      font-size: 12px;
      color: #666;
    }
    .api-links a {
      color: #667eea;
      text-decoration: none;
    }
    .api-links a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>📝 Notas — Backend</h1>
    <div class="info">
      <strong>${notes.length}</strong> nota(s) salva(s). Esta página auto-atualiza a cada 3 segundos.
    </div>

    <div class="notes-list">
      ${
        notes.length === 0
          ? '<div class="empty">Nenhuma nota salva ainda.</div>'
          : notes
              .map(
                (note) => `
        <div class="note-item">
          <div class="note-title">${note.title}</div>
          <div class="note-content">${note.content}</div>
          <div class="note-id">ID: ${note.id}</div>
        </div>
      `
              )
              .join('')
      }
    </div>

    <div class="api-links">
      <strong>Endpoints disponíveis:</strong><br>
      <a href="http://localhost:4000/api/notes" target="_blank">GET /api/notes</a> (JSON)<br>
      <a href="http://localhost:4000/notas" target="_blank">GET /notas</a> (HTML - esta página)<br>
      Usar o frontend em <a href="http://localhost:5173" target="_blank">localhost:5173</a> para criar/editar/deletar notas.
    </div>
  </div>

  <script>
    // Auto-refresh a cada 3 segundos
    setInterval(() => {
      location.reload();
    }, 3000);
  </script>
</body>
</html>
  `;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
  console.log(`Visualize notas em http://localhost:${port}/notas`);
});
