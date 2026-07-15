import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowDownRight,
  ArrowUpRight,
  Layers,
  Package,
  Plus,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ProductList,
  type ProductItem,
} from "@/components/dashboard/product-list";
import { isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/dictionaries";

export const metadata: Metadata = {
  title: "Dashboard",
};

type PageProps = Readonly<{ params: Promise<{ locale: string }> }>;

type Stat = {
  key: "products" | "completeness" | "jobs" | "sources";
  icon: LucideIcon;
  value: string;
  trend: number;
};

const STATS: Stat[] = [
  { key: "products", icon: Package, value: "24", trend: 3 },
  { key: "completeness", icon: Sparkles, value: "74%", trend: 6 },
  { key: "jobs", icon: Workflow, value: "3", trend: -2 },
  { key: "sources", icon: Layers, value: "112", trend: 9 },
];

const PRODUCTS: ProductItem[] = [
  {
    id: "1",
    name: "Aurora Night Serum",
    sku: "BRD-1042",
    status: "approved",
    completeness: 92,
    updated: "2h",
  },
  {
    id: "2",
    name: "Solar Repair Balm",
    sku: "BRD-1039",
    status: "processing",
    completeness: 61,
    updated: "5h",
  },
  {
    id: "3",
    name: "Tidal Clay Mask",
    sku: "BRD-1036",
    status: "queued",
    completeness: 30,
    updated: "1d",
  },
  {
    id: "4",
    name: "Ember Lip Oil",
    sku: "BRD-1031",
    status: "failed",
    completeness: 18,
    updated: "2d",
  },
  {
    id: "5",
    name: "Meadow Hand Cream",
    sku: "BRD-1024",
    status: "draft",
    completeness: 45,
    updated: "3d",
  },
];

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ""));
}

export default async function DashboardPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = getMessages(locale as Locale);
  const t = messages.dashboard;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 py-8 sm:px-8">
      {/* Header */}
      <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
            {t.kicker}
          </p>
          <h1 className="font-heading text-[28px] leading-[1.1] font-semibold tracking-tight text-foreground">
            {fill(t.title, { name: messages.nav.userName.split(" ")[0] })}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t.subtitle}</p>
        </div>
        <Button className="h-10 gap-1.5 px-4 text-sm font-semibold">
          <Plus className="size-4" />
          {t.newProduct}
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          const up = stat.trend >= 0;
          const TrendIcon = up ? ArrowUpRight : ArrowDownRight;
          const trendText = fill(up ? t.trendUp : t.trendDown, {
            value: `${Math.abs(stat.trend)}`,
          });

          return (
            <div
              key={stat.key}
              className="rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-lg bg-pulse-soft text-pulse-ink">
                  <Icon className="size-4.5" />
                </span>
                <span
                  className={
                    up
                      ? "flex items-center gap-0.5 text-xs font-semibold text-pulse-ink"
                      : "flex items-center gap-0.5 text-xs font-semibold text-ember"
                  }
                >
                  <TrendIcon className="size-3.5" />
                  {Math.abs(stat.trend)}
                </span>
              </div>
              <div className="mt-4 font-heading text-[30px] leading-none font-semibold text-foreground">
                {stat.value}
              </div>
              <div className="mt-1.5 text-[13px] text-muted-foreground">
                {t.stats[stat.key]}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground/80">
                {trendText}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* List */}
        <section className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-4">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">
                {t.list.title}
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {t.list.subtitle}
              </p>
            </div>
            <Button
              variant="ghost"
              className="h-8 shrink-0 px-2.5 text-[13px] font-semibold text-pulse-ink"
            >
              {t.list.viewAll}
            </Button>
          </div>
          <ProductList
            items={PRODUCTS}
            labels={{
              columns: t.list.columns,
              status: t.status,
              empty: t.list.empty,
            }}
          />
        </section>

        {/* Completeness */}
        <aside className="flex h-fit flex-col rounded-xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
              {t.completenessTitle}
            </span>
            <span className="font-mono text-xs font-semibold text-pulse-ink">
              {t.completenessHint}
            </span>
          </div>
          <div className="my-3 flex items-end gap-3">
            <span className="font-heading text-[52px] leading-none font-semibold text-foreground">
              74
            </span>
            <span className="pb-1.5 text-[15px] font-medium text-muted-foreground">
              / 100
            </span>
          </div>
          <div className="mb-2.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-pulse"
              style={{ inlineSize: "74%" }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {fill(t.completenessCaption, { resolved: 8, total: 12 })}
          </p>
        </aside>
      </div>
    </div>
  );
}
