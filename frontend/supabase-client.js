import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

const url = window.SUPABASE_URL;
const key = window.SUPABASE_ANON_KEY;

// URL/Keyが未設定の場合はnullを返す（localStorage専用モードで動作継続）
export const supabase = url && key ? createClient(url, key) : null;
