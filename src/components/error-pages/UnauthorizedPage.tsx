import React from "react";
import { ShieldOff, Send } from "lucide-react";

export const UnauthorizedPage: React.FC = () => {
  const telegramChannelUrl = "https://t.me/@TaskEarnOfficial";

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <ShieldOff className="w-10 h-10 text-rose-500" />
        </div>

        <div className="space-y-3">
          <h1 className="text-xl font-bold text-white">
            Access Denied
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            You no longer have access to TaskEarn due to failure in compliance.
            For any misinterpretation or revalidation, contact our support team on Telegram.
          </p>
        </div>

        <a
          href={telegramChannelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm rounded-xl transition-all active:scale-95 shadow-lg shadow-sky-900/20"
        >
          <Send className="w-4 h-4" />
          Contact Support on Telegram
        </a>

        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <span>Error Code: 401</span>
        </div>
      </div>
    </div>
  );
};
