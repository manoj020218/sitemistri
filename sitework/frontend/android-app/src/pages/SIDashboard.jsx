import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
const API_URL = import.meta.env.VITE_API_URL || "";

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
  skyLight: "#2471c8",
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
    @keyframes fadeUp   { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
    @keyframes slideUp  { from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);} }
    @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1);}50%{opacity:.4;transform:scale(.7);} }
    @keyframes ping     { 0%{transform:scale(1);opacity:.8;}100%{transform:scale(2.2);opacity:0;} }
    @keyframes spin     { to{transform:rotate(360deg);} }
    @keyframes shimmer  { 0%{background-position:-400px 0;}100%{background-position:400px 0;} }
    .fade-up   { animation: fadeUp  .35s ease both; }
    .fade-up-1 { animation: fadeUp  .35s .05s ease both; }
    .fade-up-2 { animation: fadeUp  .35s .10s ease both; }
    .fade-up-3 { animation: fadeUp  .35s .15s ease both; }
    .fade-up-4 { animation: fadeUp  .35s .20s ease both; }
    .fade-up-5 { animation: fadeUp  .35s .25s ease both; }
    .slide-up  { animation: slideUp .32s ease both; }
    .shimmer   {
      background: linear-gradient(90deg, #f0ebe0 25%, #e8e3d8 50%, #f0ebe0 75%);
      background-size: 400px 100%;
      animation: shimmer 1.4s infinite;
    }
  `}</style>
);

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
    <div style={{ width:32, height:32, border:`3px solid ${T.border}`, borderTopColor:T.sky, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
  </div>
);

const SI_SERVICE_CATS = [
  { id:"CCTV_SURVEILLANCE",   l:"CCTV Surveillance" },
  { id:"ACCESS_CONTROL",      l:"Access Control" },
  { id:"NETWORKING",          l:"Networking / LAN" },
  { id:"FIRE_ALARM",          l:"Fire Alarm" },
  { id:"BIOMETRIC",           l:"Biometric" },
  { id:"HOME_AUTOMATION",     l:"Home Automation" },
  { id:"VIDEO_DOOR_PHONE",    l:"Video Door Phone" },
  { id:"SOLAR_SECURITY",      l:"Solar + Security" },
  { id:"IP_SURVEILLANCE",     l:"IP Surveillance" },
  { id:"INTERCOM",            l:"Intercom" },
  { id:"WIFI_NETWORKING",     l:"WiFi Networking" },
  { id:"AMC_SERVICES",        l:"AMC Services" },
];

const WORK_TYPES = [
  { id: "NEW_INSTALL",    e: "🔧", hi: "नई Installation",    en: "New Installation" },
  { id: "MAINTENANCE",   e: "🛠",  hi: "Maintenance",        en: "Maintenance" },
  { id: "SERVICE_REPAIR",e: "🔨", hi: "Service / Repair",    en: "Service / Repair" },
  { id: "DVR_NVR",       e: "💾", hi: "DVR/NVR Setup",       en: "DVR/NVR Setup" },
  { id: "IP_CAMERA",     e: "🌐", hi: "IP Camera Config",    en: "IP Camera Config" },
  { id: "LAN_CABLING",   e: "🔌", hi: "LAN / Cabling",       en: "LAN / Cabling" },
  { id: "CAMERA_ANGLE",  e: "📐", hi: "Camera Angle",        en: "Camera Angle" },
  { id: "HDD_ISSUE",     e: "💿", hi: "HDD / Recording",     en: "HDD / Recording" },
  { id: "AMC_VISIT",     e: "📅", hi: "AMC Visit",           en: "AMC Visit" },
  { id: "EMERGENCY",     e: "🚨", hi: "Emergency Visit",     en: "Emergency Visit" },
  { id: "SITE_SURVEY",   e: "📍", hi: "Site Survey",         en: "Site Survey" },
  { id: "OTHER",         e: "📋", hi: "अन्य काम",            en: "Other Work" },
];


// ─── SKILL / TECH HELPERS ─────────────────────────────────────────
const SKILL_ID_MAP = {
  "CCTV":"CCTV_INSTALLATION", "IP Camera":"IP_CAMERA", "DVR/NVR":"DVR_NVR",
  "LAN Cabling":"LAN_CABLING", "WiFi Bridge":"WIFI_BRIDGE",
  "Biometric":"BIOMETRIC", "Access Control":"ACCESS_CONTROL", "Networking":"NETWORKING",
};
const SKILL_LABEL = {
  CCTV_INSTALLATION:"CCTV", IP_CAMERA:"IP Cam", DVR_NVR:"DVR/NVR",
  LAN_CABLING:"LAN", WIFI_BRIDGE:"WiFi", BIOMETRIC:"Biometric",
  ACCESS_CONTROL:"Access Ctrl", NETWORKING:"Networking", EDGEYE:"EdgEye",
  CAMERA_SERVICE:"Camera Svc",
};
const VEHICLE_EMOJI = { BIKE:"🏍", SCOOTER:"🛵", CAR:"🚗", NONE:"🚶" };
const EXP_LABEL = { NEW:"नया", "1_PLUS":"1-2 yr", "3_PLUS":"3-4 yr", "5_PLUS":"5-9 yr", "10_PLUS":"10+ yr" };

const normalizeTech = (t) => {
  const mins = t.currentLocation?.updatedAt
    ? Math.floor((Date.now() - new Date(t.currentLocation.updatedAt)) / 60000)
    : null;
  const locationAge = mins === null ? "–"
    : mins < 2 ? "अभी"
    : mins < 60 ? `${mins} min पहले`
    : `${Math.floor(mins/60)} घंटा पहले`;
  return {
    ...t,
    name: t.user?.name || t.name || "Technician",
    skills: (t.skills || []).map(s => SKILL_LABEL[s] || s),
    vehicle: VEHICLE_EMOJI[t.vehicle] || "🚶",
    experience: EXP_LABEL[t.experienceLevel] || "–",
    completedWork: t.trustStats?.completedSiteWork || 0,
    uniqueSIs: t.trustStats?.uniqueSIs || 0,
    avgRating: t.trustStats?.averageRating > 0 ? t.trustStats.averageRating.toFixed(1) : "–",
    openWork: t.trustStats?.overdueOpenWork || 0,
    distanceKm: typeof t.distanceKm === "number" ? t.distanceKm.toFixed(1) : "?",
    locationAge,
    techUserId: t.userId,
  };
};

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

const Tag = ({ label, color = "sky" }) => {
  const c = {
    sky:     { bg: T.skyDim,     text: T.sky },
    saffron: { bg: T.saffronDim, text: T.saffron },
    green:   { bg: T.greenDim,   text: T.green },
    ink:     { bg: "#e8e4dc",    text: T.ink },
    warn:    { bg: T.warnDim,    text: T.warn },
    error:   { bg: T.errorDim,   text: T.error },
  }[color] || { bg: T.skyDim, text: T.sky };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      background: c.bg, color: c.text,
      fontFamily: font.mono, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>{label}</span>
  );
};

const Stars = ({ n }) => (
  <span style={{ color: "#f5a623", fontSize: 13 }}>
    {"★".repeat(Math.round(n))}{"☆".repeat(5 - Math.round(n))}
  </span>
);

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

const STATUS_MAP = {
  DRAFT:               { hi: "Draft",             en: "Draft",           color: "ink" },
  PENDING_ACCEPTANCE:  { hi: "Pending",           en: "Pending",         color: "warn" },
  ACCEPTED:            { hi: "Accepted",          en: "Accepted",        color: "sky" },
  REJECTED:            { hi: "Rejected",          en: "Rejected",        color: "error" },
  ON_THE_WAY:          { hi: "On The Way",        en: "On The Way",      color: "sky" },
  REACHED:             { hi: "Site पर पहुंचा",   en: "Reached",         color: "sky" },
  WORK_STARTED:        { hi: "काम शुरू",          en: "Work Started",    color: "saffron" },
  COMPLETED:           { hi: "Complete — Review", en: "Complete—Review", color: "saffron" },
  CLOSED:              { hi: "Closed",            en: "Closed",          color: "green" },
  CANCELLED:           { hi: "Cancelled",         en: "Cancelled",       color: "error" },
};

// ─── SCREEN: HOME ─────────────────────────────────────────────────
const HomeScreen = ({ user, siProfile, siteWorks, lang, setScreen }) => {
  const hi = lang === "hi";
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "S";
  const photoSrc = siProfile?.customPhotoUrl ? `${API_URL}${siProfile.customPhotoUrl}` : user?.photoUrl;

  const pendingReview = siteWorks.filter(w => w.status === "COMPLETED_BY_TECH").length;
  const active  = siteWorks.filter(w => ["ACCEPTED","ON_THE_WAY","REACHED","WORK_STARTED"].includes(w.status)).length;
  const closed  = siteWorks.filter(w => w.status === "CLOSED").length;
  const recent  = siteWorks.slice(0, 3);

  return (
    <div>
      {/* HEADER */}
      <div style={{ padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.1em", marginBottom: 2 }}>
              {hi ? "नमस्ते," : "HELLO,"}
            </div>
            <div style={{ fontFamily: font.display, fontSize: 20, fontWeight: 800 }}>{user?.name || "SI"} 👋</div>
            {siProfile?.businessName && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{siProfile.businessName}</div>}
          </div>
          <button onClick={() => setScreen("profile")} style={{ background:"none", border:"none", cursor:"pointer", padding:0 }}>
            {photoSrc
              ? <img src={photoSrc} alt="" style={{ width:42, height:42, borderRadius:"50%", objectFit:"cover", border:`2px solid ${T.border}` }} />
              : <div style={{ width:42, height:42, borderRadius:"50%", background:`linear-gradient(135deg,${T.sky},#0f4080)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:font.display, fontSize:16, fontWeight:800, color:T.white }}>{initials}</div>
            }
          </button>
        </div>

        {/* MAIN ACTION */}
        <button onClick={() => setScreen("search")} className="fade-up" style={{
          width: "100%", padding: "18px 20px", borderRadius: 16, border: "none",
          background: `linear-gradient(135deg, ${T.sky}, #0f4080)`,
          cursor: "pointer", textAlign: "left", marginBottom: 16,
          boxShadow: `0 6px 28px ${T.sky}45`, position: "relative", overflow: "hidden",
        }}>
          <div style={{ position:"absolute", right:-20, top:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.07)" }} />
          <div style={{ fontFamily:font.mono, fontSize:10, color:"rgba(255,255,255,0.6)", letterSpacing:"0.1em", marginBottom:8 }}>SEARCH</div>
          <div style={{ fontFamily:font.display, fontSize:18, fontWeight:800, color:T.white, marginBottom:6, lineHeight:1.3 }}>
            {hi ? "Client Site के पास Technician खोजें" : "Find Technician Near Client Site"}
          </div>
          <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)" }}>
            📍 {hi ? "Location डालें और search करें →" : "Enter location and search →"}
          </div>
        </button>

        {/* QUICK STATS */}
        <div className="fade-up-1" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:16 }}>
          {[
            { e:"⚡", v:active,        l:hi?"Active":"Active",         color:T.sky },
            { e:"⏳", v:pendingReview, l:hi?"Review बाकी":"Review",    color:T.saffron },
            { e:"✅", v:closed,        l:hi?"Closed":"Closed",         color:T.green },
          ].map(s => (
            <Card key={s.l} style={{ textAlign:"center", padding:"14px 8px" }}>
              <div style={{ fontSize:20, marginBottom:3 }}>{s.e}</div>
              <div style={{ fontFamily:font.mono, fontSize:20, fontWeight:700, color:s.color, lineHeight:1 }}>{s.v}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:3, lineHeight:1.3 }}>{s.l}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* PENDING REVIEW ALERT */}
      {pendingReview > 0 && (
        <div style={{ padding:"0 16px 12px" }}>
          <button onClick={() => setScreen("my-works")} style={{
            width:"100%", padding:"13px 16px", borderRadius:12,
            border:`1px solid ${T.saffron}50`, background:T.saffronDim, cursor:"pointer",
            display:"flex", alignItems:"center", gap:10, textAlign:"left",
          }}>
            <span style={{ fontSize:20 }}>🔔</span>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:font.display, fontSize:14, fontWeight:700, color:T.saffron }}>
                {hi ? `${pendingReview} काम Review बाकी है` : `${pendingReview} work pending review`}
              </div>
              <div style={{ fontSize:12, color:T.muted }}>
                {hi ? "Technician ने काम complete mark किया है" : "Technician marked work complete"}
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.saffron} strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      )}

      {/* RECENT WORKS */}
      <div style={{ padding:"0 16px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ fontFamily:font.display, fontSize:16, fontWeight:700 }}>{hi?"हाल के Site Works":"Recent Site Works"}</div>
          <button onClick={() => setScreen("my-works")} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:font.mono, fontSize:11, color:T.sky, fontWeight:700 }}>
            {hi?"सब देखें":"See All"}
          </button>
        </div>
        {recent.length === 0 ? (
          <div style={{ padding:"20px 0", textAlign:"center", color:T.muted, fontSize:14 }}>
            <div style={{ fontSize:36, marginBottom:8 }}>📋</div>
            {hi?"अभी कोई Site Work नहीं।":"No site works yet."}
          </div>
        ) : recent.map((w, i) => {
          const st = STATUS_MAP[w.status] || STATUS_MAP.DRAFT;
          const techName = w.technicianUserId?.name || "Technician";
          return (
            <Card key={w._id||i} className={`fade-up-${i+2}`} style={{ marginBottom:8 }} onClick={() => setScreen("my-works")}>
              <div style={{ padding:"13px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:6 }}>
                  <div>
                    <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700 }}>{techName}</div>
                    <div style={{ fontSize:12, color:T.muted }}>{w.workType} · {w.siteAddress?.slice(0,30)}</div>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:4 }}>
                    <Tag label={hi?st.hi:st.en} color={st.color} />
                    <div style={{ fontFamily:font.mono, fontSize:12, color:T.muted }}>₹{w.agreedVisitCharge||0}</div>
                  </div>
                </div>
                <div style={{ fontSize:11, color:T.muted }}>
                  {new Date(w.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Profile prompt if no profile yet */}
      {!siProfile?.businessName && (
        <div style={{ padding:"0 16px 20px" }}>
          <button onClick={() => setScreen("profile")} style={{
            width:"100%", padding:"16px", borderRadius:14,
            border:`2px dashed ${T.sky}`, background:T.skyDim,
            cursor:"pointer", display:"flex", alignItems:"center", gap:12, textAlign:"left",
          }}>
            <span style={{ fontSize:32 }}>🏢</span>
            <div>
              <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, color:T.sky }}>
                {hi?"Company Profile बनाएं":"Set Up Your Company Profile"}
              </div>
              <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
                {hi?"Visiting card बनाएं, technicians को trust करें →":"Create visiting card, build trust →"}
              </div>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: SEARCH ───────────────────────────────────────────────
const SearchScreen = ({ lang, setScreen, setSelectedTech }) => {
  const hi = lang === "hi";
  const [step, setStep]           = useState("form");
  const [siteAddr, setSiteAddr]   = useState("");
  const [siteCoords, setSiteCoords] = useState(null);
  const [workType, setWorkType]   = useState(null);
  const [radius, setRadius]       = useState(10);
  const [skills, setSkills]       = useState([]);
  const [searching, setSearching] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locErr, setLocErr]       = useState("");
  const [searchErr, setSearchErr] = useState("");
  const [results, setResults]     = useState([]);

  const skillOptions = ["CCTV","IP Camera","DVR/NVR","LAN Cabling","WiFi Bridge","Biometric","Access Control","Networking"];
  const toggle = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) { setLocErr(hi?"Location supported नहीं":"Location not supported"); return; }
    setLocLoading(true); setLocErr("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setSiteCoords({ lat, lng });
        try {
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await r.json();
          setSiteAddr(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } catch {
          setSiteAddr(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setLocLoading(false);
      },
      () => { setLocErr(hi?"Location permission deny किया":"Location access denied"); setLocLoading(false); }
    );
  };

  const handleSearch = async () => {
    setSearching(true); setSearchErr("");
    try {
      let coords = siteCoords;
      if (!coords) {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(siteAddr)}&format=json&limit=1`);
        const data = await r.json();
        if (!data.length) throw new Error(hi?"Address नहीं मिला, ज़्यादा detail डालें":"Address not found — try more detail");
        coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setSiteCoords(coords);
      }
      const r = await api.post("/discovery/nearby", {
        siteLocation: coords,
        radiusKm: radius,
        requiredSkills: skills.map(s => SKILL_ID_MAP[s]).filter(Boolean),
        workType,
      });
      setResults((r?.results || []).map(normalizeTech));
      setStep("results");
    } catch (e) {
      setSearchErr(e?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const canSearch = siteAddr.trim().length > 3 && workType;

  if (step === "results") {
    return (
      <ResultsScreen
        lang={lang}
        setScreen={setScreen}
        setSelectedTech={setSelectedTech}
        onBack={() => setStep("form")}
        siteAddr={siteAddr}
        workType={workType}
        techs={results}
      />
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <button onClick={() => setScreen("home")} style={{
        display:"flex",alignItems:"center",gap:6,
        background:"none",border:"none",cursor:"pointer",
        fontFamily:font.body,fontSize:14,color:T.muted,marginBottom:16,
      }}>← {hi ? "वापस" : "Back"}</button>

      <div style={{ fontFamily: font.mono, fontSize: 11, color: T.sky, letterSpacing: "0.1em", marginBottom: 6 }}>
        {hi ? "TECHNICIAN SEARCH" : "TECHNICIAN SEARCH"}
      </div>
      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
        {hi ? "Client Site Location डालें" : "Enter Client Site Location"}
      </h2>
      <p style={{ fontSize: 13, color: T.muted, marginBottom: 20, lineHeight: 1.55 }}>
        {hi ? "SI की location नहीं — client की location डालें।" : "Not SI office — enter the client's site location."}
      </p>

      {/* Site Location */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
          {hi ? "CLIENT SITE ADDRESS / LOCATION" : "CLIENT SITE ADDRESS / LOCATION"}
        </div>
        <textarea
          value={siteAddr}
          onChange={e => setSiteAddr(e.target.value)}
          placeholder={hi ? "जैसे: Shop No. 12, Vaishali Nagar, Jaipur\nया map पर pin drop करें ↓" : "e.g. Shop 12, Vaishali Nagar, Jaipur\nor drop pin on map ↓"}
          rows={3}
          style={{
            width: "100%", padding: "13px 16px",
            border: `2px solid ${siteAddr ? T.sky : T.border}`,
            borderRadius: 12, outline: "none",
            fontFamily: font.body, fontSize: 14, color: T.ink,
            background: T.white, resize: "none", lineHeight: 1.5,
            transition: "border-color 0.2s",
          }}
        />
        <button onClick={handleUseLocation} disabled={locLoading} style={{
          marginTop: 8, width: "100%", padding: "11px",
          borderRadius: 10, border: `1px solid ${locLoading?T.border:T.sky}`,
          background: T.paper, cursor: locLoading?"not-allowed":"pointer",
          fontFamily: font.display, fontSize: 13, fontWeight: 700, color: T.sky,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          opacity: locLoading ? 0.6 : 1,
        }}>
          {locLoading
            ? <><div style={{ width:14, height:14, border:`2px solid ${T.sky}`, borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }} /> {hi?"Location ढूंढ रहे…":"Getting location…"}</>
            : <>📍 {hi ? "Current Location Use करें" : "Use Current Location"}</>
          }
        </button>
        {locErr && <div style={{ marginTop:6, fontSize:12, color:T.error, fontFamily:font.mono }}>{locErr}</div>}
        {siteCoords && !locErr && <div style={{ marginTop:6, fontSize:11, color:T.green, fontFamily:font.mono }}>✓ {hi?"Location set हो गई":"Location set"}</div>}
      </div>

      {/* Work Type */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", marginBottom: 10 }}>
          {hi ? "WORK TYPE (जरूरी)" : "WORK TYPE (REQUIRED)"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {WORK_TYPES.map(w => (
            <button key={w.id} onClick={() => setWorkType(w.id)} style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 50,
              border: `2px solid ${workType === w.id ? T.sky : T.border}`,
              background: workType === w.id ? T.skyDim : T.white,
              color: workType === w.id ? T.sky : T.muted,
              fontFamily: font.body, fontSize: 13,
              fontWeight: workType === w.id ? 700 : 400,
              cursor: "pointer", transition: "all 0.18s",
            }}>
              {w.e} {hi ? w.hi : w.en}
              {workType === w.id && " ✓"}
            </button>
          ))}
        </div>
      </div>

      {/* Skills filter */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", marginBottom: 10 }}>
          {hi ? "REQUIRED SKILLS (OPTIONAL)" : "REQUIRED SKILLS (OPTIONAL)"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {skillOptions.map(s => (
            <button key={s} onClick={() => toggle(skills, setSkills, s)} style={{
              padding: "7px 13px", borderRadius: 50,
              border: `2px solid ${skills.includes(s) ? T.sky : T.border}`,
              background: skills.includes(s) ? T.skyDim : T.white,
              color: skills.includes(s) ? T.sky : T.muted,
              fontFamily: font.body, fontSize: 13,
              fontWeight: skills.includes(s) ? 700 : 400,
              cursor: "pointer", transition: "all 0.18s",
            }}>
              {s}{skills.includes(s) ? " ✓" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Radius */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.muted, letterSpacing: "0.08em", marginBottom: 10 }}>
          {hi ? `SEARCH RADIUS: ${radius} KM` : `SEARCH RADIUS: ${radius} KM`}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {[3, 5, 10, 20].map(r => (
            <button key={r} onClick={() => setRadius(r)} style={{
              flex: 1, padding: "10px 4px", borderRadius: 50,
              border: `2px solid ${radius === r ? T.sky : T.border}`,
              background: radius === r ? T.skyDim : T.white,
              color: radius === r ? T.sky : T.muted,
              fontFamily: font.mono, fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: "all 0.18s",
            }}>
              {r}km
            </button>
          ))}
        </div>
      </div>

      {/* Fake map placeholder */}
      <div style={{
        height: 140, borderRadius: 14,
        border: `1px solid ${T.border}`,
        background: "#e8edf2",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        marginBottom: 20, gap: 6,
        position: "relative", overflow: "hidden",
      }}>
        {/* Grid lines */}
        {[...Array(6)].map((_,i) => (
          <div key={i} style={{
            position: "absolute", left: 0, right: 0,
            top: `${i * 20}%`, height: 1, background: "rgba(255,255,255,0.5)",
          }} />
        ))}
        {[...Array(8)].map((_,i) => (
          <div key={i} style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${i * 14.3}%`, width: 1, background: "rgba(255,255,255,0.5)",
          }} />
        ))}
        <div style={{ fontSize: 28, zIndex: 1 }}>📍</div>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.muted, zIndex: 1 }}>
          {siteAddr ? hi ? "Pin Set ✓" : "Pin Set ✓" : hi ? "Map Pin Drop (MVP)" : "Map Pin Drop (MVP)"}
        </div>
        <div style={{ fontFamily: font.mono, fontSize: 10, color: "#9aa", zIndex: 1 }}>
          OpenStreetMap • Leaflet.js
        </div>
      </div>

      {searchErr && (
        <div style={{ marginBottom:12, padding:"10px 14px", borderRadius:10, background:T.errorDim, fontSize:13, color:T.error, fontFamily:font.body }}>
          ⚠️ {searchErr}
        </div>
      )}

      {/* Search button */}
      {searching ? (
        <div style={{
          width: "100%", padding: "15px",
          borderRadius: 50, background: T.sky,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          color: T.white, fontFamily: font.display, fontSize: 16, fontWeight: 700,
        }}>
          <div style={{ width: 18, height: 18, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: T.white, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          {hi ? "Searching…" : "Searching…"}
        </div>
      ) : (
        <button onClick={handleSearch} disabled={!canSearch} style={{
          width: "100%", padding: "15px",
          borderRadius: 50, border: "none",
          background: canSearch ? T.sky : T.border,
          color: T.white, cursor: canSearch ? "pointer" : "not-allowed",
          fontFamily: font.display, fontSize: 16, fontWeight: 700,
          boxShadow: canSearch ? `0 4px 20px ${T.sky}50` : "none",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          transition: "all 0.2s",
        }}>
          🔍 {hi ? "Nearby Technicians खोजें" : "Search Nearby Technicians"}
        </button>
      )}

      {!canSearch && (
        <p style={{ textAlign: "center", fontSize: 12, color: T.muted, marginTop: 10, fontFamily: font.mono }}>
          {hi ? "Site address और work type जरूरी है" : "Site address & work type required"}
        </p>
      )}
    </div>
  );
};

