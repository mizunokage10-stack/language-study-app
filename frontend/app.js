import { supabase } from "./supabase-client.js";
import { createRepositories } from "./repositories.js";

// BBC Learning English 外部教材設定
const BBC_LISTENING_CONFIG = {
  url: "https://www.bbc.co.uk/learningenglish/",
  label: "BBC Learning Englishを開く",
  guideByLevel: {
    easy: "A1〜A2の方はEasy levelの短い会話や基礎表現（Elementary Podcasts・The Flatmatesなど）を選んでください。",
    medium: "B1以上の方はMedium level・6 Minute English・BBC Newsの音声コンテンツを選んでください。"
  },
  timerNote: "BBCを開いている間もタイマーは進みます。休憩する場合は一時停止してください。"
};

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
  dbVocabulary: [],
  dbReadingMaterials: [],
  localReadingMaterials: [],
  vocabQuiz: { queue: [], index: 0, mode: "meaning", phase: "input" },
  courseFilters: { language: "english", cefrLevel: "A1", domain: "", duration: "" },
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
  historyItems: "language-study.historyItems",
  readingMaterials: "language-study.readingMaterials"
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
  learningItemPos: document.querySelector("#learning-item-pos"),
  learningItemContent: document.querySelector("#learning-item-content"),
  learningItemExample: document.querySelector("#learning-item-example"),
  learningItemExampleTranslation: document.querySelector("#learning-item-example-translation"),
  learningItemNote: document.querySelector("#learning-item-note"),
  learningItemTags: document.querySelector("#learning-item-tags"),
  learningItemTitleReading: document.querySelector("#learning-item-title-reading"),
  learningItemTagsReading: document.querySelector("#learning-item-tags-reading"),
  vocabFields: document.querySelector("#vocab-fields"),
  readingFields: document.querySelector("#reading-fields"),
  vocabBulkPaste: document.querySelector("#vocab-bulk-paste"),
  copyVocabPrompt: document.querySelector("#copy-vocab-prompt"),
  vocabBulkImport: document.querySelector("#vocab-bulk-import"),
  newLearningItem: document.querySelector("#new-learning-item"),
  speakLearningItem: document.querySelector("#speak-learning-item"),
  deleteLearningItem: document.querySelector("#delete-learning-item"),
  coursePresetList: document.querySelector("#course-preset-list"),
  courseFilterLanguage: document.querySelector("#course-filter-language"),
  courseFilterCefr: document.querySelector("#course-filter-cefr"),
  courseFilterDomain: document.querySelector("#course-filter-domain"),
  courseFilterDuration: document.querySelector("#course-filter-duration"),
  courseFilterApply: document.querySelector("#course-filter-apply"),
  courseMaterialsMessage: document.querySelector("#course-materials-message"),
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

// 学習コース別パート時間設定（分）
const COURSE_PART_MINUTES = {
  "course-30":  { vocab: 8,  listening: 7,  reading: 10, writing: 5  },
  "course-60":  { vocab: 15, listening: 15, reading: 20, writing: 10 },
  "course-90":  { vocab: 20, listening: 20, reading: 35, writing: 15 }
};

