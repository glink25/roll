import { describe, expect, it } from "vitest";

import { configToDraft, createSemanticSeed, drawWinners, splitTokens, uniqueNames, validateDraft, type LotteryConfig } from "@/lib/lottery";

describe("participant parsing", () => {
  it("splits Chinese commas, western commas and whitespace", () => {
    expect(splitTokens("张三，李四, 王五\n赵六")).toEqual(["张三", "李四", "王五", "赵六"]);
  });

  it("deduplicates names while preserving their first position", () => {
    expect(uniqueNames("小明, 小红，小明 小刚")).toEqual(["小明", "小红", "小刚"]);
  });

  it("filters duplicate and out-of-range exclusions", () => {
    const validation = validateDraft({
      title: "",
      mode: "range",
      start: "0",
      end: "5",
      excluded: "2, 2, 9, -1",
      names: "",
      winnerCount: "2",
      seed: "demo",
    });
    expect(validation.participants).toEqual(["0", "1", "3", "4", "5"]);
    expect(validation.config).toMatchObject({ m: "r", x: [2] });
  });

  it("rejects a winner count larger than the pool", () => {
    const validation = validateDraft({
      title: "",
      mode: "list",
      start: "1",
      end: "10",
      excluded: "",
      names: "甲,乙",
      winnerCount: "3",
      seed: "seed",
    });
    expect(validation.config).toBeUndefined();
    expect(validation.errors.winnerCount).toBeTruthy();
  });
});

describe("semantic seed", () => {
  it("contains the lottery name and local time only to the minute", () => {
    const seed = createSemanticSeed("年会大奖", new Date(2026, 5, 19, 14, 7, 59));
    expect(seed).toContain("年会大奖-");
    expect(seed).toContain("07");
    expect(seed).not.toContain("59");
  });
});

describe("deterministic lottery", () => {
  const config: LotteryConfig = { v: 1, m: "l", p: ["Alice", "Bob", "Carol", "Dave", "Eve"], n: 3, s: "roll-v1" };

  it("returns the same unique sequence for a fixed vector", () => {
    expect(drawWinners(config)).toEqual(["Eve", "Dave", "Bob"]);
    expect(drawWinners(config)).toEqual(drawWinners(config));
    expect(new Set(drawWinners(config)).size).toBe(3);
  });

  it("round-trips a normalized config through the draft", () => {
    expect(validateDraft(configToDraft(config)).config).toEqual(config);
  });
});
