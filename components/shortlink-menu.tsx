"use client";

import { useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Check, ExternalLink, Info, Link2, Loader2, ShieldAlert, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Menu, MenuContent, MenuItem, MenuTrigger } from "@/components/ui/menu";
import { lotteryCopy, type Locale } from "@/lib/i18n";
import {
  copyText,
  isPubliclyShortenable,
  shortlinkProviders,
  toShareableUrl,
  type ShortlinkProvider,
} from "@/lib/shortlink";

type Status = "idle" | "loading" | "copied" | "error";

export function ShortlinkMenu({
  getLongUrl,
  disabled,
  locale,
}: {
  getLongUrl: () => string;
  disabled: boolean;
  locale: Locale;
}) {
  const copy = lotteryCopy[locale].shortlink;
  const [menuOpen, setMenuOpen] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string>(copy.error);
  const [infoProvider, setInfoProvider] = useState<ShortlinkProvider | null>(null);
  // Cache short links per long URL so repeat clicks skip the network request.
  const cacheRef = useRef<Map<string, string>>(new Map());

  const finishCopied = (short: string) => {
    copyText(short).then((success) => {
      setStatus(success ? "copied" : "error");
      if (success) window.setTimeout(() => setStatus("idle"), 1800);
    });
  };

  const handleSelect = async (provider: ShortlinkProvider) => {
    const longUrl = toShareableUrl(getLongUrl());
    const cached = cacheRef.current.get(longUrl);
    if (cached) {
      finishCopied(cached);
      return;
    }

    if (!isPubliclyShortenable(longUrl)) {
      setErrorMessage(copy.localUnsupported);
      setStatus("error");
      return;
    }

    setStatus("loading");
    try {
      const short = await provider.create(longUrl);
      cacheRef.current.set(longUrl, short);
      finishCopied(short);
    } catch {
      setErrorMessage(copy.error);
      setStatus("error");
    }
  };

  const triggerContent =
    status === "loading" ? (
      <>
        <Loader2 className="animate-spin" /> {copy.generating}
      </>
    ) : status === "copied" ? (
      <>
        <Check /> {copy.copied}
      </>
    ) : (
      <>
        <Link2 /> {copy.trigger}
      </>
    );

  return (
    <div>
      <Menu open={menuOpen} onOpenChange={setMenuOpen}>
        <MenuTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-11 w-full"
            />
          }
          disabled={disabled || status === "loading"}
        >
          {triggerContent}
        </MenuTrigger>

        <MenuContent className="w-[var(--anchor-width)]">
          {shortlinkProviders.map((provider) => {
            return (
              <div key={provider.id} className="flex items-center gap-1">
                <MenuItem
                  className="flex-1"
                  onClick={() => handleSelect(provider)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{provider.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {copy.freeNoLogin}
                    </span>
                  </div>
                </MenuItem>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${provider.name} — ${copy.infoAria}`}
                  className="shrink-0 text-muted-foreground"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuOpen(false);
                    setInfoProvider(provider);
                  }}
                >
                  <Info />
                </Button>
              </div>
            );
          })}
        </MenuContent>
      </Menu>

      {status === "error" && (
        <p className="mt-2 text-center text-xs leading-5 text-destructive" role="alert">
          {errorMessage}
        </p>
      )}

      <Dialog.Root
        open={infoProvider !== null}
        onOpenChange={(open) => {
          if (!open) setInfoProvider(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px]" />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-5">
            <Dialog.Popup className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-border/80 bg-background p-5 shadow-2xl outline-none sm:max-w-lg sm:rounded-3xl sm:p-7">
              <Dialog.Close
                aria-label={lotteryCopy[locale].shortlink.infoAria}
                className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <X className="size-5" />
              </Dialog.Close>

              {infoProvider && (
                <div className="pr-10">
                  <Dialog.Title className="text-xl font-semibold tracking-tight sm:text-2xl">
                    {copy.providers[infoProvider.id].title}
                  </Dialog.Title>
                  <Dialog.Description className="mt-3 leading-7 text-muted-foreground">
                    {copy.providers[infoProvider.id].description}
                  </Dialog.Description>

                  <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200/70 bg-amber-50/70 p-4 text-sm leading-6 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/25 dark:text-amber-100">
                    <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                    <p>
                      <span className="font-medium">{copy.privacyLabel}</span>{" · "}
                      {copy.providers[infoProvider.id].privacy}
                    </p>
                  </div>

                  <a
                    href={infoProvider.referenceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-primary underline-offset-4 hover:underline"
                  >
                    <ExternalLink className="size-4" /> {copy.docLink}
                  </a>
                </div>
              )}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