// ─── SCREEN: RESULTS ─────────────────────────────────────────────
const ResultsScreen = ({ lang, setScreen, setSelectedTech, onBack, siteAddr, workType, techs = [] }) => {
  const hi = lang === "hi";
  const wt = WORK_TYPES.find(w => w.id === workType);

  return (
    <div>
      {/* Header */}
      <div style={{ padding: "16px 16px 12px", background: T.white, borderBottom: `1px solid ${T.border}` }}>
        <button onClick={onBack} style={{
          display:"flex",alignItems:"center",gap:6,
          background:"none",border:"none",cursor:"pointer",
          fontFamily:font.body,fontSize:14,color:T.muted,marginBottom:10,
        }}>← {hi ? "वापस" : "Back"}</button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontFamily: font.mono, fontSize: 10, color: T.muted, letterSpacing: "0.08em", marginBottom: 4 }}>
              {hi ? "SEARCH RESULTS" : "SEARCH RESULTS"}
            </div>
            <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 800 }}>
              {techs.length} {hi ? "Technicians मिले" : "Technicians Found"}
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
              📍 {siteAddr?.split(",")[0]} · {wt ? (hi ? wt.hi : wt.en) : ""}
            </div>
          </div>
          <Tag label={hi ? "Fast Serve Score" : "Fast Serve"} color="sky" />
        </div>
      </div>

      {/* Sort note */}
      <div style={{ padding: "10px 16px", background: T.skyDim, borderBottom: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 12, color: T.sky, fontFamily: font.mono, fontWeight: 700 }}>
          ↑ {hi ? "Available Now → Fresh Location → Skill Match → Distance → Trust" : "Available Now → Fresh Location → Skill Match → Distance → Trust"}
        </div>
      </div>

      {/* Results */}
      <div style={{ padding: "12px 16px" }}>
        {techs.length === 0 ? (
          <div style={{ padding:"32px 0", textAlign:"center", color:T.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontFamily:font.display, fontSize:16, marginBottom:6 }}>
              {hi?"कोई Technician नहीं मिला":"No Technicians Found"}
            </div>
            <div style={{ fontSize:13, lineHeight:1.6 }}>
              {hi?"Radius बढ़ाएं या skill filter हटाएं":"Try increasing radius or removing skill filter"}
            </div>
          </div>
        ) : (
          techs.map((t, i) => (
            <TechCard key={t._id||i} tech={t} lang={lang} idx={i}
              onViewProfile={() => { setSelectedTech(t); setScreen("tech-profile"); }}
              onAssign={() => { setSelectedTech(t); setScreen("assign"); }}
            />
          ))
        )}
      </div>
    </div>
  );
};

