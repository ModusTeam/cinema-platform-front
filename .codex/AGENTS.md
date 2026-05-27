# AGENTS.md - Personal Baseline

These instructions define personal developer preferences only. Repository
instructions, architecture, commands, and constraints belong in the active
project's own `AGENTS.md` files and always take precedence for that project.

## Mindset

- Operate as a Silent Professional: highly functional, uncluttered, and
  strictly minimalist.
- Treat the repository as the source of truth. Inspect the code before
  deciding how a system works.
- Keep responses and changes direct, precise, and free of unnecessary noise.

## Code Style & Architecture

- Enforce a minimalist aesthetic: clear, readable code using modern programming
  patterns.
- Code is the primary documentation. Do not create separate docs files unless a
  concept cannot be expressed clearly in code.
- Write zero comments for what the code does. Use comments strictly to explain
  why a function is needed or why a specific pattern was chosen.
- Prefer functional programming principles. Write pure functions that only
  modify return values, never input parameters or global state.
- Use OOP classes exclusively for connectors and interfaces to external systems.
- For backend development, enforce clean, transactional, and decoupled
  architectures, specifically CQRS and MediatR patterns.
- Follow DRY, KISS, and YAGNI principles relentlessly.
- Enforce strict typing everywhere, including function returns, variables, and
  collections.
- Avoid untyped variables, generic types, and implicit fallbacks.
- Never use default parameter values. Make all parameters explicit.
- Keep all imports at the top of the file.
- Write single-purpose functions with no multi-mode flag parameters.
- Match the existing repository style and established local patterns.
- Keep changes minimal and directly related to the current request.

## Error Handling

- Always raise errors explicitly. Never silently ignore them or hide them behind
  catch-all exception handlers.
- Use specific error types that clearly indicate the failure.
- Ensure error messages include actionable context, including request params,
  response body, and status codes when available.
- Logging must use structured fields instead of interpolating dynamic values
  into message strings.
- Fix root causes, not symptoms.
- Do not add safety fallbacks unless explicitly requested.

## Tooling & Dependencies

- Inspect the repository and read active `AGENTS.md` files before making edits.
- Use the package manager and commands declared by the repository.
- Prefer modern package management files.
- Install dependencies in project environments, never globally.
- Read installed dependency source code when needed instead of guessing
  behavior.
- Use non-interactive commands with flags.
- Prefer `rg` for search and `git --no-pager diff` for diffs.
- Keep imports, formatting, and generated files aligned with the repository's
  configured tooling.

## Testing

- Respect the current repository testing strategy.
- Do not add new unit tests by default.
- When tests are needed, prefer integration, end-to-end, or smoke tests that
  validate real behavior over unit tests.
- Avoid mocks when real service calls are practical.
- Never add unit tests just to pad coverage numbers.
- Do not claim tests were run unless an actual configured command was run.

## Security

- Never commit secrets, credentials, local environment files, or machine-specific
  configuration.
- Do not introduce XSS, injection, unsafe deserialization, or token-handling
  shortcuts.
- Keep authentication and authorization behavior consistent with the existing
  system unless intentionally changing the full flow.

## Workflow & Commits

- Keep the working tree in a clean review state with focused diffs.
- Preserve user changes. Never revert unrelated work unless explicitly asked.
- Never create a git commit unless explicitly asked.
- Keep changes uncommitted so the diff remains reviewable.
- Verify with the repository's configured checks when code, configuration, or
  examples change.
- For documentation-only changes, run code checks only when the repository asks
  for them or the edit affects executable examples.
