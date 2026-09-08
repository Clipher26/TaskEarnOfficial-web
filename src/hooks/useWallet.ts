"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { walletApi, WalletBalances, CryptoDepositPayload, BankDepositPayload, PaystackDepositPayload, WithdrawalPayload } from "@/api/walletApi";

export const useWallet = () => {
  const queryClient = useQueryClient();

  const walletQuery = useQuery<WalletBalances>({
    queryKey: ["wallet-balances"],
    queryFn: walletApi.getBalances,
    refetchInterval: 15000,
  });

  const cryptoDepositMutation = useMutation({
    mutationFn: (payload: CryptoDepositPayload) => walletApi.submitCryptoDeposit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balances"] });
    },
  });

  const bankDepositMutation = useMutation({
    mutationFn: (payload: BankDepositPayload) => walletApi.submitBankDeposit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balances"] });
    },
  });

  const paystackDepositMutation = useMutation({
    mutationFn: (payload: PaystackDepositPayload) => walletApi.initializePaystackDeposit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balances"] });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: (payload: WithdrawalPayload) => walletApi.submitWithdrawal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallet-balances"] });
    },
  });

  return {
    balances: walletQuery.data,
    isLoading: walletQuery.isLoading,
    isError: walletQuery.isError,
    refetchBalances: walletQuery.refetch,
    submitCryptoDeposit: cryptoDepositMutation.mutateAsync,
    isSubmittingCrypto: cryptoDepositMutation.isPending,
    submitBankDeposit: bankDepositMutation.mutateAsync,
    isSubmittingBank: bankDepositMutation.isPending,
    initializePaystackDeposit: paystackDepositMutation.mutateAsync,
    isInitializingPaystack: paystackDepositMutation.isPending,
    submitWithdrawal: withdrawMutation.mutateAsync,
    isSubmittingWithdraw: withdrawMutation.isPending,
  };
};
