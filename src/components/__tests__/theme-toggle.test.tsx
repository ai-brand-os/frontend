import { afterEach, beforeEach, describe, expect, it } from "vitest";
import userEvent from "@testing-library/user-event";

import { ThemeToggle } from "@/components/theme-toggle";
import { render, screen } from "@/test/render";
import { mockLocalStorage } from "@/test/utils/storage";

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockLocalStorage();
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  it("shows the moon icon and switches to dark mode on click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole("button", { name: "Toggle theme" });
    await user.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith("theme", "dark");
  });

  it("switches back to light mode on a second click", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);

    const toggle = screen.getByRole("button", { name: "Toggle theme" });
    await user.click(toggle);
    await user.click(toggle);

    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.setItem).toHaveBeenLastCalledWith("theme", "light");
  });

  it("reflects the dark class already present on mount", () => {
    document.documentElement.classList.add("dark");
    render(<ThemeToggle />);

    expect(
      screen.getByRole("button", { name: "Toggle theme" }),
    ).toBeInTheDocument();
  });
});
