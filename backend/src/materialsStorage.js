import { createClient } from "@supabase/supabase-js";

let _supabase = null;

function getClient() {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase接続情報が未設定です。NEXT_PUBLIC_SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を .env に設定してください。"
    );
  }

  _supabase = createClient(url, key, { auth: { persistSession: false } });
  return _supabase;
}

function toNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---- domains ----------------------------------------------------------------

export async function listDomains() {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("domains")
    .select("id, name_ja, sort_order")
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`領域一覧の取得に失敗しました: ${error.message}`);
  }

  return data || [];
}

// ---- vocabulary_items -------------------------------------------------------

export async function listVocabularyItems({ language, cefr_level, domain, limit, offset }) {
  const supabase = getClient();

  if (!language) throw new Error("language は必須です。");
  if (!cefr_level) throw new Error("cefr_level は必須です。");

  const safeLimit = toNumber(limit, 20);
  const safeOffset = toNumber(offset, 0);

  let query = supabase
    .from("vocabulary_items")
    .select("*", { count: "exact" })
    .eq("language", language)
    .eq("cefr_level", cefr_level)
    .order("id", { ascending: true })
    .range(safeOffset, safeOffset + safeLimit - 1);

  if (domain) {
    query = query.eq("domain", domain);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`語彙教材の取得に失敗しました: ${error.message}`);
  }

  return { items: data || [], total: count ?? 0 };
}

export async function getVocabularyItem(id) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("vocabulary_items")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`語彙教材の取得に失敗しました: ${error.message}`);
  }

  return data || null;
}

// ---- reading_materials ------------------------------------------------------

export async function listReadingMaterials({ language, cefr_level, domain, limit, offset }) {
  const supabase = getClient();

  if (!language) throw new Error("language は必須です。");
  if (!cefr_level) throw new Error("cefr_level は必須です。");

  const safeLimit = toNumber(limit, 5);
  const safeOffset = toNumber(offset, 0);

  let query = supabase
    .from("reading_materials")
    .select("*", { count: "exact" })
    .eq("language", language)
    .eq("cefr_level", cefr_level)
    .order("id", { ascending: true })
    .range(safeOffset, safeOffset + safeLimit - 1);

  if (domain) {
    query = query.eq("domain", domain);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`文章教材の取得に失敗しました: ${error.message}`);
  }

  return { items: data || [], total: count ?? 0 };
}

export async function getReadingMaterial(id) {
  const supabase = getClient();

  const { data, error } = await supabase
    .from("reading_materials")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`文章教材の取得に失敗しました: ${error.message}`);
  }

  return data || null;
}
