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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !accessToken || !imageId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    let viewer: Viewer | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    try {
      // Initialize Mapillary Viewer
      viewer = new Viewer({
        accessToken,
        container: containerRef.current,
        imageId,
        component: {
          cover: false, // Disable the Mapillary logo cover/start page
          direction: true, // Show navigation arrows
        },
      });

      // Handle successful load
      viewer.on("image", () => {
        setLoading(false);
      });

      // Implement a 6-second timeout fallback in case of loading errors/failures
      timeoutId = setTimeout(() => {
        setLoading((currentLoading) => {
          if (currentLoading) {
            console.warn("[MapillaryViewer] Load timed out, falling back to static view.");
            setError(true);
            onFallback();
          }
          return false;
        });
      }, 6000);
    } catch (err) {
      console.error("Failed to initialize Mapillary Viewer:", err);
      setError(true);
      setLoading(false);
      onFallback();
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (viewer) {
        try {
          viewer.remove();
        } catch (e) {
          console.warn("Error removing Mapillary viewer:", e);
        }
      }
    };
  }, [accessToken, imageId, onFallback]);

  return (
    <div className="relative w-full h-full bg-[#1A1D24] overflow-hidden flex items-center justify-center">
      <div ref={containerRef} className="w-full h-full" style={{ visibility: loading || error ? "hidden" : "visible" }} />
      
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1D24] z-10">
          <Loader2 className="w-8 h-8 text-[#E6C200] animate-spin mb-2" />
          <p className="text-gray-400 text-sm">Loading 3D Street Panorama...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1A1D24] text-center px-4 z-10">
          <p className="text-red-400 text-sm font-medium mb-1">Could not load interactive view.</p>
          <p className="text-gray-500 text-xs">Switching to standard view...</p>
        </div>
      )}
    </div>
  );
}
