import { MapillaryViewer } from "@/components/MapillaryViewer";
import { NoStreetViewFallback } from "@/components/NoStreetViewFallback";

interface StreetViewPanelProps {
  accessToken?: string;
  streetViewId?: string | null;
  city?: string | null;
  country?: string;
  mapillaryFailed: boolean;
  onMapillaryFailed: () => void;
}

export function StreetViewPanel({
  accessToken,
  streetViewId,
  city,
  country,
  mapillaryFailed,
  onMapillaryFailed,
}: StreetViewPanelProps) {
  if (streetViewId && accessToken && !mapillaryFailed) {
    return (
      <MapillaryViewer
        accessToken={accessToken}
        imageId={streetViewId}
        onFallback={onMapillaryFailed}
      />
    );
  }

  return (
    <NoStreetViewFallback
      city={city}
      country={country}
      reason={mapillaryFailed ? "load_failed" : "no_coverage"}
    />
  );
}
