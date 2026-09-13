-- Local development sample data. Everything marked [ÖRNEK]/[SAMPLE] is synthetic
-- and exists only so every section renders; replace it from the admin panel.

update public.sections set content = jsonb_set(
  jsonb_set(content, '{tr,subtitle}', '"[ÖRNEK] Yazılım geliştirici"'),
  '{en,subtitle}', '"[SAMPLE] Software developer"'
) where key = 'hero';

update public.sections set content = jsonb_set(
  jsonb_set(content, '{tr,body_md}', '"[ÖRNEK] Bu metin admin panelindeki **Hakkımda** bölümünden düzenlenir."'),
  '{en,body_md}', '"[SAMPLE] This text is edited from the **About** section in the admin panel."'
) where key = 'about';

insert into public.projects (source, slug, title, summary, body_md, tech, repo_url, live_url, is_featured, is_visible, position)
values (
  'custom',
  'oguzkaganhan-com',
  '{"tr": "oguzkaganhan.com", "en": "oguzkaganhan.com"}',
  '{"tr": "Bu site: GitHub repolarını senkronize eden, her bölümü yönetici panelinden düzenlenebilen iki dilli portfolyo.",
    "en": "This site: a bilingual portfolio that syncs GitHub repositories and lets every section be edited from an admin panel."}',
  '{"tr": "", "en": ""}',
  array['Next.js', 'Supabase', 'Turborepo', 'Bun', 'Tailwind CSS'],
  'https://github.com/ootws1307',
  'https://oguzkaganhan.com',
  true,
  true,
  0
);

insert into public.experiences (kind, organization, role, location, description_md, started_on, ended_on, position)
values
  ('work', '[SAMPLE] Example Company',
   '{"tr": "[ÖRNEK] Yazılım Geliştirici", "en": "[SAMPLE] Software Developer"}',
   'İstanbul',
   '{"tr": "[ÖRNEK] Admin panelinden gerçek deneyimle değiştir.", "en": "[SAMPLE] Replace with real experience from the admin panel."}',
   '2024-01-01', null, 0),
  ('education', '[SAMPLE] Example University',
   '{"tr": "[ÖRNEK] Bilgisayar Mühendisliği", "en": "[SAMPLE] Computer Engineering"}',
   'İstanbul',
   '{"tr": "", "en": ""}',
   '2019-09-01', '2023-06-30', 1);

with g as (
  insert into public.skill_groups (name, position)
  values ('{"tr": "[ÖRNEK] Diller", "en": "[SAMPLE] Languages"}', 0)
  returning id
)
insert into public.skills (group_id, name, position)
select g.id, s.name, s.position
from g, (values ('TypeScript', 0), ('SQL', 1)) as s (name, position);

insert into public.contact_links (kind, label, url, position)
values ('github', 'GitHub', 'https://github.com/ootws1307', 0);
