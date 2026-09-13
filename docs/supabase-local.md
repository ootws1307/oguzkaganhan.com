# Lokal Supabase: Docker container'ları nasıl çalışıyor?

`bunx supabase start` komutu, bilgisayarında Supabase'in bulutta çalıştırdığı servislerin küçük bir kopyasını Docker container'ları olarak ayağa kaldırır. Bu doküman her container'ın ne işe yaradığını, birbirleriyle nasıl konuştuklarını ve verinin nerede durduğunu anlatır.

## Önce üç kavram

- **Image (imaj)**: Bir programın çalışmak için ihtiyaç duyduğu her şeyi (işletim sistemi katmanı, kütüphaneler, binary) içeren salt okunur paket. Örnek: `public.ecr.aws/supabase/postgres:17.6.1.167`. İlk `supabase start`'ta indirilir ve sonraki çalıştırmalarda önbellekten kullanılır.
- **Container**: Bir imajın çalışan örneği, izole bir süreç gibi düşünebilirsin. Kendi dosya sistemi, ağ arayüzü ve süreç listesi vardır. Silinip yeniden oluşturulabilir, bu yüzden kalıcı veri container'ın içinde değil **volume**'da tutulur.
- **Volume**: Container silinse bile yaşayan, Docker'ın yönettiği disk alanı. Veritabanı dosyaları burada durur.

## Bu projede çalışan container'lar

İsimler `supabase_<servis>_<project_id>` kalıbındadır. `project_id`, `supabase/config.toml`'da `oguzkaganhan` olarak ayarlı. Bu sayede başka bir projenin stack'iyle karışmazlar.

| Container | İmaj | Host portu → container portu | Ne yapar |
|---|---|---|---|
| `supabase_db` | postgres 17 | 54322 → 5432 | **Asıl veritabanı.** Tablolar, RLS politikaları, fonksiyonlar, `auth.users`, storage metadata'sı: her şey burada. Diğer servislerin hepsi sonunda buraya bağlanır. |
| `supabase_kong` | kong 2.8 | **54321** → 8000 | **API gateway (kapı görevlisi).** Dışarıdan gelen tüm API isteklerini karşılar, `apikey` başlığını kontrol eder ve yola göre doğru servise yönlendirir. Uygulamamız sadece bu adresi bilir: `http://127.0.0.1:54321`. |
| `supabase_rest` | PostgREST | (dışa kapalı) 3000 | Postgres tablolarını otomatik olarak REST API'ye çevirir. `GET /rest/v1/projects?is_visible=eq.true` çağrısı burada SQL'e dönüşür. İsteği gönderenin JWT'sindeki role (`anon` / `authenticated`) göre çalışır, **RLS de burada devreye girer**. |
| `supabase_auth` | GoTrue | (dışa kapalı) 9999 | Giriş ve oturum servisi. GitHub OAuth akışını yönetir, JWT üretir, yeni kullanıcı açılmadan önce bizim `private.before_user_created` hook'umuzu çağırır. |
| `supabase_storage` | storage-api | (dışa kapalı) 5000 | Dosya yükleme ve indirme (kapak görselleri, profil fotoğrafı). Dosyaların kendisi volume'da, metadata'sı (`storage.objects`) Postgres'te durur. Yetki kontrolü yine RLS ile yapılır. |
| `supabase_edge_runtime` | edge-runtime (Deno) | (dışa kapalı) | Edge Function'larını çalıştırır. `github-sync` fonksiyonumuz burada koşar. Erişim Kong üzerinden: `/functions/v1/github-sync`. |
| `supabase_studio` | studio | **54323** → 3000 | Tarayıcıda açılan yönetim arayüzü (tablo editörü, SQL editörü). Aç: http://127.0.0.1:54323 |
| `supabase_pg_meta` | postgres-meta | (dışa kapalı) 8080 | Studio'nun arka ucu. "Bu veritabanında hangi tablolar ve sütunlar var?" sorularını Postgres'e sorup JSON'a çevirir. |
| `supabase_inbucket` | Mailpit | **54324** → 8025 | Sahte e-posta kutusu. Lokal ortamda gönderilen e-postalar gerçekten gönderilmez, burada görünür. (Biz GitHub ile giriş yaptığımız için pek kullanılmayacak.) |
| `supabase_analytics` | Logflare | 54327 → 4000 | Log deposu ve sorgu motoru. Studio'daki "Logs" ekranı buradan beslenir. Stack'teki en çok bellek kullanan container (~580 MB). |
| `supabase_vector` | Vector | (port yok) | Log toplayıcı. Diğer container'ların loglarını okuyup Logflare'e taşır. |

**Çalışmayanlar (bilerek kapattıklarımız):**
- `realtime`: Tablo değişikliklerini WebSocket ile canlı yayınlar. Sitemizde canlı abonelik yok, bu yüzden `config.toml`'da `[realtime] enabled = false` yaptık.
- `pooler` (Supavisor): Çok sayıda bağlantıyı az sayıda Postgres bağlantısına toplar. Lokal ortamda gerek yok, varsayılan olarak kapalı.
- `imgproxy`: Görsel dönüştürme. Sadece Pro planda var, kapalı.

