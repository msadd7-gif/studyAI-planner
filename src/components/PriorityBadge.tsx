import { priorityLabel } from "@/lib/planner";
import { cn } from "@/lib/utils";

const tones = {
  destructive: "bg-destructive/15 text-destructive",
  tangerine: "bg-tangerine-soft text-accent-foreground",
  mint: "bg-mint-soft text-secondary-foreground",
  muted: "bg-muted text-muted-foreground",
};

export function PriorityBadge({ score }: { score: number }) {
  const p = priorityLabel(score);
  return <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-bold", tones[p.tone])}>{p.label}</span>;
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-fresh transition-all duration-700" style={{ width: `${value}%` }} />
    </div>
  );
}
