---
name: cinema-docs
description: Answer questions by locating authoritative project documentation and conventions.
invoked-by: both
tools:
  - read
  - search
---
# Cinema Docs

## What This Skill Does
- Finds the canonical guidance (docs/config) for a question before answering
- Extracts conventions (formatting, folder ownership, scripts) from real repo files
- Produces answers anchored to specific files/sections with clickable links
- Identifies conflicts between docs and implementation and calls them out explicitly

## How to Use
Invocation: `/cinema-docs <question>`

Example queries:
- `/cinema-docs Which scripts should I run before opening a PR?`
- `/cinema-docs What are the repo rules for adding new dependencies?`
 - `/cinema-docs What are the formatting/lint rules and what tool enforces them?`

## Instructions
1. Start with documentation sources first:
   - Read [AGENTS.md](AGENTS.md) for the “single source of truth” agent rules.
   - Read [README.md](README.md) for high-level product/setup info.
2. Confirm tooling and scripts from config:
   - Read [package.json](package.json) for scripts + dependency versions.
   - Read [biome.json](biome.json) and [eslint.config.js](eslint.config.js) for formatting/lint rules.
3. Confirm build/typecheck setup:
  - Read [tsconfig.json](tsconfig.json), [tsconfig.app.json](tsconfig.app.json), and [vite.config.ts](vite.config.ts).
4. If docs and code disagree, state:
   - what each source says,
   - which source is authoritative for behavior (usually code),
   - what to update to remove ambiguity.

## Key Files
- [AGENTS.md](AGENTS.md)
- [README.md](README.md)
- [package.json](package.json)
- [biome.json](biome.json)
- [eslint.config.js](eslint.config.js)
- [tsconfig.app.json](tsconfig.app.json)
- [vite.config.ts](vite.config.ts)

## Code Examples
### 1) Typed “doc index” helper (for writing/maintaining docs)
```ts
export interface DocLink {
  title: string
  path: string
}

export interface DocSection {
  heading: string
  links: DocLink[]
}

export function renderDocIndex(sections: DocSection[]): string {
  return sections
    .map(section => {
      const items = section.links
        .map(link => `- [${link.title}](${link.path})`)
        .join('\n')
      return `## ${section.heading}\n\n${items}`
    })
    .join('\n\n')
}
```

### 2) Minimal “source of truth” message type
```ts
export type SourceKind = 'doc' | 'config' | 'code'

export interface SourceNote {
  kind: SourceKind
  file: string
  note: string
}

export function summarizeSources(sources: SourceNote[]) {
  return sources.map(s => `${s.kind.toUpperCase()}: ${s.file} — ${s.note}`)
}
```

## Output Format
Use this exact response structure:

```md
**Answer**
- <direct answer in 2–6 bullets>

**Sources**
- [path/to/file](path/to/file) — <what it confirms>
- [path/to/file](path/to/file) — <what it confirms>

**Notes**
- <call out any ambiguity or doc/code mismatch>

**Next Step**
- <single actionable next step (command to run or file to open)>
```

**Created**: 2026-05-05
**Skill version**: 1.0
