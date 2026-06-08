import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import {
  Users, UserPlus, Check, X, Search, Trash2,
  ArrowLeft, Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function Friends() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"friends" | "requests" | "search">("friends");

  const { data: friends, isLoading: friendsLoading, refetch: refetchFriends } = trpc.user.listFriends.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: requests, isLoading: requestsLoading, refetch: refetchRequests } = trpc.user.friendRequests.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: searchResults } = trpc.user.search.useQuery(
    { query: searchQuery, limit: 20 },
    { enabled: searchQuery.length >= 2 }
  );

  const utils = trpc.useUtils();

  const sendRequestMutation = trpc.user.sendFriendRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request sent!");
      utils.user.search.invalidate();
      refetchRequests();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to send friend request.");
    },
  });

  const acceptRequestMutation = trpc.user.acceptFriendRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request accepted!");
      refetchFriends();
      refetchRequests();
      utils.user.search.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to accept friend request.");
    },
  });

  const rejectRequestMutation = trpc.user.rejectFriendRequest.useMutation({
    onSuccess: () => {
      toast.success("Friend request declined.");
      refetchRequests();
      utils.user.search.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to decline friend request.");
    },
  });

  const removeFriendMutation = trpc.user.removeFriend.useMutation({
    onSuccess: () => {
      toast.success("Friend removed.");
      refetchFriends();
      utils.user.search.invalidate();
    },
    onError: (err) => {
      toast.error(err.message || "Failed to remove friend.");
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Please login to manage friends</p>
          <button onClick={() => navigate("/login")} className="px-6 py-2 bg-[#E6C200] text-[#1A1D24] font-bold rounded-lg">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="flex items-center gap-3 mb-6">
        <Users className="w-6 h-6 text-[#3B82F6]" />
        <h1 className="text-2xl font-bold">Friends</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("friends")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "friends" ? "bg-[#3B82F6] text-white" : "bg-[#252830] text-gray-400 hover:text-white"
          }`}
        >
          Friends ({friends?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("requests")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "requests" ? "bg-[#3B82F6] text-white" : "bg-[#252830] text-gray-400 hover:text-white"
          }`}
        >
          Requests ({requests?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "search" ? "bg-[#3B82F6] text-white" : "bg-[#252830] text-gray-400 hover:text-white"
          }`}
        >
          <Search className="w-4 h-4 inline mr-1" />
          Find
        </button>
      </div>

      {/* Friends List */}
      {activeTab === "friends" && (
        <div className="space-y-2">
          {friendsLoading ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#E6C200]" /></div>
          ) : friends && friends.length > 0 ? (
            friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between p-4 bg-[#252830] rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center font-bold text-sm">
                    {(friend.name || friend.username || "P")[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{friend.name || friend.username}</div>
                    <div className="text-xs text-gray-400 capitalize">{friend.rank} · {friend.eloRating} ELO</div>
                  </div>
                  <div className={`w-2 h-2 rounded-full ${friend.isOnline ? "bg-green-400" : "bg-gray-600"}`} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/profile/${friend.id}`)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                    title="View Profile"
                  >
                    <UserPlus className="w-4 h-4 text-gray-400" />
                  </button>
                  <button
                    onClick={() => removeFriendMutation.mutate({ friendId: friend.id })}
                    className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Remove Friend"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No friends yet. Start adding some!</div>
          )}
        </div>
      )}

      {/* Requests */}
      {activeTab === "requests" && (
        <div className="space-y-2">
          {requestsLoading ? (
            <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#E6C200]" /></div>
          ) : requests && requests.length > 0 ? (
            requests.map((req: any) => (
              <div key={req.id} className="flex items-center justify-between p-4 bg-[#252830] rounded-xl border border-gray-700/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E6C200] rounded-full flex items-center justify-center font-bold text-sm text-[#1A1D24]">
                    {(req.requester?.name || req.requester?.username || "P")[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{req.requester?.name || req.requester?.username}</div>
                    <div className="text-xs text-gray-400 capitalize">{req.requester?.rank}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => acceptRequestMutation.mutate({ requestId: req.id })}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => rejectRequestMutation.mutate({ requestId: req.id })}
                    className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">No pending friend requests</div>
          )}
        </div>
      )}

      {/* Search */}
      {activeTab === "search" && (
        <div>
          <div className="mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by username..."
              className="w-full px-4 py-3 bg-[#252830] border border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#3B82F6]"
            />
          </div>
          <div className="space-y-2">
            {searchResults && searchResults.length > 0 ? (
              searchResults.map((u: any) => (
                <div key={u.id} className="flex items-center justify-between p-4 bg-[#252830] rounded-xl border border-gray-700/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3B82F6] rounded-full flex items-center justify-center font-bold text-sm">
                      {(u.name || u.username || "P")[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{u.name || u.username}</div>
                      <div className="text-xs text-gray-400 capitalize">{u.rank} · {u.eloRating} ELO</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {u.friendshipStatus === "self" && (
                      <span className="text-xs text-gray-500 font-medium px-2.5 py-1 bg-gray-800/40 rounded-lg">You</span>
                    )}
                    {u.friendshipStatus === "friends" && (
                      <span className="text-xs text-green-400 font-semibold px-2.5 py-1 bg-green-500/10 rounded-lg">Friends</span>
                    )}
                    {u.friendshipStatus === "sent_pending" && (
                      <span className="text-xs text-yellow-500 font-medium px-2.5 py-1 bg-yellow-500/10 rounded-lg">Pending</span>
                    )}
                    {u.friendshipStatus === "received_pending" && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => acceptRequestMutation.mutate({ requestId: u.friendshipRequestId })}
                          className="px-2.5 py-1.5 bg-green-500 text-white text-xs font-semibold rounded-lg hover:bg-green-600 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => rejectRequestMutation.mutate({ requestId: u.friendshipRequestId })}
                          className="px-2.5 py-1.5 bg-red-500/20 text-red-400 text-xs font-semibold rounded-lg hover:bg-red-500/30 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {u.friendshipStatus === "none" && (
                      <button
                        onClick={() => sendRequestMutation.mutate({ userId: u.id })}
                        disabled={sendRequestMutation.isPending}
                        className="p-2 bg-[#3B82F6]/20 text-[#3B82F6] rounded-lg hover:bg-[#3B82F6]/30 transition-colors disabled:opacity-50"
                        title="Add Friend"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : searchQuery.length >= 2 ? (
              <div className="text-center py-8 text-gray-500">No users found</div>
            ) : (
              <div className="text-center py-8 text-gray-500">Type at least 2 characters to search</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
