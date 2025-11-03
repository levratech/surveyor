import path from "path";
import { findRepoRoot } from "../lib/repoRoot";
import { parseArgv, csv } from "../lib/args";
import { loadConfig } from "../lib/config";
import { scanFiles } from "../lib/fileScanner";
import { buildFileMap } from "../lib/fileMap";
import { getVersionStamp } from "../lib/version";
import { writeReportMd, writeReportMeta } from "../lib/reportWriter";

/** Build: resolve repo root, apply CLI overrides, scan, write outputs */
export async function build() {
  const repoRoot = await findRepoRoot(process.cwd());

  const args = parseArgv(process.argv.slice(2));
  const roots    = csv(args["roots"]);
  const include  = csv(args["include"]);
  const exclude  = csv(args["exclude"]);
  const maxBytes = typeof args["max-bytes"] === "string" ? Number(args["max-bytes"]) : undefined;
  const metaOnly = !!args["meta-only"];
  const noFileMap = !!args["no-file-map"];

  const cfg = await loadConfig(repoRoot, { roots, include, exclude, maxBytes });
  const files = await scanFiles(cfg);
  const stamp = await getVersionStamp(repoRoot);

  const fileMap = noFileMap ? undefined : await buildFileMap(repoRoot, files, { importIgnore: cfg.importIgnore });

  if (!metaOnly) {
    await writeReportMd(repoRoot, cfg.shadowDir, files, cfg.roots, fileMap, stamp);
  }
  await writeReportMeta(repoRoot, cfg.shadowDir, files, fileMap, stamp);

  const relOut = path.relative(repoRoot, path.join(repoRoot, cfg.shadowDir));
  console.log(`Report generated in ${relOut} (${files.length} files)`);
}
