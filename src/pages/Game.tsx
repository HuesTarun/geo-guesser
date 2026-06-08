import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

import { trpc } from "@/providers/trpc";
import { useGameStore } from "@/stores/gameStore";
import { MapillaryViewer } from "@/components/MapillaryViewer";
import { Clock, ChevronRight, RotateCcw, Home, Lock, Loader2, Trophy, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const guessIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const actualIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapBoundsHandler({ 
  guessLocation, 
  actualLocation, 
  showSummary 
}: { 
  guessLocation: { lat: number; lng: number } | null; 
  actualLocation: { lat: number; lng: number } | null; 
  showSummary: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (showSummary && guessLocation && actualLocation) {
      const bounds = L.latLngBounds(
        [guessLocation.lat, guessLocation.lng],
        [actualLocation.lat, actualLocation.lng]
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [showSummary, guessLocation, actualLocation, map]);

  return null;
}

function PanZoomImage({ src, alt }: { src: string; alt: string }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 0.15;
    const newScale = e.deltaY < 0 ? Math.min(scale + zoomFactor, 4) : Math.max(scale - zoomFactor, 1);
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      const touch = e.touches[0];
      setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStart.x,
        y: touch.clientY - dragStart.y,
      });
    }
  };

  const zoomIn = () => {
    setScale((s) => Math.min(s + 0.5, 4));
  };

  const zoomOut = () => {
    setScale((s) => {
      const newScale = Math.max(s - 0.5, 1);
      if (newScale === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newScale;
    });
  };

  return (
    <div
      ref={containerRef}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none relative"
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-100 ease-out pointer-events-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
        }}
      />
      <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg text-[10px] text-gray-300 border border-gray-700/50 pointer-events-none hidden sm:block">
        Scroll to Zoom · Drag to Pan
      </div>
      
      {/* Zoom control buttons for mobile/desktop */}
      <div className="absolute bottom-4 right-4 flex gap-1.5 z-10">
        <button
          onClick={zoomOut}
          disabled={scale === 1}
          className="w-10 h-10 bg-black/70 backdrop-blur-md text-white font-bold rounded-xl border border-gray-700/50 flex items-center justify-center hover:bg-black/90 active:scale-95 transition-all disabled:opacity-50"
        >
          -
        </button>
        <button
          onClick={zoomIn}
          disabled={scale === 4}
          className="w-10 h-10 bg-black/70 backdrop-blur-md text-white font-bold rounded-xl border border-gray-700/50 flex items-center justify-center hover:bg-black/90 active:scale-95 transition-all disabled:opacity-50"
        >
          +
        </button>
      </div>
    </div>
  );
}

