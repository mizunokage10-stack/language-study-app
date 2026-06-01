import { supabase } from "./supabase-client.js";
import { createRepositories } from "./repositories.js";

const state = {
  currentPage: "home",
  currentUser: null,
  authReady: !supabase,
  isBusy: false,
  learningItems: [],
  historyItems: [],
  notebookItems: [],
  selectedLearningItemId: "",
  selectedHistoryId: "",
  selectedNotebookId: "",
  reviewQueue: [],
  reviewIndex: 0,
  reviewRevealed: false,
  reviewedItems: [],
  difficultReviewItems: [],
  selectedCourse: null,
  courseRun: null,
  courseTimerId: null
};

const localStoreKeys = {
  learningItems: "language-study.learningItems",
  srsData: "language-study.srsData",
  learningSessions: "language-study.learningSessions",
  notebookItems: "language-study.notebookItems",
  historyItems: "language-study.historyItems"
};

const elements = {
  statusText: document.querySelector("#status-text"),
  navButtons: document.querySelectorAll(".nav-button"),
  pages: document.querySelectorAll(".page"),
  homeButtons: document.querySelectorAll("[data-go]"),
  learningItemTableBody: document.querySelector("#learning-item-table-body"),
  learningItemTypeFilter: document.querySelector("#learning-item-type-filter"),
  learningItemLanguageFilter: document.querySelector("#learning-item-language-filter"),
  learningItemQuery: document.querySelector("#learning-item-query"),
  learningItemSearch: document.querySelector("#learning-item-search"),
  learningItemForm: document.querySelector("#learning-item-form"),
  learningItemId: document.querySelector("#learning-item-id"),
  learningItemType: document.querySelector("#learning-item-type"),
  learningItemLanguage: document.querySelector("#learning-item-language"),
  learningItemTitle: document.querySelector("#learning-item-title"),
  learningItemMeaning: document.querySelector("#learning-item-meaning"),
  learningItemContent: document.querySelector("#learning-item-content"),
  learningItemExample: document.querySelector("#learning-item-example"),
  learningItemExampleTranslation: document.querySelector("#learning-item-example-translation"),
  learningItemNote: document.querySelector("#learning-item-note"),
  learningItemTags: document.querySelector("#learning-item-tags"),
  newLearningItem: document.querySelector("#new-learning-item"),
  deleteLearningItem: document.querySelector("#delete-learning-item"),
  coursePresetList: document.querySelector("#course-preset-list"),
  courseSelectView: document.querySelector("#course-select-view"),
  courseConfirmView: document.querySelector("#course-confirm-view"),
  courseTimerView: document.querySelector("#course-timer-view"),
  courseCompleteView: document.querySelector("#course-complete-view"),
  courseConfirmTitle: document.querySelector("#course-confirm-title"),
  courseConfirmDescription: document.querySelector("#course-confirm-description"),
  courseConfirmSteps: document.querySelector("#course-confirm-steps"),
  courseStart: document.querySelector("#course-start"),
  courseConfirmBack: document.querySelector("#course-confirm-back"),
  courseActiveName: document.querySelector("#course-active-name"),
  courseStepTitle: document.querySelector("#course-step-title"),
  courseStepMeta: document.querySelector("#course-step-meta"),
  courseTimerDisplay: document.querySelector("#course-timer-display"),
  courseProgressBar: document.querySelector("#course-progress-bar"),
  courseStepInstructions: document.querySelector("#course-step-instructions"),
  courseNextStep: document.querySelector("#course-next-step"),
  courseStepUi: document.querySelector("#course-step-ui"),
  coursePause: document.querySelector("#course-pause"),
  courseResume: document.querySelector("#course-resume"),
  coursePrev: document.querySelector("#course-prev"),
  courseNext: document.querySelector("#course-next"),
  courseExtend: document.querySelector("#course-extend"),
  courseSkip: document.querySelector("#course-skip"),
  courseEnd: document.querySelector("#course-end"),
  courseSummary: document.querySelector("#course-summary"),
  courseSaveMessage: document.querySelector("#course-save-message"),
  courseSave: document.querySelector("#course-save"),
  courseHome: document.querySelector("#course-home"),
  historyTableBody: document.querySelector("#history-table-body"),
  historyDetail: document.querySelector("#history-detail"),
  refreshHistory: document.querySelector("#refresh-history"),
  notebookTableBody: document.querySelector("#notebook-table-body"),
  notebookLanguageFilter: document.querySelector("#notebook-language-filter"),
  notebookStatusFilter: document.querySelector("#notebook-status-filter"),
  notebookQuery: document.querySelector("#notebook-query"),
  notebookSearch: document.querySelector("#notebook-search"),
  notebookDetailForm: document.querySelector("#notebook-detail-form"),
  notebookDetailId: document.querySelector("#notebook-detail-id"),
  notebookDetailTerm: document.querySelector("#notebook-detail-term"),
  notebookDetailLanguage: document.querySelector("#notebook-detail-language"),
  notebookDetailPinyin: document.querySelector("#notebook-detail-pinyin"),
  notebookDetailPos: document.querySelector("#notebook-detail-pos"),
  notebookDetailStatus: document.querySelector("#notebook-detail-status"),
  notebookDetailMeaning: document.querySelector("#notebook-detail-meaning"),
  notebookDetailExample: document.querySelector("#notebook-detail-example"),
  notebookDetailExampleTranslation: document.querySelector("#notebook-detail-example-translation"),
  notebookDetailNote: document.querySelector("#notebook-detail-note"),
  newNotebookItem: document.querySelector("#new-notebook-item"),
  deleteNotebookItem: document.querySelector("#delete-notebook-item"),
  reviewCard: document.querySelector("#review-card"),
  reviewTotalCount: document.querySelector("#review-total-count"),
  reviewCurrentCount: document.querySelector("#review-current-count"),
  loadReviewCard: document.querySelector("#load-review-card"),
  reviewAnswerField: document.querySelector("#review-answer-field"),
  reviewInputLabel: document.querySelector("#review-input-label"),
  reviewAnswerInput: document.querySelector("#review-answer-input"),
  reviewAnswerArea: document.querySelector("#review-answer-area"),
  revealReviewAnswer: document.querySelector("#reveal-review-answer"),
  reviewEasy: document.querySelector("#review-easy"),
  reviewNormal: document.querySelector("#review-normal"),
  reviewHard: document.querySelector("#review-hard"),
  reviewForgot: document.querySelector("#review-forgot"),
  reviewComplete: document.querySelector("#review-complete"),
  authLoggedOut: document.querySelector("#auth-logged-out"),
  authLoggedIn: document.querySelector("#auth-logged-in"),
  authEmail: document.querySelector("#auth-email"),
  authPassword: document.querySelector("#auth-password"),
  authLogin: document.querySelector("#auth-login"),
  authSignup: document.querySelector("#auth-signup"),
  authLogout: document.querySelector("#auth-logout"),
  authMessage: document.querySelector("#auth-message"),
  authUserEmail: document.querySelector("#auth-user-email")
};

