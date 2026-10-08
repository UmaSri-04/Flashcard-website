const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

let nextId = 4;
let flashcards = [
  {
    id: 1,
    question: "What is Full Stack Development?",
    answer:
      "Building both the frontend (UI) and the backend (server, APIs, database) of a web application.",
  },
  {
    id: 2,
    question: "What does CRUD stand for?",
    answer: "Create, Read, Update, and Delete — the four basic data operations.",
  },
  {
    id: 3,
    question: "What is React?",
    answer:
      "A JavaScript library for building user interfaces with reusable components.",
  },
];

function requireText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

app.get("/api/flashcards", (req, res) => {
  res.json(flashcards);
});

app.get("/api/flashcards/:id", (req, res) => {
  const card = flashcards.find((item) => item.id === Number(req.params.id));
  if (!card) {
    return res.status(404).json({ error: "Flashcard not found" });
  }
  res.json(card);
});

app.post("/api/flashcards", (req, res) => {
  const { question, answer } = req.body || {};
  if (!requireText(question) || !requireText(answer)) {
    return res.status(400).json({ error: "Question and answer are required" });
  }

  const card = {
    id: nextId++,
    question: question.trim(),
    answer: answer.trim(),
  };
  flashcards.push(card);
  res.status(201).json(card);
});

app.put("/api/flashcards/:id", (req, res) => {
  const index = flashcards.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Flashcard not found" });
  }

  const { question, answer } = req.body || {};
  if (!requireText(question) || !requireText(answer)) {
    return res.status(400).json({ error: "Question and answer are required" });
  }

  flashcards[index] = {
    ...flashcards[index],
    question: question.trim(),
    answer: answer.trim(),
  };
  res.json(flashcards[index]);
});

app.delete("/api/flashcards/:id", (req, res) => {
  const index = flashcards.findIndex((item) => item.id === Number(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: "Flashcard not found" });
  }

  const [removed] = flashcards.splice(index, 1);
  res.json(removed);
});

app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Flashcard API is running" });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
