import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  createId,
  readHistory,
  readVocabularyNotebook,
  writeHistory,
  writeVocabularyNotebook
} from "./storage.js";
import {
  createLearningItem,
  createSrsData,
  deleteLearningItem,
  deleteLearningSession,
  deleteStudyLog,
  deleteSrsData,
  getLearningItem,
  getLearningSession,
  getSrsData,
  getStudyLog,
  listLearningItems,
  listSrsData,
  readLearningSessions,
  readStudyLogs,
  saveLearningSession,
  saveStudyLog,
  updateLearningItem,
  updateSrsData
} from "./learningStorage.js";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const backendRoot = path.resolve(currentDir, "..");
const projectRoot = path.resolve(backendRoot, "..");
const frontendRoot = path.resolve(projectRoot, "frontend");

dotenv.config({ path: path.resolve(projectRoot, ".env") });

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/supabase-config.js", (_request, response) => {
  response.type("application/javascript").send(
    [
      "window.SUPABASE_URL = " + JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL || "") + ";",
      "window.SUPABASE_ANON_KEY = " + JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "") + ";",
      ""
    ].join("\n")
  );
});

app.use(express.static(frontendRoot));

function summarizeTitle(text = "", fallback = "学習記録") {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return fallback;
  }

  return cleaned.length > 40 ? `${cleaned.slice(0, 40)}...` : cleaned;
}

function sanitizeHistoryItem(item) {
  return {
    id: item.id || createId(),
    inputText: item.inputText || "",
    language: item.language || "unknown",
    mode: item.mode || "unknown",
    output: item.output || null,
    createdAt: item.createdAt || new Date().toISOString(),
    memo: item.memo || "",
    importantVocabulary: Array.isArray(item.importantVocabulary)
      ? item.importantVocabulary
      : [],
    reviewStatus: item.reviewStatus || "未着手",
    title: item.title || summarizeTitle(item.inputText)
  };
}

function sanitizeVocabularyItem(item) {
  return {
    id: item.id || createId(),
    language: item.language || "english",
    term: item.term || "",
    pinyin: item.pinyin || "",
    partOfSpeech: item.partOfSpeech || "",
    meaning: item.meaning || "",
    example: item.example || "",
    exampleTranslation: item.exampleTranslation || "",
    examplePinyin: item.examplePinyin || "",
    difference: item.difference || "",
    synonyms: item.synonyms || "",
    memoryHint: item.memoryHint || "",
    difficulty: item.difficulty || "",
    note: item.note || "",
    createdAt: item.createdAt || new Date().toISOString(),
    reviewCount: Number(item.reviewCount || 0),
    masteryStatus: item.masteryStatus || "未学習"
  };
}

app.get("/api/health", async (_request, response) => {
  response.json({
    ok: true
  });
});

app.get("/api/learning-items", async (request, response) => {
  const { type = "", language = "", tag = "", query = "" } = request.query;
  const items = await listLearningItems({ type, language, tag, query });
  response.json({ items });
});

app.post("/api/learning-items", async (request, response) => {
  const item = await createLearningItem(request.body);
  response.status(201).json({ item });
});

app.get("/api/learning-items/:id", async (request, response) => {
  const item = await getLearningItem(request.params.id);

  if (!item) {
    return response.status(404).json({ error: "学習アイテムが見つかりません。" });
  }

  return response.json({ item });
});

app.patch("/api/learning-items/:id", async (request, response) => {
  const item = await updateLearningItem(request.params.id, request.body);

  if (!item) {
    return response.status(404).json({ error: "学習アイテムが見つかりません。" });
  }

  return response.json({ item });
});

app.delete("/api/learning-items/:id", async (request, response) => {
  const deleted = await deleteLearningItem(request.params.id);

  if (!deleted) {
    return response.status(404).json({ error: "学習アイテムが見つかりません。" });
  }

  return response.json({ ok: true });
});

app.get("/api/srs", async (_request, response) => {
  const items = await listSrsData();
  response.json({ items });
});

app.post("/api/srs", async (request, response) => {
  const item = await createSrsData(request.body);

  if (!item) {
    return response.status(400).json({ error: "itemId を指定してください。" });
  }

  return response.status(201).json({ item });
});

app.get("/api/srs/:itemId", async (request, response) => {
  const item = await getSrsData(request.params.itemId);

  if (!item) {
    return response.status(404).json({ error: "SRSデータが見つかりません。" });
  }

  return response.json({ item });
});

app.patch("/api/srs/:itemId", async (request, response) => {
  const item = await updateSrsData(request.params.itemId, request.body);

  if (!item) {
    return response.status(404).json({ error: "SRSデータが見つかりません。" });
  }

  return response.json({ item });
});

app.delete("/api/srs/:itemId", async (request, response) => {
  const deleted = await deleteSrsData(request.params.itemId);

  if (!deleted) {
    return response.status(404).json({ error: "SRSデータが見つかりません。" });
  }

  return response.json({ ok: true });
});

app.get("/api/learning-sessions", async (_request, response) => {
  const items = await readLearningSessions();
  response.json({ items });
});

app.post("/api/learning-sessions", async (request, response) => {
  const item = await saveLearningSession(request.body);
  response.status(201).json({ item });
});

app.get("/api/learning-sessions/:id", async (request, response) => {
  const item = await getLearningSession(request.params.id);

  if (!item) {
    return response.status(404).json({ error: "学習セッションが見つかりません。" });
  }

  return response.json({ item });
});

