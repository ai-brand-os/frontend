/**
 * Query-key factory for organization data. Everything hangs off `all` so a
 * single `invalidateQueries({ queryKey: organizationKeys.all })` clears the
 * whole subtree; narrower keys let callers target one list/detail/members set.
 */
export const organizationKeys = {
  all: ["organizations"] as const,
  lists: () => [...organizationKeys.all, "list"] as const,
  detail: (id: string) => [...organizationKeys.all, "detail", id] as const,
  members: (id: string) =>
    [...organizationKeys.all, "detail", id, "members"] as const,
};