const coursePresets = [
  {
    id: "course-30",
    name: "30分コース",
    totalMinutes: 30,
    description: "忙しい日でも最低限の学習",
    steps: [
      { id: "vocab",     title: "単語学習",       type: "vocab-quiz", minutes: COURSE_PART_MINUTES["course-30"].vocab,     instructions: "登録済みの単語から意味入力・スペル入力の2形式で練習します。" },
      { id: "listening", title: "リスニング",     type: "listening",  minutes: COURSE_PART_MINUTES["course-30"].listening, instructions: "BBC Learning Englishでリスニング練習を行います。" },
      { id: "reading",   title: "読解",           type: "reading",    minutes: COURSE_PART_MINUTES["course-30"].reading,   instructions: "登録した文章を使って、初読→確認設問→精読→再読→音読→1文アウトプットの順で学習します。" },
      { id: "writing",   title: "作文",           type: "writing",    minutes: COURSE_PART_MINUTES["course-30"].writing,   instructions: "今日学んだ単語・表現を使って短い作文を書きます。" }
    ]
  },
  {
    id: "course-60",
    name: "60分コース",
    totalMinutes: 60,
    description: "標準バランス学習",
    steps: [
      { id: "vocab",     title: "単語学習",       type: "vocab-quiz", minutes: COURSE_PART_MINUTES["course-60"].vocab,     instructions: "登録済みの単語から意味入力・スペル入力の2形式で練習します。" },
      { id: "listening", title: "リスニング",     type: "listening",  minutes: COURSE_PART_MINUTES["course-60"].listening, instructions: "BBC Learning Englishでリスニング練習を行います。" },
      { id: "reading",   title: "読解",           type: "reading",    minutes: COURSE_PART_MINUTES["course-60"].reading,   instructions: "登録した文章を使って、初読→確認設問→精読→再読→音読→1文アウトプットの順で学習します。" },
      { id: "writing",   title: "作文",           type: "writing",    minutes: COURSE_PART_MINUTES["course-60"].writing,   instructions: "今日学んだ単語・表現を使って短い作文を書きます。" }
    ]
  },
  {
    id: "course-90",
    name: "90分コース",
    totalMinutes: 90,
    description: "しっかり集中学習",
    steps: [
      { id: "vocab",     title: "単語学習",       type: "vocab-quiz", minutes: COURSE_PART_MINUTES["course-90"].vocab,     instructions: "登録済みの単語から意味入力・スペル入力の2形式で練習します。" },
      { id: "listening", title: "リスニング",     type: "listening",  minutes: COURSE_PART_MINUTES["course-90"].listening, instructions: "BBC Learning Englishでリスニング練習を行います。" },
      { id: "reading",   title: "読解",           type: "reading",    minutes: COURSE_PART_MINUTES["course-90"].reading,   instructions: "登録した文章を使って、初読→確認設問→精読→再読→音読→1文アウトプットの順で学習します。" },
      { id: "writing",   title: "作文",           type: "writing",    minutes: COURSE_PART_MINUTES["course-90"].writing,   instructions: "今日学んだ単語・表現を使って短い作文を書きます。" }
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

  elements.authPassword.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleLogin();
  });
  elements.authEmail.addEventListener("keydown", (e) => {
    if (e.key === "Enter") elements.authPassword.focus();
  });
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
  const hostname = window.location.hostname;
  const port = window.location.port;
  // Vercel（localhost以外）またはstatic mockupサーバー（port 3333）ではlocalStorageを使用
  return !["localhost", "127.0.0.1", ""].includes(hostname) || port === "3333";
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
  // ドロップダウンには英語用・中国語用の固定音声のみ表示する
  const enVoice = preferredVoiceForLang("en-US");
  const zhVoice = preferredVoiceForLang("zh-TW");
  const voices = [enVoice, zhVoice].filter(Boolean).filter(
    (v, i, arr) => arr.findIndex((x) => x.voiceURI === v.voiceURI) === i
  );

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

// 言語ごとに固定音声を返す。見つからない場合は lang の最適一致にフォールバック。
function preferredVoiceForLang(language) {
  const lang = String(language || "").toLowerCase();
  const all = state.ttsVoices;

  if (lang.startsWith("en")) {
    // 優先: Eddy (en-US)
    const eddy = all.find((v) => /eddy/i.test(v.name) && String(v.lang).toLowerCase().startsWith("en"));
    if (eddy) return eddy;
    // フォールバック: en-US の最初の音声
    return all.find((v) => String(v.lang).toLowerCase().startsWith("en-us")) ||
           all.find((v) => String(v.lang).toLowerCase().startsWith("en")) || null;
  }

  if (lang.startsWith("zh")) {
    // 優先: Google 國語（臺灣）(zh-TW)
    const google = all.find((v) => /google.*國語|國語.*google/i.test(v.name) && String(v.lang).toLowerCase().startsWith("zh"));
    if (google) return google;
    // フォールバック: zh-TW の最初の音声
    return all.find((v) => String(v.lang).toLowerCase().startsWith("zh-tw")) ||
           all.find((v) => String(v.lang).toLowerCase().startsWith("zh")) || null;
  }

  return null;
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
  // 言語が英語・中国語の場合は固定音声を使用。それ以外はドロップダウン選択を使用。
  const voice = options.voice || preferredVoiceForLang(language) || selectedTtsVoice();

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

  // inner topbar: show on non-home pages
  const innerTopbar = document.getElementById("inner-topbar");
  const innerTitle  = document.getElementById("inner-page-title");
  if (innerTopbar) {
    const pageTitles = {
      course: "学習タイマー", "learning-items": "単語登録 / 文章登録",
      "vocab-list": "登録済み単語一覧", "reading-list": "登録済み文章一覧",
      audio: "音声練習", dictation: "ディクテーション",
      recording: "音読録音", notebook: "単語帳",
      history: "学習履歴", review: "SRS復習",
    };
    innerTopbar.classList.toggle("hidden", pageId === "home");
    if (innerTitle) innerTitle.textContent = pageTitles[pageId] || "";
  }

  if (pageId === "history") {
    loadHistory();
  }

  if (pageId === "learning-items") {
    // 登録フォームページ: テーブルは不要
  }

  if (pageId === "vocab-list") {
    loadVocabListPage();
  }

  if (pageId === "reading-list") {
    loadReadingListPage();
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

  if (path === "/api/reading-materials" && method === "GET") {
    const items = readLocalCollection(localStoreKeys.readingMaterials);
    return localJsonResponse({ items: sortByCreatedAtDesc(items) });
  }

  if (path === "/api/reading-materials" && method === "POST") {
    const items = readLocalCollection(localStoreKeys.readingMaterials);
    const timestamp = new Date().toISOString();
    const item = {
      id: body.id || createLocalId(),
      type: body.type || "reading_text",
      title: body.title || "",
      language: body.language || "en",
      level: body.level || "",
      domain: body.domain || "",
      sourceNote: body.sourceNote || "",
      originalText: body.originalText || "",
      japaneseTranslation: body.japaneseTranslation || "",
      firstReading: body.firstReading || { targetSeconds: 90, instruction: "辞書を使わず、止まらずに読んでください。" },
      comprehensionQuestions: Array.isArray(body.comprehensionQuestions) ? body.comprehensionQuestions : [],
      intensiveReading: body.intensiveReading || { vocabulary: [], chunks: [], grammarPoints: [], notes: [] },
      rereading: body.rereading || { targetSeconds: 60, instruction: "初読より少し速く読むことを目標にしてください。" },
      oralPractice: body.oralPractice || { instruction: "", focusChunks: [] },
      oneSentenceOutput: body.oneSentenceOutput || { instruction: "", recommendedExpressions: [] },
      createdAt: timestamp,
      updatedAt: timestamp
    };
    items.unshift(item);
    writeLocalCollection(localStoreKeys.readingMaterials, items);
    return localJsonResponse({ item });
  }

  if (path.startsWith("/api/reading-materials/")) {
    const id = decodeURIComponent(path.split("/").pop());
    const items = readLocalCollection(localStoreKeys.readingMaterials);
    const index = items.findIndex((item) => item.id === id);

    if (method === "PATCH" && index !== -1) {
      items[index] = { ...items[index], ...body, updatedAt: new Date().toISOString() };
      writeLocalCollection(localStoreKeys.readingMaterials, items);
      return localJsonResponse({ item: items[index] });
    }

    if (method === "DELETE" && index !== -1) {
      items.splice(index, 1);
      writeLocalCollection(localStoreKeys.readingMaterials, items);
      return localJsonResponse({ ok: true });
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
  const typeFilter = elements.learningItemTypeFilter?.value || "";
  const langFilter = elements.learningItemLanguageFilter?.value || "";
  const query = elements.learningItemQuery?.value?.trim() || "";
  if (typeFilter) params.set("type", typeFilter);
  if (langFilter) params.set("language", langFilter);
  if (query) params.set("query", query);
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

function getLearningItemFilters() {
  const query = learningItemQueryParams();
  return new URLSearchParams(query ? query.slice(1) : "");
}

const { materialsRepository, learningItemsRepository, srsRepository, learningSessionsRepository, studyLogsRepository } = createRepositories({
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
  if (!elements.learningItemTableBody) return;
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

function updateLearningItemFormVisibility() {
  const type = elements.learningItemType.value;
  if (type === "reading") {
    elements.vocabFields.style.display = "none";
    elements.readingFields.style.display = "";
  } else {
    elements.vocabFields.style.display = "";
    elements.readingFields.style.display = "none";
  }
}

function fillLearningItemForm(item) {
  state.selectedLearningItemId = item.id;
  elements.learningItemId.value = item.id;
  const type = item.type === "reading" ? "reading" : "vocabulary";
  elements.learningItemType.value = type;
  elements.learningItemLanguage.value = item.language || "english";
  updateLearningItemFormVisibility();
  if (type === "reading") {
    elements.learningItemTitleReading.value = item.title || "";
    elements.learningItemContent.value = item.content || "";
    elements.learningItemTagsReading.value = formatTags(item.tags);
  } else {
    elements.learningItemTitle.value = item.title || "";
    elements.learningItemMeaning.value = item.meaning || "";
    elements.learningItemPos.value = item.pos || "";
    elements.learningItemExample.value = item.example || "";
    elements.learningItemExampleTranslation.value = item.exampleTranslation || "";
    elements.learningItemTags.value = formatTags(item.tags);
  }
}

function resetLearningItemForm() {
  state.selectedLearningItemId = "";
  elements.learningItemForm.reset();
  elements.learningItemId.value = "";
  elements.learningItemType.value = "vocabulary";
  elements.learningItemLanguage.value = "english";
  updateLearningItemFormVisibility();
  elements.learningItemTitle.focus();
}

function buildLearningItemPayload() {
  const type = elements.learningItemType.value;
  if (type === "reading") {
    return {
      type: "reading",
      language: elements.learningItemLanguage.value,
      title: elements.learningItemTitleReading.value.trim(),
      content: elements.learningItemContent.value.trim(),
      tags: parseTags(elements.learningItemTagsReading.value)
    };
  }
  return {
    type: "vocabulary",
    language: elements.learningItemLanguage.value,
    title: elements.learningItemTitle.value.trim(),
    meaning: elements.learningItemMeaning.value.trim(),
    pos: elements.learningItemPos.value.trim(),
    example: elements.learningItemExample.value.trim(),
    exampleTranslation: elements.learningItemExampleTranslation.value.trim(),
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

function setCoursesMaterialsMessage(message, isError = false) {
  if (!elements.courseMaterialsMessage) return;
  elements.courseMaterialsMessage.textContent = message;
  elements.courseMaterialsMessage.classList.toggle("auth-message--error", isError);
}

async function fetchVocabulary(language, cefrLevel, domain, limit = 30) {
  const data = await materialsRepository.getVocabulary({ language, cefrLevel, domain, limit });
  return data.items || [];
}

async function fetchReadingMaterials(language, cefrLevel, domain, limit = 5) {
  const data = await materialsRepository.getReadingMaterials({ language, cefrLevel, domain, limit });
  return data.items || [];
}

async function loadCourseDomains() {
  try {
    const data = await materialsRepository.getDomains();
    const domains = data.domains || [];
    if (!elements.courseFilterDomain || !domains.length) return;
    const current = elements.courseFilterDomain.value;
    elements.courseFilterDomain.innerHTML =
      `<option value="">すべて</option>` +
      domains
        .map((d) => `<option value="${escapeHtml(String(d.id))}">${escapeHtml(d.name_ja || String(d.id))}</option>`)
        .join("");
    if (domains.some((d) => String(d.id) === current)) {
      elements.courseFilterDomain.value = current;
    }
  } catch {
    // 取得失敗時はデフォルトの「すべて」のみ表示のまま継続
  }
}

async function loadCourseMaterials() {
  const language = elements.courseFilterLanguage?.value || "english";
  const cefrLevel = elements.courseFilterCefr?.value || "A1";
  const domain = elements.courseFilterDomain?.value || "";
  state.courseFilters = { language, cefrLevel, domain, duration: elements.courseFilterDuration?.value || "" };

  setCoursesMaterialsMessage("教材を読み込んでいます...");

  try {
    const [vocabulary, reading] = await Promise.all([
      fetchVocabulary(language, cefrLevel, domain, 30),
      fetchReadingMaterials(language, cefrLevel, domain)
    ]);
    state.dbVocabulary = vocabulary;
    state.dbReadingMaterials = reading;

    const total = vocabulary.length + reading.length;
    if (total === 0) {
      setCoursesMaterialsMessage("DBに該当する教材が見つかりませんでした。既存の学習アイテムで進めます。");
    } else {
      setCoursesMaterialsMessage(`語彙 ${vocabulary.length}件・文章 ${reading.length}件 の教材を読み込みました。`);
    }
  } catch (error) {
    state.dbVocabulary = [];
    state.dbReadingMaterials = [];
    setCoursesMaterialsMessage(
      `教材の読み込みに失敗しました。既存の学習アイテムで進めます。（${error.message}）`,
      true
    );
  }

  renderCoursePresetList();
}

function renderCoursePresetList() {
  const duration = state.courseFilters.duration;
  const visiblePresets = duration
    ? coursePresets.filter((c) => String(c.totalMinutes) === duration)
    : coursePresets;
  elements.coursePresetList.innerHTML = visiblePresets
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
    listeningHeard: "",
    listeningExpressions: "",
    listeningDifficult: "",
    readingSubStep: 0,
    readingMaterial: null,
    readingComprehensionAnswer: null,
    readingOutputText: "",
    startedAt: new Date().toISOString(),
    stepStartedAt: new Date().toISOString(),
    stepEndsAt: null
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
  const run = state.courseRun;
  if (run && !run.stepEndsAt) {
    run.stepStartedAt = new Date().toISOString();
    run.stepEndsAt = new Date(Date.now() + run.remainingSeconds * 1000).toISOString();
  }
  state.courseTimerId = window.setInterval(() => {
    syncCourseTimerFromClock();
  }, 1000);
}

function syncCourseTimerFromClock() {
  const run = state.courseRun;
  if (!run || !run.isRunning || run.isComplete) {
    return;
  }
  if (run.stepEndsAt) {
    const remaining = Math.max(0, Math.round((new Date(run.stepEndsAt) - Date.now()) / 1000));
    const prev = run.remainingSeconds;
    run.elapsedSeconds += Math.max(0, prev - remaining);
    run.remainingSeconds = remaining;
  } else {
    run.elapsedSeconds += 1;
    run.remainingSeconds -= 1;
  }
  if (run.remainingSeconds <= 0) {
    completeCurrentCourseStep();
    advanceCourseStep();
    return;
  }
  renderCourseTimer();
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
  const heardInput = document.querySelector("#course-listening-heard");
  const expressionsInput = document.querySelector("#course-listening-expressions");
  const difficultInput = document.querySelector("#course-listening-difficult");

  if (writingInput) state.courseRun.writingText = writingInput.value;
  if (noteInput) state.courseRun.note = noteInput.value;
  if (heardInput) state.courseRun.listeningHeard = heardInput.value;
  if (expressionsInput) state.courseRun.listeningExpressions = expressionsInput.value;
  if (difficultInput) state.courseRun.listeningDifficult = difficultInput.value;

  const readingOutputInput = document.querySelector("#course-reading-output");
  if (readingOutputInput) state.courseRun.readingOutputText = readingOutputInput.value;
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
  run.stepStartedAt = new Date().toISOString();
  run.stepEndsAt = new Date(Date.now() + run.remainingSeconds * 1000).toISOString();
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
  run.stepStartedAt = new Date().toISOString();
  run.stepEndsAt = new Date(Date.now() + run.remainingSeconds * 1000).toISOString();
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

// ---- 単語学習クイズ ---------------------------------------------------------

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function initVocabQuiz() {
  const items = state.learningItems.filter(
    (item) => item.type === "vocabulary" && item.title && item.meaning
  );
  state.vocabQuiz = {
    queue: shuffleArray(items),
    index: 0,
    mode: "meaning",
    phase: "input"
  };
}

function currentVocabItem() {
  const { queue, index } = state.vocabQuiz;
  return index < queue.length ? queue[index] : null;
}

function renderVocabQuizCard(container) {
  const quiz = state.vocabQuiz;
  const item = currentVocabItem();

  if (!item) {
    container.innerHTML = `
      <div class="vocab-quiz-card">
        <p>${quiz.queue.length === 0
          ? "単語タイプの学習アイテムがまだありません。「学習アイテム登録」からvocabularyタイプで登録してください。"
          : "このセッションの問題をすべて終了しました。お疲れ様でした！"}</p>
        <button type="button" class="soft-button" id="vocab-quiz-restart">最初からやり直す</button>
      </div>
    `;
    container.querySelector("#vocab-quiz-restart")?.addEventListener("click", () => {
      initVocabQuiz();
      renderVocabQuizCard(container);
    });
    return;
  }

  const progress = `${quiz.index + 1} / ${quiz.queue.length}`;

  if (quiz.mode === "meaning" && quiz.phase === "input") {
    container.innerHTML = `
      <div class="vocab-quiz-card">
        <p class="vocab-quiz-progress muted">${escapeHtml(progress)} ・ 意味入力</p>
        <p class="vocab-quiz-word">${escapeHtml(item.title)}</p>
        <label>日本語の意味を入力してください
          <textarea id="vocab-quiz-input" rows="2" placeholder="意味を入力..."></textarea>
        </label>
        <div class="mini-actions">
          <button type="button" id="vocab-quiz-reveal">答えを確認</button>
        </div>
      </div>
    `;
    container.querySelector("#vocab-quiz-reveal").addEventListener("click", () => {
      quiz.phase = "revealed";
      renderVocabQuizCard(container);
    });
  } else if (quiz.mode === "meaning" && quiz.phase === "revealed") {
    const userInput = container.querySelector("#vocab-quiz-input")?.value || "";
    container.innerHTML = `
      <div class="vocab-quiz-card">
        <p class="vocab-quiz-progress muted">${escapeHtml(progress)} ・ 意味入力</p>
        <p class="vocab-quiz-word">${escapeHtml(item.title)}</p>
        <div class="vocab-quiz-answer-block">
          <p class="muted">あなたの回答:</p>
          <p>${escapeHtml(userInput || "（未入力）")}</p>
          <p class="muted">正解:</p>
          <p class="vocab-quiz-correct-answer">${escapeHtml(item.meaning)}</p>
        </div>
        <p>正解でしたか？</p>
        <div class="mini-actions">
          <button type="button" id="vocab-quiz-correct">正解</button>
          <button type="button" id="vocab-quiz-wrong" class="soft-button">不正解</button>
        </div>
      </div>
    `;
    container.querySelector("#vocab-quiz-correct").addEventListener("click", () => advanceVocabQuiz(container, true));
    container.querySelector("#vocab-quiz-wrong").addEventListener("click", () => advanceVocabQuiz(container, false));
  } else if (quiz.mode === "spelling" && quiz.phase === "input") {
    container.innerHTML = `
      <div class="vocab-quiz-card">
        <p class="vocab-quiz-progress muted">${escapeHtml(progress)} ・ スペル入力</p>
        <p class="muted">音声を聞いて、スペルを入力してください</p>
        <div class="mini-actions">
          <button type="button" id="vocab-quiz-play" class="soft-button">▶ 音声を再生</button>
        </div>
        <label>スペルを入力
          <input type="text" id="vocab-quiz-input" placeholder="スペルを入力..." autocomplete="off" />
        </label>
        <div class="mini-actions">
          <button type="button" id="vocab-quiz-reveal">答えを確認</button>
        </div>
      </div>
    `;
    container.querySelector("#vocab-quiz-play").addEventListener("click", () => {
      speakLearningItem(item, { rate: 0.8 });
    });
    container.querySelector("#vocab-quiz-reveal").addEventListener("click", () => {
      quiz.phase = "revealed";
      renderVocabQuizCard(container);
    });
  } else if (quiz.mode === "spelling" && quiz.phase === "revealed") {
    const userInput = container.querySelector("#vocab-quiz-input")?.value || "";
    const isCorrect = userInput.trim().toLowerCase() === item.title.trim().toLowerCase();
    container.innerHTML = `
      <div class="vocab-quiz-card">
        <p class="vocab-quiz-progress muted">${escapeHtml(progress)} ・ スペル入力</p>
        <div class="vocab-quiz-answer-block">
          <p class="muted">あなたの回答:</p>
          <p>${escapeHtml(userInput || "（未入力）")}</p>
          <p class="muted">正解:</p>
          <p class="vocab-quiz-correct-answer">${escapeHtml(item.title)}</p>
          ${item.meaning ? `<p class="muted">意味: ${escapeHtml(item.meaning)}</p>` : ""}
        </div>
        <p>正解でしたか？${isCorrect ? " ✓ スペルが一致しています" : " ✗ スペルが異なります"}</p>
        <div class="mini-actions">
          <button type="button" id="vocab-quiz-correct">正解</button>
          <button type="button" id="vocab-quiz-wrong" class="soft-button">不正解</button>
        </div>
      </div>
    `;
    container.querySelector("#vocab-quiz-correct").addEventListener("click", () => advanceVocabQuiz(container, true));
    container.querySelector("#vocab-quiz-wrong").addEventListener("click", () => advanceVocabQuiz(container, false));
  }
}

async function advanceVocabQuiz(container, correct) {
  const quiz = state.vocabQuiz;
  const item = currentVocabItem();
  if (!item) return;

  // SRS更新
  try {
    const rating = correct ? "normal" : "forgot";
    await srsRepository.updateSrsAfterReview(item.id, rating).catch(() => null);
  } catch (_) { /* SRSデータがなければスキップ */ }

  // コースの復習記録を更新
  if (state.courseRun) {
    state.courseRun.reviewedItemIds = uniqueValues([...state.courseRun.reviewedItemIds, item.id]);
    if (!correct) {
      state.courseRun.mistakeItemIds = uniqueValues([...state.courseRun.mistakeItemIds, item.id]);
    }
  }

  // 次の問題へ・モードを交互に切り替え
  quiz.index += 1;
  quiz.mode = quiz.mode === "meaning" ? "spelling" : "meaning";
  quiz.phase = "input";

  renderVocabQuizCard(container);
}

// ---- DB教材タブ -------------------------------------------------------------

async function loadDbMaterialsTab() {
  const language = document.querySelector("#db-materials-language")?.value || "english";
  const cefrLevel = document.querySelector("#db-materials-cefr")?.value || "A1";
  const listEl = document.querySelector("#db-materials-list");
  if (!listEl) return;

  listEl.innerHTML = "<p>読み込み中...</p>";
  try {
    const data = await materialsRepository.getVocabulary({ language, cefrLevel, domain: "", limit: 50 });
    const items = data.items || [];
    if (!items.length) {
      listEl.innerHTML = "<p>該当する教材がありません。</p>";
      return;
    }
    listEl.innerHTML = `
      <div class="db-materials-grid">
        ${items.map((item) => `
          <div class="db-material-row">
            <div>
              <strong>${escapeHtml(item.word || item.title || "")}</strong>
              <span class="eyebrow"> ${escapeHtml(item.cefr_level || "")}</span>
              <p class="muted">${escapeHtml(item.meaning_ja || item.meaning || "")}</p>
              ${item.example ? `<p class="course-item-example">${escapeHtml(item.example)}</p>` : ""}
            </div>
            <button type="button" class="soft-button db-import-btn" data-id="${escapeHtml(String(item.id))}">＋追加</button>
          </div>
        `).join("")}
      </div>
    `;
    listEl.querySelectorAll(".db-import-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const itemId = btn.dataset.id;
        const vocab = items.find((v) => String(v.id) === itemId);
        if (!vocab) return;
        btn.disabled = true;
        btn.textContent = "追加中...";
        try {
          await importDbVocabAsLearningItem(vocab);
          btn.textContent = "✓ 追加済み";
        } catch (err) {
          btn.disabled = false;
          btn.textContent = "＋追加";
          setStatus(err.message || "追加に失敗しました。");
        }
      });
    });
  } catch (err) {
    listEl.innerHTML = `<p class="muted">${escapeHtml(err.message || "読み込みに失敗しました。")}</p>`;
  }
}

async function importDbVocabAsLearningItem(vocab) {
  const payload = {
    type: "vocabulary",
    language: vocab.language || "english",
    title: vocab.word || vocab.title || "",
    meaning: vocab.meaning_ja || vocab.meaning || "",
    content: vocab.definition || vocab.content || "",
    example: vocab.example || "",
    exampleTranslation: vocab.example_ja || vocab.example_translation || "",
    note: `DB教材 (${vocab.cefr_level || ""})`,
    tags: [vocab.cefr_level || ""].filter(Boolean)
  };
  const result = await learningItemsRepository.createLearningItem(payload);
  const newItem = result.item;
  if (newItem?.id) {
    await srsRepository.createInitialSrsData(newItem.id).catch(() => null);
  }
  state.learningItems = [newItem, ...state.learningItems];
  setStatus(`「${payload.title}」を学習アイテムに追加しました。`);
}

async function loadLocalReadingMaterials() {
  try {
    const data = await fetchJson("/api/reading-materials");
    state.localReadingMaterials = data.items || [];
  } catch (_) {
    state.localReadingMaterials = [];
  }
}

function selectReadingMaterial() {
  return state.localReadingMaterials.find((m) => !m.completed) || null;
}

const READING_SUB_STEPS = [
  { key: "firstReading",       label: "① 初読",               description: "辞書を使わず、止まらずに読みましょう。完璧に理解しようとせず、全体の流れを掴むことを目標にしましょう。" },
  { key: "comprehension",      label: "② 確認設問",           description: "初読でどれくらい意味を掴めたか確認します。" },
  { key: "intensiveReading",   label: "③ 精読・語彙整理",     description: "語彙・文法・構文を確認します。ここでは止まって確認してください。" },
  { key: "rereading",          label: "④ 再読",               description: "今度は初読より少し速く読むことを目標にしましょう。意味をかたまりで処理することを意識してください。" },
  { key: "oralPractice",       label: "⑤ 音読・シャドーイング", description: "本文を見ながら声に出して読んでください。余裕があればシャドーイングも行いましょう。" },
  { key: "oneSentenceOutput",  label: "⑥ 1文アウトプット",    description: "本文で使われていた表現を1つ選び、自分の生活や考えに置き換えて1文書いてください。" }
];

function renderReadingCourseStep(container) {
  const run = state.courseRun;
  if (!run) return;

  if (!run.readingMaterial) {
    run.readingMaterial = selectReadingMaterial();
  }

  const mat = run.readingMaterial;
  const subStep = run.readingSubStep;
  const stepInfo = READING_SUB_STEPS[subStep];

  if (!mat) {
    container.innerHTML = `
      <div class="reading-step-ui">
        <p class="muted">読解教材が登録されていません。</p>
        <p>「単語登録 / 文章登録」ページの「文章登録」タブからChatGPT出力JSONを貼り付けて登録してください。</p>
      </div>
    `;
    run.renderedStepIndex = run.currentStepIndex;
    return;
  }

  const subStepNav = `
    <div class="reading-substep-nav">
      ${READING_SUB_STEPS.map((s, i) => `<span class="reading-substep-badge ${i === subStep ? "active" : i < subStep ? "done" : ""}">${s.label}</span>`).join("")}
    </div>
  `;

  let content = "";

  if (subStep === 0) {
    const inst = mat.firstReading?.instruction || stepInfo.description;
    const target = mat.firstReading?.targetSeconds || 90;
    content = `
      <section class="section-card">
        <h4>${stepInfo.label}</h4>
        <p>${escapeHtml(inst)}</p>
        <p class="muted">目標時間：${Math.ceil(target / 60)}分程度</p>
      </section>
      <section class="section-card">
        <h4>本文</h4>
        <pre class="reading-text">${escapeHtml(mat.originalText || "")}</pre>
      </section>
      <div class="mini-actions"><button type="button" id="reading-substep-next" class="soft-button">読み終えた → 確認設問へ</button></div>
    `;
  } else if (subStep === 1) {
    const questions = mat.comprehensionQuestions || [];
    if (!questions.length) {
      content = `
        <section class="section-card">
          <h4>${stepInfo.label}</h4>
          <p class="muted">確認設問が登録されていません。</p>
        </section>
        <div class="mini-actions"><button type="button" id="reading-substep-next" class="soft-button">精読・語彙整理へ</button></div>
      `;
    } else {
      const q = questions[0];
      const answered = run.readingComprehensionAnswer;
      content = `
        <section class="section-card">
          <h4>${stepInfo.label}</h4>
          <p>${escapeHtml(q.question || "")}</p>
          <div class="comprehension-choices">
            ${(q.choices || []).map((choice) => `
              <button type="button" class="comprehension-choice ${answered === choice ? (choice === q.answer ? "correct" : "wrong") : ""}" data-choice="${escapeHtml(choice)}" ${answered ? "disabled" : ""}>
                ${escapeHtml(choice)}
              </button>
            `).join("")}
          </div>
          ${answered ? `
            <p class="${answered === q.answer ? "reading-correct" : "reading-wrong"}">
              ${answered === q.answer ? "✓ 正解" : `✗ 不正解（正解：${escapeHtml(q.answer || "")}）`}
            </p>
            ${q.explanation ? `<p class="muted">${escapeHtml(q.explanation)}</p>` : ""}
          ` : ""}
        </section>
        ${answered ? `<div class="mini-actions"><button type="button" id="reading-substep-next" class="soft-button">精読・語彙整理へ</button></div>` : ""}
      `;
    }
  } else if (subStep === 2) {
    const ir = mat.intensiveReading || {};
    content = `
      <section class="section-card">
        <h4>${stepInfo.label}</h4>
      </section>
      <section class="section-card">
        <h4>本文</h4>
        <pre class="reading-text">${escapeHtml(mat.originalText || "")}</pre>
      </section>
      <section class="section-card">
        <h4>日本語訳</h4>
        <p>${escapeHtml(mat.japaneseTranslation || "")}</p>
      </section>
      ${ir.vocabulary?.length ? `
        <section class="section-card">
          <h4>重要語彙</h4>
          <div class="vocab-chips">
            ${ir.vocabulary.map((v) => `
              <div class="vocab-chip">
                <strong>${escapeHtml(v.word || "")}</strong>
                <span class="muted">（${escapeHtml(v.partOfSpeech || "")}）</span>
                <span>${escapeHtml(v.meaningJa || "")}</span>
                ${v.note ? `<p class="muted">${escapeHtml(v.note)}</p>` : ""}
              </div>
            `).join("")}
          </div>
        </section>
      ` : ""}
      ${ir.chunks?.length ? `
        <section class="section-card">
          <h4>チャンク・フレーズ</h4>
          <div class="chunk-list">
            ${ir.chunks.map((c) => `
              <div class="chunk-item">
                <code>${escapeHtml(c.chunk || "")}</code>
                <span>→ ${escapeHtml(c.meaningJa || "")}</span>
                ${c.note ? `<p class="muted">${escapeHtml(c.note)}</p>` : ""}
              </div>
            `).join("")}
          </div>
        </section>
      ` : ""}
      ${ir.grammarPoints?.length ? `
        <section class="section-card">
          <h4>文法ポイント</h4>
          ${ir.grammarPoints.map((g) => `
            <div class="grammar-point">
              <strong>${escapeHtml(g.title || "")}</strong>
              <p>${escapeHtml(g.explanationJa || "")}</p>
              ${g.example ? `<p class="muted">${escapeHtml(g.example)}</p>` : ""}
            </div>
          `).join("")}
        </section>
      ` : ""}
      ${ir.notes?.length ? `
        <section class="section-card">
          <h4>補足メモ</h4>
          <ul>${ir.notes.map((n) => `<li>${escapeHtml(n)}</li>`).join("")}</ul>
        </section>
      ` : ""}
      <div class="mini-actions"><button type="button" id="reading-substep-next" class="soft-button">再読へ</button></div>
    `;
  } else if (subStep === 3) {
    const target = mat.rereading?.targetSeconds || 60;
    const inst = mat.rereading?.instruction || stepInfo.description;
    content = `
      <section class="section-card">
        <h4>${stepInfo.label}</h4>
        <p>${escapeHtml(inst)}</p>
        <p class="muted">目標時間：初読より速く（約${Math.ceil(target / 60)}分程度）</p>
      </section>
      <section class="section-card">
        <h4>本文</h4>
        <pre class="reading-text">${escapeHtml(mat.originalText || "")}</pre>
      </section>
      <div class="mini-actions"><button type="button" id="reading-substep-next" class="soft-button">読み終えた → 音読へ</button></div>
    `;
  } else if (subStep === 4) {
    const oral = mat.oralPractice || {};
    const inst = oral.instruction || stepInfo.description;
    const focuses = oral.focusChunks || [];
    content = `
      <section class="section-card">
        <h4>${stepInfo.label}</h4>
        <p>${escapeHtml(inst)}</p>
        ${focuses.length ? `
          <p class="muted">特に意識するチャンク：</p>
          <div class="focus-chunks">${focuses.map((c) => `<code>${escapeHtml(c)}</code>`).join("")}</div>
        ` : ""}
      </section>
      <section class="section-card">
        <h4>本文</h4>
        <pre class="reading-text">${escapeHtml(mat.originalText || "")}</pre>
        <div class="mini-actions" style="margin-top:0.75rem">
          <button type="button" id="reading-tts-play" class="soft-button">▶ 読み上げ</button>
        </div>
      </section>
      <div class="mini-actions"><button type="button" id="reading-substep-next" class="soft-button">音読完了 → 1文アウトプットへ</button></div>
    `;
  } else if (subStep === 5) {
    const out = mat.oneSentenceOutput || {};
    const inst = out.instruction || stepInfo.description;
    const exprs = out.recommendedExpressions || [];
    content = `
      <section class="section-card">
        <h4>${stepInfo.label}</h4>
        <p>${escapeHtml(inst)}</p>
        ${exprs.length ? `
          <p class="muted">使える表現：</p>
          <div class="focus-chunks">${exprs.map((e) => `<code>${escapeHtml(e)}</code>`).join("")}</div>
        ` : ""}
      </section>
      <label>
        1文アウトプット
        <textarea id="course-reading-output" rows="4" placeholder="本文の表現を使って1文書いてください...">${escapeHtml(run.readingOutputText || "")}</textarea>
      </label>
    `;
  }

  container.innerHTML = `
    <div class="reading-step-ui">
      <p class="eyebrow">${escapeHtml(mat.title || "読解教材")} ${mat.level ? `/ ${escapeHtml(mat.level)}` : ""}</p>
      ${subStepNav}
      ${content}
    </div>
  `;

  container.querySelector("#reading-substep-next")?.addEventListener("click", () => {
    syncCourseTextInputs();
    run.readingSubStep = Math.min(run.readingSubStep + 1, 5);
    renderReadingCourseStep(container);
  });

  container.querySelectorAll(".comprehension-choice").forEach((btn) => {
    btn.addEventListener("click", () => {
      run.readingComprehensionAnswer = btn.dataset.choice;
      renderReadingCourseStep(container);
    });
  });

  container.querySelector("#reading-tts-play")?.addEventListener("click", () => {
    const lang = mat.language === "zh" ? "zh-TW" : "en-US";
    speakText(mat.originalText || "", { language: lang });
  });

  container.querySelector("#course-reading-output")?.addEventListener("input", syncCourseTextInputs);

  run.renderedStepIndex = run.currentStepIndex;
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

  if (step.type === "vocab-quiz") {
    initVocabQuiz();
    renderVocabQuizCard(elements.courseStepUi);
    run.renderedStepIndex = run.currentStepIndex;
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
    const cefrLevel = state.courseFilters.cefrLevel || "A1";
    const isEasy = ["A1", "A2"].includes(cefrLevel.toUpperCase());
    const guideText = isEasy ? BBC_LISTENING_CONFIG.guideByLevel.easy : BBC_LISTENING_CONFIG.guideByLevel.medium;
    const run = state.courseRun;

    elements.courseStepUi.innerHTML = `
      <div class="course-step-ui-grid">
        <section class="section-card">
          <p>この時間はBBC Learning Englishでリスニング学習を行います。${guideText}${BBC_LISTENING_CONFIG.timerNote}</p>
          <div class="mini-actions" style="margin-top:0.75rem">
            <a
              href="${BBC_LISTENING_CONFIG.url}"
              target="_blank"
              rel="noopener noreferrer"
              class="soft-button"
              id="bbc-open-link"
            >${BBC_LISTENING_CONFIG.label}</a>
          </div>
        </section>
        <section class="section-card">
          <h4>リスニングメモ</h4>
          <label>
            聞いた内容メモ
            <textarea id="course-listening-heard" rows="3" placeholder="どんな内容・トピックだったか">${escapeHtml(run.listeningHeard || "")}</textarea>
          </label>
          <label>
            聞き取れた表現
            <textarea id="course-listening-expressions" rows="3" placeholder="聞き取れたフレーズや表現">${escapeHtml(run.listeningExpressions || "")}</textarea>
          </label>
          <label>
            難しかった語句
            <textarea id="course-listening-difficult" rows="3" placeholder="聞き取れなかった語句・難しかった表現">${escapeHtml(run.listeningDifficult || "")}</textarea>
          </label>
        </section>
      </div>
    `;
    run.renderedStepIndex = run.currentStepIndex;

    ["course-listening-heard", "course-listening-expressions", "course-listening-difficult"].forEach((id) => {
      document.querySelector(`#${id}`)?.addEventListener("input", syncCourseTextInputs);
    });
    return;
  }

  if (step.type === "reading") {
    run.readingSubStep = 0;
    run.readingComprehensionAnswer = null;
    run.renderedStepIndex = run.currentStepIndex; // タイマーループの重複呼び出しを防ぐ
    loadLocalReadingMaterials().then(() => {
      if (!run.readingMaterial) run.readingMaterial = selectReadingMaterial();
      renderReadingCourseStep(elements.courseStepUi);
    });
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
    note: run.note,
    readingOutputText: run.readingOutputText,
    readingMaterialTitle: run.readingMaterial?.title || "",
    listeningHeard: run.listeningHeard,
    listeningExpressions: run.listeningExpressions,
    listeningDifficult: run.listeningDifficult
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
    ${payload.readingMaterialTitle ? `<article class="section-card"><h4>読解教材</h4><p>${escapeHtml(payload.readingMaterialTitle)}</p></article>` : ""}
    ${payload.readingOutputText ? `<article class="section-card"><h4>1文アウトプット</h4><p>${escapeHtml(payload.readingOutputText)}</p></article>` : ""}
    <article class="section-card"><h4>作文内容</h4><p>${escapeHtml(payload.writingText || "未入力")}</p></article>
    <article class="section-card"><h4>今日のメモ</h4><p>${escapeHtml(payload.note || "未入力")}</p></article>
    ${payload.listeningHeard || payload.listeningExpressions || payload.listeningDifficult ? `
    <article class="section-card">
      <h4>リスニングメモ（BBC Learning English）</h4>
      <p><strong>聞いた内容：</strong>${escapeHtml(payload.listeningHeard || "未入力")}</p>
      <p><strong>聞き取れた表現：</strong>${escapeHtml(payload.listeningExpressions || "未入力")}</p>
      <p><strong>難しかった語句：</strong>${escapeHtml(payload.listeningDifficult || "未入力")}</p>
    </article>` : ""}
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


// Home course-time buttons (30 / 60 / 90 min)
document.querySelectorAll(".course-time-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const duration = button.dataset.duration;
    const durationSelect = document.querySelector("#course-filter-duration");
    if (durationSelect && duration) durationSelect.value = duration;
    switchPage("course");
  });
});

// Back button in inner topbar
const backBtn = document.querySelector(".back-btn[data-go='home']");
if (backBtn) backBtn.addEventListener("click", () => switchPage("home"));

// Update home streak badge from history
function updateHomeStreak() {
  const streakEl = document.getElementById("home-streak-num");
  const badgeEl  = document.getElementById("home-streak-badge");
  if (!streakEl) return;
  const streakDays = document.getElementById("history-streak-days");
  if (streakDays) {
    const val = parseInt(streakDays.textContent, 10) || 0;
    streakEl.textContent = val;
    if (badgeEl) badgeEl.style.display = val > 0 ? "" : "none";
  }
}
// refresh streak when history loads
const origLoadHistory = typeof loadHistory === "function" ? loadHistory : null;
document.addEventListener("historyLoaded", updateHomeStreak);

elements.learningItemSearch?.addEventListener("click", loadLearningItems);
document.querySelector("#vocab-list-search")?.addEventListener("click", loadVocabListPage);
document.querySelector("#vocab-list-query")?.addEventListener("keydown", (e) => { if (e.key === "Enter") loadVocabListPage(); });
document.querySelector("#vocab-list-language")?.addEventListener("change", loadVocabListPage);
document.querySelector("#reading-list-refresh")?.addEventListener("click", loadReadingListPage);
elements.learningItemType.addEventListener("change", updateLearningItemFormVisibility);
updateLearningItemFormVisibility();

elements.copyVocabPrompt.addEventListener("click", () => {
  const prompt = `あなたは言語学習教材を作成する専門家です。

これから私が、覚えたい単語・表現を複数並べます。
それぞれについて、言語学習アプリに登録しやすいように、必ず指定された形式で出力してください。

# 目的

単語を単体で覚えるのではなく、以下の情報をセットにして学習できる教材を作ることが目的です。

- 単語・表現
- 日本語訳
- 品詞
- 自然な例文
- 例文の日本語訳
- コロケーション
- 補足説明
- 使われる場面
- CEFR目安
- 領域

# 出力ルール

以下の形式で、1単語につき1行で出力してください。

単語 / 日本語訳 / 品詞 / 例文 / 例文の日本語訳 / コロケーション / 補足 / 使われる場面 / CEFR目安 / 領域

# 重要な形式ルール

- 各項目は必ず半角スラッシュ「 / 」で区切ってください。
- 1単語につき必ず1行で出力してください。
- 表やMarkdownの表形式にはしないでください。
- 番号は付けないでください。
- 箇条書きにしないでください。
- 余計な説明文、前置き、後書きは書かないでください。
- 出力はデータ行だけにしてください。
- 例文は、実際に日常会話・読解・作文で使いやすい自然な文にしてください。
- 例文では、その単語がよく一緒に使われる語句、つまりコロケーションを意識してください。
- 日本語訳は直訳ではなく、学習者が理解しやすい自然な訳にしてください。
- CEFR目安は A1 / A2 / B1 / B2 / C1 / C2 のいずれかで出してください。
- 領域は、以下の10領域から最も近いものを1つ選んでください。

# 領域一覧

1. 社会・家庭
2. 教育・連絡
3. 仕事
4. 買い物・消費
5. 文化・余暇
6. 科学技術・メディア
7. 健康
8. 言語圏の文化
9. 先端技術
10. 環境

# 品詞の書き方

英語の場合は、以下のように日本語で書いてください。

名詞、動詞、形容詞、副詞、前置詞、接続詞、代名詞、熟語、句動詞、表現

# 補足の書き方

補足には、必要に応じて以下のような情報を書いてください。

- 似た単語との違い
- フォーマル / カジュアルの違い
- よく使われる文脈
- 注意すべき語法
- 可算 / 不可算
- 自動詞 / 他動詞
- 前置詞との組み合わせ

# コロケーションの書き方

コロケーションには、その単語と一緒に使われやすい語句を2〜4個ほど書いてください。

例：
make a decision, an important decision, a quick decision

# 出力例

apple / りんご / 名詞 / I eat an apple every morning. / 私は毎朝りんごを食べます。 / eat an apple, a red apple, apple juice / 果物を表す基本語。日常会話や食べ物の話題でよく使う。 / 食事・買い物・日常会話 / A1 / 買い物・消費

# 私が登録したい単語・表現

ここに単語を並べます。

[ここに単語を入力]`;
  navigator.clipboard.writeText(prompt).then(() => {
    setStatus("プロンプトをクリップボードにコピーしました。ChatGPT / Claude に貼り付けてください。");
  });
});

elements.vocabBulkImport.addEventListener("click", async () => {
  const raw = elements.vocabBulkPaste.value.trim();
  if (!raw) { setStatus("AI出力を貼り付けてください。"); return; }
  const language = elements.learningItemLanguage.value;
  const lines = raw.split("\n").filter(Boolean);
  const items = lines.map((line) => {
    const cols = line.split(" / ");
    return {
      type: "vocabulary",
      language,
      title: (cols[0] || "").trim(),
      meaning: (cols[1] || "").trim(),
      pos: (cols[2] || "").trim(),
      example: (cols[3] || "").trim(),
      exampleTranslation: (cols[4] || "").trim(),
      collocation: (cols[5] || "").trim(),
      note: (cols[6] || "").trim(),
      scene: (cols[7] || "").trim(),
      cefr: (cols[8] || "").trim(),
      domain: (cols[9] || "").trim(),
      tags: [(cols[8] || "").trim(), (cols[9] || "").trim()].filter(Boolean)
    };
  }).filter((item) => item.title);

  if (!items.length) { setStatus("有効な単語が見つかりませんでした。タブ区切りか確認してください。"); return; }

  await withBusy(async () => {
    for (const item of items) {
      const data = await learningItemsRepository.createLearningItem(item);
      await createInitialSrsData(data.item.id);
    }
    elements.vocabBulkPaste.value = "";
    await loadLearningItems();
    setStatus(`${items.length}件の単語を一括登録しました。`);
  }, "単語を一括登録しています...");
});

// 文章登録 JSON 貼り付け
document.querySelector("#reading-material-import")?.addEventListener("click", async () => {
  const raw = (document.querySelector("#reading-material-json")?.value || "").trim();
  if (!raw) { setStatus("JSONを貼り付けてください。"); return; }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (_) {
    setStatus("JSONの形式が正しくありません。確認してください。", true);
    return;
  }

  if (!parsed.originalText && !parsed.title) {
    setStatus("originalTextまたはtitleが含まれていません。", true);
    return;
  }

  await withBusy(async () => {
    const data = await fetchJson("/api/reading-materials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    });
    document.querySelector("#reading-material-json").value = "";
    await loadReadingMaterialsList();
    setStatus(`「${data.item.title || "文章教材"}」を登録しました。`);
  }, "文章教材を登録しています...");
});

async function loadReadingMaterialsList() {
  const listEl = document.querySelector("#reading-materials-list");
  if (!listEl) return;
  try {
    const data = await fetchJson("/api/reading-materials");
    const items = data.items || [];
    state.localReadingMaterials = items;
    if (!items.length) {
      listEl.innerHTML = "<tr><td colspan='4'>登録された文章教材はまだありません。</td></tr>";
      return;
    }
    listEl.innerHTML = items.map((item) => `
      <tr class="${item.completed ? "reading-material-completed" : ""}">
        <td>
          <strong>${escapeHtml(item.title || "")}</strong>
          ${item.completed ? ' <span class="completed-badge">修了</span>' : ""}
        </td>
        <td>${escapeHtml(item.language || "")}</td>
        <td>${escapeHtml(item.level || "")}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="soft-button reading-material-toggle-complete" data-id="${escapeHtml(item.id)}" data-completed="${item.completed ? "1" : "0"}">
              ${item.completed ? "修了解除" : "修了にする"}
            </button>
            <button type="button" class="soft-button reading-material-delete" data-id="${escapeHtml(item.id)}">削除</button>
          </div>
        </td>
      </tr>
    `).join("");
    listEl.querySelectorAll(".reading-material-toggle-complete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const nowCompleted = btn.dataset.completed === "1";
        await withBusy(async () => {
          await fetchJson(`/api/reading-materials/${btn.dataset.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !nowCompleted })
          });
          await loadReadingMaterialsList();
          setStatus(nowCompleted ? "修了を解除しました。" : "修了にしました。次回の読解パートでは選択されません。");
        }, "更新しています...");
      });
    });

    listEl.querySelectorAll(".reading-material-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await withBusy(async () => {
          await fetchJson(`/api/reading-materials/${btn.dataset.id}`, { method: "DELETE" });
          await loadReadingMaterialsList();
          setStatus("文章教材を削除しました。");
        }, "削除しています...");
      });
    });
  } catch (err) {
    listEl.innerHTML = `<tr><td colspan='4'>${escapeHtml(err.message)}</td></tr>`;
  }
}

// ---- 単語一覧ページ ----------------------------------------------------------

async function loadVocabListPage() {
  const listEl = document.querySelector("#vocab-list-body");
  if (!listEl) return;

  const query = (document.querySelector("#vocab-list-query")?.value || "").toLowerCase();
  const language = document.querySelector("#vocab-list-language")?.value || "";

  try {
    const data = await learningItemsRepository.getLearningItems();
    const items = (data.items || []).filter((item) => {
      if (item.type !== "vocabulary") return false;
      if (language && item.language !== language) return false;
      if (query) {
        const haystack = [item.title, item.meaning, item.example, item.note].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    if (!items.length) {
      listEl.innerHTML = `<tr><td colspan="5">登録済みの単語はまだありません。</td></tr>`;
      return;
    }

    listEl.innerHTML = items.map((item) => `
      <tr>
        <td><strong>${escapeHtml(item.title || "")}</strong></td>
        <td>${escapeHtml(item.meaning || "")}</td>
        <td>${escapeHtml(languageLabel(item.language))}</td>
        <td>${escapeHtml(item.example || "")}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="soft-button vocab-list-speak" data-id="${escapeHtml(item.id)}">読み上げ</button>
            <button type="button" class="soft-button vocab-list-delete" data-id="${escapeHtml(item.id)}">削除</button>
          </div>
        </td>
      </tr>
    `).join("");

    listEl.querySelectorAll(".vocab-list-speak").forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = items.find((i) => i.id === btn.dataset.id);
        if (item) speakLearningItem(item);
      });
    });
    listEl.querySelectorAll(".vocab-list-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await deleteLearningItem(btn.dataset.id);
        await loadVocabListPage();
      });
    });
  } catch (err) {
    listEl.innerHTML = `<tr><td colspan="5">${escapeHtml(err.message || "読み込みに失敗しました。")}</td></tr>`;
  }
}

// ---- 文章一覧ページ ----------------------------------------------------------

async function loadReadingListPage() {
  const listEl = document.querySelector("#reading-list-body");
  if (!listEl) return;

  try {
    const data = await fetchJson("/api/reading-materials");
    const items = data.items || [];
    state.localReadingMaterials = items;

    if (!items.length) {
      listEl.innerHTML = `<tr><td colspan="5">登録済みの文章はまだありません。</td></tr>`;
      return;
    }

    listEl.innerHTML = items.map((item) => `
      <tr class="${item.completed ? "reading-material-completed" : ""}">
        <td>
          <strong>${escapeHtml(item.title || "")}</strong>
          ${item.completed ? ' <span class="completed-badge">修了</span>' : ""}
        </td>
        <td>${escapeHtml(item.language || "")}</td>
        <td>${escapeHtml(item.level || "")}</td>
        <td>${escapeHtml(item.domain || "")}</td>
        <td>
          <div class="table-actions">
            <button type="button" class="soft-button reading-list-toggle" data-id="${escapeHtml(item.id)}" data-completed="${item.completed ? "1" : "0"}">
              ${item.completed ? "修了解除" : "修了にする"}
            </button>
            <button type="button" class="soft-button reading-list-delete" data-id="${escapeHtml(item.id)}">削除</button>
          </div>
        </td>
      </tr>
    `).join("");

    listEl.querySelectorAll(".reading-list-toggle").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const nowCompleted = btn.dataset.completed === "1";
        await withBusy(async () => {
          await fetchJson(`/api/reading-materials/${btn.dataset.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed: !nowCompleted })
          });
          await loadReadingListPage();
          setStatus(nowCompleted ? "修了を解除しました。" : "修了にしました。読解パートでは選択されません。");
        }, "更新しています...");
      });
    });

    listEl.querySelectorAll(".reading-list-delete").forEach((btn) => {
      btn.addEventListener("click", async () => {
        await withBusy(async () => {
          await fetchJson(`/api/reading-materials/${btn.dataset.id}`, { method: "DELETE" });
          await loadReadingListPage();
          setStatus("文章教材を削除しました。");
        }, "削除しています...");
      });
    });
  } catch (err) {
    listEl.innerHTML = `<tr><td colspan="5">${escapeHtml(err.message || "読み込みに失敗しました。")}</td></tr>`;
  }
}

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

elements.courseFilterLanguage?.addEventListener("change", () => {
  state.courseFilters.language = elements.courseFilterLanguage.value;
  renderCoursePresetList();
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
  const run = state.courseRun;
  if (run) {
    run.isRunning = true;
    run.stepEndsAt = new Date(Date.now() + run.remainingSeconds * 1000).toISOString();
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
  const run = state.courseRun;
  if (run) {
    run.remainingSeconds += 180;
    if (run.stepEndsAt) {
      run.stepEndsAt = new Date(new Date(run.stepEndsAt).getTime() + 180000).toISOString();
    }
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

elements.loadReviewCard?.addEventListener("click", loadReviewItems);

// タブ切り替えは index.html の DOMContentLoaded で処理
document.querySelector("#db-materials-search")?.addEventListener("click", loadDbMaterialsTab);
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

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    syncCourseTimerFromClock();
  }
});

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
