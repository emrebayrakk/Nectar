import type { CSSProperties } from "react";

// Start button icon presets, shared by the dock and the settings page. The saved value
// (nectar-start-icon) is a preset key, or "custom:" followed by an uploaded image's data URI.

export interface StartIconPreset {
  key: string;
  src: string;
  labelKey: string;
  /** Drawn as a mask in the theme's text color, so it reads on light and dark themes. */
  mono?: boolean;
}

export const START_ICON_PRESETS: StartIconPreset[] = [
  { key: "default", src: "/nectar.png", labelKey: "startIcon.nectar" },
  { key: "windows", src: "/windows.png", labelKey: "startIcon.windows" },
  { key: "fluent", src: "/start-icons/fluent.svg", labelKey: "startIcon.fluent" },
  { key: "tiles", src: "/start-icons/tiles.svg", labelKey: "startIcon.tiles", mono: true },
  { key: "grid", src: "/start-icons/grid.svg", labelKey: "startIcon.grid", mono: true },
  { key: "ring", src: "/start-icons/ring.svg", labelKey: "startIcon.ring", mono: true },
  { key: "hex", src: "/start-icons/hex.svg", labelKey: "startIcon.hex", mono: true },
  { key: "orb", src: "/start-icons/orb.svg", labelKey: "startIcon.orb" },
  { key: "spark", src: "/start-icons/spark.svg", labelKey: "startIcon.spark" },
  { key: "bloom", src: "/start-icons/bloom.svg", labelKey: "startIcon.bloom" },
];

export function resolveStartIcon(value: string): { src: string; mono: boolean; custom: boolean } {
  if (value.startsWith("custom:")) return { src: value.slice("custom:".length), mono: false, custom: true };
  const preset = START_ICON_PRESETS.find((p) => p.key === value) ?? START_ICON_PRESETS[0];
  return { src: preset.src, mono: !!preset.mono, custom: false };
}

/** Style for a <span> that paints a mono icon in the current text color. */
export function monoIconStyle(src: string): CSSProperties {
  const mask = `url("${src}") center / contain no-repeat`;
  return {
    display: "block",
    backgroundColor: "currentColor",
    WebkitMask: mask,
    mask,
  };
}
