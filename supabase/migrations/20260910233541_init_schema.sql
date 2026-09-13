-- =============================================================================
-- Portfolio schema: content tables, admin access, signup lock, media storage.
-- Localized columns are jsonb shaped { "tr": ..., "en": ... } and validated by
-- the zod schemas in packages/content.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Private schema: not exposed through the Data API.
-- -----------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Admin access
-- -----------------------------------------------------------------------------

-- GitHub accounts that are allowed to create a user (and become admin).
create table private.admin_allowlist (
  github_id text primary key,
  note text
);

insert into private.admin_allowlist (github_id, note) values ('123778747', 'ootws1307');

create table public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;

-- A signed-in user can see only their own admin row, which is all is_admin() needs.
create policy "admins: read own row" on public.admins
  for select to authenticated
  using (user_id = (select auth.uid()));

create function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

-- Auth hook: reject every signup except allowlisted GitHub accounts.
create function private.before_user_created(event jsonb)
returns jsonb
language plpgsql
set search_path = ''
as $$
declare
  v_provider text := event -> 'user' -> 'app_metadata' ->> 'provider';
  v_github_id text := coalesce(
    event -> 'user' -> 'user_metadata' ->> 'provider_id',
    event -> 'user' -> 'user_metadata' ->> 'sub'
  );
begin
  if v_provider = 'github'
     and exists (select 1 from private.admin_allowlist a where a.github_id = v_github_id) then
    return '{}'::jsonb;
  end if;

  return jsonb_build_object(
    'error', jsonb_build_object('http_code', 403, 'message', 'Sign-ups are closed.')
  );
end;
$$;

grant usage on schema private to supabase_auth_admin;
grant select on private.admin_allowlist to supabase_auth_admin;
grant execute on function private.before_user_created(jsonb) to supabase_auth_admin;
revoke execute on function private.before_user_created(jsonb) from public, anon, authenticated;

-- Promote the allowlisted account to admin when its GitHub identity is linked.
-- auth.identities.provider_id is set by Auth from GitHub itself and cannot be
-- edited by the user, unlike user_metadata.
create function private.grant_admin_on_github_identity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.provider = 'github'
     and exists (select 1 from private.admin_allowlist a where a.github_id = new.provider_id) then
    insert into public.admins (user_id) values (new.user_id) on conflict do nothing;
  end if;
  return new;
end;
$$;
revoke execute on function private.grant_admin_on_github_identity() from public, anon, authenticated;

create trigger on_auth_identity_created
  after insert on auth.identities
  for each row execute function private.grant_admin_on_github_identity();

