import { T, font } from "../../utils/theme";
import { Card, Tag } from "../../components/SharedUI";

const AvailDot = ({ status }) => {
  const map = {
    AVAILABLE_NOW:      { color: T.greenLight, ping: true },
    AVAILABLE_TODAY:    { color: "#f5a623",    ping: false },
    AVAILABLE_TOMORROW: { color: T.sky,        ping: false },
    BUSY:               { color: T.error,      ping: false },
    OFFLINE:            { color: T.muted,      ping: false },
  };
  const d = map[status] || map.OFFLINE;
  return (
    <span style={{ position: "relative", display: "inline-block", width: 10, height: 10, flexShrink: 0 }}>
      {d.ping && (
        <span style={{
          position: "absolute", inset: -2, borderRadius: "50%",
          background: d.color, opacity: 0.3,
          animation: "ping 1.6s ease-out infinite",
        }} />
      )}
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: d.color }} />
    </span>
  );
};

// Returns "30 min से" / "2 घंटे से" / "अभी" based on updatedAt
const notReachableSince = (updatedAt) => {
  if (!updatedAt) return "";
  const mins = Math.floor((Date.now() - new Date(updatedAt)) / 60000);
  if (mins < 2)  return "अभी तक दिख रहे थे";
  if (mins < 60) return `${mins} min से`;
  return `${Math.floor(mins / 60)} घंटे से`;
};

export const TechCard = ({ tech: t, lang, idx, onViewProfile, onAssign }) => {
  const hi = lang === "hi";

  const availLabel = t.isOffline
    ? `📴 ${notReachableSince(t.currentLocation?.updatedAt)} Not Reachable`
    : ({
        AVAILABLE_NOW:   hi ? "अभी Available" : "Available Now",
        AVAILABLE_TODAY: hi ? "आज Available"  : "Available Today",
      }[t.availability] || t.availability);

  const availColor = t.isOffline ? T.muted : (t.availability === "AVAILABLE_NOW" ? T.green : T.warn);

  const handleAssign = () => {
    if (t.isOffline) {
      const ok = window.confirm(
        hi
          ? `${t.name} अभी Not Reachable हैं। Notification शायद न पहुंचे। Assign करने से पहले Call ज़रूर करें। फिर भी assign करें?`
          : `${t.name} is currently Not Reachable. Notification may not be delivered. Please call first. Assign anyway?`
      );
      if (!ok) return;
    }
    onAssign();
  };

  return (
    <Card className={t.isOffline ? "" : `fade-up-${Math.min(idx + 1, 5)}`}
      style={{ marginBottom: 12, opacity: t.isOffline ? 0.82 : 1, transition: "opacity .2s" }}>
      <div style={{ padding: "16px" }}>

        {/* Top row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
            background: t.isOffline
              ? `linear-gradient(135deg, #aaa, #777)`
              : `linear-gradient(135deg, ${T.saffron}, #c45a08)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: font.display, fontSize: 20, fontWeight: 800, color: T.white,
          }}>{t.name[0]}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{t.name}</div>
            <div style={{ fontSize: 12, color: T.muted }}>{t.city} · {t.vehicle} · {t.experience}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, justifyContent: "flex-end", marginBottom: 4 }}>
              <AvailDot status={t.availability} />
              <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: availColor }}>
                {availLabel}
              </span>
            </div>
            {!t.isOffline && (
              <div style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 700, color: T.sky }}>
                {t.distanceKm} km
              </div>
            )}
          </div>
        </div>

        {/* Skills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {t.skills.map(s => <Tag key={s} label={s} color={t.isOffline ? "ink" : "saffron"} />)}
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 0,
          background: T.paper, borderRadius: 10,
          overflow: "hidden", marginBottom: 12,
          border: `1px solid ${T.border}`,
        }}>
          {[
            { v: t.completedWork,   l: hi ? "काम पूरे" : "Done",   e: "✅" },
            { v: t.uniqueSIs,       l: "SIs",                       e: "🤝" },
            { v: `${t.avgRating}★`, l: "Rating",                    e: "⭐" },
            { v: t.openWork,        l: "Open",                      e: "📋" },
          ].map((s, i, arr) => (
            <div key={s.l} style={{
              flex: 1, padding: "9px 4px", textAlign: "center",
              borderRight: i < arr.length - 1 ? `1px solid ${T.border}` : "none",
            }}>
              <div style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 700, color: T.ink }}>{s.v}</div>
              <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Location freshness — only for available techs */}
        {!t.isOffline && (
          <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>
            🕐 {hi ? "Location:" : "Location:"} {t.locationAge}
          </div>
        )}

        {/* Not Reachable warning strip */}
        {t.isOffline && (
          <div style={{
            background: "#fff5f5", border: "1px solid #e53e3e30", borderRadius: 8,
            padding: "8px 10px", marginBottom: 10,
            fontSize: 11, color: "#c53030", fontFamily: font.mono, lineHeight: 1.65,
          }}>
            📴 {hi
              ? "PWA बंद है — Notification नहीं जाएगी। Assign से पहले Call करके availability confirm करें।"
              : "PWA closed — FCM notification won't reach. Call to confirm availability before assigning."}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          {t.mobile && (
            <a href={`tel:${t.mobile}`} style={{
              flex: 1, padding: "10px",
              borderRadius: 10, border: `1px solid ${T.green}40`,
              background: T.greenDim, color: T.green,
              fontFamily: font.display, fontSize: 13, fontWeight: 700,
              textDecoration: "none", textAlign: "center",
            }}>📞 {hi ? "Call" : "Call"}</a>
          )}
          {t.mobile && (
            <a href={`https://wa.me/91${t.mobile}`} target="_blank" rel="noreferrer" style={{
              flex: 1, padding: "10px",
              borderRadius: 10, border: "1px solid #1a7a3a40",
              background: "#e6f9f0", color: "#1a7a3a",
              fontFamily: font.display, fontSize: 13, fontWeight: 700,
              textDecoration: "none", textAlign: "center",
            }}>💬 {hi ? "WhatsApp" : "WhatsApp"}</a>
          )}
          <button onClick={handleAssign} style={{
            flex: 1.5, padding: "10px",
            borderRadius: 10, border: t.isOffline ? `1.5px solid ${T.border}` : "none",
            background: t.isOffline ? T.white : T.sky,
            color: t.isOffline ? T.muted : T.white,
            fontFamily: font.display, fontSize: 13, fontWeight: 700,
            cursor: "pointer",
          }}>
            {t.isOffline
              ? (hi ? "Assign करें?" : "Assign?")
              : (hi ? "काम दें" : "Assign Work")}
          </button>
        </div>

        {/* View profile */}
        <button onClick={onViewProfile} style={{
          width: "100%", marginTop: 8, padding: "8px",
          background: "none", border: "none", cursor: "pointer",
          fontFamily: font.mono, fontSize: 11, color: T.sky, fontWeight: 700,
          letterSpacing: "0.06em",
        }}>
          {hi ? "FULL PROFILE देखें →" : "VIEW FULL PROFILE →"}
        </button>
      </div>
    </Card>
  );
};
