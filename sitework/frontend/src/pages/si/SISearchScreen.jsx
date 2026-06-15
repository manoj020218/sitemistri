import { useState } from "react";
import { T, font } from "../../utils/theme";
import { Tag } from "../../components/SharedUI";
import { WORK_TYPES, SKILL_ID_MAP, normalizeTech } from "../../utils/siConstants";
import { TechCard } from "./TechCard";
import api from "../../services/api";

const SKILL_OPTIONS = ["CCTV","IP Camera","DVR/NVR","LAN Cabling","WiFi Bridge","Biometric","Access Control","Networking"];

// Map skill display name → label produced by normalizeTech, for client-side filtering
const SKILL_DISPLAY_TO_LABEL = {
  "CCTV": "CCTV", "IP Camera": "IP Cam", "DVR/NVR": "DVR/NVR",
  "LAN Cabling": "LAN", "WiFi Bridge": "WiFi", "Biometric": "Biometric",
  "Access Control": "Access Ctrl", "Networking": "Networking",
};

// ─── Results Screen ───────────────────────────────────────────────
export const ResultsScreen = ({
  lang, setScreen, setSelectedTech, setSearchContext,
  onBack, siteAddr, siteCoords, mapShortUrl, workType: initialWorkType,
  techs = [],
}) => {
  const hi = lang === "hi";
  const [filterWorkType, setFilterWorkType] = useState(initialWorkType || null);
  const [filterSkills,   setFilterSkills]   = useState([]);

  const toggleSkill = (s) =>
    setFilterSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  // Client-side filter
  const displayed = techs.filter(t => {
    if (filterWorkType && t.workTypes.length > 0 && !t.workTypes.includes(filterWorkType)) return false;
    if (filterSkills.length && !filterSkills.every(s => t.skillIds.includes(SKILL_ID_MAP[s]))) return false;
    return true;
  });

  const availableDisplayed = displayed.filter(t => !t.isOffline);
  const offlineDisplayed   = displayed.filter(t => t.isOffline);
  const showFilterBar = techs.filter(t => !t.isOffline).length > 10;
  const wt = WORK_TYPES.find(w => w.id === filterWorkType);

  return (
    <div>
      {/* Header */}
      <div style={{ padding:"16px 16px 12px", background:T.white, borderBottom:`1px solid ${T.border}` }}>
        <button onClick={onBack} style={{ display:"flex",alignItems:"center",gap:6, background:"none",border:"none",cursor:"pointer", fontFamily:font.body,fontSize:14,color:T.muted,marginBottom:10 }}>
          ← {hi ? "वापस" : "Back"}
        </button>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:4 }}>
              {hi ? "SEARCH RESULTS" : "SEARCH RESULTS"}
            </div>
            <div style={{ fontFamily:font.display, fontSize:16, fontWeight:800 }}>
              {availableDisplayed.length}
              {availableDisplayed.length !== techs.filter(t=>!t.isOffline).length && <span style={{ fontWeight:400, color:T.muted, fontSize:13 }}> / {techs.filter(t=>!t.isOffline).length}</span>}
              {" "}{hi ? "Available Technicians" : "Available Technicians"}
              {offlineDisplayed.length > 0 && <span style={{ fontWeight:500, color:T.muted, fontSize:13 }}> · {offlineDisplayed.length} Not Reachable</span>}
            </div>
            <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
              📍 {siteAddr?.split(",")[0]}
              {wt && ` · ${hi ? wt.hi : wt.en}`}
            </div>
          </div>
          <Tag label={hi ? "Fast Serve Score" : "Fast Serve"} color="sky" />
        </div>
      </div>

      {/* Sort note */}
      <div style={{ padding:"10px 16px", background:T.skyDim, borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontSize:11, color:T.sky, fontFamily:font.mono, fontWeight:700 }}>
          ↑ {hi
            ? "Available Now → Fresh Location → Skill Match → Distance → Trust"
            : "Available Now → Fresh Location → Skill Match → Distance → Trust"}
        </div>
      </div>

      {/* Results list */}
      <div style={{ padding:"12px 16px" }}>
        {displayed.length === 0 ? (
          <div style={{ padding:"32px 0", textAlign:"center", color:T.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontFamily:font.display, fontSize:16, marginBottom:6 }}>
              {hi ? "कोई Technician नहीं मिला" : "No Technicians Found"}
            </div>
            <div style={{ fontSize:13, lineHeight:1.6 }}>
              {filterWorkType || filterSkills.length
                ? (hi ? "Filter हटाएं या radius बढ़ाएं" : "Remove filters or increase radius")
                : (hi ? "Radius बढ़ाएं या skill filter हटाएं" : "Try increasing radius or removing filter")}
            </div>
          </div>
        ) : (
          <>
            {/* Available techs */}
            {availableDisplayed.length === 0 && offlineDisplayed.length > 0 && (
              <div style={{ textAlign:"center", padding:"16px 0 8px", fontSize:13, color:T.muted, fontFamily:font.body }}>
                {hi ? "अभी कोई Available नहीं — नीचे Not Reachable techs हैं" : "No available techs — see Not Reachable below"}
              </div>
            )}
            {availableDisplayed.map((t, i) => (
              <TechCard key={t._id || i} tech={t} lang={lang} idx={i}
                onViewProfile={() => { setSelectedTech(t); setSearchContext?.({ siteAddr, siteCoords, mapShortUrl, workType: filterWorkType }); setScreen("tech-profile"); }}
                onAssign={() => { setSelectedTech(t); setSearchContext?.({ siteAddr, siteCoords, mapShortUrl, workType: filterWorkType }); setScreen("assign"); }}
              />
            ))}

            {/* Not Reachable section */}
            {offlineDisplayed.length > 0 && (
              <>
                <div style={{ margin:"8px 0 14px", padding:"12px 14px", background:"#fff5f5", borderRadius:12, border:"1px solid #e53e3e25" }}>
                  <div style={{ fontFamily:font.mono, fontSize:11, fontWeight:700, color:"#c53030", letterSpacing:".06em", marginBottom:4 }}>
                    📴 NOT REACHABLE — {hi ? "इस Area में हैं" : "In This Area"}
                  </div>
                  <div style={{ fontSize:12, color:"#c53030", lineHeight:1.65, fontFamily:font.body }}>
                    {hi
                      ? "इनका PWA बंद है — FCM Notification नहीं जाएगी। Assign करने से पहले Phone पर बात कर लें।"
                      : "Their PWA is closed — FCM notification won't be delivered. Call them first before assigning work."}
                  </div>
                </div>
                {offlineDisplayed.map((t, i) => (
                  <TechCard key={t._id || i} tech={t} lang={lang} idx={i}
                    onViewProfile={() => { setSelectedTech(t); setSearchContext?.({ siteAddr, siteCoords, mapShortUrl, workType: filterWorkType }); setScreen("tech-profile"); }}
                    onAssign={() => { setSelectedTech(t); setSearchContext?.({ siteAddr, siteCoords, mapShortUrl, workType: filterWorkType }); setScreen("assign"); }}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>

      {/* Filter bar — shown when >10 total results */}
      {showFilterBar && (
        <div style={{ margin:"0 16px 32px", borderRadius:16, border:`1.5px solid ${T.border}`, background:T.white, overflow:"hidden" }}>
          <div style={{ padding:"12px 14px 8px", borderBottom:`1px solid ${T.border}`, background:T.skyDim }}>
            <div style={{ fontFamily:font.display, fontSize:13, fontWeight:800, color:T.sky }}>
              {hi
                ? `${techs.length} technicians मिले — सही candidate filter करें`
                : `${techs.length} technicians found — filter to find the right one`}
            </div>
            {(filterWorkType || filterSkills.length > 0) && (
              <div style={{ fontSize:11, color:T.muted, marginTop:3, fontFamily:font.mono }}>
                {hi ? `${displayed.length} दिख रहे हैं` : `Showing ${displayed.length}`}
                {" · "}
                <span
                  onClick={() => { setFilterWorkType(null); setFilterSkills([]); }}
                  style={{ color:T.error, cursor:"pointer", fontWeight:700 }}>
                  {hi ? "clear ✕" : "clear ✕"}
                </span>
              </div>
            )}
          </div>

          <div style={{ padding:"12px 14px" }}>
            {/* Work Type filter */}
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>
              {hi ? "WORK TYPE" : "WORK TYPE"}
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
              {WORK_TYPES.map(w => (
                <button key={w.id} onClick={() => setFilterWorkType(filterWorkType === w.id ? null : w.id)}
                  style={{
                    padding:"6px 12px", borderRadius:50, cursor:"pointer", transition:"all .15s",
                    border:`2px solid ${filterWorkType === w.id ? T.sky : T.border}`,
                    background: filterWorkType === w.id ? T.skyDim : T.white,
                    color: filterWorkType === w.id ? T.sky : T.muted,
                    fontFamily:font.body, fontSize:12,
                    fontWeight: filterWorkType === w.id ? 700 : 400,
                  }}>
                  {w.e} {hi ? w.hi : w.en}{filterWorkType === w.id ? " ✓" : ""}
                </button>
              ))}
            </div>

            {/* Skills filter */}
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>
              {hi ? "REQUIRED SKILLS" : "REQUIRED SKILLS"}
            </div>
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {SKILL_OPTIONS.map(s => (
                <button key={s} onClick={() => toggleSkill(s)}
                  style={{
                    padding:"6px 12px", borderRadius:50, cursor:"pointer", transition:"all .15s",
                    border:`2px solid ${filterSkills.includes(s) ? T.sky : T.border}`,
                    background: filterSkills.includes(s) ? T.skyDim : T.white,
                    color: filterSkills.includes(s) ? T.sky : T.muted,
                    fontFamily:font.body, fontSize:12,
                    fontWeight: filterSkills.includes(s) ? 700 : 400,
                  }}>
                  {s}{filterSkills.includes(s) ? " ✓" : ""}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


// ─── Search Form Screen ───────────────────────────────────────────
export const SearchScreen = ({ lang, setScreen, setSelectedTech, setSearchContext }) => {
  const hi = lang === "hi";
  const [step,        setStep]        = useState("form");
  const [searchMode,  setSearchMode]  = useState("location"); // "location" | "pincode"
  const [siteAddr,    setSiteAddr]    = useState("");
  const [siteCoords,  setSiteCoords]  = useState(null);
  const [workType,    setWorkType]    = useState(null);
  const [radius,      setRadius]      = useState(10);
  const [skills,      setSkills]      = useState([]);
  const [searching,   setSearching]   = useState(false);
  const [locLoading,  setLocLoading]  = useState(false);
  const [locErr,      setLocErr]      = useState("");
  const [searchErr,   setSearchErr]   = useState("");
  const [results,     setResults]     = useState([]);
  const [linkVal,     setLinkVal]     = useState("");
  const [linkLoading, setLinkLoading] = useState(false);
  const [linkResult,  setLinkResult]  = useState(null);
  const [linkErr,     setLinkErr]     = useState("");
  const [pincodeVal,  setPincodeVal]  = useState("");

  const toggle = (arr, setArr, v) => setArr(arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const handleUseLocation = () => {
    if (!navigator.geolocation) { setLocErr(hi?"Location supported नहीं":"Location not supported"); return; }
    setLocLoading(true); setLocErr("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        setSiteCoords({ lat, lng });
        try {
          const controller = new AbortController();
          const t = setTimeout(() => controller.abort(), 5000);
          const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, { signal: controller.signal });
          clearTimeout(t);
          const data = await r.json();
          setSiteAddr(data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        } catch {
          setSiteAddr(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
        }
        setLocLoading(false);
      },
      () => { setLocErr(hi?"Location permission deny किया":"Location access denied"); setLocLoading(false); },
      { timeout: 15000, maximumAge: 60000 }
    );
  };

  const handleResolveLink = async (val) => {
    const v = (val || linkVal).trim();
    if (!v) return;
    if (!/maps\.app\.goo\.gl|maps\.google\.com|google\.com\/maps|goo\.gl\/maps/i.test(v)) {
      setLinkErr(hi ? "यह Google Maps link नहीं लग रही" : "Doesn't look like a Google Maps link");
      return;
    }
    setLinkLoading(true); setLinkErr(""); setLinkResult(null);
    try {
      const r = await api.post("/discovery/resolve-map-link", { url: v });
      const d = r?.data;
      setLinkResult(d);
      setSiteCoords({ lat: d.lat, lng: d.lng });
      setSiteAddr(d.address);
      setLinkErr("");
    } catch (e) {
      setLinkErr(e?.response?.data?.message || e?.message || (hi ? "Link decode नहीं हुई" : "Could not decode link"));
    } finally {
      setLinkLoading(false);
    }
  };

  const handleSearch = async () => {
    setSearching(true); setSearchErr("");
    try {
      if (searchMode === "pincode") {
        const r = await api.post("/discovery/nearby", {
          pincode: pincodeVal.trim(),
          requiredSkills: skills.map(s => SKILL_ID_MAP[s]).filter(Boolean),
        });
        setResults((r?.data?.results || []).map(normalizeTech));
        setSiteAddr(`Pincode: ${pincodeVal.trim()}`);
        setSiteCoords(null);
        setStep("results");
        return;
      }
      let coords = siteCoords;
      if (!coords) {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(siteAddr)}&format=json&limit=1`);
        const data = await r.json();
        if (!data.length) throw new Error(hi ? "Address नहीं मिला, ज़्यादा detail डालें" : "Address not found — try more detail");
        coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setSiteCoords(coords);
      }
      const r = await api.post("/discovery/nearby", {
        siteLocation: coords,
        radiusKm: radius,
        requiredSkills: skills.map(s => SKILL_ID_MAP[s]).filter(Boolean),
        workType: workType || undefined,
      });
      setResults((r?.data?.results || []).map(normalizeTech));
      setStep("results");
    } catch (e) {
      setSearchErr(e?.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const canSearch = searchMode === "pincode"
    ? /^\d{6}$/.test(pincodeVal.trim())
    : siteAddr.trim().length > 3;

  if (step === "results") {
    return (
      <ResultsScreen
        lang={lang}
        setScreen={setScreen}
        setSelectedTech={setSelectedTech}
        setSearchContext={setSearchContext}
        onBack={() => setStep("form")}
        siteAddr={siteAddr}
        siteCoords={siteCoords}
        mapShortUrl={linkVal}
        workType={workType}
        techs={results}
      />
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <button onClick={() => setScreen("home")} style={{ display:"flex",alignItems:"center",gap:6, background:"none",border:"none",cursor:"pointer", fontFamily:font.body,fontSize:14,color:T.muted,marginBottom:16 }}>
        ← {hi ? "वापस" : "Back"}
      </button>

      <div style={{ fontFamily:font.mono, fontSize:11, color:T.sky, letterSpacing:".1em", marginBottom:6 }}>
        {hi ? "TECHNICIAN SEARCH" : "TECHNICIAN SEARCH"}
      </div>
      <h2 style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginBottom:16 }}>
        {hi ? "Technician खोजें" : "Find a Technician"}
      </h2>

      {/* Mode toggle */}
      <div style={{ display:"flex", gap:8, marginBottom:20, padding:4, background:T.paper, borderRadius:14 }}>
        {[
          { id:"location", e:"📍", hi:"Location से", en:"By Location" },
          { id:"pincode",  e:"📌", hi:"Pincode से",  en:"By Pincode"  },
        ].map(m => (
          <button key={m.id} onClick={() => { setSearchMode(m.id); setSearchErr(""); }}
            style={{
              flex:1, padding:"10px 8px", borderRadius:10, border:"none",
              background: searchMode === m.id ? T.sky : "transparent",
              color: searchMode === m.id ? T.white : T.muted,
              fontFamily:font.display, fontSize:14, fontWeight:700, cursor:"pointer",
              transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            }}>
            {m.e} {hi ? m.hi : m.en}
          </button>
        ))}
      </div>

      {/* Pincode search form */}
      {searchMode === "pincode" ? (
        <div style={{ marginBottom:18 }}>
          <div style={{ fontFamily:font.mono, fontSize:11, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>
            {hi ? "CLIENT SITE AREA PINCODE" : "CLIENT SITE AREA PINCODE"}
          </div>
          <input
            type="text" inputMode="numeric" maxLength={6}
            value={pincodeVal}
            onChange={e => setPincodeVal(e.target.value.replace(/\D/g, ""))}
            placeholder="302020"
            style={{
              width:"100%", padding:"16px 20px",
              border:`2.5px solid ${/^\d{6}$/.test(pincodeVal) ? T.green : T.border}`,
              borderRadius:14, outline:"none",
              fontFamily:font.mono, fontSize:32, fontWeight:800,
              color:T.ink, background:T.white, letterSpacing:"0.25em",
              textAlign:"center", transition:"border-color .2s",
            }}
          />
          <div style={{ marginTop:8, fontSize:12, color:T.muted, fontFamily:font.mono, textAlign:"center" }}>
            {/^\d{6}$/.test(pincodeVal)
              ? <span style={{ color:T.green, fontWeight:700 }}>✓ {hi ? "Pincode ready" : "Pincode ready"}</span>
              : (hi ? "6 digit pincode डालें" : "Enter 6-digit pincode")}
          </div>
          <div style={{ marginTop:12, padding:"10px 14px", background:T.skyDim, borderRadius:10, fontSize:12, color:T.sky, fontFamily:font.mono, lineHeight:1.6 }}>
            {hi
              ? "Technician को अपने profile में यह pincode save करना होगा।"
              : "Technician must have this pincode saved in their profile to appear here."}
          </div>
        </div>
      ) : (
        <p style={{ fontSize:13, color:T.muted, marginBottom:20, lineHeight:1.55 }}>
          {hi ? "SI की location नहीं — client की site location डालें।" : "Not your office — enter the client's site location."}
        </p>
      )}

      {/* Site Location — location mode only */}
      {searchMode === "location" && <div style={{ marginBottom:18 }}>
        <div style={{ fontFamily:font.mono, fontSize:11, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>
          CLIENT SITE ADDRESS / LOCATION <span style={{ color:T.error }}>*</span>
        </div>
        <textarea
          value={siteAddr}
          onChange={e => setSiteAddr(e.target.value)}
          placeholder={hi ? "जैसे: Shop No. 12, Vaishali Nagar, Jaipur" : "e.g. Shop 12, Vaishali Nagar, Jaipur"}
          rows={3}
          style={{ width:"100%", padding:"13px 16px", border:`2px solid ${siteAddr ? T.sky : T.border}`, borderRadius:12, outline:"none", fontFamily:font.body, fontSize:14, color:T.ink, background:T.white, resize:"none", lineHeight:1.5, transition:"border-color .2s" }}
        />
        <button onClick={handleUseLocation} disabled={locLoading} style={{ marginTop:8, width:"100%", padding:"11px", borderRadius:10, border:`1px solid ${locLoading?T.border:T.sky}`, background:T.paper, cursor:locLoading?"not-allowed":"pointer", fontFamily:font.display, fontSize:13, fontWeight:700, color:T.sky, display:"flex", alignItems:"center", justifyContent:"center", gap:6, opacity:locLoading?.6:1 }}>
          {locLoading
            ? <><div style={{ width:14,height:14,border:`2px solid ${T.sky}`,borderTopColor:"transparent",borderRadius:"50%",animation:"spin .8s linear infinite" }} />{hi?"Location ढूंढ रहे…":"Getting location…"}</>
            : <>📍 {hi ? "Current Location Use करें" : "Use Current Location"}</>}
        </button>
        {locErr && <div style={{ marginTop:6, fontSize:12, color:T.error, fontFamily:font.mono }}>{locErr}</div>}
        {siteCoords && !locErr && !linkResult && <div style={{ marginTop:6, fontSize:11, color:T.green, fontFamily:font.mono }}>✓ {hi?"Location set":"Location set"}</div>}

        {/* Google Maps link paste */}
        <div style={{ marginTop:12, borderTop:`1px dashed ${T.border}`, paddingTop:12 }}>
          <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>
            {hi ? "या GOOGLE MAPS LINK PASTE करें" : "OR PASTE GOOGLE MAPS LINK"}
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <input
              type="url" value={linkVal}
              onChange={e => { setLinkVal(e.target.value); setLinkErr(""); setLinkResult(null); }}
              onPaste={e => {
                const pasted = e.clipboardData.getData('text');
                if (/maps\.app\.goo\.gl|maps\.google\.com|google\.com\/maps|goo\.gl\/maps/i.test(pasted)) {
                  e.preventDefault(); setLinkVal(pasted);
                  setTimeout(() => handleResolveLink(pasted), 0);
                }
              }}
              placeholder="https://maps.app.goo.gl/..."
              style={{ flex:1, padding:"10px 12px", borderRadius:10, border:`1.5px solid ${linkVal?T.sky:T.border}`, fontFamily:font.body, fontSize:13, color:T.ink, background:T.white, outline:"none" }}
            />
            <button onClick={() => handleResolveLink()} disabled={linkLoading || !linkVal.trim()}
              style={{ padding:"10px 14px", borderRadius:10, border:"none", background:linkLoading||!linkVal.trim()?T.border:T.sky, color:T.white, fontFamily:font.display, fontSize:13, fontWeight:700, cursor:linkLoading||!linkVal.trim()?"not-allowed":"pointer", display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
              {linkLoading ? <div style={{ width:14,height:14,border:"2px solid rgba(255,255,255,.4)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite" }} /> : "→"}
            </button>
          </div>
          {linkErr && <div style={{ marginTop:6, fontSize:12, color:T.error, fontFamily:font.mono }}>{linkErr}</div>}
          {linkResult && (
            <div style={{ marginTop:8, background:T.greenDim, border:`1px solid ${T.green}40`, borderRadius:10, padding:"10px 12px", display:"flex", gap:8, alignItems:"flex-start" }}>
              <span style={{ fontSize:16, flexShrink:0, marginTop:1 }}>📍</span>
              <div>
                <div style={{ fontSize:11, color:T.green, fontFamily:font.mono, fontWeight:700, marginBottom:3 }}>{hi?"लोकेशन मिल गई":"LOCATION FOUND"}</div>
                <div style={{ fontSize:12, color:T.ink, lineHeight:1.6 }}>{hi?"near to":"near to"} <span style={{ fontWeight:600 }}>"{linkResult.address}"</span></div>
              </div>
            </div>
          )}
        </div>
      </div>}

      {/* Work Type — optional pre-filter */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontFamily:font.mono, fontSize:11, color:T.muted, letterSpacing:".08em", marginBottom:10 }}>
          {hi ? "WORK TYPE (OPTIONAL — search के बाद filter भी कर सकते हैं)" : "WORK TYPE (OPTIONAL — can also filter after search)"}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {WORK_TYPES.map(w => (
            <button key={w.id} onClick={() => setWorkType(workType === w.id ? null : w.id)} style={{
              display:"inline-flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:50,
              border:`2px solid ${workType === w.id ? T.sky : T.border}`,
              background: workType === w.id ? T.skyDim : T.white,
              color: workType === w.id ? T.sky : T.muted,
              fontFamily:font.body, fontSize:13, fontWeight:workType===w.id?700:400, cursor:"pointer", transition:"all .18s",
            }}>
              {w.e} {hi ? w.hi : w.en}{workType === w.id ? " ✓" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Skills filter — optional pre-filter */}
      <div style={{ marginBottom:18 }}>
        <div style={{ fontFamily:font.mono, fontSize:11, color:T.muted, letterSpacing:".08em", marginBottom:10 }}>
          {hi ? "REQUIRED SKILLS (OPTIONAL)" : "REQUIRED SKILLS (OPTIONAL)"}
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {SKILL_OPTIONS.map(s => (
            <button key={s} onClick={() => toggle(skills, setSkills, s)} style={{
              padding:"7px 13px", borderRadius:50,
              border:`2px solid ${skills.includes(s) ? T.sky : T.border}`,
              background: skills.includes(s) ? T.skyDim : T.white,
              color: skills.includes(s) ? T.sky : T.muted,
              fontFamily:font.body, fontSize:13, fontWeight:skills.includes(s)?700:400, cursor:"pointer", transition:"all .18s",
            }}>
              {s}{skills.includes(s) ? " ✓" : ""}
            </button>
          ))}
        </div>
      </div>

      {/* Radius — location mode only */}
      {searchMode === "location" && <div style={{ marginBottom:24 }}>
        <div style={{ fontFamily:font.mono, fontSize:11, color:T.muted, letterSpacing:".08em", marginBottom:10 }}>
          {hi ? `SEARCH RADIUS: ${radius} KM` : `SEARCH RADIUS: ${radius} KM`}
        </div>
        <div style={{ display:"flex", gap:8 }}>
          {[3,5,10,20].map(r => (
            <button key={r} onClick={() => setRadius(r)} style={{
              flex:1, padding:"10px 4px", borderRadius:50,
              border:`2px solid ${radius===r?T.sky:T.border}`,
              background: radius===r?T.skyDim:T.white,
              color: radius===r?T.sky:T.muted,
              fontFamily:font.mono, fontSize:13, fontWeight:700, cursor:"pointer", transition:"all .18s",
            }}>
              {r}km
            </button>
          ))}
        </div>
      </div>}

      {searchErr && (
        <div style={{ marginBottom:12, padding:"10px 14px", borderRadius:10, background:T.errorDim, fontSize:13, color:T.error, fontFamily:font.body }}>⚠️ {searchErr}</div>
      )}

      {searching ? (
        <div style={{ width:"100%", padding:"15px", borderRadius:50, background:T.sky, display:"flex", alignItems:"center", justifyContent:"center", gap:10, color:T.white, fontFamily:font.display, fontSize:16, fontWeight:700 }}>
          <div style={{ width:18,height:18,border:"3px solid rgba(255,255,255,0.3)",borderTopColor:T.white,borderRadius:"50%",animation:"spin .8s linear infinite" }} />
          {hi ? "Searching…" : "Searching…"}
        </div>
      ) : (
        <button onClick={handleSearch} disabled={!canSearch} style={{
          width:"100%", padding:"15px", borderRadius:50, border:"none",
          background: canSearch ? T.sky : T.border, color:T.white,
          cursor: canSearch ? "pointer" : "not-allowed",
          fontFamily:font.display, fontSize:16, fontWeight:700,
          boxShadow: canSearch ? `0 4px 20px ${T.sky}50` : "none",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8, transition:"all .2s",
        }}>
          {searchMode === "pincode"
            ? (hi ? `📌 ${pincodeVal || "------"} में खोजें` : `📌 Search in ${pincodeVal || "------"}`)
            : (hi ? "🔍 Nearby Technicians खोजें" : "🔍 Search Nearby Technicians")}
        </button>
      )}

      {!canSearch && (
        <p style={{ textAlign:"center", fontSize:12, color:T.muted, marginTop:10, fontFamily:font.mono }}>
          {searchMode === "pincode"
            ? (hi ? "6 digit pincode डालें" : "Enter a valid 6-digit pincode")
            : (hi ? "Site address जरूरी है" : "Site address is required")}
        </p>
      )}
    </div>
  );
};
