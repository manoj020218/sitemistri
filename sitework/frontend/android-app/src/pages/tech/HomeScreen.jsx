import { useState } from "react";
import { T, font, API_URL } from "../../utils/theme";
import { Card, Tag, Avatar } from "../../components/SharedUI";
import { AvailToggle } from "./AvailToggle";
import api from "../../services/api";

const useRefer = (hi) => {
  const [copied, setCopied] = useState(false);
  const handleRefer = async () => {
    const url = "https://sitemitra.iotsoft.in/onboarding";
    const text = hi
      ? `मैं SiteMitra use कर रहा हूँ — CCTV field technician के लिए free app है। ज़्यादा site work मिलती है। आप भी try करो:\n${url}`
      : `I use SiteMitra — free app for CCTV field technicians to get more site work. Try it:\n${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: "SiteMitra", text }); } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch {}
    }
  };
  return { handleRefer, copied };
};

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

export const HomeScreen = ({ user, profile, pending, activeWork, onAvailChange, lang, setScreen, setSelectedWork, locPerm, onLocBannerClick }) => {
  const hi = lang==="hi";
  const isAvail = ["AVAILABLE_NOW","AVAILABLE_TODAY","AVAILABLE_TOMORROW"].includes(profile?.availability);
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "?";
  const photoSrc = profile?.customPhotoUrl ? `${API_URL}${profile.customPhotoUrl}` : user?.photoUrl;
  const stats = profile?.trustStats || {};
  const { handleRefer, copied: referCopied } = useRefer(hi);

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

        {/* Location permission warning — shown when available but GPS not granted */}
        {isAvail && locPerm !== 'granted' && locPerm !== 'checking' && (
          <div onClick={onLocBannerClick} className="fade-up" style={{ cursor:'pointer', background:T.errorDim, borderRadius:12, padding:"11px 14px", marginBottom:14, display:"flex", gap:10, alignItems:"center", border:`2px solid ${T.error}`, position:'relative', overflow:'hidden' }}>
            {/* Pulsing red dot */}
            <div style={{ position:'relative', width:24, height:24, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <span style={{ fontSize:18, animation:'locPulse 1.2s ease-in-out infinite', display:'block', filter:'grayscale(.4)' }}>📍</span>
              <span style={{ position:'absolute', top:0, right:0, width:8, height:8, borderRadius:'50%', background:T.error, border:`2px solid ${T.white}`, animation:'ping .9s ease-in-out infinite' }} />
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, color:T.error, fontWeight:700, fontFamily:font.body }}>
                {hi ? 'GPS बंद है — Search में नहीं दिखेंगे' : 'GPS off — Not visible in searches'}
              </div>
              <div style={{ fontSize:11, color:T.error, opacity:.75, marginTop:2 }}>
                {locPerm === 'denied'
                  ? (hi ? 'Tap करें → Settings में Allow करें' : 'Tap → Allow in browser settings')
                  : (hi ? 'Tap करें → Location Allow करें' : 'Tap → Allow location')}
              </div>
            </div>
            <span style={{ fontSize:16, color:T.error }}>›</span>
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
        <div style={{ padding:"0 16px 12px" }}>
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

      {/* REFER CARD */}
      <div style={{ padding:"0 16px 24px" }}>
        <button onClick={handleRefer} style={{
          width:"100%", padding:"16px 18px", borderRadius:16,
          border:`1.5px solid ${T.green}40`, background:T.greenDim,
          cursor:"pointer", display:"flex", alignItems:"center", gap:14, textAlign:"left",
        }}>
          <span style={{ fontSize:30 }}>🤝</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, color:T.green }}>
              {hi ? "दोस्त को Refer करें" : "Refer to a Friend"}
            </div>
            <div style={{ fontSize:12, color:T.muted, marginTop:2 }}>
              {hi ? "WhatsApp पर share करें — ज़्यादा SIs जुड़ेंगे" : "Share on WhatsApp — grow the network"}
            </div>
          </div>
          <div style={{ fontFamily:font.mono, fontSize:11, fontWeight:700, color:T.green, flexShrink:0 }}>
            {referCopied ? "✓ Copied!" : "Share →"}
          </div>
        </button>
      </div>
    </div>
  );
};
