import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ProductStatus =
  | "approved"
  | "processing"
  | "failed"
  | "queued"
  | "draft";

export type ProductItem = {
  id: string;
  name: string;
  sku: string;
  status: ProductStatus;
  completeness: number;
  updated: string;
};

export type ProductListLabels = {
  columns: {
    product: string;
    status: string;
    completeness: string;
    updated: string;
  };
  status: Record<ProductStatus, string>;
  empty: string;
};

const STATUS_VARIANT: Record<
  ProductStatus,
  { variant: "default" | "secondary" | "destructive" | "muted"; dot: boolean }
> = {
  approved: { variant: "default", dot: true },
  processing: { variant: "secondary", dot: false },
  failed: { variant: "destructive", dot: true },
  queued: { variant: "muted", dot: false },
  draft: { variant: "muted", dot: false },
};

type ProductListProps = {
  items: ProductItem[];
  labels: ProductListLabels;
};

export function ProductList({ items, labels }: ProductListProps) {
  if (items.length === 0) {
    return (
      <p className="px-5 py-10 text-center text-sm text-muted-foreground">
        {labels.empty}
      </p>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Column header — hidden on small screens */}
      <div className="hidden grid-cols-[minmax(0,1fr)_7rem_9rem_6rem] items-center gap-4 px-5 pb-2.5 font-mono text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground sm:grid">
        <span className="text-start">{labels.columns.product}</span>
        <span className="text-start">{labels.columns.status}</span>
        <span className="text-start">{labels.columns.completeness}</span>
        <span className="text-end">{labels.columns.updated}</span>
      </div>

      <ul className="flex flex-col divide-y divide-border border-t border-border">
        {items.map((item) => {
          const status = STATUS_VARIANT[item.status];

          return (
            <li
              key={item.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 px-5 py-4 transition-colors hover:bg-muted/40 sm:grid-cols-[minmax(0,1fr)_7rem_9rem_6rem]"
            >
              {/* Product */}
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">
                  {item.name}
                </div>
                <div className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {item.sku}
                </div>
              </div>

              {/* Status */}
              <div className="justify-self-end sm:justify-self-start">
                <Badge variant={status.variant} dot={status.dot}>
                  {labels.status[item.status]}
                </Badge>
              </div>

              {/* Completeness */}
              <div className="col-span-2 flex items-center gap-2.5 sm:col-span-1">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className={cn(
                      "h-full rounded-full",
                      item.status === "failed" ? "bg-ember" : "bg-pulse",
                    )}
                    style={{ inlineSize: `${item.completeness}%` }}
                  />
                </div>
                <span className="w-9 shrink-0 text-end font-mono text-xs text-muted-foreground">
                  {item.completeness}%
                </span>
              </div>

              {/* Updated */}
              <div className="hidden text-end font-mono text-xs text-muted-foreground sm:block">
                {item.updated}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
