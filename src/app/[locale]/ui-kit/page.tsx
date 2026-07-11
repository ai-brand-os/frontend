import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { isLocale } from "@/i18n/config";

export const metadata: Metadata = {
  title: "Component kit",
};

type PageProps = Readonly<{
  params: Promise<{ locale: string }>;
}>;

const swatches = [
  { name: "background", varName: "--background" },
  { name: "surface", varName: "--card" },
  { name: "surface-2", varName: "--surface-2" },
  { name: "text", varName: "--foreground" },
  { name: "muted", varName: "--muted-foreground" },
  { name: "border", varName: "--border" },
  { name: "border-strong", varName: "--input" },
  { name: "pulse", varName: "--pulse" },
  { name: "pulse-ink", varName: "--pulse-ink" },
  { name: "ember", varName: "--ember" },
];

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-5 rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex items-baseline gap-2.5">
        <h2 className="text-[15px] font-semibold text-foreground">{title}</h2>
        <span className="font-mono text-xs text-muted-foreground">{hint}</span>
      </div>
      {children}
    </section>
  );
}

export default async function UiKitPage({ params }: PageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-[1000px] px-8 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-[11px] font-medium tracking-[0.12em] uppercase text-muted-foreground">
            Design system
          </p>
          <h1 className="mb-1.5 font-heading text-[32px] leading-[1.05] font-semibold tracking-tight text-foreground">
            Component kit
          </h1>
          <p className="max-w-[56ch] text-sm leading-normal text-muted-foreground">
            Primitives that compose every screen in Brand OS. Same tokens,
            light and dark. Try the theme toggle.
          </p>
        </div>
        <ThemeToggle />
      </div>

      <Section title="Palette" hint="brand tokens · light and dark">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {swatches.map((swatch) => (
            <div key={swatch.name}>
              <div
                className="h-14 rounded-md border border-border"
                style={{ background: `var(${swatch.varName})` }}
              />
              <div className="mt-1.5 font-mono text-[11px] text-muted-foreground">
                {swatch.name}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography" hint="Clash Display · Inter · IBM Plex Mono">
        <div className="space-y-3">
          <p className="font-heading text-[32px] leading-[1.05] font-semibold tracking-tight text-foreground">
            Ship a brand in an afternoon.
          </p>
          <p className="text-sm text-foreground">
            Inter carries UI copy — labels, body, controls.
          </p>
          <p className="font-mono text-xs tracking-[0.12em] uppercase text-muted-foreground">
            IBM Plex Mono carries kickers, SKUs and job IDs
          </p>
        </div>
      </Section>

      <Section title="Button" hint="primary · secondary · destructive · ghost">
        <div className="flex flex-wrap items-center gap-3.5">
          <Button className="h-10 px-4.5 text-sm font-semibold">
            Generate brand
          </Button>
          <Button
            variant="outline"
            className="h-10 border-input px-4.5 text-sm font-semibold"
          >
            Import source
          </Button>
          <Button
            variant="destructive"
            className="h-10 bg-ember px-4.5 text-sm font-semibold text-white hover:bg-ember/90 dark:bg-ember dark:hover:bg-ember/90"
          >
            Delete product
          </Button>
          <Button variant="ghost" className="h-10 px-3.5 text-sm font-semibold">
            Cancel
          </Button>
          <Button disabled className="h-10 px-4.5 text-sm font-semibold">
            Disabled
          </Button>
        </div>
        <div className="mt-3.5 flex flex-wrap items-center gap-3.5">
          <Button className="font-semibold">Small</Button>
          <Button variant="outline" className="border-input font-semibold">
            Small
          </Button>
          <span className="font-mono text-xs text-muted-foreground">
            radius 6 · h40 / h32
          </span>
        </div>
      </Section>

      <Section title="Input" hint="text · error state">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="kit-name" className="text-[13px]">
              Product name
            </Label>
            <Input
              id="kit-name"
              placeholder="Aurora Night Serum"
              className="h-[42px] bg-field px-3.5 dark:bg-field"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kit-sku" className="text-[13px]">
              SKU <span className="text-ember">*</span>
            </Label>
            <Input
              id="kit-sku"
              placeholder="BRD-0000"
              aria-invalid
              className="h-[42px] bg-field px-3.5 dark:bg-field"
            />
            <p className="text-xs text-ember">SKU is required.</p>
          </div>
        </div>
      </Section>

      <Section title="Status pill" hint="radius 999 · async status carries the pulse">
        <div className="flex flex-wrap items-center gap-3">
          <Badge dot>Auto-Approved</Badge>
          <Badge variant="secondary">Processing</Badge>
          <Badge variant="destructive" dot>
            Failed
          </Badge>
          <Badge variant="muted">Queued</Badge>
          <Badge variant="muted">Draft</Badge>
        </div>
      </Section>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-[22px]">
          <p className="mb-3.5 font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
            Card
          </p>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-semibold text-foreground">
                Aurora Night Serum
              </div>
              <div className="mt-1 font-mono text-xs text-muted-foreground">
                BRD-1042
              </div>
            </div>
            <Badge dot className="text-[11px]">
              Auto-Approved
            </Badge>
          </div>
          <p className="mt-3.5 text-[13px] leading-relaxed text-muted-foreground">
            Retinal + peptide overnight treatment. Voice extracted from 4
            sources, 12 attributes mapped.
          </p>
        </div>

        <div className="flex flex-col rounded-lg border border-border bg-card p-[22px]">
          <div className="mb-1 flex items-baseline justify-between">
            <span className="font-mono text-[11px] font-medium tracking-[0.1em] uppercase text-muted-foreground">
              Completeness score
            </span>
            <span className="font-mono text-xs font-semibold text-pulse-ink">
              signature element
            </span>
          </div>
          <div className="my-2 flex items-end gap-3.5">
            <span className="font-heading text-[46px] leading-none font-semibold text-foreground">
              74
            </span>
            <span className="pb-1 text-[15px] font-medium text-muted-foreground">
              / 100
            </span>
          </div>
          <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full w-[74%] rounded-full bg-pulse" />
          </div>
          <p className="text-xs text-muted-foreground">
            8 of 12 brand attributes resolved.
          </p>
        </div>
      </div>
    </div>
  );
}
