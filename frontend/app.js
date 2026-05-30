const state = {
  currentPage: "home",
  isBusy: false,
  historyItems: [],
  notebookItems: [],
  selectedHistoryId: "",
  selectedNotebookId: "",
  reviewItem: null,
  reviewRevealed: false
};

const elements = {
  statusText: document.querySelector("#status-text"),
  navButtons: document.querySelectorAll(".nav-button"),
  pages: document.querySelectorAll(".page"),
  homeButtons: document.querySelectorAll("[data-go]"),
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
  return language === "chinese" ? "中国語" : language === "english" ? "英語" : language;
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

  if (pageId === "notebook") {
    loadNotebook();
  }
}

async function fetchJson(url, options = {}) {
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
