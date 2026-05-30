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

  return {
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
    }
  };
}
