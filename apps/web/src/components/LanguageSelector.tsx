"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function LanguageSelector({ currentLocale }: { currentLocale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);

  const changeLanguage = async (locale: "en" | "hi") => {
    if (locale === currentLocale) {
      setIsOpen(false);
      return;
    }

    try {
      await fetch("/api/set-language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale }),
      });
      
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      console.error("Failed to set language", e);
    } finally {
      setIsOpen(false);
    }
  };

  const currentLabel = currentLocale === "hi" ? "हिंदी" : "EN";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-ink-mid hover:text-teal hover:bg-teal-light rounded-lg transition-colors border border-border bg-white"
      >
        <span>🌐</span>
        <span>{currentLabel}</span>
        <span className="text-[10px] ml-1 opacity-50">▼</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-1 w-28 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden py-1">
            <button
              onClick={() => changeLanguage("en")}
              className={`w-full text-left px-4 py-2 text-xs hover:bg-off-white ${currentLocale === "en" ? "font-semibold text-teal" : "text-ink"}`}
            >
              English (EN)
            </button>
            <button
              onClick={() => changeLanguage("hi")}
              className={`w-full text-left px-4 py-2 text-xs hover:bg-off-white ${currentLocale === "hi" ? "font-semibold text-teal" : "text-ink"}`}
            >
              हिंदी (HI)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
