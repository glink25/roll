"use client";

import { useEffect } from "react";
import { Languages } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const target = locale === "zh" ? "/en/" : "/";
  const label = locale === "zh" ? "EN" : "中文";

  useEffect(() => {
    document.documentElement.lang = locale === "zh" ? "zh-CN" : "en";
  }, [locale]);

  return (
    <Button
      variant="outline"
      size="sm"
      nativeButton={false}
      aria-label={locale === "zh" ? "Switch to English" : "切换到中文"}
      render={
        <a
          href={target}
          onClick={(event) => {
            event.preventDefault();
            window.location.href = `${target}${window.location.search}${window.location.hash}`;
          }}
        />
      }
    >
      <Languages /> {label}
    </Button>
  );
}
