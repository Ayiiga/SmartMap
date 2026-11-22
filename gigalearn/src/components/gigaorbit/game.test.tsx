import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import GigaOrbitGame from "./game";

// Test real DOM interaction without installing new test dependencies or WebGL.
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

let container: HTMLDivElement;
let root: Root;
beforeEach(() => {
  (globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  window.localStorage.clear();
  vi.stubGlobal("requestAnimationFrame", () => 1);
  vi.stubGlobal("cancelAnimationFrame", () => undefined);
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});
afterEach(() => {
  act(() => root.unmount());
  container.remove();
  vi.unstubAllGlobals();
});

function mount(): void {
  act(() => root.render(<GigaOrbitGame />));
}
function clickButton(name: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.includes(name));
  if (!button) throw new Error(`Missing interactive button: ${name}`);
  act(() => button.dispatchEvent(new MouseEvent("click", { bubbles: true })));
  return button;
}
describe("GigaOrbit real browser UI controls", () => {
  it("starts the actual 3D game and pauses/resumes gameplay", () => {
    mount();
    clickButton("START EARTH");
    expect(container.querySelector('[data-testid="mission-3d-scene"]')).not.toBeNull();
    expect(container.textContent).toContain("ROCKET LAUNCH");
    clickButton("PAUSE");
    expect(container.textContent).toContain("RESUME MISSION");
    clickButton("RESUME MISSION");
    expect(container.textContent).toContain("ROCKET LAUNCH");
  });
  it("shows unlocked and future destinations without fake Play buttons", () => {
    mount();
    clickButton("DESTINATIONS");
    expect(container.textContent).toContain("Venus");
    expect(container.textContent).toContain("COMING LATER");
    const locked = Array.from(container.querySelectorAll("button")).find((b) => b.textContent?.includes("LOCKED"));
    expect(locked?.disabled).toBe(true);
    clickButton("HOME");
    expect(container.textContent).toContain("START EARTH");
  });
  it("opens the tutorial and updates Explorer/Pilot handling controls", () => {
    mount();
    clickButton("HOW TO PLAY");
    expect(container.textContent).toContain("Pilot training academy");
    clickButton("BACK");
    clickButton("SETTINGS");
    clickButton("PILOT MODE");
    expect(container.textContent).toContain("Pilot handling selected");
  });
});
