import { promises as fs } from "fs";
import path from "path";

/**
 * Heuristic file map extractor (imports / exports) for TS/JS files.
 * Not an AST: fast and "good enough" for agent navigation.
 */
export async function buildFileMap(
  repoRoot: string,
  files: string[],
  opts?: { importIgnore?: string[] }
) {
  const map: Record<string, { imports: string[]; exports: string[] }> = {};
  const ignoreSet = new Set((opts?.importIgnore ?? []).map(s => s.toLowerCase()));

  const codeExt = new Set(["ts","tsx","js","jsx"]);
  for (const rel of files) {
    const ext = rel.split(".").pop()?.toLowerCase() || "";
    if (!codeExt.has(ext)) continue;

    const abs = path.join(repoRoot, rel);
    let src = "";
    try { src = await fs.readFile(abs, "utf8"); } catch { continue; }

    let imports = extractImports(src).filter(im => !ignoreSet.has(im.toLowerCase()));
    const exports = extractExports(src);
    map[rel] = { imports: Array.from(new Set(imports)), exports };
  }

  return map;
}

const IMPORT_RE = [
  // import x from 'pkg'; import {a as b} from "pkg";
  /\bimport\s+[^'"]*\bfrom\s+['"]([^'"]+)['"]/g,
  // import 'side-effect';
  /\bimport\s+['"]([^'"]+)['"]/g,
  // const x = require('pkg');  require("pkg");
  /\brequire\(\s*['"]([^'"]+)['"]\s*\)/g
];

function extractImports(src: string): string[] {
  const out: string[] = [];
  for (const re of IMPORT_RE) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) out.push(m[1]);
  }
  // de-dupe, keep order
  return Array.from(new Set(out));
}

// export function Foo, export class Bar, export const baz, export default ...
// export { a, b as c }, export type T, export interface I, export enum E
const EXPORT_NAME_RE = [
  /\bexport\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)/g,
  /\bexport\s+class\s+([A-Za-z0-9_$]+)/g,
  /\bexport\s+(?:const|let|var)\s+([A-Za-z0-9_$]+)/g,
  /\bexport\s+type\s+([A-Za-z0-9_$]+)/g,
  /\bexport\s+interface\s+([A-Za-z0-9_$]+)/g,
  /\bexport\s+enum\s+([A-Za-z0-9_$]+)/g
];

// export { a, b as c }
const EXPORT_LIST_RE = /\bexport\s*{\s*([^}]+)\s*}/g;

function extractExports(src: string): string[] {
  const names: string[] = [];

  for (const re of EXPORT_NAME_RE) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src))) names.push(m[1]);
  }

  // handle re-exports list
  EXPORT_LIST_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = EXPORT_LIST_RE.exec(src))) {
    const list = m[1]
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(seg => {
        // "name as alias" -> capture alias; else name
        const as = /\bas\s+([A-Za-z0-9_$]+)$/.exec(seg);
        if (as) return as[1];
        // strip anything after whitespace
        return seg.split(/\s+/)[0];
      });
    names.push(...list);
  }

  // default export marker (use "default" literal)
  if (/\bexport\s+default\b/.test(src)) names.push("default");

  return Array.from(new Set(names));
}