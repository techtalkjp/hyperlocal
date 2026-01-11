# Task Completion Checklist

## Before Committing Changes

**ALWAYS run `pnpm validate` before creating git commits.**

This runs all quality checks:
1. Format check (Prettier)
2. Lint check (Biome)
3. Type check (TypeScript)
4. Tests (Vitest)

Never rely on typecheck alone - always use the full validate command.

## Git Workflow

**CRITICAL: Never commit directly to main branch.**

1. Create a feature branch: `git checkout -b feature/description`
2. Make changes and commit to feature branch
3. Push branch: `git push -u origin feature/description`
4. Create PR: `gh pr create`
5. Merge via GitHub UI or `gh pr merge`

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