## Bir istek nasıl akıyor?

```
Tarayıcı / Next.js
     │  GET http://127.0.0.1:54321/rest/v1/projects   (apikey: sb_publishable_…)
     ▼
Host portu 54321 ──(Docker port yönlendirmesi)──► supabase_kong :8000
     │  yol /rest/v1 → "rest" servisi
     ▼
supabase_rest :3000  (PostgREST, JWT'den rolü anlar: anon)
     │  SQL:  set role anon; select … from projects;
     ▼
supabase_db :5432  (RLS: sadece is_visible = true satırlar döner)
```

Container'lar birbirini **isimle** bulur. Hepsi `supabase_network_oguzkaganhan` adlı bir Docker **bridge ağına** bağlıdır ve Docker'ın dahili DNS'i `supabase_db` gibi isimleri doğru IP'ye çözer. Bu yüzden Kong'un ayarında `http://supabase_rest_oguzkaganhan:3000` gibi adresler yazar. Host'a (senin Mac'ine) sadece portu yayınlanmış servisler açıktır (tablodaki kalın portlar ve 54322/54327). `rest` ya da `auth` doğrudan dışarı açık değildir, her şey Kong'dan geçer.

### Edge runtime'ın iki huyu

**Kod bir bind mount ile gelir, ama bellekte önbelleğe alınır.** `docker inspect supabase_edge_runtime_oguzkaganhan` çıktısındaki `Mounts` kısmına bakarsan `supabase/functions` klasörünün container'a **bind mount** edildiğini görürsün: container kopya değil, senin diskindeki dosyanın kendisini okur. Buna rağmen runtime, fonksiyonu bir kez yükledikten sonra çalışan "worker"ı bir süre sıcak tutar. Kodu değiştirdiğinde eski sürüm çalışmaya devam edebilir. Çözüm yalnızca o container'ı yeniden başlatmak:

```bash
docker restart supabase_edge_runtime_oguzkaganhan
```

**Container'dan senin Mac'ine ulaşmak.** Fonksiyon, sync bitince sitenin `/api/revalidate` adresini çağırır. Ama container'ın içinde `localhost` container'ın kendisidir, senin Mac'in değil. Docker Desktop bunun için özel bir isim verir: `host.docker.internal`. Bu yüzden `supabase/functions/.env` içinde `REVALIDATE_URL=http://host.docker.internal:3000/api/revalidate` yazar. Next.js dev sunucusu kapalıysa istek ulaşamaz, sync yine başarılı olur ama cevapta `"revalidated": false` görürsün ve `docker logs supabase_edge_runtime_oguzkaganhan` nedenini yazar.

## Veri nerede duruyor?

```bash
docker volume ls --filter label=com.supabase.cli.project=oguzkaganhan
```

- `supabase_db_oguzkaganhan`: Postgres veri dosyaları
- `supabase_storage_oguzkaganhan`: yüklenen dosyalar
- `supabase_edge_runtime_oguzkaganhan`: Deno bağımlılık önbelleği

## Sık kullanılan komutlar

```bash
bunx supabase status                     # URL'ler ve anahtarlar
docker ps                                # çalışan container'lar
docker stats                             # canlı CPU/bellek kullanımı
docker logs -f supabase_auth_oguzkaganhan   # auth loglarını canlı izle (GitHub girişi sorunlarında)
docker exec -it supabase_db_oguzkaganhan psql -U postgres   # veritabanına psql ile bağlan
bunx supabase db reset                   # veritabanını sil, migration + seed.sql'i baştan uygula
bunx supabase stop                       # container'ları durdur, VERİ KALIR (volume'lar silinmez)
bunx supabase stop --no-backup           # container'ları durdur ve volume'ları SİL (temiz sayfa)
```

## `config.toml` ile container'ları açıp kapatmak

`supabase/config.toml` içindeki her `[servis]` bloğunda bir `enabled` anahtarı vardır. Bir servisi kapatıp `supabase stop && supabase start` yaparsan o container hiç oluşturulmaz. Örneğin bellek sıkışırsa `[analytics] enabled = false` ile Logflare ve Vector'u kapatıp yaklaşık 670 MB kazanabilirsin. Bedeli, Studio'daki log ekranlarının boş kalmasıdır.

## Lokal ve bulut arasındaki fark

Lokal stack, buluttaki Supabase projesinin aynı servislerini çalıştırır. Şema değişiklikleri `supabase/migrations/` altındaki SQL dosyalarında tutulur. Deploy aşamasında `bunx supabase db push`, bu migration'ları buluttaki projeye uygular. Lokal veriler (seed dahil) buluta taşınmaz, sadece şema taşınır.
