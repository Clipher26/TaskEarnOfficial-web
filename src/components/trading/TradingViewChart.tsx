"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface TradingViewChartProps {
  symbol: string;
  theme?: "dark" | "light";
}

declare global {
  interface Window {
    TradingView: any;
  }
}

export function TradingViewChart({ symbol, theme = "dark" }: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (!containerRef.current) return;
      new window.TradingView.widget({
        container_id: containerRef.current.id,
        symbol: `BINANCE:${symbol}`,
        interval: "15",
        library_path: "https://s3.tradingview.com/tv.js/",
        theme: theme,
        style: "1",
        locale: "en",
        toolbar_bg: "#0f172a",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        hide_top_toolbar: false,
        save_image: false,
        studies: ["MASimple@tv-basicstudies"],
        show_popup_button: false,
        popup_width: 1000,
        popup_height: 650,
        withdateranges: true,
        width: "100%",
        height: "100%",
        gridColor: "#1e293b",
        crosshairColor: "#475569",
        backgroundColor: "#0f172a",
      });
    };
    document.head.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [symbol, theme]);

  return (
      <div className="w-full h-full rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
      <div
        id="tradingview-chart"
        ref={containerRef}
        className="w-full h-full"
      />
    </div>
  );
}