export default function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const gameState = useGameStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [useFlickrFallback, setUseFlickrFallback] = useState(false);
  const { data: mapillaryTokenData } = trpc.game.getMapillaryToken.useQuery(undefined, {
    staleTime: Infinity,
  });

  useEffect(() => {
    setUseFlickrFallback(false);
  }, [gameState.roundNumber]);

  const mode = (location.state?.mode as string) || "classic";
  const region = (location.state?.region as string) || "worldwide";
  const rounds = (location.state?.rounds as number) || 5;
  const challengeCode = (location.state?.challengeCode as string) || undefined;

  const [createdChallengeCode, setCreatedChallengeCode] = useState<string | null>(null);
  const [isCreatingChallenge, setIsCreatingChallenge] = useState(false);

  const { data: gameResults } = trpc.game.getResults.useQuery(
    { gameId: gameState.gameId || 0 },
    { enabled: gameState.status === "game_over" && !!gameState.gameId && !challengeCode }
  );

  const createChallengeMutation = trpc.challenge.create.useMutation({
    onSuccess: (data) => {
      setCreatedChallengeCode(data.code);
      const challengeUrl = `${window.location.origin}/challenge/${data.code}`;
      navigator.clipboard.writeText(challengeUrl);
      toast.success("Challenge created and link copied to clipboard!");
      setIsCreatingChallenge(false);
    },
    onError: (err) => {
      toast.error(err.message || "Failed to create challenge.");
      setIsCreatingChallenge(false);
    }
  });

  const handleShareChallenge = () => {
    if (!gameResults || gameResults.rounds.length === 0) return;
    setIsCreatingChallenge(true);
    const locationIds = gameResults.rounds
      .map((r: any) => r.locationId)
      .filter((id: any): id is number => typeof id === "number");
    
    createChallengeMutation.mutate({
      locationIds,
      totalRounds: gameResults.totalRounds,
    });
  };

  const startGameMutation = trpc.game.startSolo.useMutation({
    onSuccess: (data) => {
      gameState.startGame({
        gameId: data.gameId,
        roundId: data.roundId,
        roundNumber: data.roundNumber,
        totalRounds: data.totalRounds,
        location: data.location,
        mode: data.mode,
        region: data.region,
      });
    },
  });

  const submitGuessMutation = trpc.game.submitGuess.useMutation({
    onSuccess: (data) => {
      gameState.submitGuessResult(data);
    },
  });

  // Start game on mount
  useEffect(() => {
    if (gameState.status !== "playing" && !startGameMutation.isPending) {
      gameState.resetGame();
      startGameMutation.mutate({
        mode: mode as any,
        region: region as any,
        totalRounds: rounds,
        challengeCode,
      });
    }
  }, []);

  // Timer
  useEffect(() => {
    if (gameState.status === "playing" && gameState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        gameState.setTimeLeft(Math.max(0, gameState.timeLeft - 1));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.status, gameState.timeLeft]);

  // Auto-submit on time out
  useEffect(() => {
    if (gameState.timeLeft === 0 && gameState.status === "playing") {
      handleSubmitGuess();
    }
  }, [gameState.timeLeft]);

  const handleMapClick = useCallback((lat: number, lng: number) => {
    if (gameState.status === "playing") {
      gameState.setGuess(lat, lng);
    }
  }, [gameState.status]);

  const handleSubmitGuess = useCallback(() => {
    if (!gameState.guessLocation || !gameState.gameId || !gameState.roundId) return;

    if (timerRef.current) clearInterval(timerRef.current);

    submitGuessMutation.mutate({
      gameId: gameState.gameId,
      roundId: gameState.roundId,
      lat: gameState.guessLocation.lat,
      lng: gameState.guessLocation.lng,
      timeTaken: 120 - gameState.timeLeft,
    });
  }, [gameState.guessLocation, gameState.gameId, gameState.roundId]);

  const handleNextRound = useCallback(() => {
    gameState.showRoundSummary(false);
    if (gameState.lastGuess?.nextRound) {
      gameState.nextRound({
        roundId: gameState.lastGuess.nextRound.roundId,
        roundNumber: gameState.lastGuess.nextRound.roundNumber,
        location: gameState.lastGuess.nextRound.location,
      });
    }
  }, [gameState.lastGuess]);

  const handlePlayAgain = useCallback(() => {
    gameState.resetGame();
    startGameMutation.mutate({
      mode: mode as any,
      region: region as any,
      totalRounds: rounds,
      challengeCode,
    });
  }, []);

  // Format time
  const minutes = Math.floor(gameState.timeLeft / 60);
  const seconds = gameState.timeLeft % 60;
  const timeColor = gameState.timeLeft <= 10 ? "text-red-500" : gameState.timeLeft <= 30 ? "text-yellow-500" : "text-white";

  if (gameState.status === "idle" || startGameMutation.isPending) {
    return (
      <div className="min-h-screen bg-[#1A1D24] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#E6C200] animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  if (gameState.status === "game_over") {
    return (
      <div className="min-h-screen bg-[#1A1D24] flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-[#252830] rounded-2xl p-8 border border-gray-700/50">
          <h1 className="text-3xl font-bold text-center mb-2">Game Over</h1>
          <p className="text-gray-400 text-center mb-6">
            {gameState.roundNumber} rounds completed
          </p>

          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-[#E6C200] mb-2">
              {gameState.totalScore.toLocaleString()}
            </div>
            <div className="text-gray-400">
              / {(gameState.totalRounds * 5000).toLocaleString()} possible
            </div>
          </div>

          {/* Round breakdown */}
          <div className="space-y-2 mb-8">
            {gameState.roundResults.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 bg-[#1A1D24] rounded-lg"
              >
                <span className="text-sm text-gray-400">Round {r.roundNumber}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {r.distance ? `${(r.distance / 1000).toFixed(0)} km` : "No guess"}
                  </span>
                  <span className="text-sm font-bold text-[#E6C200]">
                    {r.score?.toLocaleString() || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {challengeCode ? (
            <button
              onClick={() => {
                gameState.resetGame();
                navigate(`/challenge/${challengeCode}`);
              }}
              className="w-full mb-4 py-3 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-[#3B82F6]/90 transition-all flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              View Challenge Leaderboard
            </button>
          ) : (
            gameResults && (
              <button
                onClick={handleShareChallenge}
                disabled={isCreatingChallenge || !!createdChallengeCode}
                className="w-full mb-4 py-3 bg-[#3B82F6] text-white font-bold rounded-xl hover:bg-[#3B82F6]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {isCreatingChallenge ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : createdChallengeCode ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    Challenge Copied! ({createdChallengeCode})
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    Share as Challenge
                  </>
                )}
              </button>
            )
          )}

          <div className="flex gap-3">
            <button
              onClick={handlePlayAgain}
              className="flex-1 py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Play Again
            </button>
            <button
              onClick={() => { gameState.resetGame(); navigate("/"); }}
              className="flex-1 py-3 bg-[#1A1D24] text-white font-medium rounded-xl hover:bg-[#1A1D24]/80 border border-gray-700/50 transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col">
      {/* Top HUD */}
      <div className="bg-[#252830] border-b border-gray-700/50 px-4 py-2 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-400">
            Round <span className="text-white font-bold">{gameState.roundNumber}</span> / {gameState.totalRounds}
          </div>
          <div className="text-sm text-gray-400">
            Score: <span className="text-[#E6C200] font-bold">{gameState.totalScore.toLocaleString()}</span>
          </div>
        </div>
        <div className={`flex items-center gap-1 font-mono text-lg font-bold ${timeColor}`}>
          <Clock className="w-4 h-4" />
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Street View Image */}
        <div className="flex-1 bg-[#1A1D24] relative flex items-center justify-center min-h-[200px] overflow-hidden">
          {gameState.currentLocation ? (
            <>
              {gameState.currentLocation.streetViewId && mapillaryTokenData?.token && !useFlickrFallback ? (
                <MapillaryViewer
                  accessToken={mapillaryTokenData.token}
                  imageId={gameState.currentLocation.streetViewId}
                  onFallback={() => setUseFlickrFallback(true)}
                />
              ) : (
                <PanZoomImage 
                  src={gameState.currentLocation.imageUrl || `https://loremflickr.com/800/600/${encodeURIComponent(gameState.currentLocation.city || gameState.currentLocation.country || "city")}?lock=${gameState.currentLocation.id || gameState.roundNumber}`} 
                  alt="Find this location" 
                />
              )}
            </>
          ) : (
            <div className="text-center">
              <Loader2 className="w-8 h-8 text-[#E6C200] animate-spin mx-auto mb-2" />
              <p className="text-gray-400 text-sm">Loading location...</p>
            </div>
          )}
        </div>

        {/* Map */}
        <div className="flex-1 relative min-h-[300px]">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            className="h-full w-full"
            style={{ height: "100%", minHeight: "300px" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onMapClick={handleMapClick} />
            <MapBoundsHandler 
              guessLocation={gameState.guessLocation} 
              actualLocation={gameState.lastGuess?.actualLocation || null} 
              showSummary={gameState.showSummary} 
            />
            {gameState.guessLocation && (
              <Marker
                position={[gameState.guessLocation.lat, gameState.guessLocation.lng]}
                icon={guessIcon}
              />
            )}
            {gameState.showSummary && gameState.lastGuess && (
              <>
                <Marker
                  position={[
                    gameState.lastGuess.actualLocation.lat,
                    gameState.lastGuess.actualLocation.lng,
                  ]}
                  icon={actualIcon}
                />
                {gameState.guessLocation && (
                  <Polyline
                    positions={[
                      [gameState.guessLocation.lat, gameState.guessLocation.lng],
                      [
                        gameState.lastGuess.actualLocation.lat,
                        gameState.lastGuess.actualLocation.lng,
                      ],
                    ]}
                    color="#EF4444"
                    weight={2}
                    dashArray="5, 10"
                  />
                )}
              </>
            )}
          </MapContainer>

          {/* Lock In Button */}
          {gameState.status === "playing" && (
            <button
              onClick={handleSubmitGuess}
              disabled={!gameState.guessLocation || submitGuessMutation.isPending}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-8 py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-full shadow-lg hover:bg-[#E6C200]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 z-[9999]"
            >
              <Lock className="w-4 h-4" />
              {submitGuessMutation.isPending ? "Submitting..." : "Lock In Guess"}
            </button>
          )}
        </div>
      </div>

      {/* Round Summary Overlay */}
      {gameState.showSummary && gameState.lastGuess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] px-4">
          <div className="bg-[#252830] rounded-2xl p-6 max-w-md w-full border border-gray-700/50">
            <h2 className="text-xl font-bold text-center mb-4">
              Round {gameState.roundNumber} Result
            </h2>

            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-[#E6C200] mb-1">
                +{gameState.lastGuess.score.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">
                Distance: {(gameState.lastGuess.distance / 1000).toFixed(0)} km
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-[#1A1D24] rounded-lg mb-4">
              <div className="text-sm">
                <div className="text-gray-400">Your guess</div>
                <div className="font-medium">
                  {gameState.guessLocation?.lat.toFixed(2)}, {gameState.guessLocation?.lng.toFixed(2)}
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <div className="text-sm text-right">
                <div className="text-gray-400">Actual</div>
                <div className="font-medium text-red-400">
                  {gameState.lastGuess.actualLocation.lat.toFixed(2)},{" "}
                  {gameState.lastGuess.actualLocation.lng.toFixed(2)}
                </div>
              </div>
            </div>

            <button
              onClick={handleNextRound}
              className="w-full py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all"
            >
              {gameState.roundNumber >= gameState.totalRounds ? "See Results" : "Next Round"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
