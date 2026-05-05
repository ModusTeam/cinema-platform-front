# Agent Skills — Cinema Platform Frontend

Agent Skills are on-demand, task-specific instruction files that Copilot can load when you invoke a domain skill. They keep deep guidance out of the always-on prompt while still making complex work repeatable.

## Available skills

| Skill name | Purpose | Example invocation |
|---|---|---|
| `cinema-docs` | Find and answer questions from project documentation and conventions | `/cinema-docs What are the repo coding conventions?` |
| `cinema-structure` | Navigate the codebase quickly (routes/layouts/features/services/types) | `/cinema-structure Where is the admin sidebar menu defined?` |
| `cinema-api` | Work with API services, auth, Axios interceptors, React Query fetching | `/cinema-api Add a typed service + hook for /movies/{id}` |
| `cinema-components` | Understand/create UI components using Tailwind tokens and existing primitives | `/cinema-components Create a reusable empty-state component` |
| `cinema-forms` | Build forms with RHF + Zod + shared Input, including validation UX | `/cinema-forms Add a profile edit form with schema validation` |

## copilot-instructions.md vs skills

### copilot-instructions.md
- Always loaded: short, non-negotiable repo rules and the most common patterns
- Optimized for staying under a small token budget and preventing bad defaults

### Skills
- Loaded only when invoked: deeper workflows, file maps, and domain-specific examples
- Designed to be self-contained so an agent can execute without guessing

## Compatibility
- GitHub Copilot in VS Code
- GitHub Copilot CLI
- GitHub Copilot Coding Agent
- Claude Code

## When to update skills
- You add/rename routes, layouts, or major folders
- You change API base URLs, auth flows, or Axios interceptors
- You adopt a new UI primitive (form controls, modals, toasts) or new design tokens
- You add testing tooling (Vitest) or change build/lint scripts

**Created**: 2026-05-05
**Skill version**: 1.0
