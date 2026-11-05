// Jembatan aman main→renderer (#101): tanpa node, tanpa secret, via IPC saja.
import { contextBridge, ipcRenderer } from "electron";

export interface AuthCallbackPayload {
  href: string;
  source: "loopback" | "protocol";
}

export interface AuthRedirectPayload {
  redirectTo: string;
}

export interface CaksaraDesktopApi {
  isDesktop: true;
  onAuthRedirect: (callback: (payload: AuthRedirectPayload) => void) => () => void;
  onAuthCallback: (callback: (payload: AuthCallbackPayload) => void) => () => void;
}

const api: CaksaraDesktopApi = {
  isDesktop: true,
  onAuthRedirect(callback) {
    const listener = (_event: unknown, payload: AuthRedirectPayload): void => {
      callback(payload);
    };
    ipcRenderer.on("caksara:auth-redirect", listener);
    return () => {
      ipcRenderer.removeListener("caksara:auth-redirect", listener);
    };
  },
  onAuthCallback(callback) {
    const listener = (_event: unknown, payload: AuthCallbackPayload): void => {
      callback(payload);
    };
    ipcRenderer.on("caksara:auth-callback", listener);
    return () => {
      ipcRenderer.removeListener("caksara:auth-callback", listener);
    };
  },
};

contextBridge.exposeInMainWorld("caksaraDesktop", api);

declare global {
  interface Window {
    caksaraDesktop?: CaksaraDesktopApi;
  }
}
