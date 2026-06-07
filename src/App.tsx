import { Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import { Navbar } from "./components/layout/Navbar";

const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Game = lazy(() => import("./pages/Game"));
const Lobby = lazy(() => import("./pages/Lobby"));
const MultiplayerGame = lazy(() => import("./pages/MultiplayerGame"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));
const Friends = lazy(() => import("./pages/Friends"));
const Settings = lazy(() => import("./pages/Settings"));
const Admin = lazy(() => import("./pages/Admin"));
const Challenge = lazy(() => import("./pages/Challenge"));
const NotFound = lazy(() => import("./pages/NotFound"));

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-[#1A1D24] flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E6C200]" />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen bg-[#1A1D24] text-white">
      <Navbar />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/game" element={<Game />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/lobby/:code" element={<Lobby />} />
          <Route path="/multiplayer" element={<MultiplayerGame />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/challenge/:code" element={<Challenge />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </div>
  );
}
