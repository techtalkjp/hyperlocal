# Task Completion Checklist

## Before Committing Changes

**ALWAYS run `pnpm validate` before creating git commits.**

This runs all quality checks:

1. Format check (Oxfmt via `vp fmt`)
2. Lint check (Oxlint via `vp lint`)
3. Type check (TypeScript)
4. Tests (Vitest)

Never rely on typecheck alone - always use the full validate command.

## Git Workflow

Direct commits and pushes to main are allowed. Run `pnpm validate` first.

## Implementation Checklist

Before considering a task complete:

- [ ] Code follows existing patterns in the codebase
- [ ] No security vulnerabilities (XSS, SQL injection, etc.)
- [ ] Changes are minimal - no over-engineering
- [ ] No unnecessary comments, docstrings, or type annotations added
- [ ] JSON fields handled correctly (auto-parsed by Kysely plugin)
- [ ] UI follows design-policy.md principles:
  - Operations don't block users
  - Immediate feedback provided
  - Easy state recovery
  - Predictable behavior

## Documentation Policy

When creating technical documents in `docs/`:

- Save in `docs/journals/YYYY-MM-DD/` directory
- Write in natural Japanese prose
- Focus on "why" and "what"
- Start with context and motivation
- Avoid excessive bullet points, tables, emojis
