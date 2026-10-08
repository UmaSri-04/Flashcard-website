import { useCallback, useEffect, useState } from "react";
import "./App.css";

const emptyForm = { question: "", answer: "" };

function App() {
  const [cards, setCards] = useState([]);
  const [view, setView] = useState("study");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const loadCards = useCallback(async () => {
    const res = await fetch("/api/flashcards");
    if (!res.ok) {
      throw new Error("Failed to load flashcards");
    }
    return res.json();
  }, []);

  useEffect(() => {
    loadCards()
      .then((data) => {
        setCards(data);
        setIndex(0);
      })
      .catch(() => setError("Could not load flashcards. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [loadCards]);

  const current = cards[index] || null;

  function goTo(nextIndex) {
    if (!cards.length) return;
    const wrapped = (nextIndex + cards.length) % cards.length;
    setIndex(wrapped);
    setFlipped(false);
  }

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setFormError("");
    setView("form");
  }

  function openEdit(card) {
    setEditingId(card.id);
    setForm({ question: card.question, answer: card.answer });
    setFormError("");
    setView("form");
  }

  async function saveCard(event) {
    event.preventDefault();
    if (!form.question.trim() || !form.answer.trim()) {
      setFormError("Please fill in both the question and the answer.");
      return;
    }

    setSaving(true);
    setFormError("");

    try {
      const isEdit = editingId !== null;
      const res = await fetch(
        isEdit ? `/api/flashcards/${editingId}` : "/api/flashcards",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: form.question.trim(),
            answer: form.answer.trim(),
          }),
        }
      );

      if (!res.ok) {
        throw new Error("Save failed");
      }

      const saved = await res.json();
      const nextCards = await loadCards();
      setCards(nextCards);

      const savedIndex = nextCards.findIndex((card) => card.id === saved.id);
      setIndex(savedIndex >= 0 ? savedIndex : 0);
      setFlipped(false);
      setView("manage");
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      setFormError("Could not save the flashcard. Try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteCard(card) {
    const confirmed = window.confirm(`Delete this flashcard?\n\n${card.question}`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/flashcards/${card.id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new Error("Delete failed");
      }

      const nextCards = await loadCards();
      setCards(nextCards);
      setIndex((currentIndex) =>
        currentIndex >= nextCards.length
          ? Math.max(nextCards.length - 1, 0)
          : currentIndex
      );
      setFlipped(false);
    } catch {
      setError("Could not delete the flashcard.");
    }
  }

  if (loading) {
    return (
      <div className="page">
        <p className="status">Loading your deck...</p>
      </div>
    );
  }

  if (error && !cards.length) {
    return (
      <div className="page">
        <p className="status error">{error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="topbar">
        <div>
          <p className="eyebrow">Study smarter</p>
          <h1>Lumina Cards</h1>
        </div>
        <nav className="tabs">
          <button
            className={view === "study" ? "tab active" : "tab"}
            onClick={() => {
              setView("study");
              setFlipped(false);
            }}
          >
            Study
          </button>
          <button
            className={view === "manage" || view === "form" ? "tab active" : "tab"}
            onClick={() => setView("manage")}
          >
            Manage
          </button>
        </nav>
      </header>

      {error ? <p className="banner">{error}</p> : null}

      {view === "study" && (
        <section className="study">
          {current ? (
            <>
              <button
                type="button"
                className={`flip-card ${flipped ? "is-flipped" : ""}`}
                onClick={() => setFlipped((value) => !value)}
                aria-label="Flip flashcard"
              >
                <div className="flip-inner">
                  <div className="face front">
                    <span className="badge">Question</span>
                    <h2>{current.question}</h2>
                    <p>Click to reveal the answer</p>
                  </div>
                  <div className="face back">
                    <span className="badge">Answer</span>
                    <h2>{current.answer}</h2>
                    <p>Click to see the question again</p>
                  </div>
                </div>
              </button>

              <div className="study-actions">
                <button type="button" className="ghost" onClick={() => goTo(index - 1)}>
                  Previous
                </button>
                <span className="counter">
                  {index + 1} / {cards.length}
                </span>
                <button type="button" className="ghost" onClick={() => goTo(index + 1)}>
                  Next
                </button>
              </div>
            </>
          ) : (
            <div className="empty">
              <h2>Your deck is empty</h2>
              <p>Add a flashcard to start studying.</p>
              <button type="button" className="primary" onClick={openCreate}>
                Create a card
              </button>
            </div>
          )}
        </section>
      )}

      {view === "manage" && (
        <section className="manage">
          <div className="manage-head">
            <div>
              <h2>Your deck</h2>
              <p>{cards.length} card{cards.length === 1 ? "" : "s"} ready to study</p>
            </div>
            <button type="button" className="primary" onClick={openCreate}>
              Add card
            </button>
          </div>

          {cards.length ? (
            <ul className="card-list">
              {cards.map((card) => (
                <li key={card.id} className="list-card">
                  <div>
                    <h3>{card.question}</h3>
                    <p>{card.answer}</p>
                  </div>
                  <div className="row-actions">
                    <button type="button" className="ghost" onClick={() => openEdit(card)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => deleteCard(card)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty compact">
              <h2>No cards yet</h2>
              <p>Create your first question and answer.</p>
            </div>
          )}
        </section>
      )}

      {view === "form" && (
        <section className="form-wrap">
          <form className="card-form" onSubmit={saveCard}>
            <h2>{editingId ? "Edit flashcard" : "New flashcard"}</h2>
            <label>
              Question
              <textarea
                value={form.question}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    question: event.target.value,
                  }))
                }
                rows={3}
                placeholder="What do you want to remember?"
              />
            </label>
            <label>
              Answer
              <textarea
                value={form.answer}
                onChange={(event) =>
                  setForm((currentForm) => ({
                    ...currentForm,
                    answer: event.target.value,
                  }))
                }
                rows={4}
                placeholder="Write a clear, complete answer."
              />
            </label>
            {formError ? <p className="form-error">{formError}</p> : null}
            <div className="form-actions">
              <button
                type="button"
                className="ghost"
                onClick={() => setView("manage")}
                disabled={saving}
              >
                Cancel
              </button>
              <button type="submit" className="primary" disabled={saving}>
                {saving ? "Saving..." : editingId ? "Update card" : "Create card"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}

export default App;
