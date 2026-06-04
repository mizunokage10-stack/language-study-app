import { createId, readJsonFile, writeJsonFile } from "./storage.js";

const LEARNING_ITEMS_FILE = "learning-items.json";
const SRS_DATA_FILE = "srs-data.json";
const LEARNING_SESSIONS_FILE = "learning-sessions.json";
const STUDY_LOGS_FILE = "study-logs.json";

const learningItemTypes = new Set(["vocabulary", "grammar", "sentence", "listening", "writing"]);
const learningLanguages = new Set(["english", "chinese", "other"]);

function nowIso() {
  return new Date().toISOString();
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function toStringArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => String(item).trim()).filter(Boolean);
}

function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeLearningItemType(type) {
  return learningItemTypes.has(type) ? type : "vocabulary";
}

function normalizeLearningLanguage(language) {
  if (language === "en") return "english";
  if (language === "zh") return "chinese";
  return learningLanguages.has(language) ? language : "other";
}

/**
 * @param {Partial<import("./types.js").LearningItem>} item
 * @param {import("./types.js").LearningItem | null} [existing]
 * @returns {import("./types.js").LearningItem}
 */
export function sanitizeLearningItem(item, existing = null) {
  const timestamp = nowIso();

  return {
    id: existing?.id || item.id || createId(),
    type: normalizeLearningItemType(item.type),
    language: normalizeLearningLanguage(item.language),
    title: item.title || "",
    meaning: item.meaning || "",
    pos: item.pos || "",
    content: item.content || "",
    example: item.example || "",
    exampleTranslation: item.exampleTranslation || "",
    note: item.note || "",
    tags: toStringArray(item.tags),
    createdAt: existing?.createdAt || item.createdAt || timestamp,
    updatedAt: timestamp
  };
}

/**
 * @param {Partial<import("./types.js").SrsData>} srsData
 * @param {import("./types.js").SrsData | null} [existing]
 * @returns {import("./types.js").SrsData}
 */
export function sanitizeSrsData(srsData, existing = null) {
  return {
    itemId: existing?.itemId || srsData.itemId || "",
    nextReviewDate: srsData.nextReviewDate || existing?.nextReviewDate || todayIsoDate(),
    interval: toNumber(srsData.interval ?? existing?.interval, 0),
    easeFactor: toNumber(srsData.easeFactor ?? existing?.easeFactor, 2.5),
    reviewCount: toNumber(srsData.reviewCount ?? existing?.reviewCount, 0),
    mistakeCount: toNumber(srsData.mistakeCount ?? existing?.mistakeCount, 0),
    lastReviewedAt: srsData.lastReviewedAt || existing?.lastReviewedAt || "",
    masteryLevel: toNumber(srsData.masteryLevel ?? existing?.masteryLevel, 0)
  };
}

/**
 * @param {Partial<import("./types.js").LearningSession>} session
 * @param {import("./types.js").LearningSession | null} [existing]
 * @returns {import("./types.js").LearningSession}
 */
export function sanitizeLearningSession(session, existing = null) {
  return {
    id: existing?.id || session.id || createId(),
    date: session.date || existing?.date || todayIsoDate(),
    courseId: session.courseId || "",
    courseName: session.courseName || "",
    plannedMinutes: toNumber(session.plannedMinutes, 0),
    actualMinutes: toNumber(session.actualMinutes, 0),
    completedSteps: toStringArray(session.completedSteps),
    skippedSteps: toStringArray(session.skippedSteps),
    reviewedItemIds: toStringArray(session.reviewedItemIds),
    mistakeItemIds: toStringArray(session.mistakeItemIds),
    dictationCount: toNumber(session.dictationCount, 0),
    recordingCount: toNumber(session.recordingCount, 0),
    writingText: session.writingText || "",
    feedbackText: session.feedbackText || "",
    note: session.note || ""
  };
}

/**
 * @param {Partial<import("./types.js").StudyLog>} log
 * @param {import("./types.js").StudyLog | null} [existing]
 * @returns {import("./types.js").StudyLog}
 */
export function sanitizeStudyLog(log, existing = null) {
  const timestamp = nowIso();

  return {
    id: existing?.id || log.id || createId(),
    date: log.date || existing?.date || todayIsoDate(),
    learnedItems: toStringArray(log.learnedItems),
    mistakes: toStringArray(log.mistakes),
    feedback: log.feedback || "",
    tomorrowReviewItems: toStringArray(log.tomorrowReviewItems),
    freeNote: log.freeNote || "",
    createdAt: existing?.createdAt || log.createdAt || timestamp,
    updatedAt: timestamp
  };
}

export async function readLearningItems() {
  return readJsonFile(LEARNING_ITEMS_FILE, []);
}

export async function writeLearningItems(items) {
  await writeJsonFile(LEARNING_ITEMS_FILE, items);
}

