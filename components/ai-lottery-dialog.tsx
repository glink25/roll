"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Bot, Check, Copy, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildAiLotteryPrompt } from "@/lib/ai-lottery";
import type { Locale } from "@/lib/i18n";

const dialogCopy = {
  zh: {
    trigger: "让 AI 帮我抽奖",
    eyebrow: "AI 抽奖助手",
    title: "把抽奖贴交给 AI",
    description: "输入论坛或帖子链接，我们会生成一段包含 Roll 完整规则的提示词。无需登录，也不会上传链接。",
    urlLabel: "论坛 / 帖子链接",
    urlPlaceholder: "https://example.com/thread/123",
    urlHint: "支持 http 或 https 链接",
    urlError: "请输入有效的 http 或 https 链接",
    generate: "生成提示词",
    generated: "提示词已生成",
    previewHint: "完整内容可滚动查看，也可以复制后自行调整。",
    copy: "复制给 AI 使用",
    copied: "已复制，可以交给 AI 了",
    copyFailed: "自动复制失败，请选中上方提示词手动复制",
    close: "关闭",
  },
  en: {
    trigger: "Let AI run my draw",
    eyebrow: "AI draw assistant",
    title: "Hand the giveaway post to AI",
    description: "Enter a forum or thread URL to generate a prompt containing the complete Roll rules. No sign-in, and the URL is never uploaded.",
    urlLabel: "Forum / thread URL",
    urlPlaceholder: "https://example.com/thread/123",
    urlHint: "HTTP and HTTPS links are supported",
    urlError: "Enter a valid HTTP or HTTPS URL",
    generate: "Generate prompt",
    generated: "Prompt generated",
    previewHint: "Scroll to review the full prompt, or adjust it after copying.",
    copy: "Copy for AI",
    copied: "Copied — ready for your AI",
    copyFailed: "Automatic copy failed. Select and copy the prompt above manually.",
    close: "Close",
  },
} as const;

function normalizePostUrl(value: string): string | undefined {
  try {
    const url = new URL(value.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

async function copyText(value: string): Promise<boolean> {
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

export function AiLotteryDialog({ locale }: { locale: Locale }) {
  const copy = dialogCopy[locale];
  const [postUrl, setPostUrl] = useState("");
  const [prompt, setPrompt] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const validUrl = normalizePostUrl(postUrl);

  const generatePrompt = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted(true);
    setCopied(false);
    setCopyFailed(false);
    if (!validUrl) {
      setPrompt("");
      return;
    }
    setPrompt(buildAiLotteryPrompt({ postUrl: validUrl, origin: window.location.origin, locale }));
  };

  const handleUrlChange = (value: string) => {
    setPostUrl(value);
    setPrompt("");
    setSubmitted(false);
    setCopied(false);
    setCopyFailed(false);
  };

  const handleCopy = async () => {
    const success = await copyText(prompt);
    setCopied(success);
    setCopyFailed(!success);
    if (success) window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger
        render={
          <Button type="button" variant="outline" size="lg" className="h-12 rounded-xl border-violet-300/80 bg-white/70 px-6 text-base text-violet-800 shadow-sm backdrop-blur hover:bg-violet-50 hover:text-violet-950 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-200 dark:hover:bg-violet-950/50" />
        }
      >
        <Bot /> {copy.trigger}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-[2px]" />
        <Dialog.Viewport className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-5">
          <Dialog.Popup className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-border/80 bg-background p-5 shadow-2xl outline-none sm:max-w-2xl sm:rounded-3xl sm:p-7">
            <Dialog.Close
              aria-label={copy.close}
              className="absolute right-4 top-4 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <X className="size-5" />
            </Dialog.Close>

            <div className="pr-10">
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-violet-600">
                <Sparkles className="size-4" /> {copy.eyebrow}
              </p>
              <Dialog.Title className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">{copy.title}</Dialog.Title>
              <Dialog.Description className="mt-3 max-w-xl leading-7 text-muted-foreground">{copy.description}</Dialog.Description>
            </div>

            <form className="mt-6 space-y-3" onSubmit={generatePrompt} noValidate>
              <Label htmlFor={`ai-post-url-${locale}`}>{copy.urlLabel}</Label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  id={`ai-post-url-${locale}`}
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  className="h-11 flex-1 px-3"
                  value={postUrl}
                  onChange={(event) => handleUrlChange(event.target.value)}
                  placeholder={copy.urlPlaceholder}
                  aria-invalid={submitted && !validUrl}
                  aria-describedby={`ai-post-url-help-${locale}`}
                />
                <Button type="submit" size="lg" className="h-11 px-5">
                  <Sparkles /> {copy.generate}
                </Button>
              </div>
              <p id={`ai-post-url-help-${locale}`} className={`text-sm ${submitted && !validUrl ? "text-destructive" : "text-muted-foreground"}`} role={submitted && !validUrl ? "alert" : undefined}>
                {submitted && !validUrl ? copy.urlError : copy.urlHint}
              </p>
            </form>

            {prompt && (
              <div className="mt-6 border-t border-border/70 pt-6">
                <div className="mb-3 flex items-end justify-between gap-4">
                  <div>
                    <p className="font-medium">{copy.generated}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{copy.previewHint}</p>
                  </div>
                </div>
                <Textarea
                  readOnly
                  value={prompt}
                  aria-label={copy.generated}
                  className="max-h-56 min-h-48 resize-none overflow-y-auto bg-muted/35 font-mono text-xs leading-5 text-muted-foreground shadow-inner"
                />
                <Button type="button" size="lg" className="mt-4 h-12 w-full bg-violet-600 text-base text-white shadow-lg shadow-violet-600/20 hover:bg-violet-700" onClick={handleCopy}>
                  {copied ? <Check /> : <Copy />}{copied ? copy.copied : copy.copy}
                </Button>
                {copyFailed && <p className="mt-3 text-center text-sm text-destructive" role="alert">{copy.copyFailed}</p>}
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
