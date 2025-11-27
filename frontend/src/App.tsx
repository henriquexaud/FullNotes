import React, { useEffect, useState } from "react";

type Note = {
  id: number;
  title: string;
  content: string;
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "#f8f9fa",
    padding: "16px",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  } as React.CSSProperties,
  content: {
    maxWidth: "560px",
    width: "100%",
    margin: "0",
  } as React.CSSProperties,
  header: {
    marginBottom: "16px",
  },
  headerTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#2d3748",
    margin: "0 0 4px 0",
  },
  headerSubtitle: {
    fontSize: "12px",
    color: "#718096",
    margin: "0",
  },
  formSection: {
    background: "white",
    borderRadius: "6px",
    padding: "12px",
    marginBottom: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
  } as React.CSSProperties,
  input: {
    width: "100%",
    padding: "8px 10px",
    marginBottom: "8px",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    fontSize: "13px",
    transition: "all 0.2s ease",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  inputFocus: {
    borderColor: "#667eea",
    boxShadow: "0 0 0 2px rgba(102, 126, 234, 0.1)",
  } as React.CSSProperties,
  textarea: {
    width: "100%",
    minHeight: "60px",
    padding: "8px 10px",
    marginBottom: "8px",
    border: "1px solid #e2e8f0",
    borderRadius: "4px",
    fontSize: "13px",
    lineHeight: "1.4",
    resize: "vertical" as const,
    transition: "all 0.2s ease",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
  } as React.CSSProperties,
  button: {
    padding: "6px 12px",
    marginRight: "6px",
    marginBottom: "6px",
    border: "none",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
    outline: "none",
  } as React.CSSProperties,
  buttonPrimary: {
    background: "#667eea",
    color: "white",
  } as React.CSSProperties,
  buttonPrimaryHover: {
    background: "#5568d3",
  } as React.CSSProperties,
  buttonSecondary: {
    background: "#e2e8f0",
    color: "#2d3748",
  } as React.CSSProperties,
  buttonSecondaryHover: {
    background: "#cbd5e0",
  } as React.CSSProperties,
  buttonDanger: {
    background: "#f56565",
    color: "white",
  } as React.CSSProperties,
  buttonDangerHover: {
    background: "#e53e3e",
  } as React.CSSProperties,
  notesSection: {
    marginTop: "12px",
  },
  notesList: {
    display: "grid",
    gap: "8px",
  } as React.CSSProperties,
  noteItem: {
    background: "white",
    borderRadius: "6px",
    padding: "12px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
    border: "1px solid #e2e8f0",
    transition: "all 0.2s ease",
    cursor: "default",
  } as React.CSSProperties,
  noteItemHover: {
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
    borderColor: "#cbd5e0",
  } as React.CSSProperties,
  noteTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2d3748",
    margin: "0 0 4px 0",
    wordBreak: "break-word" as const,
  },
  noteContent: {
    fontSize: "12px",
    color: "#4a5568",
    margin: "0 0 8px 0",
    lineHeight: "1.4",
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
  noteActions: {
    display: "flex",
    gap: "6px",
  } as React.CSSProperties,
  emptyState: {
    textAlign: "center" as const,
    padding: "20px",
    color: "#718096",
  },
  emptyStateIcon: {
    fontSize: "32px",
    marginBottom: "8px",
  },
  loadingState: {
    textAlign: "center" as const,
    padding: "16px",
    color: "#718096",
    fontSize: "12px",
  },
  spinner: {
    display: "inline-block",
    width: "14px",
    height: "14px",
    border: "2px solid #e2e8f0",
    borderTop: "2px solid #667eea",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    marginRight: "6px",
  } as React.CSSProperties,
};

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [editingContent, setEditingContent] = useState("");

  const [notesHover, setNotesHover] = useState<number | null>(null);
  const [inputFocus, setInputFocus] = useState<string | null>(null);

  async function fetchNotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/notes");
      const data = await res.json();
      setNotes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      if (res.ok) {
        setTitle("");
        setContent("");
        await fetchNotes();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditingTitle(note.title);
    setEditingContent(note.content);
  }

  async function saveEdit() {
    if (editingId == null || !editingTitle.trim()) return;
    try {
      const res = await fetch(`/api/notes/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingTitle,
          content: editingContent,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        await fetchNotes();
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function deleteNote(id: number) {
    if (!confirm("Excluir nota?")) return;
    try {
      await fetch(`/api/notes/${id}`, { method: "DELETE" });
      await fetchNotes();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.headerTitle}>📝 Minhas Notas</h1>
            <p style={styles.headerSubtitle}>Organize suas ideias</p>
          </div>

          <div style={styles.formSection}>
            <h2
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#2d3748",
                margin: "0 0 8px 0",
              }}
            >
              Nova nota
            </h2>
            <form onSubmit={handleAdd}>
              <input
                placeholder="Título"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onFocus={() => setInputFocus("title")}
                onBlur={() => setInputFocus(null)}
                disabled={submitting}
                style={{
                  ...styles.input,
                  ...(inputFocus === "title" ? styles.inputFocus : {}),
                  opacity: submitting ? 0.6 : 1,
                }}
              />
              <textarea
                placeholder="Conteúdo..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setInputFocus("content")}
                onBlur={() => setInputFocus(null)}
                disabled={submitting}
                style={{
                  ...styles.textarea,
                  ...(inputFocus === "content" ? styles.inputFocus : {}),
                  opacity: submitting ? 0.6 : 1,
                }}
              />
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                style={{
                  ...styles.button,
                  ...styles.buttonPrimary,
                  opacity: submitting || !title.trim() ? 0.6 : 1,
                  cursor:
                    submitting || !title.trim() ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!submitting && title.trim()) {
                    Object.assign(
                      e.currentTarget.style,
                      styles.buttonPrimaryHover
                    );
                  }
                }}
                onMouseLeave={(e) => {
                  Object.assign(e.currentTarget.style, styles.buttonPrimary);
                }}
              >
                {submitting ? "Salvando..." : "Adicionar"}
              </button>
            </form>
          </div>

          <div style={styles.notesSection}>
            <h2
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#2d3748",
                margin: "0 0 8px 0",
              }}
            >
              Notas ({notes.length})
            </h2>

            {loading ? (
              <div style={styles.loadingState}>
                <div style={styles.spinner}></div>
                Carregando...
              </div>
            ) : notes.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyStateIcon}>📭</div>
                <p style={{ margin: 0, fontSize: "12px" }}>Nenhuma nota</p>
              </div>
            ) : (
              <div style={styles.notesList}>
                {notes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      ...styles.noteItem,
                      ...(notesHover === note.id ? styles.noteItemHover : {}),
                    }}
                    onMouseEnter={() => setNotesHover(note.id)}
                    onMouseLeave={() => setNotesHover(null)}
                  >
                    {editingId === note.id ? (
                      <div>
                        <input
                          autoFocus
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          style={{
                            ...styles.input,
                            marginBottom: "8px",
                          }}
                        />
                        <textarea
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          style={{
                            ...styles.textarea,
                            marginBottom: "8px",
                          }}
                        />
                        <div style={styles.noteActions}>
                          <button
                            onClick={() => saveEdit()}
                            disabled={!editingTitle.trim()}
                            style={{
                              ...styles.button,
                              ...styles.buttonPrimary,
                              opacity: !editingTitle.trim() ? 0.6 : 1,
                            }}
                            onMouseEnter={(e) => {
                              if (editingTitle.trim()) {
                                Object.assign(
                                  e.currentTarget.style,
                                  styles.buttonPrimaryHover
                                );
                              }
                            }}
                            onMouseLeave={(e) => {
                              Object.assign(
                                e.currentTarget.style,
                                styles.buttonPrimary
                              );
                            }}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            style={{
                              ...styles.button,
                              ...styles.buttonSecondary,
                            }}
                            onMouseEnter={(e) => {
                              Object.assign(
                                e.currentTarget.style,
                                styles.buttonSecondaryHover
                              );
                            }}
                            onMouseLeave={(e) => {
                              Object.assign(
                                e.currentTarget.style,
                                styles.buttonSecondary
                              );
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h3 style={styles.noteTitle}>{note.title}</h3>
                        <p style={styles.noteContent}>
                          {note.content || "(vazio)"}
                        </p>
                        <div style={styles.noteActions}>
                          <button
                            onClick={() => startEdit(note)}
                            style={{
                              ...styles.button,
                              ...styles.buttonSecondary,
                            }}
                            onMouseEnter={(e) => {
                              Object.assign(
                                e.currentTarget.style,
                                styles.buttonSecondaryHover
                              );
                            }}
                            onMouseLeave={(e) => {
                              Object.assign(
                                e.currentTarget.style,
                                styles.buttonSecondary
                              );
                            }}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => deleteNote(note.id)}
                            style={{
                              ...styles.button,
                              ...styles.buttonDanger,
                            }}
                            onMouseEnter={(e) => {
                              Object.assign(
                                e.currentTarget.style,
                                styles.buttonDangerHover
                              );
                            }}
                            onMouseLeave={(e) => {
                              Object.assign(
                                e.currentTarget.style,
                                styles.buttonDanger
                              );
                            }}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
