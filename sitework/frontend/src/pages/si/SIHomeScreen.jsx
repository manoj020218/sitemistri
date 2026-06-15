import { T, font, API_URL } from "../../utils/theme";
import { Card, Tag } from "../../components/SharedUI";
import { STATUS_MAP } from "../../utils/siConstants";

export const SIHomeScreen = ({ user, siProfile, siteWorks, lang, setScreen }) => {
  const hi = lang === "hi";
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "S";
  const photoSrc = siProfile?.customPhotoUrl ? `${API_URL}${siProfile.customPhotoUrl}` : user?.photoUrl;

  const pendingReview = siteWorks.filter(w => w.status === "COMPLETED").length;
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
