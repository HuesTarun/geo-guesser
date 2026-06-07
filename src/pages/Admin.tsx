import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  Shield, Users, Gamepad2, Flag, Search, ArrowLeft,
  BarChart3, MapPin,
} from "lucide-react";

export default function Admin() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [tab, setTab] = useState<"overview" | "users" | "reports" | "locations">("overview");
  const [search, setSearch] = useState("");

  const { data: stats } = trpc.admin.getStats.useQuery(undefined, { enabled: isAdmin });
  const { data: usersData } = trpc.admin.getUsers.useQuery(
    { page: 1, limit: 50, search: search || undefined },
    { enabled: isAdmin && tab === "users" }
  );
  const { data: reportsData } = trpc.admin.getReports.useQuery(
    { page: 1, limit: 50 },
    { enabled: isAdmin && tab === "reports" }
  );
  const { data: locationsData } = trpc.admin.getLocations.useQuery(
    { page: 1, limit: 50 },
    { enabled: isAdmin && tab === "locations" }
  );

  const updateRoleMutation = trpc.admin.updateUserRole.useMutation();
  const resolveReportMutation = trpc.admin.resolveReport.useMutation();
  const deleteLocationMutation = trpc.admin.deleteLocation.useMutation();

  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You need admin privileges to view this page.</p>
          <button onClick={() => navigate("/")} className="px-6 py-2 bg-[#E6C200] text-[#1A1D24] font-bold rounded-lg">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "reports", label: "Reports", icon: Flag },
    { id: "locations", label: "Locations", icon: MapPin },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-3 mb-8">
        <Shield className="w-6 h-6 text-[#E6C200]" />
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? "bg-[#E6C200] text-[#1A1D24]" : "bg-[#252830] text-gray-400 hover:text-white"
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#252830] rounded-xl p-5 border border-gray-700/50">
            <Users className="w-6 h-6 text-[#3B82F6] mb-3" />
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <div className="text-sm text-gray-400">Total Users</div>
          </div>
          <div className="bg-[#252830] rounded-xl p-5 border border-gray-700/50">
            <Gamepad2 className="w-6 h-6 text-green-400 mb-3" />
            <div className="text-3xl font-bold">{stats.totalGames}</div>
            <div className="text-sm text-gray-400">Total Games</div>
          </div>
          <div className="bg-[#252830] rounded-xl p-5 border border-gray-700/50">
            <BarChart3 className="w-6 h-6 text-[#E6C200] mb-3" />
            <div className="text-3xl font-bold">{stats.activeGames}</div>
            <div className="text-sm text-gray-400">Active Games</div>
          </div>
          <div className="bg-[#252830] rounded-xl p-5 border border-gray-700/50">
            <Flag className="w-6 h-6 text-red-400 mb-3" />
            <div className="text-3xl font-bold">{stats.pendingReports}</div>
            <div className="text-sm text-gray-400">Pending Reports</div>
          </div>
        </div>
      )}

      {/* Users */}
      {tab === "users" && (
        <div className="bg-[#252830] rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="p-4 border-b border-gray-700/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 bg-[#1A1D24] border border-gray-700/50 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6]"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 text-left text-sm text-gray-400">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">ELO</th>
                  <th className="px-4 py-3">Games</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.users.map((u: any) => (
                  <tr key={u.id} className="border-b border-gray-700/30 hover:bg-white/5">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-[#3B82F6] rounded-full flex items-center justify-center text-sm font-bold">
                          {(u.name || u.username || "P")[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{u.name || u.username}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => updateRoleMutation.mutate({ userId: u.id, role: e.target.value as any })}
                        className="px-2 py-1 bg-[#1A1D24] border border-gray-700/50 rounded text-sm"
                      >
                        <option value="user">User</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm capitalize">{u.rank}</td>
                    <td className="px-4 py-3 text-sm">{u.eloRating}</td>
                    <td className="px-4 py-3 text-sm">{u.gamesPlayed}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => navigate(`/profile/${u.id}`)}
                        className="text-xs text-[#3B82F6] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reports */}
      {tab === "reports" && (
        <div className="bg-[#252830] rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 text-left text-sm text-gray-400">
                  <th className="px-4 py-3">Reporter</th>
                  <th className="px-4 py-3">Reported</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reportsData?.reports.map((r: any) => (
                  <tr key={r.id} className="border-b border-gray-700/30 hover:bg-white/5">
                    <td className="px-4 py-3 text-sm">{r.reporterId}</td>
                    <td className="px-4 py-3 text-sm">{r.reportedId}</td>
                    <td className="px-4 py-3 text-sm capitalize">{r.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        r.status === "pending" ? "bg-yellow-500/20 text-yellow-400" :
                        r.status === "resolved" ? "bg-green-500/20 text-green-400" :
                        "bg-gray-500/20 text-gray-400"
                      }`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => resolveReportMutation.mutate({ reportId: r.id, status: "resolved" })}
                          className="text-xs text-green-400 hover:underline"
                        >
                          Resolve
                        </button>
                        <button
                          onClick={() => resolveReportMutation.mutate({ reportId: r.id, status: "dismissed" })}
                          className="text-xs text-red-400 hover:underline"
                        >
                          Dismiss
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Locations */}
      {tab === "locations" && (
        <div className="bg-[#252830] rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700/50 text-left text-sm text-gray-400">
                  <th className="px-4 py-3">Country</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Region</th>
                  <th className="px-4 py-3">Difficulty</th>
                  <th className="px-4 py-3">Times Played</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locationsData?.locations.map((loc: any) => (
                  <tr key={loc.id} className="border-b border-gray-700/30 hover:bg-white/5">
                    <td className="px-4 py-3 text-sm">{loc.country}</td>
                    <td className="px-4 py-3 text-sm">{loc.city || "-"}</td>
                    <td className="px-4 py-3 text-sm capitalize">{loc.region}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${
                        loc.difficulty === "easy" ? "bg-green-500/20 text-green-400" :
                        loc.difficulty === "medium" ? "bg-yellow-500/20 text-yellow-400" :
                        loc.difficulty === "hard" ? "bg-orange-500/20 text-orange-400" :
                        "bg-red-500/20 text-red-400"
                      }`}>
                        {loc.difficulty}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{loc.timesPlayed}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteLocationMutation.mutate({ locationId: loc.id })}
                        className="text-xs text-red-400 hover:underline"
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
