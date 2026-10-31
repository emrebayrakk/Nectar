import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { Wifi, Speaker, Bluetooth, Volume1, Volume2, VolumeX } from "lucide-react";
import { ConnectionsView } from "./ConnectionsView";
import { useTrailingThrottle } from "../hooks/useTrailingThrottle";
import { useT } from "../i18n";
import "./QuickSettingsPopup.css";

export type QuickSettingsTab = "wifi" | "audio" | "bluetooth";

const TABS: { id: QuickSettingsTab; labelKey: string; Icon: typeof Wifi }[] = [
  { id: "wifi", labelKey: "cc.wifi", Icon: Wifi },
  { id: "audio", labelKey: "quickSettings.sound", Icon: Speaker },
  { id: "bluetooth", labelKey: "cc.bluetooth", Icon: Bluetooth },
];

const WINDOWS_SETTINGS: Record<QuickSettingsTab, string> = {
  wifi: "open_wifi_settings",
  audio: "open_sound_settings",
  bluetooth: "open_bluetooth_settings",
};

/** Windows-style quick settings above the dock: master volume plus the Wi-Fi, output and Bluetooth lists. */
export function QuickSettingsPopup({
  containerRef,
  onClose,
  scale,
  bottom,
  initialTab = "wifi",
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onClose: () => void;
  scale: number;
  bottom: number;
  initialTab?: QuickSettingsTab;
}) {
  const t = useT();
  const [tab, setTab] = useState<QuickSettingsTab>(initialTab);
  const [volume, setVolume] = useState<number | null>(null);
  const [muted, setMuted] = useState(false);
  // While dragging, ignore the backend's echoes so the thumb doesn't jump back.
  const draggingRef = useRef(false);
  // Level to come back to when the speaker button unmutes.
  const lastAudibleRef = useRef(0.3);

  useEffect(() => {
    invoke<{ volume: number; is_muted: boolean }>("get_volume_state")
      .then((s) => { setVolume(s.volume); setMuted(s.is_muted); if (s.volume > 0) lastAudibleRef.current = s.volume; })
      .catch(() => setVolume(0));
    const unlisten = listen<{ volume: number; is_muted: boolean }>("volume-change", (e) => {
      if (draggingRef.current) return;
      setVolume(e.payload.volume);
      setMuted(e.payload.is_muted);
    });
    return () => { unlisten.then((fn) => fn()); };
  }, []);

  const sendVolume = useTrailingThrottle((v: number) => {
    invoke("set_volume", { volume: v }).catch(() => {});
  }, 50);

  const changeVolume = useCallback((v: number) => {
    setVolume(v);
    if (v > 0) lastAudibleRef.current = v;
    if (v > 0) setMuted(false);
    sendVolume(v);
  }, [sendVolume]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const onDown = (e: MouseEvent) => {
      const popup = containerRef.current;
      if (popup && !popup.contains(e.target as Node)) onClose();
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown, true);
    };
  }, [onClose, containerRef]);

  const shownVolume = muted ? 0 : volume ?? 0;
  const VolumeIcon = muted || shownVolume === 0 ? VolumeX : shownVolume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="add-popup-anchor" style={{ zoom: scale, bottom }}>
      <motion.div
        ref={containerRef}
        className="qs-popup"
        style={{ transformOrigin: "bottom center" }}
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{ opacity: 1, scaleY: 1 }}
        exit={{ opacity: 0, scaleY: 0, transition: { duration: 0.16, ease: "easeIn" } }}
        transition={{ opacity: { duration: 0.15 }, scaleY: { type: "spring", stiffness: 300, damping: 28, mass: 0.9 } }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="qs-volume">
          <button
            className="qs-volume-icon"
            aria-label={t("quickSettings.volume")}
            onClick={() => changeVolume(shownVolume === 0 ? lastAudibleRef.current : 0)}
          >
            <VolumeIcon size={16} />
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={shownVolume}
            disabled={volume === null}
            aria-label={t("quickSettings.volume")}
            className="qs-volume-slider"
            style={{ "--qs-fill": `${Math.round(shownVolume * 100)}%` } as React.CSSProperties}
            onPointerDown={() => { draggingRef.current = true; }}
            onPointerUp={() => { draggingRef.current = false; }}
            onChange={(e) => changeVolume(parseFloat(e.target.value))}
          />
          <span className="qs-volume-value">{Math.round(shownVolume * 100)}</span>
        </div>

        <div className="qs-tabs" role="tablist">
          {TABS.map(({ id, labelKey, Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={`qs-tab${tab === id ? " active" : ""}`}
              onClick={() => setTab(id)}
            >
              <Icon size={13} />
              <span>{t(labelKey)}</span>
            </button>
          ))}
        </div>

        <div className="qs-list">
          <ConnectionsView
            key={tab}
            kind={tab}
            hideBack
            onBack={onClose}
            onOpenWindowsSettings={() => { invoke(WINDOWS_SETTINGS[tab]).catch(() => {}); onClose(); }}
          />
        </div>
      </motion.div>
    </div>
  );
}
