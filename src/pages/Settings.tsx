import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Settings as SettingsIcon, Save, ArrowLeft, User, Globe } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [country, setCountry] = useState(user?.country || "");
  const [saved, setSaved] = useState(false);

  const updateMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSave = () => {
    updateMutation.mutate({ name: name || undefined, country: country || undefined });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <SettingsIcon className="w-6 h-6 text-gray-400" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      <div className="bg-[#252830] rounded-2xl p-6 border border-gray-700/50 space-y-6">
        {/* Profile */}
        <div>
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-[#3B82F6]" />
            Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Display Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-[#1A1D24] border border-gray-700/50 rounded-xl text-white focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Country</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="Your country"
                  className="w-full pl-10 pr-4 py-3 bg-[#1A1D24] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-gray-700/50">
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all ${
              saved
                ? "bg-green-500/20 text-green-400"
                : "bg-[#E6C200] text-[#1A1D24] hover:bg-[#E6C200]/90"
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : updateMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
