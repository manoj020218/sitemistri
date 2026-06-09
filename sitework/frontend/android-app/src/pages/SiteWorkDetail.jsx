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
  purple: "#6b3fa0",
  purpleDim: "#ede5f8",
};

const font = {
  display: "'Baloo 2', sans-serif",
  body: "'Noto Sans Devanagari', sans-serif",
  mono: "'Space Mono', monospace",
};

const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    html,body { background:${T.paper}; font-family:${font.body}; color:${T.ink}; }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
    @keyframes slideUp { from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);} }
    @keyframes popIn   { 0%{transform:scale(0.7);opacity:0;}70%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;} }
    @keyframes spin    { to{transform:rotate(360deg);} }
    @keyframes pulse   { 0%,100%{opacity:1;}50%{opacity:.45;} }
    @keyframes confetti{
      0%  { transform:translateY(0) rotate(0deg);   opacity:1; }
      100%{ transform:translateY(80px) rotate(720deg); opacity:0; }
    }
    .fade-up   { animation: fadeUp  .35s ease both; }
    .fade-up-1 { animation: fadeUp  .35s .05s ease both; }
    .fade-up-2 { animation: fadeUp  .35s .10s ease both; }
    .fade-up-3 { animation: fadeUp  .35s .15s ease both; }
    .fade-up-4 { animation: fadeUp  .35s .20s ease both; }
    .fade-up-5 { animation: fadeUp  .35s .25s ease both; }
    .slide-up  { animation: slideUp .32s ease both; }
    .pop-in    { animation: popIn   .4s  ease both; }
  `}</style>
);

// ─── MOCK DATA — 4 DIFFERENT WORK STATES ──────────────────────────
const WORK_STATES = {
  // SI view: technician accepted, en-route
  ACCEPTED: {
    id: "sw_001",
    perspective: "SI",
    siName: "Suresh Sharma",
    siBiz: "Rajasthan Security Systems",
    techName: "Ramesh Kumar",
    techMobile: "9876543210",
    techCity: "Vaishali Nagar",
    techCompletedWork: 18,
    techAvgRating: 4.6,
    workType: "IP Camera Configuration",
    siteClientName: "Sharma Medical Store",
    clientMobile: "9898989898",
    siteAddress: "C-12, Tonk Road, Near Durgapura Metro, Jaipur",
    description: "4 IP cameras need to be configured on NVR. Client has basic setup done, need technician to configure remote view and motion alerts.",
    preferredTime: "Today, 2:00 PM",
    agreedCharge: 1200,
    materialIncluded: "NO",
    paymentBy: "Client",
    paymentMode: "Cash",
    status: "ACCEPTED",
    timestamps: {
      createdAt:  "28 May, 10:30 AM",
      assignedAt: "28 May, 10:35 AM",
      acceptedAt: "28 May, 10:40 AM",
    },
  },

  // SI view: technician marked work complete, needs review & close
  COMPLETED: {
    id: "sw_002",
    perspective: "SI",
    siName: "Suresh Sharma",
    siBiz: "Rajasthan Security Systems",
    techName: "Ramesh Kumar",
    techMobile: "9876543210",
    techCity: "Vaishali Nagar",
    techCompletedWork: 18,
    techAvgRating: 4.6,
    workType: "DVR/NVR Setup",
    siteClientName: "Green Valley Apartments",
    clientMobile: "9911223344",
    siteAddress: "Block B, Green Valley, Malviya Nagar, Jaipur",
    description: "DVR not recording. Checked all channels, replaced HDD, configured recording schedule. All 8 cameras now recording.",
    preferredTime: "Today, 11:00 AM",
    agreedCharge: 800,
    materialIncluded: "YES",
    paymentBy: "SI",
    paymentMode: "UPI",
    status: "COMPLETED",
    proofPhotoUrl: "proof_placeholder",
    timestamps: {
      createdAt:           "28 May, 08:00 AM",
      assignedAt:          "28 May, 08:05 AM",
      acceptedAt:          "28 May, 08:10 AM",
      travelStartedAt:     "28 May, 10:45 AM",
      reachedAt:           "28 May, 11:05 AM",
      workStartedAt:       "28 May, 11:10 AM",
      technicianCompletedAt: "28 May, 12:40 PM",
    },
  },

  // Closed work with rating
  CLOSED: {
    id: "sw_003",
    perspective: "SI",
    siName: "Suresh Sharma",
    siBiz: "Rajasthan Security Systems",
    techName: "Deepak Meena",
    techMobile: "9765432109",
    techCity: "Mansarovar",
    techCompletedWork: 12,
    techAvgRating: 4.4,
    workType: "CCTV Installation",
    siteClientName: "Sunrise School",
    clientMobile: "9955667788",
    siteAddress: "Plot 45, Sector 7, Mansarovar, Jaipur",
    description: "Fresh installation of 6 cameras — 4 outdoor, 2 indoor. DVR setup and remote view configured.",
    preferredTime: "26 May, 10:00 AM",
    agreedCharge: 2500,
    materialIncluded: "NO",
    paymentBy: "Client",
    paymentMode: "Cash",
    status: "CLOSED",
    ratingGiven: { stars: 5, reachedOnTime: true, skillMatch: true, workCompleted: true, behaviourGood: true, comment: "Excellent work. Very professional." },
    timestamps: {
      createdAt:             "26 May, 09:00 AM",
      assignedAt:            "26 May, 09:05 AM",
      acceptedAt:            "26 May, 09:10 AM",
      travelStartedAt:       "26 May, 09:50 AM",
      reachedAt:             "26 May, 10:05 AM",
      workStartedAt:         "26 May, 10:10 AM",
      technicianCompletedAt: "26 May, 01:30 PM",
      siClosedAt:            "26 May, 02:00 PM",
    },
  },

  // Technician view: incoming work request
  TECH_PENDING: {
    id: "sw_004",
    perspective: "TECH",
    siName: "TechVision Systems",
    siCity: "Jaipur",
    techName: "Ramesh Kumar",
    techMobile: "9876543210",
    workType: "Camera Angle Adjustment",
    siteClientName: "City Mall",
    siteAddress: "Ground Floor, City Mall, MI Road, Jaipur",
    description: "4 cameras in parking area need angle adjustment. Client complains blind spots at entry/exit gates.",
    preferredTime: "Today, 4:00 PM",
    agreedCharge: 400,
    materialIncluded: "NO",
    paymentBy: "SI",
    paymentMode: "Cash",
    status: "PENDING_ACCEPTANCE",
    distanceKm: 3.2,
    timestamps: { assignedAt: "28 May, 1:00 PM" },
  },
};

// ─── STATUS CONFIG ─────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING_ACCEPTANCE:  { hi: "Technician का इंतजार",   en: "Pending Acceptance",   color: "warn" },
  ACCEPTED:            { hi: "Accepted",                 en: "Accepted",              color: "sky" },
  ON_THE_WAY:          { hi: "On The Way",               en: "On The Way",            color: "sky" },
  REACHED:             { hi: "Site पर पहुंचा",           en: "Reached Site",          color: "sky" },
  WORK_STARTED:        { hi: "काम शुरू",                 en: "Work Started",          color: "saffron" },
  COMPLETED:           { hi: "Complete — Review करें",   en: "Complete — Review Now", color: "saffron" },
  CLOSED:              { hi: "Closed ✓",                 en: "Closed ✓",             color: "green" },
  CANCELLED:           { hi: "Cancelled",                en: "Cancelled",             color: "error" },
};

// ─── SHARED COMPONENTS ────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{
    background: T.white, borderRadius: 16,
    border: `1px solid ${T.border}`,
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    overflow: "hidden",
    ...style,
  }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: font.mono, fontSize: 10, fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: T.muted, marginBottom: 8,
  }}>{children}</div>
);

const Tag = ({ label, color = "sky" }) => {
  const c = {
    sky:     { bg: T.skyDim,     text: T.sky },
    saffron: { bg: T.saffronDim, text: T.saffron },
    green:   { bg: T.greenDim,   text: T.green },
    ink:     { bg: "#e8e4dc",    text: T.ink },
    warn:    { bg: T.warnDim,    text: T.warn },
    error:   { bg: T.errorDim,   text: T.error },
    purple:  { bg: T.purpleDim,  text: T.purple },
  }[color] || { bg: T.skyDim, text: T.sky };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      background: c.bg, color: c.text,
      fontFamily: font.mono, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase",
    }}>{label}</span>
  );
};

const Divider = () => <div style={{ height: 1, background: T.border }} />;

const InfoRow = ({ label, value, valueStyle }) => (
  <div style={{ marginBottom: 14 }}>
    <SectionLabel>{label}</SectionLabel>
    <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.55, ...valueStyle }}>{value}</div>
  </div>
);

// Star rating component
const StarPicker = ({ value, onChange, size = 32 }) => (
  <div style={{ display: "flex", gap: 6 }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} onClick={() => onChange(n)} style={{
        background: "none", border: "none", cursor: "pointer",
        fontSize: size, lineHeight: 1,
        color: n <= value ? "#f5a623" : T.border,
        transition: "color 0.15s, transform 0.15s",
        transform: n <= value ? "scale(1.1)" : "scale(1)",
        padding: 2,
      }}>★</button>
    ))}
  </div>
);

// Timeline component
const Timeline = ({ timestamps, status }) => {
  const steps = [
    { key: "createdAt",             hi: "Created",               en: "Created" },
    { key: "assignedAt",            hi: "Assigned",              en: "Assigned" },
    { key: "acceptedAt",            hi: "Accepted",              en: "Accepted" },
    { key: "travelStartedAt",       hi: "On The Way",            en: "On The Way" },
    { key: "reachedAt",             hi: "Site पर पहुंचा",        en: "Reached Site" },
    { key: "workStartedAt",         hi: "काम शुरू",              en: "Work Started" },
    { key: "technicianCompletedAt", hi: "Technician ने Complete किया", en: "Tech Completed" },
    { key: "siClosedAt",            hi: "SI ने Close किया",      en: "SI Closed" },
    { key: "cancelledAt",           hi: "Cancelled",             en: "Cancelled" },
  ];
  const active = steps.filter(s => timestamps[s.key]);

  return (
    <div style={{ paddingLeft: 4 }}>
      {active.map((s, i) => (
        <div key={s.key} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < active.length - 1 ? 14 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: T.green,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, zIndex: 1,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            {i < active.length - 1 && (
              <div style={{ width: 2, flex: 1, minHeight: 14, background: T.greenDim, marginTop: 2 }} />
            )}
          </div>
          <div style={{ paddingBottom: i < active.length - 1 ? 12 : 0, flex: 1 }}>
            <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700 }}>{s.hi}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{timestamps[s.key]}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── VIEW: SI — ACTIVE WORK (ACCEPTED/IN PROGRESS) ───────────────
const SIActiveView = ({ work, lang }) => {
  const hi = lang === "hi";
  const st = STATUS_CFG[work.status];

  return (
    <div>
      {/* Status banner */}
      <div style={{
        background: T.skyDim, padding: "14px 16px",
        borderBottom: `1px solid ${T.sky}30`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: T.sky,
          animation: "pulse 1.8s ease-in-out infinite",
          flexShrink: 0,
        }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, color: T.sky }}>
            {hi ? st.hi : st.en}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>
            {hi ? `${work.techName} को notify किया जा चुका है` : `${work.techName} has been notified`}
          </div>
        </div>
        <Tag label={hi ? st.hi : st.en} color={st.color} />
      </div>

      <div style={{ padding: "16px" }}>
        {/* Technician card */}
        <Card className="fade-up" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "TECHNICIAN" : "TECHNICIAN"}</SectionLabel>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${T.saffron}, #c45a08)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.display, fontSize: 20, fontWeight: 800, color: T.white,
              }}>{work.techName[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700 }}>{work.techName}</div>
                <div style={{ fontSize: 12, color: T.muted }}>
                  {work.techCity} · ✅ {work.techCompletedWork} {hi ? "काम" : "works"} · ⭐ {work.techAvgRating}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`tel:${work.techMobile}`} style={{
                flex: 1, padding: "10px", borderRadius: 10,
                background: T.greenDim, color: T.green,
                border: `1px solid ${T.green}30`,
                fontFamily: font.display, fontSize: 13, fontWeight: 700,
                textDecoration: "none", textAlign: "center",
              }}>📞 {hi ? "Call" : "Call"}</a>
              <a href={`https://wa.me/91${work.techMobile}`} target="_blank" rel="noreferrer" style={{
                flex: 1, padding: "10px", borderRadius: 10,
                background: "#e6f9f0", color: "#1a7a3a",
                border: "1px solid #1a7a3a30",
                fontFamily: font.display, fontSize: 13, fontWeight: 700,
                textDecoration: "none", textAlign: "center",
              }}>💬 WhatsApp</a>
            </div>
          </div>
        </Card>

        {/* Site details */}
        <Card className="fade-up-1" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "SITE DETAILS" : "SITE DETAILS"}</SectionLabel>
            <InfoRow label={hi ? "CLIENT" : "CLIENT"} value={work.siteClientName} />
            <Divider />
            <div style={{ marginTop: 12 }}>
              <InfoRow label={hi ? "SITE ADDRESS" : "SITE ADDRESS"} value={`📍 ${work.siteAddress}`} />
            </div>
            <Divider />
            <div style={{ marginTop: 12 }}>
              <InfoRow label={hi ? "WORK" : "WORK"} value={work.workType} />
            </div>
            <Divider />
            <div style={{ marginTop: 12 }}>
              <InfoRow label={hi ? "DESCRIPTION" : "DESCRIPTION"} value={work.description} valueStyle={{ color: T.muted, fontSize: 13 }} />
            </div>
            <Divider />
            <div style={{ marginTop: 12, display: "flex", gap: 20 }}>
              <div>
                <SectionLabel>{hi ? "CHARGE" : "CHARGE"}</SectionLabel>
                <div style={{ fontFamily: font.mono, fontSize: 16, fontWeight: 700, color: T.green }}>₹{work.agreedCharge}</div>
                <div style={{ fontSize: 11, color: T.muted }}>{work.paymentMode} · {work.paymentBy}</div>
              </div>
              <div>
                <SectionLabel>{hi ? "MATERIAL" : "MATERIAL"}</SectionLabel>
                <div style={{ fontSize: 14 }}>{work.materialIncluded === "YES" ? "✅ Included" : work.materialIncluded === "NO" ? "❌ Not included" : "❓ Not sure"}</div>
              </div>
              <div>
                <SectionLabel>{hi ? "VISIT TIME" : "VISIT TIME"}</SectionLabel>
                <div style={{ fontSize: 13 }}>⏰ {work.preferredTime}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Timeline */}
        <Card className="fade-up-2" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "TIMELINE" : "TIMELINE"}</SectionLabel>
            <Timeline timestamps={work.timestamps} status={work.status} />
          </div>
        </Card>

        {/* Forward technician to client */}
        <Card className="fade-up-3" style={{ marginBottom: 14, background: "#e6f9f0", border: "1px solid #1a7a3a30" }}>
          <div style={{ padding: "14px 16px" }}>
            <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
              📤 {hi ? "Technician Contact Client को भेजें" : "Send Technician Contact to Client"}
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginBottom: 10, lineHeight: 1.55 }}>
              {hi
                ? `WhatsApp पर ${work.siteClientName} को technician की details भेजें।`
                : `Send technician details to ${work.siteClientName} on WhatsApp.`}
            </div>
            <button style={{
              width: "100%", padding: "11px",
              borderRadius: 50, border: "none",
              background: "#25D366", color: T.white,
              fontFamily: font.display, fontSize: 14, fontWeight: 700, cursor: "pointer",
            }}>
              💬 {hi ? "WhatsApp पर भेजें" : "Send on WhatsApp"}
            </button>
          </div>
        </Card>

        {/* Cancel */}
        <button style={{
          width: "100%", padding: "13px", borderRadius: 50,
          border: `1px solid ${T.border}`, background: "transparent",
          fontFamily: font.display, fontSize: 14, fontWeight: 700,
          color: T.error, cursor: "pointer", marginBottom: 8,
        }}>
          {hi ? "Site Work Cancel करें" : "Cancel Site Work"}
        </button>
      </div>
    </div>
  );
};

