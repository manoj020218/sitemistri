import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  ink: "#0f0e0c",
  paper: "#f5f0e8",
  saffron: "#e8630a",
  saffronLight: "#ff8c3a",
  saffronDim: "#fde8d4",
  green: "#1a7a4a",
  greenLight: "#22a060",
  greenDim: "#d4f0e2",
  sky: "#1a5fa8",
  skyDim: "#daeaf8",
  border: "#e0d8cc",
  muted: "#6b6258",
  white: "#ffffff",
  error: "#c0392b",
  errorDim: "#fdecea",
  warn: "#b8860b",
  warnDim: "#fff8e1",
};

const font = {
  display: "'Baloo 2', sans-serif",
  body: "'Noto Sans Devanagari', sans-serif",
  mono: "'Space Mono', monospace",
};

const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: ${T.paper}; font-family: ${font.body}; color: ${T.ink}; }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
    @keyframes pulse { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.7);} }
    @keyframes slideIn { from{transform:translateY(100%);opacity:0;}to{transform:translateY(0);opacity:1;} }
    @keyframes spin { to{transform:rotate(360deg);} }
    @keyframes ping { 0%{transform:scale(1);opacity:0.8;}100%{transform:scale(2.2);opacity:0;} }
    .fade-up { animation: fadeUp 0.35s ease both; }
    .fade-up-1 { animation: fadeUp 0.35s 0.05s ease both; }
    .fade-up-2 { animation: fadeUp 0.35s 0.10s ease both; }
    .fade-up-3 { animation: fadeUp 0.35s 0.15s ease both; }
    .fade-up-4 { animation: fadeUp 0.35s 0.20s ease both; }
    .fade-up-5 { animation: fadeUp 0.35s 0.25s ease both; }
    .slide-in  { animation: slideIn 0.32s ease both; }
  `}</style>
);

// ─── MOCK DATA ────────────────────────────────────────────────────
const TECH = {
  name: "Ramesh Kumar",
  city: "Jaipur",
  skills: ["CCTV Installation", "IP Camera", "DVR/NVR", "LAN Cabling"],
  experience: "5+ साल",
  tools: ["Drill", "LAN Tester", "Crimping Tool", "Ladder"],
  vehicle: "Bike",
  completedWork: 18,
  uniqueSIs: 5,
  avgRating: 4.6,
  onTime: 16,
  noShow: 0,
  profileStrength: 80,
  slug: "ramesh-kumar-jaipur",
};

const INCOMING = [
  {
    id: "sw_001",
    siName: "Suresh Electronics",
    siCity: "Jaipur",
    workType: "DVR/NVR Setup",
    siteAddress: "Shop No. 12, Vaishali Nagar, Jaipur",
    distanceKm: 2.4,
    skills: ["DVR/NVR", "IP Camera"],
    description: "DVR not recording. Need to check settings and HDD.",
    preferredTime: "Today, 3:00 PM",
    agreedCharge: 500,
    paymentMode: "Cash",
    assignedAt: "10 min पहले",
    status: "PENDING",
  },
  {
    id: "sw_002",
    siName: "Rajasthan Security",
    siCity: "Jaipur",
    workType: "Camera Service",
    siteAddress: "Plot 45, Malviya Nagar, Jaipur",
    distanceKm: 4.1,
    skills: ["CCTV", "Camera Service"],
    description: "2 cameras not working. Need to check wiring and replace if needed.",
    preferredTime: "Tomorrow, 11:00 AM",
    agreedCharge: 800,
    paymentMode: "UPI",
    assignedAt: "1 घंटा पहले",
    status: "PENDING",
  },
];

const ACTIVE_WORK = {
  id: "sw_003",
  siName: "TechVision Systems",
  siPhone: "9876543210",
  workType: "IP Camera Configuration",
  siteAddress: "C-12, Tonk Road, Near Durgapura Metro, Jaipur",
  skills: ["IP Camera", "Networking"],
  description: "4 IP cameras need to be configured on NVR. Client has basic setup done.",
  preferredTime: "Today, 2:00 PM",
  agreedCharge: 1200,
  paymentMode: "Cash",
  status: "ACCEPTED",
  acceptedAt: "30 min पहले",
};

const HISTORY = [
  { id: "sw_010", siName: "Suresh Electronics",    workType: "CCTV Installation", date: "22 May 2026", rating: 5, charge: 1500, status: "CLOSED" },
  { id: "sw_009", siName: "Rajasthan Security",    workType: "DVR/NVR Setup",     date: "18 May 2026", rating: 4, charge: 600,  status: "CLOSED" },
  { id: "sw_008", siName: "TechVision Systems",    workType: "Camera Service",    date: "14 May 2026", rating: 5, charge: 800,  status: "CLOSED" },
  { id: "sw_007", siName: "Jaipur CCTV Co.",       workType: "LAN Cabling",       date: "10 May 2026", rating: 4, charge: 1200, status: "CLOSED" },
  { id: "sw_006", siName: "Metro Surveillance",    workType: "IP Camera Config",  date: "05 May 2026", rating: 5, charge: 900,  status: "CLOSED" },
];

// ─── SHARED UI ─────────────────────────────────────────────────────
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{
    background: T.white, borderRadius: 16,
    border: `1px solid ${T.border}`,
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    overflow: "hidden",
    cursor: onClick ? "pointer" : "default",
    ...style,
  }}>{children}</div>
);

const Tag = ({ label, color = "saffron" }) => {
  const c = {
    saffron: { bg: T.saffronDim, text: T.saffron },
    green:   { bg: T.greenDim,   text: T.green },
    sky:     { bg: T.skyDim,     text: T.sky },
    ink:     { bg: "#e8e4dc",    text: T.ink },
    warn:    { bg: T.warnDim,    text: T.warn },
    error:   { bg: T.errorDim,   text: T.error },
  }[color];
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px", borderRadius: 20,
      background: c.bg, color: c.text,
      fontFamily: font.mono, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase",
    }}>{label}</span>
  );
};

const Stars = ({ n }) => (
  <span style={{ color: "#f5a623", letterSpacing: 1 }}>
    {"★".repeat(n)}{"☆".repeat(5 - n)}
  </span>
);

const Divider = () => (
  <div style={{ height: 1, background: T.border, margin: "0" }} />
);

// ─── AVAILABILITY TOGGLE ──────────────────────────────────────────
const AvailToggle = ({ status, onChange, lang }) => {
  const hi = lang === "hi";
  const options = [
    { id: "AVAILABLE_NOW",      dot: T.greenLight, label: hi ? "अभी Available" : "Available Now",      short: hi ? "अभी" : "Now" },
    { id: "AVAILABLE_TODAY",    dot: "#f5a623",    label: hi ? "आज Available" : "Available Today",    short: hi ? "आज" : "Today" },
    { id: "AVAILABLE_TOMORROW", dot: T.sky,        label: hi ? "कल Available" : "Avail. Tomorrow",    short: hi ? "कल" : "Tomorrow" },
    { id: "BUSY",               dot: T.error,      label: hi ? "Busy" : "Busy",                        short: hi ? "Busy" : "Busy" },
    { id: "OFFLINE",            dot: T.muted,      label: hi ? "Offline" : "Offline",                  short: hi ? "Offline" : "Offline" },
  ];
  const cur = options.find(o => o.id === status) || options[4];

  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 14px", borderRadius: 50,
        border: `2px solid ${cur.dot}`,
        background: T.white, cursor: "pointer",
        fontFamily: font.display, fontSize: 13, fontWeight: 700,
        color: T.ink, transition: "all 0.2s",
      }}>
        {/* dot with ping for available */}
        <span style={{ position: "relative", width: 10, height: 10, flexShrink: 0 }}>
          {status === "AVAILABLE_NOW" && (
            <span style={{
              position: "absolute", inset: -2,
              borderRadius: "50%", background: cur.dot,
              opacity: 0.35,
              animation: "ping 1.5s ease-out infinite",
            }} />
          )}
          <span style={{
            position: "absolute", inset: 0,
            borderRadius: "50%", background: cur.dot,
          }} />
        </span>
        {cur.label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5">
          <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
        </svg>
      </button>

      {open && (
        <div className="slide-in" style={{
          position: "absolute", top: "calc(100% + 8px)", left: 0,
          background: T.white, borderRadius: 14,
          border: `1px solid ${T.border}`,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          zIndex: 50, minWidth: 200, overflow: "hidden",
        }}>
          {options.map(o => (
            <button key={o.id} onClick={() => { onChange(o.id); setOpen(false); }} style={{
              width: "100%", padding: "12px 16px",
              display: "flex", alignItems: "center", gap: 10,
              background: o.id === status ? T.paper : T.white,
              border: "none", cursor: "pointer",
              fontFamily: font.body, fontSize: 14, fontWeight: o.id === status ? 700 : 400,
              color: T.ink, textAlign: "left",
              transition: "background 0.15s",
            }}>
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: o.dot, flexShrink: 0 }} />
              {o.label}
              {o.id === status && (
                <svg style={{ marginLeft: "auto" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: HOME ─────────────────────────────────────────────────
const HomeScreen = ({ lang, availability, setAvailability, setScreen }) => {
  const hi = lang === "hi";
  const isAvail = ["AVAILABLE_NOW", "AVAILABLE_TODAY", "AVAILABLE_TOMORROW"].includes(availability);

  return (
    <div>
      {/* HEADER */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", marginBottom: 3 }}>
              {hi ? "नमस्ते," : "HELLO,"}
            </div>
            <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800 }}>
              {TECH.name} 👋
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={() => setScreen("notifications")} style={{
              width: 38, height: 38, borderRadius: "50%",
              background: T.white, border: `1px solid ${T.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", position: "relative",
            }}>
              🔔
              <span style={{
                position: "absolute", top: 6, right: 6,
                width: 8, height: 8, borderRadius: "50%",
                background: T.error, border: `2px solid ${T.paper}`,
              }} />
            </button>
            <button onClick={() => setScreen("profile")} style={{
              width: 38, height: 38, borderRadius: "50%",
              background: `linear-gradient(135deg, ${T.saffron}, #c45a08)`,
              border: "none", cursor: "pointer",
              fontFamily: font.display, fontSize: 16, fontWeight: 800, color: T.white,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>R</button>
          </div>
        </div>

        {/* Availability toggle + location */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <AvailToggle status={availability} onChange={setAvailability} lang={lang} />
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "8px 14px", borderRadius: 50,
            border: `1px solid ${T.border}`,
            background: T.white, cursor: "pointer",
            fontFamily: font.mono, fontSize: 11, color: T.muted,
          }}>
            📍 <span>{hi ? "Location Update" : "Update Location"}</span>
          </button>
        </div>

        {/* Visibility banner */}
        {isAvail ? (
          <div className="fade-up" style={{
            background: T.greenDim, borderRadius: 12,
            padding: "12px 14px", marginBottom: 16,
            display: "flex", gap: 10, alignItems: "center",
            border: `1px solid ${T.green}40`,
          }}>
            <span style={{ fontSize: 18 }}>✅</span>
            <span style={{ fontSize: 13, color: T.green, fontWeight: 600, fontFamily: font.body }}>
              {hi ? "आप nearby SI की search में दिख रहे हैं।" : "You are visible in nearby SI searches."}
            </span>
          </div>
        ) : (
          <div className="fade-up" style={{
            background: T.errorDim, borderRadius: 12,
            padding: "12px 14px", marginBottom: 16,
            display: "flex", gap: 10, alignItems: "center",
            border: `1px solid ${T.error}40`,
          }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13, color: T.error, fontWeight: 700, fontFamily: font.body }}>
                {hi ? "आप search में नहीं दिख रहे।" : "You are not visible in search."}
              </div>
              <div style={{ fontSize: 12, color: T.error, opacity: 0.8 }}>
                {hi ? "Available status ON करें।" : "Turn availability ON to appear."}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACTIVE WORK CARD */}
      <div style={{ padding: "0 16px 12px" }}>
        <Card style={{ borderLeft: `4px solid ${T.saffron}` }} onClick={() => setScreen("active-work")}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
              <div>
                <Tag label={hi ? "Active Site Work" : "ACTIVE SITE WORK"} color="saffron" />
              </div>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted }}>30 min पहले</div>
            </div>
            <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
              {ACTIVE_WORK.workType}
            </div>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>
              📍 {ACTIVE_WORK.siteAddress}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {["On The Way", "Reached Site", "Work Started", "Complete"].map((s, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i < 1 ? T.saffron : T.border,
                }} />
              ))}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: T.saffron, fontFamily: font.mono, fontWeight: 700 }}>
              {hi ? "ACCEPTED → अगला: On The Way" : "ACCEPTED → NEXT: On The Way"}
            </div>
          </div>
        </Card>
      </div>

      {/* INCOMING WORK */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700 }}>
            {hi ? "नए काम के अनुरोध" : "New Work Requests"}
          </div>
          <Tag label={`${INCOMING.length}`} color="saffron" />
        </div>

        {INCOMING.map((w, idx) => (
          <Card key={w.id} className={`fade-up-${idx + 1}`}
            style={{ marginBottom: 10 }} onClick={() => setScreen("work-detail")}>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                <div>
                  <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700 }}>{w.siName}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{w.workType}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 700, color: T.green }}>₹{w.agreedCharge}</div>
                  <div style={{ fontSize: 11, color: T.muted }}>{w.paymentMode}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>
                📍 {w.distanceKm} km · {w.siteAddress.split(",")[0]}
              </div>
              <div style={{ fontSize: 13, color: T.ink, marginBottom: 12, lineHeight: 1.5 }}>
                {w.description}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{
                  flex: 1, padding: "9px", borderRadius: 10,
                  background: T.green, color: T.white,
                  fontFamily: font.display, fontSize: 14, fontWeight: 700,
                  border: "none", cursor: "pointer",
                }}>
                  {hi ? "✓ स्वीकार करें" : "✓ Accept"}
                </button>
                <button style={{
                  flex: 1, padding: "9px", borderRadius: 10,
                  background: T.errorDim, color: T.error,
                  fontFamily: font.display, fontSize: 14, fontWeight: 700,
                  border: `1px solid ${T.error}40`, cursor: "pointer",
                }}>
                  {hi ? "✕ अस्वीकार" : "✕ Reject"}
                </button>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                ⏰ {hi ? "पसंदीदा समय:" : "Preferred:"} {w.preferredTime} · {w.assignedAt}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* QUICK STATS */}
      <div style={{ padding: "0 16px 12px" }}>
        <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700, marginBottom: 10 }}>
          {hi ? "आपका Trust Score" : "Your Trust Score"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { v: TECH.completedWork, l: hi ? "काम पूरे" : "Completed", e: "✅" },
            { v: TECH.uniqueSIs,     l: hi ? "Unique SIs" : "Unique SIs", e: "🤝" },
            { v: `${TECH.avgRating}★`, l: hi ? "Rating" : "Rating", e: "⭐" },
          ].map(s => (
            <Card key={s.l} style={{ textAlign: "center", padding: "14px 8px" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.e}</div>
              <div style={{ fontFamily: font.mono, fontSize: 18, fontWeight: 700, color: T.saffron }}>{s.v}</div>
              <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{s.l}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* PROFILE STRENGTH */}
      <div style={{ padding: "0 16px 20px" }}>
        <Card onClick={() => setScreen("profile")}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700 }}>
                {hi ? "Profile Strength" : "Profile Strength"}
              </div>
              <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 700, color: T.saffron }}>
                {TECH.profileStrength}%
              </span>
            </div>
            <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: "hidden", marginBottom: 8 }}>
              <div style={{
                height: "100%", background: T.saffron,
                width: `${TECH.profileStrength}%`, borderRadius: 3,
              }} />
            </div>
            <div style={{ fontSize: 12, color: T.muted }}>
              {hi ? "💡 Profile photo add करें +10% strength" : "💡 Add profile photo for +10% strength"}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── SCREEN: ACTIVE WORK ──────────────────────────────────────────
