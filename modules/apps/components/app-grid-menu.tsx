"use client";

import type { AppItem } from "@/modules/apps/components/app-grid-presenters";
import {
  Copy,
  ExternalLink,
  Play,
  RefreshCw,
  RotateCcw,
  ScrollText,
  Settings2,
  Square,
  TerminalSquare,
  Trash2,
} from "@/components/icons/platform-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ReactNode } from "react";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";

type AppGridAction =
  | "open"
  | "start"
  | "stop"
  | "restart"
  | "logs"
  | "terminal"
  | "settings"
  | "update"
  | "copy-url"
  | "remove";

export function AppGridContextMenu({
  app,
  hasDashboardUrl,
  isBusy,
  x,
  y,
  onAction,
  onClose,
}: {
  app: AppItem;
  hasDashboardUrl: boolean;
  isBusy: boolean;
  x: number;
  y: number;
  onAction: (action: AppGridAction) => void;
  onClose?: () => void;
}) {
  const actions = (
    <>
      <AppGridContextMenuItem
        icon={<ExternalLink className="size-3.5" />}
        label="Open Dashboard"
        disabled={!hasDashboardUrl}
        title={!hasDashboardUrl ? "No web port configured for this app." : undefined}
        onClick={() => onAction("open")}
      />
      {app.status === "running" || app.status === "partial" ? (
        <AppGridContextMenuItem
          icon={<Square className="size-3.5" />}
          label="Stop Container"
          disabled={isBusy}
          onClick={() => onAction("stop")}
        />
      ) : (
        <AppGridContextMenuItem
          icon={<Play className="size-3.5" />}
          label="Start Container"
          disabled={isBusy}
          onClick={() => onAction("start")}
        />
      )}
      <AppGridContextMenuItem
        icon={<RotateCcw className="size-3.5" />}
        label="Restart Container"
        disabled={isBusy}
        onClick={() => onAction("restart")}
      />
      <AppGridContextMenuItem
        icon={<ScrollText className="size-3.5" />}
        label="View Logs"
        onClick={() => onAction("logs")}
      />
      <AppGridContextMenuItem
        icon={<TerminalSquare className="size-3.5" />}
        label="Open in Terminal"
        onClick={() => onAction("terminal")}
      />
      <div className="mx-2 my-1 h-px bg-border" />
      <AppGridContextMenuItem
        icon={<Settings2 className="size-3.5" />}
        label="App Settings"
        onClick={() => onAction("settings")}
      />
      <AppGridContextMenuItem
        icon={<RefreshCw className="size-3.5" />}
        label="Check Updates"
        disabled={isBusy}
        onClick={() => onAction("update")}
      />
      <AppGridContextMenuItem
        icon={<Copy className="size-3.5" />}
        label="Copy URL"
        disabled={!hasDashboardUrl}
        title={!hasDashboardUrl ? "No web port configured for this app." : undefined}
        onClick={() => onAction("copy-url")}
      />
      <div className="mx-2 my-1 h-px bg-border" />
      <AppGridContextMenuItem
        icon={<Trash2 className="size-3.5 text-status-red" />}
        label="Remove App"
        danger
        disabled={isBusy}
        onClick={() => onAction("remove")}
      />
    </>
  );

  if (onClose) {
    return (
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent
          aria-describedby={undefined}
          showCloseButton={false}
          className="top-auto bottom-[max(0.75rem,env(safe-area-inset-bottom))] flex max-h-[calc(100dvh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-1.5rem)] max-w-[min(28rem,calc(100%-2rem))] translate-y-0 flex-col gap-0 overflow-hidden rounded-[1.75rem] border-[var(--mobile-divider)] bg-[var(--mobile-panel)] p-0 motion-reduce:animate-none"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-[var(--mobile-divider)] px-4 py-1.5">
            <DialogTitle className="min-w-0 flex-1 break-words text-base">{app.name}</DialogTitle>
            <DialogClose className="min-h-11 rounded-full px-3 text-sm font-semibold text-[var(--mobile-accent-text)] hover:bg-foreground/5 focus-visible:outline-2 focus-visible:outline-primary">Done</DialogClose>
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-contain py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&_button]:min-h-11 [&_button]:px-4 [&_button]:text-sm">
            {actions}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div
      className="fixed z-[220] max-h-[calc(100dvh-1rem)] w-48 max-w-[calc(100vw-1rem)] overflow-y-auto overscroll-contain rounded-xl border border-glass-border bg-popover py-1.5 shadow-2xl shadow-black/50 backdrop-blur-2xl"
      style={{ left: x, top: y, maxHeight: `calc(100dvh - ${y + 8}px)` }}
      onClick={(event) => event.stopPropagation()}
    >
      {actions}
    </div>
  );
}

function AppGridContextMenuItem({
  danger,
  disabled,
  icon,
  label,
  onClick,
  title,
}: {
  danger?: boolean;
  disabled?: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
  title?: string;
}) {
  const button = (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 px-3 min-h-11 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-primary sm:min-h-0 ${
        danger
          ? "text-status-red hover:bg-status-red/10 disabled:hover:bg-transparent"
          : "text-foreground hover:bg-secondary/50"
      } disabled:cursor-not-allowed disabled:opacity-40`}
    >
      {icon}
      {label}
    </button>
  );

  if (title) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="block">{button}</span>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>{title}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}
