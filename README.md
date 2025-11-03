# Surveyor

**Surveyor** is a codebase surveying tool that produces a deterministic, AI-ready report of your repository. It extracts structural layers of a project—repo, file, and symbol metadata—and generates a compact snapshot optimized for AI reasoning, navigation, and safe code modification.

Surveyor enables AI agents to work effectively on codebases without loading the entire repo into context.

---

## Table of Contents

- [Status](#status)
- [Overview](#overview)
- [Core Features](#core-features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [CLI Commands](#cli-commands)
- [Directory Structure](#directory-structure)
- [Chronchive Integration (Optional)](#chronchive-integration-optional)
- [Roadmap](#roadmap)
- [License](#license)

---

## Status

**Pre-Alpha** — APIs, report formats, and directory conventions may change before v0.3.

---

## Overview

AI models can read code, but not all codebases are structured in a way that makes it easy for AI to reason about them. Surveyor provides a layered code-intelligence model that externalizes the core information an AI needs to navigate and understand a repository.

| Layer        | Description                                                             |
|--------------|-------------------------------------------------------------------------|
| Repo Map     | Architecture, packages, entrypoints, dependencies, exclusions           |
| File Map     | Per-file imports, exports, surfaces, responsibilities, complexity       |
| Symbol Map   | Functions/classes/types with signatures, effects, tests, ownership      |
| Slices       | Targeted subsets of code + metadata for LLM prompts                     |

Surveyor reports are regenerable, deterministic, and language-extensible.

---

## Core Features

- Deterministic code survey report for AI tooling and review
- Layered metadata (repo → file → symbol)
- Precision slicing for minimal-context LLM prompts
- Designed for round-trip safe AI edits and verification
- Extensible architecture with language adapters (TS first)
- Excludes lockfile and noise by default (summarized instead)
- Optional integration with Chronchive for planning workflows

---

## Installation

```bash
npm install -D @levratech/surveyor
````

Surveyor exposes the CLI commands `surveyor` and `svy`.

---

## Quick Start

Generate a survey:

```bash
npx surveyor build
```

This creates a local shadow directory (ignored by git):

```
.surveyor/
  report.md
  report.meta.json
  report.index.json
```

Recommended configuration file:

**`.project/surveyorrc.json`**

```json
{
  "shadowDir": ".surveyor",
  "include": ["src/**","apps/**","packages/**"],
  "exclude": [
    "**/node_modules/**",".git/**","dist/**",
    "package-lock.json","yarn.lock","pnpm-lock.yaml"
  ],
  "profiles": {
    "small": ["repoMap","fileMap"],
    "full": ["repoMap","fileMap","symbolMap","files"]
  }
}
```

**`.gitignore`**

```
.surveyor/
```

---

## CLI Commands

| Command                        | Description                                   |
| ------------------------------ | --------------------------------------------- |
| `surveyor build`               | Generate a full survey report                 |
| `surveyor meta gen`            | Regenerate metadata only                      |
| `surveyor slice --profile <p>` | Output a selected subset of the report        |
| `surveyor verify`              | Validate that repo matches last survey digest |

Examples:

```bash
# Produce a minimal LLM-friendly slice
npx surveyor slice --profile small > survey.slice.md

# Regenerate metadata only
npx surveyor meta gen
```

---

## Directory Structure

| Path                       | Committed | Purpose                               |
| -------------------------- | --------- | ------------------------------------- |
| `.project/surveyorrc.json` | Yes       | Config consumed by Surveyor           |
| `.surveyor/`               | No        | Generated artifacts and cache         |
| `report.md`                | Local     | Code snapshot (deterministic)         |
| `report.meta.json`         | Local     | Repo/File/Symbol metadata             |
| `report.index.json`        | Local     | Fingerprints for incremental rebuilds |

Artifacts in `.surveyor/` are regenerable and should not be committed.

---

## Chronchive Integration (Optional)

Surveyor is standalone. When paired with Chronchive:

* Chronchive consumes `report.meta.json`
* Enables code-aware Story creation and automated planning
* Improves agent-driven refactoring and reasoning safety

Integration will be provided via a separate bridge package:

`@levratech/chronchive-surveyor-bridge` *(planned)*

---

## Roadmap

| Version | Scope                                    |
| ------- | ---------------------------------------- |
| v0.1    | Core CLI: build, meta gen, slice, verify |
| v0.2    | TS adapter, incremental rebuilds, daemon |
| v0.3    | Doc sidecars, PR artifact automation     |
| v0.4    | Python & Go adapters, editor extension   |
| v1.0    | Stable spec + Chronchive integration     |

---

## License

MIT