const ActiveWorkScreen = ({ lang, setScreen }) => {
  const hi = lang === "hi";
  const [status, setStatus] = useState("ACCEPTED");
  const [showProof, setShowProof] = useState(false);
  const [proofUploaded, setProofUploaded] = useState(false);

  const statuses = [
    { id: "ACCEPTED",   label: hi ? "Accepted" : "Accepted",     done: true },
    { id: "ON_THE_WAY", label: hi ? "On The Way" : "On The Way", done: status !== "ACCEPTED" },
    { id: "REACHED",    label: hi ? "Site पर पहुंचा" : "Reached Site", done: ["REACHED","STARTED","COMPLETED"].includes(status) },
    { id: "STARTED",    label: hi ? "काम शुरू" : "Work Started", done: ["STARTED","COMPLETED"].includes(status) },
    { id: "COMPLETED",  label: hi ? "काम पूरा" : "Completed",   done: status === "COMPLETED" },
  ];

  const nextAction = {
    ACCEPTED:   { id: "ON_THE_WAY", label: hi ? "On The Way चलाएं" : "Mark: On The Way",     color: T.sky },
    ON_THE_WAY: { id: "REACHED",    label: hi ? "Site पर पहुंच गया" : "Mark: Reached Site",   color: T.saffron },
    REACHED:    { id: "STARTED",    label: hi ? "काम शुरू किया" : "Mark: Work Started",       color: T.saffron },
    STARTED:    { id: "COMPLETED",  label: hi ? "काम पूरा हुआ" : "Mark: Work Completed",     color: T.green },
  }[status];

  return (
    <div>
      <div style={{ padding: "16px 16px 0" }}>
        <button onClick={() => setScreen("home")} style={{
          display: "flex", alignItems: "center", gap: 6,
          background: "none", border: "none", cursor: "pointer",
          fontFamily: font.body, fontSize: 14, color: T.muted, marginBottom: 16,
        }}>
          ← {hi ? "वापस" : "Back"}
        </button>

        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.saffron, letterSpacing: "0.1em", marginBottom: 6 }}>
          {hi ? "ACTIVE SITE WORK" : "ACTIVE SITE WORK"}
        </div>
        <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
          {ACTIVE_WORK.workType}
        </h2>

        {/* SI Info */}
        <Card style={{ marginBottom: 12 }}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
              {hi ? "SI / CONTRACTOR" : "SI / CONTRACTOR"}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700 }}>{ACTIVE_WORK.siName}</div>
                <div style={{ fontSize: 13, color: T.muted, marginTop: 2 }}>+91 {ACTIVE_WORK.siPhone}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <a href={`tel:${ACTIVE_WORK.siPhone}`} style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: T.greenDim, border: `1px solid ${T.green}40`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none", fontSize: 18,
                }}>📞</a>
                <a href={`https://wa.me/91${ACTIVE_WORK.siPhone}`} target="_blank" rel="noreferrer" style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "#e6f9f0", border: "1px solid #1a7a3a40",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  textDecoration: "none", fontSize: 18,
                }}>💬</a>
              </div>
            </div>
          </div>
        </Card>

        {/* Site Info */}
        <Card style={{ marginBottom: 12 }}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
              {hi ? "SITE DETAILS" : "SITE DETAILS"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>📍 {ACTIVE_WORK.siteAddress}</div>
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 10 }}>{ACTIVE_WORK.description}</div>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
              <div style={{ fontSize: 13 }}>⏰ {ACTIVE_WORK.preferredTime}</div>
              <div style={{ fontSize: 13 }}>💰 ₹{ACTIVE_WORK.agreedCharge} · {ACTIVE_WORK.paymentMode}</div>
            </div>
            <button style={{
              marginTop: 12, width: "100%", padding: "10px",
              borderRadius: 10, border: `1px solid ${T.border}`,
              background: T.paper, cursor: "pointer",
              fontFamily: font.display, fontSize: 13, fontWeight: 700,
              color: T.sky, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              🗺️ {hi ? "Google Maps में खोलें" : "Open in Google Maps"}
            </button>
          </div>
        </Card>

        {/* Status Timeline */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginBottom: 14 }}>
              {hi ? "PROGRESS" : "PROGRESS"}
            </div>
            {statuses.map((s, i) => (
              <div key={s.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < statuses.length - 1 ? 14 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%",
                    background: s.done ? T.green : T.border,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}>
                    {s.done
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                      : <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.border, display: "block" }} />
                    }
                  </div>
                  {i < statuses.length - 1 && (
                    <div style={{ width: 2, flex: 1, minHeight: 16, background: s.done ? T.green : T.border, marginTop: 2 }} />
                  )}
                </div>
                <div style={{ paddingBottom: i < statuses.length - 1 ? 12 : 0 }}>
                  <div style={{
                    fontFamily: font.display, fontSize: 14, fontWeight: 700,
                    color: s.done ? T.ink : T.muted,
                  }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Next action */}
        {status !== "COMPLETED" && nextAction && (
          <button onClick={() => setStatus(nextAction.id)} style={{
            width: "100%", padding: "15px",
            borderRadius: 50, border: "none",
            background: nextAction.color, color: T.white,
            fontFamily: font.display, fontSize: 16, fontWeight: 700,
            cursor: "pointer", marginBottom: 12,
            boxShadow: `0 4px 20px ${nextAction.color}50`,
          }}>
            {nextAction.label} →
          </button>
        )}

        {/* Upload proof */}
        {status === "COMPLETED" && !proofUploaded && (
          <div className="slide-in">
            <div style={{
              background: T.saffronDim, borderRadius: 14,
              padding: "16px", marginBottom: 12,
              border: `1px solid ${T.saffron}40`,
            }}>
              <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, marginBottom: 6 }}>
                {hi ? "1 Proof Photo Upload करें" : "Upload 1 Proof Photo"}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginBottom: 12, lineHeight: 1.6 }}>
                {hi
                  ? "Maximum 1 photo। ज्यादा proof के लिए SI को WhatsApp पर भेजें।"
                  : "Maximum 1 photo. Send extra proof to SI on WhatsApp."}
              </div>
              <button onClick={() => setProofUploaded(true)} style={{
                width: "100%", padding: "13px",
                borderRadius: 50, border: `2px dashed ${T.saffron}`,
                background: T.white, cursor: "pointer",
                fontFamily: font.display, fontSize: 14, fontWeight: 700,
                color: T.saffron,
              }}>
                📷 {hi ? "Photo खींचें / Upload करें" : "Take / Upload Photo"}
              </button>
            </div>
          </div>
        )}

        {proofUploaded && (
          <div className="slide-in" style={{
            background: T.greenDim, borderRadius: 14,
            padding: "16px", marginBottom: 12,
            border: `1px solid ${T.green}40`,
          }}>
            <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, color: T.green, marginBottom: 4 }}>
              ✅ {hi ? "Proof Photo Upload हो गई" : "Proof Photo Uploaded"}
            </div>
            <div style={{ fontSize: 12, color: T.green, opacity: 0.8 }}>
              {hi ? "SI review करके Site Work close करेगा। Photo 7 दिन में auto-delete होगी।" : "SI will review and close the Site Work. Photo auto-deletes in 7 days."}
            </div>
          </div>
        )}

        {/* Cancel */}
        <button style={{
          width: "100%", padding: "13px",
          borderRadius: 50, border: `1px solid ${T.border}`,
          background: "transparent", cursor: "pointer",
          fontFamily: font.display, fontSize: 14, fontWeight: 700,
          color: T.muted, marginBottom: 24,
        }}>
          {hi ? "Site Work Cancel करें" : "Cancel Site Work"}
        </button>
      </div>
    </div>
  );
};

