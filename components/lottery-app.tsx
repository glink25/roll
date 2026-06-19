"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDown,
  Check,
  Dice5,
  Eye,
  EyeOff,
  Info,
  ListChecks,
  RefreshCw,
  Share2,
  ShieldAlert,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  type LotteryDraft,
  configToDraft,
  createDefaultDraft,
  createSemanticSeed,
  drawWinners,
  validateDraft,
} from "@/lib/lottery";
import { decodeConfig, encodeConfig } from "@/lib/url-state";
import { lotteryCopy, type ErrorCode, type Locale } from "@/lib/i18n";

function FieldError({ code, locale }: { code?: ErrorCode; locale: Locale }) {
  if (!code) return null;
  return <p className="text-sm text-destructive" role="alert">{lotteryCopy[locale].errors[code]}</p>;
}

function randomSuffix(): string {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return values[0].toString(36).slice(0, 5).padEnd(5, "0");
}

function SharedResultHero({
  winners,
  title,
  participantCount,
  copied,
  copyFailed,
  onCopy,
  locale,
}: {
  winners: string[];
  title?: string;
  participantCount: number;
  copied: boolean;
  copyFailed: boolean;
  onCopy: () => void;
  locale: Locale;
}) {
  const copy = lotteryCopy[locale];
  return (
    <section
      aria-labelledby="shared-result-title"
      className="relative overflow-hidden border-y border-white/10 bg-slate-950 text-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,oklch(0.58_0.23_285/0.38),transparent_34%),radial-gradient(circle_at_85%_20%,oklch(0.66_0.17_220/0.28),transparent_30%)]" />
      <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <Badge className="mb-5 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-white backdrop-blur">
            <Share2 /> {copy.sharedBadge}
          </Badge>
          {title && <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">{title}</p>}
          <h1 id="shared-result-title" className="text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-6xl">
            {copy.sharedTitle}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-balance leading-7 text-slate-300 sm:text-lg">
            {copy.sharedDescription}
          </p>
        </div>

        <ol className="mx-auto mt-10 grid max-w-4xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {winners.map((winner, index) => (
            <li key={`${winner}-${index}`} className="group flex min-h-28 items-center gap-4 rounded-2xl border border-white/15 bg-white/[0.08] p-5 shadow-2xl shadow-black/10 backdrop-blur-sm">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-lg font-bold text-amber-950 shadow-lg shadow-amber-500/20">
                {index + 1}
              </span>
              <div className="min-w-0 text-left">
                <p className="text-xs font-medium uppercase tracking-[0.15em] text-slate-400">{copy.winner}</p>
                <p className="mt-1 break-all text-2xl font-semibold">{winner}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-8 flex max-w-4xl flex-col items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/15 p-5 sm:flex-row sm:px-6">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-slate-300 sm:justify-start">
            <span><strong className="text-white">{participantCount}</strong> {copy.participantsUnit}</span>
            <span><strong className="text-white">{winners.length}</strong> {copy.winnersUnit}</span>
            <span className="flex items-center gap-1.5"><Check className="size-4 text-emerald-400" />{copy.replayed}</span>
          </div>
          <div className="w-full shrink-0 sm:w-auto">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button type="button" size="lg" className="h-11 bg-white px-5 text-slate-950 hover:bg-slate-100" onClick={onCopy}>
                {copied ? <Check /> : <Share2 />}{copied ? copy.copied : copy.copyShareLink}
              </Button>
              <Button variant="outline" size="lg" nativeButton={false} className="h-11 border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" render={<a href="#lottery" />}>
                {copy.createMine} <ArrowDown />
              </Button>
            </div>
            {copyFailed && <p className="mt-2 text-center text-xs text-rose-300" role="alert">{copy.copyFailedShort}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}

export function LotteryApp({ locale = "zh" }: { locale?: Locale }) {
  const copy = lotteryCopy[locale];
  const [draft, setDraft] = useState<LotteryDraft>(() => createDefaultDraft());
  const [masked, setMasked] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [sharedEntry, setSharedEntry] = useState(false);
  const [autoSeed, setAutoSeed] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [urlError, setUrlError] = useState<ErrorCode | "">("");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const validation = useMemo(() => validateDraft(draft), [draft]);
  const winners = useMemo(
    () => (showResult && validation.config ? drawWinners(validation.config) : []),
    [showResult, validation.config],
  );

  useEffect(() => {
    const loadFromLocation = (initial: boolean) => {
      const decoded = decodeConfig(new URLSearchParams(window.location.search));
      if (decoded && "config" in decoded) {
        setDraft(configToDraft(decoded.config));
        setMasked(decoded.masked);
        setShowResult(true);
        setSharedEntry(true);
        setAutoSeed(false);
        setUrlError("");
      } else if (decoded && "error" in decoded) {
        setDraft(createDefaultDraft(createSemanticSeed("", new Date(), locale)));
        setShowResult(false);
        setSharedEntry(false);
        setAutoSeed(true);
        setUrlError(decoded.error);
      } else if (initial) {
        setDraft(createDefaultDraft(createSemanticSeed("", new Date(), locale)));
        setAutoSeed(true);
      }
    };

    loadFromLocation(true);
    const frame = window.requestAnimationFrame(() => setMounted(true));
    const handlePopState = () => loadFromLocation(false);
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [locale]);

  useEffect(() => {
    if (!mounted) return;
    const path = `${window.location.pathname}${window.location.hash}`;
    if (!validation.config) {
      window.history.replaceState(null, "", path);
      return;
    }
    const query = encodeConfig(validation.config, masked).toString();
    window.history.replaceState(null, "", `${window.location.pathname}?${query}${window.location.hash}`);
  }, [masked, mounted, validation.config]);

  useEffect(() => {
    if (!mounted || !sharedEntry) return;
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
    return () => window.cancelAnimationFrame(frame);
  }, [mounted, sharedEntry]);

  const updateDraft = (patch: Partial<LotteryDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setShowResult(false);
    setSharedEntry(false);
    setCopied(false);
    setCopyFailed(false);
    setUrlError("");
  };

  const addEntropy = () => {
    setAutoSeed(false);
    updateDraft({ seed: `${draft.seed || createSemanticSeed(draft.title, new Date(), locale)}-${randomSuffix()}` });
  };

  const updateTitle = (title: string) => {
    setDraft((current) => ({
      ...current,
      title,
      ...(autoSeed ? { seed: createSemanticSeed(title, new Date(), locale) } : {}),
    }));
    setShowResult(false);
    setSharedEntry(false);
    setCopied(false);
    setCopyFailed(false);
    setUrlError("");
  };

  const copyLink = async () => {
    const link = window.location.href;
    let success = false;
    try {
      await navigator.clipboard.writeText(link);
      success = true;
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = link;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      success = document.execCommand("copy");
      textarea.remove();
    }

    if (success) {
      setCopied(true);
      setCopyFailed(false);
      window.setTimeout(() => setCopied(false), 1800);
    } else {
      setCopied(false);
      setCopyFailed(true);
    }
  };

  return (
    <>
      {mounted && sharedEntry && showResult && validation.config &&
        document.getElementById("shared-result-root") &&
        createPortal(
          <SharedResultHero
            winners={winners}
            title={validation.config.t}
            participantCount={validation.participants.length}
            copied={copied}
            copyFailed={copyFailed}
            onCopy={copyLink}
            locale={locale}
          />,
          document.getElementById("shared-result-root")!,
        )}
      <section id="lottery" aria-labelledby="lottery-title" className="scroll-mt-8">
      <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary" className="mb-3 rounded-full px-3 py-1">
            <Share2 aria-hidden="true" /> {copy.shareBadge}
          </Badge>
          <h2 id="lottery-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.formHeading}</h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{copy.formDescription}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_oklch(0.7_0.16_155/0.15)]" />
          {copy.localOnly}
        </div>
      </div>

      {urlError && (
        <Alert variant="destructive" className="mb-5 p-4">
          <ShieldAlert />
          <AlertTitle>{copy.restoreTitle}</AlertTitle>
          <AlertDescription>{copy.errors[urlError]}。{copy.restoreSuffix}</AlertDescription>
        </Alert>
      )}

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(300px,0.65fr)]">
        <Card className="border-border/70 bg-card/90 shadow-xl shadow-slate-900/[0.04]">
          <CardHeader className="border-b border-border/70">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl"><Dice5 className="text-primary" />{copy.configTitle}</CardTitle>
                <CardDescription className="mt-1.5">{copy.configDescription}</CardDescription>
              </div>
              <Badge variant="outline" className="font-mono">v1</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-7 pt-6">
            <div className="space-y-2">
              <Label htmlFor="lottery-title-input">{copy.lotteryName} <span className="font-normal text-muted-foreground">{copy.optional}</span></Label>
              <Input
                id="lottery-title-input"
                value={draft.title}
                onChange={(event) => updateTitle(event.target.value)}
                placeholder={copy.lotteryNamePlaceholder}
                maxLength={80}
                aria-invalid={Boolean(validation.errors.title)}
              />
              <FieldError code={validation.errors.title} locale={locale} />
              <p className="text-sm text-muted-foreground">{copy.lotteryNameHint}</p>
            </div>
            <Tabs
              value={draft.mode}
              onValueChange={(value) => updateDraft({ mode: value as LotteryDraft["mode"] })}
            >
              <TabsList className="grid h-11 w-full grid-cols-2 p-1">
                <TabsTrigger value="range" className="h-full"><ListChecks />{copy.rangeMode}</TabsTrigger>
                <TabsTrigger value="list" className="h-full"><Users />{copy.listMode}</TabsTrigger>
              </TabsList>
              <TabsContent value="range" className="mt-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="start">{copy.start}</Label>
                    <Input id="start" inputMode="numeric" value={draft.start} aria-invalid={Boolean(validation.errors.start)} onChange={(event) => updateDraft({ start: event.target.value })} />
                    <FieldError code={validation.errors.start} locale={locale} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">{copy.end}</Label>
                    <Input id="end" inputMode="numeric" value={draft.end} aria-invalid={Boolean(validation.errors.end)} onChange={(event) => updateDraft({ end: event.target.value })} />
                    <FieldError code={validation.errors.end} locale={locale} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excluded">{copy.excluded} <span className="font-normal text-muted-foreground">{copy.optional}</span></Label>
                  <Textarea id="excluded" value={draft.excluded} aria-invalid={Boolean(validation.errors.excluded)} onChange={(event) => updateDraft({ excluded: event.target.value })} placeholder={copy.excludedPlaceholder} className="min-h-24 resize-y" />
                  <FieldError code={validation.errors.excluded} locale={locale} />
                </div>
              </TabsContent>
              <TabsContent value="list" className="mt-5">
                <div className="space-y-2">
                  <Label htmlFor="names">{copy.names}</Label>
                  <Textarea id="names" value={draft.names} aria-invalid={Boolean(validation.errors.names)} onChange={(event) => updateDraft({ names: event.target.value })} placeholder={copy.namesPlaceholder} className="min-h-40 resize-y" />
                  <FieldError code={validation.errors.names} locale={locale} />
                </div>
              </TabsContent>
            </Tabs>

            <div className="grid gap-5 border-t border-border/70 pt-6 sm:grid-cols-[180px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="winner-count">{copy.winnerCount}</Label>
                <Input id="winner-count" type="number" min="1" value={draft.winnerCount} aria-invalid={Boolean(validation.errors.winnerCount)} onChange={(event) => updateDraft({ winnerCount: event.target.value })} />
                <FieldError code={validation.errors.winnerCount} locale={locale} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seed">{copy.seed}</Label>
                <div className="flex gap-2">
                  <Input id="seed" value={draft.seed} aria-invalid={Boolean(validation.errors.seed)} onChange={(event) => { setAutoSeed(false); updateDraft({ seed: event.target.value }); }} className="font-mono" placeholder={copy.seedPlaceholder} />
                  <Button type="button" variant="outline" size="lg" onClick={addEntropy} aria-label={copy.addEntropy} title={copy.addEntropy}>
                    <RefreshCw /> <span className="hidden xl:inline">{copy.addEntropyShort}</span>
                  </Button>
                </div>
                <FieldError code={validation.errors.seed} locale={locale} />
              </div>
            </div>

            <div className="flex items-start justify-between gap-4 rounded-xl border border-border/80 bg-muted/45 p-4">
              <div className="flex gap-3">
                {masked ? <EyeOff className="mt-0.5 size-5 shrink-0" /> : <Eye className="mt-0.5 size-5 shrink-0" />}
                <div>
                  <Label htmlFor="mask-url" className="cursor-pointer">{copy.maskUrl}</Label>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{copy.maskHint}</p>
                </div>
              </div>
              <Switch id="mask-url" checked={masked} onCheckedChange={setMasked} aria-label={copy.maskUrl} className="mt-1" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-5 lg:sticky lg:top-6">
          <Card className="overflow-hidden border-border/70 shadow-xl shadow-slate-900/[0.04]">
            <div className="h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-400" />
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-lg">
                <span>{copy.overview}</span>
                <Users className="size-5 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/55 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{copy.validParticipants}</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">{validation.participants.length}</p>
                </div>
                <div className="rounded-xl bg-muted/55 p-4">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{copy.winnerSlots}</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">{Number(draft.winnerCount) || 0}</p>
                </div>
              </div>

              <Button type="button" size="lg" className="h-12 w-full text-base" disabled={!validation.config} onClick={() => setShowResult(true)}>
                <Sparkles /> {copy.reveal}
              </Button>
              <Button type="button" variant="outline" size="lg" className="h-11 w-full border-blue-300/80 bg-blue-50/60 text-blue-800 hover:bg-blue-100 hover:text-blue-900 dark:border-blue-800 dark:bg-blue-950/30 dark:text-blue-200" disabled={!validation.config} onClick={copyLink}>
                {copied ? <Check /> : <Share2 />}{copied ? copy.copied : copy.copyAndShare}
              </Button>
              <p className={`-mt-2 text-center text-xs leading-5 ${copyFailed ? "text-destructive" : "text-muted-foreground"}`} role={copyFailed ? "alert" : undefined}>
                {copyFailed ? copy.copyFailed : copy.shareHint}
              </p>

              {!showResult && (
                <div className="rounded-xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
                  <Trophy className="mx-auto mb-2 size-6 opacity-50" />
                  {copy.hiddenResult}
                </div>
              )}

              {showResult && validation.config && (
                <div aria-live="polite" className="space-y-3">
                  {validation.config.t && <Badge variant="secondary" className="max-w-full truncate">{validation.config.t}</Badge>}
                  <div className="flex items-center gap-2 text-sm font-medium"><Trophy className="size-4 text-amber-500" />{copy.result}</div>
                  <ol className="space-y-2">
                    {winners.map((winner, index) => (
                      <li key={`${winner}-${index}`} className="flex items-center gap-3 rounded-xl border border-amber-200/70 bg-amber-50/70 p-3.5 text-amber-950 dark:border-amber-800/50 dark:bg-amber-950/25 dark:text-amber-100">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-amber-400 font-semibold text-amber-950">{index + 1}</span>
                        <span className="min-w-0 break-all text-lg font-semibold">{winner}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          <Alert className="border-blue-200/70 bg-blue-50/60 p-4 text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100">
            <Info />
            <AlertTitle>{copy.proofTitle}</AlertTitle>
            <AlertDescription className="text-blue-800/80 dark:text-blue-200/80">{copy.proofDescription}</AlertDescription>
          </Alert>
        </div>
      </div>
      </section>
    </>
  );
}
