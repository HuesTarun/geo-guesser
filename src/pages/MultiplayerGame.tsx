import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import { useSocket } from "@/hooks/useSocket";
import { useLobbyStore } from "@/stores/lobbyStore";
import { trpc } from "@/providers/trpc";
import { StreetViewPanel } from "@/components/StreetViewPanel";
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import {
  Clock, Lock, Home,
  Trophy,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

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

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // Earth's radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function calculateScore(distanceInMeters: number): number {
  const MAX_SCORE = 5000;
  const MAX_DISTANCE = 15000000; // 15,000 km

  if (distanceInMeters <= 0) return MAX_SCORE;
  if (distanceInMeters >= MAX_DISTANCE) return 0;

  const score = Math.round(
    MAX_SCORE * Math.exp((-3 * distanceInMeters) / MAX_DISTANCE)
  );

  return Math.min(MAX_SCORE, Math.max(0, score));
}

export default function MultiplayerGame() {
  const navigate = useNavigate();

  const { emit, on } = useSocket();
  const lobbyStore = useLobbyStore();

  const [roundNumber, setRoundNumber] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [guessLocation, setGuessLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [mapillaryFailed, setMapillaryFailed] = useState(false);
  const handleMapillaryFailed = useCallback(() => setMapillaryFailed(true), []);
  const { data: mapillaryTokenData } = trpc.game.getMapillaryToken.useQuery(undefined, {
    staleTime: Infinity,
  });

  useEffect(() => {
    setMapillaryFailed(false);
  }, [roundNumber]);
  const [status, setStatus] = useState<"playing" | "round_end" | "game_over">("playing");
  const [lastGuess, setLastGuess] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [guessesThisRound, setGuessesThisRound] = useState<
    Record<
      number,
      { username: string; score?: number; distance?: number; guessed: boolean; totalScore?: number }
    >
  >({});

  // Initialize guesses state for the lobby players when round/players change
  useEffect(() => {
    const initialGuesses: typeof guessesThisRound = {};
    lobbyStore.players.forEach((p) => {
      initialGuesses[p.userId] = {
        username: p.username,
        guessed: false,
      };
    });
    setGuessesThisRound(initialGuesses);
  }, [roundNumber, lobbyStore.players]);

  const handleNextRound = useCallback(
    (nextRound: number) => {
      setRoundNumber(nextRound);
      setGuessLocation(null);
      setStatus("playing");
      setTimeLeft(lobbyStore.settings?.roundTime || 120);
      setLastGuess(null);
    },
    [lobbyStore.settings?.roundTime]
  );

  // Timer
  useEffect(() => {
    if (status === "playing" && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => Math.max(0, t - 1)), 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && status === "playing") {
      handleSubmitGuess();
    }
  }, [status, timeLeft]);

  // Socket events
  useEffect(() => {
    const unsubGuess = on("game:guess_result", (data: any) => {
      setGuessesThisRound((prev) => ({
        ...prev,
        [data.userId]: {
          username: data.username,
          guessed: true,
          score: data.score,
          distance: data.distance,
          totalScore: data.totalScore,
        },
      }));
    });

    const unsubNextRound = on("game:next_round", (data: any) => {
      handleNextRound(data.round);
    });

    const unsubFinalScores = on("game:final_scores", (data: any) => {
      setScores(data.scores);
      setStatus("game_over");
    });

    return () => {
      unsubGuess?.();
      unsubNextRound?.();
      unsubFinalScores?.();
    };
  }, [on, handleNextRound]);

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (status === "playing") {
        setGuessLocation({ lat, lng });
      }
    },
    [status]
  );

  const handleSubmitGuess = useCallback(() => {
    if (!lobbyStore.lobbyCode) return;

    const currentLoc = lobbyStore.gameLocations[roundNumber - 1];
    if (!currentLoc) return;

    const finalGuess = guessLocation || { lat: 0, lng: 0 };
    const distance = guessLocation
      ? haversineDistance(finalGuess.lat, finalGuess.lng, currentLoc.lat, currentLoc.lng)
      : 20000000;
    const score = guessLocation ? calculateScore(distance) : 0;

    setTotalScore((s) => s + score);
    setLastGuess({
      score,
      distance,
      actualLocation: { lat: currentLoc.lat, lng: currentLoc.lng },
      guessLocation: finalGuess,
    });

    emit("game:guess", {
      code: lobbyStore.lobbyCode,
      round: roundNumber,
      lat: finalGuess.lat,
      lng: finalGuess.lng,
      score,
      distance,
    });

    setStatus("round_end");
  }, [guessLocation, lobbyStore.lobbyCode, lobbyStore.gameLocations, roundNumber, emit]);

  const onHostClickNextRound = () => {
    if (roundNumber >= (lobbyStore.settings?.totalRounds || 5)) {
      emit("game:end", { code: lobbyStore.lobbyCode });
    } else {
      emit("game:next_round", {
        code: lobbyStore.lobbyCode,
        round: roundNumber + 1,
      });
    }
  };

  if (!lobbyStore.lobbyCode) {
    return (
      <div className="min-h-screen bg-[#1A1D24] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No active lobby found</p>
          <button
            onClick={() => navigate("/lobby")}
            className="px-6 py-2 bg-[#E6C200] text-[#1A1D24] font-bold rounded-lg"
          >
            Go to Lobby
          </button>
        </div>
      </div>
    );
  }

  if (lobbyStore.gameLocations.length === 0) {
    return (
      <div className="min-h-screen bg-[#1A1D24] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4 animate-pulse">Loading game locations...</p>
        </div>
      </div>
    );
  }

  const currentLocation = lobbyStore.gameLocations[roundNumber - 1];

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeColor =
    timeLeft <= 10 ? "text-red-500" : timeLeft <= 30 ? "text-yellow-500" : "text-white";

  if (status === "game_over") {
    return (
      <div className="min-h-screen bg-[#1A1D24] flex items-center justify-center px-4">
        <div className="w-full max-w-lg bg-[#252830] rounded-2xl p-8 border border-gray-700/50">
          <Trophy className="w-12 h-12 text-[#E6C200] mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-center mb-6">Game Over</h1>

          <div className="text-center mb-8">
            <div className="text-5xl font-bold text-[#E6C200] mb-2">
              {totalScore.toLocaleString()}
            </div>
          </div>

          <div className="space-y-2 mb-8">
            {scores.map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#1A1D24] rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-400">#{i + 1}</span>
                  <span className="font-medium">{s.username}</span>
                </div>
                <span className="font-bold text-[#E6C200]">{s.score.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="w-full py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all flex items-center justify-center gap-2"
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
            Round <span className="text-white font-bold">{roundNumber}</span>
          </div>
          <div className="text-sm text-gray-400">
            Score: <span className="text-[#E6C200] font-bold">{totalScore.toLocaleString()}</span>
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
          <StreetViewPanel
            accessToken={mapillaryTokenData?.token}
            streetViewId={currentLocation?.streetViewId}
            city={currentLocation?.city}
            country={currentLocation?.country}
            mapillaryFailed={mapillaryFailed}
            onMapillaryFailed={handleMapillaryFailed}
            allowMovement={lobbyStore.settings?.allowMovement}
          />
          <div className="absolute bottom-4 left-4 bg-black/75 backdrop-blur-md px-4 py-2 rounded-xl text-xs border border-gray-700/50 pointer-events-none select-none">
            <span className="text-[#E6C200] font-bold uppercase tracking-wider">
              Round {roundNumber}
            </span>
          </div>
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
              guessLocation={guessLocation}
              actualLocation={lastGuess?.actualLocation || null}
              showSummary={status === "round_end"}
            />
            {guessLocation && status === "playing" && (
              <Marker position={[guessLocation.lat, guessLocation.lng]} icon={guessIcon} />
            )}
            {status === "round_end" && lastGuess && (
              <>
                <Marker
                  position={[
                    lastGuess.actualLocation?.lat || 0,
                    lastGuess.actualLocation?.lng || 0,
                  ]}
                  icon={actualIcon}
                />
                {guessLocation && (
                  <Polyline
                    positions={[
                      [guessLocation.lat, guessLocation.lng],
                      [lastGuess.actualLocation?.lat || 0, lastGuess.actualLocation?.lng || 0],
                    ]}
                    color="#EF4444"
                    weight={2}
                    dashArray="5, 10"
                  />
                )}
              </>
            )}
          </MapContainer>

          {status === "playing" && (
            <button
              onClick={handleSubmitGuess}
              disabled={!guessLocation}
              className="absolute bottom-4 left-1/2 -translate-x-1/2 px-8 py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-full shadow-lg hover:bg-[#E6C200]/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 z-[9999]"
            >
              <Lock className="w-4 h-4" />
              Lock In Guess
            </button>
          )}
        </div>
      </div>

      {/* Round Summary */}
      {status === "round_end" && lastGuess && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999] px-4">
          <div className="bg-[#252830] rounded-2xl p-6 max-w-md w-full border border-gray-700/50">
            <h2 className="text-xl font-bold text-center mb-4">Round {roundNumber} Complete</h2>
            <div className="text-center mb-6">
              <div className="text-4xl font-bold text-[#E6C200] mb-1">
                +{lastGuess.score?.toLocaleString()}
              </div>
              <div className="text-gray-400 text-sm">
                Distance: {(lastGuess.distance / 1000).toFixed(0)} km
              </div>
            </div>

            {/* Display guess status of all players in lobby */}
            <div className="space-y-2 mb-6">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider text-left">
                Lobby Guess Status
              </h3>
              {Object.entries(guessesThisRound).map(([userIdStr, playerStatus]) => (
                <div
                  key={userIdStr}
                  className="flex items-center justify-between p-2.5 bg-[#1A1D24] rounded-lg text-sm border border-gray-800"
                >
                  <span className="font-medium text-white">{playerStatus.username}</span>
                  <span
                    className={
                      playerStatus.guessed
                        ? "text-green-400 font-semibold text-xs bg-green-500/10 px-2 py-0.5 rounded"
                        : "text-yellow-500 font-medium text-xs animate-pulse bg-yellow-500/10 px-2 py-0.5 rounded"
                    }
                  >
                    {playerStatus.guessed
                      ? `Guessed (+${playerStatus.score?.toLocaleString()})`
                      : "Thinking..."}
                  </span>
                </div>
              ))}
            </div>

            {lobbyStore.isHost ? (
              <button
                onClick={onHostClickNextRound}
                className="w-full py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all"
              >
                {roundNumber >= (lobbyStore.settings?.totalRounds || 5)
                  ? "Finish Game"
                  : "Next Round"}
              </button>
            ) : (
              <div className="text-center text-sm text-gray-400 py-3 bg-[#1A1D24] rounded-xl border border-gray-800 animate-pulse">
                Waiting for host to start next round...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
