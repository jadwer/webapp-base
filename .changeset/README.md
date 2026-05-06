# Changesets

This directory drives semver versioning + GitHub Packages publishing for `@lwm/*` packages.

## Workflow

1. After making changes that affect a package, run from monorepo root:
   ```
   pnpm changeset
   ```
   Pick the packages affected, the bump type (patch/minor/major), and write a short summary.

2. Commit the generated `.changeset/<name>.md` file.

3. When ready to release, run:
   ```
   pnpm version    # consumes changesets, bumps versions, updates CHANGELOG.md
   pnpm release    # builds and publishes to GitHub Packages
   ```

The `apps/template` workspace is excluded from publishing — it is the demo/master, not a published package.
