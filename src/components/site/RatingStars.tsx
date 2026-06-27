import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = 13,
  showValue = false,
  count,
}: {
  rating: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.4;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i < full;
          const isHalf = i === full && half;
          return (
            <Star
              key={i}
              width={size}
              height={size}
              strokeWidth={0}
              className={cn(
                filled || isHalf ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200",
              )}
            />
          );
        })}
      </div>
      {showValue && <span className="text-xs font-semibold text-slate-700">{rating.toFixed(1)}</span>}
      {count != null && <span className="text-xs text-slate-400">({count})</span>}
    </div>
  );
}
