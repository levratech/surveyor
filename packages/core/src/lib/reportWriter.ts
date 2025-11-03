import { promises as fs } from "fs";
import path from "path";

type FileMap = Record<string, { imports: string[]; exports: string[] }>;
type Stamp = { version: string; gitCommit: string; generatedAt: string };

export async function writeReportMd(
  repoRoot: string,
  shadowDir: string,
  files: string[],
  roots: string[],
  fileMap: FileMap | undefined,
  stamp: Stamp
) {
  const outDir = path.join(repoRoot, shadowDir);
  await fs.mkdir(outDir, { recursive: true });
  const mdPath = path.join(outDir, "report.md");

  const header =
`## Survey Summary
Root: ${repoRoot}
Included files: ${files.length}
Roots: ${roots.map(r => path.relative(repoRoot, r) || "." ).join(", ")}
Shadow dir: ${shadowDir}
Version: ${stamp.version}
Git Commit: ${stamp.gitCommit}
Generated At: ${stamp.generatedAt}

---`;

  // Optional compact File Map section
  const fm = fileMap ? renderFileMap(fileMap) : "";

  const chunks: string[] = [header, "\n", fm, "\n"];

  for (const rel of files) {
    const abs = path.join(repoRoot, rel);
    const content = await fs.readFile(abs, "utf8");
    const lang = fenceLangFromExt(rel);
    chunks.push(
`### File: ${rel}
\`\`\`${lang}
${content}
\`\`\`

`);
  }

  await fs.writeFile(mdPath, chunks.join(""), "utf8");
}

export async function writeReportMeta(
  repoRoot: string,
  shadowDir: string,
  files: string[],
  fileMap: FileMap | undefined,
  stamp: Stamp
) {
  const outDir = path.join(repoRoot, shadowDir);
  await fs.mkdir(outDir, { recursive: true });
  const metaPath = path.join(outDir, "report.meta.json");
  const meta = {
    root: repoRoot,
    shadowDir,
    generatedAt: stamp.generatedAt,
    version: stamp.version,
    gitCommit: stamp.gitCommit,
    files,
    ...(fileMap ? { fileMap } : {})
  };
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2), "utf8");
}

function renderFileMap(fileMap: FileMap) {
  const lines: string[] = ["## File Map"];
  const sorted = Object.keys(fileMap).sort();
  for (const rel of sorted) {
    const m = fileMap[rel];
    const im = m.imports.length ? m.imports.join(", ") : "-";
    const ex = m.exports.length ? m.exports.join(", ") : "-";
    lines.push(`- **${rel}**\n  - imports: ${im}\n  - exports: ${ex}`);
  }
  lines.push("\n---");
  return lines.join("\n");
}

function fenceLangFromExt(rel: string) {
  const ext = rel.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "ts": return "ts";
    case "tsx": return "tsx";
    case "js": return "js";
    case "jsx": return "jsx";
    case "json": return "json";
    case "md": case "mdx": return "md";
    case "yml": case "yaml": return "yaml";
    default: return "";
  }
}
