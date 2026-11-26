/* @vitest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Window } from "@/modules/shell/components/window";

describe("Window", () => {
  it("only navigates back for a deliberate swipe on the mobile header", () => {
    const onClose = vi.fn();
    render(<Window mobile title="Files" onClose={onClose}><div>file list</div></Window>);

    const title = screen.getByRole("heading", { name: "Files" });
    const swipe = (target: Element, start: [number, number], end: [number, number]) => {
      fireEvent.touchStart(target, { touches: [{ clientX: start[0], clientY: start[1] }] });
      fireEvent.touchEnd(target, { touches: [], changedTouches: [{ clientX: end[0], clientY: end[1] }] });
    };

    swipe(title, [10, 30], [120, 30]); // Native edge gesture.
    swipe(title, [50, 30], [130, 100]); // Mostly vertical.
    swipe(screen.getByText("file list"), [50, 30], [150, 30]);
    swipe(screen.getByRole("button", { name: "Go back" }), [50, 30], [150, 30]);
    expect(onClose).not.toHaveBeenCalled();

    swipe(title, [50, 30], [150, 35]);
    expect(onClose).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("maximizes into the desktop area above a bottom dock", () => {
    render(
      <Window
        title="App Store"
        onClose={() => {}}
        dockPosition="bottom"
        animationsEnabled={false}
      >
        <div>content</div>
      </Window>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Maximize window" }));

    const container = screen.getByText("content").closest("div.absolute");
    expect(container).toBeTruthy();
    expect(container?.getAttribute("style")).toContain("top: 0px");
    expect(container?.getAttribute("style")).toContain("right: 0px");
    expect(container?.getAttribute("style")).toContain("bottom: 88px");
    expect(container?.getAttribute("style")).toContain("left: 0px");
  });

  it("maximizes around a side dock", () => {
    render(
      <Window
        title="Monitor"
        onClose={() => {}}
        dockPosition="left"
        animationsEnabled={false}
      >
        <div>monitor</div>
      </Window>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Maximize window" }));

    const container = screen.getByText("monitor").closest("div.absolute");
    expect(container).toBeTruthy();
    expect(container?.getAttribute("style")).toContain("top: 0px");
    expect(container?.getAttribute("style")).toContain("right: 0px");
    expect(container?.getAttribute("style")).toContain("bottom: 0px");
    expect(container?.getAttribute("style")).toContain("left: 80px");
  });
});
