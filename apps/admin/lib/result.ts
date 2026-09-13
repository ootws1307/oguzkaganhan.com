import { z } from "zod";

/** The parts of a PostgREST / Supabase error we read. */
type DbError = { code?: string; message?: string };

export type ActionResult<T = undefined> =
  | { ok: true; revalidated: boolean; data?: T }
  | { ok: false; error: string };

/** Turns thrown errors into a message the owner can act on. */
export function failure(error: unknown): { ok: false; error: string } {
  if (error instanceof z.ZodError) {
    const first = error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Geçersiz veri.",
    };
  }
  const pg = error as DbError | null;
  if (pg?.code === "23505") return { ok: false, error: "Bu değer zaten kullanılıyor (ör. slug)." };
  if (pg?.code === "42501") return { ok: false, error: "Bu işlem için yetkin yok." };
  if (pg?.message) return { ok: false, error: pg.message };
  return {
    ok: false,
    error: error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu.",
  };
}
