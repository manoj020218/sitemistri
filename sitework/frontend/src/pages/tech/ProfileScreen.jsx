import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { T, font, API_URL } from "../../utils/theme";
import { Card, Tag, Avatar } from "../../components/SharedUI";
import { AVAIL_OPTIONS } from "./AvailToggle";
import api from "../../services/api";

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

export const ProfileScreen = ({ user, profile, onSaved, lang, setScreen }) => {
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
  const [pincode, setPincode]     = useState(profile?.pincode || "");
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
        pincode: pincode.trim() || undefined,
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
        {profile?.pincode && <div style={{ fontSize:13, color:T.sky, marginTop:2, fontFamily:font.mono, fontWeight:700 }}>📌 {profile.pincode}</div>}
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
            <a href={`https://wa.me/?text=${encodeURIComponent("🔧 " + (user?.name||"") + " | CCTV Technician\n📍 " + (profile?.city||"") + "\n\n🔗 Profile: https://sitemitra.iotsoft.in/tech/" + profile.profileSlug + "\n\n📲 मैं SiteMitra use करता हूँ — CCTV SI & Technician के लिए Free Platform\n👉 https://sitemitra.iotsoft.in")}`} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", borderRadius:50, background:"#25D366", color:T.white, fontFamily:font.display, fontSize:14, fontWeight:700, textDecoration:"none" }}>
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
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:12, color:T.muted, marginBottom:6, fontFamily:font.mono }}>
            📌 {hi?"Service Area Pincode *":"Service Area Pincode *"}
          </div>
          <input
            type="text" inputMode="numeric" maxLength={6}
            value={pincode}
            onChange={e=>setPincode(e.target.value.replace(/\D/g,""))}
            placeholder={hi?"जैसे: 302020":"e.g. 302020"}
            style={{ width:"100%", padding:"12px 14px", border:`2px solid ${pincode.length===6?T.green:T.border}`, borderRadius:10, outline:"none", fontFamily:font.mono, fontSize:20, fontWeight:700, color:T.ink, background:T.white, letterSpacing:"0.2em" }}
          />
          <div style={{ fontSize:11, color:T.muted, marginTop:5, fontFamily:font.mono }}>
            {hi?"SI इस pincode से आपको search कर सकता है":"SI can find you by searching this pincode"}
          </div>
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
