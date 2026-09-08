"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getTelegramUser } from "@/lib/telegram";
import { AuthPage } from "@/components/AuthPage";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const tgUser = getTelegramUser();

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated || tgUser?.id) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, tgUser?.id, router]);

  if (isLoading) {
    return null;
  }

  if (isAuthenticated || tgUser?.id) {
    return null;
  }

  return <AuthPage />;
}