// ─── TECH RESULT CARD ─────────────────────────────────────────────
const TechCard = ({ tech: t, lang, idx, onViewProfile, onAssign }) => {
  const hi = lang === "hi";
  const availLabel = {
    AVAILABLE_NOW:   hi ? "अभी Available" : "Available Now",
    AVAILABLE_TODAY: hi ? "आज Available" : "Available Today",
  }[t.availability] || t.availability;

  const availColor = t.availability === "AVAILABLE_NOW" ? T.green : T.warn;

  return (
    <Card className={`fade-up-${Math.min(idx + 1, 5)}`} style={{ marginBottom: 12 }}>
      <div style={{ padding: "16px" }}>
        {/* Top row */}
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
            background: `linear-gradient(135deg, ${T.saffron}, #c45a08)`,
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
            <div style={{ fontFamily: font.mono, fontSize: 13, fontWeight: 700, color: T.sky }}>
              {t.distanceKm} km
            </div>
          </div>
        </div>

        {/* Skills */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
          {t.skills.map(s => <Tag key={s} label={s} color="saffron" />)}
        </div>

        {/* Stats row */}
        <div style={{
          display: "flex", gap: 0,
          background: T.paper, borderRadius: 10,
          overflow: "hidden", marginBottom: 12,
          border: `1px solid ${T.border}`,
        }}>
          {[
            { v: t.completedWork,     l: hi ? "काम पूरे" : "Done",     e: "✅" },
            { v: t.uniqueSIs,         l: hi ? "SIs" : "SIs",           e: "🤝" },
            { v: `${t.avgRating}★`,   l: hi ? "Rating" : "Rating",     e: "⭐" },
            { v: t.openWork,          l: hi ? "Open" : "Open",         e: "📋" },
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

        {/* Location freshness */}
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>
          🕐 {hi ? "Location:" : "Location:"} {t.locationAge}
          {t.locationAge.includes("32") || t.locationAge.includes("1 घंटा") ? (
            <span style={{ color: T.warn, fontWeight: 600, marginLeft: 4 }}>
              · {hi ? "थोड़ी पुरानी — call करें" : "· Slightly old — call to confirm"}
            </span>
          ) : null}
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 8 }}>
          <a href={`tel:9876543210`} style={{
            flex: 1, padding: "10px",
            borderRadius: 10, border: `1px solid ${T.green}40`,
            background: T.greenDim, color: T.green,
            fontFamily: font.display, fontSize: 13, fontWeight: 700,
            textDecoration: "none", textAlign: "center",
          }}>📞 {hi ? "Call" : "Call"}</a>
          <a href={`https://wa.me/919876543210`} target="_blank" rel="noreferrer" style={{
            flex: 1, padding: "10px",
            borderRadius: 10, border: "1px solid #1a7a3a40",
            background: "#e6f9f0", color: "#1a7a3a",
            fontFamily: font.display, fontSize: 13, fontWeight: 700,
            textDecoration: "none", textAlign: "center",
          }}>💬 {hi ? "WhatsApp" : "WhatsApp"}</a>
          <button onClick={onAssign} style={{
            flex: 1.5, padding: "10px",
            borderRadius: 10, border: "none",
            background: T.sky, color: T.white,
            fontFamily: font.display, fontSize: 13, fontWeight: 700,
            cursor: "pointer",
          }}>
            {hi ? "काम दें" : "Assign Work"}
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

// ─── SCREEN: TECH PROFILE VIEW ────────────────────────────────────
const TechProfileScreen = ({ lang, tech, setScreen }) => {
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
      <div className="fade-up-3" style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <a href="tel:9876543210" style={{
          flex:1,padding:"13px",borderRadius:50,
          background:T.greenDim,color:T.green,border:`1px solid ${T.green}40`,
          fontFamily:font.display,fontSize:15,fontWeight:700,
          textDecoration:"none",textAlign:"center",
        }}>📞 {hi?"Call":"Call"}</a>
        <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" style={{
          flex:1,padding:"13px",borderRadius:50,
          background:"#e6f9f0",color:"#1a7a3a",border:"1px solid #1a7a3a40",
          fontFamily:font.display,fontSize:15,fontWeight:700,
          textDecoration:"none",textAlign:"center",
        }}>💬 WhatsApp</a>
      </div>
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

// ─── SCREEN: ASSIGN WORK ─────────────────────────────────────────
const AssignScreen = ({ lang, tech, setScreen }) => {
  const hi = lang === "hi";
  if (!tech) { setScreen("search"); return null; }

  const [clientName,    setClientName]    = useState("");
  const [clientMobile,  setClientMobile]  = useState("");
  const [siteAddress,   setSiteAddress]   = useState("");
  const [workType,      setWorkType]       = useState(null);
  const [description,   setDescription]   = useState("");
  const [visitTime,     setVisitTime]      = useState("");
  const [charge,        setCharge]         = useState("");
  const [materialIncl,  setMaterialIncl]  = useState(null);
  const [paymentBy,     setPaymentBy]      = useState(null);
  const [paymentMode,   setPaymentMode]    = useState(null);
  const [confirmed,     setConfirmed]      = useState(false);
  const [submitted,     setSubmitted]      = useState(false);
  const [submitting,    setSubmitting]     = useState(false);
  const [submitErr,     setSubmitErr]      = useState("");

  const canSubmit = clientName && siteAddress && workType && confirmed;

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitErr("");
    try {
      await api.post("/site-work", {
        technicianUserId: tech.techUserId || tech.userId,
        clientName, clientMobile, siteAddress,
        workType, description,
        preferredVisitTime: visitTime,
        agreedVisitCharge: Number(charge) || 0,
        paymentMode: paymentMode || "CASH",
        materialIncluded: materialIncl === "YES",
      });
      setSubmitted(true);
    } catch (e) {
      setSubmitErr(e?.message || "Failed to assign");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: T.greenDim, border: `3px solid ${T.green}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 36,
        }}>✅</div>
        <h2 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
          {hi ? "Site Work Assign हो गया!" : "Site Work Assigned!"}
        </h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 28 }}>
          {hi
            ? `${tech.name} को notification मिल गई। वो accept/reject करेगा।`
            : `${tech.name} has been notified. They will accept or reject.`}
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setScreen("my-works")} style={{
            flex:1,padding:"13px",borderRadius:50,border:"none",
            background:T.sky,color:T.white,
            fontFamily:font.display,fontSize:15,fontWeight:700,cursor:"pointer",
          }}>
            {hi?"My Works देखें":"View My Works"}
          </button>
        </div>
        <button style={{
          width:"100%",padding:"13px",borderRadius:50,
          border:`1px solid ${T.border}`,background:T.white,
          fontFamily:font.display,fontSize:14,fontWeight:700,
          color:T.muted,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        }}>
          💬 {hi?"Technician Contact Client को Forward करें":"Forward Technician to Client"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <button onClick={() => setScreen("search")} style={{
        display:"flex",alignItems:"center",gap:6,
        background:"none",border:"none",cursor:"pointer",
        fontFamily:font.body,fontSize:14,color:T.muted,marginBottom:16,
      }}>← {hi?"वापस":"Back"}</button>

      <div style={{ fontFamily: font.mono, fontSize: 11, color: T.sky, letterSpacing: "0.1em", marginBottom: 6 }}>
        {hi?"SITE WORK ASSIGN":"ASSIGN SITE WORK"}
      </div>
      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
        {hi?"Site Work Details भरें":"Fill Site Work Details"}
      </h2>

      {/* Assigned to */}
      <div style={{
        display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
        background:T.skyDim,borderRadius:12,marginBottom:20,
        border:`1px solid ${T.sky}30`,
      }}>
        <div style={{
          width:40,height:40,borderRadius:"50%",flexShrink:0,
          background:`linear-gradient(135deg,${T.saffron},#c45a08)`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:font.display,fontSize:18,fontWeight:800,color:T.white,
        }}>{tech.name[0]}</div>
        <div>
          <div style={{ fontFamily:font.mono,fontSize:10,color:T.sky,letterSpacing:"0.08em" }}>
            {hi?"ASSIGNING TO":"ASSIGNING TO"}
          </div>
          <div style={{ fontFamily:font.display,fontSize:15,fontWeight:700 }}>{tech.name}</div>
          <div style={{ fontSize:12,color:T.muted }}>{tech.distanceKm} km · {tech.city}</div>
        </div>
      </div>

      {/* Client Name */}
      {[
        { label: hi?"Client / Site Name":"Client / Site Name", value: clientName, set: setClientName, placeholder: hi?"जैसे: Sharma Medical Store":"e.g. Sharma Medical Store" },
        { label: hi?"Client Mobile (Optional)":"Client Mobile (Optional)", value: clientMobile, set: setClientMobile, placeholder: hi?"10 digit number":"10 digit number", type: "tel" },
        { label: hi?"Site Address":"Site Address", value: siteAddress, set: setSiteAddress, placeholder: hi?"पूरा address":"Full address" },
      ].map(f => (
        <div key={f.label} style={{ marginBottom: 16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
            {f.label.toUpperCase()}
          </div>
          <input
            type={f.type||"text"}
            value={f.value}
            onChange={e=>f.set(e.target.value)}
            placeholder={f.placeholder}
            style={{
              width:"100%",padding:"13px 16px",
              border:`2px solid ${f.value?T.sky:T.border}`,
              borderRadius:12,outline:"none",
              fontFamily:font.body,fontSize:14,color:T.ink,
              background:T.white,transition:"border-color 0.2s",
            }}
          />
        </div>
      ))}

      {/* Work Type */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:10 }}>
          {hi?"WORK TYPE *":"WORK TYPE *"}
        </div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
          {WORK_TYPES.map(w=>(
            <button key={w.id} onClick={()=>setWorkType(w.id)} style={{
              display:"inline-flex",alignItems:"center",gap:5,
              padding:"7px 12px",borderRadius:50,
              border:`2px solid ${workType===w.id?T.sky:T.border}`,
              background:workType===w.id?T.skyDim:T.white,
              color:workType===w.id?T.sky:T.muted,
              fontFamily:font.body,fontSize:13,
              fontWeight:workType===w.id?700:400,cursor:"pointer",transition:"all 0.18s",
            }}>
              {w.e} {hi?w.hi:w.en}{workType===w.id?" ✓":""}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
          {hi?"WORK DESCRIPTION":"WORK DESCRIPTION"}
        </div>
        <textarea
          value={description}
          onChange={e=>setDescription(e.target.value)}
          placeholder={hi?"काम का short description…":"Short description of work…"}
          rows={3}
          style={{
            width:"100%",padding:"13px 16px",
            border:`2px solid ${description?T.sky:T.border}`,
            borderRadius:12,outline:"none",
            fontFamily:font.body,fontSize:14,color:T.ink,
            background:T.white,resize:"none",lineHeight:1.5,
            transition:"border-color 0.2s",
          }}
        />
      </div>

      {/* Visit Time */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
          {hi?"PREFERRED VISIT TIME":"PREFERRED VISIT TIME"}
        </div>
        <input
          type="datetime-local"
          value={visitTime}
          onChange={e=>setVisitTime(e.target.value)}
          style={{
            width:"100%",padding:"13px 16px",
            border:`2px solid ${visitTime?T.sky:T.border}`,
            borderRadius:12,outline:"none",
            fontFamily:font.body,fontSize:14,color:T.ink,
            background:T.white,transition:"border-color 0.2s",
          }}
        />
      </div>

      {/* Charge */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
          {hi?"AGREED VISIT CHARGE (OPTIONAL)":"AGREED VISIT CHARGE (OPTIONAL)"}
        </div>
        <div style={{ display:"flex",alignItems:"center",border:`2px solid ${charge?T.sky:T.border}`,borderRadius:12,background:T.white,overflow:"hidden",transition:"border-color 0.2s" }}>
          <div style={{ padding:"13px 14px",borderRight:`1px solid ${T.border}`,fontFamily:font.mono,fontSize:15,fontWeight:700,color:T.muted,background:"#f9f6f0" }}>₹</div>
          <input
            type="number" value={charge}
            onChange={e=>setCharge(e.target.value)}
            placeholder={hi?"जैसे: 500":"e.g. 500"}
            style={{ flex:1,padding:"13px 16px",border:"none",outline:"none",fontFamily:font.display,fontSize:16,fontWeight:700,color:T.ink,background:"transparent" }}
          />
        </div>
        <div style={{ fontSize:11,color:T.muted,marginTop:5,fontFamily:font.mono }}>
          {hi?"Reference only — app collect नहीं करता":"Reference only — app does not collect payment"}
        </div>
      </div>

      {/* Material + Payment */}
      {[
        {
          label: hi?"MATERIAL INCLUDED?":"MATERIAL INCLUDED?",
          opts: [{id:"YES",l:hi?"हाँ":"Yes"},{id:"NO",l:hi?"नहीं":"No"},{id:"NOT_SURE",l:hi?"पता नहीं":"Not Sure"}],
          val: materialIncl, set: setMaterialIncl,
        },
        {
          label: hi?"PAYMENT BY?":"PAYMENT BY?",
          opts: [{id:"SI",l:"SI"},{id:"CLIENT",l:hi?"Client":"Client"},{id:"OTHER",l:hi?"Other":"Other"}],
          val: paymentBy, set: setPaymentBy,
        },
        {
          label: hi?"PAYMENT MODE?":"PAYMENT MODE?",
          opts: [{id:"CASH",l:hi?"Cash":"Cash"},{id:"UPI",l:"UPI"},{id:"LATER",l:hi?"Later":"Later"}],
          val: paymentMode, set: setPaymentMode,
        },
      ].map(f=>(
        <div key={f.label} style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:10 }}>{f.label}</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {f.opts.map(o=>(
              <button key={o.id} onClick={()=>f.set(o.id)} style={{
                padding:"8px 16px",borderRadius:50,
                border:`2px solid ${f.val===o.id?T.sky:T.border}`,
                background:f.val===o.id?T.skyDim:T.white,
                color:f.val===o.id?T.sky:T.muted,
                fontFamily:font.body,fontSize:14,
                fontWeight:f.val===o.id?700:400,cursor:"pointer",transition:"all 0.18s",
              }}>
                {o.l}{f.val===o.id?" ✓":""}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* T&C Confirm */}
      <button onClick={()=>setConfirmed(!confirmed)} style={{
        width:"100%",padding:"14px 16px",
        borderRadius:12,border:`2px solid ${confirmed?T.green:T.border}`,
        background:confirmed?T.greenDim:T.white,
        display:"flex",alignItems:"flex-start",gap:12,
        cursor:"pointer",marginBottom:20,textAlign:"left",
        transition:"all 0.2s",
      }}>
        <div style={{
          width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,
          border:`2px solid ${confirmed?T.green:T.border}`,
          background:confirmed?T.green:T.white,
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"all 0.2s",
        }}>
          {confirmed&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span style={{ fontSize:13,color:T.ink,lineHeight:1.6,fontFamily:font.body }}>
          {hi
            ?"मैं confirm करता/करती हूँ कि work scope, charges, payment, material, और timing technician से directly discuss हो गई है। Platform किसी payment या work dispute के लिए liable नहीं है।"
            :"I confirm that work scope, charges, payment, material, and timing have been directly discussed with the technician. Platform is not liable for payment or work disputes."}
        </span>
      </button>

      {submitErr && (
        <div style={{ marginBottom:12, padding:"10px 14px", borderRadius:10, background:T.errorDim, fontSize:13, color:T.error, fontFamily:font.body }}>
          ⚠️ {submitErr}
        </div>
      )}
      <button onClick={handleSubmit} disabled={!canSubmit||submitting} style={{
        width:"100%",padding:"15px",borderRadius:50,border:"none",
        background:canSubmit&&!submitting?T.sky:T.border,color:T.white,
        fontFamily:font.display,fontSize:16,fontWeight:700,
        cursor:canSubmit&&!submitting?"pointer":"not-allowed",
        boxShadow:canSubmit&&!submitting?`0 4px 20px ${T.sky}50`:"none",
        marginBottom:24,transition:"all 0.2s",
        display:"flex",alignItems:"center",justifyContent:"center",gap:10,
      }}>
        {submitting
          ? <><div style={{ width:18,height:18,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }} />{hi?"Assign हो रहा…":"Assigning…"}</>
          : (hi?"Site Work Assign करें →":"Assign Site Work →")
        }
      </button>
    </div>
  );
};

// ─── SCREEN: MY WORKS ────────────────────────────────────────────
const MyWorksScreen = ({ lang, setScreen, siteWorks = [] }) => {
  const hi = lang === "hi";
  const [filter, setFilter] = useState("ALL");

  const filters = [
    { id:"ALL",      l: hi?"सभी":"All" },
    { id:"ACTIVE",   l: hi?"Active":"Active" },
    { id:"REVIEW",   l: hi?"Review":"Review" },
    { id:"CLOSED",   l: hi?"Closed":"Closed" },
  ];

  const filtered = siteWorks.filter(w => {
    if (filter === "ALL")    return true;
    if (filter === "ACTIVE") return ["ACCEPTED","ON_THE_WAY","REACHED","WORK_STARTED"].includes(w.status);
    if (filter === "REVIEW") return w.status === "COMPLETED_BY_TECH";
    if (filter === "CLOSED") return w.status === "CLOSED";
    return true;
  });

  return (
    <div style={{ padding:"16px" }}>
      <div style={{ fontFamily:font.display,fontSize:20,fontWeight:800,marginBottom:16 }}>
        {hi?"My Site Works":"My Site Works"}
      </div>

      {/* Filters */}
      <div style={{ display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:4 }}>
        {filters.map(f=>(
          <button key={f.id} onClick={()=>setFilter(f.id)} style={{
            flexShrink:0,padding:"8px 18px",borderRadius:50,
            border:`2px solid ${filter===f.id?T.sky:T.border}`,
            background:filter===f.id?T.skyDim:T.white,
            color:filter===f.id?T.sky:T.muted,
            fontFamily:font.mono,fontSize:12,fontWeight:700,cursor:"pointer",
            transition:"all 0.18s",
          }}>{f.l}</button>
        ))}
      </div>

      {filtered.map((w,i)=>{
        const st = STATUS_MAP[w.status]||STATUS_MAP.DRAFT;
        const needsAction = w.status === "COMPLETED_BY_TECH";
        const techName = w.technicianUserId?.name || "Technician";
        return (
          <Card key={w._id||i} className={`fade-up-${Math.min(i+1,5)}`}
            style={{ marginBottom:10, borderLeft: needsAction?`4px solid ${T.saffron}`:"none" }}
            onClick={()=>setScreen("work-detail")}>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
                <div>
                  <div style={{ fontFamily:font.display,fontSize:15,fontWeight:700 }}>{techName}</div>
                  <div style={{ fontSize:12,color:T.muted }}>{w.workType} · {(w.siteAddress||"").slice(0,30)}</div>
                </div>
                <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}>
                  <Tag label={hi?st.hi:st.en} color={st.color} />
                  <div style={{ fontFamily:font.mono,fontSize:12,color:T.muted }}>₹{w.agreedVisitCharge||0}</div>
                </div>
              </div>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
                <div style={{ fontSize:12,color:T.muted }}>
                  {new Date(w.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"2-digit"})}
                </div>
                {needsAction && (
                  <div style={{ fontSize:12,fontWeight:700,color:T.saffron,fontFamily:font.mono }}>
                    {hi?"→ CLOSE करें":"→ CLOSE NOW"}
                  </div>
                )}
              </div>
            </div>
          </Card>
        );
      })}

      {filtered.length === 0 && (
        <div style={{ textAlign:"center",padding:"40px 0",color:T.muted,fontSize:14 }}>
          <div style={{ fontSize:36,marginBottom:8 }}>📋</div>
          {hi?"कोई काम नहीं मिला":"No works found"}
        </div>
      )}
    </div>
  );
};

// ─── SCREEN: TECHNICIAN POOL ──────────────────────────────────────
const PoolScreen = ({ lang, setScreen, pool = [], setSelectedTech }) => {
  const hi = lang === "hi";
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/onboarding?ref=si`;

  const handleWhatsApp = () => {
    const msg = `नमस्ते! SiteMitra पर Technician के रूप में join करें और मेरे साथ काम करें। Link: ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteLink).catch(()=>{});
    setCopied(true); setTimeout(()=>setCopied(false), 2000);
  };

  return (
    <div style={{ padding:"16px" }}>
      <div style={{ fontFamily:font.display,fontSize:20,fontWeight:800,marginBottom:6 }}>
        {hi?"मेरा Technician Pool":"My Technician Pool"}
      </div>
      <div style={{ fontSize:13,color:T.muted,marginBottom:16,lineHeight:1.55 }}>
        {hi?"जिन technicians को काम दिया है वो यहाँ दिखते हैं।":"Technicians you've assigned work to appear here."}
      </div>

      {/* Share hiring link */}
      <Card style={{ marginBottom:16,background:T.skyDim,border:`1px solid ${T.sky}30` }}>
        <div style={{ padding:"14px 16px" }}>
          <div style={{ fontFamily:font.display,fontSize:15,fontWeight:700,marginBottom:6 }}>
            {hi?"Technicians को Invite करें":"Invite Technicians"}
          </div>
          <div style={{ fontSize:13,color:T.muted,marginBottom:10,lineHeight:1.55 }}>
            {hi?"नए technicians को join करने का link share करें।":"Share join link with new technicians."}
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <button onClick={handleWhatsApp} style={{
              flex:1,padding:"10px",borderRadius:50,border:"none",
              background:"#25D366",color:T.white,
              fontFamily:font.display,fontSize:13,fontWeight:700,cursor:"pointer",
            }}>💬 WhatsApp</button>
            <button onClick={handleCopy} style={{
              flex:1,padding:"10px",borderRadius:50,
              border:`1px solid ${copied?T.green:T.sky}`,
              background:copied?T.greenDim:T.white,
              color:copied?T.green:T.sky,
              fontFamily:font.display,fontSize:13,fontWeight:700,cursor:"pointer",
            }}>
              {copied?"✓ Copied!":"📋 Copy Link"}
            </button>
          </div>
        </div>
      </Card>

      {pool.length === 0 ? (
        <div style={{ textAlign:"center",padding:"40px 0",color:T.muted,fontSize:14 }}>
          <div style={{ fontSize:36,marginBottom:8 }}>👥</div>
          {hi?"अभी कोई technician नहीं।":"No technicians yet."}
          <div style={{ fontSize:12,marginTop:8,lineHeight:1.6 }}>
            {hi?"काम assign करने के बाद technicians यहाँ दिखेंगे।":"Technicians appear here after you assign work."}
          </div>
        </div>
      ) : pool.map((p,i)=>{
        const tech = p.technicianUserId || {};
        const name = tech.name || "Technician";
        const mobile = tech.mobile || "";
        return (
          <Card key={p._id||i} className={`fade-up-${Math.min(i+1,5)}`} style={{ marginBottom:10 }}>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex",gap:12,alignItems:"center",marginBottom:10 }}>
                <div style={{
                  width:44,height:44,borderRadius:"50%",flexShrink:0,
                  background:`linear-gradient(135deg,${T.saffron},#c45a08)`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontFamily:font.display,fontSize:18,fontWeight:800,color:T.white,
                }}>{name[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:font.display,fontSize:15,fontWeight:700 }}>{name}</div>
                  <div style={{ fontSize:12,color:T.muted }}>
                    🕐 {hi?"Last:":"Last:"} {new Date(p.updatedAt||p.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                  </div>
                </div>
              </div>
              <div style={{ display:"flex",gap:8 }}>
                {mobile && (
                  <a href={`tel:${mobile}`} style={{ flex:1,padding:"9px",borderRadius:10,background:T.greenDim,color:T.green,border:`1px solid ${T.green}30`,fontFamily:font.display,fontSize:13,fontWeight:700,textDecoration:"none",textAlign:"center" }}>📞 Call</a>
                )}
                {mobile && (
                  <a href={`https://wa.me/91${mobile}`} target="_blank" rel="noreferrer" style={{ flex:1,padding:"9px",borderRadius:10,background:"#e6f9f0",color:"#1a7a3a",border:"1px solid #1a7a3a30",fontFamily:font.display,fontSize:13,fontWeight:700,textDecoration:"none",textAlign:"center" }}>💬 WA</a>
                )}
                <button onClick={()=>{ setSelectedTech({ techUserId:tech._id, name, city:"", distanceKm:"?", skills:[], vehicle:"🚶", experience:"–" }); setScreen("assign"); }} style={{ flex:1,padding:"9px",borderRadius:10,background:T.sky,color:T.white,border:"none",fontFamily:font.display,fontSize:13,fontWeight:700,cursor:"pointer" }}>
                  {hi?"काम दें":"Assign"}
                </button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};

// ─── VISITING CARD GENERATOR ─────────────────────────────────────
const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
};

const generateVisitingCard = (siProfile, user) => new Promise(resolve => {
  const W = 900, H = 500;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Dark blue gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0d2240"); bg.addColorStop(1, "#1a5fa8");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath(); ctx.arc(820, 60, 140, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(820, 60, 90, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(100, 450, 100, 0, Math.PI*2); ctx.fill();

  // Top saffron bar
  ctx.fillStyle = "#e8630a"; ctx.fillRect(0, 0, W, 7);

  // Company name
  const company = (siProfile?.businessName || user?.name || "My Company").slice(0, 28);
  ctx.font = "bold 52px Arial"; ctx.fillStyle = "#ffffff";
  ctx.fillText(company, 60, 105);

  // Business type badge
  if (siProfile?.businessType) {
    ctx.font = "bold 15px Arial";
    const badge = "  " + siProfile.businessType + "  ";
    const bw = ctx.measureText(badge).width + 4;
    ctx.fillStyle = "rgba(232,99,10,0.85)";
    roundRect(ctx, 60, 118, bw, 28, 6); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.fillText(badge, 64, 138);
  }

  // Services row
  const cats = (siProfile?.workCategories || []).slice(0, 5).map(id => {
    const c = SI_SERVICE_CATS.find(x => x.id === id);
    return c ? c.l : id;
  });
  if (cats.length) {
    ctx.font = "19px Arial"; ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText(cats.join("  ·  ").slice(0, 68), 60, 175);
  }

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, 200); ctx.lineTo(840, 200); ctx.stroke();

  // Address
  if (siProfile?.businessAddress) {
    ctx.font = "18px Arial"; ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("📍  " + siProfile.businessAddress.slice(0, 58), 60, 240);
  }
  if (siProfile?.city) {
    ctx.font = "18px Arial"; ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText(siProfile.city, 60, 268);
  }

  // Mobile
  if (user?.mobile) {
    ctx.font = "bold 30px Arial"; ctx.fillStyle = "#ffffff";
    ctx.fillText("📞  " + user.mobile, 60, 325);
  }

  // SiteMitra watermark
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  roundRect(ctx, W-260, H-55, 240, 40, 8); ctx.fill();
  ctx.font = "bold 13px Arial"; ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("Powered by SiteMitra", W-250, H-29);

  resolve(canvas);
});

// ─── SCREEN: SI PROFILE ───────────────────────────────────────────
const SIProfileScreen = ({ user, siProfile, onProfileSaved, lang }) => {
  const { logout } = useAuth();
  const hi = lang === "hi";
  const [editing, setEditing] = useState(!siProfile?.businessName);
  const [businessName, setBusinessName]     = useState(siProfile?.businessName || "");
  const [city, setCity]                     = useState(siProfile?.city || "");
  const [businessType, setBusinessType]     = useState(siProfile?.businessType || "SI");
  const [workCategories, setWorkCategories] = useState(siProfile?.workCategories || []);
  const [businessAddress, setBusinessAddress] = useState(siProfile?.businessAddress || "");
  const [saving, setSaving]       = useState(false);
  const [saveErr, setSaveErr]     = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [sharing, setSharing]     = useState(false);
  const photoRef = useRef(null);

  useEffect(() => {
    if (siProfile) {
      setBusinessName(siProfile.businessName || "");
      setCity(siProfile.city || "");
      setBusinessType(siProfile.businessType || "SI");
      setWorkCategories(siProfile.workCategories || []);
      setBusinessAddress(siProfile.businessAddress || "");
    }
  }, [siProfile]);

  const handleSave = async () => {
    setSaving(true); setSaveErr("");
    try {
      const r = await api.put("/si", { businessName, city, businessType, workCategories, businessAddress });
      onProfileSaved(r);
      setEditing(false);
    } catch (e) { setSaveErr(e?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const r = await api.post("/si/photo", form, { headers:{ "Content-Type":"multipart/form-data" } });
      onProfileSaved({ ...siProfile, customPhotoUrl: r?.photoUrl });
    } catch {}
    setPhotoUploading(false);
  };

  const handleShareCard = async () => {
    if (!siProfile?.businessName) { alert(hi?"पहले profile save करें":"Please save profile first"); return; }
    setSharing(true);
    try {
      const canvas = await generateVisitingCard(siProfile, user);
      canvas.toBlob(async (blob) => {
        const file = new File([blob], "visiting-card.png", { type:"image/png" });
        if (navigator.share && navigator.canShare?.({ files:[file] })) {
          await navigator.share({
            files: [file],
            title: siProfile.businessName,
            text: `${siProfile.businessName} — ${(siProfile.workCategories||[]).slice(0,3).map(id=>{ const c=SI_SERVICE_CATS.find(x=>x.id===id); return c?c.l:id; }).join(", ")}`,
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "visiting-card.png"; a.click();
          URL.revokeObjectURL(url);
        }
        setSharing(false);
      }, "image/png");
    } catch { setSharing(false); }
  };

  const photoSrc = siProfile?.customPhotoUrl ? `${API_URL}${siProfile.customPhotoUrl}` : user?.photoUrl;
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "SI";
  const BIZ_TYPES = ["SI","CONTRACTOR","DEALER","SERVICE_PROVIDER"];
  const toggleCat = (id) => setWorkCategories(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  if (editing) {
    return (
      <div style={{ padding:"16px" }}>
        {siProfile?.businessName && (
          <button onClick={()=>setEditing(false)} style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:font.body,fontSize:14,color:T.muted,marginBottom:16 }}>
            ← {hi?"वापस":"Back"}
          </button>
        )}
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.sky,letterSpacing:"0.1em",marginBottom:6 }}>
          {hi?"COMPANY PROFILE":"COMPANY PROFILE"}
        </div>
        <h2 style={{ fontFamily:font.display,fontSize:22,fontWeight:800,marginBottom:20 }}>
          {hi?"Profile Setup करें":"Set Up Your Profile"}
        </h2>

        {/* Photo */}
        <div style={{ textAlign:"center",marginBottom:24 }}>
          <div style={{ position:"relative",display:"inline-block" }}>
            {photoSrc
              ? <img src={photoSrc} alt="" style={{ width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.border}` }} />
              : <div style={{ width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${T.sky},#0f4080)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font.display,fontSize:28,fontWeight:800,color:T.white }}>{initials}</div>
            }
            <button onClick={()=>photoRef.current?.click()} style={{ position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:T.saffron,color:T.white,border:`2px solid ${T.white}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13 }}>
              📷
            </button>
          </div>
          <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }} />
          {photoUploading && <div style={{ fontSize:12,color:T.sky,marginTop:6 }}>Uploading…</div>}
          <div style={{ fontSize:12,color:T.muted,marginTop:6 }}>{hi?"Company / Profile Photo":"Company / Profile Photo"}</div>
        </div>

        {/* Business Name */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
            {hi?"COMPANY / BUSINESS NAME *":"COMPANY / BUSINESS NAME *"}
          </div>
          <input value={businessName} onChange={e=>setBusinessName(e.target.value)}
            placeholder={hi?"जैसे: Sharma Security Systems":"e.g. Sharma Security Systems"}
            style={{ width:"100%",padding:"13px 16px",border:`2px solid ${businessName?T.sky:T.border}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,transition:"border-color 0.2s" }}
          />
        </div>

        {/* City */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
            {hi?"CITY":"CITY"}
          </div>
          <input value={city} onChange={e=>setCity(e.target.value)}
            placeholder={hi?"जैसे: Jaipur":"e.g. Jaipur"}
            style={{ width:"100%",padding:"13px 16px",border:`2px solid ${city?T.sky:T.border}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,transition:"border-color 0.2s" }}
          />
        </div>

        {/* Business Address */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
            {hi?"BUSINESS ADDRESS":"BUSINESS ADDRESS"}
          </div>
          <textarea value={businessAddress} onChange={e=>setBusinessAddress(e.target.value)}
            placeholder={hi?"पूरा business address…":"Full business address…"}
            rows={2}
            style={{ width:"100%",padding:"13px 16px",border:`2px solid ${businessAddress?T.sky:T.border}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,resize:"none",lineHeight:1.5,transition:"border-color 0.2s" }}
          />
        </div>

        {/* Business Type */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:10 }}>
            {hi?"BUSINESS TYPE":"BUSINESS TYPE"}
          </div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {BIZ_TYPES.map(t=>(
              <button key={t} onClick={()=>setBusinessType(t)} style={{
                padding:"8px 16px",borderRadius:50,
                border:`2px solid ${businessType===t?T.sky:T.border}`,
                background:businessType===t?T.skyDim:T.white,
                color:businessType===t?T.sky:T.muted,
                fontFamily:font.body,fontSize:13,fontWeight:businessType===t?700:400,
                cursor:"pointer",transition:"all 0.18s",
              }}>{t}{businessType===t?" ✓":""}</button>
            ))}
          </div>
        </div>

        {/* Services / Work Categories */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:10 }}>
            {hi?"SERVICES OFFERED (जो काम करते हो)":"SERVICES OFFERED"}
          </div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {SI_SERVICE_CATS.map(c=>(
              <button key={c.id} onClick={()=>toggleCat(c.id)} style={{
                padding:"7px 13px",borderRadius:50,
                border:`2px solid ${workCategories.includes(c.id)?T.sky:T.border}`,
                background:workCategories.includes(c.id)?T.skyDim:T.white,
                color:workCategories.includes(c.id)?T.sky:T.muted,
                fontFamily:font.body,fontSize:13,fontWeight:workCategories.includes(c.id)?700:400,
                cursor:"pointer",transition:"all 0.18s",
              }}>{c.l}{workCategories.includes(c.id)?" ✓":""}</button>
            ))}
          </div>
        </div>

        {saveErr && (
          <div style={{ marginBottom:12,padding:"10px 14px",borderRadius:10,background:T.errorDim,fontSize:13,color:T.error }}>
            ⚠️ {saveErr}
          </div>
        )}

        <button onClick={handleSave} disabled={!businessName||saving} style={{
          width:"100%",padding:"15px",borderRadius:50,border:"none",
          background:businessName&&!saving?T.sky:T.border,color:T.white,
          fontFamily:font.display,fontSize:16,fontWeight:700,
          cursor:businessName&&!saving?"pointer":"not-allowed",
          boxShadow:businessName&&!saving?`0 4px 20px ${T.sky}50`:"none",
          marginBottom:24,transition:"all 0.2s",
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,
        }}>
          {saving
            ? <><div style={{ width:18,height:18,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }} />{hi?"Save हो रहा…":"Saving…"}</>
            : (hi?"Profile Save करें →":"Save Profile →")
          }
        </button>
      </div>
    );
  }

  // ── VIEW MODE ──
  const catLabels = (siProfile?.workCategories||[]).map(id=>{ const c=SI_SERVICE_CATS.find(x=>x.id===id); return c?c.l:id; });

  return (
    <div style={{ padding:"16px" }}>
      {/* Profile header */}
      <div style={{ textAlign:"center",marginBottom:20 }}>
        <div style={{ position:"relative",display:"inline-block",marginBottom:10 }}>
          {photoSrc
            ? <img src={photoSrc} alt="" style={{ width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`3px solid ${T.border}` }} />
            : <div style={{ width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${T.sky},#0f4080)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font.display,fontSize:28,fontWeight:800,color:T.white }}>{initials}</div>
          }
          <button onClick={()=>photoRef.current?.click()} style={{ position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:T.saffron,color:T.white,border:`2px solid ${T.white}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12 }}>
            📷
          </button>
        </div>
        <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }} />
        <div style={{ fontFamily:font.display,fontSize:22,fontWeight:800 }}>{siProfile?.businessName || user?.name}</div>
        {siProfile?.businessType && <div style={{ fontSize:12,color:T.sky,fontFamily:font.mono,fontWeight:700,marginTop:3 }}>{siProfile.businessType}</div>}
        {siProfile?.city && <div style={{ fontSize:13,color:T.muted,marginTop:2 }}>📍 {siProfile.city}</div>}
      </div>

      {/* Info card */}
      <Card style={{ marginBottom:12 }}>
        <div style={{ padding:"14px 16px" }}>
          {siProfile?.businessAddress && (
            <div style={{ display:"flex",gap:10,marginBottom:10,alignItems:"flex-start" }}>
              <span style={{ fontSize:18,flexShrink:0 }}>🏢</span>
              <div style={{ fontSize:13,color:T.ink,lineHeight:1.5 }}>{siProfile.businessAddress}</div>
            </div>
          )}
          {user?.mobile && (
            <div style={{ display:"flex",gap:10,marginBottom:10,alignItems:"center" }}>
              <span style={{ fontSize:18 }}>📞</span>
              <div style={{ fontSize:14,fontWeight:600 }}>{user.mobile}</div>
            </div>
          )}
          {catLabels.length > 0 && (
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:4 }}>
              {catLabels.map(l=><Tag key={l} label={l} color="sky" />)}
            </div>
          )}
        </div>
      </Card>

      {/* Visiting Card share */}
      <Card style={{ marginBottom:12,background:T.saffronDim,border:`1px solid ${T.saffron}30` }}>
        <div style={{ padding:"16px" }}>
          <div style={{ fontFamily:font.display,fontSize:15,fontWeight:700,marginBottom:4 }}>
            🪪 {hi?"Visiting Card Share करें":"Share Your Visiting Card"}
          </div>
          <div style={{ fontSize:13,color:T.muted,marginBottom:14,lineHeight:1.55 }}>
            {hi?"एक professional card image generate होगी — WhatsApp या किसी भी app पर share करें।":"A professional card image will be generated — share on WhatsApp or any app."}
          </div>
          <button onClick={handleShareCard} disabled={sharing} style={{
            width:"100%",padding:"13px",borderRadius:50,border:"none",
            background:sharing?T.border:T.saffron,color:T.white,
            fontFamily:font.display,fontSize:15,fontWeight:700,
            cursor:sharing?"not-allowed":"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow:sharing?"none":`0 4px 20px ${T.saffron}40`,
            transition:"all 0.2s",
          }}>
            {sharing
              ? <><div style={{ width:18,height:18,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }} />{hi?"Card बन रहा…":"Generating…"}</>
              : <>📤 {hi?"Card Share करें":"Share Card"}</>
            }
          </button>
        </div>
      </Card>

      {/* Edit profile */}
      <button onClick={()=>setEditing(true)} style={{
        width:"100%",padding:"13px",borderRadius:12,
        border:`1px solid ${T.sky}`,background:T.skyDim,color:T.sky,
        fontFamily:font.display,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10,
      }}>
        ✏️ {hi?"Profile Edit करें":"Edit Profile"}
      </button>

      {/* Logout */}
      <button onClick={logout} style={{
        width:"100%",padding:"13px",borderRadius:12,
        border:`1px solid ${T.error}30`,background:T.errorDim,color:T.error,
        fontFamily:font.display,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:24,
      }}>
        🚪 {hi?"Logout करें":"Logout"}
      </button>
    </div>
  );
};

// ─── BOTTOM NAV ───────────────────────────────────────────────────
const NAV = [
  { id:"home",       icon:"🏠", hi:"Home",    en:"Home" },
  { id:"search",     icon:"🔍", hi:"Search",  en:"Search" },
  { id:"my-works",   icon:"📋", hi:"Works",   en:"Works" },
  { id:"profile",    icon:"👤", hi:"Profile", en:"Profile" },
];

const BottomNav = ({ screen, setScreen, lang, reviewCount }) => {
  const hi = lang === "hi";
  const rootScreen = (s) => NAV.some(n => n.id === s) ? s : "home";
  return (
    <div style={{
      position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
      width:"100%",maxWidth:420,background:T.white,
      borderTop:`1px solid ${T.border}`,display:"flex",
      paddingBottom:"env(safe-area-inset-bottom,8px)",zIndex:50,
    }}>
      {NAV.map(n=>{
        const active = rootScreen(screen) === n.id
          || (["assign","tech-profile"].includes(screen) && n.id==="search")
          || (screen==="work-detail" && n.id==="my-works")
          || (screen==="pool" && n.id==="profile");
        return (
          <button key={n.id} onClick={()=>setScreen(n.id)} style={{
            flex:1,padding:"10px 4px 6px",background:"none",border:"none",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            position:"relative",
          }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            {n.id==="my-works" && reviewCount>0 && (
              <span style={{
                position:"absolute",top:6,right:"calc(50% - 18px)",
                width:16,height:16,borderRadius:"50%",
                background:T.error,color:T.white,
                fontFamily:font.mono,fontSize:9,fontWeight:700,
                display:"flex",alignItems:"center",justifyContent:"center",
                border:`2px solid ${T.white}`,
              }}>{reviewCount}</span>
            )}
            <span style={{
              fontFamily:font.mono,fontSize:9,fontWeight:700,letterSpacing:"0.05em",
              color:active?T.sky:T.muted,
            }}>{hi?n.hi:n.en}</span>
            {active && (
              <div style={{
                position:"absolute",bottom:0,
                width:24,height:3,borderRadius:"3px 3px 0 0",background:T.sky,
              }}/>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ─── ROOT ─────────────────────────────────────────────────────────
export default function SIDashboard() {
  const { user } = useAuth();
  const [screen,       setScreen]       = useState("home");
  const [lang,         setLang]         = useState("hi");
  const [selectedTech, setSelectedTech] = useState(null);
  const [siProfile,    setSiProfile]    = useState(null);
  const [siteWorks,    setSiteWorks]    = useState([]);
  const [pool,         setPool]         = useState([]);
  const [loading,      setLoading]      = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [pRes, wRes, poolRes] = await Promise.all([
          api.get("/si"),
          api.get("/si/site-works"),
          api.get("/si/technician-pool"),
        ]);
        setSiProfile(pRes || null);
        setSiteWorks(wRes || []);
        setPool(poolRes || []);
      } catch {}
      setLoading(false);
    };
    loadAll();
  }, []);

  const reviewCount = siteWorks.filter(w => w.status === "COMPLETED_BY_TECH").length;

  const renderScreen = () => {
    if (loading) return <Spinner />;
    switch (screen) {
      case "home":
        return <HomeScreen user={user} siProfile={siProfile} siteWorks={siteWorks} lang={lang} setScreen={setScreen} />;
      case "search":
        return <SearchScreen lang={lang} setScreen={setScreen} setSelectedTech={setSelectedTech} />;
      case "tech-profile":
        return <TechProfileScreen lang={lang} tech={selectedTech} setScreen={setScreen} />;
      case "assign":
        return <AssignScreen lang={lang} tech={selectedTech} setScreen={setScreen} />;
      case "my-works":
        return <MyWorksScreen lang={lang} setScreen={setScreen} siteWorks={siteWorks} />;
      case "pool":
        return <PoolScreen lang={lang} setScreen={setScreen} pool={pool} setSelectedTech={setSelectedTech} />;
      case "profile":
        return <SIProfileScreen user={user} siProfile={siProfile} lang={lang} onProfileSaved={p=>setSiProfile(p)} />;
      default:
        return <HomeScreen user={user} siProfile={siProfile} siteWorks={siteWorks} lang={lang} setScreen={setScreen} />;
    }
  };

  return (
    <>
      <Fonts />
      <div style={{ minHeight:"100vh",background:T.paper,display:"flex",flexDirection:"column",alignItems:"center" }}>
        {/* Top bar */}
        <div style={{
          width:"100%",maxWidth:420,padding:"10px 16px",
          display:"flex",alignItems:"center",justifyContent:"space-between",
          background:T.paper,borderBottom:`1px solid ${T.border}`,
          position:"sticky",top:0,zIndex:40,
        }}>
          <div style={{ fontFamily:font.mono,fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.08em" }}>
            SITE WORK NETWORK
          </div>
          <div style={{ display:"flex",gap:2,background:T.white,border:`1px solid ${T.border}`,borderRadius:20,padding:3 }}>
            {["hi","en"].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{
                padding:"3px 10px",borderRadius:14,border:"none",
                background:lang===l?T.sky:"transparent",
                color:lang===l?T.white:T.muted,
                fontFamily:font.mono,fontSize:11,fontWeight:700,
                cursor:"pointer",transition:"all 0.2s",
              }}>{l==="hi"?"हि":"EN"}</button>
            ))}
          </div>
        </div>

        <div style={{ width:"100%",maxWidth:420,flex:1,paddingBottom:80 }}>
          {renderScreen()}
        </div>

        <BottomNav screen={screen} setScreen={setScreen} lang={lang} reviewCount={reviewCount} />
      </div>
    </>
  );
}
