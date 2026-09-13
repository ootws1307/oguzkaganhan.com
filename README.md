# oguzkaganhan.com

Bilingual (TR/EN) personal portfolio with an admin panel. Public GitHub repositories are synced automatically, projects can also be added by hand, and every section of the site is edited, reordered and toggled from the admin.

## Structure

```
apps/web        Public site (Next.js 16, next-intl)                 :3000
apps/admin      Admin panel (Next.js 16, shadcn/ui, GitHub login)   :3001
packages/content  zod schemas + locale helpers shared by both apps
packages/db       Supabase clients, generated types, queries
packages/ui       Design tokens (Tailwind v4) shared by both apps
supabase/         config, migrations, seed, github-sync edge function
docs/supabase-local.md   What each local Docker container does
```

## Local setup

Requirements: Bun 1.3+, Docker Desktop.

```bash
bun install
bun run db:start          # local Supabase in Docker (see docs/supabase-local.md)
```

1. Copy env files and fill in values from `bunx supabase status`:
   - `apps/web/.env.example` → `apps/web/.env.local`
   - `apps/admin/.env.example` → `apps/admin/.env.local` (same `REVALIDATE_SECRET` as web)
   - `supabase/functions/.env.example` → `supabase/functions/.env`
2. Admin login needs a GitHub OAuth App (callback `http://127.0.0.1:54321/auth/v1/callback`).
   Put its id/secret in `supabase/.env` (see `supabase/.env.example`), then `bun run db:stop && bun run db:start`.
   Only the GitHub account in `private.admin_allowlist` can sign up (see the init migration).
3. Let the cron job reach the sync function (once per database reset):

   ```sql
   select vault.create_secret('http://supabase_kong_oguzkaganhan:8000', 'project_url');
   select vault.create_secret('<SYNC_SECRET from supabase/functions/.env>', 'github_sync_secret');
   ```

```bash
bun run dev               # both apps
bun run db:reset          # re-apply migrations + seed.sql
bun run db:types          # regenerate packages/db/src/database.types.ts after schema changes
```

## Checks

```bash
bun run lint              # Biome
bun run typecheck
bun run test              # bun test (schemas, project resolution, GitHub mapping)
bun run build
```

## How content reaches the site

Pages read Supabase through a fetch cache tagged with table names (`apps/web/lib/data.ts`). The admin's server actions and the GitHub sync call `POST /api/revalidate` with those tags after writing, so a save shows up on the next page load without a redeploy.
