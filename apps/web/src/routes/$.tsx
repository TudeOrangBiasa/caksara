import { Link } from "react-router";
import { MapPinOff } from "lucide-react";

import { EmptyState } from "../components/empty-state";

export default function NotFound() {
  return (
    <div className="mx-auto flex h-full w-full max-w-lg flex-col items-center justify-center px-4 md:max-w-2xl lg:max-w-3xl">
      <EmptyState
        illustration={<MapPinOff className="size-7" />}
        title="Halaman tidak ketemu (404)"
        body="Alamat yang kamu tuju tidak ada atau sudah dipindah. Balik ke jalan yang benar yuk."
        action={
          <Link
            to="/"
            className="flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
          >
            Kembali ke Beranda
          </Link>
        }
      />
    </div>
  );
}
