import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { KeyRound, Loader2 } from "lucide-react";

import { EmptyState } from "../components/empty-state";
import { exchangeNativeAuthCallback, migrateLocalToServer } from "../lib/auth-google";
import { notifyGoogleSynced } from "../lib/notify";

/**
 * #100: jembatan callback OAuth. Deep-link `app.caksara.web://auth/callback`
 * membuka route ini lewat intent-filter; tukar `code` PKCE (atau token
 * implicit) jadi sesi, migrasikan progres lokal (#89), lalu kembali ke
 * beranda. Tanpa kredensial valid tampilkan EmptyState — bukan crash.
 */
export default function AuthCallback() {
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void settleNativeCallback(window.location.href).then((ok) => {
      if (cancelled) return;
      if (ok) navigate("/", { replace: true });
      else setFailed(true);
    });
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  if (failed) return <ExpiredLink />;
  return <Settling />;
}

async function settleNativeCallback(href: string): Promise<boolean> {
  const settled = await exchangeNativeAuthCallback(href);
  if (!settled) return false;
  const ok = await migrateLocalToServer(settled);
  if (ok) notifyGoogleSynced();
  return true;
}

function Settling() {
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-4 md:max-w-2xl">
      <div className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 ring-1 ring-border">
        <Loader2 className="size-4 animate-spin text-primary" />
        <span className="text-xs font-medium text-muted-foreground">Menyiapkan akunmu...</span>
      </div>
    </div>
  );
}

function ExpiredLink() {
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-4 md:max-w-2xl">
      <EmptyState
        illustration={<KeyRound className="size-7" />}
        title="Tautan masuk kedaluwarsa"
        body="Kode login tidak terbaca atau sudah dipakai. Coba masuk lagi dari beranda."
        action={
          <Link
            to="/"
            className="flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-95"
          >
            Kembali ke Beranda
          </Link>
        }
      />
    </div>
  );
}