export async function listLearningItems(filters = {}) {
  const { type = "", language = "", tag = "", query = "" } = filters;
  const items = await readLearningItems();
  const normalizedQuery = String(query).trim().toLowerCase();

  return items
    .filter((item) => {
      const matchesType = !type || item.type === type;
      const matchesLanguage = !language || item.language === language;
      const matchesTag = !tag || item.tags?.includes(tag);
      const haystack = [
        item.title,
        item.meaning,
        item.pos,
        item.content,
        item.example,
        item.exampleTranslation,
        item.note,
        ...(Array.isArray(item.tags) ? item.tags : [])
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalizedQuery || haystack.includes(normalizedQuery);

      return matchesType && matchesLanguage && matchesTag && matchesQuery;
    })
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export async function getLearningItem(id) {
  const items = await readLearningItems();
  return items.find((item) => item.id === id) || null;
}

export async function createLearningItem(payload) {
  const item = sanitizeLearningItem(payload);
  const items = await readLearningItems();
  items.unshift(item);
  await writeLearningItems(items);
  return item;
}

export async function updateLearningItem(id, patch) {
  const items = await readLearningItems();
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  items[index] = sanitizeLearningItem(
    {
      ...items[index],
      ...patch,
      id
    },
    items[index]
  );
  await writeLearningItems(items);
  return items[index];
}

export async function deleteLearningItem(id) {
  const items = await readLearningItems();
  const nextItems = items.filter((item) => item.id !== id);

  if (nextItems.length === items.length) {
    return false;
  }

  await writeLearningItems(nextItems);
  await deleteSrsData(id);
  return true;
}

export async function readAllSrsData() {
  return readJsonFile(SRS_DATA_FILE, []);
}

export async function writeAllSrsData(items) {
  await writeJsonFile(SRS_DATA_FILE, items);
}

export async function listSrsData() {
  return readAllSrsData();
}

export async function getSrsData(itemId) {
  const items = await readAllSrsData();
  return items.find((item) => item.itemId === itemId) || null;
}

export async function createSrsData(payload) {
  const item = sanitizeSrsData(payload);
  if (!item.itemId) {
    return null;
  }

  const items = await readAllSrsData();
  const index = items.findIndex((entry) => entry.itemId === item.itemId);

  if (index === -1) {
    items.unshift(item);
  } else {
    items[index] = sanitizeSrsData(item, items[index]);
  }

  await writeAllSrsData(items);
  return index === -1 ? item : items[index];
}

export async function updateSrsData(itemId, patch) {
  const items = await readAllSrsData();
  const index = items.findIndex((item) => item.itemId === itemId);

  if (index === -1) {
    return null;
  }

  items[index] = sanitizeSrsData(
    {
      ...items[index],
      ...patch,
      itemId
    },
    items[index]
  );
  await writeAllSrsData(items);
  return items[index];
}

export async function deleteSrsData(itemId) {
  const items = await readAllSrsData();
  const nextItems = items.filter((item) => item.itemId !== itemId);

  if (nextItems.length === items.length) {
    return false;
  }

  await writeAllSrsData(nextItems);
  return true;
}

export async function readLearningSessions() {
  return readJsonFile(LEARNING_SESSIONS_FILE, []);
}

export async function saveLearningSession(payload) {
  const sessions = await readLearningSessions();
  const existingIndex = payload.id
    ? sessions.findIndex((session) => session.id === payload.id)
    : -1;
  const existing = existingIndex === -1 ? null : sessions[existingIndex];
  const session = sanitizeLearningSession(
    {
      ...existing,
      ...payload
    },
    existing
  );

  if (existingIndex === -1) {
    sessions.unshift(session);
  } else {
    sessions[existingIndex] = session;
  }

  await writeJsonFile(LEARNING_SESSIONS_FILE, sessions);
  return session;
}

export async function getLearningSession(id) {
  const sessions = await readLearningSessions();
  return sessions.find((session) => session.id === id) || null;
}

export async function deleteLearningSession(id) {
  const sessions = await readLearningSessions();
  const nextSessions = sessions.filter((session) => session.id !== id);

  if (nextSessions.length === sessions.length) {
    return false;
  }

  await writeJsonFile(LEARNING_SESSIONS_FILE, nextSessions);
  return true;
}

export async function readStudyLogs() {
  return readJsonFile(STUDY_LOGS_FILE, []);
}

export async function saveStudyLog(payload) {
  const logs = await readStudyLogs();
  const existingIndex = payload.id ? logs.findIndex((log) => log.id === payload.id) : -1;
  const existing = existingIndex === -1 ? null : logs[existingIndex];
  const log = sanitizeStudyLog(
    {
      ...existing,
      ...payload
    },
    existing
  );

  if (existingIndex === -1) {
    logs.unshift(log);
  } else {
    logs[existingIndex] = log;
  }

  await writeJsonFile(STUDY_LOGS_FILE, logs);
  return log;
}

export async function getStudyLog(id) {
  const logs = await readStudyLogs();
  return logs.find((log) => log.id === id) || null;
}

export async function deleteStudyLog(id) {
  const logs = await readStudyLogs();
  const nextLogs = logs.filter((log) => log.id !== id);

  if (nextLogs.length === logs.length) {
    return false;
  }

  await writeJsonFile(STUDY_LOGS_FILE, nextLogs);
  return true;
}
