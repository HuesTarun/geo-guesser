import { Link } from "react-router";
import { MapPin, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center">
        <MapPin className="w-16 h-16 text-gray-600 mx-auto mb-6" />
        <h1 className="text-6xl font-bold text-[#E6C200] mb-4">404</h1>
        <h2 className="text-xl font-medium text-gray-300 mb-2">Lost in the world?</h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The page you're looking for doesn't exist. Maybe it's time to drop a pin somewhere else.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#E6C200] text-[#1A1D24] font-bold rounded-xl hover:bg-[#E6C200]/90 transition-all"
        >
          <Home className="w-5 h-5" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
