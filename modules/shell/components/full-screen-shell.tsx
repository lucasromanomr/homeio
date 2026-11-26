"use client";

import {
  formatLockScreenDate,
  formatLockScreenTime,
} from "@/lib/desktop/clock-format";
import { useDesktopPreferences } from "@/hooks/useDesktopPreferences";
import { cn } from "@/lib/utils";
import { useResolvedWallpaper } from "@/modules/shell/hooks/useResolvedWallpaper";
import { type ReactNode, useEffect, useState } from "react";

type FullScreenShellProps = {
  center: ReactNode;
  bottom?: ReactNode;
  topRight?: ReactNode;
  wallpaper?: string;
  showClock?: boolean;
  centerClassName?: string;
  bottomClassName?: string;
};

export function FullScreenShell({
  center,
  bottom,
  topRight,
  wallpaper,
  showClock = true,
  centerClassName,
  bottomClassName,
}: FullScreenShellProps) {
  const [now, setNow] = useState<Date | null>(null);
  const { preferences, isHydrated: preferencesHydrated } = useDesktopPreferences();
  const { wallpaper: storedWallpaper } = useResolvedWallpaper();
  const resolvedWallpaper = wallpaper ?? storedWallpaper;

  useEffect(() => {
    setNow(new Date());
    if (!showClock) return;

    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, [showClock]);

  return (
    <main
      className="relative min-h-dvh overflow-hidden bg-background text-white sm:min-h-screen"
      data-testid="full-screen-shell"
    >
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${resolvedWallpaper}')` }}
          data-testid="full-screen-wallpaper"
        />
        <div className="absolute inset-0 bg-background/62 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,rgba(255,255,255,0.045)_0%,transparent_30%),radial-gradient(circle_at_50%_100%,rgba(255,96,0,0.16)_0%,transparent_42%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,10,18,0.26)_0%,rgba(4,10,18,0.14)_38%,rgba(18,12,8,0.3)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.12)_48%,rgba(0,0,0,0.4)_100%)]" />
      </div>

      {topRight ? (
        <div className="absolute top-[max(1.25rem,env(safe-area-inset-top))] right-[max(1.25rem,env(safe-area-inset-right))] z-10 sm:right-5 sm:top-5">{topRight}</div>
      ) : null}

      <div className="relative flex min-h-dvh flex-col pt-[env(safe-area-inset-top)] pr-[max(1rem,env(safe-area-inset-right))] pb-[env(safe-area-inset-bottom)] pl-[max(1rem,env(safe-area-inset-left))] sm:min-h-screen sm:px-6 sm:py-0">
        {showClock ? (
          <div
            className="pointer-events-none mt-9 text-center sm:absolute sm:inset-x-0 sm:top-14 sm:mt-0"
            data-testid="full-screen-clock"
          >
            <div className="system-floating-surface inline-flex max-w-full flex-col items-center bg-black/14 px-5 py-3 shadow-[0_24px_60px_rgba(0,0,0,0.24)] sm:min-w-[18rem] sm:px-8 sm:py-5">
              <p className="text-5xl font-semibold tracking-[-0.08em] text-foreground/96 tabular-nums sm:text-7xl">
                {now && preferencesHydrated
                  ? formatLockScreenTime(now, {
                      locale: preferences.language,
                      timeFormat: preferences.timeFormat,
                    })
                  : "--:--"}
              </p>
              <p className="mt-2 text-sm tracking-[0.2em] text-foreground/52 uppercase sm:text-base">
                {now && preferencesHydrated
                  ? formatLockScreenDate(now, preferences.language)
                  : "\u00a0"}
              </p>
            </div>
          </div>
        ) : null}

        <div
          className={cn(
            "flex min-w-0 flex-1 items-center justify-center py-6 sm:py-0",
            showClock ? "sm:pt-36" : "",
            bottom ? "sm:pt-16" : "",
            centerClassName,
          )}
        >
          {center}
        </div>

        {bottom ? (
          <div
            className={cn("pb-10 sm:pb-14", bottomClassName)}
            data-testid="full-screen-bottom"
          >
            {bottom}
          </div>
        ) : null}
      </div>
    </main>
  );
}
