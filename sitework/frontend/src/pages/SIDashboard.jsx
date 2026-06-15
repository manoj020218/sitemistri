import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { useFCM } from "../hooks/useFCM";
import { T, font } from "../utils/theme";
import { SIHomeScreen } from "./si/SIHomeScreen";
import { SearchScreen } from "./si/SISearchScreen";
import { TechProfileScreen } from "./si/TechProfileScreen";
import { AssignScreen } from "./si/AssignScreen";
import { MyWorksScreen } from "./si/MyWorksScreen";
import { PoolScreen } from "./si/PoolScreen";
import { SIProfileScreen } from "./si/SIProfileScreen";
import { SIWorkReviewScreen } from "./si/SIWorkReviewScreen";
import { BottomNav } from "./si/BottomNav";

const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: ${T.paper}; font-family: ${font.body}; color: ${T.ink}; overscroll-behavior-y: none; }
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

// ─── ROOT ─────────────────────────────────────────────────────────
export default function SIDashboard() {
  const { user } = useAuth();
  useFCM(user);
  const [screen,         setScreen]         = useState(() => {
    const s = localStorage.getItem("sm_si_screen");
    return ["home","search","my-works","pool","profile"].includes(s) ? s : "home"; // work-detail intentionally excluded
  });
  const [lang,           setLang]           = useState("hi");
  const [selectedTech,   setSelectedTech]   = useState(null);
  const [selectedWork,   setSelectedWork]   = useState(null);
  const [searchContext,  setSearchContext]  = useState(null);
  const [siProfile,      setSiProfile]      = useState(null);
  const [siteWorks,      setSiteWorks]      = useState([]);
  const [pool,           setPool]           = useState([]);
  const [loading,        setLoading]        = useState(true);

  const refreshWorks = async () => {
    try {
      const r = await api.get("/si/site-works");
      setSiteWorks(r?.data || []);
    } catch {}
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [pRes, wRes, poolRes] = await Promise.all([
          api.get("/si"),
          api.get("/si/site-works"),
          api.get("/si/technician-pool"),
        ]);
        setSiProfile(pRes?.data || null);
        setSiteWorks(wRes?.data || []);
        setPool(poolRes?.data || []);
      } catch {}
      setLoading(false);
    };
    loadAll();
  }, []);

  // Poll for work status updates when SI is viewing works or home
  useEffect(() => {
    if (!["home", "my-works", "work-detail"].includes(screen)) return;
    refreshWorks(); // refresh immediately on entering these screens
    const id = setInterval(refreshWorks, 15000); // then every 15 seconds
    return () => clearInterval(id);
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(()=>{ localStorage.setItem("sm_si_screen", screen); }, [screen]);

  const reviewCount = siteWorks.filter(w => w.status === "COMPLETED").length;

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
          <div style={{ display:"flex",gap:2,background:"#ffffff",border:`1px solid ${T.border}`,borderRadius:20,padding:3 }}>
            {["hi","en"].map(l=>(
              <button key={l} onClick={()=>setLang(l)} style={{
                padding:"3px 10px",borderRadius:14,border:"none",
                background:lang===l?T.sky:"transparent",
                color:lang===l?"#ffffff":T.muted,
                fontFamily:font.mono,fontSize:11,fontWeight:700,
                cursor:"pointer",transition:"all 0.2s",
              }}>{l==="hi"?"हि":"EN"}</button>
            ))}
          </div>
        </div>

        <div style={{ width:"100%",maxWidth:420,flex:1,paddingBottom:80 }}>
          <>
            {/* SearchScreen stays mounted to preserve results/step state across tech-profile and assign screens */}
            <div style={{ display: screen === "search" ? "block" : "none" }}>
              <SearchScreen lang={lang} setScreen={setScreen} setSelectedTech={setSelectedTech} setSearchContext={setSearchContext} />
            </div>
            {screen === "home"         && <SIHomeScreen user={user} siProfile={siProfile} siteWorks={siteWorks} lang={lang} setScreen={setScreen} />}
            {screen === "tech-profile" && <TechProfileScreen lang={lang} tech={selectedTech} setScreen={setScreen} />}
            {screen === "assign"       && <AssignScreen lang={lang} tech={selectedTech} setScreen={setScreen} searchContext={searchContext} />}
            {screen === "my-works"     && <MyWorksScreen lang={lang} setScreen={setScreen} siteWorks={siteWorks} setSelectedWork={setSelectedWork} />}
            {screen === "work-detail"  && <SIWorkReviewScreen work={selectedWork} lang={lang} setScreen={setScreen} onClosed={refreshWorks} />}
            {screen === "pool"         && <PoolScreen lang={lang} setScreen={setScreen} pool={pool} setSelectedTech={setSelectedTech} />}
            {screen === "profile"      && <SIProfileScreen user={user} siProfile={siProfile} lang={lang} onProfileSaved={p=>setSiProfile(p)} setScreen={setScreen} />}
            {!["home","search","tech-profile","assign","my-works","work-detail","pool","profile"].includes(screen) && (
              <SIHomeScreen user={user} siProfile={siProfile} siteWorks={siteWorks} lang={lang} setScreen={setScreen} />
            )}
          </>
        </div>

        <BottomNav screen={screen} setScreen={setScreen} lang={lang} reviewCount={reviewCount} />
      </div>

      {/* Small corner loading indicator — never covers full screen */}
      {loading && (
        <div style={{ position:"fixed", bottom:72, right:16, zIndex:50, background:"#ffffff", borderRadius:"50%", width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(0,0,0,.15)", border:`1px solid ${T.border}` }}>
          <div style={{ width:20, height:20, border:`2px solid ${T.border}`, borderTopColor:T.sky, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
        </div>
      )}
    </>
  );
}
