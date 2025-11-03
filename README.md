# Surveyor
Minimal repo "atlas" generator for AI + humans. Produces:
- `.surveyor/report.md` — human-readable summary (header + File Map + file contents)
- `.surveyor/report.meta.json` — machine JSON (root, files, optional fileMap, version, gitCommit, generatedAt)

## Install (workspace)
```bash
pnpm install
pnpm --filter @levratech/surveyor build
```

## Usage

```bash
pnpm svy build           # MD + JSON
pnpm svy build --meta-only
pnpm svy build --no-file-map
pnpm svy build --roots=src,packages/*/src --include=**/*.ts --exclude=**/*.test.ts
pnpm svy build --max-bytes=131072
```

## Defaults
•Auto-detect roots (monorepo-aware: packages/*/src, apps/*/src, src)
•Excludes: node_modules, .git, dist, .surveyor, **/*.d.ts, **/*.map, and JS artifacts inside src/
•Size/binary guards (skip >256KB or binary-ish files)
•File Map (regex-based imports/exports) with stoplist for placeholders ("pkg", "side-effect")

## Config (optional)

Create .project/surveyorrc.json:

```json
{
  "shadowDir": ".surveyor",
  "roots": ["src","packages/*/src"],
  "include": ["**/*.{ts,tsx,js,jsx}", "**/*.json"],
  "exclude": ["**/node_modules/**","dist/**",".surveyor/**"],
  "maxBytes": 262144,
  "importIgnore": ["pkg", "side-effect"]
}
```

## Output header (stamped)
•Version from package
•Git Commit (git rev-parse --short HEAD)
•Generated At ISO timestamp

## Why

Large context ≠ useful context. Surveyor compresses a repo into tiered views so agents (and people) can reason without slurping everything.

## Roadmap
•svy slice --profile small (summary + file map + selected files)
•--adapter ts (AST-accurate imports/exports via ts-morph)
•CI drift check (fail PR if report.meta.json changes unexpectedly)
