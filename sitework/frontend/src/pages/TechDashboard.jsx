import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

const T = {
  ink:"#0f0e0c", paper:"#f5f0e8", saffron:"#e8630a", saffronLight:"#ff8c3a",
  saffronDim:"#fde8d4", green:"#1a7a4a", greenLight:"#22a060", greenDim:"#d4f0e2",
  sky:"#1a5fa8", skyDim:"#daeaf8", border:"#e0d8cc", muted:"#6b6258",
  white:"#ffffff", error:"#c0392b", errorDim:"#fdecea", warn:"#b8860b", warnDim:"#fff8e1",
};
const font = {
  display:"'Baloo 2', sans-serif",
  body:"'Noto Sans Devanagari', sans-serif",
  mono:"'Space Mono', monospace",
};
const API_URL = import.meta.env.VITE_API_URL || "";

const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body{background:${T.paper};font-family:${font.body};color:${T.ink};}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    @keyframes ping{0%{transform:scale(1);opacity:.8;}100%{transform:scale(2.2);opacity:0;}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes slideIn{from{transform:translateY(100%);opacity:0;}to{transform:translateY(0);opacity:1;}}
    .fade-up{animation:fadeUp .35s ease both;}
    .fade-up-1{animation:fadeUp .35s .05s ease both;}
    .fade-up-2{animation:fadeUp .35s .10s ease both;}
    .fade-up-3{animation:fadeUp .35s .15s ease both;}
    .slide-in{animation:slideIn .32s ease both;}
    input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:${T.border};outline:none;}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${T.saffron};cursor:pointer;box-shadow:0 2px 8px rgba(232,99,10,.4);}
  `}</style>
);

// ── Shared UI ────────────────────────────────────────────────────────
const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background:T.white, borderRadius:16, border:`1px solid ${T.border}`, boxShadow:"0 2px 12px rgba(0,0,0,.05)", overflow:"hidden", cursor:onClick?"pointer":"default", ...style }}>
    {children}
  </div>
);

const Tag = ({ label, color="saffron" }) => {
  const c = { saffron:{bg:T.saffronDim,text:T.saffron}, green:{bg:T.greenDim,text:T.green}, sky:{bg:T.skyDim,text:T.sky}, ink:{bg:"#e8e4dc",text:T.ink}, warn:{bg:T.warnDim,text:T.warn}, error:{bg:T.errorDim,text:T.error} }[color];
  return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, background:c.bg, color:c.text, fontFamily:font.mono, fontSize:10, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>{label}</span>;
};

const Stars = ({ n }) => <span style={{ color:"#f5a623", letterSpacing:1 }}>{"★".repeat(n)}{"☆".repeat(5-n)}</span>;

const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
    <div style={{ width:32, height:32, border:`3px solid ${T.border}`, borderTopColor:T.saffron, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
  </div>
);

const Avatar = ({ src, initials, size=40 }) => (
  src
    ? <img src={src} alt="" style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:`2px solid ${T.border}` }} />
    : <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${T.saffron},#c45a08)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:font.display, fontSize:size*0.36, fontWeight:800, color:T.white }}>
        {initials}
      </div>
);

// ── Availability Toggle ──────────────────────────────────────────────
const AVAIL_OPTIONS = [
  { id:"AVAILABLE_NOW",      dot:T.greenLight, label:"Available Now",      hi:"अभी Available" },
  { id:"AVAILABLE_TODAY",    dot:"#f5a623",    label:"Available Today",    hi:"आज Available" },
  { id:"AVAILABLE_TOMORROW", dot:T.sky,        label:"Avail. Tomorrow",    hi:"कल Available" },
  { id:"BUSY",               dot:T.error,      label:"Busy",               hi:"Busy" },
  { id:"OFFLINE",            dot:T.muted,      label:"Offline",            hi:"Offline" },
];
const AvailToggle = ({ status, onChange, lang }) => {
  const hi = lang==="hi";
  const [open, setOpen] = useState(false);
  const cur = AVAIL_OPTIONS.find(o=>o.id===status) || AVAIL_OPTIONS[4];
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(!open)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:50, border:`2px solid ${cur.dot}`, background:T.white, cursor:"pointer", fontFamily:font.display, fontSize:13, fontWeight:700, color:T.ink, transition:"all .2s" }}>
        <span style={{ position:"relative", width:10, height:10, flexShrink:0 }}>
          {status==="AVAILABLE_NOW" && <span style={{ position:"absolute", inset:-2, borderRadius:"50%", background:cur.dot, opacity:.35, animation:"ping 1.5s ease-out infinite" }} />}
          <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:cur.dot }} />
        </span>
        {hi ? cur.hi : cur.label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5"><polyline points={open?"18 15 12 9 6 15":"6 9 12 15 18 9"}/></svg>
      </button>
      {open && (
        <div className="slide-in" style={{ position:"absolute", top:"calc(100% + 8px)", left:0, background:T.white, borderRadius:14, border:`1px solid ${T.border}`, boxShadow:"0 8px 32px rgba(0,0,0,.12)", zIndex:50, minWidth:200, overflow:"hidden" }}>
          {AVAIL_OPTIONS.map(o=>(
            <button key={o.id} onClick={()=>{onChange(o.id);setOpen(false);}} style={{ width:"100%", padding:"12px 16px", display:"flex", alignItems:"center", gap:10, background:o.id===status?T.paper:T.white, border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, fontWeight:o.id===status?700:400, color:T.ink, textAlign:"left", transition:"background .15s" }}>
              <span style={{ width:10, height:10, borderRadius:"50%", background:o.dot, flexShrink:0 }} />
              {hi ? o.hi : o.label}
              {o.id===status && <svg style={{marginLeft:"auto"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Checkbox Row (for skills / tools) ───────────────────────────────
const CheckRow = ({ emoji, label, selected, onToggle, color="saffron" }) => {
  const c = { saffron:{border:T.saffron,bg:T.saffronDim,text:T.saffron}, green:{border:T.green,bg:T.greenDim,text:T.green}, ink:{border:T.ink,bg:"#e8e4dc",text:T.ink} }[color];
  return (
    <button onClick={onToggle} style={{ display:"flex", alignItems:"center", gap:12, width:"100%", padding:"13px 14px", borderRadius:12, border:`2px solid ${selected?c.border:T.border}`, background:selected?c.bg:T.white, cursor:"pointer", transition:"all .18s", textAlign:"left" }}>
      <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${selected?c.border:T.border}`, background:selected?c.border:T.white, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .18s" }}>
        {selected && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
      </div>
      {emoji && <span style={{ fontSize:20, flexShrink:0 }}>{emoji}</span>}
      <span style={{ fontFamily:font.display, fontSize:14, fontWeight:selected?700:400, color:selected?c.text:T.ink, flex:1 }}>{label}</span>
    </button>
  );
};

