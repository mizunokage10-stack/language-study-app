const state = {
  currentPage: "home",
  isBusy: false,
  learningItems: [],
  historyItems: [],
  notebookItems: [],
  selectedLearningItemId: "",
  selectedHistoryId: "",
  selectedNotebookId: "",
  reviewItem: null,
  reviewRevealed: false
};

const localStoreKeys = {
  learningItems: "language-study.learningItems",
  srsData: "language-study.srsData",
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
  reviewLanguage: document.querySelector("#review-language"),
  reviewCard: document.querySelector("#review-card"),
  loadReviewCard: document.querySelector("#load-review-card"),
  revealReviewAnswer: document.querySelector("#reveal-review-answer"),
  reviewKnown: document.querySelector("#review-known"),
  reviewUnsure: document.querySelector("#review-unsure"),
  reviewNext: document.querySelector("#review-next")
};

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
    writing: "作文"
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

  if (path.startsWith("/api/srs/")) {
    const itemId = decodeURIComponent(path.split("/").pop());
    const items = readLocalCollection(localStoreKeys.srsData);
    const index = items.findIndex((item) => item.itemId === itemId);

    if (method === "GET") {
      return localJsonResponse({ item: index === -1 ? null : items[index] });
    }

    if (method === "DELETE" && index !== -1) {
      items.splice(index, 1);
      writeLocalCollection(localStoreKeys.srsData, items);
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

async function loadLearningItems() {
  try {
    const data = await fetchJson(`/api/learning-items${learningItemQueryParams()}`);
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
  await fetchJson("/api/srs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      itemId,
      nextReviewDate: tomorrowIsoDate(),
      interval: 1,
      easeFactor: 2.5,
      reviewCount: 0,
      mistakeCount: 0,
      lastReviewedAt: "",
      masteryLevel: 0
    })
  });
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
    const data = await fetchJson(id ? `/api/learning-items/${id}` : "/api/learning-items", {
      method: id ? "PATCH" : "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

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
    await fetchJson(`/api/learning-items/${id}`, {
      method: "DELETE"
    });
    resetLearningItemForm();
    await loadLearningItems();
    setStatus("学習アイテムを削除しました。");
  }, "学習アイテムを削除しています...");
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

function renderReviewCard() {
  const item = state.reviewItem;

  if (!item) {
    elements.reviewCard.className = "flashcard empty-state";
    elements.reviewCard.innerHTML = "<p>復習対象の単語が見つかりません。単語帳に語彙を追加してください。</p>";
    return;
  }

  elements.reviewCard.className = "flashcard";
  elements.reviewCard.innerHTML = `
    <div class="term">${escapeHtml(item.term || "")}</div>
    <p class="meta">${escapeHtml(languageLabel(item.language))} / ${escapeHtml(item.partOfSpeech || "")} / 復習回数 ${escapeHtml(String(item.reviewCount || 0))}</p>
    ${item.pinyin ? `<p class="meta">${escapeHtml(item.pinyin)}</p>` : ""}
    <div class="answer ${state.reviewRevealed ? "" : "hidden"}">
      <p><strong>意味:</strong> ${escapeHtml(item.meaning || "")}</p>
      <p><strong>例文:</strong> ${escapeHtml(item.example || "")}</p>
      <p><strong>例文訳:</strong> ${escapeHtml(item.exampleTranslation || "")}</p>
      <p><strong>現在のステータス:</strong> ${escapeHtml(item.masteryStatus || "")}</p>
    </div>
  `;
}

async function loadReviewCard() {
  try {
    const query = elements.reviewLanguage.value
      ? `?language=${encodeURIComponent(elements.reviewLanguage.value)}`
      : "";
    const data = await fetchJson(`/api/review/random${query}`);
    state.reviewItem = data.item;
    state.reviewRevealed = false;
    renderReviewCard();
    setStatus(data.item ? "復習カードを読み込みました。" : "復習対象の単語がありません。");
  } catch (error) {
    setStatus(error.message || "復習カードの読み込みに失敗しました。");
  }
}

async function submitReview(outcome) {
  if (!state.reviewItem) {
    setStatus("先に復習カードを読み込んでください。");
    return;
  }

  await withBusy(async () => {
    const data = await fetchJson(`/api/review/${state.reviewItem.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ outcome })
    });

    state.reviewItem = data.item;
    state.reviewRevealed = true;
    renderReviewCard();
    setStatus("復習結果を更新しました。");
  }, "復習結果を保存しています...");
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

elements.loadReviewCard.addEventListener("click", loadReviewCard);
elements.revealReviewAnswer.addEventListener("click", () => {
  state.reviewRevealed = true;
  renderReviewCard();
});
elements.reviewKnown.addEventListener("click", async () => {
  await submitReview("known");
});
elements.reviewUnsure.addEventListener("click", async () => {
  await submitReview("unsure");
});
elements.reviewNext.addEventListener("click", loadReviewCard);

clearHistoryDetail();
renderReviewCard();
setStatus("準備完了");