// ─── VIEW: SI — REVIEW & CLOSE ────────────────────────────────────
const SIReviewClose = ({ work, lang, onClose }) => {
  const hi = lang === "hi";

  const [stars,          setStars]          = useState(0);
  const [reachedOnTime,  setReachedOnTime]  = useState(null);
  const [skillMatch,     setSkillMatch]     = useState(null);
  const [workCompleted,  setWorkCompleted]  = useState(null);
  const [behaviourGood,  setBehaviourGood]  = useState(null);
  const [comment,        setComment]        = useState("");
  const [photoViewed,    setPhotoViewed]    = useState(false);
  const [closing,        setClosing]        = useState(false);

  const canClose = stars > 0 && photoViewed;

  const handleClose = () => {
    setClosing(true);
    setTimeout(() => { setClosing(false); onClose(); }, 1600);
  };

  const BoolToggle = ({ label, value, onChange }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ fontSize: 14, color: T.ink }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { v: true,  l: hi ? "हाँ" : "Yes", color: T.green,   bg: T.greenDim },
          { v: false, l: hi ? "नहीं" : "No", color: T.error,   bg: T.errorDim },
        ].map(o => (
          <button key={String(o.v)} onClick={() => onChange(o.v)} style={{
            padding: "5px 14px", borderRadius: 20,
            border: `2px solid ${value === o.v ? o.color : T.border}`,
            background: value === o.v ? o.bg : T.white,
            color: value === o.v ? o.color : T.muted,
            fontFamily: font.mono, fontSize: 11, fontWeight: 700,
            cursor: "pointer", transition: "all 0.18s",
          }}>{o.l}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Urgent banner */}
      <div style={{
        background: T.saffronDim,
        padding: "14px 16px",
        borderBottom: `1px solid ${T.saffron}40`,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>🔔</span>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, color: T.saffron, marginBottom: 3 }}>
            {hi ? "Technician ने काम पूरा किया — Review करें" : "Technician marked work complete — Review now"}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>
            {hi ? `${work.techName} ने ${work.timestamps.technicianCompletedAt} को complete mark किया।` : `${work.techName} marked complete at ${work.timestamps.technicianCompletedAt}.`}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>

        {/* Proof photo */}
        <Card className="fade-up" style={{ marginBottom: 14, border: `2px solid ${photoViewed ? T.green : T.saffron}` }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "PROOF PHOTO" : "PROOF PHOTO"}</SectionLabel>
            {!photoViewed ? (
              <>
                {/* Blurred placeholder */}
                <div style={{
                  height: 160, borderRadius: 12, marginBottom: 10,
                  background: "linear-gradient(135deg, #ddd 0%, #ccc 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    backdropFilter: "blur(12px)",
                    background: "rgba(245,240,232,0.6)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 36 }}>📷</span>
                    <div style={{ fontFamily: font.mono, fontSize: 11, color: T.muted, fontWeight: 700 }}>
                      {hi ? "TAP TO VIEW PROOF PHOTO" : "TAP TO VIEW PROOF PHOTO"}
                    </div>
                  </div>
                </div>
                <button onClick={() => setPhotoViewed(true)} style={{
                  width: "100%", padding: "12px",
                  borderRadius: 50, border: "none",
                  background: T.saffron, color: T.white,
                  fontFamily: font.display, fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: `0 4px 16px ${T.saffron}40`,
                }}>
                  📷 {hi ? "Proof Photo देखें" : "View Proof Photo"}
                </button>
              </>
            ) : (
              <>
                {/* "Viewed" state */}
                <div style={{
                  height: 160, borderRadius: 12, marginBottom: 10,
                  background: "linear-gradient(135deg, #c8d8b8, #a8c898)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative",
                }}>
                  {/* Simulated photo content */}
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 48 }}>🖼️</div>
                    <div style={{ fontFamily: font.mono, fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 6 }}>
                      PROOF_PHOTO.jpg · Uploaded {work.timestamps.technicianCompletedAt}
                    </div>
                  </div>
                  <div style={{
                    position: "absolute", top: 8, right: 8,
                    background: T.green, color: T.white,
                    fontFamily: font.mono, fontSize: 10, fontWeight: 700,
                    padding: "3px 10px", borderRadius: 10, letterSpacing: "0.06em",
                  }}>VIEWED ✓</div>
                </div>
                <div style={{
                  background: T.greenDim, borderRadius: 10,
                  padding: "10px 12px",
                  fontSize: 12, color: T.green, lineHeight: 1.55,
                }}>
                  {hi
                    ? "ℹ️ यह photo accept/close करने के बाद server से delete हो जाएगी। ज्यादा proof के लिए technician को WhatsApp करें।"
                    : "ℹ️ This photo will be deleted from server after you close this work. For more proof, WhatsApp the technician."}
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Summary */}
        <Card className="fade-up-1" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "WORK SUMMARY" : "WORK SUMMARY"}</SectionLabel>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: `linear-gradient(135deg, ${T.saffron}, #c45a08)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.display, fontSize: 17, fontWeight: 800, color: T.white,
                flexShrink: 0,
              }}>{work.techName[0]}</div>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700 }}>{work.techName}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{work.workType} · {work.siteClientName}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <SectionLabel>CHARGE</SectionLabel>
                <div style={{ fontFamily: font.mono, fontSize: 16, fontWeight: 700, color: T.green }}>₹{work.agreedCharge}</div>
              </div>
              <div>
                <SectionLabel>{hi ? "DURATION" : "DURATION"}</SectionLabel>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {work.timestamps.workStartedAt} → {work.timestamps.technicianCompletedAt}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Rating */}
        <Card className="fade-up-2" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "TECHNICIAN को RATE करें (जरूरी)" : "RATE THE TECHNICIAN (REQUIRED)"}</SectionLabel>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: T.muted, marginBottom: 10 }}>
                {hi ? "Overall Rating" : "Overall Rating"}
              </div>
              <StarPicker value={stars} onChange={setStars} size={36} />
              {stars > 0 && (
                <div style={{ marginTop: 8, fontFamily: font.mono, fontSize: 12, color: T.saffron, fontWeight: 700 }}>
                  {["","⭐ Poor","⭐⭐ Fair","⭐⭐⭐ Good","⭐⭐⭐⭐ Very Good","⭐⭐⭐⭐⭐ Excellent"][stars]}
                </div>
              )}
            </div>

            <Divider />
            <div style={{ marginTop: 14 }}>
              <BoolToggle label={hi ? "समय पर पहुंचा?" : "Reached on time?"} value={reachedOnTime} onChange={setReachedOnTime} />
              <BoolToggle label={hi ? "Skill सही था?" : "Skill matched?"} value={skillMatch} onChange={setSkillMatch} />
              <BoolToggle label={hi ? "काम पूरा हुआ?" : "Work fully completed?"} value={workCompleted} onChange={setWorkCompleted} />
              <BoolToggle label={hi ? "Behaviour अच्छा था?" : "Behaviour was good?"} value={behaviourGood} onChange={setBehaviourGood} />
            </div>

            <div style={{ marginTop: 4 }}>
              <SectionLabel>{hi ? "COMMENT (OPTIONAL)" : "COMMENT (OPTIONAL)"}</SectionLabel>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder={hi ? "Additional comments…" : "Additional comments…"}
                rows={2}
                style={{
                  width: "100%", padding: "11px 14px",
                  border: `2px solid ${comment ? T.sky : T.border}`,
                  borderRadius: 10, outline: "none",
                  fontFamily: font.body, fontSize: 13, color: T.ink,
                  background: T.white, resize: "none", lineHeight: 1.5,
                }}
              />
            </div>
          </div>
        </Card>

        {/* Payment reminder */}
        <div className="fade-up-3" style={{
          background: T.warnDim, borderRadius: 12,
          padding: "12px 14px", marginBottom: 16,
          border: `1px solid ${T.warn}40`,
          fontSize: 13, color: T.warn, lineHeight: 1.6,
        }}>
          💰 {hi
            ? `Payment directly ${work.paymentBy} द्वारा technician को — ₹${work.agreedCharge} (${work.paymentMode}). App कोई payment collect नहीं करता।`
            : `Payment directly by ${work.paymentBy} to technician — ₹${work.agreedCharge} (${work.paymentMode}). App collects no payment.`}
        </div>

        {/* Close button */}
        {closing ? (
          <div style={{
            width: "100%", padding: "15px",
            borderRadius: 50, background: T.green,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            color: T.white, fontFamily: font.display, fontSize: 16, fontWeight: 700,
          }}>
            <div style={{ width: 18, height: 18, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: T.white, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
            {hi ? "Closing…" : "Closing…"}
          </div>
        ) : (
          <button onClick={handleClose} disabled={!canClose} style={{
            width: "100%", padding: "15px",
            borderRadius: 50, border: "none",
            background: canClose ? T.green : T.border,
            color: T.white,
            fontFamily: font.display, fontSize: 16, fontWeight: 700,
            cursor: canClose ? "pointer" : "not-allowed",
            boxShadow: canClose ? `0 4px 20px ${T.green}50` : "none",
            marginBottom: 8, transition: "all 0.2s",
          }}>
            ✓ {hi ? "Site Work Close करें" : "Close Site Work"}
          </button>
        )}

        {!canClose && (
          <p style={{ textAlign: "center", fontSize: 12, color: T.muted, fontFamily: font.mono, marginBottom: 8 }}>
            {hi ? "Photo देखें और rating दें — then close करें" : "View proof photo and give rating to close"}
          </p>
        )}

        {/* Issue report */}
        <button style={{
          width: "100%", padding: "11px",
          borderRadius: 50, border: `1px solid ${T.error}40`,
          background: T.errorDim, color: T.error,
          fontFamily: font.display, fontSize: 13, fontWeight: 700,
          cursor: "pointer", marginBottom: 24,
        }}>
          ⚠️ {hi ? "Issue Report करें" : "Report an Issue"}
        </button>
      </div>
    </div>
  );
};

// ─── VIEW: CLOSED WORK ────────────────────────────────────────────
const ClosedView = ({ work, lang }) => {
  const hi = lang === "hi";
  const r = work.ratingGiven;

  return (
    <div>
      <div style={{
        background: T.greenDim, padding: "14px 16px",
        borderBottom: `1px solid ${T.green}30`,
        display: "flex", gap: 10, alignItems: "center",
      }}>
        <span style={{ fontSize: 22 }}>✅</span>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, color: T.green }}>
            {hi ? "Site Work Closed" : "Site Work Closed"}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>
            {work.timestamps.siClosedAt}
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <Tag label={hi ? "CLOSED" : "CLOSED"} color="green" />
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Rating summary */}
        {r && (
          <Card className="fade-up" style={{ marginBottom: 14 }}>
            <div style={{ padding: "14px 16px" }}>
              <SectionLabel>{hi ? "RATING GIVEN" : "RATING GIVEN"}</SectionLabel>
              <div style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                  {[1,2,3,4,5].map(n => (
                    <span key={n} style={{ fontSize: 28, color: n <= r.stars ? "#f5a623" : T.border }}>★</span>
                  ))}
                </div>
                <div style={{ fontFamily: font.mono, fontSize: 12, color: T.saffron, fontWeight: 700 }}>
                  {["","Poor","Fair","Good","Very Good","Excellent"][r.stars].toUpperCase()}
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { v: r.reachedOnTime,  l: hi ? "On-time" : "On-time" },
                  { v: r.skillMatch,     l: hi ? "Skill Match" : "Skill Match" },
                  { v: r.workCompleted,  l: hi ? "Work Done" : "Work Done" },
                  { v: r.behaviourGood,  l: hi ? "Good Behaviour" : "Behaviour" },
                ].map(b => (
                  <span key={b.l} style={{
                    padding: "4px 12px", borderRadius: 20,
                    background: b.v ? T.greenDim : T.errorDim,
                    color: b.v ? T.green : T.error,
                    fontFamily: font.mono, fontSize: 10, fontWeight: 700,
                  }}>
                    {b.v ? "✓" : "✗"} {b.l}
                  </span>
                ))}
              </div>
              {r.comment && (
                <div style={{ marginTop: 10, fontSize: 13, color: T.muted, fontStyle: "italic" }}>
                  "{r.comment}"
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Work details */}
        <Card className="fade-up-1" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "WORK DETAILS" : "WORK DETAILS"}</SectionLabel>
            <InfoRow label={hi ? "TECHNICIAN" : "TECHNICIAN"} value={work.techName} />
            <Divider />
            <div style={{ marginTop: 12 }}>
              <InfoRow label={hi ? "CLIENT" : "CLIENT"} value={work.siteClientName} />
            </div>
            <Divider />
            <div style={{ marginTop: 12 }}>
              <InfoRow label="WORK TYPE" value={work.workType} />
            </div>
            <Divider />
            <div style={{ marginTop: 12, display: "flex", gap: 24 }}>
              <div>
                <SectionLabel>CHARGE</SectionLabel>
                <div style={{ fontFamily: font.mono, fontSize: 16, fontWeight: 700, color: T.green }}>₹{work.agreedCharge}</div>
              </div>
              <div>
                <SectionLabel>PAYMENT</SectionLabel>
                <div style={{ fontSize: 13 }}>{work.paymentMode} · {work.paymentBy}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Proof deleted note */}
        <div className="fade-up-2" style={{
          background: T.paper, borderRadius: 12,
          padding: "12px 14px", marginBottom: 14,
          border: `1px solid ${T.border}`,
          fontSize: 12, color: T.muted, lineHeight: 1.6,
          display: "flex", gap: 8, alignItems: "flex-start",
        }}>
          <span style={{ fontSize: 16 }}>🗑️</span>
          <span>
            {hi
              ? "Proof photo server से delete हो गई। Only metadata stored है।"
              : "Proof photo has been deleted from server. Only metadata is retained."}
          </span>
        </div>

        {/* Full timeline */}
        <Card className="fade-up-3" style={{ marginBottom: 24 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "FULL TIMELINE" : "FULL TIMELINE"}</SectionLabel>
            <Timeline timestamps={work.timestamps} status={work.status} />
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── VIEW: TECHNICIAN PENDING ─────────────────────────────────────
const TechPendingView = ({ work, lang, onAccept, onReject }) => {
  const hi = lang === "hi";
  const [accepted, setAccepted] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  if (accepted === true) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <div className="pop-in" style={{
          width: 80, height: 80, borderRadius: "50%",
          background: T.greenDim, border: `3px solid ${T.green}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 36,
        }}>✅</div>
        <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
          {hi ? "काम Accept कर लिया!" : "Work Accepted!"}
        </h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 20 }}>
          {hi
            ? `${work.siName} को notify कर दिया गया। Site पर जाने के लिए तैयार हो जाएं।`
            : `${work.siName} has been notified. Get ready to travel to the site.`}
        </p>
        <div style={{
          background: T.saffronDim, borderRadius: 12,
          padding: "12px 14px", marginBottom: 20,
          fontSize: 13, color: "#7a4a1a", lineHeight: 1.6,
          textAlign: "left",
        }}>
          📍 {work.siteAddress}
        </div>
        <a href={`https://maps.google.com/?q=${encodeURIComponent(work.siteAddress)}`} target="_blank" rel="noreferrer" style={{
          display: "block", width: "100%", padding: "13px",
          borderRadius: 50, border: "none",
          background: T.sky, color: T.white,
          fontFamily: font.display, fontSize: 15, fontWeight: 700,
          textDecoration: "none", textAlign: "center",
          boxShadow: `0 4px 16px ${T.sky}40`,
        }}>
          🗺️ {hi ? "Google Maps में खोलें" : "Open in Google Maps"}
        </a>
      </div>
    );
  }

  if (accepted === false) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: T.errorDim, border: `3px solid ${T.error}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 36,
        }}>✕</div>
        <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
          {hi ? "काम Reject कर दिया" : "Work Rejected"}
        </h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65 }}>
          {hi ? `${work.siName} को notify कर दिया गया।` : `${work.siName} has been notified.`}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Incoming banner */}
      <div style={{
        background: T.saffronDim, padding: "14px 16px",
        borderBottom: `1px solid ${T.saffron}40`,
        display: "flex", gap: 10, alignItems: "center",
      }}>
        <div style={{
          width: 10, height: 10, borderRadius: "50%",
          background: T.saffron,
          animation: "pulse 1.4s ease-in-out infinite",
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, color: T.saffron }}>
            {hi ? "नया Site Work Request!" : "New Site Work Request!"}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>
            {hi ? `${work.siName} · ${work.timestamps.assignedAt}` : `${work.siName} · ${work.timestamps.assignedAt}`}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* SI info */}
        <Card className="fade-up" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>SI / CONTRACTOR</SectionLabel>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700 }}>{work.siName}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{work.siCity}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={{ width:38,height:38,borderRadius:"50%",background:T.greenDim,border:`1px solid ${T.green}30`,fontSize:18,cursor:"pointer" }}>📞</button>
                <button style={{ width:38,height:38,borderRadius:"50%",background:"#e6f9f0",border:"1px solid #1a7a3a30",fontSize:18,cursor:"pointer" }}>💬</button>
              </div>
            </div>
            <div style={{ background: T.saffronDim, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#7a4a1a", lineHeight: 1.6 }}>
              💡 {hi ? "Accept करने से पहले SI से call/WhatsApp करके work scope, charges, और time confirm करें।" : "Before accepting, call/WhatsApp SI to confirm work scope, charges, and time."}
            </div>
          </div>
        </Card>

        {/* Work details */}
        <Card className="fade-up-1" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "WORK DETAILS" : "WORK DETAILS"}</SectionLabel>
            {[
              { l: hi?"WORK TYPE":"WORK TYPE",         v: work.workType },
              { l: hi?"SITE ADDRESS":"SITE ADDRESS",   v: `📍 ${work.siteAddress} · ${work.distanceKm} km` },
              { l: hi?"DESCRIPTION":"DESCRIPTION",     v: work.description },
              { l: hi?"VISIT TIME":"VISIT TIME",       v: `⏰ ${work.preferredTime}` },
              { l: hi?"CHARGE":"CHARGE",               v: `₹${work.agreedCharge} · ${work.paymentMode} · By ${work.paymentBy}` },
              { l: hi?"MATERIAL":"MATERIAL",           v: work.materialIncluded === "YES" ? "✅ Included" : "❌ Not included" },
            ].map((r, i) => (
              <div key={r.l}>
                {i > 0 && <Divider />}
                <div style={{ marginTop: i > 0 ? 12 : 0, marginBottom: i < 5 ? 12 : 0 }}>
                  <InfoRow label={r.l} value={r.v} valueStyle={r.l === "DESCRIPTION" ? { color: T.muted, fontSize: 13 } : {}} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* T&C confirmation */}
        <button onClick={() => setConfirmed(!confirmed)} style={{
          width: "100%", padding: "14px 16px",
          borderRadius: 12, border: `2px solid ${confirmed ? T.green : T.border}`,
          background: confirmed ? T.greenDim : T.white,
          display: "flex", alignItems: "flex-start", gap: 12,
          cursor: "pointer", marginBottom: 16, textAlign: "left",
          transition: "all 0.2s",
        }}>
          <div style={{
            width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
            border: `2px solid ${confirmed ? T.green : T.border}`,
            background: confirmed ? T.green : T.white,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s",
          }}>
            {confirmed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span style={{ fontSize: 13, color: T.ink, lineHeight: 1.6, fontFamily: font.body }}>
            {hi
              ? "मैं यह Site Work accept करता/करती हूँ। Payment directly SI/Client से मिलेगी। Platform payment collect, guarantee, या settle नहीं करता।"
              : "I accept this Site Work. Payment will be received directly from SI/Client. Platform does not collect, guarantee, or settle payment."}
          </span>
        </button>

        {/* Accept / Reject */}
        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <button onClick={() => confirmed && setAccepted(true)} style={{
            flex: 1, padding: "15px",
            borderRadius: 50, border: "none",
            background: confirmed ? T.green : T.border, color: T.white,
            fontFamily: font.display, fontSize: 15, fontWeight: 700,
            cursor: confirmed ? "pointer" : "not-allowed",
            boxShadow: confirmed ? `0 4px 16px ${T.green}40` : "none",
            transition: "all 0.2s",
          }}>
            ✓ {hi ? "काम स्वीकार करें" : "Accept Work"}
          </button>
          <button onClick={() => setAccepted(false)} style={{
            flex: 1, padding: "15px",
            borderRadius: 50, border: `1px solid ${T.border}`,
            background: T.white, color: T.error,
            fontFamily: font.display, fontSize: 15, fontWeight: 700, cursor: "pointer",
          }}>
            ✕ {hi ? "अस्वीकार" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CLOSED SUCCESS ANIMATION ─────────────────────────────────────
const ClosedSuccess = ({ work, lang, onDone }) => {
  const hi = lang === "hi";
  const confettiColors = [T.saffron, T.green, T.sky, "#f5a623", T.greenLight];

  return (
    <div style={{ padding: "40px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {/* Confetti particles */}
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${10 + (i * 7.5)}%`,
          top: `${10 + (i % 3) * 8}%`,
          width: 8, height: 8,
          borderRadius: i % 2 === 0 ? "50%" : 2,
          background: confettiColors[i % confettiColors.length],
          animation: `confetti ${1 + (i * 0.15)}s ${i * 0.1}s ease-out both`,
        }} />
      ))}

      <div className="pop-in" style={{
        width: 90, height: 90, borderRadius: "50%",
        background: T.greenDim, border: `4px solid ${T.green}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px", fontSize: 42,
      }}>🎉</div>

      <h2 style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, marginBottom: 8 }}>
        {hi ? "Site Work बंद हो गया!" : "Site Work Closed!"}
      </h2>
      <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 8 }}>
        {hi
          ? `${work.techName} का trust score update हो गया।`
          : `${work.techName}'s trust score has been updated.`}
      </p>
      <p style={{ fontSize: 12, color: T.muted, marginBottom: 28, fontFamily: font.mono }}>
        {hi ? "PROOF PHOTO DELETED FROM SERVER ✓" : "PROOF PHOTO DELETED FROM SERVER ✓"}
      </p>

      {/* Trust update */}
      <div style={{
        background: T.greenDim, borderRadius: 14,
        padding: "16px", marginBottom: 20,
        border: `1px solid ${T.green}30`,
        textAlign: "left",
      }}>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: T.green, letterSpacing: "0.1em", marginBottom: 10 }}>
          TRUST UPDATED
        </div>
        {[
          { l: hi ? "Completed Site Work" : "Completed Site Work", v: "+1 → 19" },
          { l: hi ? "Unique SIs" : "Unique SIs",                  v: "5 (unchanged)" },
          { l: hi ? "Avg Rating" : "Avg Rating",                  v: "4.6 ★ (updated)" },
        ].map(s => (
          <div key={s.l} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: T.ink }}>{s.l}</span>
            <span style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.green }}>{s.v}</span>
          </div>
        ))}
      </div>

      <button onClick={onDone} style={{
        width: "100%", padding: "15px",
        borderRadius: 50, border: "none",
        background: T.sky, color: T.white,
        fontFamily: font.display, fontSize: 16, fontWeight: 700, cursor: "pointer",
        boxShadow: `0 4px 20px ${T.sky}50`,
      }}>
        {hi ? "My Works पर जाएं" : "Go to My Works"}
      </button>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────
