import { useState } from "react";
import type { CSSProperties } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Palette, Maximize, ZoomIn } from "lucide-react";
import { SettingRow } from "./SettingRow";
import { useSettingsSync } from "../hooks/useSettingsSync";
import { useT } from "../i18n";
import {
  DOCK_STYLES,
  DOCK_ICON_SIZE,
  DOCK_HOVER_SCALE,
  parseDockStyle,
  parseDockIconSize,
  parseDockHoverScale,
  type DockStyle,
} from "../dockStyle";

function saveSetting(key: string, value: string) {
  localStorage.setItem(key, value);
  invoke("save_setting", { key, value }).catch(console.error);
}

const tileStyle = (active: boolean): CSSProperties => ({
  minWidth: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  padding: "10px 6px 8px",
  borderRadius: "12px",
  border: active ? "2px solid var(--nectar-accent, #007aff)" : "2px solid rgba(255,255,255,0.1)",
  background: active ? "rgba(0,122,255,0.15)" : "rgba(255,255,255,0.05)",
  cursor: "pointer",
  transition: "all 0.15s ease",
  fontSize: "11px",
  color: "var(--nectar-text, white)",
});

/** A tiny drawing of each style: a strip standing in for the screen edge and the bar above it. */
function StylePreview({ style }: { style: DockStyle }) {
  const floating = style !== "attached";
  const bar: CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: floating ? "5px" : "0",
    width: "52px",
    height: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "3px",
    borderRadius: floating ? "7px" : "6px 6px 0 0",
    background: {
      attached: "rgba(0,0,0,0.75)",
      floating: "rgba(0,0,0,0.75)",
      glass: "linear-gradient(180deg, rgba(255,255,255,0.28), rgba(255,255,255,0.06))",
      minimal: "transparent",
    }[style],
    border: style === "glass" ? "1px solid rgba(255,255,255,0.35)" : style === "floating" ? "1px solid rgba(255,255,255,0.15)" : "none",
    boxShadow: floating && style !== "minimal" ? "0 3px 6px rgba(0,0,0,0.35)" : "none",
  };
  const dot: CSSProperties = {
    width: "7px",
    height: "7px",
    borderRadius: "2px",
    background: style === "minimal" ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.55)",
  };
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "72px",
        height: "32px",
        borderRadius: "6px",
        overflow: "hidden",
        background: "linear-gradient(135deg, #3a4a6b, #6b4a5e)",
      }}
    >
      <div style={bar}>
        <span style={dot} />
        <span style={dot} />
        <span style={dot} />
        <span style={dot} />
      </div>
    </div>
  );
}

export function DockAppearanceSection() {
  const t = useT();
  const [style, setStyle] = useState(() => parseDockStyle(localStorage.getItem("nectar-dock-style")));
  const [iconSize, setIconSize] = useState(() => parseDockIconSize(localStorage.getItem("nectar-dock-icon-size")));
  const [hoverScale, setHoverScale] = useState(() => parseDockHoverScale(localStorage.getItem("nectar-dock-hover-scale")));

  useSettingsSync({
    "nectar-dock-style": (v) => setStyle(parseDockStyle(v)),
    "nectar-dock-icon-size": (v) => setIconSize(parseDockIconSize(v)),
    "nectar-dock-hover-scale": (v) => setHoverScale(parseDockHoverScale(v)),
  });

  const pickStyle = (next: DockStyle) => {
    setStyle(next);
    saveSetting("nectar-dock-style", next);
  };

  const changeIconSize = (next: number) => {
    setIconSize(next);
    saveSetting("nectar-dock-icon-size", String(next));
  };

  const changeHoverScale = (next: number) => {
    setHoverScale(next);
    saveSetting("nectar-dock-hover-scale", next.toFixed(2));
  };

  return (
    <>
      <div className="setting-group-label">{t("dockStyle.group")}</div>
      <div className="setting-group">
        <div className="setting-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            <div className="setting-icon-bg">
              <Palette size={14} strokeWidth={1.5} />
            </div>
            <div className="setting-info">
              <span className="setting-label">{t("dockStyle.style")}</span>
              <span className="setting-desc">{t(`dockStyle.${style}.desc`)}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px", width: "100%" }}>
            {DOCK_STYLES.map((s) => (
              <div key={s} role="button" aria-pressed={style === s} onClick={() => pickStyle(s)} style={tileStyle(style === s)}>
                <StylePreview style={s} />
                <span>{t(`dockStyle.${s}`)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="setting-divider" />

        <SettingRow icon={Maximize} label={t("dockStyle.iconSize")} desc={t("dockStyle.iconSize.desc", { size: iconSize })}>
          <input
            type="range"
            min={DOCK_ICON_SIZE.min}
            max={DOCK_ICON_SIZE.max}
            step={DOCK_ICON_SIZE.step}
            value={iconSize}
            onChange={(e) => changeIconSize(parseInt(e.target.value, 10))}
            className="settings-slider"
          />
        </SettingRow>

        <SettingRow
          icon={ZoomIn}
          label={t("dockStyle.hoverScale")}
          desc={t("dockStyle.hoverScale.desc", { percent: Math.round(hoverScale * 100) })}
          divider={false}
        >
          <input
            type="range"
            min={DOCK_HOVER_SCALE.min}
            max={DOCK_HOVER_SCALE.max}
            step={DOCK_HOVER_SCALE.step}
            value={hoverScale}
            onChange={(e) => changeHoverScale(parseFloat(e.target.value))}
            className="settings-slider"
          />
        </SettingRow>
      </div>
    </>
  );
}
