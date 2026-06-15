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
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%", background: d.color,
      }} />
    </span>
  );
};

export const TechProfileScreen = ({ lang, tech, setScreen }) => {
  const hi = lang === "hi";
  if (!tech) { setScreen("search"); return null; }

  return (
    <div style={{ padding: "16px" }}>
      <button onClick={() => setScreen("search")} style={{
        display:"flex",alignItems:"center",gap:6,
        background:"none",border:"none",cursor:"pointer",
        fontFamily:font.body,fontSize:14,color:T.muted,marginBottom:16,
      }}>← {hi ? "वापस" : "Back"}</button>

      {/* Avatar */}
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.saffron}, #c45a08)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
          fontFamily: font.display, fontSize: 32, fontWeight: 800, color: T.white,
          boxShadow: `0 8px 24px ${T.saffron}40`,
        }}>{tech.name[0]}</div>
        <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800 }}>{tech.name}</div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>📍 {tech.city} · {tech.vehicle} · {tech.experience}</div>
        <div style={{ marginTop: 10, display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
          {tech.skills.map(s => <Tag key={s} label={s} color="saffron" />)}
        </div>
      </div>

      {/* Availability */}
      <Card className="fade-up-1" style={{ marginBottom: 12, borderLeft: `4px solid ${T.green}` }}>
        <div style={{ padding: "13px 16px", display: "flex", alignItems: "center", gap: 10 }}>
          <AvailDot status={tech.availability} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700 }}>
              {tech.availability === "AVAILABLE_NOW" ? (hi ? "अभी Available" : "Available Now") : (hi ? "आज Available" : "Available Today")}
            </div>
            <div style={{ fontSize: 12, color: T.muted }}>🕐 {tech.locationAge}</div>
          </div>
          <div style={{ fontFamily: font.mono, fontSize: 14, fontWeight: 700, color: T.sky }}>{tech.distanceKm} km</div>
        </div>
      </Card>

      {/* Trust stats */}
      <Card className="fade-up-2" style={{ marginBottom: 12 }}>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginBottom: 12 }}>TRUST STATS</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[
              { e: "✅", v: tech.completedWork, l: hi ? "काम पूरे" : "Completed" },
              { e: "🤝", v: tech.uniqueSIs,     l: hi ? "Unique SIs" : "Unique SIs" },
              { e: "⭐", v: tech.avgRating,     l: hi ? "Avg Rating" : "Avg Rating" },
              { e: "📋", v: tech.openWork,      l: hi ? "Open Work" : "Open Work" },
            ].map(s => (
              <div key={s.l} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{s.e}</span>
                <div>
                  <div style={{ fontFamily: font.mono, fontSize: 20, fontWeight: 700, color: T.saffron, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Action buttons */}
      {tech.mobile && (
        <div className="fade-up-3" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href={`tel:${tech.mobile}`} style={{
            flex:1,padding:"13px",borderRadius:50,
            background:T.greenDim,color:T.green,border:`1px solid ${T.green}40`,
            fontFamily:font.display,fontSize:15,fontWeight:700,
            textDecoration:"none",textAlign:"center",
          }}>📞 {hi?"Call":"Call"}</a>
          <a href={`https://wa.me/91${tech.mobile}`} target="_blank" rel="noreferrer" style={{
            flex:1,padding:"13px",borderRadius:50,
            background:"#e6f9f0",color:"#1a7a3a",border:"1px solid #1a7a3a40",
            fontFamily:font.display,fontSize:15,fontWeight:700,
            textDecoration:"none",textAlign:"center",
          }}>💬 WhatsApp</a>
        </div>
      )}
      <button onClick={() => setScreen("assign")} className="fade-up-4" style={{
        width:"100%",padding:"15px",borderRadius:50,border:"none",
        background:T.sky,color:T.white,
        fontFamily:font.display,fontSize:16,fontWeight:700,cursor:"pointer",
        boxShadow:`0 4px 20px ${T.sky}50`,marginBottom:24,
      }}>
        {hi?"Site Work Assign करें →":"Assign Site Work →"}
      </button>
    </div>
  );
};