app.delete("/api/learning-sessions/:id", async (request, response) => {
  const deleted = await deleteLearningSession(request.params.id);

  if (!deleted) {
    return response.status(404).json({ error: "学習セッションが見つかりません。" });
  }

  return response.json({ ok: true });
});

app.get("/api/study-logs", async (_request, response) => {
  const items = await readStudyLogs();
  response.json({ items });
});

app.post("/api/study-logs", async (request, response) => {
  const item = await saveStudyLog(request.body);
  response.status(201).json({ item });
});

app.get("/api/study-logs/:id", async (request, response) => {
  const item = await getStudyLog(request.params.id);

  if (!item) {
    return response.status(404).json({ error: "学習ログが見つかりません。" });
  }

  return response.json({ item });
});

app.delete("/api/study-logs/:id", async (request, response) => {
  const deleted = await deleteStudyLog(request.params.id);

  if (!deleted) {
    return response.status(404).json({ error: "学習ログが見つかりません。" });
  }

  return response.json({ ok: true });
});

app.get("/api/history", async (_request, response) => {
  const items = await readHistory();
  response.json({
    items: items.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  });
});

app.post("/api/history", async (request, response) => {
  const item = sanitizeHistoryItem(request.body);
  const items = await readHistory();
  items.unshift(item);
  await writeHistory(items);
  response.json({ item });
});

app.get("/api/history/:id", async (request, response) => {
  const items = await readHistory();
  const item = items.find((entry) => entry.id === request.params.id);

  if (!item) {
    return response.status(404).json({ error: "履歴が見つかりません。" });
  }

  return response.json({ item });
});

app.delete("/api/history/:id", async (request, response) => {
  const items = await readHistory();
  const nextItems = items.filter((entry) => entry.id !== request.params.id);

  if (nextItems.length === items.length) {
    return response.status(404).json({ error: "履歴が見つかりません。" });
  }

  await writeHistory(nextItems);
  return response.json({ ok: true });
});

app.get("/api/vocabulary", async (request, response) => {
  const items = await readVocabularyNotebook();
  const { language = "", status = "", query = "" } = request.query;

  const filtered = items.filter((item) => {
    const matchesLanguage = !language || item.language === language;
    const matchesStatus = !status || item.masteryStatus === status;
    const haystack = [
      item.term,
      item.meaning,
      item.example,
      item.note
    ]
      .join(" ")
      .toLowerCase();
    const matchesQuery = !query || haystack.includes(String(query).toLowerCase());

    return matchesLanguage && matchesStatus && matchesQuery;
  });

  response.json({
    items: filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  });
});

app.post("/api/vocabulary", async (request, response) => {
  const payload = Array.isArray(request.body.items) ? request.body.items : [request.body];
  const notebook = await readVocabularyNotebook();
  const nextItems = payload
    .map((item) => sanitizeVocabularyItem(item))
    .filter((item) => item.term);

  notebook.unshift(...nextItems);
  await writeVocabularyNotebook(notebook);

  response.json({
    items: nextItems
  });
});

app.patch("/api/vocabulary/:id", async (request, response) => {
  const items = await readVocabularyNotebook();
  const index = items.findIndex((item) => item.id === request.params.id);

  if (index === -1) {
    return response.status(404).json({ error: "単語が見つかりません。" });
  }

  items[index] = sanitizeVocabularyItem({
    ...items[index],
    ...request.body
  });

  await writeVocabularyNotebook(items);
  return response.json({ item: items[index] });
});

app.delete("/api/vocabulary/:id", async (request, response) => {
  const items = await readVocabularyNotebook();
  const nextItems = items.filter((item) => item.id !== request.params.id);

  if (nextItems.length === items.length) {
    return response.status(404).json({ error: "単語が見つかりません。" });
  }

  await writeVocabularyNotebook(nextItems);
  return response.json({ ok: true });
});

app.get("/api/review/random", async (request, response) => {
  const items = await readVocabularyNotebook();
  const { language = "" } = request.query;

  const candidates = items.filter((item) => {
    const matchesLanguage = !language || item.language === language;
    return matchesLanguage && item.masteryStatus !== "習得済み";
  });

  if (candidates.length === 0) {
    return response.json({ item: null });
  }

  const item = candidates[Math.floor(Math.random() * candidates.length)];
  return response.json({ item });
});

app.post("/api/review/:id", async (request, response) => {
  const { outcome } = request.body;
  const items = await readVocabularyNotebook();
  const index = items.findIndex((item) => item.id === request.params.id);

  if (index === -1) {
    return response.status(404).json({ error: "単語が見つかりません。" });
  }

  const current = items[index];
  const nextStatus =
    outcome === "known"
      ? current.masteryStatus === "未学習"
        ? "復習中"
        : current.masteryStatus === "復習中"
          ? "だいたい覚えた"
          : "習得済み"
      : current.masteryStatus === "習得済み"
        ? "だいたい覚えた"
        : "復習中";

  items[index] = {
    ...current,
    reviewCount: Number(current.reviewCount || 0) + 1,
    masteryStatus: nextStatus
  };

  await writeVocabularyNotebook(items);
  return response.json({ item: items[index] });
});

app.get(/.*/, (_request, response) => {
  response.sendFile(path.resolve(frontendRoot, "index.html"));
});

const port = Number(process.env.PORT || 8787);

app.listen(port, () => {
  console.log(`Backend server started on http://localhost:${port}`);
});
