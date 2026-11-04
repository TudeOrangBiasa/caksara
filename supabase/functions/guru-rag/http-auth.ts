/// <reference lib="deno.ns" />
// HTTP + auth helper Edge guru-rag. Disuntik via fetchJsonWithAuth agar
// handler bisa diuji outcome-nya dari bun tanpa network (lihat guru-rag.test.ts).

/** Hasil GET REST terautentikasi: ok=false pada status non-2xx / jaringan. */
export async function fetchJsonWithAuth<T>(
  url: string,
  secretKey: string,
): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    const res = await fetch(url, {
      headers: { apikey: secretKey, Authorization: `Bearer ${secretKey}` },
    });
    if (!res.ok) return { ok: false };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false };
  }
}

/** Tukar header Authorization → profile id lewat /auth/v1/user. */
export async function authProfileId(
  supabaseUrl: string,
  publishableKey: string,
  req: Request,
): Promise<string> {
  const auth = req.headers.get("authorization") ?? "";
  const res = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: auth },
  });
  if (!res.ok) throw new Error("unauthorized");
  const user = (await res.json()) as { id?: string };
  if (!user.id) throw new Error("unauthorized");
  return user.id;
}
