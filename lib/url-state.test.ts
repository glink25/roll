import { describe, expect, it } from "vitest";

import type { LotteryConfig } from "@/lib/lottery";
import { decodeConfig, encodeConfig } from "@/lib/url-state";

const config: LotteryConfig = {
  v: 1,
  m: "l",
  p: ["张三", "李四&朋友", "王五/测试"],
  n: 2,
  s: "种子 2026",
  t: "六月社区 Roll",
};

describe("URL state", () => {
  it("round-trips readable parameters", () => {
    const params = encodeConfig(config, false);
    expect(params.get("p")).toContain("张三");
    expect(decodeConfig(params)).toEqual({ config, masked: false });
  });

  it("round-trips UTF-8 through a single Base64URL parameter", () => {
    const params = encodeConfig(config, true);
    expect([...params.keys()]).toEqual(["d"]);
    expect(params.get("d")).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(decodeConfig(params)).toEqual({ config, masked: true });
  });

  it("keeps old masked links without a lottery name compatible", () => {
    const oldData = btoa(JSON.stringify([1, "l", ["A", "B"], 1, "seed"])).replace(/=+$/g, "");
    expect(decodeConfig(new URLSearchParams(`d=${oldData}`))).toEqual({
      config: { v: 1, m: "l", p: ["A", "B"], n: 1, s: "seed" },
      masked: true,
    });
  });

  it("returns a recoverable error for damaged or unknown data", () => {
    expect(decodeConfig(new URLSearchParams("d=not-valid"))).toHaveProperty("error");
    expect(decodeConfig(new URLSearchParams("v=9&m=r&a=1&b=5&n=1&s=x"))).toEqual({ error: "version_unsupported" });
    expect(decodeConfig(new URLSearchParams("v=1&m=r&n=1&s=x"))).toHaveProperty("error");
  });
});
