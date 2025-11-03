import { promises as fs } from "fs";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

/** Returns { version, gitCommit, generatedAt } for stamping outputs */
export async function getVersionStamp(repoRoot: string): Promise<{ version: string; gitCommit: string; generatedAt: string }> {
  const generatedAt = new Date().toISOString();
  const version = await readVersion(repoRoot);
  const gitCommit = await readGitCommit(repoRoot);
  return { version, gitCommit, generatedAt };
}

async function readVersion(repoRoot: string): Promise<string> {
  // Try package.json next to dist (packages/core/package.json) when compiled,
  // fallback to resolving upward if needed.
  const candidates = [
    path.join(repoRoot, "packages", "core", "package.json"),
    path.join(__dirname, "..", "package.json")
  ];
  for (const p of candidates) {
    try {
      const raw = await fs.readFile(p, "utf8");
      const json = JSON.parse(raw);
      if (json?.version) return String(json.version);
    } catch { /* try next */ }
  }
  return "unknown";
}

async function readGitCommit(repoRoot: string): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", ["rev-parse", "--short", "HEAD"], { cwd: repoRoot });
    return stdout.trim() || "unknown";
  } catch {
    return "unknown";
  }
}