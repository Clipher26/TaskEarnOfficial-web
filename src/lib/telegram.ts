declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

export const tg = typeof window !== "undefined" ? window.Telegram?.WebApp : null;

export const initTelegramApp = () => {
  if (!tg) return;

  tg.ready();
  tg.expand();
  tg.enableClosingConfirmation();

  if (tg.themeParams) {
    document.documentElement.style.setProperty("--tg-theme-bg-color", tg.themeParams.bg_color || "#0d1117");
    document.documentElement.style.setProperty("--tg-theme-text-color", tg.themeParams.text_color || "#ffffff");
    document.documentElement.style.setProperty("--tg-theme-button-color", tg.themeParams.button_color || "#22c55e");
    document.documentElement.style.setProperty("--tg-theme-button-text-color", tg.themeParams.button_text_color || "#ffffff");
  }
};

export const triggerHaptic = (style: "light" | "medium" | "heavy" | "rigid" | "soft" = "medium") => {
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred(style);
  }
};

export const getTelegramUser = () => {
  return tg?.initDataUnsafe?.user || null;
};