// ─── SCREEN: WORK DETAIL (incoming) ──────────────────────────────
const WorkDetailScreen = ({ lang, setScreen }) => {
  const hi = lang === "hi";
  const w = INCOMING[0];

  return (
    <div style={{ padding: "16px" }}>
      <button onClick={() => setScreen("home")} style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "none", border: "none", cursor: "pointer",
        fontFamily: font.body, fontSize: 14, color: T.muted, marginBottom: 16,
      }}>← {hi ? "वापस" : "Back"}</button>

      <div style={{ fontFamily: font.mono, fontSize: 11, color: T.saffron, letterSpacing: "0.1em", marginBottom: 6 }}>
        {hi ? "काम का अनुरोध" : "WORK REQUEST"}
      </div>
      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, marginBottom: 16 }}>
        {w.workType}
      </h2>

      {/* SI */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginBottom: 8 }}>SI / CONTRACTOR</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700 }}>{w.siName}</div>
              <div style={{ fontSize: 13, color: T.muted }}>{w.siCity}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ width:38,height:38,borderRadius:"50%",background:T.greenDim,border:`1px solid ${T.green}40`,fontSize:18,cursor:"pointer" }}>📞</button>
              <button style={{ width:38,height:38,borderRadius:"50%",background:"#e6f9f0",border:"1px solid #1a7a3a40",fontSize:18,cursor:"pointer" }}>💬</button>
            </div>
          </div>
        </div>
      </Card>

      {/* Details */}
      <Card style={{ marginBottom: 12 }}>
        <div style={{ padding: "14px 16px" }}>
          {[
            { l: hi ? "Site Address" : "Site Address", v: `📍 ${w.siteAddress}` },
            { l: hi ? "दूरी" : "Distance", v: `${w.distanceKm} km from client site` },
            { l: hi ? "काम का विवरण" : "Work Description", v: w.description },
            { l: hi ? "पसंदीदा समय" : "Preferred Time", v: `⏰ ${w.preferredTime}` },
            { l: hi ? "Agreed Charge" : "Agreed Charge", v: `₹${w.agreedCharge} · ${w.paymentMode}` },
          ].map(r => (
            <div key={r.l} style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginBottom: 4 }}>{r.l.toUpperCase()}</div>
              <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.5 }}>{r.v}</div>
              <Divider />
            </div>
          ))}
        </div>
      </Card>

      {/* T&C note */}
      <div style={{
        background: T.saffronDim, borderRadius: 12, padding: "12px 14px",
        marginBottom: 16, fontSize: 12, color: "#7a4a1a", lineHeight: 1.6,
        border: `1px solid ${T.saffron}30`,
      }}>
        {hi
          ? "काम accept करने से मैं confirm करता/करती हूँ कि work scope, charges, और payment SI/client से directly discuss हो गई है। Platform payment collect, guarantee, या settle नहीं करता।"
          : "By accepting I confirm scope, charges, and payment have been discussed directly with SI. Platform does not collect, guarantee, or settle payment."}
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
        <button style={{
          flex: 1, padding: "14px",
          borderRadius: 50, border: "none",
          background: T.green, color: T.white,
          fontFamily: font.display, fontSize: 15, fontWeight: 700, cursor: "pointer",
          boxShadow: `0 4px 16px ${T.green}40`,
        }}>
          ✓ {hi ? "काम स्वीकार करें" : "Accept Work"}
        </button>
        <button style={{
          flex: 1, padding: "14px",
          borderRadius: 50, border: `1px solid ${T.border}`,
          background: T.white, color: T.error,
          fontFamily: font.display, fontSize: 15, fontWeight: 700, cursor: "pointer",
        }}>
          ✕ {hi ? "अस्वीकार करें" : "Reject"}
        </button>
      </div>
    </div>
  );
};

