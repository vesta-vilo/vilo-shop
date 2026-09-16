# Vilo

Static marketing site (product landing pages, blog, FAQ, team bios) built with **Vite in multi-page mode**. Every route is a physical `index.html` file under `src/` — Vite discovers them automatically, so adding a page is just adding a file.

See [CLAUDE.md](CLAUDE.md) for the full architecture notes (HTML partials, islands, styles, assets), and [src/scripts/README.md](src/scripts/README.md) for the client-side scripts — including how product forms fetch Shopify pricing and drive the buy button.

## Getting started

Package manager is **pnpm**.

```bash
pnpm install
pnpm dev        # start the Vite dev server
pnpm build      # build to dist/
pnpm preview    # preview the production build
```

## Branches and environments

| Branch | Environment |
|--------|-------------|
| `main` | **Production website** |
| `staging` | **Staging website** |

Both branches are long-lived. Pushing to either one deploys the corresponding site automatically — there is no manual deploy step.

> `staging` is not guaranteed to be in sync with `main`. It can drift ahead or behind, so always diff against the branch you actually care about instead of assuming they match.

## Development flow

**1. Branch off `main`**

Always start from the latest `main`, never from `staging`.

```bash
git switch main
git pull
git switch -c vilo-123       # or fix/vilo-123
```

Branches are named `vilo-<ticket-number>` (or `fix/vilo-<ticket-number>`) after the issue tracker ticket.

**2. Write the code and push to `staging`**

Merge your branch into `staging` and push it. **Merging into `staging` automatically updates the staging website**, so the change is live for preview within a few minutes.

```bash
git switch staging
git pull
git merge vilo-123
git push origin staging
```

**3. Review on the staging website**

Check the change on the staging site and get it approved there. Any fixes go through the same loop: commit on your branch, merge into `staging`, push.

**4. Open a PR from `staging` to `main` — do NOT merge it**

Once the change is approved on staging, open a pull request from `staging` into `main`.

> ⚠️ **Do not merge this PR.** Merging into `main` is the Vilo team's responsibility — they own the release to production. Open the PR, describe the change, and leave it for them.

By the time the PR is opened it should be ready to ship as-is. It is the final gate, not a place to make further changes.

## Flow at a glance

```
main  ──▶  feature branch (vilo-123)
                   │
                   ▼
              merge into staging  ──▶  staging website (auto-deploy)
                   │
                   ▼
           PR: staging ──▶ main   (DO NOT MERGE — Vilo team merges)
                   │
                   ▼
                 main  ──▶  production website (auto-deploy)
```
