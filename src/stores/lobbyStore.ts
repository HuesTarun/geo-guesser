import { create } from "zustand";

interface LobbyPlayer {
  userId: number;
  username: string;
  avatar?: string;
  isReady: boolean;
  isHost: boolean;
}

interface LobbyMessage {
  senderId: number;
  senderName: string;
  content: string;
  timestamp: Date;
}

interface LobbyState {
  lobbyCode: string | null;
  lobbyName: string;
  players: LobbyPlayer[];
  messages: LobbyMessage[];
  settings: {
    region: string;
    mode: string;
    totalRounds: number;
    roundTime: number;
    allowMovement: boolean;
  };
  isHost: boolean;
  isReady: boolean;
  status: "idle" | "waiting" | "in_progress" | "finished";

  setLobby: (code: string, name: string, players: LobbyPlayer[], isHost: boolean) => void;
  setPlayers: (players: LobbyPlayer[]) => void;
  addMessage: (msg: LobbyMessage) => void;
  setMessages: (msgs: LobbyMessage[]) => void;
  updateSettings: (settings: Partial<LobbyState["settings"]>) => void;
  setReady: (ready: boolean) => void;
  setStatus: (status: LobbyState["status"]) => void;
  reset: () => void;
}

export const useLobbyStore = create<LobbyState>((set) => ({
  lobbyCode: null,
  lobbyName: "",
  players: [],
  messages: [],
  settings: {
    region: "worldwide",
    mode: "classic",
    totalRounds: 5,
    roundTime: 120,
    allowMovement: true,
  },
  isHost: false,
  isReady: false,
  status: "idle",

  setLobby: (code, name, players, isHost) =>
    set({ lobbyCode: code, lobbyName: name, players, isHost, status: "waiting" }),

  setPlayers: (players) => set({ players }),

  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),

  setMessages: (msgs) => set({ messages: msgs }),

  updateSettings: (newSettings) =>
    set((state) => ({ settings: { ...state.settings, ...newSettings } })),

  setReady: (ready) => set({ isReady: ready }),

  setStatus: (status) => set({ status }),

  reset: () =>
    set({
      lobbyCode: null,
      lobbyName: "",
      players: [],
      messages: [],
      settings: {
        region: "worldwide",
        mode: "classic",
        totalRounds: 5,
        roundTime: 120,
        allowMovement: true,
      },
      isHost: false,
      isReady: false,
      status: "idle",
    }),
}));
