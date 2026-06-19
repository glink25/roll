import {
  ArrowDown,
  CheckCircle2,
  Code2,
  Dice5,
  GraduationCap,
  Link2,
  LockKeyhole,
  MessageSquareText,
  PartyPopper,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Users,
} from "lucide-react";

import { AiLotteryDialog } from "@/components/ai-lottery-dialog";
import { LanguageSwitcher } from "@/components/language-switcher";
import { LotteryApp } from "@/components/lottery-app";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";
import { siteUrl } from "@/lib/site";

const pageCopy = {
  zh: {
    brandLabel: "Roll 模拟器首页",
    navLabel: "主要导航",
    navFeatures: "功能",
    navExamples: "场景",
    navStart: "开始抽奖",
    badge: "本地计算 · 结果可验证",
    heroBefore: "一次公平抽奖，",
    heroAccent: "一条链接重放",
    heroDescription: "适合论坛 Roll 帖、活动名单和楼层抽奖。创建后复制分享链接，参与者可以查看、重放并核验中奖结果。",
    heroCta: "创建抽奖",
    heroNote: "免费使用 · 一键复制分享",
    highlights: ["支持范围与名单", "固定种子可重放", "配置随链接分享"],
    featuresEyebrow: "产品能力",
    featuresTitle: "分享结果，也分享清晰的验证路径",
    featuresDescription: "决定中奖者的配置会完整保存在链接中。收到链接的人可以在自己的浏览器中重放抽奖过程。",
    features: [
      { title: "灵活奖池", text: "输入连续楼层并排除无效回复，或直接粘贴一份名称列表。" },
      { title: "确定性随机", text: "固定算法与自定义种子，让相同配置始终复现相同顺序。" },
      { title: "为分享而设计", text: "一键复制完整抽奖链接，参与者打开后优先看到结果，并可在本地重新计算。" },
      { title: "本地优先", text: "所有数据仅在当前浏览器处理，不上传名单，也不依赖后端。" },
    ],
    examplesEyebrow: "示例场景",
    examplesTitle: "从论坛楼层到公司活动，几分钟完成抽奖",
    examplesDescription: "选择适合当前场景的参与者输入方式，抽奖后把结果链接直接发到群聊、帖子或活动页面。",
    examples: [
      { title: "论坛楼层抽奖", text: "输入回复楼层范围，排除楼主、重复回复和无效楼层，再分享可重放的中奖链接。", tag: "数字范围" },
      { title: "公司年会座位号", text: "按座位号范围抽取幸运员工，多个奖项可以分别设置名称与种子。", tag: "座位编号" },
      { title: "活动报名名单", text: "粘贴报名者姓名，一次抽取一位或多位获奖者，并把结果发给所有参与者。", tag: "名称列表" },
      { title: "课堂与社群点名", text: "导入成员名单，用固定种子留下可复查的随机选择记录。", tag: "成员名单" },
    ],
    stepsTitle: "三步完成一次 Roll",
    steps: [
      ["01", "建立奖池", "选择数字范围或名称列表，排除不参与抽奖的编号。"],
      ["02", "固定配置", "设置抽奖名称、中奖数量与种子；需要时可遮掩地址栏中的名单。"],
      ["03", "复制并分享", "揭晓结果后复制分享链接；收到链接的人会先看到中奖名单，并能独立重放。"],
    ],
    faqTitle: "常见问题",
    faqs: [
      ["同一个链接为什么能得到相同结果？", "链接保存了规范化后的参与者、中奖数量与随机种子。Roll 模拟器使用固定的伪随机算法，因此相同配置会得到相同的中奖顺序。"],
      ["参与者名单会上传吗？", "不会。解析名单、随机抽取和链接编码全部在浏览器本地完成，本站不需要后端接口，也不会保存你的抽奖配置。"],
      ["Base64 遮掩能保护敏感信息吗？", "Base64URL 用于隐藏地址栏中的直观名称，链接内容仍可被解码。请勿在分享链接中放入敏感信息。"],
      ["可以排除重复回复或指定楼层吗？", "可以。选择数字范围模式后，在排除编号中填写不参与抽奖的楼层，支持中英文逗号和空格分隔。"],
    ],
    footer: "Roll 模拟器 · 创建一次，分享链接，人人都能重放",
    footerTech: "纯静态 · 开放算法",
    schemaDescription: "支持楼层范围、名单、自定义种子和结果重放的免费在线抽奖工具。",
  },
  en: {
    brandLabel: "Roll Simulator home",
    navLabel: "Primary navigation",
    navFeatures: "Features",
    navExamples: "Examples",
    navStart: "Start a draw",
    badge: "Local calculation · Replayable results",
    heroBefore: "One fair draw. ",
    heroAccent: "One link to replay it.",
    heroDescription: "Built for forum threads, event lists, and numbered entries. Create a draw, share the link, and let every participant view and verify the result.",
    heroCta: "Create a draw",
    heroNote: "Free to use · One-click sharing",
    highlights: ["Ranges and name lists", "Replayable seeded results", "Every setting travels with the link"],
    featuresEyebrow: "Product capabilities",
    featuresTitle: "Share the result with a clear path to verify it",
    featuresDescription: "Every setting that determines the winners is stored in the link. Recipients can replay the draw in their own browser.",
    features: [
      { title: "Flexible pools", text: "Use a continuous number range with exclusions, or paste a list of participant names." },
      { title: "Deterministic random", text: "A fixed algorithm and custom seed reproduce the same order from the same configuration." },
      { title: "Designed for sharing", text: "Copy the complete draw link in one click. Recipients see the result first and can calculate it locally." },
      { title: "Local-first", text: "Participant data stays in the current browser. No upload and no backend are required." },
    ],
    examplesEyebrow: "Example uses",
    examplesTitle: "From forum replies to company events",
    examplesDescription: "Pick the participant input that fits the occasion, then share the result in a group chat, forum post, or event page.",
    examples: [
      { title: "Forum reply giveaway", text: "Enter the reply-number range, exclude duplicate or ineligible posts, and share a replayable winner link.", tag: "Number range" },
      { title: "Company party seats", text: "Draw from numbered seats for lucky employee prizes, with a separate name and seed for each award.", tag: "Seat numbers" },
      { title: "Event registration list", text: "Paste attendee names, draw one or several winners, and send the result to everyone who joined.", tag: "Name list" },
      { title: "Class or community picker", text: "Import a member list and keep a reviewable record of each random selection with a fixed seed.", tag: "Member list" },
    ],
    stepsTitle: "Run a draw in three steps",
    steps: [
      ["01", "Build the pool", "Choose a number range or name list, then exclude any ineligible entries."],
      ["02", "Set the configuration", "Add a draw name, winner count, and seed. Obscure readable URL data when useful."],
      ["03", "Copy and share", "Reveal the results and share the link. Recipients see the winners first and can replay the draw."],
    ],
    faqTitle: "Frequently asked questions",
    faqs: [
      ["Why does the same link produce the same result?", "The link stores normalized participants, winner count, and the random seed. A fixed pseudo-random algorithm produces the same winner order from the same configuration."],
      ["Is the participant list uploaded?", "No. List parsing, random selection, and link encoding all happen locally in the browser. The site has no backend API and does not store draw configurations."],
      ["Does Base64 obscuring protect sensitive information?", "Base64URL hides readable names in the address bar, while the link content remains decodable. Keep sensitive information out of shared links."],
      ["Can I exclude duplicate replies or specific numbers?", "Yes. In number-range mode, enter the excluded numbers using commas or spaces."],
    ],
    footer: "Roll Simulator · Create once, share the link, replay anywhere",
    footerTech: "Static site · Open algorithm",
    schemaDescription: "A free online draw tool for number ranges, name lists, custom seeds, and replayable results.",
  },
} as const;

