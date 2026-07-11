import { describe, expect, it } from "vitest";

import { Badge } from "@/components/ui/badge";
import { render, screen } from "@/test/render";

describe("Badge", () => {
  it("renders its children", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("renders a dot indicator only when requested", () => {
    const { rerender } = render(<Badge dot>Active</Badge>);
    expect(screen.getByText("Active").querySelector("[aria-hidden]")).not.toBeNull();

    rerender(<Badge>Active</Badge>);
    expect(screen.getByText("Active").querySelector("[aria-hidden]")).toBeNull();
  });

  it("merges a custom className instead of dropping it", () => {
    render(<Badge className="custom-badge">Active</Badge>);
    expect(screen.getByText("Active")).toHaveClass("custom-badge");
  });
});