// ── SKILL & TOOL CONSTANTS ───────────────────────────────────────────
const SKILLS = [
  { id:"CCTV_INSTALLATION", e:"📷", l:"CCTV Installation" },
  { id:"CAMERA_SERVICE",    e:"🔧", l:"Camera Service / Repair" },
  { id:"DVR_NVR",           e:"💾", l:"DVR / NVR Setup" },
  { id:"IP_CAMERA",         e:"🌐", l:"IP Camera Setup" },
  { id:"LAN_CABLING",       e:"🔌", l:"LAN Cabling" },
  { id:"WIFI_BRIDGE",       e:"📶", l:"WiFi Bridge / Point" },
  { id:"BIOMETRIC",         e:"👆", l:"Biometric System" },
  { id:"ACCESS_CONTROL",    e:"🚪", l:"Access Control" },
  { id:"NETWORKING",        e:"🖧",  l:"Networking / Switching" },
  { id:"EDGEYE",            e:"👁",  l:"EdgEye Setup" },
];
const TOOLS = [
  { id:"DRILL",      e:"🔩", l:"Drill Machine" },
  { id:"LAN_TESTER", e:"🔬", l:"LAN Tester" },
  { id:"CRIMPING",   e:"✂️", l:"Crimping Tool" },
  { id:"LADDER",     e:"🪜", l:"Ladder (6ft+)" },
  { id:"LAPTOP",     e:"💻", l:"Laptop / Tablet" },
  { id:"MULTIMETER", e:"📟", l:"Multimeter" },
  { id:"BASIC_KIT",  e:"🧰", l:"Basic Field Kit" },
];
const EXP_LEVELS = [
  { id:"NEW",    label:"नया / New",   years:"0" },
  { id:"1_PLUS", label:"1–2 साल",     years:"1-2" },
  { id:"3_PLUS", label:"3–4 साल",     years:"3-4" },
  { id:"5_PLUS", label:"5–9 साल",     years:"5-9" },
  { id:"10_PLUS",label:"10+ साल",     years:"10+" },
];
const VEHICLES = [
  { id:"BIKE", e:"🏍", l:"Bike" }, { id:"SCOOTER", e:"🛵", l:"Scooter" },
  { id:"CAR",  e:"🚗", l:"Car"  }, { id:"NONE",    e:"🚶", l:"कोई नहीं" },
];
const NEXT_ACTION = {
  ACCEPTED:     { ep:"/start-travel", hi:"निकल पड़ा", en:"Start Travel",  color:T.sky },
  ON_THE_WAY:   { ep:"/reached",      hi:"Site पर पहुंचा", en:"Reached Site", color:T.saffron },
  REACHED:      { ep:"/start-work",   hi:"काम शुरू किया", en:"Work Started",  color:T.saffron },
  WORK_STARTED: { ep:"/complete",     hi:"काम पूरा किया", en:"Work Complete", color:T.green },
};
const STATUS_STEPS = ["ACCEPTED","ON_THE_WAY","REACHED","WORK_STARTED","COMPLETED_BY_TECH"];