const coursePresets = [
  {
    id: "course-30",
    name: "30分コース",
    totalMinutes: 30,
    description: "忙しい日でも最低限",
    steps: [
      { id: "srs-5", title: "SRS復習", type: "srs", minutes: 5, instructions: "今日復習すべき学習アイテムを短時間で確認します。" },
      { id: "listening-7", title: "リスニング", type: "listening", minutes: 7, instructions: "登録済みのlisteningまたはsentenceを聞く練習です。" },
      { id: "recording-5", title: "音読", type: "recording", minutes: 5, instructions: "例文や本文を声に出して読みます。録音機能は今後接続します。" },
      { id: "reading-8", title: "読解・例文確認", type: "reading", minutes: 8, instructions: "登録済みの例文や本文を読み、意味と構造を確認します。" },
      { id: "writing-5", title: "ミニ作文・学習ログ", type: "writing", minutes: 5, instructions: "短い作文を書き、今日の気づきを残します。" }
    ]
  },
  {
    id: "course-60",
    name: "60分コース",
    totalMinutes: 60,
    description: "標準バランス学習",
    steps: [
      { id: "srs-10", title: "SRS復習", type: "srs", minutes: 10, instructions: "今日復習すべき学習アイテムを確認します。" },
      { id: "dictation-10", title: "ディクテーション", type: "dictation", minutes: 10, instructions: "聞き取った内容を書き取る練習です。音声機能は今後接続します。" },
      { id: "recording-10", title: "音読・録音", type: "recording", minutes: 10, instructions: "本文や例文を音読します。録音機能は今後接続します。" },
      { id: "grammar-15", title: "読解・文法確認", type: "grammar", minutes: 15, instructions: "登録済みの文法・例文を確認します。" },
      { id: "writing-10", title: "作文・要約", type: "writing", minutes: 10, instructions: "短い作文または要約を書きます。" },
      { id: "log-5", title: "学習ログ", type: "log", minutes: 5, instructions: "今日の学習メモを整理します。" }
    ]
  },
  {
    id: "course-90",
    name: "90分コース",
    totalMinutes: 90,
    description: "しっかり集中学習",
    steps: [
      { id: "srs-15", title: "SRS復習", type: "srs", minutes: 15, instructions: "今日復習すべき学習アイテムをしっかり確認します。" },
      { id: "grammar-15", title: "精読・文法分析", type: "grammar", minutes: 15, instructions: "文法や例文の構造を分析します。" },
      { id: "dictation-10", title: "ディクテーション", type: "dictation", minutes: 10, instructions: "聞き取った内容を書き取る練習です。" },
      { id: "shadowing-15", title: "リスニング・シャドーイング", type: "shadowing", minutes: 15, instructions: "登録済みのlisteningまたはsentenceでシャドーイングします。" },
      { id: "recording-10", title: "音読録音", type: "recording", minutes: 10, instructions: "音読して発音や流れを確認します。録音機能は今後接続します。" },
      { id: "writing-15", title: "作文・要約", type: "writing", minutes: 15, instructions: "学習内容を使って作文または要約を書きます。" },
      { id: "log-10", title: "添削プロンプト生成・学習ログ", type: "log", minutes: 10, instructions: "添削に出したい内容や今日の学習ログを整理します。" }
    ]
  }
];

// ---- 認証 ---------------------------------------------------------------

function renderAuthPanel(user) {
  state.currentUser = user || null;
  state.authReady = true;

  if (user) {
    elements.authLoggedOut.style.display = "none";
    elements.authLoggedIn.style.display = "";
    elements.authUserEmail.textContent = user.email;
    elements.authMessage.textContent = "";
  } else {
    elements.authLoggedOut.style.display = "";
    elements.authLoggedIn.style.display = "none";
    elements.authUserEmail.textContent = "";
  }
}

function setAuthMessage(message, isError = false) {
  elements.authMessage.textContent = message;
  elements.authMessage.classList.toggle("auth-message--error", isError);
}

async function handleLogin() {
  if (!supabase) {
    setAuthMessage("Supabaseが未設定です。環境変数を確認してください。", true);
    return;
  }

  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  if (!email || !password) {
    setAuthMessage("メールアドレスとパスワードを入力してください。", true);
    return;
  }

  setAuthMessage("ログイン中...");
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    setAuthMessage(error.message || "ログインに失敗しました。", true);
  } else {
    elements.authPassword.value = "";
    setAuthMessage("");
  }
}

async function handleSignup() {
  if (!supabase) {
    setAuthMessage("Supabaseが未設定です。環境変数を確認してください。", true);
    return;
  }

  const email = elements.authEmail.value.trim();
  const password = elements.authPassword.value;

  if (!email || !password) {
    setAuthMessage("メールアドレスとパスワードを入力してください。", true);
    return;
  }

  if (password.length < 6) {
    setAuthMessage("パスワードは6文字以上にしてください。", true);
    return;
  }

  setAuthMessage("登録中...");
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    setAuthMessage(error.message || "登録に失敗しました。", true);
  } else {
    setAuthMessage("確認メールを送信しました。メールを確認してください。");
    elements.authPassword.value = "";
  }
}

async function handleLogout() {
  if (!supabase) {
    setAuthMessage("Supabaseが未設定です。環境変数を確認してください。", true);
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    setAuthMessage(error.message || "ログアウトに失敗しました。", true);
  }
}

function initAuth() {
  if (!supabase) {
    setAuthMessage("Supabase未設定です。NEXT_PUBLIC_SUPABASE_URL と NEXT_PUBLIC_SUPABASE_ANON_KEY を設定してください。", true);
    return;
  }

  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      state.authReady = true;
      setAuthMessage(error.message || "Supabase接続に失敗しました。", true);
      return;
    }
    renderAuthPanel(data.session?.user ?? null);
  });

  supabase.auth.onAuthStateChange((_event, session) => {
    renderAuthPanel(session?.user ?? null);
    if (state.currentPage === "learning-items") {
      loadLearningItems();
    }
    if (state.currentPage === "review") {
      loadReviewItems();
    }
  });

  elements.authLogin.addEventListener("click", handleLogin);
  elements.authSignup.addEventListener("click", handleSignup);
  elements.authLogout.addEventListener("click", handleLogout);
}

// ---- ここまで認証 --------------------------------------------------------

function setStatus(message) {
  elements.statusText.textContent = message;
}

function setBusy(nextBusy) {
  state.isBusy = nextBusy;
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = nextBusy;
  });
}

function shouldUseLocalStorageBackend() {
  return !["localhost", "127.0.0.1", ""].includes(window.location.hostname);
}

function createLocalId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function readLocalCollection(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    return [];
  }
}

