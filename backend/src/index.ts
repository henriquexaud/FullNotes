import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'db',
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postgres',
  database: process.env.POSTGRES_DB || 'notes',
});

async function initDbWithRetry(retries = 10, delayMs = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      await client.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT DEFAULT ''
        );
      `);
      client.release();
      console.log('Connected to Postgres and ensured table exists');
      return;
    } catch (err) {
      console.warn(`Postgres connection attempt ${i + 1} failed: ${(err as Error).message}`);
      if (i === retries - 1) throw err;
      await new Promise((res) => setTimeout(res, delayMs));
    }
  }
}

app.get('/api/hello', (_req, res) => {
  res.json({ message: 'Hello from backend' });
});

// CRUD endpoints for notes (using Postgres)
app.get('/api/notes', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, title, content FROM notes ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/notes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('SELECT id, title, content FROM notes WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Note not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/notes', async (req, res) => {
  try {
    const { title, content } = req.body as { title?: string; content?: string };
    if (!title) return res.status(400).json({ error: 'Title is required' });
    const result = await pool.query('INSERT INTO notes (title, content) VALUES ($1, $2) RETURNING id, title, content', [title, content || '']);
    console.log('Created note', result.rows[0].id);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, content } = req.body as { title?: string; content?: string };
    const current = await pool.query('SELECT id, title, content FROM notes WHERE id = $1', [id]);
    if (current.rowCount === 0) return res.status(404).json({ error: 'Note not found' });
    const newTitle = title ?? current.rows[0].title;
    const newContent = content ?? current.rows[0].content;
    const result = await pool.query('UPDATE notes SET title = $1, content = $2 WHERE id = $3 RETURNING id, title, content', [newTitle, newContent, id]);
    console.log('Updated note', id);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const result = await pool.query('DELETE FROM notes WHERE id = $1', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Note not found' });
    console.log('Deleted note', id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// HTML visualization page
app.get('/notas', async (_req, res) => {
  try {
    const result = await pool.query('SELECT id, title, content FROM notes ORDER BY id');
    const notes = result.rows;

    const html = `<!DOCTYPE html>
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
    .note-title { font-weight: 600; color: #333; margin-bottom: 8px; font-size: 16px; }
    .note-content { color: #666; margin-bottom: 12px; font-size: 14px; line-height: 1.5; }
    .note-id { color: #999; font-size: 12px; }
    .empty { text-align: center; color: #999; padding: 40px 20px; font-style: italic; }
    .api-links { background: #f0f0f0; padding: 12px; border-radius: 4px; margin-top: 20px; font-size: 12px; color: #666; }
    .api-links a { color: #667eea; text-decoration: none; }
    .api-links a:hover { text-decoration: underline; }
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
                (note: any) => `
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
  <script>setInterval(()=>location.reload(),3000);</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    console.error(err);
    res.status(500).send('Erro ao gerar a visualização');
  }
});

const port = process.env.PORT || 4000;

initDbWithRetry()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend running on http://localhost:${port}`);
      console.log(`Visualize notas em http://localhost:${port}/notas`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
