import { writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const outputPath = resolve(currentDir, "../frontend/supabase-config.js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const content = [
  "// このファイルはビルド時に自動生成されます。直接編集しないでください。",
  `window.SUPABASE_URL = ${JSON.stringify(url)};`,
  `window.SUPABASE_ANON_KEY = ${JSON.stringify(key)};`,
  ""
].join("\n");

writeFileSync(outputPath, content, "utf-8");
console.log("supabase-config.js を生成しました。");
