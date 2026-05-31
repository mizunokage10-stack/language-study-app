import { supabase } from "./supabase-client.js";
import { createRepositories } from "./repositories.js";

const state = {
  currentPage: "home",
  currentUser: null,
  authReady: !supabase,
  isBusy: false,
  learningItems: [],
  historyItems: [],
  learningSessions: [],
  studyLogs: [],
  notebookItems: [],
  selectedLearningItemId: "",
  selectedHistoryId: "",
  selectedSessionId: "",
  selectedStudyLogId: "",
  selectedNotebookId: "",
  reviewQueue: [],
  reviewIndex: 0,
  reviewRevealed: false,
  reviewedItems: [],
  difficultReviewItems: [],
  selectedCourse: null,
  courseRun: null,
  courseTimerId: null,
  ttsVoices: [],
  ttsRequestId: 0,
  dictationSession: null,
  recordingSession: null,
  mediaRecorder: null,
  recordingStream: null,
  recordingChunks: []
};

const localStoreKeys = {
  learningItems: "language-study.learningItems",
  srsData: "language-study.srsData",
  learningSessions: "language-study.learningSessions",
  studyLogs: "language-study.studyLogs",
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
  speakLearningItem: document.querySelector("#speak-learning-item"),
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
  historyTodayMinutes: document.querySelector("#history-today-minutes"),
  historyWeekMinutes: document.querySelector("#history-week-minutes"),
  historyStreakDays: document.querySelector("#history-streak-days"),
  historyLatestSession: document.querySelector("#history-latest-session"),
  historyLatestLog: document.querySelector("#history-latest-log"),
  sessionHistoryTableBody: document.querySelector("#session-history-table-body"),
  studyLogTableBody: document.querySelector("#study-log-table-body"),
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
  ttsSupportMessage: document.querySelector("#tts-support-message"),
  ttsText: document.querySelector("#tts-text"),
  ttsLanguage: document.querySelector("#tts-language"),
  ttsVoice: document.querySelector("#tts-voice"),
  ttsRate: document.querySelector("#tts-rate"),
  ttsRateValue: document.querySelector("#tts-rate-value"),
  ttsPitch: document.querySelector("#tts-pitch"),
  ttsPitchValue: document.querySelector("#tts-pitch-value"),
  ttsPlay: document.querySelector("#tts-play"),
  ttsStop: document.querySelector("#tts-stop"),
  ttsPause: document.querySelector("#tts-pause"),
  ttsResume: document.querySelector("#tts-resume"),
  dictationPractice: document.querySelector("#dictation-practice"),
  recordingPractice: document.querySelector("#recording-practice"),
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
    if (state.currentPage === "history") {
      loadHistory();
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

function supportsSpeechSynthesis() {
  return "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
}

function languageToSpeechLang(language) {
  const normalized = String(language || "").toLowerCase();
  if (normalized.startsWith("en") || normalized === "english") {
    return "en-US";
  }
  if (normalized.startsWith("zh") || normalized === "chinese") {
    return "zh-CN";
  }
  if (normalized.startsWith("ja") || normalized === "japanese") {
    return "ja-JP";
  }
  return "";
}

function learningItemSpeechText(item) {
  return [item?.content, item?.example, item?.title].find((value) => String(value || "").trim()) || "";
}

function setTtsMessage(message, isError = false) {
  if (!elements.ttsSupportMessage) {
    return;
  }

  elements.ttsSupportMessage.textContent = message;
  elements.ttsSupportMessage.classList.toggle("auth-message--error", isError);
}

function voiceLanguageScore(voice, language) {
  if (!language) {
    return voice.default ? 0 : 1;
  }

  const voiceLang = String(voice.lang || "").toLowerCase();
  const requested = language.toLowerCase();
  const base = requested.split("-")[0];

  if (voiceLang === requested) {
    return 0;
  }
  if (voiceLang.startsWith(base)) {
    return 1;
  }
  if (voice.default) {
    return 2;
  }
  return 3;
}

function renderTtsVoiceOptions() {
  if (!elements.ttsVoice) {
    return;
  }

  const selectedLanguage = elements.ttsLanguage.value;
  const currentVoice = elements.ttsVoice.value;
  const voices = [...state.ttsVoices].sort((a, b) => {
    const scoreDiff = voiceLanguageScore(a, selectedLanguage) - voiceLanguageScore(b, selectedLanguage);
    return scoreDiff || a.name.localeCompare(b.name);
  });

  elements.ttsVoice.innerHTML = `
    <option value="">ブラウザの自動選択</option>
    ${voices
      .map(
        (voice) =>
          `<option value="${escapeHtml(voice.voiceURI)}">${escapeHtml(voice.name)} (${escapeHtml(voice.lang || "unknown")})${voice.default ? " / default" : ""}</option>`
      )
      .join("")}
  `;

  if (voices.some((voice) => voice.voiceURI === currentVoice)) {
    elements.ttsVoice.value = currentVoice;
  }

  if (!voices.length) {
    setTtsMessage("利用可能な音声をまだ取得できていません。ブラウザが読み込み次第、一覧を更新します。");
  } else {
    setTtsMessage("読み上げの準備ができています。");
  }
}

function loadTtsVoices() {
  if (!supportsSpeechSynthesis()) {
    setTtsMessage("このブラウザは音声読み上げに対応していません。", true);
    return;
  }

  state.ttsVoices = window.speechSynthesis.getVoices() || [];
  renderTtsVoiceOptions();
}

function selectedTtsVoice() {
  return state.ttsVoices.find((voice) => voice.voiceURI === elements.ttsVoice.value) || null;
}

function updateTtsSliderLabels() {
  elements.ttsRateValue.textContent = Number(elements.ttsRate.value).toFixed(2);
  elements.ttsPitchValue.textContent = Number(elements.ttsPitch.value).toFixed(2);
}

function setTtsText(text, language = "") {
  elements.ttsText.value = text || "";
  elements.ttsLanguage.value = languageToSpeechLang(language);
  renderTtsVoiceOptions();
}

function speakText(text, options = {}) {
  if (!supportsSpeechSynthesis()) {
    setTtsMessage("このブラウザは音声読み上げに対応していません。", true);
    setStatus("このブラウザは音声読み上げに対応していません。");
    return false;
  }

  const value = String(text || elements.ttsText.value || "").trim();
  if (!value) {
    setTtsMessage("読み上げるテキストを入力してください。", true);
    setStatus("読み上げるテキストを入力してください。");
    return false;
  }

  state.ttsRequestId += 1;
  const requestId = state.ttsRequestId;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(value);
  const language = options.language || elements.ttsLanguage.value;
  const voice = options.voice || selectedTtsVoice();

  if (language) {
    utterance.lang = language;
  }
  if (voice) {
    utterance.voice = voice;
  }

  utterance.rate = Number(options.rate ?? elements.ttsRate.value ?? 1);
  utterance.pitch = Number(options.pitch ?? elements.ttsPitch.value ?? 1);
  utterance.onend = () => {
    if (requestId !== state.ttsRequestId) {
      return;
    }
    setTtsMessage("読み上げが完了しました。");
    setStatus("読み上げが完了しました。");
  };
  utterance.onerror = (event) => {
    if (requestId !== state.ttsRequestId || ["canceled", "interrupted"].includes(event.error)) {
      return;
    }
    setTtsMessage("読み上げ中にエラーが発生しました。別の音声を選んで試してください。", true);
    setStatus("読み上げ中にエラーが発生しました。");
  };

  window.speechSynthesis.speak(utterance);
  setTtsMessage("読み上げ中です。");
  setStatus("読み上げ中です。");
  return true;
}

function speakLearningItem(item, options = {}) {
  const text = learningItemSpeechText(item);
  const language = languageToSpeechLang(item?.language);
  setTtsText(text, language);
  return speakText(text, { language, ...options });
}

function dictationAnswerText(item) {
  return [item?.content, item?.example].find((value) => String(value || "").trim()) || "";
}

function dictationTargets(items = state.learningItems) {
  return items.filter((item) => ["sentence", "listening"].includes(item.type) && dictationAnswerText(item));
}

function tokenizeDictationText(text, language) {
  const value = String(text || "").trim();
  if (!value) {
    return [];
  }

  if (language === "chinese" || language === "japanese") {
    return Array.from(value.replace(/\s+/g, ""));
  }

  return value.split(/\s+/).filter(Boolean);
}

function normalizeDictationToken(token) {
  return String(token || "")
    .toLowerCase()
    .replace(/^[.,!?;:'"()［\]{}]+|[.,!?;:'"()［\]{}]+$/g, "");
}

function compareDictationAnswer(correctText, userText, language) {
  const correctTokens = tokenizeDictationText(correctText, language);
  const userTokens = tokenizeDictationText(userText, language);
  const maxLength = Math.max(correctTokens.length, userTokens.length);
  const results = [];

  for (let index = 0; index < maxLength; index += 1) {
    const correct = correctTokens[index] || "";
    const actual = userTokens[index] || "";

    if (correct && actual && normalizeDictationToken(correct) === normalizeDictationToken(actual)) {
      results.push({ type: "match", correct, actual });
    } else if (correct && !actual) {
      results.push({ type: "missing", correct, actual: "" });
    } else if (!correct && actual) {
      results.push({ type: "extra", correct: "", actual });
    } else {
      results.push({ type: "different", correct, actual });
    }
  }

  return results;
}

function dictationRatingToSrsOutcome(rating) {
  const map = {
    great: "easy",
    ok: "normal",
    hard: "hard",
    failed: "forgot"
  };
  return map[rating] || "normal";
}

function dictationRatingLabel(rating) {
  const labels = {
    great: "よくできた",
    ok: "だいたいできた",
    hard: "難しかった",
    failed: "できなかった"
  };
  return labels[rating] || rating;
}

function practiceRatingToSrsOutcome(rating) {
  const map = {
    great: "easy",
    normal: "normal",
    hard: "hard",
    retry: "forgot"
  };
  return map[rating] || "normal";
}

function practiceRatingLabel(rating) {
  const labels = {
    great: "よくできた",
    normal: "普通",
    hard: "難しかった",
    retry: "やり直したい"
  };
  return labels[rating] || rating;
}

async function updateSrsAfterPractice(itemId, outcome) {
  try {
    return await srsRepository.updateSrsAfterReview(itemId, outcome);
  } catch (error) {
    if (!String(error.message || "").includes("SRSデータが見つかりません")) {
      throw error;
    }

    await createInitialSrsData(itemId);
    return srsRepository.updateSrsAfterReview(itemId, outcome);
  }
}

function supportsMediaRecorder() {
  return "MediaRecorder" in window && Boolean(navigator.mediaDevices?.getUserMedia);
}

function recordingPracticeText(item) {
  return [item?.content, item?.example, item?.title].find((value) => String(value || "").trim()) || "";
}

function recordingTargets(items = state.learningItems) {
  return items.filter((item) => {
    const hasPracticeText = Boolean(item.content || item.example);
    if (!hasPracticeText) {
      return false;
    }

    if (["sentence", "listening"].includes(item.type)) {
      return true;
    }

    return ["vocabulary", "grammar"].includes(item.type) && Boolean(item.example);
  });
}

function recordingChecklistForLanguage(language) {
  if (language === "english") {
    return [
      "語尾まで発音できた",
      "強く読む単語を意識できた",
      "音のつながりを真似できた",
      "r / l / th / v / f などを意識できた",
      "日本語っぽい区切りにならなかった"
    ];
  }

  if (language === "chinese") {
    return ["声調を意識できた", "ピンイン通りに読めた", "軽声を意識できた", "そり舌音を意識できた", "文全体のリズムを真似できた"];
  }

  return ["聞き返して違和感を確認できた", "もう一度練習したい"];
}

function createRecordingSession(context = "standalone") {
  return {
    context,
    queue: recordingTargets(),
    index: 0,
    status: "idle",
    audioUrl: "",
    completedCount: 0,
    evaluated: false,
    difficultItems: [],
    checklist: [],
    error: "",
    complete: false
  };
}

function currentRecordingEntry() {
  if (!state.recordingSession) {
    return null;
  }

  return state.recordingSession.queue[state.recordingSession.index] || null;
}

function releaseRecordingAudioUrl(session = state.recordingSession) {
  if (session?.audioUrl) {
    URL.revokeObjectURL(session.audioUrl);
    session.audioUrl = "";
  }
}

function stopRecordingTracks() {
  state.recordingStream?.getTracks().forEach((track) => track.stop());
  state.recordingStream = null;
}

function stopActiveRecording() {
  if (state.mediaRecorder && state.mediaRecorder.state !== "inactive") {
    state.mediaRecorder.stop();
  } else {
    stopRecordingTracks();
  }
}

function createDictationSession(context = "standalone") {
  return {
    context,
    queue: dictationTargets(),
    index: 0,
    revealed: false,
    evaluated: false,
    completedCount: 0,
    difficultItems: [],
    inputText: "",
    error: "",
    complete: false
  };
}

function currentDictationEntry() {
  if (!state.dictationSession) {
    return null;
  }

  return state.dictationSession.queue[state.dictationSession.index] || null;
}

function renderDictationDiff(diff) {
  if (!diff.length) {
    return "<p class=\"muted\">比較する語がありません。</p>";
  }

  return `
    <div class="dictation-diff">
      ${diff
        .map((part) => {
          const label = part.type === "match" ? "一致" : part.type === "missing" ? "抜け" : part.type === "extra" ? "余分" : "違い";
          const text =
            part.type === "different"
              ? `${part.actual || "未入力"} → ${part.correct || "なし"}`
              : part.actual || part.correct;
          return `<span class="dictation-token dictation-token--${part.type}" title="${escapeHtml(label)}">${escapeHtml(text)}</span>`;
        })
        .join("")}
    </div>
  `;
}

function renderDictationPractice(root = elements.dictationPractice, options = {}) {
  if (!root) {
    return;
  }

  const context = options.context || "standalone";
  if (!state.dictationSession || state.dictationSession.context !== context || options.reset) {
    state.dictationSession = createDictationSession(context);
  }

  const session = state.dictationSession;

  if (!session.queue.length) {
    root.innerHTML = `
      <div class="empty-state">
        <p>ディクテーション対象の文章がありません。</p>
        <p class="muted">sentenceまたはlisteningタイプで、contentまたはexampleが入ったLearningItemを登録してください。</p>
        <button type="button" class="soft-button dictation-reload">再読み込み</button>
      </div>
    `;
    attachDictationEvents(root);
    return;
  }

  if (session.complete || session.index >= session.queue.length) {
    root.innerHTML = `
      <div class="empty-state">
        <h3>ディクテーション完了</h3>
        <p>今回解いた問題数: ${escapeHtml(String(session.completedCount))}</p>
        ${
          session.difficultItems.length
            ? `<h4>難しかった項目</h4><ul class="mistake-list">${session.difficultItems
                .map((item) => `<li>${escapeHtml(item.title || "")}（${escapeHtml(learningItemTypeLabel(item.type))}）</li>`)
                .join("")}</ul>`
            : "<p>難しい項目はありませんでした。</p>"
        }
        <button type="button" class="soft-button dictation-restart">もう一度練習</button>
      </div>
    `;
    attachDictationEvents(root);
    return;
  }

  const item = currentDictationEntry();
  const answer = dictationAnswerText(item);
  const diff = session.revealed ? compareDictationAnswer(answer, session.inputText, item.language) : [];
  const rateOptions = [
    ["0.75", "0.75倍"],
    ["1", "1.0倍"],
    ["1.25", "1.25倍"]
  ];

  root.innerHTML = `
    <div class="dictation-practice">
      <div class="review-toolbar">
        <div class="review-stat">
          <span>今日のディクテーション対象</span>
          <strong>${escapeHtml(String(session.queue.length))}</strong>
        </div>
        <div class="review-stat">
          <span>現在の問題</span>
          <strong>${escapeHtml(String(session.index + 1))} / ${escapeHtml(String(session.queue.length))}</strong>
        </div>
      </div>
      ${session.error ? `<p class="auth-message auth-message--error">${escapeHtml(session.error)}</p>` : ""}
      <section class="section-card">
        <p class="eyebrow">${escapeHtml(learningItemTypeLabel(item.type))} / ${escapeHtml(languageLabel(item.language))}</p>
        <h3>${escapeHtml(item.title || "ディクテーション問題")}</h3>
        <p class="muted">音声を聞いて、聞き取った文章を入力してください。</p>
        <div class="field-row">
          <label>
            速度
            <select class="dictation-rate">
              ${rateOptions.map(([value, label]) => `<option value="${value}" ${value === "1" ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
          <div class="dictation-audio-actions">
            <button type="button" class="soft-button dictation-play">音声再生</button>
          </div>
        </div>
      </section>
      <label>
        聞き取った文章
        <textarea class="dictation-input" rows="5" placeholder="ここに聞き取った文章を入力">${escapeHtml(session.inputText)}</textarea>
      </label>
      <div class="mini-actions">
        <button type="button" class="soft-button dictation-reveal" ${session.revealed ? "disabled" : ""}>答えを見る</button>
        <button type="button" class="soft-button dictation-next" ${session.evaluated ? "" : "disabled"}>次へ</button>
        <button type="button" class="soft-button dictation-end">終了</button>
      </div>
      ${
        session.revealed
          ? `
            <section class="answer-panel">
              <h4>ユーザー入力</h4>
              <p>${escapeHtml(session.inputText || "未入力")}</p>
              <h4>正解文</h4>
              <p>${escapeHtml(answer)}</p>
              <h4>差分</h4>
              ${renderDictationDiff(diff)}
              <div class="mini-actions dictation-rating-actions">
                <button type="button" class="review-rating-button dictation-rate-button" data-rating="great" ${session.evaluated ? "disabled" : ""}>よくできた</button>
                <button type="button" class="review-rating-button dictation-rate-button" data-rating="ok" ${session.evaluated ? "disabled" : ""}>だいたいできた</button>
                <button type="button" class="review-rating-button soft-button dictation-rate-button" data-rating="hard" ${session.evaluated ? "disabled" : ""}>難しかった</button>
                <button type="button" class="review-rating-button soft-button dictation-rate-button" data-rating="failed" ${session.evaluated ? "disabled" : ""}>できなかった</button>
              </div>
            </section>
          `
          : ""
      }
    </div>
  `;

  attachDictationEvents(root);
}

function attachDictationEvents(root) {
  root.querySelector(".dictation-reload")?.addEventListener("click", async () => {
    await loadLearningItems();
    renderDictationPractice(root, { context: state.dictationSession?.context || "standalone", reset: true });
  });

  root.querySelector(".dictation-restart")?.addEventListener("click", () => {
    renderDictationPractice(root, { context: state.dictationSession?.context || "standalone", reset: true });
  });

  root.querySelector(".dictation-input")?.addEventListener("input", (event) => {
    if (state.dictationSession) {
      state.dictationSession.inputText = event.target.value;
    }
  });

  root.querySelector(".dictation-play")?.addEventListener("click", () => {
    const item = currentDictationEntry();
    if (!item) {
      return;
    }
    const rate = Number(root.querySelector(".dictation-rate")?.value || 1);
    const answer = dictationAnswerText(item);
    setTtsText(answer, item.language);
    speakText(answer, { language: languageToSpeechLang(item.language), rate });
  });

  root.querySelector(".dictation-reveal")?.addEventListener("click", () => {
    if (!state.dictationSession) {
      return;
    }
    const input = root.querySelector(".dictation-input")?.value || "";
    state.dictationSession.inputText = input;
    state.dictationSession.revealed = true;
    state.dictationSession.error = "";
    renderDictationPractice(root, { context: state.dictationSession.context });
    setStatus("正解を表示しました。自己評価を選んでください。");
  });

  root.querySelectorAll(".dictation-rate-button").forEach((button) => {
    button.addEventListener("click", async () => {
      await submitDictationRating(button.dataset.rating, root);
    });
  });

  root.querySelector(".dictation-next")?.addEventListener("click", () => {
    if (!state.dictationSession) {
      return;
    }
    state.dictationSession.index += 1;
    state.dictationSession.revealed = false;
    state.dictationSession.evaluated = false;
    state.dictationSession.inputText = "";
    state.dictationSession.error = "";
    renderDictationPractice(root, { context: state.dictationSession.context });
  });

  root.querySelector(".dictation-end")?.addEventListener("click", () => {
    if (!state.dictationSession) {
      return;
    }
    state.dictationSession.complete = true;
    renderDictationPractice(root, { context: state.dictationSession.context });
  });
}

async function submitDictationRating(rating, root) {
  const session = state.dictationSession;
  const item = currentDictationEntry();

  if (!session || !item || !session.revealed) {
    setStatus("先に答えを表示してください。");
    return;
  }

  await withBusy(async () => {
    const outcome = dictationRatingToSrsOutcome(rating);
    await updateSrsAfterPractice(item.id, outcome);
    session.evaluated = true;
    session.completedCount += 1;

    if (session.context === "course" && state.courseRun) {
      state.courseRun.dictationCount += 1;
      state.courseRun.reviewedItemIds = uniqueValues([...state.courseRun.reviewedItemIds, item.id]);
      if (outcome === "hard" || outcome === "forgot") {
        state.courseRun.mistakeItemIds = uniqueValues([...state.courseRun.mistakeItemIds, item.id]);
      }
    }

    if (outcome === "hard" || outcome === "forgot") {
      session.difficultItems.push(item);
    }

    session.error = "";
    renderDictationPractice(root, { context: session.context });
    setStatus(`ディクテーション結果を保存しました: ${dictationRatingLabel(rating)}`);
  }, "ディクテーション結果を保存しています...");

  if (state.dictationSession && !state.dictationSession.evaluated) {
    state.dictationSession.error = "SRS更新に失敗しました。ネットワークまたは保存先を確認してください。";
    renderDictationPractice(root, { context: state.dictationSession.context });
  }
}

function renderRecordingPractice(root = elements.recordingPractice, options = {}) {
  if (!root) {
    return;
  }

  const context = options.context || "standalone";
  if (!state.recordingSession || state.recordingSession.context !== context || options.reset) {
    releaseRecordingAudioUrl();
    state.recordingSession = createRecordingSession(context);
  }

  const session = state.recordingSession;
  const recorderSupported = supportsMediaRecorder();

  if (!recorderSupported) {
    root.innerHTML = `
      <div class="empty-state">
        <p>このブラウザは録音に対応していません。</p>
        <p class="muted">お手本音声の再生と練習文の確認はできますが、MediaRecorder APIが必要です。</p>
      </div>
    `;
    return;
  }

  if (!session.queue.length) {
    root.innerHTML = `
      <div class="empty-state">
        <p>音読録音の対象文がありません。</p>
        <p class="muted">sentenceまたはlisteningタイプのcontent/example、またはvocabulary/grammarのexampleを登録してください。</p>
        <button type="button" class="soft-button recording-reload">再読み込み</button>
      </div>
    `;
    attachRecordingEvents(root);
    return;
  }

  if (session.complete || session.index >= session.queue.length) {
    root.innerHTML = `
      <div class="empty-state">
        <h3>音読録音完了</h3>
        <p>今回録音した回数: ${escapeHtml(String(session.completedCount))}</p>
        ${
          session.difficultItems.length
            ? `<h4>難しかった項目</h4><ul class="mistake-list">${session.difficultItems
                .map((item) => `<li>${escapeHtml(item.title || "")}（${escapeHtml(learningItemTypeLabel(item.type))}）</li>`)
                .join("")}</ul>`
            : "<p>難しい項目はありませんでした。</p>"
        }
        <button type="button" class="soft-button recording-restart">もう一度練習</button>
      </div>
    `;
    attachRecordingEvents(root);
    return;
  }

  const item = currentRecordingEntry();
  const practiceText = recordingPracticeText(item);
  const checklist = recordingChecklistForLanguage(item.language);
  const rateOptions = [
    ["0.75", "0.75倍"],
    ["1", "1.0倍"],
    ["1.25", "1.25倍"]
  ];

  root.innerHTML = `
    <div class="recording-practice">
      <div class="review-toolbar">
        <div class="review-stat">
          <span>音読録音対象</span>
          <strong>${escapeHtml(String(session.queue.length))}</strong>
        </div>
        <div class="review-stat">
          <span>現在の文</span>
          <strong>${escapeHtml(String(session.index + 1))} / ${escapeHtml(String(session.queue.length))}</strong>
        </div>
        <div class="review-stat">
          <span>録音回数</span>
          <strong>${escapeHtml(String(session.completedCount))}</strong>
        </div>
      </div>
      ${session.error ? `<p class="auth-message auth-message--error">${escapeHtml(session.error)}</p>` : ""}
      <section class="section-card">
        <p class="eyebrow">${escapeHtml(learningItemTypeLabel(item.type))} / ${escapeHtml(languageLabel(item.language))}</p>
        <h3>${escapeHtml(item.title || "音読練習")}</h3>
        <p class="recording-practice-text">${escapeHtml(practiceText)}</p>
        <div class="field-row">
          <label>
            お手本速度
            <select class="recording-rate">
              ${rateOptions.map(([value, label]) => `<option value="${value}" ${value === "1" ? "selected" : ""}>${label}</option>`).join("")}
            </select>
          </label>
          <div class="dictation-audio-actions">
            <button type="button" class="soft-button recording-model-play">お手本音声再生</button>
          </div>
        </div>
      </section>
      <section class="section-card">
        <h4>自分の音読</h4>
        <p class="muted">${
          session.status === "recording"
            ? "録音中です。読み終えたら停止してください。"
            : session.audioUrl
              ? "録音を聞き返して、お手本と比べてください。"
              : "マイク許可後、音読を録音できます。"
        }</p>
        <div class="mini-actions">
          <button type="button" class="soft-button recording-start" ${session.status === "recording" ? "disabled" : ""}>録音開始</button>
          <button type="button" class="soft-button recording-stop" ${session.status === "recording" ? "" : "disabled"}>録音停止</button>
          <button type="button" class="soft-button recording-replay" ${session.audioUrl ? "" : "disabled"}>自分の録音を再生</button>
          <button type="button" class="soft-button recording-retake" ${session.audioUrl || session.status === "recording" ? "" : "disabled"}>録音やり直し</button>
        </div>
        ${session.audioUrl ? `<audio class="recording-audio" controls src="${escapeHtml(session.audioUrl)}"></audio>` : ""}
      </section>
      <section class="section-card">
        <h4>自己評価チェック</h4>
        <div class="recording-checklist">
          ${checklist
            .map(
              (label) => `
                <label class="checkbox-row">
                  <input type="checkbox" class="recording-check" value="${escapeHtml(label)}" ${session.checklist.includes(label) ? "checked" : ""} />
                  <span>${escapeHtml(label)}</span>
                </label>
              `
            )
            .join("")}
        </div>
        <div class="mini-actions recording-rating-actions">
          <button type="button" class="review-rating-button recording-rate-button" data-rating="great" ${session.evaluated ? "disabled" : ""}>よくできた</button>
          <button type="button" class="review-rating-button recording-rate-button" data-rating="normal" ${session.evaluated ? "disabled" : ""}>普通</button>
          <button type="button" class="review-rating-button soft-button recording-rate-button" data-rating="hard" ${session.evaluated ? "disabled" : ""}>難しかった</button>
          <button type="button" class="review-rating-button soft-button recording-rate-button" data-rating="retry" ${session.evaluated ? "disabled" : ""}>やり直したい</button>
        </div>
      </section>
      <div class="mini-actions">
        <button type="button" class="soft-button recording-next" ${session.evaluated ? "" : "disabled"}>次の文へ</button>
        <button type="button" class="soft-button recording-end">終了</button>
      </div>
    </div>
  `;

  attachRecordingEvents(root);
}

function attachRecordingEvents(root) {
  root.querySelector(".recording-reload")?.addEventListener("click", async () => {
    await loadLearningItems();
    renderRecordingPractice(root, { context: state.recordingSession?.context || "standalone", reset: true });
  });

  root.querySelector(".recording-restart")?.addEventListener("click", () => {
    renderRecordingPractice(root, { context: state.recordingSession?.context || "standalone", reset: true });
  });

  root.querySelector(".recording-model-play")?.addEventListener("click", () => {
    const item = currentRecordingEntry();
    if (!item) {
      return;
    }
    const text = recordingPracticeText(item);
    const rate = Number(root.querySelector(".recording-rate")?.value || 1);
    setTtsText(text, item.language);
    speakText(text, { language: languageToSpeechLang(item.language), rate });
  });

  root.querySelector(".recording-start")?.addEventListener("click", async () => {
    await startRecordingPractice(root);
  });

  root.querySelector(".recording-stop")?.addEventListener("click", () => {
    stopActiveRecording();
  });

  root.querySelector(".recording-replay")?.addEventListener("click", () => {
    const session = state.recordingSession;
    if (!session?.audioUrl) {
      setStatus("再生できる録音がありません。");
      return;
    }
    const audio = new Audio(session.audioUrl);
    audio.play().catch(() => setStatus("録音の再生に失敗しました。"));
  });

  root.querySelector(".recording-retake")?.addEventListener("click", () => {
    stopActiveRecording();
    if (state.recordingSession) {
      releaseRecordingAudioUrl(state.recordingSession);
      state.recordingSession.status = "idle";
      state.recordingSession.evaluated = false;
      state.recordingSession.error = "";
      renderRecordingPractice(root, { context: state.recordingSession.context });
    }
  });

  root.querySelectorAll(".recording-check").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      if (!state.recordingSession) {
        return;
      }
      const checked = [...root.querySelectorAll(".recording-check:checked")].map((input) => input.value);
      state.recordingSession.checklist = checked;
    });
  });

  root.querySelectorAll(".recording-rate-button").forEach((button) => {
    button.addEventListener("click", async () => {
      await submitRecordingRating(button.dataset.rating, root);
    });
  });

  root.querySelector(".recording-next")?.addEventListener("click", () => {
    if (!state.recordingSession) {
      return;
    }
    releaseRecordingAudioUrl(state.recordingSession);
    state.recordingSession.index += 1;
    state.recordingSession.status = "idle";
    state.recordingSession.audioUrl = "";
    state.recordingSession.evaluated = false;
    state.recordingSession.checklist = [];
    state.recordingSession.error = "";
    renderRecordingPractice(root, { context: state.recordingSession.context });
  });

  root.querySelector(".recording-end")?.addEventListener("click", () => {
    if (!state.recordingSession) {
      return;
    }
    stopActiveRecording();
    state.recordingSession.complete = true;
    renderRecordingPractice(root, { context: state.recordingSession.context });
  });
}

async function startRecordingPractice(root) {
  const session = state.recordingSession;
  if (!session) {
    return;
  }

  if (!supportsMediaRecorder()) {
    session.error = "このブラウザは録音に対応していません。";
    renderRecordingPractice(root, { context: session.context });
    return;
  }

  try {
    stopActiveRecording();
    releaseRecordingAudioUrl(session);
    state.recordingChunks = [];
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    state.recordingStream = stream;
    state.mediaRecorder = recorder;

    recorder.addEventListener("dataavailable", (event) => {
      if (event.data?.size) {
        state.recordingChunks.push(event.data);
      }
    });

    recorder.addEventListener("stop", () => {
      const mimeType = state.recordingChunks[0]?.type || "audio/webm";
      const blob = new Blob(state.recordingChunks, { type: mimeType });
      releaseRecordingAudioUrl(session);
      session.audioUrl = URL.createObjectURL(blob);
      session.status = "recorded";
      session.evaluated = false;
      session.completedCount += 1;
      session.error = "";

      if (session.context === "course" && state.courseRun) {
        state.courseRun.recordingCount += 1;
      }

      stopRecordingTracks();
      state.mediaRecorder = null;
      state.recordingChunks = [];
      renderRecordingPractice(root, { context: session.context });
      setStatus("録音を保存しました。ブラウザ内の一時データとして再生できます。");
    });

    recorder.start();
    session.status = "recording";
    session.error = "";
    renderRecordingPractice(root, { context: session.context });
    setStatus("録音を開始しました。");
  } catch (error) {
    session.status = "idle";
    session.error = error.name === "NotAllowedError" ? "マイク権限が拒否されました。ブラウザの権限設定を確認してください。" : "録音を開始できませんでした。";
    stopRecordingTracks();
    state.mediaRecorder = null;
    renderRecordingPractice(root, { context: session.context });
  }
}

async function submitRecordingRating(rating, root) {
  const session = state.recordingSession;
  const item = currentRecordingEntry();

  if (!session || !item) {
    setStatus("音読録音の対象がありません。");
    return;
  }

  if (!session.audioUrl) {
    session.error = "先に録音してください。";
    renderRecordingPractice(root, { context: session.context });
    return;
  }

  await withBusy(async () => {
    const outcome = practiceRatingToSrsOutcome(rating);
    await updateSrsAfterPractice(item.id, outcome);
    session.evaluated = true;

    if (session.context === "course" && state.courseRun) {
      state.courseRun.reviewedItemIds = uniqueValues([...state.courseRun.reviewedItemIds, item.id]);
      if (outcome === "hard" || outcome === "forgot") {
        state.courseRun.mistakeItemIds = uniqueValues([...state.courseRun.mistakeItemIds, item.id]);
      }
    }

    if (outcome === "hard" || outcome === "forgot") {
      session.difficultItems.push(item);
    }

    session.error = "";
    renderRecordingPractice(root, { context: session.context });
    setStatus(`音読録音の自己評価を保存しました: ${practiceRatingLabel(rating)}`);
  }, "音読録音の自己評価を保存しています...");

  if (state.recordingSession && !state.recordingSession.evaluated) {
    state.recordingSession.error = "SRS更新に失敗しました。ネットワークまたは保存先を確認してください。";
    renderRecordingPractice(root, { context: state.recordingSession.context });
  }
}

function pauseSpeech() {
  if (supportsSpeechSynthesis() && window.speechSynthesis.speaking) {
    window.speechSynthesis.pause();
    setTtsMessage("読み上げを一時停止しました。");
    setStatus("読み上げを一時停止しました。");
  }
}

function resumeSpeech() {
  if (supportsSpeechSynthesis()) {
    window.speechSynthesis.resume();
    setTtsMessage("読み上げを再開しました。");
    setStatus("読み上げを再開しました。");
  }
}

function stopSpeech() {
  if (supportsSpeechSynthesis()) {
    state.ttsRequestId += 1;
    window.speechSynthesis.cancel();
    setTtsMessage("読み上げを停止しました。");
    setStatus("読み上げを停止しました。");
  }
}

function initTextToSpeech() {
  if (!supportsSpeechSynthesis()) {
    [elements.ttsPlay, elements.ttsStop, elements.ttsPause, elements.ttsResume].forEach((button) => {
      button.disabled = true;
    });
    setTtsMessage("このブラウザは音声読み上げに対応していません。", true);
    return;
  }

  updateTtsSliderLabels();
  loadTtsVoices();

  if ("addEventListener" in window.speechSynthesis) {
    window.speechSynthesis.addEventListener("voiceschanged", loadTtsVoices);
  } else {
    window.speechSynthesis.onvoiceschanged = loadTtsVoices;
  }
}

function modeLabel(mode) {
  const labels = {
    manual_vocabulary: "単語登録",
    review: "復習"
  };

  return labels[mode] || mode;
}

function switchPage(pageId) {
  if (state.mediaRecorder && state.mediaRecorder.state !== "inactive" && !["recording", "course"].includes(pageId)) {
    stopActiveRecording();
  }

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

  if (pageId === "audio") {
    loadTtsVoices();
  }

  if (pageId === "dictation") {
    loadDictationPractice();
  }

  if (pageId === "recording") {
    loadRecordingPractice();
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

  if (path === "/api/study-logs" && method === "GET") {
    return localJsonResponse({ items: sortByCreatedAtDesc(readLocalCollection(localStoreKeys.studyLogs)) });
  }

  if (path === "/api/study-logs" && method === "POST") {
    const items = readLocalCollection(localStoreKeys.studyLogs);
    const timestamp = new Date().toISOString();
    const item = {
      id: body.id || createLocalId(),
      date: body.date || timestamp.slice(0, 10),
      learnedItems: Array.isArray(body.learnedItems) ? body.learnedItems : [],
      mistakes: Array.isArray(body.mistakes) ? body.mistakes : [],
      feedback: body.feedback || "",
      tomorrowReviewItems: Array.isArray(body.tomorrowReviewItems) ? body.tomorrowReviewItems : [],
      freeNote: body.freeNote || "",
      createdAt: timestamp,
      updatedAt: timestamp
    };
    items.unshift(item);
    writeLocalCollection(localStoreKeys.studyLogs, items);
    return localJsonResponse({ item });
  }

  if (path.startsWith("/api/study-logs/")) {
    const id = decodeURIComponent(path.split("/").pop());
    const items = readLocalCollection(localStoreKeys.studyLogs);
    const index = items.findIndex((item) => item.id === id);

    if (method === "GET") {
      return localJsonResponse({ item: index === -1 ? null : items[index] });
    }

    if (method === "DELETE" && index !== -1) {
      items.splice(index, 1);
      writeLocalCollection(localStoreKeys.studyLogs, items);
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

const { learningItemsRepository, srsRepository, learningSessionsRepository, studyLogsRepository } = createRepositories({
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

async function loadDictationPractice() {
  try {
    const data = await learningItemsRepository.getLearningItems();
    state.learningItems = data.items || [];
    renderDictationPractice(elements.dictationPractice, { context: "standalone", reset: true });
    setStatus("ディクテーション対象を読み込みました。");
  } catch (error) {
    if (elements.dictationPractice) {
      elements.dictationPractice.innerHTML = `<p class="auth-message auth-message--error">${escapeHtml(error.message || "ディクテーション対象の読み込みに失敗しました。")}</p>`;
    }
    setStatus(error.message || "ディクテーション対象の読み込みに失敗しました。");
  }
}

async function loadRecordingPractice() {
  try {
    const data = await learningItemsRepository.getLearningItems();
    state.learningItems = data.items || [];
    renderRecordingPractice(elements.recordingPractice, { context: "standalone", reset: true });
    setStatus("音読録音の対象を読み込みました。");
  } catch (error) {
    if (elements.recordingPractice) {
      elements.recordingPractice.innerHTML = `<p class="auth-message auth-message--error">${escapeHtml(error.message || "音読録音の対象読み込みに失敗しました。")}</p>`;
    }
    setStatus(error.message || "音読録音の対象読み込みに失敗しました。");
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
              <button type="button" class="soft-button learning-item-speak" data-id="${item.id}">読み上げ</button>
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
    run.renderedStepIndex = run.currentStepIndex;
    renderDictationPractice(elements.courseStepUi, { context: "course", reset: true });
    return;
  }

  if (step.type === "recording") {
    run.renderedStepIndex = run.currentStepIndex;
    renderRecordingPractice(elements.courseStepUi, { context: "course", reset: true });
    return;
  }

  if (step.type === "shadowing") {
    run.renderedStepIndex = run.currentStepIndex;
    renderRecordingPractice(elements.courseStepUi, { context: "course", reset: true });
    return;
  }

  if (step.type === "listening") {
    const candidates = state.learningItems
      .filter((item) => ["listening", "sentence"].includes(item.type))
      .slice(0, 5);

    elements.courseStepUi.innerHTML = `
      <div class="course-step-ui-grid">
        <p>登録済みのlisteningまたはsentenceを聞く練習です。</p>
        ${
          candidates.length
            ? `<div class="tts-item-list">${candidates
                .map(
                  (item) => `
                    <div class="tts-item-card">
                      <div>
                        <strong>${escapeHtml(item.title || "")}</strong>
                        <p class="muted">${escapeHtml(item.content || item.example || item.meaning || "")}</p>
                      </div>
                      <div class="mini-actions">
                        <button type="button" class="soft-button tts-course-item" data-id="${item.id}" data-rate="1">再生</button>
                      </div>
                    </div>
                  `
                )
                .join("")}</div>`
            : "<p>listeningまたはsentenceタイプのLearningItemがまだありません。自由入力欄で読み上げを試せます。</p>"
        }
        <label>
          自由入力テキスト
          <textarea id="course-tts-text" rows="5" placeholder="読み上げたい文章を入力"></textarea>
        </label>
        <div class="mini-actions">
          <button type="button" id="course-tts-play" class="soft-button">再生</button>
        </div>
      </div>
    `;
    run.renderedStepIndex = run.currentStepIndex;
    elements.courseStepUi.querySelectorAll(".tts-course-item").forEach((button) => {
      button.addEventListener("click", () => {
        const item = state.learningItems.find((entry) => entry.id === button.dataset.id);
        if (item) {
          speakLearningItem(item, { rate: Number(button.dataset.rate || 1) });
        }
      });
    });
    document.querySelector("#course-tts-play").addEventListener("click", () => {
      const text = document.querySelector("#course-tts-text").value;
      setTtsText(text, elements.ttsLanguage.value);
      speakText(text);
    });
    return;
  }

  if (step.type === "reading" || step.type === "grammar") {
    const candidates = state.learningItems
      .filter((item) => ["grammar", "sentence", "listening"].includes(item.type))
      .slice(0, 3);
    elements.courseStepUi.innerHTML = candidates.length
      ? `<div class="course-step-ui-grid">${candidates
          .map((item) => `<div><strong>${escapeHtml(item.title)}</strong><p class="muted">${escapeHtml(item.meaning || item.exampleTranslation || item.content || "")}</p></div>`)
          .join("")}</div>`
      : "<p>登録済みのLearningItemから文法・例文・リスニング項目を確認してください。</p>";
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
      <div class="course-summary-item"><span>ディクテーション</span><strong>${escapeHtml(String(payload.dictationCount))}</strong></div>
      <div class="course-summary-item"><span>録音回数</span><strong>${escapeHtml(String(payload.recordingCount))}</strong></div>
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
    const [sessionsData, logsData] = await Promise.all([
      learningSessionsRepository.getLearningSessions(),
      studyLogsRepository.getStudyLogs()
    ]);
    state.learningSessions = sortHistoryByDate(sessionsData.items || []);
    state.studyLogs = sortHistoryByDate(logsData.items || []);
    renderHistorySummary();
    renderSessionHistoryTable();
    renderStudyLogTable();
    setStatus("学習履歴を読み込みました。");
  } catch (error) {
    setStatus(error.message || "履歴の読み込みに失敗しました。");
  }
}

function sortHistoryByDate(items) {
  return [...items].sort((a, b) => {
    const dateA = new Date(a.date || a.createdAt || 0);
    const dateB = new Date(b.date || b.createdAt || 0);
    return dateB - dateA;
  });
}

function historyDateLabel(value) {
  return value || "";
}

function sessionDateSet() {
  return new Set(
    state.learningSessions
      .filter((session) => Number(session.actualMinutes || 0) > 0)
      .map((session) => session.date)
      .filter(Boolean)
  );
}

function calculateStudyStreak() {
  const dates = sessionDateSet();
  let streak = 0;
  const cursor = new Date(todayDateString());

  while (dates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function renderHistorySummary() {
  const today = todayDateString();
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  const sevenDaysAgoIso = sevenDaysAgo.toISOString().slice(0, 10);

  const todayMinutes = state.learningSessions
    .filter((session) => session.date === today)
    .reduce((sum, session) => sum + Number(session.actualMinutes || 0), 0);
  const weekMinutes = state.learningSessions
    .filter((session) => session.date >= sevenDaysAgoIso && session.date <= today)
    .reduce((sum, session) => sum + Number(session.actualMinutes || 0), 0);
  const latestSession = state.learningSessions[0];
  const latestLog = state.studyLogs[0];

  elements.historyTodayMinutes.textContent = `${todayMinutes}分`;
  elements.historyWeekMinutes.textContent = `${weekMinutes}分`;
  elements.historyStreakDays.textContent = `${calculateStudyStreak()}日`;
  elements.historyLatestSession.textContent = latestSession ? `${latestSession.courseName || "セッション"} / ${latestSession.actualMinutes || 0}分` : "なし";
  elements.historyLatestLog.textContent = latestLog ? historyDateLabel(latestLog.date) : "なし";
}

function renderSessionHistoryTable() {
  if (state.learningSessions.length === 0) {
    elements.sessionHistoryTableBody.innerHTML = `
      <tr>
        <td colspan="11">まだ学習履歴がありません。</td>
      </tr>
    `;
    return;
  }

  elements.sessionHistoryTableBody.innerHTML = state.learningSessions
    .map(
      (session) => `
        <tr>
          <td>${escapeHtml(historyDateLabel(session.date))}</td>
          <td>${escapeHtml(session.courseName || "")}</td>
          <td>${escapeHtml(String(session.plannedMinutes || 0))}分</td>
          <td>${escapeHtml(String(session.actualMinutes || 0))}分</td>
          <td>${escapeHtml(String(session.completedSteps?.length || 0))}</td>
          <td>${escapeHtml(String(session.skippedSteps?.length || 0))}</td>
          <td>${escapeHtml(String(session.reviewedItemIds?.length || 0))}</td>
          <td>${escapeHtml(String(session.mistakeItemIds?.length || 0))}</td>
          <td>${session.writingText ? "あり" : "なし"}</td>
          <td>${session.note ? "あり" : "なし"}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="soft-button session-view" data-id="${session.id}">詳細</button>
              <button type="button" class="soft-button session-delete" data-id="${session.id}">削除</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderStudyLogTable() {
  if (state.studyLogs.length === 0) {
    elements.studyLogTableBody.innerHTML = `
      <tr>
        <td colspan="6">まだ学習ログがありません。</td>
      </tr>
    `;
    return;
  }

  elements.studyLogTableBody.innerHTML = state.studyLogs
    .map(
      (log) => `
        <tr>
          <td>${escapeHtml(historyDateLabel(log.date))}</td>
          <td>${escapeHtml(String(log.learnedItems?.length || 0))}</td>
          <td>${escapeHtml(String(log.mistakes?.length || 0))}</td>
          <td>${log.feedback ? "あり" : "なし"}</td>
          <td>${log.freeNote ? "あり" : "なし"}</td>
          <td>
            <div class="table-actions">
              <button type="button" class="soft-button study-log-view" data-id="${log.id}">詳細</button>
              <button type="button" class="soft-button study-log-delete" data-id="${log.id}">削除</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderItemList(items, fallbackIds = []) {
  if (items.length === 0 && fallbackIds.length === 0) {
    return "<p>なし</p>";
  }

  if (items.length === 0) {
    return `<ul class="detail-list">${fallbackIds.map((id) => `<li>${escapeHtml(id)}</li>`).join("")}</ul>`;
  }

  return `
    <div class="item-chip-list">
      ${items
        .map(
          (item) => `
            <div class="item-chip">
              <strong>${escapeHtml(item.title || item.id)}</strong>
              <span>${escapeHtml(learningItemTypeLabel(item.type))} / ${escapeHtml(languageLabel(item.language))}</span>
              ${item.meaning ? `<p>${escapeHtml(item.meaning)}</p>` : ""}
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

async function loadLearningItemsByIds(ids) {
  const uniqueIds = uniqueValues(ids);
  if (!uniqueIds.length) {
    return [];
  }

  try {
    const data = await learningItemsRepository.getLearningItemsByIds(uniqueIds);
    return data.items || [];
  } catch (error) {
    setStatus(error.message || "学習アイテムの取得に失敗しました。");
    return [];
  }
}

async function renderSessionDetail(session) {
  const reviewedItems = await loadLearningItemsByIds(session.reviewedItemIds || []);
  const mistakeItems = await loadLearningItemsByIds(session.mistakeItemIds || []);

  elements.historyDetail.className = "result-area";
  elements.historyDetail.innerHTML = `
    <div class="rendered-result">
      <h3>${escapeHtml(session.courseName || "LearningSession")}</h3>
      <div class="summary-box">${escapeHtml(historyDateLabel(session.date))} / 予定 ${escapeHtml(String(session.plannedMinutes || 0))}分 / 実績 ${escapeHtml(String(session.actualMinutes || 0))}分</div>
      <article class="section-card">
        <h4>完了したステップ</h4>
        <p>${escapeHtml((session.completedSteps || []).join(", ") || "なし")}</p>
      </article>
      <article class="section-card">
        <h4>スキップしたステップ</h4>
        <p>${escapeHtml((session.skippedSteps || []).join(", ") || "なし")}</p>
      </article>
      <article class="section-card">
        <h4>復習した項目</h4>
        ${renderItemList(reviewedItems, session.reviewedItemIds || [])}
      </article>
      <article class="section-card">
        <h4>難しい / 忘れた項目</h4>
        ${renderItemList(mistakeItems, session.mistakeItemIds || [])}
      </article>
      <article class="section-card">
        <h4>カウント</h4>
        <p>dictationCount: ${escapeHtml(String(session.dictationCount || 0))} / recordingCount: ${escapeHtml(String(session.recordingCount || 0))}</p>
      </article>
      <article class="section-card">
        <h4>作文</h4>
        <p>${escapeHtml(session.writingText || "未入力")}</p>
      </article>
      <article class="section-card">
        <h4>フィードバック</h4>
        <p>${escapeHtml(session.feedbackText || "なし")}</p>
      </article>
      <article class="section-card">
        <h4>メモ</h4>
        <p>${escapeHtml(session.note || "未入力")}</p>
      </article>
    </div>
  `;
}

function renderStudyLogDetail(log) {
  elements.historyDetail.className = "result-area";
  elements.historyDetail.innerHTML = `
    <div class="rendered-result">
      <h3>StudyLog ${escapeHtml(historyDateLabel(log.date))}</h3>
      <article class="section-card">
        <h4>learnedItems</h4>
        <p>${escapeHtml(JSON.stringify(log.learnedItems || [], null, 2))}</p>
      </article>
      <article class="section-card">
        <h4>mistakes</h4>
        <p>${escapeHtml(JSON.stringify(log.mistakes || [], null, 2))}</p>
      </article>
      <article class="section-card">
        <h4>feedback</h4>
        <p>${escapeHtml(log.feedback || "なし")}</p>
      </article>
      <article class="section-card">
        <h4>tomorrowReviewItems</h4>
        <p>${escapeHtml(JSON.stringify(log.tomorrowReviewItems || [], null, 2))}</p>
      </article>
      <article class="section-card">
        <h4>freeNote</h4>
        <p>${escapeHtml(log.freeNote || "なし")}</p>
      </article>
    </div>
  `;
}

function clearHistoryDetail() {
  elements.historyDetail.className = "result-area empty-state";
  elements.historyDetail.innerHTML = "<p>履歴を選ぶと詳細が表示されます。</p>";
}

async function showSessionDetail(id) {
  try {
    const data = await learningSessionsRepository.getLearningSessionById(id);
    state.selectedSessionId = id;
    state.selectedStudyLogId = "";
    if (!data.item) {
      throw new Error("学習セッションが見つかりません。");
    }
    await renderSessionDetail(data.item);
  } catch (error) {
    setStatus(error.message || "セッション詳細の読み込みに失敗しました。");
  }
}

async function showStudyLogDetail(id) {
  try {
    const data = await studyLogsRepository.getStudyLogById(id);
    state.selectedStudyLogId = id;
    state.selectedSessionId = "";
    if (!data.item) {
      throw new Error("学習ログが見つかりません。");
    }
    renderStudyLogDetail(data.item);
  } catch (error) {
    setStatus(error.message || "学習ログ詳細の読み込みに失敗しました。");
  }
}

async function deleteSessionHistory(id) {
  await withBusy(async () => {
    await learningSessionsRepository.deleteLearningSession(id);
    if (state.selectedSessionId === id) {
      state.selectedSessionId = "";
      clearHistoryDetail();
    }
    await loadHistory();
    setStatus("学習セッションを削除しました。");
  }, "学習セッションを削除しています...");
}

async function deleteStudyLogHistory(id) {
  await withBusy(async () => {
    await studyLogsRepository.deleteStudyLog(id);
    if (state.selectedStudyLogId === id) {
      state.selectedStudyLogId = "";
      clearHistoryDetail();
    }
    await loadHistory();
    setStatus("学習ログを削除しました。");
  }, "学習ログを削除しています...");
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
  const speechText = learningItemSpeechText(item);
  const speechButton = speechText
    ? `
      <div class="mini-actions tts-inline-actions">
        <button type="button" class="soft-button tts-review-current">答えを読み上げ</button>
      </div>
    `
    : "";

  elements.reviewAnswerArea.innerHTML = `${rows ? `<dl>${rows}</dl>` : "<p>表示できる答えがありません。</p>"}${speechButton}`;
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
elements.speakLearningItem.addEventListener("click", () => {
  const selectedItem = state.learningItems.find((entry) => entry.id === state.selectedLearningItemId);
  const draftItem = selectedItem || buildLearningItemPayload();
  speakLearningItem(draftItem);
});
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

  if (target.classList.contains("learning-item-speak")) {
    const item = state.learningItems.find((entry) => entry.id === target.dataset.id);
    if (item) {
      speakLearningItem(item);
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
elements.sessionHistoryTableBody.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("session-view")) {
    await showSessionDetail(target.dataset.id);
  }

  if (target.classList.contains("session-delete")) {
    await deleteSessionHistory(target.dataset.id);
  }
});

elements.studyLogTableBody.addEventListener("click", async (event) => {
  const target = event.target;

  if (target.classList.contains("study-log-view")) {
    await showStudyLogDetail(target.dataset.id);
  }

  if (target.classList.contains("study-log-delete")) {
    await deleteStudyLogHistory(target.dataset.id);
  }
});

elements.loadReviewCard.addEventListener("click", loadReviewItems);
elements.revealReviewAnswer.addEventListener("click", revealReviewAnswer);
elements.reviewAnswerArea.addEventListener("click", (event) => {
  if (event.target.classList.contains("tts-review-current")) {
    const entry = currentReviewEntry();
    if (entry) {
      speakLearningItem(entry.item);
    }
  }
});
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

elements.ttsLanguage.addEventListener("change", renderTtsVoiceOptions);
elements.ttsRate.addEventListener("input", updateTtsSliderLabels);
elements.ttsPitch.addEventListener("input", updateTtsSliderLabels);
elements.ttsPlay.addEventListener("click", () => speakText());
elements.ttsStop.addEventListener("click", stopSpeech);
elements.ttsPause.addEventListener("click", pauseSpeech);
elements.ttsResume.addEventListener("click", resumeSpeech);

window.addEventListener("beforeunload", (event) => {
  stopActiveRecording();
  if (state.courseRun && !state.courseRun.isComplete && !state.courseRun.saved) {
    event.preventDefault();
    event.returnValue = "";
  }
});

clearHistoryDetail();
renderReviewCard();
renderCoursePresetList();
setStatus("準備完了");
initTextToSpeech();
initAuth();
