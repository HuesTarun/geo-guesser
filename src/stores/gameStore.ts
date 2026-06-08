import { create } from "zustand";

interface RoundResult {
  roundNumber: number;
  guessLat: number | null;
  guessLng: number | null;
  actualLat: number;
  actualLng: number;
  distance: number | null;
  score: number | null;
}

export interface GameLocation {
  id?: number;
  lat: number;
  lng: number;
  country: string;
  city: string | null;
  imageUrl?: string | null;
  difficulty?: string | null;
  streetViewId?: string | null;
}

interface GameState {
  gameId: number | null;
  roundId: number | null;
  roundNumber: number;
  totalRounds: number;
  totalScore: number;
  mode: string;
  region: string;
  status: "idle" | "playing" | "round_summary" | "game_over";
  currentLocation: GameLocation | null;
  guessLocation: { lat: number; lng: number } | null;
  roundResults: RoundResult[];
  timeLeft: number;
  showSummary: boolean;
  lastGuess: {
    distance: number;
    score: number;
    actualLocation: { lat: number; lng: number };
    guessLocation: { lat: number; lng: number };
    nextRound?: { roundId: number; roundNumber: number; location: GameLocation } | null;
    gameComplete?: boolean;
    finalScore?: number;
  } | null;

  // Actions
  startGame: (data: {
    gameId: number;
    roundId: number;
    roundNumber: number;
    totalRounds: number;
    location: GameLocation;
    mode: string;
    region: string;
  }) => void;
  setGuess: (lat: number, lng: number) => void;
  submitGuessResult: (result: {
    distance: number;
    score: number;
    actualLocation: { lat: number; lng: number };
    guessLocation: { lat: number; lng: number };
    nextRound?: { roundId: number; roundNumber: number; location: GameLocation } | null;
    gameComplete?: boolean;
    finalScore?: number;
  }) => void;
  setTimeLeft: (time: number) => void;
  nextRound: (data: {
    roundId: number;
    roundNumber: number;
    location: GameLocation;
  }) => void;
  resetGame: () => void;
  showRoundSummary: (show: boolean) => void;
}


export const useGameStore = create<GameState>((set) => ({
  gameId: null,
  roundId: null,
  roundNumber: 0,
  totalRounds: 5,
  totalScore: 0,
  mode: "classic",
  region: "worldwide",
  status: "idle",
  currentLocation: null,
  guessLocation: null,
  roundResults: [],
  timeLeft: 120,
  showSummary: false,
  lastGuess: null,

  startGame: (data) =>
    set({
      gameId: data.gameId,
      roundId: data.roundId,
      roundNumber: data.roundNumber,
      totalRounds: data.totalRounds,
      totalScore: 0,
      mode: data.mode,
      region: data.region,
      status: "playing",
      currentLocation: data.location,
      guessLocation: null,
      roundResults: [],
      timeLeft: 120,
      showSummary: false,
      lastGuess: null,
    }),

  setGuess: (lat, lng) => set({ guessLocation: { lat, lng } }),

  submitGuessResult: (result) =>
    set((state) => {
      const newResults = [
        ...state.roundResults,
        {
          roundNumber: state.roundNumber,
          guessLat: state.guessLocation?.lat || null,
          guessLng: state.guessLocation?.lng || null,
          actualLat: result.actualLocation.lat,
          actualLng: result.actualLocation.lng,
          distance: result.distance,
          score: result.score,
        },
      ];

      const lastGuessData = {
        distance: result.distance,
        score: result.score,
        actualLocation: result.actualLocation,
        guessLocation: result.guessLocation,
        nextRound: result.nextRound || null,
        gameComplete: result.gameComplete || false,
        finalScore: result.finalScore,
      };

      if (result.gameComplete) {
        return {
          totalScore: result.finalScore || state.totalScore + result.score,
          status: "game_over" as const,
          roundResults: newResults,
          showSummary: true,
          lastGuess: lastGuessData,
        };
      }

      return {
        totalScore: state.totalScore + result.score,
        roundResults: newResults,
        showSummary: true,
        lastGuess: lastGuessData,
      };
    }),

  setTimeLeft: (time) => set({ timeLeft: time }),

  nextRound: (data) =>
    set({
      roundId: data.roundId,
      roundNumber: data.roundNumber,
      currentLocation: data.location,
      guessLocation: null,
      status: "playing",
      showSummary: false,
      lastGuess: null,
    }),

  resetGame: () =>
    set({
      gameId: null,
      roundId: null,
      roundNumber: 0,
      totalRounds: 5,
      totalScore: 0,
      mode: "classic",
      region: "worldwide",
      status: "idle",
      currentLocation: null,
      guessLocation: null,
      roundResults: [],
      timeLeft: 120,
      showSummary: false,
      lastGuess: null,
    }),

  showRoundSummary: (show) => set({ showSummary: show }),
}));
