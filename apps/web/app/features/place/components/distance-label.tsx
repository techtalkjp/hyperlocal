import { FootprintsIcon, MapPinIcon } from "lucide-react";
import { cn } from "~/libs/utils";

/**
 * 距離表示（ランキングnearme・現在地ドロップダウンで共用）
 */
export const DistanceLabel = ({
  distance,
  className,
}: {
  distance: number;
  className?: string;
}) => {
  return (
    <div className={cn("text-brand flex items-center gap-2 text-xs", className)}>
      <div className="whitespace-nowrap">
        <MapPinIcon className="mr-1 mb-1 inline h-4 w-4" />
        {distance > 1000 ? `${(distance / 1000).toFixed(1)} km` : `${distance.toFixed(0)} m`}
      </div>
      {distance < 2000 && (
        <div className="whitespace-nowrap">
          <FootprintsIcon className="mr-1 mb-1 inline h-4 w-4" />
          <span>{(distance / 80).toFixed(0)} min</span>
        </div>
      )}
    </div>
  );
};