const DEMO_MODES = [
  { id: "COMPLETED", label: "SI: Review & Close",     sub: "Proof photo + rating + close flow" },
  { id: "ACCEPTED",  label: "SI: Active Work",         sub: "Accepted, tracking technician" },
  { id: "CLOSED",    label: "SI: Closed Work",         sub: "Fully closed with rating history" },
  { id: "TECH_PENDING", label: "Tech: Incoming Work",  sub: "Accept / reject flow" },
];

export default function SiteWorkDetail() {
  const [lang,     setLang]     = useState("hi");
  const [mode,     setMode]     = useState("COMPLETED");
  const [closed,   setClosed]   = useState(false);

  const work = WORK_STATES[mode];
  const hi = lang === "hi";

  const renderBody = () => {
    if (closed) return <ClosedSuccess work={WORK_STATES.COMPLETED} lang={lang} onDone={() => setClosed(false)} />;

    switch (mode) {
      case "COMPLETED":    return <SIReviewClose  work={work} lang={lang} onClose={() => setClosed(true)} />;
      case "ACCEPTED":     return <SIActiveView   work={work} lang={lang} />;
      case "CLOSED":       return <ClosedView     work={work} lang={lang} />;
      case "TECH_PENDING": return <TechPendingView work={work} lang={lang} />;
      default:             return null;
    }
  };

  const st = STATUS_CFG[closed ? "CLOSED" : work.status];

  return (
    <>
      <Fonts />
      <div style={{ minHeight: "100vh", background: T.paper, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Top bar */}
        <div style={{
          width: "100%", maxWidth: 420,
          background: T.paper, borderBottom: `1px solid ${T.border}`,
          position: "sticky", top: 0, zIndex: 40,
        }}>
          {/* Nav row */}
          <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:font.body,fontSize:14,color:T.muted }}>
              ← {hi?"वापस":"Back"}
            </button>
            <div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.08em" }}>
              SITE WORK DETAIL
            </div>
            <div style={{ display:"flex",gap:2,background:T.white,border:`1px solid ${T.border}`,borderRadius:20,padding:3 }}>
              {["hi","en"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{
                  padding:"3px 10px",borderRadius:14,border:"none",
                  background:lang===l?T.saffron:"transparent",
                  color:lang===l?T.white:T.muted,
                  fontFamily:font.mono,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.2s",
                }}>{l==="hi"?"हि":"EN"}</button>
              ))}
            </div>
          </div>

          {/* Work header */}
          {!closed && (
            <div style={{ padding: "0 16px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, lineHeight: 1.25, marginBottom: 4 }}>
                    {work.workType}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted }}>
                    {work.siteClientName} · {work.siteAddress.split(",")[0]}
                  </div>
                </div>
                <Tag label={hi ? st.hi : st.en} color={st.color} />
              </div>
              <div style={{ fontFamily: font.mono, fontSize: 11, color: T.muted, marginTop: 6 }}>
                #{work.id} · {work.perspective === "SI" ? `SI: ${work.siName}` : `Tech: ${work.techName}`}
              </div>
            </div>
          )}
        </div>

        {/* Demo mode switcher */}
        <div style={{
          width: "100%", maxWidth: 420,
          background: T.ink, padding: "10px 12px",
          display: "flex", gap: 6, overflowX: "auto",
        }}>
          {DEMO_MODES.map(d => (
            <button key={d.id} onClick={() => { setMode(d.id); setClosed(false); }} style={{
              flexShrink: 0, padding: "7px 12px", borderRadius: 10,
              border: `1px solid ${mode === d.id ? T.saffronLight : "rgba(255,255,255,0.15)"}`,
              background: mode === d.id ? T.saffron : "rgba(255,255,255,0.07)",
              cursor: "pointer", textAlign: "left",
            }}>
              <div style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 700, color: mode === d.id ? T.white : "rgba(255,255,255,0.7)", whiteSpace: "nowrap" }}>
                {d.label}
              </div>
              <div style={{ fontFamily: font.mono, fontSize: 9, color: mode === d.id ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.4)", marginTop: 2, whiteSpace: "nowrap" }}>
                {d.sub}
              </div>
            </button>
          ))}
        </div>

        {/* Page body */}
        <div style={{ width: "100%", maxWidth: 420, flex: 1 }}>
          {renderBody()}
        </div>
      </div>
    </>
  );
}
