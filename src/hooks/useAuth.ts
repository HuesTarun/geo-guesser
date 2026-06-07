import { trpc } from "@/providers/trpc";
import { useCallback, useMemo } from "react";

export function useAuth() {
  // Try local auth
  const {
    data: localUser,
    isLoading: localLoading,
  } = trpc.localAuth.me.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
    retry: false,
  });

  const user = localUser || null;
  const isLoading = localLoading;

  const logout = useCallback(() => {
    localStorage.removeItem("local_auth_token");
    window.location.reload();
  }, []);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      isAdmin: user?.role === "admin" || user?.role === "moderator",
      logout,
    }),
    [user, isLoading, logout],
  );
}
