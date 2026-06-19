import {
  CONFIG_VERSION,
  LOTTERY_RULES,
  type LotteryConfig,
  configToDraft,
  validateDraft,
} from "@/lib/lottery";
import type { ErrorCode } from "@/lib/i18n";

type CompactConfig =
  | [1, "r", number, number, number[], number, string, string]
  | [1, "l", string[], number, string, string];

const URL_KEYS = LOTTERY_RULES.url;

export type DecodeResult =
  | { config: LotteryConfig; masked: boolean }
  | { error: Extract<ErrorCode, "masked_invalid" | "version_unsupported" | "config_invalid" | "parse_failed"> };

function toCompact(config: LotteryConfig): CompactConfig {
  return config.m === "r"
    ? [1, "r", config.a, config.b, config.x, config.n, config.s, config.t ?? ""]
    : [1, "l", config.p, config.n, config.s, config.t ?? ""];
}

function fromCompact(value: unknown): LotteryConfig | undefined {
  if (!Array.isArray(value) || value[0] !== CONFIG_VERSION) return undefined;
  if (
    value[1] === "r" &&
    (value.length === 7 || value.length === 8) &&
    typeof value[2] === "number" &&
    typeof value[3] === "number" &&
    Array.isArray(value[4]) &&
    value[4].every((item) => typeof item === "number") &&
    typeof value[5] === "number" &&
    typeof value[6] === "string" &&
    (value[7] === undefined || typeof value[7] === "string")
  ) {
    return {
      v: 1,
      m: "r",
      a: value[2],
      b: value[3],
      x: value[4],
      n: value[5],
      s: value[6],
      ...(value[7]?.trim() ? { t: value[7].trim() } : {}),
    };
  }
  if (
    value[1] === "l" &&
    (value.length === 5 || value.length === 6) &&
    Array.isArray(value[2]) &&
    value[2].every((item) => typeof item === "string") &&
    typeof value[3] === "number" &&
    typeof value[4] === "string" &&
    (value[5] === undefined || typeof value[5] === "string")
  ) {
    return {
      v: 1,
      m: "l",
      p: value[2],
      n: value[3],
      s: value[4],
      ...(value[5]?.trim() ? { t: value[5].trim() } : {}),
    };
  }
  return undefined;
}

function base64UrlEncode(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function ensureValid(config: LotteryConfig): LotteryConfig | undefined {
  const validation = validateDraft(configToDraft(config));
  return validation.config;
}

export function encodeConfig(config: LotteryConfig, masked: boolean): URLSearchParams {
  const params = new URLSearchParams();
  if (masked) {
    params.set(URL_KEYS.obscuredData, base64UrlEncode(JSON.stringify(toCompact(config))));
    return params;
  }

  params.set(URL_KEYS.version, String(config.v));
  params.set(URL_KEYS.mode, config.m);
  if (config.t) params.set(URL_KEYS.title, config.t);
  if (config.m === "r") {
    params.set(URL_KEYS.rangeStart, String(config.a));
    params.set(URL_KEYS.rangeEnd, String(config.b));
    if (config.x.length) params.set(URL_KEYS.exclusions, config.x.join("."));
  } else {
    params.set(URL_KEYS.participants, config.p.join(","));
  }
  params.set(URL_KEYS.winnerCount, String(config.n));
  params.set(URL_KEYS.seed, config.s);
  return params;
}

export function decodeConfig(params: URLSearchParams): DecodeResult | undefined {
  if (params.size === 0) return undefined;

  try {
    const data = params.get(URL_KEYS.obscuredData);
    if (data !== null) {
      const config = fromCompact(JSON.parse(base64UrlDecode(data)));
      const valid = config && ensureValid(config);
      return valid
        ? { config: valid, masked: true }
        : { error: "masked_invalid" };
    }

    if (params.get(URL_KEYS.version) !== String(CONFIG_VERSION)) {
      return { error: "version_unsupported" };
    }
    const mode = params.get(URL_KEYS.mode);
    const winnerValue = params.get(URL_KEYS.winnerCount);
    const seedValue = params.get(URL_KEYS.seed);
    if (winnerValue === null || seedValue === null) {
      return { error: "config_invalid" };
    }
    const n = Number(winnerValue);
    const s = seedValue;
    const title = params.get(URL_KEYS.title)?.trim();
    let config: LotteryConfig | undefined;
    if (mode === "r") {
      const startValue = params.get(URL_KEYS.rangeStart);
      const endValue = params.get(URL_KEYS.rangeEnd);
      if (startValue === null || endValue === null) {
        return { error: "config_invalid" };
      }
      const excluded = params.get(URL_KEYS.exclusions);
      config = {
        v: 1,
        m: "r",
        a: Number(startValue),
        b: Number(endValue),
        x: excluded ? excluded.split(".").map(Number) : [],
        n,
        s,
        ...(title ? { t: title } : {}),
      };
    } else if (mode === "l") {
      const names = params.get(URL_KEYS.participants);
      if (names === null) return { error: "config_invalid" };
      config = {
        v: 1,
        m: "l",
        p: names ? names.split(",") : [],
        n,
        s,
        ...(title ? { t: title } : {}),
      };
    }
    const valid = config && ensureValid(config);
    return valid
      ? { config: valid, masked: false }
      : { error: "config_invalid" };
  } catch {
    return { error: "parse_failed" };
  }
}
