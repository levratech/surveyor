#!/usr/bin/env node
/* Surveyor CLI entry */
import { build } from "./commands/build";

async function main() {
  const argv = process.argv.slice(2);
  const cmd = argv[0];

  if (!cmd || cmd === "--help" || cmd === "-h") {
    printHelp();
    process.exit(0);
  }
  if (cmd === "--version" || cmd === "-v") {
    // Avoid dynamic import of package.json at runtime paths—hardcode via env var fallback if needed.
    // For now, print runtime unknown if not available; report.md/meta carry stamped version already.
    console.log(process.env.SURVEYOR_VERSION ?? "unknown");
    process.exit(0);
  }

  if (cmd === "build") {
    // pass through remaining args (e.g., --meta-only)
    process.argv = [process.argv[0], process.argv[1], ...argv.slice(1)];
    await build();
    return;
  }

  console.error(`Unknown command: ${cmd}\n`);
  printHelp();
  process.exit(1);
}

function printHelp() {
  console.log(`Surveyor — repo atlas generator

Usage:
  svy build [--flags]

Flags:
  --meta-only           write JSON only (no Markdown)
  --no-file-map         skip imports/exports map
  --roots=a,b,c         override scan roots
  --include=pat1,pat2   override include globs
  --exclude=pat1,pat2   override exclude globs
  --max-bytes=N         max file size in bytes
  -h, --help            show help
  -v, --version         show version
`);
}

main().catch((err) => {
  console.error(err?.stack || String(err));
  process.exit(1);
});
