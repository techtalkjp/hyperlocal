import { FootprintsIcon } from "lucide-react";
import { cn } from "~/libs/utils";

// 徒歩速度 80m/分 (不動産表示規約と同じ)
const WALK_METERS_PER_MIN = 80;

/**
 * 最寄駅と徒歩分 (食べログの「◯◯駅から123m」由来)。
 * 駅名は日本語のまま出す。現地の案内表記と一致させるため翻訳しない。
 */
export const StationLabel = ({
  station,
  distance,
  className,
}: {
  station: string | null | undefined;
  distance: number | null | undefined;
  className?: string;
}) => {
  if (!station) return null;
  const minutes = distance ? Math.max(1, Math.ceil(distance / WALK_METERS_PER_MIN)) : null;
  return (
    <div
      className={cn("text-muted-foreground flex items-center gap-1 text-xs md:text-sm", className)}
    >
      <FootprintsIcon className="h-3.5 w-3.5 shrink-0" />
      <span className="truncate">
        {station}
        {minutes !== null && ` ${minutes} min`}
      </span>
    </div>
  );
};
