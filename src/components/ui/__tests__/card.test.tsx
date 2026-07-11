import { describe, expect, it } from "vitest";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { render, screen } from "@/test/render";

describe("Card", () => {
  it("composes header, content, and footer into one document", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Plan</CardTitle>
          <CardDescription>Monthly billing</CardDescription>
        </CardHeader>
        <CardContent>Details go here</CardContent>
        <CardFooter>Actions</CardFooter>
      </Card>,
    );

    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Monthly billing")).toBeInTheDocument();
    expect(screen.getByText("Details go here")).toBeInTheDocument();
    expect(screen.getByText("Actions")).toBeInTheDocument();
  });

  it("defaults to the standard size and accepts the compact variant", () => {
    const { rerender, container } = render(<Card>Body</Card>);
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute(
      "data-size",
      "default",
    );

    rerender(<Card size="sm">Body</Card>);
    expect(container.querySelector('[data-slot="card"]')).toHaveAttribute(
      "data-size",
      "sm",
    );
  });
});