// ── Group history by month ───────────────────────────────────────────
const groupByMonth = (works) => {
  const map = {};
  works.forEach(w => {
    const d = new Date(w.siClosedAt || w.completedByTechAt || w.updatedAt || w.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    const label = d.toLocaleDateString("en-IN", { month:"long", year:"numeric" });
    if (!map[key]) map[key] = { key, label, items:[], earnings:0 };
    map[key].items.push(w);
    map[key].earnings += w.agreedVisitCharge || 0;
  });
  return Object.values(map).sort((a,b) => b.key.localeCompare(a.key));
};

// ═══════════════════════════════════════════════════════════════════
// HOME SCREEN
// ═══════════════════════════════════════════════════════════════════
const HomeScreen = ({ user, profile, pending, activeWork, onAvailChange, lang, setScreen, setSelectedWork }) => {
  const hi = lang==="hi";
  const isAvail = ["AVAILABLE_NOW","AVAILABLE_TODAY","AVAILABLE_TOMORROW"].includes(profile?.availability);
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";
  const photoSrc = profile?.customPhotoUrl ? `${API_URL}${profile.customPhotoUrl}` : user?.photoUrl;
  const stats = profile?.trustStats || {};

  return (
    <div>
      {/* Header */}
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".1em", marginBottom:2 }}>{hi?"नमस्ते,":"HELLO,"}</div>
            <div style={{ fontFamily:font.display, fontSize:20, fontWeight:800 }}>{user?.name || "Technician"} 👋</div>
          </div>
          <Avatar src={photoSrc} initials={initials} size={42} />
        </div>

        {/* Availability */}
        <div style={{ display:"flex", gap:10, alignItems:"center", marginBottom:14, flexWrap:"wrap" }}>
          <AvailToggle status={profile?.availability || "OFFLINE"} onChange={onAvailChange} lang={lang} />
        </div>

        {/* Visibility banner */}
        {isAvail ? (
          <div className="fade-up" style={{ background:T.greenDim, borderRadius:12, padding:"11px 14px", marginBottom:14, display:"flex", gap:10, alignItems:"center", border:`1px solid ${T.green}40` }}>
            <span style={{ fontSize:18 }}>✅</span>
            <span style={{ fontSize:13, color:T.green, fontWeight:600, fontFamily:font.body }}>
              {hi?"आप nearby SI की search में दिख रहे हैं।":"You are visible in nearby SI searches."}
            </span>
          </div>
        ) : (
          <div className="fade-up" style={{ background:T.errorDim, borderRadius:12, padding:"11px 14px", marginBottom:14, display:"flex", gap:10, alignItems:"center", border:`1px solid ${T.error}40` }}>
            <span style={{ fontSize:18 }}>⚠️</span>
            <div>
              <div style={{ fontSize:13, color:T.error, fontWeight:700, fontFamily:font.body }}>{hi?"आप search में नहीं दिख रहे।":"You are not visible in search."}</div>
              <div style={{ fontSize:12, color:T.error, opacity:.8 }}>{hi?"Available status ON करें।":"Set availability to appear."}</div>
            </div>
          </div>
        )}
      </div>

      {/* Active work */}
      {activeWork && (
        <div style={{ padding:"0 16px 12px" }}>
          <Card style={{ borderLeft:`4px solid ${T.saffron}` }} onClick={()=>{ setSelectedWork(activeWork); setScreen("active-work"); }}>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <Tag label="ACTIVE SITE WORK" color="saffron" />
                <span style={{ fontFamily:font.mono, fontSize:10, color:T.muted }}>{activeWork.status}</span>
              </div>
              <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, marginBottom:4 }}>{activeWork.workType || "Site Work"}</div>
              <div style={{ fontSize:13, color:T.muted }}>📍 {activeWork.siteAddress || "-"}</div>
            </div>
          </Card>
        </div>
      )}

      {/* Pending work requests */}
      <div style={{ padding:"0 16px 12px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
          <div style={{ fontFamily:font.display, fontSize:16, fontWeight:700 }}>{hi?"नए काम के अनुरोध":"New Work Requests"}</div>
          {pending.length > 0 && <Tag label={`${pending.length}`} color="saffron" />}
        </div>
        {pending.length === 0 ? (
          <div style={{ padding:"24px 0", textAlign:"center", color:T.muted, fontSize:14 }}>
            <div style={{ fontSize:36, marginBottom:10 }}>📭</div>
            {hi?"अभी कोई नया काम नहीं है।":"No pending work requests."}
          </div>
        ) : (
          pending.map((w, idx) => (
            <Card key={w._id} className={`fade-up-${Math.min(idx+1,3)}`} style={{ marginBottom:10 }}
              onClick={()=>{ setSelectedWork(w); setScreen("work-detail"); }}>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
                  <div>
                    <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700 }}>{w.siUserId?.name || "SI"}</div>
                    <div style={{ fontSize:12, color:T.muted }}>{w.workType}</div>
                  </div>
                  <div style={{ textAlign:"right" }}>
                    <div style={{ fontFamily:font.mono, fontSize:13, fontWeight:700, color:T.green }}>₹{w.agreedVisitCharge || 0}</div>
                    <div style={{ fontSize:11, color:T.muted }}>{w.paymentMode}</div>
                  </div>
                </div>
                <div style={{ fontSize:13, color:T.muted, marginBottom:10 }}>📍 {w.siteAddress?.slice(0,50)}…</div>
                <div style={{ display:"flex", gap:8 }}>
                  <AcceptBtn workId={w._id} />
                  <RejectBtn workId={w._id} />
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Trust stats */}
      <div style={{ padding:"0 16px 12px" }}>
        <div style={{ fontFamily:font.display, fontSize:16, fontWeight:700, marginBottom:10 }}>{hi?"आपका Trust Score":"Your Trust Score"}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
          {[
            { v:stats.completedSiteWork||0, l:hi?"काम पूरे":"Completed", e:"✅" },
            { v:stats.uniqueSIs||0,         l:"Unique SIs",               e:"🤝" },
            { v:stats.averageRating>0?`${(stats.averageRating).toFixed(1)}★`:"–", l:"Rating", e:"⭐" },
          ].map(s=>(
            <Card key={s.l} style={{ textAlign:"center", padding:"14px 8px" }}>
              <div style={{ fontSize:22, marginBottom:4 }}>{s.e}</div>
              <div style={{ fontFamily:font.mono, fontSize:18, fontWeight:700, color:T.saffron }}>{s.v}</div>
              <div style={{ fontSize:11, color:T.muted, marginTop:2 }}>{s.l}</div>
            </Card>
          ))}
        </div>
      </div>

      {/* Profile strength */}
      {profile && (
        <div style={{ padding:"0 16px 20px" }}>
          <Card onClick={()=>setScreen("profile")}>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <div style={{ fontFamily:font.display, fontSize:14, fontWeight:700 }}>{hi?"Profile Strength":"Profile Strength"}</div>
                <span style={{ fontFamily:font.mono, fontSize:13, fontWeight:700, color:T.saffron }}>{profile.profileStrength||0}%</span>
              </div>
              <div style={{ height:6, background:T.border, borderRadius:3, overflow:"hidden", marginBottom:6 }}>
                <div style={{ height:"100%", background:T.saffron, width:`${profile.profileStrength||0}%`, borderRadius:3 }} />
              </div>
              <div style={{ fontSize:12, color:T.muted }}>👆 {hi?"Tap to edit profile":"Tap to edit your profile"}</div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

// Quick accept/reject buttons on home screen (no nav)
const AcceptBtn = ({ workId }) => {
  const [done, setDone] = useState(false);
  if (done) return <div style={{ flex:1, padding:"9px", borderRadius:10, background:T.greenDim, textAlign:"center", fontSize:13, color:T.green, fontWeight:700 }}>✓ Accepted</div>;
  return (
    <button onClick={async(e)=>{ e.stopPropagation(); try{ await api.post(`/site-work/${workId}/accept`); setDone(true); }catch{} }} style={{ flex:1, padding:"9px", borderRadius:10, background:T.green, color:T.white, fontFamily:font.display, fontSize:14, fontWeight:700, border:"none", cursor:"pointer" }}>
      ✓ {" "}Accept
    </button>
  );
};
const RejectBtn = ({ workId }) => {
  const [done, setDone] = useState(false);
  if (done) return <div style={{ flex:1, padding:"9px", borderRadius:10, background:T.errorDim, textAlign:"center", fontSize:13, color:T.error, fontWeight:700 }}>✕ Rejected</div>;
  return (
    <button onClick={async(e)=>{ e.stopPropagation(); try{ await api.post(`/site-work/${workId}/reject`); setDone(true); }catch{} }} style={{ flex:1, padding:"9px", borderRadius:10, background:T.errorDim, color:T.error, fontFamily:font.display, fontSize:14, fontWeight:700, border:`1px solid ${T.error}40`, cursor:"pointer" }}>
      ✕ {" "}Reject
    </button>
  );
};

// ═══════════════════════════════════════════════════════════════════
// PROFILE SCREEN (view + edit)
// ═══════════════════════════════════════════════════════════════════
const ProfileScreen = ({ user, profile, onSaved, lang, setScreen }) => {
  const { logout } = useAuth();
  const hi = lang==="hi";
  const [editing, setEditing] = useState(!profile || !profile.skills?.length);
  const [saving, setSaving] = useState(false);
  const [saveErr, setSaveErr] = useState("");
  const photoInputRef = useRef();

  // Edit state
  const [skills, setSkills]       = useState(profile?.skills || []);
  const [tools, setTools]         = useState(profile?.tools || []);
  const [expIdx, setExpIdx]       = useState(() => {
    const idx = EXP_LEVELS.findIndex(e=>e.id===profile?.experienceLevel);
    return idx >= 0 ? idx : 0;
  });
  const [age, setAge]             = useState(profile?.approxAge || 25);
  const [city, setCity]           = useState(profile?.city || "");
  const [address, setAddress]     = useState(profile?.permanentAddress || "");
  const [vehicle, setVehicle]     = useState(profile?.vehicle || null);
  const [avail, setAvail]         = useState(profile?.availability || "OFFLINE");
  const [newPhotoFile, setNewPhotoFile] = useState(null);
  const [newPhotoPreview, setNewPhotoPreview] = useState(null);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x=>x!==val) : [...arr, val]);

  const handlePhotoChange = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setNewPhotoFile(f);
    setNewPhotoPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!skills.length) { setSaveErr(hi?"कम से कम 1 skill चुनें":"Select at least 1 skill"); return; }
    setSaving(true); setSaveErr("");
    try {
      if (newPhotoFile) {
        const fd = new FormData();
        fd.append("photo", newPhotoFile);
        await api.post("/technician/photo", fd);
      }
      await api.put("/technician/profile", {
        city, permanentAddress:address, approxAge:age,
        skills, tools, experienceLevel:EXP_LEVELS[expIdx].id,
        vehicle, availability:avail,
      });
      await onSaved();
      setEditing(false);
      setNewPhotoFile(null); setNewPhotoPreview(null);
    } catch(e) {
      setSaveErr(e?.message || "Save failed");
    } finally { setSaving(false); }
  };

  const photoSrc = newPhotoPreview || (profile?.customPhotoUrl ? `${API_URL}${profile.customPhotoUrl}` : user?.photoUrl);
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";

  // View mode
  if (!editing) return (
    <div style={{ padding:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <button onClick={()=>setScreen("home")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, color:T.muted }}>← {hi?"वापस":"Back"}</button>
        <button onClick={()=>setEditing(true)} style={{ padding:"8px 18px", borderRadius:50, border:`1px solid ${T.saffron}`, background:T.saffronDim, color:T.saffron, fontFamily:font.display, fontSize:13, fontWeight:700, cursor:"pointer" }}>
          ✏️ {hi?"Edit":"Edit Profile"}
        </button>
      </div>

      {/* Header */}
      <div className="fade-up" style={{ textAlign:"center", marginBottom:20 }}>
        <Avatar src={photoSrc} initials={initials} size={80} />
        <div style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginTop:12 }}>{user?.name}</div>
        {profile?.city && <div style={{ fontSize:14, color:T.muted, marginTop:4 }}>📍 {profile.city}</div>}
        {profile?.permanentAddress && <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>🏠 {profile.permanentAddress}</div>}
        <div style={{ marginTop:8, display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap" }}>
          {profile?.skills?.slice(0,4).map(s=>{ const sk=SKILLS.find(x=>x.id===s); return sk?<Tag key={s} label={sk.l} color="saffron" />:null; })}
        </div>
      </div>

      {/* Bio */}
      {(profile?.generatedBioEn || profile?.generatedBioHi) && (
        <Card className="fade-up-1" style={{ marginBottom:12 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>AUTO-GENERATED PROFILE</div>
            <p style={{ fontSize:13, color:T.ink, lineHeight:1.75 }}>
              {hi ? profile.generatedBioHi : profile.generatedBioEn}
            </p>
          </div>
        </Card>
      )}

      {/* Stats */}
      <Card className="fade-up-2" style={{ marginBottom:12 }}>
        <div style={{ padding:"14px 16px" }}>
          <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:12 }}>TRUST STATS</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { e:"✅", v:profile?.trustStats?.completedSiteWork||0, l:hi?"काम पूरे":"Completed" },
              { e:"🤝", v:profile?.trustStats?.uniqueSIs||0, l:"Unique SIs" },
              { e:"⭐", v:profile?.trustStats?.averageRating>0?`${(profile.trustStats.averageRating).toFixed(1)}★`:"–", l:"Avg Rating" },
              { e:"📅", v:profile?.trustStats?.totalRatings||0, l:hi?"Ratings":"Ratings" },
            ].map(s=>(
              <div key={s.l} style={{ display:"flex", gap:10, alignItems:"center" }}>
                <span style={{ fontSize:22 }}>{s.e}</span>
                <div>
                  <div style={{ fontFamily:font.mono, fontSize:18, fontWeight:700, color:T.saffron, lineHeight:1 }}>{s.v}</div>
                  <div style={{ fontSize:12, color:T.muted }}>{s.l}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Share */}
      {profile?.profileSlug && (
        <Card className="fade-up-3" style={{ marginBottom:24 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, marginBottom:8 }}>{hi?"Profile Share करें":"Share Your Profile"}</div>
            <div style={{ background:T.paper, borderRadius:10, padding:"10px 12px", fontFamily:font.mono, fontSize:11, color:T.muted, marginBottom:10, wordBreak:"break-all" }}>
              https://sitemitra.iotsoft.in/tech/{profile.profileSlug}
            </div>
            <a href={`https://wa.me/?text=मैं CCTV technician हूँ। Profile: https://sitemitra.iotsoft.in/tech/${profile.profileSlug}`} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", borderRadius:50, background:"#25D366", color:T.white, fontFamily:font.display, fontSize:14, fontWeight:700, textDecoration:"none" }}>
              💬 WhatsApp पर Share करें
            </a>
          </div>
        </Card>
      )}

      {/* Logout */}
      <button onClick={logout} style={{ width:"100%", padding:"15px", borderRadius:50, border:`1px solid ${T.error}50`, background:T.errorDim, color:T.error, fontFamily:font.display, fontSize:15, fontWeight:700, cursor:"pointer", marginBottom:40, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
        🚪 {hi?"Logout करें":"Logout"}
      </button>
    </div>
  );

  // Edit mode
  return (
    <div style={{ padding:16 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <button onClick={()=>profile?.skills?.length?setEditing(false):setScreen("home")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, color:T.muted }}>
          ← {hi?"वापस":"Back"}
        </button>
        <div style={{ fontFamily:font.mono, fontSize:11, fontWeight:700, color:T.saffron, letterSpacing:".08em" }}>PROFILE BUILDER</div>
        <div style={{ width:60 }} />
      </div>

      {saveErr && (
        <div style={{ background:T.errorDim, borderRadius:10, padding:"10px 14px", marginBottom:14, fontSize:13, color:T.error, fontFamily:font.body }}>{saveErr}</div>
      )}

      {/* Photo */}
      <Card style={{ marginBottom:16, padding:"16px" }}>
        <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:12, textTransform:"uppercase" }}>Profile Photo</div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <Avatar src={photoSrc} initials={initials} size={64} />
          <div>
            <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, marginBottom:4 }}>{user?.name}</div>
            <button onClick={()=>photoInputRef.current?.click()} style={{ padding:"8px 16px", borderRadius:50, border:`1px solid ${T.border}`, background:T.white, cursor:"pointer", fontFamily:font.display, fontSize:13, fontWeight:700, color:T.muted }}>
              📷 {hi?"Photo बदलें":"Change Photo"}
            </button>
            <input ref={photoInputRef} type="file" accept="image/*" capture="user" style={{ display:"none" }} onChange={handlePhotoChange} />
          </div>
        </div>
      </Card>

      {/* Address */}
      <Card style={{ marginBottom:16, padding:"16px" }}>
        <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:12, textTransform:"uppercase" }}>📍 Location</div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12, color:T.muted, marginBottom:6, fontFamily:font.mono }}>काम का शहर / City</div>
          <input value={city} onChange={e=>setCity(e.target.value)} placeholder={hi?"जैसे: Jaipur, Delhi…":"e.g. Jaipur, Delhi…"} style={{ width:"100%", padding:"11px 14px", border:`2px solid ${city?T.saffron:T.border}`, borderRadius:10, outline:"none", fontFamily:font.display, fontSize:14, color:T.ink, background:T.white }} />
        </div>
        <div>
          <div style={{ fontSize:12, color:T.muted, marginBottom:6, fontFamily:font.mono }}>Permanent Address (Optional)</div>
          <input value={address} onChange={e=>setAddress(e.target.value)} placeholder={hi?"घर का पता…":"Home / permanent address…"} style={{ width:"100%", padding:"11px 14px", border:`2px solid ${address?T.sky:T.border}`, borderRadius:10, outline:"none", fontFamily:font.display, fontSize:14, color:T.ink, background:T.white }} />
        </div>
      </Card>

      {/* Skills */}
      <Card style={{ marginBottom:16, padding:"16px" }}>
        <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:4, textTransform:"uppercase" }}>🔧 आपकी Skills</div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:12, lineHeight:1.5 }}>
          {hi?"जो काम आता है वो tick करें:":"Tick the work you can do:"}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {SKILLS.map(s=>(
            <CheckRow key={s.id} emoji={s.e} label={s.l} selected={skills.includes(s.id)} onToggle={()=>toggle(skills,setSkills,s.id)} color="saffron" />
          ))}
        </div>
        {!skills.length && <p style={{ marginTop:10, fontSize:12, color:T.error, fontFamily:font.mono }}>* कम से कम 1 skill चुनें</p>}
      </Card>

      {/* Tools */}
      <Card style={{ marginBottom:16, padding:"16px" }}>
        <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:4, textTransform:"uppercase" }}>🧰 आपके पास Tools</div>
        <div style={{ fontSize:13, color:T.muted, marginBottom:12 }}>{hi?"जो tools हैं वो tick करें:":"Tick the tools you own:"}</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {TOOLS.map(t=>(
            <CheckRow key={t.id} emoji={t.e} label={t.l} selected={tools.includes(t.id)} onToggle={()=>toggle(tools,setTools,t.id)} color="green" />
          ))}
        </div>
      </Card>

      {/* Experience slider */}
      <Card style={{ marginBottom:16, padding:"16px" }}>
        <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:12, textTransform:"uppercase" }}>📅 Field Experience</div>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontFamily:font.display, fontSize:20, fontWeight:800, color:T.saffron }}>{EXP_LEVELS[expIdx].label}</span>
          <span style={{ fontFamily:font.mono, fontSize:12, color:T.muted }}>{EXP_LEVELS[expIdx].years} {hi?"साल":"yrs"}</span>
        </div>
        <input type="range" min="0" max="4" value={expIdx} onChange={e=>setExpIdx(+e.target.value)} />
        <div style={{ display:"flex", justifyContent:"space-between", marginTop:6 }}>
          {EXP_LEVELS.map((e,i)=>(
            <span key={e.id} style={{ fontFamily:font.mono, fontSize:9, color:i===expIdx?T.saffron:T.muted, fontWeight:i===expIdx?700:400 }}>{e.years}</span>
          ))}
        </div>
      </Card>

      {/* Approx age */}
      <Card style={{ marginBottom:16, padding:"16px" }}>
        <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:14, textTransform:"uppercase" }}>🎂 Approx Age</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:24 }}>
          <button onClick={()=>setAge(a=>Math.max(18,a-1))} style={{ width:44, height:44, borderRadius:"50%", border:`2px solid ${T.border}`, background:T.white, fontSize:22, cursor:"pointer", fontWeight:700, color:T.ink }}>−</button>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontFamily:font.mono, fontSize:36, fontWeight:700, color:T.saffron, lineHeight:1 }}>{age}</div>
            <div style={{ fontSize:12, color:T.muted, marginTop:4 }}>{hi?"साल की उम्र":"years old"}</div>
          </div>
          <button onClick={()=>setAge(a=>Math.min(65,a+1))} style={{ width:44, height:44, borderRadius:"50%", border:`2px solid ${T.border}`, background:T.white, fontSize:22, cursor:"pointer", fontWeight:700, color:T.ink }}>+</button>
        </div>
      </Card>

      {/* Vehicle */}
      <Card style={{ marginBottom:16, padding:"16px" }}>
        <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:12, textTransform:"uppercase" }}>🚗 Vehicle</div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          {VEHICLES.map(v=>(
            <button key={v.id} onClick={()=>setVehicle(vehicle===v.id?null:v.id)} style={{ display:"flex", alignItems:"center", gap:8, padding:"10px 16px", borderRadius:50, border:`2px solid ${vehicle===v.id?T.green:T.border}`, background:vehicle===v.id?T.greenDim:T.white, cursor:"pointer", fontFamily:font.display, fontSize:14, fontWeight:vehicle===v.id?700:400, color:vehicle===v.id?T.green:T.ink, transition:"all .18s" }}>
              <span style={{ fontSize:18 }}>{v.e}</span>{v.l}
            </button>
          ))}
        </div>
      </Card>

      {/* Availability */}
      <Card style={{ marginBottom:20, padding:"16px" }}>
        <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:12, textTransform:"uppercase" }}>🟢 Availability (अभी)</div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {AVAIL_OPTIONS.map(o=>(
            <button key={o.id} onClick={()=>setAvail(o.id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:12, border:`2px solid ${avail===o.id?o.dot:T.border}`, background:avail===o.id?"rgba(0,0,0,.03)":T.white, cursor:"pointer", textAlign:"left" }}>
              <span style={{ width:12, height:12, borderRadius:"50%", background:o.dot, flexShrink:0 }} />
              <span style={{ fontFamily:font.display, fontSize:14, fontWeight:avail===o.id?700:400, color:T.ink }}>{hi?o.hi:o.label}</span>
              {avail===o.id && <svg style={{marginLeft:"auto"}} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>
      </Card>

      {/* Save */}
      <button onClick={handleSave} disabled={saving||!skills.length} style={{ width:"100%", padding:"16px", borderRadius:50, border:"none", background:skills.length?T.saffron:T.border, color:T.white, fontFamily:font.display, fontSize:16, fontWeight:700, cursor:saving||!skills.length?"not-allowed":"pointer", boxShadow:skills.length?"0 4px 20px rgba(232,99,10,.35)":"none", marginBottom:12, display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
        {saving ? <div style={{ width:20, height:20, border:"2px solid white", borderTopColor:"transparent", borderRadius:"50%", animation:"spin .8s linear infinite" }} /> : "✨"}
        {saving?(hi?"Saving…":"Saving…"):(hi?"Profile Save करें & Generate करें":"Save & Generate Profile")}
      </button>
      <div style={{ paddingBottom:40 }} />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ACTIVE WORK SCREEN
// ═══════════════════════════════════════════════════════════════════
const ActiveWorkScreen = ({ work, lang, setScreen, onStatusChange }) => {
  const hi = lang==="hi";
  const [actionLoading, setActionLoading] = useState(false);
  const [proofUploading, setProofUploading] = useState(false);
  const [proofDone, setProofDone] = useState(false);
  const [proofErr, setProofErr] = useState("");
  const proofRef = useRef();

  if (!work) return (
    <div style={{ padding:40, textAlign:"center", color:T.muted }}>
      <div style={{ fontSize:40, marginBottom:12 }}>⚡</div>
      <div style={{ fontFamily:font.display, fontSize:16 }}>{hi?"कोई active काम नहीं।":"No active work."}</div>
      <button onClick={()=>setScreen("home")} style={{ marginTop:16, padding:"10px 24px", borderRadius:50, border:`1px solid ${T.border}`, background:T.white, cursor:"pointer", fontFamily:font.display, fontSize:14, fontWeight:700, color:T.muted }}>← {hi?"वापस":"Back"}</button>
    </div>
  );

  const curStepIdx = STATUS_STEPS.indexOf(work.status);
  const next = NEXT_ACTION[work.status];

  const handleNext = async () => {
    if (!next) return;
    setActionLoading(true);
    try {
      await api.post(`/site-work/${work._id}${next.ep}`);
      await onStatusChange();
    } catch(e) { alert(e?.message || "Error") }
    finally { setActionLoading(false); }
  };

  const handleProofPick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofUploading(true); setProofErr("");
    try {
      const fd = new FormData();
      fd.append("photo", file);
      await api.post(`/site-work/${work._id}/proof-photo`, fd);
      setProofDone(true);
    } catch(e) { setProofErr(e?.message || "Upload failed"); }
    finally { setProofUploading(false); }
  };

  const siPhone = work.siUserId?.mobile || "";
  const siName = work.siUserId?.name || "SI";

  return (
    <div>
      <div style={{ padding:"16px 16px 0" }}>
        <button onClick={()=>setScreen("home")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, color:T.muted, marginBottom:16 }}>
          ← {hi?"वापस":"Back"}
        </button>
        <div style={{ fontFamily:font.mono, fontSize:11, color:T.saffron, letterSpacing:".1em", marginBottom:6 }}>ACTIVE SITE WORK</div>
        <h2 style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginBottom:16 }}>{work.workType || "Site Work"}</h2>

        {/* SI info */}
        <Card style={{ marginBottom:12 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>SI / CONTRACTOR</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:font.display, fontSize:16, fontWeight:700 }}>{siName}</div>
                {siPhone && <div style={{ fontSize:13, color:T.muted }}>+91 {siPhone}</div>}
              </div>
              {siPhone && (
                <div style={{ display:"flex", gap:8 }}>
                  <a href={`tel:${siPhone}`} style={{ width:40, height:40, borderRadius:"50%", background:T.greenDim, border:`1px solid ${T.green}40`, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", fontSize:18 }}>📞</a>
                  <a href={`https://wa.me/91${siPhone}`} target="_blank" rel="noreferrer" style={{ width:40, height:40, borderRadius:"50%", background:"#e6f9f0", border:"1px solid #1a7a3a40", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", fontSize:18 }}>💬</a>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Site details */}
        <Card style={{ marginBottom:12 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>SITE DETAILS</div>
            {work.siteAddress && <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>📍 {work.siteAddress}</div>}
            {work.description && <div style={{ fontSize:13, color:T.muted, marginBottom:10 }}>{work.description}</div>}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom: work.siteAddress ? 12 : 0 }}>
              {work.preferredVisitTime && <div style={{ fontSize:13 }}>⏰ {work.preferredVisitTime}</div>}
              {work.agreedVisitCharge && <div style={{ fontSize:13 }}>💰 ₹{work.agreedVisitCharge} · {work.paymentMode}</div>}
            </div>
            {work.siteAddress && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(work.siteAddress)}`} target="_blank" rel="noreferrer"
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"10px", borderRadius:10, background:T.skyDim, border:`1px solid ${T.sky}40`, color:T.sky, fontFamily:font.display, fontSize:13, fontWeight:700, textDecoration:"none" }}>
                🗺️ {hi?"Google Maps में खोलें":"Open in Google Maps"}
              </a>
            )}
          </div>
        </Card>

        {/* Status timeline */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:14 }}>PROGRESS</div>
            {STATUS_STEPS.map((s,i)=>{
              const done = i <= curStepIdx;
              const labels = { ACCEPTED:hi?"Accepted":"Accepted", ON_THE_WAY:hi?"On The Way":"On The Way", REACHED:hi?"Site पर पहुंचा":"Reached Site", WORK_STARTED:hi?"काम शुरू":"Work Started", COMPLETED_BY_TECH:hi?"पूरा":"Completed" };
              return (
                <div key={s} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:i<STATUS_STEPS.length-1?14:0 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:done?T.green:T.border, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : <span style={{ width:8, height:8, borderRadius:"50%", background:T.muted, display:"block" }} />}
                    </div>
                    {i<STATUS_STEPS.length-1 && <div style={{ width:2, flex:1, minHeight:16, background:done?T.green:T.border, marginTop:2 }} />}
                  </div>
                  <div style={{ paddingBottom:i<STATUS_STEPS.length-1?12:0 }}>
                    <div style={{ fontFamily:font.display, fontSize:14, fontWeight:700, color:done?T.ink:T.muted }}>{labels[s]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Next action */}
        {next && work.status !== "COMPLETED_BY_TECH" && (
          <button onClick={handleNext} disabled={actionLoading} style={{ width:"100%", padding:"15px", borderRadius:50, border:"none", background:next.color, color:T.white, fontFamily:font.display, fontSize:16, fontWeight:700, cursor:"pointer", marginBottom:12, boxShadow:`0 4px 20px ${next.color}50`, opacity:actionLoading?.7:1 }}>
            {actionLoading ? "…" : `${hi?next.hi:next.en} →`}
          </button>
        )}

        {/* Proof photo — real file picker */}
        {work.status === "COMPLETED_BY_TECH" && !proofDone && (
          <div className="slide-in" style={{ background:T.saffronDim, borderRadius:14, padding:16, marginBottom:12, border:`1px solid ${T.saffron}40` }}>
            <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, marginBottom:6 }}>{hi?"1 Proof Photo Upload करें":"Upload 1 Proof Photo"}</div>
            <div style={{ fontSize:12, color:T.muted, marginBottom:12, lineHeight:1.6 }}>{hi?"सिर्फ 1 photo। Max 400KB।":"Max 1 photo · Max 400KB."}</div>
            {proofErr && <div style={{ fontSize:12, color:T.error, marginBottom:8 }}>{proofErr}</div>}
            <input ref={proofRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleProofPick} />
            <button onClick={()=>proofRef.current?.click()} disabled={proofUploading} style={{ width:"100%", padding:"13px", borderRadius:50, border:`2px dashed ${T.saffron}`, background:T.white, cursor:"pointer", fontFamily:font.display, fontSize:14, fontWeight:700, color:T.saffron }}>
              {proofUploading ? "Uploading…" : `📷 ${hi?"Photo खींचें / Upload करें":"Take or Upload Photo"}`}
            </button>
          </div>
        )}

        {proofDone && (
          <div className="slide-in" style={{ background:T.greenDim, borderRadius:14, padding:16, marginBottom:12, border:`1px solid ${T.green}40` }}>
            <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, color:T.green, marginBottom:4 }}>✅ {hi?"Proof Photo Upload हो गई":"Proof Photo Uploaded"}</div>
            <div style={{ fontSize:12, color:T.green, opacity:.8 }}>{hi?"SI review करेगा।":"SI will review and close."}</div>
          </div>
        )}

        {/* Cancel */}
        <button onClick={async()=>{ if(!confirm("Cancel this work?"))return; try{await api.post(`/site-work/${work._id}/cancel`);setScreen("home");}catch{} }} style={{ width:"100%", padding:"13px", borderRadius:50, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", fontFamily:font.display, fontSize:14, fontWeight:700, color:T.muted, marginBottom:24 }}>
          {hi?"Site Work Cancel करें":"Cancel Site Work"}
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// WORK DETAIL SCREEN (incoming — accept/reject)
// ═══════════════════════════════════════════════════════════════════
const WorkDetailScreen = ({ work, lang, setScreen, onRefresh }) => {
  const hi = lang==="hi";
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [done, setDone] = useState("");

  if (!work) return null;

  const handleAccept = async () => {
    setAccepting(true);
    try { await api.post(`/site-work/${work._id}/accept`); setDone("accepted"); await onRefresh(); }
    catch(e) { alert(e?.message||"Error"); }
    finally { setAccepting(false); }
  };
  const handleReject = async () => {
    setRejecting(true);
    try { await api.post(`/site-work/${work._id}/reject`); setDone("rejected"); await onRefresh(); }
    catch(e) { alert(e?.message||"Error"); }
    finally { setRejecting(false); }
  };

  return (
    <div style={{ padding:16 }}>
      <button onClick={()=>setScreen("home")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, color:T.muted, marginBottom:16 }}>← {hi?"वापस":"Back"}</button>
      <div style={{ fontFamily:font.mono, fontSize:11, color:T.saffron, letterSpacing:".1em", marginBottom:6 }}>WORK REQUEST</div>
      <h2 style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginBottom:16 }}>{work.workType}</h2>

      {done && (
        <div style={{ background:done==="accepted"?T.greenDim:T.errorDim, borderRadius:12, padding:"14px 16px", marginBottom:16, fontFamily:font.display, fontSize:15, fontWeight:700, color:done==="accepted"?T.green:T.error }}>
          {done==="accepted"?(hi?"काम accept किया ✓":"Work Accepted ✓"):(hi?"काम reject किया":"Work Rejected")}
        </div>
      )}

      <Card style={{ marginBottom:12 }}>
        <div style={{ padding:"14px 16px" }}>
          {[
            { l:"SI", v:`${work.siUserId?.name||"—"}` },
            { l:hi?"Site Address":"Site Address", v:`📍 ${work.siteAddress||"—"}` },
            { l:hi?"काम का विवरण":"Description", v:work.description||"—" },
            { l:hi?"पसंदीदा समय":"Preferred Time", v:`⏰ ${work.preferredVisitTime||"—"}` },
            { l:hi?"Agreed Charge":"Agreed Charge", v:`₹${work.agreedVisitCharge||0} · ${work.paymentMode||"—"}` },
          ].map(r=>(
            <div key={r.l} style={{ marginBottom:12 }}>
              <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:3 }}>{r.l.toUpperCase()}</div>
              <div style={{ fontSize:14, color:T.ink, lineHeight:1.5 }}>{r.v}</div>
              <div style={{ height:1, background:T.border, marginTop:10 }} />
            </div>
          ))}
        </div>
      </Card>

      <div style={{ background:T.saffronDim, borderRadius:12, padding:"12px 14px", marginBottom:16, fontSize:12, color:"#7a4a1a", lineHeight:1.6, border:`1px solid ${T.saffron}30` }}>
        {hi?"काम accept करने से मैं confirm करता/करती हूँ कि work scope और payment SI से directly discuss हो गई है।":"By accepting I confirm scope and payment have been discussed directly with SI."}
      </div>

      {!done && (
        <div style={{ display:"flex", gap:10, marginBottom:24 }}>
          <button onClick={handleAccept} disabled={accepting} style={{ flex:1, padding:"14px", borderRadius:50, border:"none", background:T.green, color:T.white, fontFamily:font.display, fontSize:15, fontWeight:700, cursor:"pointer", boxShadow:`0 4px 16px ${T.green}40`, opacity:accepting?.7:1 }}>
            {accepting?"…":`✓ ${hi?"Accept करें":"Accept Work"}`}
          </button>
          <button onClick={handleReject} disabled={rejecting} style={{ flex:1, padding:"14px", borderRadius:50, border:`1px solid ${T.border}`, background:T.white, color:T.error, fontFamily:font.display, fontSize:15, fontWeight:700, cursor:"pointer", opacity:rejecting?.7:1 }}>
            {rejecting?"…":`✕ ${hi?"Reject":"Reject"}`}
          </button>
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// HISTORY DETAIL MODAL
// ═══════════════════════════════════════════════════════════════════
const HistoryDetailModal = ({ work, lang, onClose }) => {
  const hi = lang==="hi";
  if (!work) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}
      onClick={onClose}>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.45)" }} />
      <div className="slide-in" onClick={e=>e.stopPropagation()}
        style={{ width:"100%", maxWidth:420, background:T.white, borderRadius:"20px 20px 0 0", padding:"20px 16px 32px", position:"relative", maxHeight:"85vh", overflowY:"auto" }}>
        {/* Handle bar */}
        <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 18px" }} />
        <div style={{ fontFamily:font.mono, fontSize:10, color:T.saffron, letterSpacing:".1em", marginBottom:6 }}>WORK DETAILS</div>
        <div style={{ fontFamily:font.display, fontSize:20, fontWeight:800, marginBottom:16 }}>{work.workType||"Site Work"}</div>

        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {[
            { l:hi?"SI / Contractor":"SI / Contractor", v:work.siUserId?.name||"—" },
            { l:hi?"Site Address":"Site Address", v:work.siteAddress ? `📍 ${work.siteAddress}` : "—" },
            { l:hi?"विवरण":"Description", v:work.description||"—" },
            { l:hi?"पसंदीदा समय":"Preferred Time", v:work.preferredVisitTime ? `⏰ ${work.preferredVisitTime}` : "—" },
            { l:hi?"Agreed Charge":"Agreed Charge", v:work.agreedVisitCharge ? `₹${work.agreedVisitCharge} · ${work.paymentMode||""}` : "—" },
            { l:hi?"Status":"Status", v:work.status||"—" },
            { l:hi?"Date":"Date", v:new Date(work.siClosedAt||work.completedByTechAt||work.updatedAt||work.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) },
          ].map(r=>(
            <div key={r.l} style={{ paddingBottom:12, marginBottom:12, borderBottom:`1px solid ${T.border}` }}>
              <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:4 }}>{r.l.toUpperCase()}</div>
              <div style={{ fontSize:14, color:T.ink, lineHeight:1.5 }}>{r.v}</div>
            </div>
          ))}
        </div>

        {work.ratingBySI && (
          <div style={{ background:T.warnDim, borderRadius:12, padding:"12px 14px", marginBottom:16, border:`1px solid ${T.warn}30` }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.warn, letterSpacing:".08em", marginBottom:6 }}>SI RATING</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Stars n={work.ratingBySI.stars||0} />
              <span style={{ fontFamily:font.mono, fontSize:13, fontWeight:700, color:T.warn }}>{work.ratingBySI.stars||0}/5</span>
            </div>
            {work.ratingBySI.comment && <div style={{ fontSize:13, color:T.muted, marginTop:6 }}>"{work.ratingBySI.comment}"</div>}
          </div>
        )}

        <button onClick={onClose} style={{ width:"100%", padding:"14px", borderRadius:50, border:`1px solid ${T.border}`, background:T.white, cursor:"pointer", fontFamily:font.display, fontSize:15, fontWeight:700, color:T.muted }}>
          {hi?"बंद करें":"Close"}
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// HISTORY SCREEN (month-wise grouped)
// ═══════════════════════════════════════════════════════════════════
const HistoryScreen = ({ history, lang }) => {
  const hi = lang==="hi";
  const grouped = useMemo(()=>groupByMonth(history),[history]);
  const [detailWork, setDetailWork] = useState(null);

  if (!history.length) return (
    <div style={{ padding:40, textAlign:"center", color:T.muted }}>
      <div style={{ fontSize:40, marginBottom:12 }}>📋</div>
      <div style={{ fontFamily:font.display, fontSize:16 }}>{hi?"अभी कोई Site Work history नहीं।":"No site work history yet."}</div>
    </div>
  );

  return (
    <>
      <div style={{ padding:"16px 16px 24px" }}>
        <div style={{ fontFamily:font.display, fontSize:20, fontWeight:800, marginBottom:16 }}>{hi?"Site Work History":"Site Work History"}</div>
        {grouped.map(g=>(
          <div key={g.key} style={{ marginBottom:20 }}>
            {/* Month header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8, paddingBottom:8, borderBottom:`2px solid ${T.saffron}30` }}>
              <div style={{ fontFamily:font.display, fontSize:16, fontWeight:800 }}>{g.label}</div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:font.mono, fontSize:13, fontWeight:700, color:T.green }}>₹{g.earnings.toLocaleString("en-IN")}</div>
                <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted }}>{g.items.length} {hi?"काम":"works"}</div>
              </div>
            </div>
            {g.items.map((w,i)=>(
              <Card key={w._id||i} className={`fade-up-${Math.min(i+1,3)}`} style={{ marginBottom:8 }}
                onClick={()=>setDetailWork(w)}>
                <div style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                    <div>
                      <div style={{ fontFamily:font.display, fontSize:14, fontWeight:700 }}>{w.workType||"Site Work"}</div>
                      <div style={{ fontSize:12, color:T.muted }}>{w.siUserId?.name||"SI"}</div>
                    </div>
                    <div style={{ textAlign:"right" }}>
                      <div style={{ fontFamily:font.mono, fontSize:13, fontWeight:700, color:T.green }}>₹{w.agreedVisitCharge||0}</div>
                      {w.ratingBySI?.stars && <Stars n={w.ratingBySI.stars} />}
                    </div>
                  </div>
                  <div style={{ fontSize:11, color:T.muted, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <span>
                      📅 {new Date(w.siClosedAt||w.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short"})}
                      {" · "}
                      <span style={{ textTransform:"uppercase", letterSpacing:".04em" }}>{w.status}</span>
                    </span>
                    <span style={{ color:T.saffron, fontSize:14 }}>›</span>
                  </div>
                </div>
              </Card>
            ))}
            {/* Monthly summary chip */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:6 }}>
              <div style={{ padding:"4px 12px", borderRadius:20, background:T.greenDim, color:T.green, fontFamily:font.mono, fontSize:10, fontWeight:700 }}>
                {hi?"कुल काम:":"Total:"} {g.items.length}
              </div>
              <div style={{ padding:"4px 12px", borderRadius:20, background:T.saffronDim, color:T.saffron, fontFamily:font.mono, fontSize:10, fontWeight:700 }}>
                {hi?"कुल कमाई:":"Earnings:"} ₹{g.earnings.toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        ))}
      </div>
      {detailWork && <HistoryDetailModal work={detailWork} lang={lang} onClose={()=>setDetailWork(null)} />}
    </>
  );
};

// ── Bottom Nav ───────────────────────────────────────────────────────
const NAV = [
  { id:"home", icon:"🏠", hi:"Home",    en:"Home" },
  { id:"active-work", icon:"⚡", hi:"Active", en:"Active" },
  { id:"history", icon:"📋", hi:"History", en:"History" },
  { id:"profile", icon:"👤", hi:"Profile", en:"Profile" },
];
const BottomNav = ({ screen, setScreen, lang, pendingCount }) => {
  const hi = lang==="hi";
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, background:T.white, borderTop:`1px solid ${T.border}`, display:"flex", paddingBottom:"env(safe-area-inset-bottom,8px)", zIndex:50 }}>
      {NAV.map(n=>{
        const active = screen===n.id || (screen==="work-detail"&&n.id==="home");
        return (
          <button key={n.id} onClick={()=>setScreen(n.id)} style={{ flex:1, padding:"10px 4px 6px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, position:"relative" }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            {n.id==="home" && pendingCount>0 && (
              <span style={{ position:"absolute", top:6, right:"calc(50% - 16px)", width:16, height:16, borderRadius:"50%", background:T.error, color:T.white, fontFamily:font.mono, fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${T.white}` }}>{pendingCount}</span>
            )}
            <span style={{ fontFamily:font.mono, fontSize:9, fontWeight:700, letterSpacing:".05em", color:active?T.saffron:T.muted }}>{hi?n.hi:n.en}</span>
            {active && <div style={{ position:"absolute", bottom:0, width:24, height:3, borderRadius:"3px 3px 0 0", background:T.saffron }} />}
          </button>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════
export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [siteWorks, setSiteWorks] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [screen, setScreen]       = useState("home");
  const [lang, setLang]           = useState(localStorage.getItem("sm_lang")||"hi");
  const [selectedWork, setSelectedWork] = useState(null);

  useEffect(()=>{ loadAll(); },[]);

  const loadAll = async () => {
    setLoading(true);
    const [p, w] = await Promise.allSettled([
      api.get("/technician/profile"),
      api.get("/technician/site-works"),
    ]);
    if (p.status==="fulfilled") setProfile(p.value?.data ?? null);
    if (w.status==="fulfilled") setSiteWorks(Array.isArray(w.value?.data) ? w.value.data : []);
    setLoading(false);
  };

  const refreshProfile = async () => {
    const r = await api.get("/technician/profile");
    setProfile(r.data);
    return r.data;
  };

  const handleAvailChange = async (av) => {
    try {
      await api.post("/technician/availability", { availability: av });
      setProfile(p=>({...p, availability:av}));
      // Request location when going available
      if (["AVAILABLE_NOW","AVAILABLE_TODAY","AVAILABLE_TOMORROW"].includes(av) && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await api.post("/technician/location", {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
            } catch {}
          },
          () => {} // user denied — silently skip
        );
      }
    } catch {}
  };

  const pending = siteWorks.filter(w=>w.status==="PENDING_ACCEPTANCE");
  const activeWork = siteWorks.find(w=>["ACCEPTED","ON_THE_WAY","REACHED","WORK_STARTED"].includes(w.status));
  const history = siteWorks.filter(w=>["CLOSED","CANCELLED_BY_SI","CANCELLED_BY_TECH","DISPUTED"].includes(w.status));

  if (loading) return <><Fonts /><div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:T.paper }}><Spinner /></div></>;

  const renderScreen = () => {
    switch(screen) {
      case "home":
        return <HomeScreen user={user} profile={profile} pending={pending} activeWork={activeWork} onAvailChange={handleAvailChange} lang={lang} setScreen={setScreen} setSelectedWork={setSelectedWork} />;
      case "active-work":
        return <ActiveWorkScreen work={selectedWork||activeWork} lang={lang} setScreen={setScreen} onStatusChange={loadAll} />;
      case "work-detail":
        return <WorkDetailScreen work={selectedWork} lang={lang} setScreen={setScreen} onRefresh={loadAll} />;
      case "profile":
        return <ProfileScreen user={user} profile={profile} onSaved={refreshProfile} lang={lang} setScreen={setScreen} />;
      case "history":
        return <HistoryScreen history={history} lang={lang} />;
      default:
        return null;
    }
  };

  return (
    <>
      <Fonts />
      <div style={{ minHeight:"100vh", background:T.paper, display:"flex", flexDirection:"column", alignItems:"center" }}>
        {/* Top bar */}
        <div style={{ width:"100%", maxWidth:420, padding:"10px 16px", display:"flex", alignItems:"center", justifyContent:"space-between", background:T.paper, borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, zIndex:40 }}>
          <div style={{ fontFamily:font.mono, fontSize:11, fontWeight:700, color:T.muted, letterSpacing:".08em" }}>SITEMITRA</div>
          <div style={{ display:"flex", gap:2, background:T.white, border:`1px solid ${T.border}`, borderRadius:20, padding:3 }}>
            {["hi","en"].map(l=>(
              <button key={l} onClick={()=>{ setLang(l); localStorage.setItem("sm_lang",l); }} style={{ padding:"3px 10px", borderRadius:14, border:"none", background:lang===l?T.saffron:"transparent", color:lang===l?T.white:T.muted, fontFamily:font.mono, fontSize:11, fontWeight:700, cursor:"pointer", transition:"all .2s" }}>
                {l==="hi"?"हि":"EN"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ width:"100%", maxWidth:420, flex:1, paddingBottom:80 }}>
          {renderScreen()}
        </div>

        <BottomNav screen={screen} setScreen={setScreen} lang={lang} pendingCount={pending.length} />
      </div>
    </>
  );
}
