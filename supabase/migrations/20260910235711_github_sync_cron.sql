-- Runs the github-sync edge function every 6 hours.
--
-- The job reads two Vault secrets, which are set once per environment (never in git):
--   select vault.create_secret('<project url>', 'project_url');
--       local:      http://supabase_kong_oguzkaganhan:8000   (Kong, by container name)
--       production: https://<project-ref>.supabase.co
--   select vault.create_secret('<same value as the function SYNC_SECRET>', 'github_sync_secret');
-- Until they exist the job's request simply fails; nothing else is affected.

create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

select cron.schedule(
  'github-sync',
  '0 */6 * * *',
  $$
  select net.http_post(
    url := (select decrypted_secret from vault.decrypted_secrets where name = 'project_url')
      || '/functions/v1/github-sync',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-sync-secret', (select decrypted_secret from vault.decrypted_secrets where name = 'github_sync_secret')
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 60000
  );
  $$
);
