"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCurrentUser, useLogout } from "@/features/auth";
import { LogOut } from "lucide-react";

const toInitials = (name: string): string => {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
};

const SidebarUserSection = ({
  user,
  locale,
  logoutFailureLabel,
}: {
  locale: string;
  logoutFailureLabel: string;
  user: { name: string; role: string; signOutLabel: string };
}) => {
  const currentUser = useCurrentUser();
  const logout = useLogout();
  const router = useRouter();
  const displayName = currentUser?.fullName ?? user.name;
  return (
    <div>
      <div className="flex items-center gap-2.5 px-1.5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-ember font-heading text-[13px] font-semibold text-white">
          {toInitials(displayName)}
        </span>
        <div className="min-w-0 flex-1 leading-tight">
          <div className="truncate text-sm font-semibold text-sidebar-foreground">
            {displayName}
          </div>
          <div className="truncate font-mono text-xs text-muted-foreground">
            {user.role}
          </div>
        </div>
        <button
          type="button"
          aria-label={user.signOutLabel}
          disabled={logout.isPending}
          onClick={() =>
            logout.mutate(undefined, {
              onSuccess: () => router.replace(`/${locale}/signin`),
            })
          }
          className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground cursor-pointer"
        >
          <LogOut className="size-4 rtl:-scale-x-100" />
        </button>
      </div>
      {logout.isError && (
        <div role="alert" className="mt-2 text-sm text-ember">
          <p>{logoutFailureLabel}</p>
          <Link className="underline" href={`/${locale}/signin`}>
            {locale === "fa" ? "ورود" : "Sign in"}
          </Link>
        </div>
      )}
    </div>
  );
};

export { SidebarUserSection };
