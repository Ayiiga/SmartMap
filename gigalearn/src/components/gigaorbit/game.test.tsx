import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import GigaOrbitGame from "./game";

vi.mock("next/dynamic", () => ({
  default: () => function SceneStub() { return <div data-testid="mission-3d-scene" />; },
}));
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill: _fill, priority: _priority, sizes: _sizes, ...attributes } = props;
    return <img {...(attributes as React.ImgHTMLAttributes<HTMLImageElement>)} alt={String(props.alt ?? "")} />;
  },
}));
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>,
}));

beforeEach(() => {
  window.localStorage.clear();
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => undefined);
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("GigaOrbit web controls", () => {
  it("opens the playable 3D mission, then genuinely pauses and resumes", () => {
    render(<GigaOrbitGame />);
    fireEvent.click(screen.getByRole("button", { name: /START EARTH/ }));
    expect(screen.getByTestId("mission-3d-scene")).toBeTruthy();
    expect(screen.getByText(/ROCKET LAUNCH/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /PAUSE/ }));
    expect(screen.getByRole("button", { name: "RESUME MISSION" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "RESUME MISSION" }));
    expect(screen.getByText(/ROCKET LAUNCH/)).toBeTruthy();
  });
  it("navigates to actual destinations and does not offer unfinished planets as playable", () => {
    render(<GigaOrbitGame />);
    fireEvent.click(screen.getByRole("button", { name: /DESTINATIONS/ }));
    expect(screen.getByText("Venus")).toBeTruthy();
    expect(screen.getAllByText("COMING LATER").length).toBeGreaterThan(1);
    expect(screen.getByRole("button", { name: "🔒 LOCKED" }).hasAttribute("disabled")).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: /HOME/ }));
    expect(screen.getByRole("button", { name: /START EARTH/ })).toBeTruthy();
  });
  it("opens instructions and settings without redirecting to a static gallery", () => {
    render(<GigaOrbitGame />);
    fireEvent.click(screen.getByRole("button", { name: /HOW TO PLAY/ }));
    expect(screen.getByText("Pilot training academy")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "BACK" }));
    fireEvent.click(screen.getByRole("button", { name: /SETTINGS/ }));
    fireEvent.click(screen.getByRole("button", { name: "PILOT MODE" }));
    expect(screen.getByText(/Pilot handling selected/)).toBeTruthy();
  });
});
