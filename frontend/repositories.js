function formatSupabaseError(action, error) {
  return `Supabase${action}に失敗しました: ${error.message || "詳細不明のエラー"}`;
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
    language: row.language || "english",
    title: row.title || "",
    meaning: row.meaning || "",
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

  const localLearningItemsRepository = {
    async getLearningItems() {
      const params = getLearningItemFilters();
      const query = params.toString();
      return fetchJson(`/api/learning-items${query ? `?${query}` : ""}`);
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
        query = query.eq("language", params.get("language"));
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

  // ---- 教材リポジトリ（RLS読み取り専用 / anon key で OK / ユーザー認証不要） --------

  const materialsRepository = {
    async getVocabulary({ language, cefrLevel, domain, limit = 30 }) {
      if (supabase) {
        let query = supabase
          .from("vocabulary_items")
          .select("*")
          .eq("language", language)
          .eq("cefr_level", cefrLevel)
          .order("id", { ascending: true })
          .limit(limit);
        if (domain) query = query.eq("domain", domain);
        const { data, error } = await query;
        if (error) throw new Error(formatSupabaseError("語彙取得", error));
        return { items: data || [] };
      }
      // ローカルバックエンドへフォールバック
      const params = new URLSearchParams({ language, cefr_level: cefrLevel, limit: String(limit) });
      if (domain) params.set("domain", domain);
      const res = await fetch(`/api/materials/vocabulary?${params}`);
      if (!res.ok) throw new Error(`語彙取得エラー: ${res.status}`);
      return res.json();
    },

    async getReadingMaterials({ language, cefrLevel, domain, limit = 5 }) {
      if (supabase) {
        let query = supabase
          .from("reading_materials")
          .select("*")
          .eq("language", language)
          .eq("cefr_level", cefrLevel)
          .order("id", { ascending: true })
          .limit(limit);
        if (domain) query = query.eq("domain", domain);
        const { data, error } = await query;
        if (error) throw new Error(formatSupabaseError("文章教材取得", error));
        return { items: data || [] };
      }
      const params = new URLSearchParams({ language, cefr_level: cefrLevel, limit: String(limit) });
      if (domain) params.set("domain", domain);
      const res = await fetch(`/api/materials/reading?${params}`);
      if (!res.ok) throw new Error(`文章教材取得エラー: ${res.status}`);
      return res.json();
    },

    async getDomains() {
      if (supabase) {
        const { data, error } = await supabase
          .from("domains")
          .select("id, name_ja, sort_order")
          .order("sort_order", { ascending: true });
        if (error) throw new Error(formatSupabaseError("領域取得", error));
        return { domains: data || [] };
      }
      const res = await fetch("/api/materials/domains");
      if (!res.ok) throw new Error(`領域取得エラー: ${res.status}`);
      return res.json();
    }
  };

  return {
    materialsRepository,
    learningItemsRepository: {
      getLearningItems: (...args) =>
        shouldUseSupabase()
          ? supabaseLearningItemsRepository.getLearningItems(...args)
          : localLearningItemsRepository.getLearningItems(...args),
      createLearningItem: (...args) =>
        shouldUseSupabase()
          ? supabaseLearningItemsRepository.createLearningItem(...args)
          : localLearningItemsRepository.createLearningItem(...args),
      updateLearningItem: (...args) =>
        shouldUseSupabase()
          ? supabaseLearningItemsRepository.updateLearningItem(...args)
          : localLearningItemsRepository.updateLearningItem(...args),
      deleteLearningItem: (...args) =>
        shouldUseSupabase()
          ? supabaseLearningItemsRepository.deleteLearningItem(...args)
          : localLearningItemsRepository.deleteLearningItem(...args),
      getLearningItemsByIds: (...args) =>
        shouldUseSupabase()
          ? supabaseLearningItemsRepository.getLearningItemsByIds(...args)
          : localLearningItemsRepository.getLearningItemsByIds(...args)
    },
    srsRepository: {
      getSrsData: (...args) =>
        shouldUseSupabase()
          ? supabaseSrsRepository.getSrsData(...args)
          : localSrsRepository.getSrsData(...args),
      getSrsDataForItem: (...args) =>
        shouldUseSupabase()
          ? supabaseSrsRepository.getSrsDataForItem(...args)
          : localSrsRepository.getSrsDataForItem(...args),
      createInitialSrsData: (...args) =>
        shouldUseSupabase()
          ? supabaseSrsRepository.createInitialSrsData(...args)
          : localSrsRepository.createInitialSrsData(...args),
      updateSrsData: (...args) =>
        shouldUseSupabase()
          ? supabaseSrsRepository.updateSrsData(...args)
          : localSrsRepository.updateSrsData(...args),
      updateSrsAfterReview: (...args) =>
        shouldUseSupabase()
          ? supabaseSrsRepository.updateSrsAfterReview(...args)
          : localSrsRepository.updateSrsAfterReview(...args),
      getDueReviewItems: (...args) =>
        shouldUseSupabase()
          ? supabaseSrsRepository.getDueReviewItems(...args)
          : localSrsRepository.getDueReviewItems(...args)
    },
    learningSessionsRepository: {
      getLearningSessions: (...args) =>
        shouldUseSupabase()
          ? supabaseLearningSessionsRepository.getLearningSessions(...args)
          : localLearningSessionsRepository.getLearningSessions(...args),
      getLearningSessionById: (...args) =>
        shouldUseSupabase()
          ? supabaseLearningSessionsRepository.getLearningSessionById(...args)
          : localLearningSessionsRepository.getLearningSessionById(...args),
      createLearningSession: (...args) =>
        shouldUseSupabase()
          ? supabaseLearningSessionsRepository.createLearningSession(...args)
          : localLearningSessionsRepository.createLearningSession(...args),
      deleteLearningSession: (...args) =>
        shouldUseSupabase()
          ? supabaseLearningSessionsRepository.deleteLearningSession(...args)
          : localLearningSessionsRepository.deleteLearningSession(...args)
    },
    studyLogsRepository: {
      getStudyLogs: (...args) =>
        shouldUseSupabase()
          ? supabaseStudyLogsRepository.getStudyLogs(...args)
          : localStudyLogsRepository.getStudyLogs(...args),
      getStudyLogById: (...args) =>
        shouldUseSupabase()
          ? supabaseStudyLogsRepository.getStudyLogById(...args)
          : localStudyLogsRepository.getStudyLogById(...args),
      createStudyLog: (...args) =>
        shouldUseSupabase()
          ? supabaseStudyLogsRepository.createStudyLog(...args)
          : localStudyLogsRepository.createStudyLog(...args),
      deleteStudyLog: (...args) =>
        shouldUseSupabase()
          ? supabaseStudyLogsRepository.deleteStudyLog(...args)
          : localStudyLogsRepository.deleteStudyLog(...args)
    }
  };
}
