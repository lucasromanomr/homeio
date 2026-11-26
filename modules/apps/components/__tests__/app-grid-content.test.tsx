// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Container } from "@/components/icons/platform-icons";
import { AppGridContent } from "@/modules/apps/components/app-grid-content";
import type { AppItem } from "@/modules/apps/components/app-grid-presenters";

const app: AppItem = {
  id: "example", name: "Example", icon: Container, logoUrl: null,
  color: "", bgColor: "", status: "running", category: "Apps",
  webUiPort: null, webUiUrl: null, containerName: "example", updateAvailable: false,
};

describe("AppGridContent", () => {
  it("opens the app independently from its touch action button and right-click menu", () => {
    const onOpenApp = vi.fn();
    const onAppContextMenu = vi.fn();
    render(<AppGridContent activeAppId={null} activeOperationsCount={0} animationsEnabled={false}
      apps={[app]} iconSize="medium" isAppsError={false} isAppsLoading={false}
      onAppContextMenu={onAppContextMenu} onOpenApp={onOpenApp} primaryOperation={null} />);

    fireEvent.click(screen.getByRole("button", { name: "Actions for Example", hidden: true }));
    expect(onAppContextMenu).toHaveBeenCalledOnce();
    expect(onOpenApp).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Open Example" }));
    expect(onOpenApp).toHaveBeenCalledWith(app);
    fireEvent.contextMenu(screen.getByRole("button", { name: "Open Example" }));
    expect(onAppContextMenu).toHaveBeenCalledTimes(2);
  });
});
