// Notch appearance presets shared by the notch window and the settings page.

export type NotchStyle = "attached" | "floating" | "glass" | "glow";

export const NOTCH_STYLES: NotchStyle[] = ["attached", "floating", "glass", "glow"];

export const NOTCH_RADIUS = { min: 8, max: 28, step: 1, default: 18 };

/** Gap between the screen's top edge and a floating notch, in px before nectar-scale. */
export const NOTCH_FLOAT_GAP = 8;

export function parseNotchStyle(val: unknown): NotchStyle {
  return NOTCH_STYLES.includes(val as NotchStyle) ? (val as NotchStyle) : "attached";
}

export function parseNotchRadius(val: unknown): number {
  const n = typeof val === "number" ? val : parseFloat(String(val));
  if (!Number.isFinite(n)) return NOTCH_RADIUS.default;
  return Math.min(NOTCH_RADIUS.max, Math.max(NOTCH_RADIUS.min, Math.round(n)));
}

/** Every style except "attached" hangs below the screen edge as a fully rounded island. */
export const isFloatingNotchStyle = (style: NotchStyle) => style !== "attached";
