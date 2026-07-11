import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";

import { proxy } from "@/proxy";

function requestFor(pathname: string) {
  return new NextRequest(new URL(pathname, "https://example.com"));
}

describe("proxy", () => {
  it("passes through requests that already have a supported locale", () => {
    const response = proxy(requestFor("/en/signin"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects the root path to the default locale", () => {
    const response = proxy(requestFor("/"));

    expect(response.status).toBe(307);
    expect(new URL(response.headers.get("location")!).pathname).toBe("/en");
  });

  it("redirects unlocalized paths, preserving the rest of the path", () => {
    const response = proxy(requestFor("/signup"));

    expect(new URL(response.headers.get("location")!).pathname).toBe(
      "/en/signup",
    );
  });

  it("redirects when the first segment is not a known locale", () => {
    const response = proxy(requestFor("/de/signin"));

    expect(new URL(response.headers.get("location")!).pathname).toBe(
      "/en/de/signin",
    );
  });
});
