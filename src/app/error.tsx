"use client";

import { useEffect } from "react";
import { NotFoundPage } from "@/components/error-pages/NotFoundPage";
import { UnauthorizedPage } from "@/components/error-pages/UnauthorizedPage";
import { ForbiddenPage } from "@/components/error-pages/ForbiddenPage";
import { PaymentRequiredPage } from "@/components/error-pages/PaymentRequiredPage";

interface ErrorProps {
  error: Error & { statusCode?: number; digest?: string };
  reset: () => void;
}

const ErrorPage: React.FC<ErrorProps> = ({ error, reset }) => {
  const statusCode = (error as any).statusCode || 500;

  useEffect(() => {
    if (statusCode === 500) {
      console.error("Application error:", error);
    }
  }, [error, statusCode]);

  if (statusCode === 401) {
    return <UnauthorizedPage />;
  }

  if (statusCode === 403) {
    return <ForbiddenPage />;
  }

  if (statusCode === 400) {
    return <NotFoundPage />;
  }

  if (statusCode === 402) {
    return <PaymentRequiredPage />;
  }

  return <NotFoundPage />;
};

export default ErrorPage;
