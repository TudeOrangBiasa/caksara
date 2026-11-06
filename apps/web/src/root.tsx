import { MapPinOff, RefreshCw } from "lucide-react";
import {
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
} from "react-router";
import { Toaster } from "@caksara/ui/components/sonner";

// oxlint-disable-next-line import/no-unassigned-import
import "./index.css";
import type { Route } from "./+types/root";
import { EmptyState } from "./components/empty-state";
import { ThemeProvider } from "./components/theme-provider";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
  { rel: "apple-touch-icon", href: "/assets/bedawang-standing.png" },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      disableTransitionOnChange
      storageKey="vite-ui-theme"
    >
      <div className="h-svh">
        <Outlet />
      </div>
      <Toaster richColors />
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const status = isRouteErrorResponse(error) ? error.status : null;
  const rateLimited = status === 429;
  const notFound = status === 404;
  let details = "Terjadi galat tak terduga. Muat ulang lalu coba lagi.";
  if (isRouteErrorResponse(error)) {
    details = rateLimited
      ? "Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi."
      : notFound
        ? "Alamat yang kamu tuju tidak ada atau sudah dipindah."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
  }
  const stack = import.meta.env.DEV && error instanceof Error ? error.stack : undefined;
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-lg flex-col items-center justify-center px-4 py-10 md:max-w-2xl">
      <EmptyState
        illustration={
          rateLimited ? <RefreshCw className="size-7" /> : <MapPinOff className="size-7" />
        }
        title={
          rateLimited
            ? "Terlalu banyak permintaan (429)"
            : notFound
              ? "Halaman tidak ketemu (404)"
              : "Ada yang salah"
        }
        body={details}
        tone={rateLimited ? "danger" : "default"}
        action={
          rateLimited ? (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
            >
              Coba lagi
            </button>
          ) : (
            <Link
              to="/"
              className="flex h-11 w-full items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform active:scale-[0.98]"
            >
              Kembali ke Beranda
            </Link>
          )
        }
      />
      {stack && (
        <pre className="mt-6 w-full overflow-x-auto rounded-2xl bg-muted p-4 text-xs">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
