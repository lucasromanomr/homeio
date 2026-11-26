"use client";

import { MoreHorizontal } from "@/components/icons/platform-icons";
import { getAppVisualState, type AppItem } from "@/modules/apps/components/app-grid-presenters";
import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";

type Props = {
  activeAppId: string | null;
  apps: AppItem[];
  isAppsError: boolean;
  isAppsLoading: boolean;
  onAppContextMenu: (event: MouseEvent, app: AppItem) => void;
  onBrowseStore?: () => void;
  onOpenApp: (app: AppItem) => void;
};

const VIEW_KEY = "homeio.mobile-launcher.view.v1";

export function MobileAppLauncher({ activeAppId, apps, isAppsError, isAppsLoading, onAppContextMenu, onBrowseStore, onOpenApp }: Props) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [size, setSize] = useState({ columns: 4, rows: 3 });
  const [page, setPage] = useState(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(VIEW_KEY) === "list") setView("list");
    } catch {
      // Keep the default when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const element = areaRef.current;
    if (!element || view !== "grid" || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (!width || !height) return;
      const columns = Math.max(2, Math.min(5, Math.floor(width / 82)));
      const rows = Math.max(1, Math.floor(height / 104));
      setSize((previous) => previous.columns === columns && previous.rows === rows ? previous : { columns, rows });
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [view, apps.length, isAppsLoading, isAppsError]);

  const capacity = size.columns * size.rows;
  const pageCount = Math.max(1, Math.ceil(apps.length / capacity));
  const currentPage = Math.min(page, pageCount - 1);
  function chooseView(next: "grid" | "list") {
    setView(next);
    setPage(0);
    try { localStorage.setItem(VIEW_KEY, next); } catch { /* Keep the choice for this session. */ }
  }
  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") swipe.current = { x: event.clientX, y: event.clientY };
  }
  function endSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = swipe.current;
    swipe.current = null;
    if (!start || view !== "grid") return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      setPage(Math.max(0, Math.min(pageCount - 1, currentPage + (dx < 0 ? 1 : -1))));
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-14 shrink-0 items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-foreground">Apps</h2>
        <div role="group" className="flex rounded-full border border-[var(--mobile-divider)] bg-[var(--mobile-nav-surface)] p-0.5 text-xs backdrop-blur-xl" aria-label="App view">
          {(["grid", "list"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              onClick={() => chooseView(option)}
              className={`min-h-11 min-w-11 rounded-full px-3 font-medium focus-visible:outline-2 focus-visible:outline-primary ${view === option ? "bg-foreground/10 text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {option === "grid" ? "Grid" : "List"}
            </button>
          ))}
        </div>
      </div>
      {isAppsLoading && apps.length === 0 ? (
        <p role="status" className="py-4 text-sm text-muted-foreground">Loading apps…</p>
      ) : isAppsError && apps.length === 0 ? (
        <p role="alert" className="py-4 text-sm text-status-red">Could not load apps. Check your connection and try again.</p>
      ) : apps.length === 0 ? (
        <div className="py-5 text-sm text-muted-foreground">
          <p>No apps installed yet.</p>
          {onBrowseStore && <button type="button" onClick={onBrowseStore} className="mt-3 min-h-11 rounded-lg bg-primary px-4 font-medium text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary">Browse Store</button>}
        </div>
      ) : view === "list" ? (
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="divide-y divide-[var(--mobile-divider)] overflow-hidden rounded-[var(--system-radius-panel)] border border-[var(--mobile-divider)] bg-[var(--mobile-panel)] px-3">
            {apps.map((app) => <MobileApp key={app.id} app={app} list active={activeAppId === app.id} onOpenApp={onOpenApp} onAppContextMenu={onAppContextMenu} />)}
          </ul>
        </div>
      ) : (
        <>
          <div ref={areaRef} className="min-h-0 flex-1 overflow-hidden [touch-action:pan-y_pinch-zoom]" onPointerDown={startSwipe} onPointerUp={endSwipe} onPointerCancel={() => { swipe.current = null; }}>
            <ul className="grid h-full content-start" style={{ gridTemplateColumns: `repeat(${size.columns}, minmax(0, 1fr))`, gridAutoRows: "104px" }}>
              {apps.slice(currentPage * capacity, (currentPage + 1) * capacity).map((app) => (
                <MobileApp key={app.id} app={app} active={activeAppId === app.id} onOpenApp={onOpenApp} onAppContextMenu={onAppContextMenu} />
              ))}
            </ul>
          </div>
          <div className="flex h-[3.25rem] shrink-0 items-center justify-center gap-3 py-1" aria-label="App pages">
            {pageCount > 1 && (
              <>
                <button type="button" aria-label="Previous app page" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)} className="min-h-11 min-w-11 rounded-full text-foreground disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-primary">‹</button>
                <span className="text-xs tabular-nums text-muted-foreground" aria-live="polite">{currentPage + 1} / {pageCount}</span>
                <button type="button" aria-label="Next app page" disabled={currentPage === pageCount - 1} onClick={() => setPage(currentPage + 1)} className="min-h-11 min-w-11 rounded-full text-foreground disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-primary">›</button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function MobileApp({ app, active, list = false, onOpenApp, onAppContextMenu }: { app: AppItem; active: boolean; list?: boolean; onOpenApp: Props["onOpenApp"]; onAppContextMenu: Props["onAppContextMenu"] }) {
  const [imageFailed, setImageFailed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);
  const held = useRef(false);
  const visual = getAppVisualState(app);
  const running = app.condition ? ["running", "starting", "unhealthy"].includes(app.condition.condition) : app.status === "running";
  function cancelHold() {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  }
  useEffect(() => () => cancelHold(), []);
  function pointerDown(event: PointerEvent<HTMLButtonElement>) {
    cancelHold();
    held.current = false;
    suppressClick.current = false;
    if (event.pointerType !== "touch" || event.isPrimary === false) return;
    touch.current = { x: event.clientX, y: event.clientY };
    timer.current = setTimeout(() => {
      held.current = true;
      suppressClick.current = true;
      onAppContextMenu(event, app);
    }, 550);
  }
  function pointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (touch.current && Math.hypot(event.clientX - touch.current.x, event.clientY - touch.current.y) > 10) {
      cancelHold();
      suppressClick.current = true;
    }
  }
  const icon = <span className={`relative flex ${list ? "size-11 rounded-xl" : "size-14 rounded-2xl"} shrink-0 items-center justify-center border shadow-md shadow-black/15 ${visual.ringClass} ${app.logoUrl && !imageFailed ? "bg-white/90" : `${app.bgColor} ${app.color}`}`}>
    {app.logoUrl && !imageFailed ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={app.logoUrl} alt="" width={64} height={64} className={`size-full rounded-[inherit] object-contain p-1.5 ${visual.imageClass}`} onError={() => setImageFailed(true)} />) : <app.icon className={`size-7 ${visual.imageClass}`} aria-hidden="true" />}
    {running ? <span data-running-indicator className="absolute -bottom-1 -right-1 size-3 rounded-full border-2 border-background bg-emerald-400" aria-hidden="true" /> : null}
  </span>;
  return (
    <li className={list ? "flex min-w-0 items-center" : "relative flex min-w-0 flex-col items-center justify-start"}>
      <button
        type="button"
        aria-label={`Open ${app.name} (${visual.title})`}
        data-app-status={app.status}
        onPointerDown={pointerDown}
        onPointerMove={pointerMove}
        onPointerUp={() => { cancelHold(); touch.current = null; }}
        onPointerCancel={() => { cancelHold(); touch.current = null; suppressClick.current = true; }}
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation();
          cancelHold();
          if (held.current) return;
          if (touch.current) {
            suppressClick.current = true;
            held.current = true;
          }
          onAppContextMenu(event, app);
        }}
        onClick={(event) => {
          if (suppressClick.current) {
            event.stopPropagation();
            suppressClick.current = false;
            return;
          }
          onOpenApp(app);
        }}
        className={`select-none [-webkit-touch-callout:none] focus-visible:outline-2 focus-visible:outline-primary ${list ? "flex min-h-16 min-w-0 flex-1 items-center gap-3 rounded-xl py-2 text-left" : "flex w-full min-w-0 flex-col items-center gap-1.5 rounded-xl px-1 pt-2"}`}
      >
        {icon}
        <span className={list ? "min-w-0 flex-1" : "w-full min-w-0 text-center"}>
          <span className={list ? "block break-words text-sm font-medium text-foreground" : "line-clamp-2 text-xs font-medium leading-tight text-foreground"}>{app.name}</span>
          {list && <span className="block text-xs text-muted-foreground">{visual.title}{app.updateAvailable && app.status === "running" ? " · Update available" : ""}</span>}
        </span>
      </button>
      <button
        type="button"
        aria-label={`Actions for ${app.name}`}
        aria-expanded={active}
        onClick={(event) => { event.stopPropagation(); onAppContextMenu(event, app); }}
        className={`${list ? "size-11 shrink-0" : "sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:right-0 focus-visible:top-0 focus-visible:size-11 focus-visible:bg-[var(--mobile-panel)]"} flex items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/10 focus-visible:outline-2 focus-visible:outline-primary`}
      >
        <MoreHorizontal className="size-4 opacity-75 brightness-0 dark:invert" aria-hidden="true" />
      </button>
    </li>
  );
}
