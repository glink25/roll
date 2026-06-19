/**
 * Copy text to the clipboard, falling back to a temporary textarea for
 * browsers without the async Clipboard API. Returns whether it succeeded.
 */
export async function copyText(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const success = document.execCommand("copy");
    textarea.remove();
    return success;
  }
}

import { siteUrl } from "@/lib/site";

/**
 * Whether a URL points at a publicly reachable host. Short link services
 * reject localhost, loopback, `.local`, and private LAN addresses, so we can
 * surface a clearer message instead of the provider's opaque error.
 */
export function isPubliclyShortenable(url: string): boolean {
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    return false;
  }
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return false;
  }
  if (host === "::1" || host === "0.0.0.0") return false;
  if (/^127\./.test(host)) return false;
  if (/^10\./.test(host)) return false;
  if (/^192\.168\./.test(host)) return false;
  if (/^172\.(1[6-9]|2\d|3[01])\./.test(host)) return false;
  return true;
}

/**
 * Resolve the URL to hand to a short link service. When the current page runs
 * on a non-public host (e.g. `localhost` in dev) but `NEXT_PUBLIC_SITE_URL` is
 * configured, swap in that public origin while keeping the path, query, and
 * hash so the encoded draw config is preserved.
 */
export function toShareableUrl(href: string): string {
  if (isPubliclyShortenable(href) || !siteUrl) return href;
  try {
    const current = new URL(href);
    const base = new URL(siteUrl);
    base.pathname = current.pathname;
    base.search = current.search;
    base.hash = current.hash;
    return base.toString();
  } catch {
    return href;
  }
}

export type ShortlinkProviderId = "vgd";

export interface ShortlinkProvider {
  /** Stable identifier; also used to look up localized copy. */
  id: ShortlinkProviderId;
  /** Display name shown in the menu, e.g. "v.gd". */
  name: string;
  /** Domain the short links live on. */
  domain: string;
  /** Link to the provider's official API/usage documentation. */
  referenceUrl: string;
  /** Create a short link for the given long URL, or throw on failure. */
  create(longUrl: string): Promise<string>;
}

const vgd: ShortlinkProvider = {
  id: "vgd",
  name: "v.gd",
  domain: "v.gd",
  referenceUrl: "https://v.gd/apishorteningreference.php",
  async create(longUrl) {
    let response: Response;
    try {
      response = await fetch(
        `https://v.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`,
      );
    } catch {
      throw new Error("shortlink_network");
    }

    let data: { shorturl?: string; errorcode?: number; errormessage?: string };
    try {
      data = await response.json();
    } catch {
      throw new Error("shortlink_parse");
    }

    if (typeof data.shorturl === "string" && data.shorturl) {
      return data.shorturl;
    }
    throw new Error(data.errormessage || "shortlink_failed");
  },
};

/** Extensible list of short link providers. The first entry is the default. */
export const shortlinkProviders: ShortlinkProvider[] = [vgd];
