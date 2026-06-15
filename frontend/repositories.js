function formatSupabaseError(action, error) {
  return `Supabase${action}に失敗しました: ${error.message || "詳細不明のエラー"}`;
}

function isSupabaseNetworkError(error) {
  const message = String(error?.message || error || "").toLowerCase();
  return (
    message.includes("failed to fetch") ||
    message.includes("networkerror") ||
    message.includes("network request failed")
  );
}

function normalizeLearningLanguage(language = "") {
  const normalized = String(language || "").toLowerCase();
  if (normalized === "en") return "english";
  if (normalized === "zh") return "chinese";
  return normalized || "english";
}

function learningLanguageDbValues(language = "") {
  const normalized = normalizeLearningLanguage(language);
  if (normalized === "english") return ["english", "en"];
  if (normalized === "chinese") return ["chinese", "zh"];
  return [normalized];
}

function learningLanguagePostgrestIn(language = "") {
  return `in.(${learningLanguageDbValues(language).join(",")})`;
}

function noteValueForLabel(note = "", label = "") {
  const prefix = `${label}:`;
  return String(note || "")
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.startsWith(prefix))
    ?.slice(prefix.length)
    .trim() || "";
}

function assertSupabaseUser(user) {
  if (!user?.id) {
    throw new Error("認証状態を取得できませんでした。ログインし直してください。");
  }
}

