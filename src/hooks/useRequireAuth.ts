import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getTelegramUser } from "@/lib/telegram";

export function useRequireAuth() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const tgUser = getTelegramUser();
  const isLoggedIn = isAuthenticated || !!tgUser?.id;

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.replace("/auth");
    }
  }, [isLoggedIn, isLoading, router]);

  return { isLoggedIn, isLoading };
}
