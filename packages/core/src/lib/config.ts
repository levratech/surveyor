import { promises as fs } from "fs";
import path from "path";

export type SurveyorConfig = {
  shadowDir: string;
  roots?: string[];
  include: string[];
  exclude: string[];
  /** size guard in bytes */
  maxBytes?: number;
  /** import paths to ignore in File Map (noise/placeholders) */
  importIgnore?: string[];
  profiles?: Record<string, string[]>;
};

const DEFAULTS: SurveyorConfig = {
  shadowDir: ".surveyor",
  include: [
    "**/*.{ts,tsx,js,jsx,mjs,cjs}",
    "**/*.{json,yaml,yml}",
    "**/*.{md,mdx}"
  ],
  exclude: [
    "**/node_modules/**",
    ".git/**",
    "**/dist/**",
    ".surveyor/**",
    "**/*.d.ts",
    "**/*.map",
    "**/.DS_Store",
    "**/.next/**",
    "**/.turbo/**",
    "**/.cache/**",
    // New: avoid stray compiled JS in TS repos by default
    "**/src/**/*.js",
    "**/src/**/*.js.map"
  ],
  maxBytes: 256 * 1024,
  importIgnore: ["pkg", "side-effect"], // placeholders
  profiles: {
    small: ["repoMap", "fileMap"],
    full: ["repoMap", "fileMap", "symbolMap", "files"]
  }
};

export async function loadConfig(
  repoRoot: string = process.cwd(),
  overrides?: {
    roots?: string[];
    include?: string[];
    exclude?: string[];
    maxBytes?: number;
  }
): Promise<SurveyorConfig & { repoRoot: string; roots: string[] }> {
  const cfgPath = path.join(repoRoot, ".project", "surveyorrc.json");
  let user: Partial<SurveyorConfig> = {};
  try {
    const raw = await fs.readFile(cfgPath, "utf8");
    user = JSON.parse(raw);
  } catch { /* no config is fine */ }

  const roots = await autoDetectRoots(repoRoot, overrides?.roots ?? user.roots);

  return {
    repoRoot,
    shadowDir: user.shadowDir ?? DEFAULTS.shadowDir,
    roots,
    include: overrides?.include?.length ? overrides.include
            : user.include?.length ? user.include
            : DEFAULTS.include,
    exclude: overrides?.exclude?.length ? overrides.exclude
            : user.exclude?.length ? user.exclude
            : DEFAULTS.exclude,
    maxBytes: overrides?.maxBytes ?? user.maxBytes ?? DEFAULTS.maxBytes,
    importIgnore: user.importIgnore?.length ? user.importIgnore : DEFAULTS.importIgnore,
    profiles: { ...(DEFAULTS.profiles || {}), ...(user.profiles || {}) }
  };
}

async function exists(p: string) {
  try { await fs.stat(p); return true; } catch { return false; }
}

async function autoDetectRoots(repoRoot: string, userRoots?: string[]) {
  if (userRoots && userRoots.length) {
    return userRoots.map(r => normalize(repoRoot, r));
  }
  const haveApps = await exists(path.join(repoRoot, "apps"));
  const havePkgs = await exists(path.join(repoRoot, "packages"));
  const haveWS   = await exists(path.join(repoRoot, "pnpm-workspace.yaml"));
  if (haveApps || havePkgs || haveWS) {
    const roots: string[] = [];
    if (haveApps) roots.push("apps/*/src", "apps/*");
    if (havePkgs) roots.push("packages/*/src", "packages/*");
    if (await exists(path.join(repoRoot, "src"))) roots.push("src");
    return roots.map(r => normalize(repoRoot, r));
  }
  if (await exists(path.join(repoRoot, "src"))) return [normalize(repoRoot, "src")];
  return [repoRoot];
}

function normalize(repoRoot: string, p: string) {
  return p.startsWith("/") ? p : path.join(repoRoot, p);
}