function toLearningItem(row) {
  return {
    id: row.id,
    type: row.type || "vocabulary",
    language: normalizeLearningLanguage(row.language || "english"),
    title: row.title || "",
    meaning: row.meaning || "",
    pos: row.pos || noteValueForLabel(row.note, "品詞"),
    pinyin: row.pinyin || noteValueForLabel(row.note, "拼音"),
    examplePinyin: row.example_pinyin || noteValueForLabel(row.note, "例文拼音"),
    collocation: row.collocation || noteValueForLabel(row.note, "コロケーション"),
    scene: row.scene || noteValueForLabel(row.note, "使う場面"),
    cefr: row.cefr || noteValueForLabel(row.note, "レベル"),
    domain: row.domain || noteValueForLabel(row.note, "領域"),
    content: row.content || "",
    example: row.example || "",
    exampleTranslation: row.example_translation || "",
    note: row.note || "",
    tags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function toLearningItemRow(item, userId) {
  return {
    user_id: userId,
    type: item.type || "vocabulary",
    language: item.language || "english",
    title: item.title || "",
    meaning: item.meaning || "",
    content: item.content || "",
    example: item.example || "",
    example_translation: item.exampleTranslation || "",
    note: item.note || "",
    tags: Array.isArray(item.tags) ? item.tags : []
  };
}

function toSrsData(row) {
  return {
    itemId: row.item_id,
    nextReviewDate: row.next_review_date || "",
    interval: Number(row.interval ?? 1),
    easeFactor: Number(row.ease_factor ?? 2.5),
    reviewCount: Number(row.review_count ?? 0),
    mistakeCount: Number(row.mistake_count ?? 0),
    lastReviewedAt: row.last_reviewed_at || "",
    masteryLevel: Number(row.mastery_level ?? 0),
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function toSrsDataRow(item, userId) {
  return {
    item_id: item.itemId,
    user_id: userId,
    next_review_date: item.nextReviewDate || null,
    interval: Number(item.interval ?? 1),
    ease_factor: Number(item.easeFactor ?? 2.5),
    review_count: Number(item.reviewCount ?? 0),
    mistake_count: Number(item.mistakeCount ?? 0),
    last_reviewed_at: item.lastReviewedAt || null,
    mastery_level: Number(item.masteryLevel ?? 0)
  };
}

function toSrsDataPatch(patch) {
  const row = {};

  if ("nextReviewDate" in patch) row.next_review_date = patch.nextReviewDate || null;
  if ("interval" in patch) row.interval = Number(patch.interval ?? 1);
  if ("easeFactor" in patch) row.ease_factor = Number(patch.easeFactor ?? 2.5);
  if ("reviewCount" in patch) row.review_count = Number(patch.reviewCount ?? 0);
  if ("mistakeCount" in patch) row.mistake_count = Number(patch.mistakeCount ?? 0);
  if ("lastReviewedAt" in patch) row.last_reviewed_at = patch.lastReviewedAt || null;
  if ("masteryLevel" in patch) row.mastery_level = Number(patch.masteryLevel ?? 0);

  return row;
}

function toLearningSession(row) {
  return {
    id: row.id,
    date: row.date || "",
    courseId: row.course_id || "",
    courseName: row.course_name || "",
    plannedMinutes: Number(row.planned_minutes || 0),
    actualMinutes: Number(row.actual_minutes || 0),
    completedSteps: Array.isArray(row.completed_steps) ? row.completed_steps : [],
    skippedSteps: Array.isArray(row.skipped_steps) ? row.skipped_steps : [],
    reviewedItemIds: Array.isArray(row.reviewed_item_ids) ? row.reviewed_item_ids : [],
    mistakeItemIds: Array.isArray(row.mistake_item_ids) ? row.mistake_item_ids : [],
    dictationCount: Number(row.dictation_count || 0),
    recordingCount: Number(row.recording_count || 0),
    writingText: row.writing_text || "",
    feedbackText: row.feedback_text || "",
    note: row.note || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function toLearningSessionRow(session, userId) {
  return {
    user_id: userId,
    date: session.date || todayIsoDate(),
    course_id: session.courseId || "",
    course_name: session.courseName || "",
    planned_minutes: Number(session.plannedMinutes || 0),
    actual_minutes: Number(session.actualMinutes || 0),
    completed_steps: Array.isArray(session.completedSteps) ? session.completedSteps : [],
    skipped_steps: Array.isArray(session.skippedSteps) ? session.skippedSteps : [],
    reviewed_item_ids: Array.isArray(session.reviewedItemIds) ? session.reviewedItemIds : [],
    mistake_item_ids: Array.isArray(session.mistakeItemIds) ? session.mistakeItemIds : [],
    dictation_count: Number(session.dictationCount || 0),
    recording_count: Number(session.recordingCount || 0),
    writing_text: session.writingText || "",
    feedback_text: session.feedbackText || "",
    note: session.note || ""
  };
}

function toStudyLog(row) {
  return {
    id: row.id,
    date: row.date || "",
    learnedItems: Array.isArray(row.learned_items) ? row.learned_items : [],
    mistakes: Array.isArray(row.mistakes) ? row.mistakes : [],
    feedback: row.feedback || "",
    tomorrowReviewItems: Array.isArray(row.tomorrow_review_items) ? row.tomorrow_review_items : [],
    freeNote: row.free_note || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || ""
  };
}

function toStudyLogRow(log, userId) {
  return {
    user_id: userId,
    date: log.date || todayIsoDate(),
    learned_items: Array.isArray(log.learnedItems) ? log.learnedItems : [],
    mistakes: Array.isArray(log.mistakes) ? log.mistakes : [],
    feedback: log.feedback || "",
    tomorrow_review_items: Array.isArray(log.tomorrowReviewItems) ? log.tomorrowReviewItems : [],
    free_note: log.freeNote || ""
  };
}

const srsReviewTypes = new Set(["vocabulary", "grammar", "sentence", "listening"]);

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIsoDate(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function calculateSrsAfterReview(current, rating) {
  const reviewedAt = new Date().toISOString();
  const currentInterval = Number(current.interval || 1);
  const currentEase = Number(current.easeFactor || 2.5);
  const currentMastery = Number(current.masteryLevel || 0);
  let interval = 1;
  let easeFactor = currentEase;
  let masteryLevel = currentMastery;
  let mistakeCount = Number(current.mistakeCount || 0);

  if (rating === "easy") {
    interval = Math.max(3, Math.round(currentInterval * currentEase * 1.8));
    easeFactor = currentEase + 0.15;
    masteryLevel = currentMastery + 2;
  } else if (rating === "normal") {
    interval = Math.max(2, Math.round(currentInterval * currentEase));
    masteryLevel = currentMastery + 1;
  } else if (rating === "hard") {
    interval = Math.max(1, Math.ceil(currentInterval * 0.5));
    easeFactor = currentEase - 0.15;
    masteryLevel = currentMastery - 1;
    mistakeCount += 1;
  } else {
    interval = 1;
    easeFactor = currentEase - 0.25;
    masteryLevel = currentMastery - 2;
    mistakeCount += 1;
  }

  return {
    nextReviewDate: addDaysIsoDate(interval),
    interval,
    easeFactor: Math.max(1.3, Math.min(3.2, easeFactor)),
    reviewCount: Number(current.reviewCount || 0) + 1,
    mistakeCount,
    lastReviewedAt: reviewedAt,
    masteryLevel: Math.max(0, Math.min(5, masteryLevel))
  };
}

function isDueSrsItem(srsData, learningItem, today = todayIsoDate()) {
  return Boolean(
    srsData?.nextReviewDate &&
      srsData.nextReviewDate <= today &&
      learningItem &&
      srsReviewTypes.has(learningItem.type)
  );
}

function joinDueReviewItems(learningItems, srsItems) {
  const learningItemMap = new Map((learningItems || []).map((item) => [item.id, item]));

  return (srsItems || [])
    .map((srsData) => ({
      item: learningItemMap.get(srsData.itemId),
      srsData
    }))
    .filter(({ item, srsData }) => isDueSrsItem(srsData, item))
    .sort((a, b) => {
      const dateComparison = String(a.srsData.nextReviewDate).localeCompare(String(b.srsData.nextReviewDate));
      if (dateComparison !== 0) {
        return dateComparison;
      }
      return String(a.item.updatedAt || "").localeCompare(String(b.item.updatedAt || ""));
    });
}

export function createRepositories({
  supabase,
  fetchJson,
  getCurrentUser,
  getAccessToken = () => "",
  getLearningItemFilters,
  filterLearningItems,
  tomorrowIsoDate
}) {
  function shouldUseSupabase() {
    return Boolean(supabase && getCurrentUser()?.id);
  }

  function getSupabaseUser() {
    const user = getCurrentUser();
    assertSupabaseUser(user);
    return user;
  }

  async function getSupabaseAccessToken() {
    const currentToken = getAccessToken();
    if (currentToken) {
      return currentToken;
    }

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      throw new Error(formatSupabaseError("認証情報取得", error));
    }
    const token = data?.session?.access_token;
    if (!token) {
      throw new Error("Supabase認証情報を取得できませんでした。ログインし直してください。");
    }
    return token;
  }

  async function proxyRestRequest({ method = "GET", table, params, body, prefer }) {
    const token = await getSupabaseAccessToken();
    const response = await fetch("/api/supabase-rest", {
      method: "POST",
      credentials: "omit",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        accessToken: token,
        method,
        table,
        query: params ? params.toString() : "",
        body,
        prefer
      })
    });
    const contentType = response.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message = typeof data === "string" ? data : data?.message || data?.error;
      throw new Error(message || formatSupabaseError("取得", { message: `proxy ${response.status}` }));
    }

    return data;
  }

  async function withSupabaseProxyFallback(supabaseTask, proxyTask) {
    try {
      return await supabaseTask();
    } catch (error) {
      if (!isSupabaseNetworkError(error)) {
        throw error;
      }
      return proxyTask();
    }
  }

  async function fetchLocalJsonOrEmpty(url, emptyValue) {
    try {
      const res = await fetch(url);
      if (!res.ok) return emptyValue;
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) return emptyValue;
      return res.json();
    } catch (_error) {
      return emptyValue;
    }
  }

  const localLearningItemsRepository = {
    async getLearningItems() {
      const params = getLearningItemFilters();
      const query = params.toString();
      return fetchJson(`/api/learning-items${query ? `?${query}` : ""}`);
    },

    async getVocabularyItemsForLanguage(language) {
      const params = new URLSearchParams({ type: "vocabulary", language });
      return fetchJson(`/api/learning-items?${params}`);
    },

    async createLearningItem(payload) {
      return fetchJson("/api/learning-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    },

    async updateLearningItem(id, payload) {
      return fetchJson(`/api/learning-items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    },

    async deleteLearningItem(id) {
      return fetchJson(`/api/learning-items/${id}`, {
        method: "DELETE"
      });
    },

    async getLearningItemsByIds(ids) {
      const { items } = await fetchJson("/api/learning-items");
      const idSet = new Set(ids);
      return { items: (items || []).filter((item) => idSet.has(item.id)) };
    }
  };

  const supabaseLearningItemsRepository = {
    async getLearningItems() {
      const user = getSupabaseUser();
      const params = getLearningItemFilters();
      let query = supabase
        .from("learning_items")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (params.get("type")) {
        query = query.eq("type", params.get("type"));
      }

      if (params.get("language")) {
        query = query.in("language", learningLanguageDbValues(params.get("language")));
      }

      if (params.get("tag")) {
        query = query.contains("tags", [params.get("tag")]);
      }

      const { data, error } = await query;
      if (error) {
        throw new Error(formatSupabaseError("取得", error));
      }

      return { items: filterLearningItems((data || []).map(toLearningItem), params) };
    },

    async getVocabularyItemsForLanguage(language) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("learning_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("type", "vocabulary")
        .in("language", learningLanguageDbValues(language))
        .order("updated_at", { ascending: false });

      if (error) {
        throw new Error(formatSupabaseError("取得", error));
      }

      return { items: (data || []).map(toLearningItem) };
    },

    async createLearningItem(payload) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("learning_items")
        .insert(toLearningItemRow(payload, user.id))
        .select("*")
        .single();

      if (error) {
        throw new Error(formatSupabaseError("保存", error));
      }

      return { item: toLearningItem(data) };
    },

    async updateLearningItem(id, payload) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("learning_items")
        .update(toLearningItemRow(payload, user.id))
        .eq("id", id)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(formatSupabaseError("更新", error));
      }

      return { item: toLearningItem(data) };
    },

    async deleteLearningItem(id) {
      const user = getSupabaseUser();
      const { error } = await supabase
        .from("learning_items")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(formatSupabaseError("削除", error));
      }

      return { ok: true };
    },

    async getLearningItemsByIds(ids) {
      const user = getSupabaseUser();
      if (!ids.length) {
        return { items: [] };
      }

      const { data, error } = await supabase
        .from("learning_items")
        .select("*")
        .eq("user_id", user.id)
        .in("id", ids);

      if (error) {
        throw new Error(formatSupabaseError("取得", error));
      }

      return { items: (data || []).map(toLearningItem) };
    }
  };

  const proxyLearningItemsRepository = {
    async getLearningItems() {
      const user = getSupabaseUser();
      const params = getLearningItemFilters();
      const query = new URLSearchParams();
      query.set("select", "*");
      query.set("user_id", `eq.${user.id}`);
      query.set("order", "updated_at.desc");
      if (params.get("type")) query.set("type", `eq.${params.get("type")}`);
      if (params.get("language")) query.set("language", learningLanguagePostgrestIn(params.get("language")));
      if (params.get("tag")) query.set("tags", `cs.${JSON.stringify([params.get("tag")])}`);

      const data = await proxyRestRequest({ table: "learning_items", params: query });
      return { items: filterLearningItems((data || []).map(toLearningItem), params) };
    },

    async getVocabularyItemsForLanguage(language) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        select: "*",
        user_id: `eq.${user.id}`,
        type: "eq.vocabulary",
        language: learningLanguagePostgrestIn(language),
        order: "updated_at.desc"
      });
      const data = await proxyRestRequest({ table: "learning_items", params });
      return { items: (data || []).map(toLearningItem) };
    },

    async createLearningItem(payload) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({ select: "*" });
      const data = await proxyRestRequest({
        method: "POST",
        table: "learning_items",
        params,
        body: toLearningItemRow(payload, user.id),
        prefer: "return=representation"
      });
      return { item: toLearningItem(Array.isArray(data) ? data[0] : data) };
    },

    async updateLearningItem(id, payload) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        select: "*",
        id: `eq.${id}`,
        user_id: `eq.${user.id}`
      });
      const data = await proxyRestRequest({
        method: "PATCH",
        table: "learning_items",
        params,
        body: toLearningItemRow(payload, user.id),
        prefer: "return=representation"
      });
      return { item: toLearningItem(Array.isArray(data) ? data[0] : data) };
    },

    async deleteLearningItem(id) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        id: `eq.${id}`,
        user_id: `eq.${user.id}`
      });
      await proxyRestRequest({ method: "DELETE", table: "learning_items", params });
      return { ok: true };
    },

    async getLearningItemsByIds(ids) {
      const user = getSupabaseUser();
      if (!ids.length) return { items: [] };
      const params = new URLSearchParams({
        select: "*",
        user_id: `eq.${user.id}`,
        id: `in.(${ids.join(",")})`
      });
      const data = await proxyRestRequest({ table: "learning_items", params });
      return { items: (data || []).map(toLearningItem) };
    }
  };

  const localSrsRepository = {
    async getSrsData() {
      return fetchJson("/api/srs");
    },

    async getSrsDataForItem(itemId) {
      return fetchJson(`/api/srs/${itemId}`);
    },

    async createInitialSrsData(itemId) {
      return fetchJson("/api/srs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    },

    async updateSrsData(itemId, patch) {
      return fetchJson(`/api/srs/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
    },

    async updateSrsAfterReview(itemId, outcome) {
      const { item } = await this.getSrsDataForItem(itemId);
      if (!item) {
        throw new Error("SRSデータが見つかりません。");
      }

      const patch = calculateSrsAfterReview(item, outcome);
      return this.updateSrsData(itemId, patch);
    },

    async getDueReviewItems() {
      const { items: srsItems } = await this.getSrsData();
      const itemIds = srsItems.map((item) => item.itemId);
      const { items: learningItems } = await localLearningItemsRepository.getLearningItemsByIds(itemIds);

      return { items: joinDueReviewItems(learningItems, srsItems) };
    }
  };

  const supabaseSrsRepository = {
    async getSrsData() {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("srs_data")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        throw new Error(formatSupabaseError("取得", error));
      }

      return { items: (data || []).map(toSrsData) };
    },

    async getSrsDataForItem(itemId) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("srs_data")
        .select("*")
        .eq("item_id", itemId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        throw new Error(formatSupabaseError("取得", error));
      }

      return { item: data ? toSrsData(data) : null };
    },

    async createInitialSrsData(itemId) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("srs_data")
        .insert(
          toSrsDataRow(
            {
              itemId,
              nextReviewDate: tomorrowIsoDate(),
              interval: 1,
              easeFactor: 2.5,
              reviewCount: 0,
              mistakeCount: 0,
              lastReviewedAt: "",
              masteryLevel: 0
            },
            user.id
          )
        )
        .select("*")
        .single();

      if (error) {
        throw new Error(formatSupabaseError("保存", error));
      }

      return { item: toSrsData(data) };
    },

    async updateSrsData(itemId, patch) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("srs_data")
        .update(toSrsDataPatch(patch))
        .eq("item_id", itemId)
        .eq("user_id", user.id)
        .select("*")
        .single();

      if (error) {
        throw new Error(formatSupabaseError("更新", error));
      }

      return { item: toSrsData(data) };
    },

    async updateSrsAfterReview(itemId, outcome) {
      const { item } = await this.getSrsDataForItem(itemId);
      if (!item) {
        throw new Error("SRSデータが見つかりません。");
      }

      const patch = calculateSrsAfterReview(item, outcome);
      return this.updateSrsData(itemId, patch);
    },

    async getDueReviewItems() {
      const { items: srsItems } = await this.getSrsData();
      const itemIds = srsItems.map((item) => item.itemId);
      const { items: learningItems } = await supabaseLearningItemsRepository.getLearningItemsByIds(itemIds);

      return { items: joinDueReviewItems(learningItems, srsItems) };
    }
  };

  const proxySrsRepository = {
    async getSrsData() {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        select: "*",
        user_id: `eq.${user.id}`,
        order: "updated_at.desc"
      });
      const data = await proxyRestRequest({ table: "srs_data", params });
      return { items: (data || []).map(toSrsData) };
    },

    async getSrsDataForItem(itemId) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        select: "*",
        item_id: `eq.${itemId}`,
        user_id: `eq.${user.id}`,
        limit: "1"
      });
      const data = await proxyRestRequest({ table: "srs_data", params });
      const row = Array.isArray(data) ? data[0] : null;
      return { item: row ? toSrsData(row) : null };
    },

    async createInitialSrsData(itemId) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({ select: "*" });
      const data = await proxyRestRequest({
        method: "POST",
        table: "srs_data",
        params,
        body: toSrsDataRow(
          {
            itemId,
            nextReviewDate: tomorrowIsoDate(),
            interval: 1,
            easeFactor: 2.5,
            reviewCount: 0,
            mistakeCount: 0,
            lastReviewedAt: "",
            masteryLevel: 0
          },
          user.id
        ),
        prefer: "return=representation"
      });
      return { item: toSrsData(Array.isArray(data) ? data[0] : data) };
    },

    async updateSrsData(itemId, patch) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        select: "*",
        item_id: `eq.${itemId}`,
        user_id: `eq.${user.id}`
      });
      const data = await proxyRestRequest({
        method: "PATCH",
        table: "srs_data",
        params,
        body: toSrsDataPatch(patch),
        prefer: "return=representation"
      });
      return { item: toSrsData(Array.isArray(data) ? data[0] : data) };
    },

    async updateSrsAfterReview(itemId, outcome) {
      const { item } = await this.getSrsDataForItem(itemId);
      if (!item) throw new Error("SRSデータが見つかりません。");
      return this.updateSrsData(itemId, calculateSrsAfterReview(item, outcome));
    },

    async getDueReviewItems() {
      const { items: srsItems } = await this.getSrsData();
      const itemIds = srsItems.map((item) => item.itemId);
      const { items: learningItems } = await proxyLearningItemsRepository.getLearningItemsByIds(itemIds);
      return { items: joinDueReviewItems(learningItems, srsItems) };
    }
  };

  const localLearningSessionsRepository = {
    async getLearningSessions() {
      return fetchJson("/api/learning-sessions");
    },

    async getLearningSessionById(id) {
      return fetchJson(`/api/learning-sessions/${id}`);
    },

    async createLearningSession(payload) {
      return fetchJson("/api/learning-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    },

    async deleteLearningSession(id) {
      return fetchJson(`/api/learning-sessions/${id}`, {
        method: "DELETE"
      });
    }
  };

  const supabaseLearningSessionsRepository = {
    async getLearningSessions() {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("learning_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        throw new Error(formatSupabaseError("取得", error));
      }

      return { items: (data || []).map(toLearningSession) };
    },

    async getLearningSessionById(id) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("learning_sessions")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        throw new Error(formatSupabaseError("取得", error));
      }

      return { item: data ? toLearningSession(data) : null };
    },

    async createLearningSession(payload) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("learning_sessions")
        .insert(toLearningSessionRow(payload, user.id))
        .select("*")
        .single();

      if (error) {
        throw new Error(formatSupabaseError("保存", error));
      }

      return { item: toLearningSession(data) };
    },

    async deleteLearningSession(id) {
      const user = getSupabaseUser();
      const { error } = await supabase
        .from("learning_sessions")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(formatSupabaseError("削除", error));
      }

      return { ok: true };
    }
  };

  const proxyLearningSessionsRepository = {
    async getLearningSessions() {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        select: "*",
        user_id: `eq.${user.id}`,
        order: "date.desc"
      });
      const data = await proxyRestRequest({ table: "learning_sessions", params });
      return { items: (data || []).map(toLearningSession) };
    },

    async getLearningSessionById(id) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        select: "*",
        id: `eq.${id}`,
        user_id: `eq.${user.id}`,
        limit: "1"
      });
      const data = await proxyRestRequest({ table: "learning_sessions", params });
      const row = Array.isArray(data) ? data[0] : null;
      return { item: row ? toLearningSession(row) : null };
    },

    async createLearningSession(payload) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({ select: "*" });
      const data = await proxyRestRequest({
        method: "POST",
        table: "learning_sessions",
        params,
        body: toLearningSessionRow(payload, user.id),
        prefer: "return=representation"
      });
      return { item: toLearningSession(Array.isArray(data) ? data[0] : data) };
    },

    async deleteLearningSession(id) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        id: `eq.${id}`,
        user_id: `eq.${user.id}`
      });
      await proxyRestRequest({ method: "DELETE", table: "learning_sessions", params });
      return { ok: true };
    }
  };

  const localStudyLogsRepository = {
    async getStudyLogs() {
      return fetchJson("/api/study-logs");
    },

    async getStudyLogById(id) {
      return fetchJson(`/api/study-logs/${id}`);
    },

    async createStudyLog(payload) {
      return fetchJson("/api/study-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    },

    async deleteStudyLog(id) {
      return fetchJson(`/api/study-logs/${id}`, {
        method: "DELETE"
      });
    }
  };

  const supabaseStudyLogsRepository = {
    async getStudyLogs() {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("study_logs")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) {
        throw new Error(formatSupabaseError("取得", error));
      }

      return { items: (data || []).map(toStudyLog) };
    },

    async getStudyLogById(id) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("study_logs")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        throw new Error(formatSupabaseError("取得", error));
      }

      return { item: data ? toStudyLog(data) : null };
    },

    async createStudyLog(payload) {
      const user = getSupabaseUser();
      const { data, error } = await supabase
        .from("study_logs")
        .insert(toStudyLogRow(payload, user.id))
        .select("*")
        .single();

      if (error) {
        throw new Error(formatSupabaseError("保存", error));
      }

      return { item: toStudyLog(data) };
    },

    async deleteStudyLog(id) {
      const user = getSupabaseUser();
      const { error } = await supabase
        .from("study_logs")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) {
        throw new Error(formatSupabaseError("削除", error));
      }

      return { ok: true };
    }
  };

  const proxyStudyLogsRepository = {
    async getStudyLogs() {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        select: "*",
        user_id: `eq.${user.id}`,
        order: "date.desc"
      });
      const data = await proxyRestRequest({ table: "study_logs", params });
      return { items: (data || []).map(toStudyLog) };
    },

    async getStudyLogById(id) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        select: "*",
        id: `eq.${id}`,
        user_id: `eq.${user.id}`,
        limit: "1"
      });
      const data = await proxyRestRequest({ table: "study_logs", params });
      const row = Array.isArray(data) ? data[0] : null;
      return { item: row ? toStudyLog(row) : null };
    },

    async createStudyLog(payload) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({ select: "*" });
      const data = await proxyRestRequest({
        method: "POST",
        table: "study_logs",
        params,
        body: toStudyLogRow(payload, user.id),
        prefer: "return=representation"
      });
      return { item: toStudyLog(Array.isArray(data) ? data[0] : data) };
    },

    async deleteStudyLog(id) {
      const user = getSupabaseUser();
      const params = new URLSearchParams({
        id: `eq.${id}`,
        user_id: `eq.${user.id}`
      });
      await proxyRestRequest({ method: "DELETE", table: "study_logs", params });
      return { ok: true };
    }
  };

  // ---- 教材リポジトリ（RLS読み取り専用 / anon key で OK / ユーザー認証不要） --------

  const dbLangCode = (lang) => ({ english: "en", chinese: "zh" }[lang] ?? lang);

  const materialsRepository = {
    async getVocabulary({ language, cefrLevel, domain, limit = 30 }) {
      if (supabase) {
        try {
          let query = supabase
            .from("vocabulary_items")
            .select("*")
            .eq("language", dbLangCode(language))
            .eq("cefr_level", cefrLevel)
            .order("id", { ascending: true })
            .limit(limit);
          if (domain) query = query.eq("domain", domain);
          const { data, error } = await query;
          if (error) throw new Error(formatSupabaseError("語彙取得", error));
          return { items: data || [] };
        } catch (error) {
          if (!isSupabaseNetworkError(error)) throw error;
        }
      }
      // ローカルバックエンドへフォールバック
      const params = new URLSearchParams({ language: dbLangCode(language), cefr_level: cefrLevel, limit: String(limit) });
      if (domain) params.set("domain", domain);
      return fetchLocalJsonOrEmpty(`/api/materials/vocabulary?${params}`, { items: [] });
    },

    async getReadingMaterials({ language, cefrLevel, domain, limit = 5 }) {
      if (supabase) {
        try {
          let query = supabase
            .from("reading_materials")
            .select("*")
            .eq("language", dbLangCode(language))
            .eq("cefr_level", cefrLevel)
            .order("id", { ascending: true })
            .limit(limit);
          if (domain) query = query.eq("domain", domain);
          const { data, error } = await query;
          if (error) throw new Error(formatSupabaseError("文章教材取得", error));
          return { items: data || [] };
        } catch (error) {
          if (!isSupabaseNetworkError(error)) throw error;
        }
      }
      const params = new URLSearchParams({ language: dbLangCode(language), cefr_level: cefrLevel, limit: String(limit) });
      if (domain) params.set("domain", domain);
      return fetchLocalJsonOrEmpty(`/api/materials/reading?${params}`, { items: [] });
    },

    async getDomains() {
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("domains")
            .select("id, name_ja, sort_order")
            .order("sort_order", { ascending: true });
          if (error) throw new Error(formatSupabaseError("領域取得", error));
          return { domains: data || [] };
        } catch (error) {
          if (!isSupabaseNetworkError(error)) throw error;
        }
      }
      return fetchLocalJsonOrEmpty("/api/materials/domains", { domains: [] });
    }
  };

  return {
    materialsRepository,
    learningItemsRepository: {
      getLearningItems: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningItemsRepository.getLearningItems(...args),
              () => proxyLearningItemsRepository.getLearningItems(...args)
            )
          : localLearningItemsRepository.getLearningItems(...args),
      createLearningItem: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningItemsRepository.createLearningItem(...args),
              () => proxyLearningItemsRepository.createLearningItem(...args)
            )
          : localLearningItemsRepository.createLearningItem(...args),
      getVocabularyItemsForLanguage: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningItemsRepository.getVocabularyItemsForLanguage(...args),
              () => proxyLearningItemsRepository.getVocabularyItemsForLanguage(...args)
            )
          : localLearningItemsRepository.getVocabularyItemsForLanguage(...args),
      updateLearningItem: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningItemsRepository.updateLearningItem(...args),
              () => proxyLearningItemsRepository.updateLearningItem(...args)
            )
          : localLearningItemsRepository.updateLearningItem(...args),
      deleteLearningItem: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningItemsRepository.deleteLearningItem(...args),
              () => proxyLearningItemsRepository.deleteLearningItem(...args)
            )
          : localLearningItemsRepository.deleteLearningItem(...args),
      getLearningItemsByIds: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningItemsRepository.getLearningItemsByIds(...args),
              () => proxyLearningItemsRepository.getLearningItemsByIds(...args)
            )
          : localLearningItemsRepository.getLearningItemsByIds(...args)
    },
    srsRepository: {
      getSrsData: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseSrsRepository.getSrsData(...args),
              () => proxySrsRepository.getSrsData(...args)
            )
          : localSrsRepository.getSrsData(...args),
      getSrsDataForItem: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseSrsRepository.getSrsDataForItem(...args),
              () => proxySrsRepository.getSrsDataForItem(...args)
            )
          : localSrsRepository.getSrsDataForItem(...args),
      createInitialSrsData: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseSrsRepository.createInitialSrsData(...args),
              () => proxySrsRepository.createInitialSrsData(...args)
            )
          : localSrsRepository.createInitialSrsData(...args),
      updateSrsData: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseSrsRepository.updateSrsData(...args),
              () => proxySrsRepository.updateSrsData(...args)
            )
          : localSrsRepository.updateSrsData(...args),
      updateSrsAfterReview: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseSrsRepository.updateSrsAfterReview(...args),
              () => proxySrsRepository.updateSrsAfterReview(...args)
            )
          : localSrsRepository.updateSrsAfterReview(...args),
      getDueReviewItems: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseSrsRepository.getDueReviewItems(...args),
              () => proxySrsRepository.getDueReviewItems(...args)
            )
          : localSrsRepository.getDueReviewItems(...args)
    },
    learningSessionsRepository: {
      getLearningSessions: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningSessionsRepository.getLearningSessions(...args),
              () => proxyLearningSessionsRepository.getLearningSessions(...args)
            )
          : localLearningSessionsRepository.getLearningSessions(...args),
      getLearningSessionById: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningSessionsRepository.getLearningSessionById(...args),
              () => proxyLearningSessionsRepository.getLearningSessionById(...args)
            )
          : localLearningSessionsRepository.getLearningSessionById(...args),
      createLearningSession: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningSessionsRepository.createLearningSession(...args),
              () => proxyLearningSessionsRepository.createLearningSession(...args)
            )
          : localLearningSessionsRepository.createLearningSession(...args),
      deleteLearningSession: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseLearningSessionsRepository.deleteLearningSession(...args),
              () => proxyLearningSessionsRepository.deleteLearningSession(...args)
            )
          : localLearningSessionsRepository.deleteLearningSession(...args)
    },
    studyLogsRepository: {
      getStudyLogs: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseStudyLogsRepository.getStudyLogs(...args),
              () => proxyStudyLogsRepository.getStudyLogs(...args)
            )
          : localStudyLogsRepository.getStudyLogs(...args),
      getStudyLogById: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseStudyLogsRepository.getStudyLogById(...args),
              () => proxyStudyLogsRepository.getStudyLogById(...args)
            )
          : localStudyLogsRepository.getStudyLogById(...args),
      createStudyLog: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseStudyLogsRepository.createStudyLog(...args),
              () => proxyStudyLogsRepository.createStudyLog(...args)
            )
          : localStudyLogsRepository.createStudyLog(...args),
      deleteStudyLog: (...args) =>
        shouldUseSupabase()
          ? withSupabaseProxyFallback(
              () => supabaseStudyLogsRepository.deleteStudyLog(...args),
              () => proxyStudyLogsRepository.deleteStudyLog(...args)
            )
          : localStudyLogsRepository.deleteStudyLog(...args)
    }
  };
}
