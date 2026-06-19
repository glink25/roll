import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LotteryApp } from "@/components/lottery-app";
import type { LotteryConfig } from "@/lib/lottery";
import { encodeConfig } from "@/lib/url-state";

afterEach(() => {
  cleanup();
  document.getElementById("shared-result-root")?.remove();
  window.history.replaceState(null, "", "/");
  vi.restoreAllMocks();
});

describe("LotteryApp", () => {
  it("hides a revealed result after the configuration changes", async () => {
    render(<LotteryApp />);
    await waitFor(() => expect(screen.getByLabelText("随机种子")).not.toHaveValue(""));

    fireEvent.click(screen.getByRole("button", { name: "查看抽奖结果" }));
    expect(screen.getByText("中奖结果")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("起始编号"), { target: { value: "2" } });
    expect(screen.queryByText("中奖结果")).not.toBeInTheDocument();
  });

  it("reveals results immediately when opened from a valid masked URL", async () => {
    const config: LotteryConfig = { v: 1, m: "l", p: ["甲", "乙", "丙"], n: 1, s: "分享种子", t: "季度礼物" };
    window.history.replaceState(null, "", `/?${encodeConfig(config, true)}`);
    const sharedResultRoot = document.createElement("div");
    sharedResultRoot.id = "shared-result-root";
    document.body.appendChild(sharedResultRoot);
    render(<LotteryApp />);

    expect(await screen.findByText("中奖结果")).toBeInTheDocument();
    expect(await screen.findByRole("heading", { name: "本次抽奖结果已揭晓" })).toBeInTheDocument();
    expect(screen.getAllByText("季度礼物").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "复制分享链接" })).toBeInTheDocument();
    expect(screen.getByRole("switch", { name: "遮掩 URL 参数" })).toBeChecked();
  });

  it("uses the local minute and follows the name while the seed is automatic", async () => {
    render(<LotteryApp />);
    const seed = await screen.findByLabelText("随机种子");
    await waitFor(() => expect((seed as HTMLInputElement).value).toContain("Roll抽奖-"));

    fireEvent.change(screen.getByLabelText("抽奖名称 （可选）"), { target: { value: "夏日活动" } });
    expect((seed as HTMLInputElement).value).toContain("夏日活动-");

    fireEvent.change(seed, { target: { value: "我的固定种子" } });
    fireEvent.change(screen.getByLabelText("抽奖名称 （可选）"), { target: { value: "新名称" } });
    expect(seed).toHaveValue("我的固定种子");
  });

  it("renders the complete draw controls in English", async () => {
    render(<LotteryApp locale="en" />);
    expect(screen.getByRole("heading", { name: "Create a draw worth sharing" })).toBeInTheDocument();
    expect(screen.getByLabelText("Draw name (optional)")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Number range" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reveal results" })).toBeInTheDocument();
    await waitFor(() => expect((screen.getByLabelText("Random seed") as HTMLInputElement).value).toContain("Giveaway-"));
  });

  it("changes only the URL representation when masking is toggled", async () => {
    render(<LotteryApp />);
    await waitFor(() => expect(window.location.search).toContain("v=1"));
    const switchControl = screen.getByRole("switch", { name: "遮掩 URL 参数" });

    await act(async () => fireEvent.click(switchControl));
    await waitFor(() => expect(window.location.search).toMatch(/^\?d=/));
    expect(screen.queryByText("中奖结果")).not.toBeInTheDocument();
  });
});
