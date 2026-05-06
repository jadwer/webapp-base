# lwm-codebase

WordPress-style monorepo for LWM ERP. Master alive (`apps/template`) + shared `@lwm/*` packages consumed by client repos.

## Quick start

```bash
pnpm install
pnpm dev          # starts apps/template Next.js dev server
pnpm build        # builds all packages + template
pnpm test         # runs all tests
```

## Structure

| Path | Contains |
|---|---|
| `apps/template/` | Next.js 15 demo. Master alive. |
| `packages/<name>/` | `@lwm/<name>` published to GitHub Packages. |
| `legacy_files/` | Historical docs pre-refactor (not part of build). |

## Contributing

1. Make changes in a package or in `apps/template`.
2. If a package changed, run `pnpm changeset` to record the bump.
3. Commit (manually — see [CLAUDE.md](./CLAUDE.md) for git policy).

## Architecture

See [CLAUDE.md](./CLAUDE.md) for the WordPress-style refactor strategy.
Full plan: `~/.claude/plans/zesty-snacking-dijkstra.md`.
