import type { ErrorCode, Locale } from "@/lib/i18n";

export const LOTTERY_RULES = {
  configVersion: 1,
  maxParticipants: 100_000,
  modes: {
    range: "r",
    list: "l",
  },
  random: {
    seedHash: "xmur3",
    generator: "mulberry32",
    selection: "partial Fisher-Yates shuffle",
  },
  url: {
    obscuredData: "d",
    version: "v",
    mode: "m",
    title: "t",
    rangeStart: "a",
    rangeEnd: "b",
    exclusions: "x",
    participants: "p",
    winnerCount: "n",
    seed: "s",
  },
} as const;

export const CONFIG_VERSION = LOTTERY_RULES.configVersion;
export const MAX_PARTICIPANTS = LOTTERY_RULES.maxParticipants;

export type ParticipantMode = "range" | "list";

export type LotteryConfig =
  | {
      v: typeof CONFIG_VERSION;
      m: "r";
      a: number;
      b: number;
      x: number[];
      n: number;
      s: string;
      t?: string;
    }
  | {
      v: typeof CONFIG_VERSION;
      m: "l";
      p: string[];
      n: number;
      s: string;
      t?: string;
    };

export interface LotteryDraft {
  title: string;
  mode: ParticipantMode;
  start: string;
  end: string;
  excluded: string;
  names: string;
  winnerCount: string;
  seed: string;
}

export interface ValidationResult {
  config?: LotteryConfig;
  participants: string[];
  errors: Partial<Record<keyof LotteryDraft, ErrorCode>>;
}

export function createDefaultDraft(seed = ""): LotteryDraft {
  return {
    title: "",
    mode: "range",
    start: "1",
    end: "100",
    excluded: "",
    names: "",
    winnerCount: "1",
    seed,
  };
}

export function createSemanticSeed(title = "", date = new Date(), locale: Locale = "zh"): string {
  const label = title.trim() || (locale === "zh" ? "Roll抽奖" : "Giveaway");
  const localMinute = new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return `${label}-${localMinute}`;
}

export function splitTokens(value: string): string[] {
  return value
    .split(/[,，\s]+/u)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function uniqueNames(value: string): string[] {
  return [...new Set(splitTokens(value))];
}

function parseInteger(value: string): number | undefined {
  if (!/^-?\d+$/.test(value.trim())) return undefined;
  const number = Number(value);
  return Number.isSafeInteger(number) ? number : undefined;
}

export function validateDraft(draft: LotteryDraft): ValidationResult {
  const errors: Partial<Record<keyof LotteryDraft, ErrorCode>> = {};
  const winnerCount = parseInteger(draft.winnerCount);

  if (draft.title.trim().length > 80) errors.title = "title_too_long";
  if (!draft.seed.trim()) errors.seed = "seed_required";
  if (winnerCount === undefined || winnerCount < 1) {
    errors.winnerCount = "winner_positive";
  }

  if (draft.mode === "list") {
    const participants = uniqueNames(draft.names);
    if (participants.length === 0) errors.names = "names_required";
    if (participants.length > MAX_PARTICIPANTS) {
      errors.names = "participants_limit";
    }
    if (winnerCount && winnerCount > participants.length) {
      errors.winnerCount = "winner_exceeds";
    }

    return {
      participants,
      errors,
      config:
        Object.keys(errors).length === 0
          ? {
              v: CONFIG_VERSION,
              m: "l",
              p: participants,
              n: winnerCount!,
              s: draft.seed.trim(),
              ...(draft.title.trim() ? { t: draft.title.trim() } : {}),
            }
          : undefined,
    };
  }

  const start = parseInteger(draft.start);
  const end = parseInteger(draft.end);
  if (start === undefined) errors.start = "integer_required";
  if (end === undefined) errors.end = "integer_required";
  if (start !== undefined && end !== undefined && start > end) {
    errors.end = "end_before_start";
  }

  const excludedTokens = splitTokens(draft.excluded);
  const excludedValues = excludedTokens.map(parseInteger);
  if (excludedValues.some((value) => value === undefined)) {
    errors.excluded = "excluded_integer";
  }

  let participants: string[] = [];
  let exclusions: number[] = [];
  if (start !== undefined && end !== undefined && start <= end) {
    const rangeSize = end - start + 1;
    if (rangeSize > MAX_PARTICIPANTS) {
      errors.end = "range_limit";
    } else {
      exclusions = [...new Set(excludedValues.filter(
        (value): value is number =>
          value !== undefined && value >= start && value <= end,
      ))].sort((left, right) => left - right);
      const excludedSet = new Set(exclusions);
      participants = Array.from({ length: rangeSize }, (_, index) => start + index)
        .filter((value) => !excludedSet.has(value))
        .map(String);
      if (participants.length === 0) errors.excluded = "all_excluded";
    }
  }

  if (winnerCount && winnerCount > participants.length) {
    errors.winnerCount = "winner_exceeds";
  }

  return {
    participants,
    errors,
    config:
      Object.keys(errors).length === 0
        ? {
            v: CONFIG_VERSION,
            m: "r",
            a: start!,
            b: end!,
            x: exclusions,
            n: winnerCount!,
            s: draft.seed.trim(),
            ...(draft.title.trim() ? { t: draft.title.trim() } : {}),
          }
        : undefined,
  };
}

export function configToDraft(config: LotteryConfig): LotteryDraft {
  if (config.m === "r") {
    return {
      title: config.t ?? "",
      mode: "range",
      start: String(config.a),
      end: String(config.b),
      excluded: config.x.join(", "),
      names: "",
      winnerCount: String(config.n),
      seed: config.s,
    };
  }
  return {
    title: config.t ?? "",
    mode: "list",
    start: "1",
    end: "100",
    excluded: "",
    names: config.p.join(", "),
    winnerCount: String(config.n),
    seed: config.s,
  };
}

export function participantsFromConfig(config: LotteryConfig): string[] {
  return validateDraft(configToDraft(config)).participants;
}

function xmur3(value: string): () => number {
  let hash = 1779033703 ^ value.length;
  for (let index = 0; index < value.length; index += 1) {
    hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
    hash = (hash << 13) | (hash >>> 19);
  }
  return () => {
    hash = Math.imul(hash ^ (hash >>> 16), 2246822507);
    hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
    return (hash ^= hash >>> 16) >>> 0;
  };
}

function mulberry32(seed: number): () => number {
  return () => {
    let value = (seed += 0x6d2b79f5);
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function drawWinners(config: LotteryConfig): string[] {
  const pool = participantsFromConfig(config);
  const seedHash = xmur3(config.s)();
  const random = mulberry32(seedHash);

  for (let index = 0; index < config.n; index += 1) {
    const swapIndex = index + Math.floor(random() * (pool.length - index));
    [pool[index], pool[swapIndex]] = [pool[swapIndex], pool[index]];
  }

  return pool.slice(0, config.n);
}
