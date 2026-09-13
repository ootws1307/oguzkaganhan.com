/**
 * Tells the public site which tables changed. Tags are table names; the site
 * tags every cached read with the table it hits (apps/web/lib/data.ts).
 * Returns false when the site could not be reached, so the UI can say so.
 */
export async function revalidateSite(tags: string[]): Promise<boolean> {
  const url = process.env.WEB_URL;
  const secret = process.env.REVALIDATE_SECRET;
  if (!url || !secret) return false;

  try {
    const res = await fetch(`${url}/api/revalidate`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-revalidate-secret": secret },
      body: JSON.stringify({ tags }),
      cache: "no-store",
    });
    return res.ok;
  } catch {
    return false;
  }
}
