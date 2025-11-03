import fg from "fast-glob";
import path from "path";
import { promises as fs } from "fs";

export type LoadedCfg = {
  repoRoot: string;
  shadowDir: string;
  roots: string[];
  include: string[];
  exclude: string[];
  maxBytes?: number;
};

export async function scanFiles(cfg: LoadedCfg): Promise<string[]> {
  // Build relative include patterns: roots × include (relative to repoRoot)
  const patterns: string[] = [];
  for (const root of cfg.roots) {
    const relRoot = path.relative(cfg.repoRoot, root) || ".";
    for (const inc of cfg.include) patterns.push(toPosix(path.join(relRoot, inc)));
  }

  const files = await fg(patterns, {
    ignore: cfg.exclude,
    dot: false,
    onlyFiles: true,
    unique: true,
    absolute: false,
    followSymbolicLinks: false,
    cwd: cfg.repoRoot,
  });

  // Hard guard: never include the shadow dir
  const rel = files.filter(p => !p.startsWith(cfg.shadowDir + "/")).sort();

  // Prefer TS over JS when both exist (same stem)
  const deduped = preferTsOverJs(rel);

  // Filter out large/binary-ish files
  const filtered: string[] = [];
  for (const relPath of deduped) {
    const abs = path.join(cfg.repoRoot, relPath);
    try {
      const st = await fs.stat(abs);
      if (st.size > (cfg.maxBytes ?? 256 * 1024)) continue;
      const buf = await fs.readFile(abs);
      if (looksBinary(buf)) continue;
      filtered.push(relPath);
    } catch {
      // ignore unreadable files
    }
  }

  return filtered;
}

function preferTsOverJs(paths: string[]): string[] {
  const keep = new Set<string>();
  const stems = new Map<string, string>(); // stem -> chosen ext
  for (const p of paths) {
    const { stem, ext } = splitExt(p);
    const prev = stems.get(stem);
    const rank = rankExt(ext);
    const prevRank = prev ? rankExt(prev) : -1;
    if (rank >= prevRank) {
      if (prev) keep.delete(joinStemExt(stem, prev));
      stems.set(stem, ext);
      keep.add(p);
    } else {
      keep.add(joinStemExt(stem, prev!));
    }
  }
  return Array.from(keep).sort();
}

function looksBinary(buf: Buffer): boolean {
  // Null byte check: strong binary signal
  if (buf.includes(0)) return true;
  // Heuristic: if >20% of bytes are outside common text range, treat as binary
  let weird = 0;
  const len = Math.min(buf.length, 4096); // sample first 4KB
  for (let i = 0; i < len; i++) {
    const c = buf[i];
    // allow tab/newline/carriage return + typical printable ASCII + utf-8 lead bytes
    const printable = c === 9 || c === 10 || c === 13 || (c >= 32 && c <= 126) || (c >= 194 && c <= 244);
    if (!printable) weird++;
  }
  return weird / Math.max(1, len) > 0.2;
}

function splitExt(p: string): { stem: string; ext: string } {
  const idx = p.lastIndexOf(".");
  return idx === -1 ? { stem: p, ext: "" } : { stem: p.slice(0, idx), ext: p.slice(idx + 1).toLowerCase() };
}

function joinStemExt(stem: string, ext: string) {
  return ext ? `${stem}.${ext}` : stem;
}

function rankExt(ext: string): number {
  switch (ext) {
    case "tsx": return 4;
    case "ts":  return 3;
    case "jsx": return 2;
    case "js":  return 1;
    default:    return 0;
  }
}

function toPosix(p: string) {
  return p.split(path.sep).join("/");
}