// ─── SCREEN: PROFILE ──────────────────────────────────────────────
const ProfileScreen = ({ lang, setScreen }) => {
  const hi = lang === "hi";
  const [copied, setCopied] = useState(false);

  const profileUrl = `https://siteworknetwork.com/t/${TECH.slug}`;

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ padding: "16px" }}>
      <button onClick={() => setScreen("home")} style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "none", border: "none", cursor: "pointer",
        fontFamily: font.body, fontSize: 14, color: T.muted, marginBottom: 16,
      }}>← {hi ? "वापस" : "Back"}</button>

      {/* Profile header */}
      <div className="fade-up" style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.saffron}, #c45a08)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 12px",
          fontFamily: font.display, fontSize: 32, fontWeight: 800, color: T.white,
          boxShadow: `0 8px 24px ${T.saffron}40`,
        }}>R</div>
        <div style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800 }}>{TECH.name}</div>
        <div style={{ fontSize: 14, color: T.muted, marginTop: 4 }}>📍 {TECH.city}</div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
          {TECH.skills.slice(0, 3).map(s => <Tag key={s} label={s} color="saffron" />)}
        </div>
      </div>

      {/* Profile strength */}
      <Card className="fade-up-1" style={{ marginBottom: 12 }}>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700 }}>
              {hi ? "Profile Strength" : "Profile Strength"}
            </div>
            <span style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 700, color: T.saffron }}>{TECH.profileStrength}%</span>
          </div>
          <div style={{ height: 8, background: T.border, borderRadius: 4, overflow: "hidden", marginBottom: 12 }}>
            <div style={{ height: "100%", background: T.saffron, width: `${TECH.profileStrength}%`, borderRadius: 4 }} />
          </div>
          {[
            { done: true,  label: hi ? "Skills added" : "Skills added" },
            { done: true,  label: hi ? "Tools added" : "Tools added" },
            { done: false, label: hi ? "Profile photo add करें (+10%)" : "Add profile photo (+10%)" },
            { done: false, label: hi ? "First Site Work complete करें (+30%)" : "Complete first Site Work (+30%)" },
          ].map(s => (
            <div key={s.label} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: s.done ? T.greenDim : T.border, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {s.done
                  ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  : <span style={{ width: 6, height: 6, background: T.muted, borderRadius: "50%" }} />}
              </div>
              <span style={{ fontSize: 13, color: s.done ? T.ink : T.muted }}>{s.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Auto-generated bio */}
      <Card className="fade-up-2" style={{ marginBottom: 12 }}>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
            {hi ? "AUTO-GENERATED PROFILE" : "AUTO-GENERATED PROFILE"}
          </div>
          <p style={{ fontSize: 13, color: T.ink, lineHeight: 1.75, marginBottom: 10 }}>
            {hi
              ? `${TECH.name} जयपुर में CCTV / IP Camera technician हैं। इन्हें ${TECH.experience} का अनुभव है। इनके पास ${TECH.skills.join(", ")} का काम आता है। इनके पास field work के tools हैं और ये nearby client site पर काम के लिए उपलब्ध हैं।`
              : `${TECH.name} is a CCTV / IP Camera technician in ${TECH.city} with ${TECH.experience} of field experience. Available for ${TECH.skills.join(", ")} work. Has field tools and can visit nearby client sites.`}
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TECH.tools.map(t => <Tag key={t} label={t} color="ink" />)}
          </div>
        </div>
      </Card>

      {/* Trust stats */}
      <Card className="fade-up-3" style={{ marginBottom: 12 }}>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginBottom: 12 }}>
            {hi ? "TRUST STATS" : "TRUST STATS"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { e: "✅", v: TECH.completedWork, l: hi ? "काम पूरे" : "Completed" },
              { e: "🤝", v: TECH.uniqueSIs,     l: hi ? "Unique SIs" : "Unique SIs" },
              { e: "⭐", v: TECH.avgRating,     l: hi ? "Avg Rating" : "Avg Rating" },
              { e: "⏱",  v: TECH.onTime,        l: hi ? "On-time" : "On-time" },
            ].map(s => (
              <div key={s.l} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span style={{ fontSize: 22 }}>{s.e}</span>
                <div>
                  <div style={{ fontFamily: font.mono, fontSize: 18, fontWeight: 700, color: T.saffron, lineHeight: 1 }}>{s.v}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Share */}
      <Card className="fade-up-4" style={{ marginBottom: 24 }}>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
            {hi ? "Profile Share करें" : "Share Your Profile"}
          </div>
          <div style={{
            background: T.paper, borderRadius: 10, padding: "10px 12px",
            fontFamily: font.mono, fontSize: 12, color: T.muted,
            marginBottom: 12, wordBreak: "break-all",
          }}>
            {profileUrl}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <button style={{
              flex: 1, padding: "11px",
              borderRadius: 50, border: "none",
              background: "#25D366", color: T.white,
              fontFamily: font.display, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              💬 {hi ? "WhatsApp" : "WhatsApp"}
            </button>
            <button onClick={handleCopy} style={{
              flex: 1, padding: "11px",
              borderRadius: 50,
              border: `1px solid ${copied ? T.green : T.border}`,
              background: copied ? T.greenDim : T.white,
              color: copied ? T.green : T.ink,
              fontFamily: font.display, fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>
              {copied ? `✓ ${hi ? "Copied!" : "Copied!"}` : `📋 ${hi ? "Copy Link" : "Copy Link"}`}
            </button>
          </div>
          <div style={{
            background: T.paper, borderRadius: 10, padding: "10px 12px",
            fontSize: 12, color: T.muted, lineHeight: 1.6,
          }}>
            {hi
              ? "💡 WhatsApp पर share करें: \"मैं CCTV technician हूँ। Profile देखें: siteworknetwork.com/t/ramesh-kumar-jaipur\""
              : '💡 Share on WhatsApp: "I am a CCTV technician. View my profile: siteworknetwork.com/t/ramesh-kumar-jaipur"'}
          </div>
        </div>
      </Card>
    </div>
  );
};

// ─── SCREEN: HISTORY ──────────────────────────────────────────────
const HistoryScreen = ({ lang, setScreen }) => {
  const hi = lang === "hi";
  return (
    <div style={{ padding: "16px" }}>
      <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800, marginBottom: 16 }}>
        {hi ? "Site Work History" : "Site Work History"}
      </div>

      {HISTORY.map((h, i) => (
        <Card key={h.id} className={`fade-up-${Math.min(i+1,5)}`} style={{ marginBottom: 10 }}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700 }}>{h.workType}</div>
                <div style={{ fontSize: 13, color: T.muted }}>{h.siName}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 700, color: T.green }}>₹{h.charge}</div>
                <Tag label={hi ? "बंद" : "CLOSED"} color="green" />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 12, color: T.muted }}>📅 {h.date}</div>
              <Stars n={h.rating} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// ─── BOTTOM NAV ───────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "home",        icon: "🏠", hi: "Home",     en: "Home" },
  { id: "active-work", icon: "⚡", hi: "Active",   en: "Active" },
  { id: "history",     icon: "📋", hi: "History",  en: "History" },
  { id: "profile",     icon: "👤", hi: "Profile",  en: "Profile" },
];

