import React from "react";
import { Globe, MapPin } from "lucide-react";

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <Globe className="w-10 h-10 text-rose-500" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-white">
            Region Restricted
          </h1>
          <p className="text-sm text-gray-400 leading-relaxed">
            This website is no longer available in your region.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500">
          <MapPin className="w-3.5 h-3.5" />
          <span>Error Code: 403</span>
        </div>
      </div>
    </div>
  );
};