function writeLocalCollection(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function localJsonResponse(value) {
  return structuredClone(value);
}

function sortByCreatedAtDesc(items) {
  return [...items].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function sortByUpdatedAtDesc(items) {
  return [...items].sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("ja-JP");
}

function languageLabel(language) {
  return language === "chinese"
    ? "中国語"
    : language === "english"
      ? "英語"
      : language === "other"
        ? "その他"
        : language;
}

function learningItemTypeLabel(type) {
  const labels = {
    vocabulary: "単語",
    grammar: "文法",
    sentence: "例文",
    listening: "リスニング",
    writing: "作文",
    srs: "SRS",
    dictation: "ディクテーション",
    shadowing: "シャドーイング",
    reading: "読解",
    grammar: "文法",
    recording: "録音",
    log: "ログ"
  };

  return labels[type] || type;
}

function modeLabel(mode) {
  const labels = {
    manual_vocabulary: "単語登録",
    review: "復習"
  };

  return labels[mode] || mode;
}

function switchPage(pageId) {
  state.currentPage = pageId;

  elements.navButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  elements.pages.forEach((page) => {
    page.classList.toggle("active", page.id === `page-${pageId}`);
  });

  if (pageId === "history") {
    loadHistory();
  }

  if (pageId === "learning-items") {
    loadLearningItems();
  }

  if (pageId === "notebook") {
    loadNotebook();
  }

  if (pageId === "review") {
    loadReviewItems();
  }

  if (pageId === "course") {
    renderCoursePresetList();
    loadLearningItems();
  }

}

async function fetchJson(url, options = {}) {
  if (shouldUseLocalStorageBackend()) {
    return handleLocalJson(url, options);
  }

  const response = await fetch(url, options);
  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : { error: await response.text() };

  if (!response.ok) {
    throw new Error(data.error || "通信に失敗しました。");
  }

  return data;
}

async function withBusy(task, statusMessage) {
  if (state.isBusy) {
    return;
  }

  setBusy(true);
  setStatus(statusMessage);

  try {
    await task();
  } catch (error) {
    setStatus(error.message || "処理に失敗しました。");
  } finally {
    setBusy(false);
    if (state.currentPage === "review") {
      setReviewControlsVisible(Boolean(currentReviewEntry()));
    }
  }
}

function parseTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatTags(tags = []) {
  return Array.isArray(tags) ? tags.join(", ") : "";
}

function tomorrowIsoDate() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

function sanitizeLocalLearningItem(item, existing = null) {
  const timestamp = new Date().toISOString();

  return {
    id: existing?.id || item.id || createLocalId(),
    type: item.type || "vocabulary",
    language: item.language || "english",
    title: item.title || "",
    meaning: item.meaning || "",
    content: item.content || "",
    example: item.example || "",
    exampleTranslation: item.exampleTranslation || "",
    note: item.note || "",
    tags: Array.isArray(item.tags) ? item.tags : [],
    createdAt: existing?.createdAt || item.createdAt || timestamp,
    updatedAt: timestamp
  };
}

function sanitizeLocalSrsData(item, existing = null) {
  return {
    itemId: existing?.itemId || item.itemId || "",
    nextReviewDate: item.nextReviewDate || existing?.nextReviewDate || tomorrowIsoDate(),
    interval: Number(item.interval ?? existing?.interval ?? 1),
    easeFactor: Number(item.easeFactor ?? existing?.easeFactor ?? 2.5),
    reviewCount: Number(item.reviewCount ?? existing?.reviewCount ?? 0),
    mistakeCount: Number(item.mistakeCount ?? existing?.mistakeCount ?? 0),
    lastReviewedAt: item.lastReviewedAt || existing?.lastReviewedAt || "",
    masteryLevel: Number(item.masteryLevel ?? existing?.masteryLevel ?? 0)
  };
}

function sanitizeLocalVocabularyItem(item, existing = null) {
  const timestamp = new Date().toISOString();

  return {
    id: existing?.id || item.id || createLocalId(),
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
    createdAt: existing?.createdAt || item.createdAt || timestamp,
    reviewCount: Number(item.reviewCount || existing?.reviewCount || 0),
    masteryStatus: item.masteryStatus || existing?.masteryStatus || "未学習"
  };
}

function sanitizeLocalHistoryItem(item, existing = null) {
  const timestamp = new Date().toISOString();
  const inputText = item.inputText || "";

  return {
    id: existing?.id || item.id || createLocalId(),
    inputText,
    language: item.language || "unknown",
    mode: item.mode || "unknown",
    output: item.output || null,
    createdAt: existing?.createdAt || item.createdAt || timestamp,
    memo: item.memo || "",
    importantVocabulary: Array.isArray(item.importantVocabulary) ? item.importantVocabulary : [],
    reviewStatus: item.reviewStatus || "未着手",
    title: item.title || inputText.slice(0, 40) || "学習記録"
  };
}

function filterLearningItems(items, params) {
  const type = params.get("type") || "";
  const language = params.get("language") || "";
  const query = (params.get("query") || "").toLowerCase();

  return sortByUpdatedAtDesc(
    items.filter((item) => {
      const haystack = [
        item.title,
        item.meaning,
        item.content,
        item.example,
        item.exampleTranslation,
        item.note,
        ...(Array.isArray(item.tags) ? item.tags : [])
      ]
        .join(" ")
        .toLowerCase();

      return (
        (!type || item.type === type) &&
        (!language || item.language === language) &&
        (!query || haystack.includes(query))
      );
    })
  );
}

function filterVocabularyItems(items, params) {
  const language = params.get("language") || "";
  const status = params.get("status") || "";
  const query = (params.get("query") || "").toLowerCase();

  return sortByCreatedAtDesc(
    items.filter((item) => {
      const haystack = [item.term, item.meaning, item.example, item.note].join(" ").toLowerCase();

      return (
        (!language || item.language === language) &&
        (!status || item.masteryStatus === status) &&
        (!query || haystack.includes(query))
      );
    })
  );
}

async function handleLocalJson(url, options = {}) {
  const parsedUrl = new URL(url, window.location.origin);
  const path = parsedUrl.pathname;
  const method = options.method || "GET";
  const body = options.body ? JSON.parse(options.body) : {};

  if (path === "/api/learning-items" && method === "GET") {
    const items = readLocalCollection(localStoreKeys.learningItems);
    return localJsonResponse({ items: filterLearningItems(items, parsedUrl.searchParams) });
  }

  if (path === "/api/learning-items" && method === "POST") {
    const items = readLocalCollection(localStoreKeys.learningItems);
    const item = sanitizeLocalLearningItem(body);
    items.unshift(item);
    writeLocalCollection(localStoreKeys.learningItems, items);
    return localJsonResponse({ item });
  }

  if (path.startsWith("/api/learning-items/")) {
    const id = decodeURIComponent(path.split("/").pop());
    const items = readLocalCollection(localStoreKeys.learningItems);
    const index = items.findIndex((item) => item.id === id);

    if (method === "GET") {
      return localJsonResponse({ item: index === -1 ? null : items[index] });
    }

    if (method === "PATCH" && index !== -1) {
      items[index] = sanitizeLocalLearningItem({ ...items[index], ...body, id }, items[index]);
      writeLocalCollection(localStoreKeys.learningItems, items);
      return localJsonResponse({ item: items[index] });
    }

    if (method === "DELETE" && index !== -1) {
      items.splice(index, 1);
      writeLocalCollection(localStoreKeys.learningItems, items);
      const srsItems = readLocalCollection(localStoreKeys.srsData).filter((item) => item.itemId !== id);
      writeLocalCollection(localStoreKeys.srsData, srsItems);
      return localJsonResponse({ ok: true });
    }
  }

  if (path === "/api/srs" && method === "POST") {
    const items = readLocalCollection(localStoreKeys.srsData);
    const index = items.findIndex((item) => item.itemId === body.itemId);
    const item = sanitizeLocalSrsData(body, index === -1 ? null : items[index]);

    if (index === -1) {
      items.unshift(item);
    } else {
      items[index] = item;
    }

    writeLocalCollection(localStoreKeys.srsData, items);
    return localJsonResponse({ item });
  }

  if (path === "/api/srs" && method === "GET") {
    return localJsonResponse({ items: readLocalCollection(localStoreKeys.srsData) });
  }

  if (path.startsWith("/api/srs/")) {
    const itemId = decodeURIComponent(path.split("/").pop());
    const items = readLocalCollection(localStoreKeys.srsData);
    const index = items.findIndex((item) => item.itemId === itemId);

    if (method === "GET") {
      return localJsonResponse({ item: index === -1 ? null : items[index] });
    }

    if (method === "PATCH" && index !== -1) {
      items[index] = sanitizeLocalSrsData({ ...items[index], ...body, itemId }, items[index]);
      writeLocalCollection(localStoreKeys.srsData, items);
      return localJsonResponse({ item: items[index] });
    }

    if (method === "DELETE" && index !== -1) {
      items.splice(index, 1);
      writeLocalCollection(localStoreKeys.srsData, items);
      return localJsonResponse({ ok: true });
    }
  }

  if (path === "/api/learning-sessions" && method === "GET") {
    return localJsonResponse({ items: sortByCreatedAtDesc(readLocalCollection(localStoreKeys.learningSessions)) });
  }

  if (path === "/api/learning-sessions" && method === "POST") {
    const items = readLocalCollection(localStoreKeys.learningSessions);
    const timestamp = new Date().toISOString();
    const item = {
      id: body.id || createLocalId(),
      date: body.date || timestamp.slice(0, 10),
      courseId: body.courseId || "",
      courseName: body.courseName || "",
      plannedMinutes: Number(body.plannedMinutes || 0),
      actualMinutes: Number(body.actualMinutes || 0),
      completedSteps: Array.isArray(body.completedSteps) ? body.completedSteps : [],
      skippedSteps: Array.isArray(body.skippedSteps) ? body.skippedSteps : [],
      reviewedItemIds: Array.isArray(body.reviewedItemIds) ? body.reviewedItemIds : [],
      mistakeItemIds: Array.isArray(body.mistakeItemIds) ? body.mistakeItemIds : [],
      dictationCount: Number(body.dictationCount || 0),
      recordingCount: Number(body.recordingCount || 0),
      writingText: body.writingText || "",
      feedbackText: body.feedbackText || "",
      note: body.note || "",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    items.unshift(item);
    writeLocalCollection(localStoreKeys.learningSessions, items);
    return localJsonResponse({ item });
  }

  if (path.startsWith("/api/learning-sessions/")) {
    const id = decodeURIComponent(path.split("/").pop());
    const items = readLocalCollection(localStoreKeys.learningSessions);
    const index = items.findIndex((item) => item.id === id);

    if (method === "GET") {
      return localJsonResponse({ item: index === -1 ? null : items[index] });
    }

    if (method === "DELETE" && index !== -1) {
      items.splice(index, 1);
      writeLocalCollection(localStoreKeys.learningSessions, items);
      return localJsonResponse({ ok: true });
    }
  }

  if (path === "/api/vocabulary" && method === "GET") {
    const items = readLocalCollection(localStoreKeys.notebookItems);
    return localJsonResponse({ items: filterVocabularyItems(items, parsedUrl.searchParams) });
  }

  if (path === "/api/vocabulary" && method === "POST") {
    const items = readLocalCollection(localStoreKeys.notebookItems);
    const payload = Array.isArray(body.items) ? body.items : [body];
    const nextItems = payload.map((item) => sanitizeLocalVocabularyItem(item)).filter((item) => item.term);
    items.unshift(...nextItems);
    writeLocalCollection(localStoreKeys.notebookItems, items);
    return localJsonResponse({ items: nextItems });
  }

  if (path.startsWith("/api/vocabulary/")) {
    const id = decodeURIComponent(path.split("/").pop());
    const items = readLocalCollection(localStoreKeys.notebookItems);
    const index = items.findIndex((item) => item.id === id);

    if (method === "PATCH" && index !== -1) {
      items[index] = sanitizeLocalVocabularyItem({ ...items[index], ...body, id }, items[index]);
      writeLocalCollection(localStoreKeys.notebookItems, items);
      return localJsonResponse({ item: items[index] });
    }

    if (method === "DELETE" && index !== -1) {
      items.splice(index, 1);
      writeLocalCollection(localStoreKeys.notebookItems, items);
      return localJsonResponse({ ok: true });
    }
  }

  if (path === "/api/review/random" && method === "GET") {
    const language = parsedUrl.searchParams.get("language") || "";
    const candidates = readLocalCollection(localStoreKeys.notebookItems).filter(
      (item) => (!language || item.language === language) && item.masteryStatus !== "習得済み"
    );
    const item = candidates.length ? candidates[Math.floor(Math.random() * candidates.length)] : null;
    return localJsonResponse({ item });
  }

  if (path.startsWith("/api/review/") && method === "POST") {
    const id = decodeURIComponent(path.split("/").pop());
    const items = readLocalCollection(localStoreKeys.notebookItems);
    const index = items.findIndex((item) => item.id === id);

    if (index !== -1) {
      const current = items[index];
      const masteryStatus =
        body.outcome === "known"
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
        masteryStatus
      };
      writeLocalCollection(localStoreKeys.notebookItems, items);
      return localJsonResponse({ item: items[index] });
    }
  }

  if (path === "/api/history" && method === "GET") {
    const items = readLocalCollection(localStoreKeys.historyItems);
    return localJsonResponse({ items: sortByCreatedAtDesc(items) });
  }

  if (path === "/api/history" && method === "POST") {
    const items = readLocalCollection(localStoreKeys.historyItems);
    const item = sanitizeLocalHistoryItem(body);
    items.unshift(item);
    writeLocalCollection(localStoreKeys.historyItems, items);
    return localJsonResponse({ item });
  }

  if (path.startsWith("/api/history/")) {
    const id = decodeURIComponent(path.split("/").pop());
    const items = readLocalCollection(localStoreKeys.historyItems);
    const index = items.findIndex((item) => item.id === id);

    if (method === "GET") {
      return localJsonResponse({ item: index === -1 ? null : items[index] });
    }

    if (method === "DELETE" && index !== -1) {
      items.splice(index, 1);
      writeLocalCollection(localStoreKeys.historyItems, items);
      return localJsonResponse({ ok: true });
    }
  }

  throw new Error("この操作はブラウザ保存モードでは未対応です。");
}

function learningItemQueryParams() {
  const params = new URLSearchParams();
  if (elements.learningItemTypeFilter.value) {
    params.set("type", elements.learningItemTypeFilter.value);
  }
  if (elements.learningItemLanguageFilter.value) {
    params.set("language", elements.learningItemLanguageFilter.value);
  }
  if (elements.learningItemQuery.value.trim()) {
    params.set("query", elements.learningItemQuery.value.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

function getLearningItemFilters() {
  const query = learningItemQueryParams();
  return new URLSearchParams(query ? query.slice(1) : "");
}

const { learningItemsRepository, srsRepository, learningSessionsRepository } = createRepositories({
  supabase,
  fetchJson,
  getCurrentUser: () => state.currentUser,
  getLearningItemFilters,
  filterLearningItems,
  tomorrowIsoDate
});

async function loadLearningItems() {
  try {
    const data = await learningItemsRepository.getLearningItems();
    state.learningItems = data.items || [];
    renderLearningItemTable();
    setStatus("学習アイテムを読み込みました。");
  } catch (error) {
    setStatus(error.message || "学習アイテムの読み込みに失敗しました。");
  }
}

function renderLearningItemTable() {
  if (state.learningItems.length === 0) {
    elements.learningItemTableBody.innerHTML = `
      <tr>
        <td colspan="5">登録された学習アイテムはまだありません。</td>
      </tr>
    `;
    return;
  }

  elements.learningItemTableBody.innerHTML = state.learningItems
    .map(
      (item) => `
        <tr>
          <td>
            <strong>${escapeHtml(item.title || "")}</strong>
            ${item.meaning ? `<br /><span class="muted">${escapeHtml(item.meaning)}</span>` : ""}
          </td>
          <td>${escapeHtml(learningItemTypeLabel(item.type))}</td>
          <td>${escapeHtml(languageLabel(item.language))}</td>
          <td>${escapeHtml(formatTags(item.tags))}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="soft-button learning-item-view" data-id="${item.id}">編集</button>
              <button type="button" class="soft-button learning-item-delete" data-id="${item.id}">削除</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function fillLearningItemForm(item) {
  state.selectedLearningItemId = item.id;
  elements.learningItemId.value = item.id;
  elements.learningItemType.value = item.type || "vocabulary";
  elements.learningItemLanguage.value = item.language || "english";
  elements.learningItemTitle.value = item.title || "";
  elements.learningItemMeaning.value = item.meaning || "";
  elements.learningItemContent.value = item.content || "";
  elements.learningItemExample.value = item.example || "";
  elements.learningItemExampleTranslation.value = item.exampleTranslation || "";
  elements.learningItemNote.value = item.note || "";
  elements.learningItemTags.value = formatTags(item.tags);
}

function resetLearningItemForm() {
  state.selectedLearningItemId = "";
  elements.learningItemForm.reset();
  elements.learningItemId.value = "";
  elements.learningItemType.value = "vocabulary";
  elements.learningItemLanguage.value = "english";
  elements.learningItemTitle.focus();
}

function buildLearningItemPayload() {
  return {
    type: elements.learningItemType.value,
    language: elements.learningItemLanguage.value,
    title: elements.learningItemTitle.value.trim(),
    meaning: elements.learningItemMeaning.value.trim(),
    content: elements.learningItemContent.value.trim(),
    example: elements.learningItemExample.value.trim(),
    exampleTranslation: elements.learningItemExampleTranslation.value.trim(),
    note: elements.learningItemNote.value.trim(),
    tags: parseTags(elements.learningItemTags.value)
  };
}

async function createInitialSrsData(itemId) {
  await srsRepository.createInitialSrsData(itemId);
}

async function saveLearningItem(event) {
  event.preventDefault();

  const payload = buildLearningItemPayload();
  if (!payload.title) {
    setStatus("タイトルを入力してください。");
    return;
  }

  const id = elements.learningItemId.value;
  await withBusy(async () => {
    const data = id
      ? await learningItemsRepository.updateLearningItem(id, payload)
      : await learningItemsRepository.createLearningItem(payload);

    if (!id) {
      await createInitialSrsData(data.item.id);
    }

    await loadLearningItems();
    fillLearningItemForm(data.item);
    setStatus(id ? "学習アイテムを更新しました。" : "学習アイテムと初期SRSデータを登録しました。");
  }, id ? "学習アイテムを更新しています..." : "学習アイテムを登録しています...");
}

async function deleteLearningItem(id) {
  await withBusy(async () => {
    await learningItemsRepository.deleteLearningItem(id);
    resetLearningItemForm();
    await loadLearningItems();
    setStatus("学習アイテムを削除しました。");
  }, "学習アイテムを削除しています...");
}

function uniqueValues(values) {
  return [...new Set(values.filter(Boolean))];
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function formatTimer(seconds) {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const rest = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}

function renderCoursePresetList() {
  elements.coursePresetList.innerHTML = coursePresets
    .map(
      (course) => `
        <button type="button" class="home-card course-preset-button" data-course-id="${course.id}">
          <strong>${escapeHtml(course.name)}</strong>
          <span>${escapeHtml(course.description)}</span>
          <span>${escapeHtml(String(course.totalMinutes))}分 / ${escapeHtml(String(course.steps.length))}ステップ</span>
        </button>
      `
    )
    .join("");
}

function showCourseView(viewName) {
  elements.courseSelectView.classList.toggle("hidden", viewName !== "select");
  elements.courseConfirmView.classList.toggle("hidden", viewName !== "confirm");
  elements.courseTimerView.classList.toggle("hidden", viewName !== "timer");
  elements.courseCompleteView.classList.toggle("hidden", viewName !== "complete");
}

function selectCourse(courseId) {
  const course = coursePresets.find((entry) => entry.id === courseId);
  if (!course) {
    setStatus("コースが見つかりません。");
    return;
  }

  state.selectedCourse = course;
  elements.courseConfirmTitle.textContent = `${course.name}（${course.totalMinutes}分）`;
  elements.courseConfirmDescription.textContent = course.description;
  elements.courseConfirmSteps.innerHTML = course.steps
    .map(
      (step, index) => `
        <div class="course-step-row">
          <strong>${index + 1}</strong>
          <div>
            <strong>${escapeHtml(step.title)}</strong>
            <div class="muted">${escapeHtml(step.instructions)}</div>
          </div>
          <span>${escapeHtml(String(step.minutes))}分</span>
        </div>
      `
    )
    .join("");
  showCourseView("confirm");
}

function resetCourseToSelect() {
  stopCourseTimer();
  state.selectedCourse = null;
  state.courseRun = null;
  elements.courseSaveMessage.textContent = "";
  showCourseView("select");
}

function createCourseRun(course) {
  return {
    course,
    currentStepIndex: 0,
    remainingSeconds: course.steps[0].minutes * 60,
    elapsedSeconds: 0,
    isRunning: true,
    isComplete: false,
    saved: false,
    renderedStepIndex: -1,
    completedSteps: [],
    skippedSteps: [],
    reviewedItemIds: [],
    mistakeItemIds: [],
    dictationCount: 0,
    recordingCount: 0,
    writingText: "",
    note: "",
    startedAt: new Date().toISOString()
  };
}

function currentCourseStep() {
  return state.courseRun?.course.steps[state.courseRun.currentStepIndex] || null;
}

function startCourse() {
  if (!state.selectedCourse) {
    setStatus("開始するコースを選んでください。");
    return;
  }

  state.courseRun = createCourseRun(state.selectedCourse);
  showCourseView("timer");
  renderCourseTimer();
  startCourseTimer();
  setStatus(`${state.selectedCourse.name}を開始しました。`);
}

function startCourseTimer() {
  stopCourseTimer();
  state.courseTimerId = window.setInterval(() => {
    const run = state.courseRun;
    if (!run || !run.isRunning || run.isComplete) {
      return;
    }

    run.elapsedSeconds += 1;
    run.remainingSeconds -= 1;

    if (run.remainingSeconds <= 0) {
      completeCurrentCourseStep();
      advanceCourseStep();
      return;
    }

    renderCourseTimer();
  }, 1000);
}

function stopCourseTimer() {
  if (state.courseTimerId) {
    window.clearInterval(state.courseTimerId);
    state.courseTimerId = null;
  }
}

function markCourseStepDone(collectionName) {
  const step = currentCourseStep();
  if (!step || !state.courseRun) {
    return;
  }

  state.courseRun[collectionName] = uniqueValues([...state.courseRun[collectionName], step.id]);
}

function completeCurrentCourseStep() {
  markCourseStepDone("completedSteps");
  const step = currentCourseStep();
  if (step?.type === "dictation") {
    state.courseRun.dictationCount += 1;
  }
  if (step?.type === "recording") {
    state.courseRun.recordingCount += 1;
  }
  syncCourseTextInputs();
}

function syncCourseTextInputs() {
  if (!state.courseRun) {
    return;
  }

  const writingInput = document.querySelector("#course-writing-text");
  const noteInput = document.querySelector("#course-log-note");

  if (writingInput) {
    state.courseRun.writingText = writingInput.value;
  }

  if (noteInput) {
    state.courseRun.note = noteInput.value;
  }
}

function advanceCourseStep() {
  const run = state.courseRun;
  if (!run) {
    return;
  }

  if (run.currentStepIndex >= run.course.steps.length - 1) {
    finishCourse();
    return;
  }

  run.currentStepIndex += 1;
  run.remainingSeconds = run.course.steps[run.currentStepIndex].minutes * 60;
  run.isRunning = true;
  renderCourseTimer();
}

function goPreviousCourseStep() {
  const run = state.courseRun;
  if (!run || run.currentStepIndex === 0) {
    return;
  }

  syncCourseTextInputs();
  run.currentStepIndex -= 1;
  run.remainingSeconds = run.course.steps[run.currentStepIndex].minutes * 60;
  renderCourseTimer();
}

function skipCourseStep() {
  markCourseStepDone("skippedSteps");
  advanceCourseStep();
}

function finishCourse() {
  const run = state.courseRun;
  if (!run) {
    return;
  }

  syncCourseTextInputs();
  stopCourseTimer();
  run.isRunning = false;
  run.isComplete = true;
  showCourseView("complete");
  renderCourseSummary();
  setStatus("コースを終了しました。必要に応じて保存してください。");
}

function updateCourseFromSrsReview(entry, rating) {
  const run = state.courseRun;
  if (!run) {
    return;
  }

  run.reviewedItemIds = uniqueValues([...run.reviewedItemIds, entry.item.id]);
  if (rating === "hard" || rating === "forgot") {
    run.mistakeItemIds = uniqueValues([...run.mistakeItemIds, entry.item.id]);
  }
}

function renderCourseTimer() {
  const run = state.courseRun;
  const step = currentCourseStep();
  if (!run || !step) {
    return;
  }

  const nextStep = run.course.steps[run.currentStepIndex + 1];
  const stepTotalSeconds = step.minutes * 60;
  const elapsedInStep = Math.max(0, stepTotalSeconds - run.remainingSeconds);
  const progressPercent = Math.min(100, Math.round((elapsedInStep / stepTotalSeconds) * 100));

  elements.courseActiveName.textContent = run.course.name;
  elements.courseStepTitle.textContent = step.title;
  elements.courseStepMeta.textContent = `${run.currentStepIndex + 1} / ${run.course.steps.length} ・ ${learningItemTypeLabel(step.type)} ・ ${step.minutes}分`;
  elements.courseTimerDisplay.textContent = formatTimer(run.remainingSeconds);
  elements.courseProgressBar.style.width = `${progressPercent}%`;
  elements.courseStepInstructions.textContent = step.instructions;
  elements.courseNextStep.textContent = nextStep ? `次のステップ: ${nextStep.title}` : "次のステップ: コース終了";
  elements.coursePause.disabled = !run.isRunning;
  elements.courseResume.disabled = run.isRunning;
  if (run.renderedStepIndex !== run.currentStepIndex) {
    renderCourseStepUi(step);
  }
}

function renderCourseItemCard(item) {
  const sub = item.meaning || item.exampleTranslation || item.content || "";
  const example = item.example || "";
  return `
    <div class="course-item-card">
      <strong>${escapeHtml(item.title)}</strong>
      ${sub ? `<p class="muted">${escapeHtml(sub)}</p>` : ""}
      ${example ? `<p class="course-item-example">${escapeHtml(example)}</p>` : ""}
    </div>
  `;
}

function renderCourseStepUi(step) {
  const run = state.courseRun;
  const srsCount = state.reviewQueue.length;

  if (step.type === "srs") {
    elements.courseStepUi.innerHTML = `
      <div class="course-step-ui-grid">
        <p>既存の「今日のSRS復習」と同じ対象を使います。</p>
        <p>現在読み込み済みの復習対象数: ${escapeHtml(String(srsCount))}</p>
        <div class="mini-actions">
          <button type="button" class="soft-button" id="course-load-srs">復習対象数を更新</button>
          <button type="button" id="course-open-srs">今日のSRS復習を開く</button>
        </div>
      </div>
    `;
    run.renderedStepIndex = run.currentStepIndex;
    document.querySelector("#course-load-srs").addEventListener("click", async () => {
      await loadReviewItems();
      if (state.courseRun) {
        state.courseRun.renderedStepIndex = -1;
        renderCourseTimer();
      }
    });
    document.querySelector("#course-open-srs").addEventListener("click", () => switchPage("review"));
    return;
  }

  if (step.type === "dictation") {
    elements.courseStepUi.innerHTML = `
      <div class="course-step-ui-grid">
        <p>聞き取った内容を書き取ります。音声再生は今後接続します。</p>
        <textarea rows="5" placeholder="聞き取った内容を入力"></textarea>
      </div>
    `;
    run.renderedStepIndex = run.currentStepIndex;
    return;
  }

  if (step.type === "recording") {
    const candidates = state.learningItems
      .filter((item) => ["sentence", "listening", "grammar", "vocabulary"].includes(item.type))
      .slice(0, 5);
    elements.courseStepUi.innerHTML = `
      <div class="course-step-ui-grid">
        <p class="muted">本文や例文を声に出して読みます。</p>
        ${candidates.length
          ? candidates.map((item) => renderCourseItemCard(item)).join("")
          : "<p>登録済みの学習アイテムがありません。単語帳にアイテムを追加してください。</p>"}
      </div>
    `;
    run.renderedStepIndex = run.currentStepIndex;
    return;
  }

  if (step.type === "listening" || step.type === "shadowing") {
    const candidates = state.learningItems
      .filter((item) => ["listening", "sentence"].includes(item.type))
      .slice(0, 5);
    elements.courseStepUi.innerHTML = `
      <div class="course-step-ui-grid">
        <p class="muted">${step.type === "shadowing" ? "以下の文を聞きながら同時に声に出すシャドーイング練習です。" : "以下の文を使ってリスニング練習をしましょう。"}</p>
        ${candidates.length
          ? candidates.map((item) => renderCourseItemCard(item)).join("")
          : "<p>listening・sentence タイプの学習アイテムがありません。単語帳に追加してください。</p>"}
      </div>
    `;
    run.renderedStepIndex = run.currentStepIndex;
    return;
  }

  if (step.type === "reading" || step.type === "grammar") {
    const candidates = state.learningItems
      .filter((item) => ["grammar", "sentence", "listening"].includes(item.type))
      .slice(0, 5);
    elements.courseStepUi.innerHTML = candidates.length
      ? `<div class="course-step-ui-grid">${candidates.map((item) => renderCourseItemCard(item)).join("")}</div>`
      : "<p>grammar・sentence・listening タイプの学習アイテムがありません。単語帳に追加してください。</p>";
    run.renderedStepIndex = run.currentStepIndex;
    return;
  }

  if (step.type === "writing") {
    elements.courseStepUi.innerHTML = `
      <label>
        短い作文・要約
        <textarea id="course-writing-text" rows="6">${escapeHtml(run.writingText)}</textarea>
      </label>
    `;
    run.renderedStepIndex = run.currentStepIndex;
    document.querySelector("#course-writing-text").addEventListener("input", syncCourseTextInputs);
    return;
  }

  elements.courseStepUi.innerHTML = `
    <label>
      今日のメモ
      <textarea id="course-log-note" rows="6">${escapeHtml(run.note)}</textarea>
    </label>
  `;
  run.renderedStepIndex = run.currentStepIndex;
  document.querySelector("#course-log-note").addEventListener("input", syncCourseTextInputs);
}

function courseSessionPayload() {
  const run = state.courseRun;
  return {
    date: todayDateString(),
    courseId: run.course.id,
    courseName: run.course.name,
    plannedMinutes: run.course.totalMinutes,
    actualMinutes: Math.max(1, Math.ceil(run.elapsedSeconds / 60)),
    completedSteps: uniqueValues(run.completedSteps),
    skippedSteps: uniqueValues(run.skippedSteps),
    reviewedItemIds: uniqueValues([...run.reviewedItemIds, ...state.reviewedItems.map((entry) => entry.item.id)]),
    mistakeItemIds: uniqueValues([...run.mistakeItemIds, ...state.difficultReviewItems.map((entry) => entry.item.id)]),
    dictationCount: run.dictationCount,
    recordingCount: run.recordingCount,
    writingText: run.writingText,
    feedbackText: "",
    note: run.note
  };
}

function renderCourseSummary() {
  if (!state.courseRun) {
    return;
  }

  const payload = courseSessionPayload();
  elements.courseSummary.innerHTML = `
    <div class="course-summary-grid">
      <div class="course-summary-item"><span>コース</span><strong>${escapeHtml(payload.courseName)}</strong></div>
      <div class="course-summary-item"><span>予定時間</span><strong>${escapeHtml(String(payload.plannedMinutes))}分</strong></div>
      <div class="course-summary-item"><span>実際の時間</span><strong>${escapeHtml(String(payload.actualMinutes))}分</strong></div>
      <div class="course-summary-item"><span>完了ステップ</span><strong>${escapeHtml(String(payload.completedSteps.length))}</strong></div>
      <div class="course-summary-item"><span>復習項目</span><strong>${escapeHtml(String(payload.reviewedItemIds.length))}</strong></div>
      <div class="course-summary-item"><span>難しい/忘れた</span><strong>${escapeHtml(String(payload.mistakeItemIds.length))}</strong></div>
    </div>
    <article class="section-card"><h4>スキップしたステップ</h4><p>${escapeHtml(payload.skippedSteps.join(", ") || "なし")}</p></article>
    <article class="section-card"><h4>作文内容</h4><p>${escapeHtml(payload.writingText || "未入力")}</p></article>
    <article class="section-card"><h4>今日のメモ</h4><p>${escapeHtml(payload.note || "未入力")}</p></article>
  `;
}

async function saveCourseSession() {
  if (!state.courseRun) {
    setStatus("保存するコース結果がありません。");
    return;
  }

  await withBusy(async () => {
    const data = await learningSessionsRepository.createLearningSession(courseSessionPayload());
    state.courseRun.saved = true;
    elements.courseSaveMessage.textContent = `LearningSessionを保存しました。ID: ${data.item.id}`;
    elements.courseSaveMessage.classList.remove("auth-message--error");
    setStatus("LearningSessionを保存しました。");
  }, "LearningSessionを保存しています...");
}

function notebookQueryParams() {
  const params = new URLSearchParams();
  if (elements.notebookLanguageFilter.value) {
    params.set("language", elements.notebookLanguageFilter.value);
  }
  if (elements.notebookStatusFilter.value) {
    params.set("status", elements.notebookStatusFilter.value);
  }
  if (elements.notebookQuery.value.trim()) {
    params.set("query", elements.notebookQuery.value.trim());
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function loadNotebook() {
  try {
    const data = await fetchJson(`/api/vocabulary${notebookQueryParams()}`);
    state.notebookItems = data.items || [];
    renderNotebookTable();
    setStatus("単語帳を読み込みました。");
  } catch (error) {
    setStatus(error.message || "単語帳の読み込みに失敗しました。");
  }
}

function renderNotebookTable() {
  if (state.notebookItems.length === 0) {
    elements.notebookTableBody.innerHTML = `
      <tr>
        <td colspan="5">単語帳に登録された単語はまだありません。</td>
      </tr>
    `;
    return;
  }

  elements.notebookTableBody.innerHTML = state.notebookItems
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.term)}${item.pinyin ? `<br /><span class="muted">${escapeHtml(item.pinyin)}</span>` : ""}</td>
          <td>${escapeHtml(languageLabel(item.language))}</td>
          <td>${escapeHtml(item.meaning || "")}</td>
          <td>${escapeHtml(item.masteryStatus || "")}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="soft-button notebook-view" data-id="${item.id}">詳細表示</button>
              <button type="button" class="soft-button notebook-status" data-id="${item.id}" data-status="習得済み">習得済み</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function fillNotebookDetail(item) {
  state.selectedNotebookId = item.id;
  elements.notebookDetailId.value = item.id;
  elements.notebookDetailTerm.value = item.term || "";
  elements.notebookDetailLanguage.value = item.language || "english";
  elements.notebookDetailPinyin.value = item.pinyin || "";
  elements.notebookDetailPos.value = item.partOfSpeech || "";
  elements.notebookDetailStatus.value = item.masteryStatus || "未学習";
  elements.notebookDetailMeaning.value = item.meaning || "";
  elements.notebookDetailExample.value = item.example || "";
  elements.notebookDetailExampleTranslation.value = item.exampleTranslation || "";
  elements.notebookDetailNote.value = item.note || "";
}

function resetNotebookForm() {
  state.selectedNotebookId = "";
  elements.notebookDetailForm.reset();
  elements.notebookDetailId.value = "";
  elements.notebookDetailLanguage.value = "english";
  elements.notebookDetailStatus.value = "未学習";
  elements.notebookDetailTerm.focus();
}

function buildNotebookPayload() {
  return {
    term: elements.notebookDetailTerm.value.trim(),
    language: elements.notebookDetailLanguage.value,
    pinyin: elements.notebookDetailPinyin.value.trim(),
    partOfSpeech: elements.notebookDetailPos.value.trim(),
    masteryStatus: elements.notebookDetailStatus.value,
    meaning: elements.notebookDetailMeaning.value.trim(),
    example: elements.notebookDetailExample.value.trim(),
    exampleTranslation: elements.notebookDetailExampleTranslation.value.trim(),
    note: elements.notebookDetailNote.value.trim()
  };
}

async function saveNotebookItem(event) {
  event.preventDefault();

  const payload = buildNotebookPayload();
  if (!payload.term) {
    setStatus("単語を入力してください。");
    return;
  }

  const id = elements.notebookDetailId.value;
  await withBusy(async () => {
    const data = await fetchJson(id ? `/api/vocabulary/${id}` : "/api/vocabulary", {
      method: id ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const savedItem = id ? data.item : data.items?.[0];
    await loadNotebook();
    if (savedItem) {
      fillNotebookDetail(savedItem);
    }
    setStatus(id ? "単語帳を更新しました。" : "単語帳に登録しました。");
  }, id ? "単語帳を更新しています..." : "単語帳に登録しています...");
}

async function updateNotebookItem(id, patch) {
  await withBusy(async () => {
    await fetchJson(`/api/vocabulary/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(patch)
    });
    await loadNotebook();
    setStatus("単語帳を更新しました。");
  }, "単語帳を更新しています...");
}

async function deleteNotebookItem(id) {
  await withBusy(async () => {
    await fetchJson(`/api/vocabulary/${id}`, {
      method: "DELETE"
    });
    resetNotebookForm();
    await loadNotebook();
    setStatus("単語を削除しました。");
  }, "単語を削除しています...");
}

async function loadHistory() {
  try {
    const data = await fetchJson("/api/history");
    state.historyItems = data.items || [];
    renderHistoryTable();
    setStatus("学習履歴を読み込みました。");
  } catch (error) {
    setStatus(error.message || "履歴の読み込みに失敗しました。");
  }
}

function renderHistoryTable() {
  if (state.historyItems.length === 0) {
    elements.historyTableBody.innerHTML = `
      <tr>
        <td colspan="5">まだ保存された履歴はありません。</td>
      </tr>
    `;
    return;
  }

  elements.historyTableBody.innerHTML = state.historyItems
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(formatDate(item.createdAt))}</td>
          <td>${escapeHtml(languageLabel(item.language))}</td>
          <td>${escapeHtml(modeLabel(item.mode))}</td>
          <td>${escapeHtml(item.title || "")}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="soft-button history-view" data-id="${item.id}">詳細表示</button>
              <button type="button" class="soft-button history-delete" data-id="${item.id}">削除</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderHistoryDetail(item) {
  elements.historyDetail.className = "result-area";
  elements.historyDetail.innerHTML = `
    <div class="rendered-result">
      <h3>${escapeHtml(item.title || "学習履歴")}</h3>
      <div class="summary-box">${escapeHtml(languageLabel(item.language))} / ${escapeHtml(modeLabel(item.mode))} / ${escapeHtml(formatDate(item.createdAt))}</div>
      <article class="section-card">
        <h4>入力文</h4>
        <p>${escapeHtml(item.inputText || "")}</p>
      </article>
      <article class="section-card">
        <h4>保存メモ</h4>
        <p>${escapeHtml(item.memo || "メモなし")}</p>
      </article>
    </div>
  `;
}

function clearHistoryDetail() {
  elements.historyDetail.className = "result-area empty-state";
  elements.historyDetail.innerHTML = "<p>履歴を選ぶと詳細が表示されます。</p>";
}

async function showHistoryDetail(id) {
  try {
    const data = await fetchJson(`/api/history/${id}`);
    state.selectedHistoryId = id;
    renderHistoryDetail(data.item);
  } catch (error) {
    setStatus(error.message || "履歴詳細の読み込みに失敗しました。");
  }
}

async function deleteHistory(id) {
  await withBusy(async () => {
    await fetchJson(`/api/history/${id}`, {
      method: "DELETE"
    });
    if (state.selectedHistoryId === id) {
      state.selectedHistoryId = "";
      clearHistoryDetail();
    }
    await loadHistory();
    setStatus("履歴を削除しました。");
  }, "履歴を削除しています...");
}

function currentReviewEntry() {
  return state.reviewQueue[state.reviewIndex] || null;
}

function reviewPromptForItem(item) {
  if (item.type === "vocabulary") {
    return {
      prompt: item.title || "",
      inputLabel: "意味を入力してください"
    };
  }

  if (item.type === "grammar") {
    return {
      prompt: item.title || "",
      inputLabel: "文法の意味・使い方を入力してください"
    };
  }

  if (item.type === "sentence") {
    return {
      prompt: item.meaning || item.exampleTranslation || item.title || "",
      inputLabel: "対応する文を入力してください"
    };
  }

  return {
    prompt: item.content || item.example || "音声を聞いて内容を入力してください",
    inputLabel: "聞き取った内容、または意味を入力してください"
  };
}

function reviewAnswerRows(item) {
  if (item.type === "vocabulary") {
    return [
      ["意味", item.meaning],
      ["例文", item.example],
      ["例文訳", item.exampleTranslation],
      ["メモ", item.note],
      ["タグ", formatTags(item.tags)]
    ];
  }

  if (item.type === "grammar") {
    return [
      ["内容", item.content],
      ["例文", item.example],
      ["例文訳", item.exampleTranslation],
      ["メモ", item.note],
      ["タグ", formatTags(item.tags)]
    ];
  }

  return [
    ["内容", item.content],
    ["例文", item.example],
    ["例文訳", item.exampleTranslation],
    ["メモ", item.note]
  ];
}

function renderReviewCounts() {
  const total = state.reviewQueue.length;
  elements.reviewTotalCount.textContent = String(total);
  elements.reviewCurrentCount.textContent = total ? `${Math.min(state.reviewIndex + 1, total)} / ${total}` : "0 / 0";
}

function setReviewControlsVisible(hasItem) {
  elements.reviewAnswerField.classList.toggle("hidden", !hasItem);
  elements.revealReviewAnswer.disabled = !hasItem || state.reviewRevealed;
  [elements.reviewEasy, elements.reviewNormal, elements.reviewHard, elements.reviewForgot].forEach((button) => {
    button.disabled = !hasItem || !state.reviewRevealed;
  });
}

function renderReviewAnswer(item) {
  const rows = reviewAnswerRows(item)
    .filter(([, value]) => value)
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`)
    .join("");

  elements.reviewAnswerArea.innerHTML = rows ? `<dl>${rows}</dl>` : "<p>表示できる答えがありません。</p>";
  elements.reviewAnswerArea.classList.toggle("hidden", !state.reviewRevealed);
}

function renderReviewComplete() {
  const difficultItems = state.difficultReviewItems;
  elements.reviewCard.className = "flashcard empty-state";
  elements.reviewCard.innerHTML = "<p>今日のSRS復習は完了しました。</p>";
  elements.reviewAnswerField.classList.add("hidden");
  elements.reviewAnswerArea.classList.add("hidden");
  elements.reviewAnswerArea.innerHTML = "";
  setReviewControlsVisible(false);

  elements.reviewComplete.classList.remove("hidden");
  elements.reviewComplete.innerHTML = `
    <h3>復習完了</h3>
    <p>今回復習した項目数: ${escapeHtml(String(state.reviewedItems.length))}</p>
    ${
      difficultItems.length
        ? `<h4>難しい / 忘れた項目</h4><ul class="mistake-list">${difficultItems
            .map((entry) => `<li>${escapeHtml(entry.item.title || "")}（${escapeHtml(learningItemTypeLabel(entry.item.type))}）</li>`)
            .join("")}</ul>`
        : "<p>難しい項目はありませんでした。</p>"
    }
  `;
  setStatus("今日のSRS復習が完了しました。");
}

function renderReviewCard() {
  renderReviewCounts();
  const entry = currentReviewEntry();

  if (!entry) {
    elements.reviewComplete.classList.add("hidden");
    elements.reviewAnswerField.classList.add("hidden");
    elements.reviewAnswerArea.classList.add("hidden");
    elements.reviewCard.className = "flashcard empty-state";
    elements.reviewCard.innerHTML = "<p>今日の復習対象はありません。</p>";
    setReviewControlsVisible(false);
    return;
  }

  const { item, srsData } = entry;
  const prompt = reviewPromptForItem(item);
  elements.reviewComplete.classList.add("hidden");
  elements.reviewInputLabel.textContent = prompt.inputLabel;
  elements.reviewAnswerInput.value = "";
  elements.reviewCard.className = "flashcard";
  elements.reviewCard.innerHTML = `
    <div class="term">${escapeHtml(prompt.prompt)}</div>
    <p class="meta">${escapeHtml(learningItemTypeLabel(item.type))} / ${escapeHtml(languageLabel(item.language))} / 復習回数 ${escapeHtml(String(srsData.reviewCount || 0))}</p>
    <p class="meta">復習予定日: ${escapeHtml(srsData.nextReviewDate || "")}</p>
  `;
  renderReviewAnswer(item);
  setReviewControlsVisible(true);
}

async function loadReviewItems() {
  await withBusy(async () => {
    const data = await srsRepository.getDueReviewItems();
    state.reviewQueue = data.items || [];
    state.reviewIndex = 0;
    state.reviewRevealed = false;
    state.reviewedItems = [];
    state.difficultReviewItems = [];
    renderReviewCard();
    setStatus(state.reviewQueue.length ? "今日のSRS復習対象を読み込みました。" : "今日の復習対象はありません。");
  }, "今日のSRS復習対象を読み込んでいます...");
}

function revealReviewAnswer() {
  const entry = currentReviewEntry();
  if (!entry) {
    setStatus("今日の復習対象はありません。");
    return;
  }

  state.reviewRevealed = true;
  renderReviewAnswer(entry.item);
  setReviewControlsVisible(true);
  setStatus("答えを表示しました。自己評価を選んでください。");
}

async function submitReview(rating) {
  const entry = currentReviewEntry();
  if (!entry) {
    setStatus("今日の復習対象はありません。");
    return;
  }

  if (!state.reviewRevealed) {
    setStatus("先に答えを表示してください。");
    return;
  }

  await withBusy(async () => {
    await srsRepository.updateSrsAfterReview(entry.item.id, rating);
    state.reviewedItems.push(entry);
    updateCourseFromSrsReview(entry, rating);
    if (rating === "hard" || rating === "forgot") {
      state.difficultReviewItems.push(entry);
    }

    state.reviewIndex += 1;
    state.reviewRevealed = false;

    if (state.reviewIndex >= state.reviewQueue.length) {
      renderReviewCounts();
      renderReviewComplete();
      return;
    }

    renderReviewCard();
    setStatus("SRS復習結果を保存しました。");
  }, "SRS復習結果を保存しています...");
}

elements.navButtons.forEach((button) => {
  button.addEventListener("click", () => switchPage(button.dataset.page));
});

elements.homeButtons.forEach((button) => {
  button.addEventListener("click", () => switchPage(button.dataset.go));
});

elements.learningItemSearch.addEventListener("click", loadLearningItems);
elements.learningItemForm.addEventListener("submit", saveLearningItem);
elements.newLearningItem.addEventListener("click", resetLearningItemForm);
elements.deleteLearningItem.addEventListener("click", async () => {
  const id = elements.learningItemId.value;
  if (!id) {
    setStatus("削除する学習アイテムを一覧から選んでください。");
    return;
  }

  await deleteLearningItem(id);
});

elements.learningItemTableBody.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("learning-item-view")) {
    const item = state.learningItems.find((entry) => entry.id === target.dataset.id);
    if (item) {
      fillLearningItemForm(item);
    }
  }

  if (target.classList.contains("learning-item-delete")) {
    await deleteLearningItem(target.dataset.id);
  }
});

elements.coursePresetList.addEventListener("click", (event) => {
  const button = event.target.closest(".course-preset-button");
  if (button) {
    selectCourse(button.dataset.courseId);
  }
});

elements.courseConfirmBack.addEventListener("click", resetCourseToSelect);
elements.courseStart.addEventListener("click", startCourse);
elements.coursePause.addEventListener("click", () => {
  if (state.courseRun) {
    state.courseRun.isRunning = false;
    renderCourseTimer();
  }
});
elements.courseResume.addEventListener("click", () => {
  if (state.courseRun) {
    state.courseRun.isRunning = true;
    renderCourseTimer();
    startCourseTimer();
  }
});
elements.coursePrev.addEventListener("click", goPreviousCourseStep);
elements.courseNext.addEventListener("click", () => {
  completeCurrentCourseStep();
  advanceCourseStep();
});
elements.courseExtend.addEventListener("click", () => {
  if (state.courseRun) {
    state.courseRun.remainingSeconds += 180;
    renderCourseTimer();
  }
});
elements.courseSkip.addEventListener("click", skipCourseStep);
elements.courseEnd.addEventListener("click", finishCourse);
elements.courseSave.addEventListener("click", saveCourseSession);
elements.courseHome.addEventListener("click", () => {
  resetCourseToSelect();
  switchPage("home");
});

elements.notebookSearch.addEventListener("click", loadNotebook);
elements.notebookDetailForm.addEventListener("submit", saveNotebookItem);
elements.newNotebookItem.addEventListener("click", resetNotebookForm);
elements.deleteNotebookItem.addEventListener("click", async () => {
  const id = elements.notebookDetailId.value;
  if (!id) {
    setStatus("削除する単語を一覧から選んでください。");
    return;
  }

  await deleteNotebookItem(id);
});

elements.notebookTableBody.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("notebook-view")) {
    const item = state.notebookItems.find((entry) => entry.id === target.dataset.id);
    if (item) {
      fillNotebookDetail(item);
    }
  }

  if (target.classList.contains("notebook-status")) {
    await updateNotebookItem(target.dataset.id, {
      masteryStatus: target.dataset.status
    });
  }
});

elements.refreshHistory.addEventListener("click", loadHistory);
elements.historyTableBody.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("history-view")) {
    await showHistoryDetail(target.dataset.id);
  }

  if (target.classList.contains("history-delete")) {
    await deleteHistory(target.dataset.id);
  }
});

elements.loadReviewCard.addEventListener("click", loadReviewItems);
elements.revealReviewAnswer.addEventListener("click", revealReviewAnswer);
elements.reviewEasy.addEventListener("click", async () => {
  await submitReview("easy");
});
elements.reviewNormal.addEventListener("click", async () => {
  await submitReview("normal");
});
elements.reviewHard.addEventListener("click", async () => {
  await submitReview("hard");
});
elements.reviewForgot.addEventListener("click", async () => {
  await submitReview("forgot");
});

window.addEventListener("beforeunload", (event) => {
  if (state.courseRun && !state.courseRun.isComplete && !state.courseRun.saved) {
    event.preventDefault();
    event.returnValue = "";
  }
});

clearHistoryDetail();
renderReviewCard();
renderCoursePresetList();
setStatus("準備完了");
initAuth();