const BottomNav = ({ screen, setScreen, lang, incomingCount }) => {
  const hi = lang === "hi";
  return (
    <div style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 420,
      background: T.white,
      borderTop: `1px solid ${T.border}`,
      display: "flex",
      paddingBottom: "env(safe-area-inset-bottom, 8px)",
      zIndex: 50,
    }}>
      {NAV_ITEMS.map(n => {
        const active = screen === n.id || (screen === "work-detail" && n.id === "home");
        return (
          <button key={n.id} onClick={() => setScreen(n.id)} style={{
            flex: 1, padding: "10px 4px 6px",
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            position: "relative",
          }}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            {n.id === "home" && incomingCount > 0 && (
              <span style={{
                position: "absolute", top: 6, right: "calc(50% - 16px)",
                width: 16, height: 16, borderRadius: "50%",
                background: T.error, color: T.white,
                fontFamily: font.mono, fontSize: 9, fontWeight: 700,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `2px solid ${T.white}`,
              }}>{incomingCount}</span>
            )}
            <span style={{
              fontFamily: font.mono, fontSize: 9, fontWeight: 700,
              letterSpacing: "0.05em",
              color: active ? T.saffron : T.muted,
            }}>
              {hi ? n.hi : n.en}
            </span>
            {active && (
              <div style={{
                position: "absolute", bottom: 0,
                width: 24, height: 3, borderRadius: "3px 3px 0 0",
                background: T.saffron,
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────
export default function TechnicianDashboard() {
  const [screen, setScreen]           = useState("home");
  const [lang, setLang]               = useState("hi");
  const [availability, setAvailability] = useState("AVAILABLE_NOW");

  const renderScreen = () => {
    switch (screen) {
      case "home":        return <HomeScreen lang={lang} availability={availability} setAvailability={setAvailability} setScreen={setScreen} />;
      case "active-work": return <ActiveWorkScreen lang={lang} setScreen={setScreen} />;
      case "work-detail": return <WorkDetailScreen lang={lang} setScreen={setScreen} />;
      case "profile":     return <ProfileScreen lang={lang} setScreen={setScreen} />;
      case "history":     return <HistoryScreen lang={lang} setScreen={setScreen} />;
      default:            return <HomeScreen lang={lang} availability={availability} setAvailability={setAvailability} setScreen={setScreen} />;
    }
  };

  return (
    <>
      <Fonts />
      <div style={{
        minHeight: "100vh", background: T.paper,
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {/* Top bar */}
        <div style={{
          width: "100%", maxWidth: 420,
          padding: "10px 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: T.paper,
          borderBottom: `1px solid ${T.border}`,
          position: "sticky", top: 0, zIndex: 40,
        }}>
          <div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.08em" }}>
            SITE WORK NETWORK
          </div>
          <div style={{
            display: "flex", gap: 2,
            background: T.white, border: `1px solid ${T.border}`,
            borderRadius: 20, padding: 3,
          }}>
            {["hi", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "3px 10px", borderRadius: 14, border: "none",
                background: lang === l ? T.saffron : "transparent",
                color: lang === l ? T.white : T.muted,
                fontFamily: font.mono, fontSize: 11, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
              }}>
                {l === "hi" ? "हि" : "EN"}
              </button>
            ))}
          </div>
        </div>

        {/* Page content */}
        <div style={{ width: "100%", maxWidth: 420, flex: 1, paddingBottom: 80 }}>
          {renderScreen()}
        </div>

        {/* Bottom nav */}
        <BottomNav screen={screen} setScreen={setScreen} lang={lang} incomingCount={INCOMING.length} />
      </div>
    </>
  );
}
