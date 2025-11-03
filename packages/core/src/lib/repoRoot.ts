import { promises as fs } from "fs";
import path from "path";

/** Walk up from start until a directory containing .git is found. Fallback: start. */
export async function findRepoRoot(start: string): Promise<string> {
  let cur = path.resolve(start);
  while (true) {
    if (await exists(path.join(cur, ".git"))) return cur;
    const parent = path.dirname(cur);
    if (parent === cur) return start; // reached filesystem root
    cur = parent;
  }
}

async function exists(p: string) {
  try { await fs.stat(p); return true; } catch { return false; }
}