import { MapillaryViewer } from "@/components/MapillaryViewer";
import { NoStreetViewFallback } from "@/components/NoStreetViewFallback";

interface StreetViewPanelProps {
  accessToken?: string;
  streetViewId?: string | null;
  city?: string | null;
  country?: string;
  mapillaryFailed: boolean;
  onMapillaryFailed: () => void;
  allowMovement?: boolean;
}

export function StreetViewPanel({
  accessToken,
  streetViewId,
  city,
  country,
  mapillaryFailed,
  onMapillaryFailed,
  allowMovement = true,
}: StreetViewPanelProps) {
  if (streetViewId && accessToken && !mapillaryFailed) {
    return (
      <MapillaryViewer
        accessToken={accessToken}
        imageId={streetViewId}
        onFallback={onMapillaryFailed}
        allowMovement={allowMovement}
      />
    );
  }

  const reason = !accessToken && streetViewId
    ? "missing_token"
    : mapillaryFailed
      ? "load_failed"
      : "no_coverage";

  return (
    <NoStreetViewFallback
      city={city}
      country={country}
      reason={reason}
    />
  );
}