-- -----------------------------------------------------------------------------
-- Site settings (single row)
-- -----------------------------------------------------------------------------
create table public.site_settings (
  id boolean primary key default true check (id),
  site_name text not null,
  seo_title jsonb not null default '{"tr": "", "en": ""}',
  seo_description jsonb not null default '{"tr": "", "en": ""}',
  og_image_path text,
  avatar_path text,
  -- Downloadable CV per locale: { "tr": "<storage path>" | null, "en": ... }
  cv_paths jsonb not null default '{"tr": null, "en": null}',
  github_username text not null,
  auto_publish_new_repos boolean not null default false,
  last_github_sync_at timestamptz,
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Sections: fixed set of section types, each ordered, toggleable and editable.
-- -----------------------------------------------------------------------------
create type public.section_key as enum ('hero', 'about', 'projects', 'experience', 'skills', 'contact');

create table public.sections (
  id uuid primary key default gen_random_uuid(),
  key public.section_key not null unique,
  position integer not null default 0,
  is_visible boolean not null default true,
  content jsonb not null default '{}' check (jsonb_typeof(content) = 'object'),
  options jsonb not null default '{}' check (jsonb_typeof(options) = 'object'),
  updated_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- GitHub repos (raw sync cache) and projects (the list the site shows)
-- -----------------------------------------------------------------------------
create table public.github_repos (
  id bigint primary key,
  name text not null,
  full_name text not null,
  description text,
  html_url text not null,
  homepage text,
  language text,
  topics text[] not null default '{}',
  stars integer not null default 0,
  forks integer not null default 0,
  is_fork boolean not null default false,
  is_archived boolean not null default false,
  pushed_at timestamptz,
  readme_md text,
  synced_at timestamptz not null default now(),
  removed_at timestamptz
);

create type public.project_source as enum ('github', 'custom');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  source public.project_source not null,
  github_repo_id bigint unique references public.github_repos (id) on delete cascade,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title jsonb not null default '{"tr": "", "en": ""}',
  summary jsonb not null default '{"tr": "", "en": ""}',
  body_md jsonb not null default '{"tr": "", "en": ""}',
  tech text[] not null default '{}',
  repo_url text,
  live_url text,
  cover_path text,
  is_featured boolean not null default false,
  is_visible boolean not null default false,
  position integer not null default 0,
  started_on date,
  ended_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_github_has_repo check (source = 'custom' or github_repo_id is not null)
);
create index projects_position_idx on public.projects (position);

-- Screenshots shown on a project's detail page, in admin-defined order.
create table public.project_images (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects (id) on delete cascade,
  path text not null,
  alt jsonb not null default '{"tr": "", "en": ""}',
  width integer,
  height integer,
  position integer not null default 0,
  created_at timestamptz not null default now()
);
create index project_images_project_id_idx on public.project_images (project_id, position);

-- -----------------------------------------------------------------------------
-- Experience, skills, contact
-- -----------------------------------------------------------------------------
create type public.experience_kind as enum ('work', 'education');

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  kind public.experience_kind not null,
  organization text not null,
  role jsonb not null default '{"tr": "", "en": ""}',
  location text not null default '',
  url text,
  description_md jsonb not null default '{"tr": "", "en": ""}',
  started_on date not null,
  ended_on date check (ended_on is null or ended_on >= started_on),
  is_visible boolean not null default true,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.skill_groups (
  id uuid primary key default gen_random_uuid(),
  name jsonb not null default '{"tr": "", "en": ""}',
  is_visible boolean not null default true,
  position integer not null default 0,
  updated_at timestamptz not null default now()
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.skill_groups (id) on delete cascade,
  name text not null,
  position integer not null default 0
);
create index skills_group_id_idx on public.skills (group_id);

create type public.contact_kind as enum ('email', 'github', 'linkedin', 'x', 'website', 'other');

create table public.contact_links (
  id uuid primary key default gen_random_uuid(),
  kind public.contact_kind not null,
  label text not null,
  url text not null,
  is_visible boolean not null default true,
  position integer not null default 0
);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
create trigger set_updated_at before update on public.site_settings
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.sections
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.projects
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.experiences
  for each row execute function private.set_updated_at();
create trigger set_updated_at before update on public.skill_groups
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row level security
-- Visitors (anon) read only visible rows; the admin reads and writes everything.
-- -----------------------------------------------------------------------------
alter table public.site_settings enable row level security;
alter table public.sections enable row level security;
alter table public.github_repos enable row level security;
alter table public.projects enable row level security;
alter table public.project_images enable row level security;
alter table public.experiences enable row level security;
alter table public.skill_groups enable row level security;
alter table public.skills enable row level security;
alter table public.contact_links enable row level security;

create policy "site_settings: public read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings: admin update" on public.site_settings
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- Tables with an is_visible flag share the same four policies.
do $$
declare
  t text;
begin
  foreach t in array array['sections', 'projects', 'experiences', 'skill_groups', 'contact_links'] loop
    execute format(
      'create policy "%1$s: read visible or admin" on public.%1$I for select to anon, authenticated
         using (is_visible or (select public.is_admin()))', t);
    execute format(
      'create policy "%1$s: admin insert" on public.%1$I for insert to authenticated
         with check ((select public.is_admin()))', t);
    execute format(
      'create policy "%1$s: admin update" on public.%1$I for update to authenticated
         using ((select public.is_admin())) with check ((select public.is_admin()))', t);
    execute format(
      'create policy "%1$s: admin delete" on public.%1$I for delete to authenticated
         using ((select public.is_admin()))', t);
  end loop;
end;
$$;

-- A skill is visible when its group is (the subquery is itself filtered by RLS).
create policy "skills: read with visible group" on public.skills
  for select to anon, authenticated
  using (exists (select 1 from public.skill_groups g where g.id = group_id));
create policy "skills: admin insert" on public.skills
  for insert to authenticated with check ((select public.is_admin()));
create policy "skills: admin update" on public.skills
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "skills: admin delete" on public.skills
  for delete to authenticated using ((select public.is_admin()));

-- Images are visible with their project (the subquery is itself filtered by RLS).
create policy "project_images: read with visible project" on public.project_images
  for select to anon, authenticated
  using (exists (select 1 from public.projects p where p.id = project_id));
create policy "project_images: admin insert" on public.project_images
  for insert to authenticated with check ((select public.is_admin()));
create policy "project_images: admin update" on public.project_images
  for update to authenticated
  using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "project_images: admin delete" on public.project_images
  for delete to authenticated using ((select public.is_admin()));

-- Repo data is readable when a visible project points at it. Only the sync
-- function (service role, bypasses RLS) writes here; the admin may read all.
create policy "github_repos: read linked visible or admin" on public.github_repos
  for select to anon, authenticated
  using (
    (select public.is_admin())
    or exists (select 1 from public.projects p where p.github_repo_id = github_repos.id)
  );

-- -----------------------------------------------------------------------------
-- Grants (explicit, independent of the project's auto-expose setting)
-- -----------------------------------------------------------------------------
grant execute on function public.is_admin() to anon, authenticated;
grant select on public.admins to authenticated;
grant select on
  public.site_settings, public.sections, public.github_repos, public.projects,
  public.project_images, public.experiences, public.skill_groups, public.skills,
  public.contact_links
  to anon, authenticated;
grant update on public.site_settings to authenticated;
grant insert, update, delete on
  public.sections, public.projects, public.project_images, public.experiences,
  public.skill_groups, public.skills, public.contact_links
  to authenticated;

-- -----------------------------------------------------------------------------
-- Media storage (images and CV PDFs): public read by URL, admin-only writes.
-- -----------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/avif', 'image/svg+xml', 'application/pdf']
)
on conflict (id) do nothing;

-- Upsert needs select + insert + update.
create policy "media: admin select" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin update" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select public.is_admin()))
  with check (bucket_id = 'media' and (select public.is_admin()));
create policy "media: admin delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select public.is_admin()));

-- -----------------------------------------------------------------------------
-- Rows the site cannot work without (content is filled in from the admin).
-- -----------------------------------------------------------------------------
insert into public.site_settings (site_name, github_username, seo_title, seo_description)
values (
  'Oğuz Kağan Han',
  'ootws1307',
  '{"tr": "Oğuz Kağan Han", "en": "Oğuz Kağan Han"}',
  '{"tr": "", "en": ""}'
);

insert into public.sections (key, position, content, options) values
  ('hero', 0,
   '{"tr": {"title": "Oğuz Kağan Han", "subtitle": "", "body_md": "", "status": ""},
     "en": {"title": "Oğuz Kağan Han", "subtitle": "", "body_md": "", "status": ""}}',
   '{"show_photo": true, "show_status": false, "show_cv": true}'),
  ('about', 1,
   '{"tr": {"title": "Hakkımda", "body_md": ""}, "en": {"title": "About", "body_md": ""}}',
   '{"show_photo": false}'),
  ('projects', 2,
   '{"tr": {"title": "Projeler", "intro": ""}, "en": {"title": "Projects", "intro": ""}}',
   '{"max_items": 0, "featured_only": false, "show_github_stats": true}'),
  ('experience', 3,
   '{"tr": {"title": "Deneyim", "intro": ""}, "en": {"title": "Experience", "intro": ""}}',
   '{"show_education": true}'),
  ('skills', 4,
   '{"tr": {"title": "Yetenekler", "intro": ""}, "en": {"title": "Skills", "intro": ""}}',
   '{}'),
  ('contact', 5,
   '{"tr": {"title": "İletişim", "body_md": ""}, "en": {"title": "Contact", "body_md": ""}}',
   '{"show_email": true}');
