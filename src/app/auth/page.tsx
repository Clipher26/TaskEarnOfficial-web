"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthPage } from "@/components/AuthPage";

export default function AuthRoute() {
  const router = useRouter();
  return <AuthPage onSuccess={() => router.replace("/dashboard")} />;
}
