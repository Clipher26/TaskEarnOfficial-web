"use client";

import { useState, useCallback } from "react";

export type ZkProofType = "TLS_NOTARY" | "RECLAIN" | "CUSTOM";

export function useZkTLS() {
  const [proof, setProof] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateProof = useCallback(async (options: {
    targetUrl: string;
    claim?: string;
    proofType?: ZkProofType;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const extensionAvailable = typeof window !== "undefined" && !!(window as any).__ZKTLS_EXTENSION__;
      if (!extensionAvailable) {
        throw new Error("zkTLS extension not detected");
      }
      const result = await (window as any).__ZKTLS_EXTENSION__.generateProof({
        targetUrl: options.targetUrl,
        claim: options.claim,
        proofType: options.proofType || "TLS_NOTARY",
      });
      setProof(result);
      return result;
    } catch (err: any) {
      setError(err.message || "Failed to generate proof");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setProof(null);
    setError(null);
    setLoading(false);
  }, []);

  return { proof, error, loading, generateProof, reset };
}
