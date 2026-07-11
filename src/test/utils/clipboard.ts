import { vi } from "vitest";

/** jsdom has no clipboard implementation; stub the async Clipboard API. */
export function mockClipboard() {
  const clipboard = {
    writeText: vi.fn().mockResolvedValue(undefined),
    readText: vi.fn().mockResolvedValue(""),
  };

  vi.stubGlobal("navigator", {
    ...navigator,
    clipboard,
  });

  return clipboard;
}
