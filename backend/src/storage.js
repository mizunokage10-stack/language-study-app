import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDir = path.dirname(currentFilePath);
const dataDir = path.resolve(currentDir, "../data");

export function resolveDataPath(fileName) {
  return path.resolve(dataDir, fileName);
}

export async function ensureJsonFile(fileName, fallbackValue) {
  const filePath = resolveDataPath(fileName);

  try {
    await fs.access(filePath);
  } catch (error) {
    await fs.writeFile(filePath, JSON.stringify(fallbackValue, null, 2), "utf-8");
  }
}

export async function readJsonFile(fileName, fallbackValue) {
  await ensureJsonFile(fileName, fallbackValue);
  const raw = await fs.readFile(resolveDataPath(fileName), "utf-8");
  return JSON.parse(raw);
}

export async function writeJsonFile(fileName, value) {
  await fs.writeFile(resolveDataPath(fileName), JSON.stringify(value, null, 2), "utf-8");
}

export function createId() {
  return crypto.randomUUID();
}

export async function readHistory() {
  return readJsonFile("history.json", []);
}

export async function writeHistory(items) {
  await writeJsonFile("history.json", items);
}

export async function readVocabularyNotebook() {
  return readJsonFile("notebook.json", []);
}

export async function writeVocabularyNotebook(items) {
  await writeJsonFile("notebook.json", items);
}