const featureIcons = [Users, RefreshCcw, Link2, LockKeyhole];
const exampleIcons = [MessageSquareText, PartyPopper, TicketCheck, GraduationCap];

export function SitePage({ locale }: { locale: Locale }) {
  const copy = pageCopy[locale];
  const pagePath = locale === "zh" ? "" : "/en";
  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Roll Simulator",
    description: copy.schemaDescription,
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    isAccessibleForFree: true,
    inLanguage: locale === "zh" ? "zh-CN" : "en",
    ...(siteUrl ? { url: `${siteUrl}${pagePath}` } : {}),
  };
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: copy.faqs.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
  };

  return (
    <main lang={locale === "zh" ? "zh-CN" : "en"} className="min-h-screen overflow-hidden">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema).replace(/</g, "\\u003c") }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <div className="absolute inset-x-0 top-0 -z-10 h-[760px] bg-[radial-gradient(circle_at_20%_15%,oklch(0.88_0.08_285/0.55),transparent_32%),radial-gradient(circle_at_80%_10%,oklch(0.9_0.09_205/0.45),transparent_28%),linear-gradient(to_bottom,oklch(0.985_0.008_255),transparent)]" />

      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8">
        <a href="#top" className="flex items-center gap-2 font-semibold tracking-tight" aria-label={copy.brandLabel}>
          <span className="flex size-9 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg shadow-slate-950/15"><Dice5 className="size-5" /></span>
          {locale === "zh" ? "Roll 模拟器" : "Roll Simulator"}
        </a>
        <nav aria-label={copy.navLabel} className="flex items-center gap-1.5">
          <Button variant="ghost" nativeButton={false} className="hidden sm:inline-flex" render={<a href="#features" />}>{copy.navFeatures}</Button>
          <Button variant="ghost" nativeButton={false} className="hidden sm:inline-flex" render={<a href="#examples" />}>{copy.navExamples}</Button>
          <LanguageSwitcher locale={locale} />
          <Button nativeButton={false} render={<a href="#lottery" />}>{copy.navStart}</Button>
        </nav>
      </header>

      <div id="shared-result-root" />

      <section id="top" className="mx-auto max-w-7xl px-5 pb-20 pt-16 text-center sm:px-8 sm:pb-28 sm:pt-24">
        <Badge variant="outline" className="mb-6 rounded-full border-slate-300/70 bg-white/60 px-4 py-1.5 shadow-sm backdrop-blur">
          <ShieldCheck className="text-emerald-600" /> {copy.badge}
        </Badge>
        <h1 className="mx-auto max-w-5xl text-balance text-5xl font-semibold tracking-[-0.045em] text-slate-950 sm:text-6xl lg:text-7xl dark:text-slate-50">
          {copy.heroBefore}<span className="bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">{copy.heroAccent}</span>
        </h1>
        <p className="mx-auto mt-7 max-w-2xl text-balance text-lg leading-8 text-slate-600 sm:text-xl dark:text-slate-300">{copy.heroDescription}</p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button size="lg" nativeButton={false} className="h-12 rounded-xl px-6 text-base shadow-lg shadow-slate-950/15" render={<a href="#lottery" />}>
            <Sparkles /> {copy.heroCta} <ArrowDown />
          </Button>
          <AiLotteryDialog locale={locale} />
        </div>
        <p className="mt-4 text-sm text-muted-foreground">{copy.heroNote}</p>
        <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 text-left sm:grid-cols-3">
          {copy.highlights.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-xl border border-white/70 bg-white/55 px-4 py-3 text-sm font-medium shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5">
              <CheckCircle2 className="size-4 text-emerald-600" /> {item}
            </div>
          ))}
        </div>
      </section>

      <div className="border-y border-border/60 bg-background/85 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24"><LotteryApp locale={locale} /></div>
      </div>

      <section id="features" aria-labelledby="features-title" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">{copy.featuresEyebrow}</p>
          <h2 id="features-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.featuresTitle}</h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">{copy.featuresDescription}</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {copy.features.map((feature, index) => {
            const Icon = featureIcons[index];
            return <article key={feature.title} className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <span className="flex size-10 items-center justify-center rounded-xl bg-slate-950 text-white"><Icon className="size-5" /></span>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 leading-7 text-muted-foreground">{feature.text}</p>
            </article>;
          })}
        </div>
      </section>

      <section id="examples" aria-labelledby="examples-title" className="border-y border-border/60 bg-slate-50/80 dark:bg-slate-950/30">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">{copy.examplesEyebrow}</p>
            <h2 id="examples-title" className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{copy.examplesTitle}</h2>
            <p className="mt-4 text-lg leading-8 text-muted-foreground">{copy.examplesDescription}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {copy.examples.map((example, index) => {
              const Icon = exampleIcons[index];
              return <article key={example.title} className="flex gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"><Icon className="size-5" /></span>
                <div><Badge variant="secondary" className="mb-3">{example.tag}</Badge><h3 className="text-xl font-semibold">{example.title}</h3><p className="mt-2 leading-7 text-muted-foreground">{example.text}</p></div>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section aria-labelledby="steps-title" className="bg-slate-950 text-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <h2 id="steps-title" className="text-3xl font-semibold tracking-tight sm:text-4xl">{copy.stepsTitle}</h2>
          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {copy.steps.map(([number, title, text]) => <li key={number} className="border-t border-white/20 pt-5">
              <span className="font-mono text-sm text-cyan-300">{number}</span><h3 className="mt-4 text-xl font-semibold">{title}</h3><p className="mt-2 leading-7 text-slate-400">{text}</p>
            </li>)}
          </ol>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="mx-auto max-w-4xl px-5 py-24 sm:px-8 sm:py-32">
        <h2 id="faq-title" className="text-center text-3xl font-semibold tracking-tight sm:text-4xl">{copy.faqTitle}</h2>
        <div className="mt-10 divide-y divide-border rounded-2xl border border-border bg-card px-6 shadow-sm">
          {copy.faqs.map(([question, answer]) => <details key={question} className="group py-5">
            <summary className="cursor-pointer list-none pr-8 font-medium marker:hidden">{question}<span className="float-right text-muted-foreground transition-transform group-open:rotate-45">＋</span></summary>
            <p className="mt-3 max-w-3xl leading-7 text-muted-foreground">{answer}</p>
          </details>)}
        </div>
      </section>

      <footer className="border-t border-border/70">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>{copy.footer}</p><p className="flex items-center gap-2"><Code2 className="size-4" /> {copy.footerTech}</p>
        </div>
      </footer>
    </main>
  );
}
