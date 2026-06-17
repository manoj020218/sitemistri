import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { T, font } from "../utils/theme";
import { Fonts, Spinner } from "../components/SharedUI";
import { LocationModal } from "./tech/LocationModal";
import { HomeScreen } from "./tech/HomeScreen";
import { WorkDetailScreen } from "./tech/WorkDetailScreen";
import { ActiveWorkScreen } from "./tech/ActiveWorkScreen";
import { HistoryScreen } from "./tech/HistoryScreen";
import { ProfileScreen } from "./tech/ProfileScreen";
import { BottomNav } from "./tech/BottomNav";

// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════
export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [profile, setProfile]         = useState(null);
  const [siteWorks, setSiteWorks]     = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [screen, setScreen]       = useState(() => {
    const s = localStorage.getItem("sm_tech_screen");
    return ["home","history","profile"].includes(s) ? s : "home";
  });
  const [lang, setLang]           = useState(localStorage.getItem("sm_lang")||"hi");
  const [selectedWork, setSelectedWork] = useState(null);
  const [locPerm, setLocPerm]           = useState('checking');
  const [showLocModal, setShowLocModal] = useState(false);
  const locationSavedRef = useRef(false);
  const profileRef       = useRef(null);

  useEffect(()=>{ profileRef.current = profile; }, [profile]);
  useEffect(()=>{ loadAll(); },[]);
  useEffect(()=>{ localStorage.setItem("sm_tech_screen", screen); }, [screen]);

  // Poll silently — never shows spinner
  useEffect(() => {
    if (!["home", "active-work"].includes(screen)) return;
    const id = setInterval(loadAll, 15000);
    return () => clearInterval(id);
  }, [screen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Track browser geolocation permission state.
  // When GPS is enabled (onchange → 'granted'), immediately save location to DB.
  useEffect(() => {
    if (!navigator.permissions) { setLocPerm('unsupported'); return; }
    navigator.permissions.query({ name: 'geolocation' }).then(r => {
      setLocPerm(r.state);
      r.onchange = () => {
        setLocPerm(r.state);
        if (r.state !== 'granted') return;
        const p = profileRef.current;
        if (!p || !["AVAILABLE_NOW","AVAILABLE_TODAY","AVAILABLE_TOMORROW"].includes(p.availability)) return;
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
          async (pos) => {
            try {
              await api.post("/technician/location", {
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
                accuracy: pos.coords.accuracy,
              });
              locationSavedRef.current = true;
            } catch {}
          },
          () => {}
        );
      };
    }).catch(() => setLocPerm('unsupported'));
  }, []);

  // Auto-save location when dashboard loads if already in an available state.
  // This fixes techs who toggled availability before the location-save code existed.
  useEffect(() => {
    if (!profile || locationSavedRef.current) return;
    if (!["AVAILABLE_NOW","AVAILABLE_TODAY","AVAILABLE_TOMORROW"].includes(profile.availability)) return;
    if (!navigator.geolocation) return;
    locationSavedRef.current = true;
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
      () => {
        alert(
          lang === 'hi'
            ? 'लोकेशन परमिशन नहीं मिली। आप SI की सर्च में नहीं दिखेंगे। ब्राउज़र सेटिंग में लोकेशन Allow करें।'
            : "Location permission denied. You won't appear in SI searches. Please allow location in browser settings."
        );
      }
    );
  }, [profile]);

  const handleLocBannerClick = () => {
    if (locPerm === 'denied') { setShowLocModal(true); return; }
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setLocPerm('granted');
        try {
          await api.post("/technician/location", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
          locationSavedRef.current = true;
        } catch {}
      },
      () => setShowLocModal(true)
    );
  };

  const loadAll = async () => {
    const [p, w] = await Promise.allSettled([
      api.get("/technician/profile"),
      api.get("/technician/site-works"),
    ]);
    if (p.status==="fulfilled") setProfile(p.value ?? null);
    if (w.status==="fulfilled") setSiteWorks(Array.isArray(w.value) ? w.value : []);
    setInitialLoading(false);
  };

  const refreshProfile = async () => {
    const r = await api.get("/technician/profile");
    setProfile(r);
    return r;
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
          () => {
            alert(
              lang === 'hi'
                ? 'लोकेशन परमिशन नहीं मिली। आप SI की सर्च में नहीं दिखेंगे। ब्राउज़र सेटिंग में लोकेशन Allow करें।'
                : "Location permission denied. You won't appear in SI searches. Please allow location in browser settings."
            );
          }
        );
      }
    } catch {}
  };

  const pending = siteWorks.filter(w=>w.status==="PENDING_ACCEPTANCE");
  // COMPLETED without proof → tech still needs to upload → treat as active
  // COMPLETED with proof uploaded → tech's job done, waiting for SI → treat as history
  const activeWork = siteWorks.find(w=>
    ["ACCEPTED","ON_THE_WAY","REACHED","WORK_STARTED"].includes(w.status) ||
    (w.status==="COMPLETED" && !w.proof?.photoUploaded)
  );
  const history = siteWorks.filter(w=>
    ["CLOSED","CANCELLED_BY_SI","CANCELLED_BY_TECH","DISPUTED"].includes(w.status) ||
    (w.status==="COMPLETED" && w.proof?.photoUploaded)
  );

  const renderScreen = () => {
    switch(screen) {
      case "home":
        return <HomeScreen user={user} profile={profile} pending={pending} activeWork={activeWork} onAvailChange={handleAvailChange} lang={lang} setScreen={setScreen} setSelectedWork={setSelectedWork} locPerm={locPerm} onLocBannerClick={handleLocBannerClick} />;
      case "active-work":
        return <ActiveWorkScreen work={activeWork} lang={lang} setScreen={setScreen} onStatusChange={loadAll}
          onProofUploaded={(workId) => {
            // Immediately mark proof as uploaded in local state — no poll needed
            setSiteWorks(prev => prev.map(w => w._id === workId ? { ...w, proof: { ...w.proof, photoUploaded: true } } : w));
            setScreen("home");
          }}
        />;
      case "work-detail":
        return <WorkDetailScreen work={selectedWork} lang={lang} setScreen={setScreen}
          onAccepted={async () => { await loadAll(); setSelectedWork(null); setScreen("active-work"); }}
          onRejected={async () => { await loadAll(); setScreen("home"); }}
        />;
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
      {showLocModal && <LocationModal lang={lang} onClose={()=>setShowLocModal(false)} />}
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

      {/* Small corner loading indicator — never covers full screen */}
      {initialLoading && (
        <div style={{ position:"fixed", bottom:72, right:16, zIndex:50, background:T.white, borderRadius:"50%", width:40, height:40, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 12px rgba(0,0,0,.15)", border:`1px solid ${T.border}` }}>
          <div style={{ width:20, height:20, border:`2px solid ${T.border}`, borderTopColor:T.sky, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
        </div>
      )}
    </>
  );
}
