import { useState } from "react";
import type { CSSProperties } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Palette, Squircle } from "lucide-react";
import { SettingRow } from "./SettingRow";
import { useSettingsSync } from "../hooks/useSettingsSync";
import { useT } from "../i18n";
import { NOTCH_STYLES, NOTCH_RADIUS, parseNotchStyle, parseNotchRadius, type NotchStyle } from "../notchStyle";

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

/** A tiny drawing of each style: the top of a screen with the notch hanging from it. */
function StylePreview({ style }: { style: NotchStyle }) {
  const floating = style !== "attached";
  const island: CSSProperties = {
    position: "absolute",
    left: "50%",
    transform: "translateX(-50%)",
    top: floating ? "4px" : "0",
    width: "34px",
    height: "10px",
    borderRadius: floating ? "5px" : "0 0 5px 5px",
    background: style === "glass" ? "linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.08))" : "rgba(0,0,0,0.85)",
    border:
      style === "glass" ? "1px solid rgba(255,255,255,0.35)"
      : style === "glow" ? "1px solid var(--nectar-accent, #007aff)"
      : style === "floating" ? "1px solid rgba(255,255,255,0.15)"
      : "none",
    boxShadow: style === "glow" ? "0 0 8px var(--nectar-accent, #007aff)" : floating ? "0 2px 5px rgba(0,0,0,0.35)" : "none",
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
      <div style={island} />
    </div>
  );
}

export function NotchAppearanceSection() {
  const t = useT();
  const [style, setStyle] = useState(() => parseNotchStyle(localStorage.getItem("nectar-notch-style")));
  const [radius, setRadius] = useState(() => parseNotchRadius(localStorage.getItem("nectar-notch-radius")));

  useSettingsSync({
    "nectar-notch-style": (v) => setStyle(parseNotchStyle(v)),
    "nectar-notch-radius": (v) => setRadius(parseNotchRadius(v)),
  });

  const pickStyle = (next: NotchStyle) => {
    setStyle(next);
    saveSetting("nectar-notch-style", next);
  };

  const changeRadius = (next: number) => {
    setRadius(next);
    saveSetting("nectar-notch-radius", String(next));
  };

  return (
    <>
      <div className="setting-group-label">{t("notchStyle.group")}</div>
      <div className="setting-group">
        <div className="setting-item" style={{ flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
            <div className="setting-icon-bg">
              <Palette size={14} strokeWidth={1.5} />
            </div>
            <div className="setting-info">
              <span className="setting-label">{t("notchStyle.style")}</span>
              <span className="setting-desc">{t(`notchStyle.${style}.desc`)}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "8px", width: "100%" }}>
            {NOTCH_STYLES.map((s) => (
              <div key={s} role="button" aria-pressed={style === s} onClick={() => pickStyle(s)} style={tileStyle(style === s)}>
                <StylePreview style={s} />
                <span>{t(`notchStyle.${s}`)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="setting-divider" />

        <SettingRow icon={Squircle} label={t("notchStyle.radius")} desc={t("notchStyle.radius.desc", { size: radius })} divider={false}>
          <input
            type="range"
            min={NOTCH_RADIUS.min}
            max={NOTCH_RADIUS.max}
            step={NOTCH_RADIUS.step}
            value={radius}
            onChange={(e) => changeRadius(parseInt(e.target.value, 10))}
            className="settings-slider"
          />
        </SettingRow>
      </div>
    </>
  );
}
