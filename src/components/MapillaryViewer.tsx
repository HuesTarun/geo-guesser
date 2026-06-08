import { useEffect, useRef, useState } from "react";
import { Viewer } from "mapillary-js";
import "mapillary-js/dist/mapillary.css";
import { Loader2 } from "lucide-react";

interface MapillaryViewerProps {
  accessToken: string;
  imageId: string;
  onFallback: () => void;
}

export function MapillaryViewer({ accessToken, imageId, onFallback }: MapillaryViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onFallbackRef = useRef(onFallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  onFallbackRef.current = onFallback;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !accessToken || !imageId) {
      setLoading(false);
      return;
    }

    let viewer: Viewer | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    const handleLoadSuccess = () => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      setLoading(false);
      setError(false);
    };

    const handleLoadFailure = () => {
      if (cancelled) return;
      if (timeoutId) clearTimeout(timeoutId);
      setError(true);
      setLoading(false);
      onFallbackRef.current();
    };

    setLoading(true);
    setError(false);

    try {
      viewer = new Viewer({
        accessToken,
        container,
        imageId: String(imageId),
        component: {
          cover: false,
          direction: true,
        },
      });

      viewer.on("image", handleLoadSuccess);
      viewer.on("load", handleLoadSuccess);
      viewer.on("navigable", handleLoadSuccess);

      timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.warn("[MapillaryViewer] Load timed out.");
          handleLoadFailure();
        }
      }, 20000);
    } catch (err) {
      console.error("Failed to initialize Mapillary Viewer:", err);
      handleLoadFailure();
    }

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      if (viewer) {
        try {
          viewer.remove();
        } catch (e) {
          console.warn("Error removing Mapillary viewer:", e);
        }
      }
    };
  }, [accessToken, imageId]);

  return (
    <div className="relative w-full h-full bg-[#1A1D24] overflow-hidden">
      <div ref={containerRef} className="absolute inset-0 w-full h-full" />

      {loading && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1D24]/80 z-10 pointer-events-none">
          <Loader2 className="w-8 h-8 text-[#E6C200] animate-spin mb-2" />
          <p className="text-gray-400 text-sm">Loading street panorama...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1D24] text-center px-4 z-10">
          <p className="text-red-400 text-sm font-medium mb-1">Could not load interactive view.</p>
          <p className="text-gray-500 text-xs">Use the map to place your guess.</p>
        </div>
      )}
    </div>
  );
}
