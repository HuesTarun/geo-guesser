import { MapPinOff } from "lucide-react";

interface NoStreetViewFallbackProps {
  city?: string | null;
  country?: string;
  reason?: "no_coverage" | "load_failed" | "missing_token";
}

export function NoStreetViewFallback({
  city,
  country,
  reason = "no_coverage",
}: NoStreetViewFallbackProps) {
  const placeName = city || country || "this area";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1A1D24] text-center px-6">
      <div className="w-16 h-16 rounded-2xl bg-[#252830] border border-gray-700/50 flex items-center justify-center mb-5">
        <MapPinOff className="w-8 h-8 text-gray-500" />
      </div>

      <h2 className="text-lg font-semibold text-white mb-2">
        No street view available
      </h2>

      <p className="text-gray-400 text-sm max-w-sm mb-1">
        {reason === "missing_token"
          ? "Street view is not configured on the server (Mapillary token missing)."
          : reason === "load_failed"
            ? "The interactive panorama could not be loaded for this round."
            : `There is no street-level imagery for ${placeName} in our database.`}
      </p>

      <p className="text-gray-500 text-xs max-w-xs">
        Place your guess on the world map on the right.
      </p>
    </div>
  );
}
