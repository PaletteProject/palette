import { useEffect, useState } from "react";
import { cn } from "@/lib/utils.ts";

interface ProgressBarProps {
  value: number;
  showLabel?: boolean;
  className?: string;
  size?: string;
}

export function ProgressBar({
  value,
  showLabel = true,
  className,
  size = "md",
}: ProgressBarProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const clampedValue = Math.min(Math.max(value, 0), 100);

  useEffect(() => {
    const timeout = setTimeout(() => setAnimatedValue(clampedValue), 200);
    return () => clearTimeout(timeout);
  }, [clampedValue]);

  const colorClass =
    clampedValue < 60
      ? "bg-destructive"
      : clampedValue < 80
        ? "bg-yellow-500"
        : "bg-green-500";

  const heightClass = size === "sm" ? "h-1.5" : size === "lg" ? "h-4" : "h-2";

  return (
    <div className="w-full flex flex-col gap-1" aria-label="progress bar">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={animatedValue}
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-muted transition-all",
          heightClass,
          className,
        )}
      >
        <div
          className={cn(
            "h-full transition-all duration-500 ease-in-out",
            colorClass,
          )}
          style={{ width: `${animatedValue}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground text-right">
          {clampedValue.toFixed(0)}%
        </span>
      )}
    </div>
  );
}
