import { cn } from "@/lib/utils";

// Deterministic waveform bar heights (percent of track height) — avoids
// hydration mismatch that Math.random() would cause.
const WAVE_HEIGHTS = [
  38, 52, 66, 48, 74, 88, 60, 46, 70, 92, 64, 54, 80, 96, 68, 50, 62, 86, 58,
  44, 76, 94, 66, 48, 60, 82, 56, 42, 72, 90, 52, 40,
];

type TProps = {
  data: {
    progressLabel: string;
    progress: number;
    signOutLabel: string;
  };
};

const SidebarBrandCompleteness = ({ data }: TProps) => {
  return (
    <div className="rounded-xl bg-sidebar-accent/40 p-3.5">
      <div className="mb-2.5 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-sidebar-foreground">
          {data.progressLabel}
        </span>
        <span className="font-heading text-sm font-semibold text-sidebar-accent-foreground">
          {data.progress}%
        </span>
      </div>
      <div
        className="flex h-9 items-center gap-[3px]"
        role="progressbar"
        aria-valuenow={data.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={data.progressLabel}
      >
        {WAVE_HEIGHTS.map((height, index) => {
          const filled =
            index < Math.round((data.progress / 100) * WAVE_HEIGHTS.length);
          return (
            <span
              key={index}
              aria-hidden
              className={cn(
                "w-[3px] shrink-0 rounded-full",
                filled ? "bg-sidebar-primary" : "bg-muted-foreground/30",
              )}
              style={{ height: `${height}%` }}
            />
          );
        })}
      </div>
    </div>
  );
};

export { SidebarBrandCompleteness };
