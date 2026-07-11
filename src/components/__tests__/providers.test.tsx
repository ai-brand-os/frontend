import { describe, expect, it } from "vitest";
import { useQueryClient } from "@tanstack/react-query";

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
