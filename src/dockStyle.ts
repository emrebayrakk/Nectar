// Dock appearance presets shared by the dock window and the settings page.

export type DockStyle = "attached" | "floating" | "glass" | "minimal";

export const DOCK_STYLES: DockStyle[] = ["attached", "floating", "glass", "minimal"];

export const DOCK_ICON_SIZE = { min: 28, max: 52, step: 2, default: 36 };
export const DOCK_HOVER_SCALE = { min: 1, max: 1.6, step: 0.05, default: 1.1 };

export function parseDockStyle(val: unknown): DockStyle {
  return DOCK_STYLES.includes(val as DockStyle) ? (val as DockStyle) : "attached";
}

function parseClamped(val: unknown, range: { min: number; max: number; default: number }): number {
  const n = typeof val === "number" ? val : parseFloat(String(val));
  if (!Number.isFinite(n)) return range.default;
  return Math.min(range.max, Math.max(range.min, n));
}

export const parseDockIconSize = (val: unknown) => parseClamped(val, DOCK_ICON_SIZE);
export const parseDockHoverScale = (val: unknown) => parseClamped(val, DOCK_HOVER_SCALE);

/** Every style except "attached" sits off the screen edge as a fully rounded bar. */
export const isFloatingDockStyle = (style: DockStyle) => style !== "attached";
