import { useEffect } from "react";
import { act } from "@testing-library/react";
import { clearTokens, setTokens, setUser } from "@/lib/api";
import { describe, expect, it } from "vitest";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

import { Providers } from "@/components/providers";
import { render, screen } from "@/test/render";

function ChildProbe() {
  const queryClient = useQueryClient();
  return (
    <span>{queryClient ? "has-query-client" : "missing-query-client"}</span>
  );
}

describe("Providers", () => {
  it("renders its children", () => {
    render(
      <Providers>
        <span>App content</span>
      </Providers>,
    );

    expect(screen.getByText("App content")).toBeInTheDocument();
  });

  it("makes a QueryClient available to descendants", () => {
    render(
      <Providers>
        <ChildProbe />
      </Providers>,
    );

    expect(screen.getByText("has-query-client")).toBeInTheDocument();
  });
});

it("clears principal data and cancels an old pending query across account changes", async () => {
  let client!: QueryClient;
  function Probe() {
    const queryClient = useQueryClient();
    useEffect(() => {
      client = queryClient;
    }, [queryClient]);
    return null;
  }
  setUser({ id: "old", fullName: "Old", email: "old@example.com" });
  render(
    <Providers>
      <Probe />
    </Providers>,
  );
  client.setQueryData(["private"], "old data");
  let release!: (value: string) => void;
  const oldQuery = client
    .fetchQuery({
      queryKey: ["pending-private"],
      queryFn: () =>
        new Promise<string>((resolve) => {
          release = resolve;
        }),
    })
    .catch(() => undefined);
  act(() => setUser({ id: "new", fullName: "New", email: "new@example.com" }));
  expect(client.getQueryData(["private"])).toBeUndefined();
  release("old response");
  await oldQuery;
  expect(client.getQueryData(["pending-private"])).toBeUndefined();
  client.setQueryData(["private"], "new data");
  act(() => clearTokens());
  expect(client.getQueryData(["private"])).toBeUndefined();
});

it("preserves the current principal cache on ordinary token rotation", () => {
  let client!: QueryClient;
  function Probe() {
    const queryClient = useQueryClient();
    useEffect(() => {
      client = queryClient;
    }, [queryClient]);
    return null;
  }
  render(
    <Providers>
      <Probe />
    </Providers>,
  );
  client.setQueryData(["private"], "current data");
  act(() =>
    setTokens({ accessToken: "rotated", refreshToken: "rotated-refresh" }),
  );
  expect(client.getQueryData(["private"])).toBe("current data");
});
