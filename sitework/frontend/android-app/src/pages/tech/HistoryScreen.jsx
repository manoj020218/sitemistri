import { useState, useMemo } from "react";
import { T, font } from "../../utils/theme";
import { Card, Stars } from "../../components/SharedUI";

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

const SIProfileModal = ({ siName, siPhone, hi, onClose }) => (
  <div style={{ position:"fixed", inset:0, zIndex:300, display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}
    onClick={onClose}>
    <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.45)" }} />
    <div className="slide-in" onClick={e=>e.stopPropagation()}
      style={{ width:"100%", maxWidth:420, background:T.white, borderRadius:"20px 20px 0 0", padding:"20px 16px 32px", position:"relative" }}>
      <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 18px" }} />
      <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".1em", marginBottom:6 }}>SI / CONTRACTOR</div>
      <div style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginBottom:4 }}>{siName||"SI"}</div>
      {siPhone && <div style={{ fontSize:15, color:T.muted, marginBottom:20 }}>📱 +91 {siPhone}</div>}
      {siPhone ? (
        <div style={{ display:"flex", gap:12, marginBottom:16 }}>
          <a href={`tel:${siPhone}`} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:50, background:T.greenDim, border:`1px solid ${T.green}40`, textDecoration:"none", fontFamily:font.display, fontSize:15, fontWeight:700, color:T.green }}>
            📞 {hi?"Call":"Call"}
          </a>
          <a href={`https://wa.me/91${siPhone}`} target="_blank" rel="noreferrer"
            style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"14px", borderRadius:50, background:"#e6f9f0", border:"1px solid #1a7a3a40", textDecoration:"none", fontFamily:font.display, fontSize:15, fontWeight:700, color:"#1a7a3a" }}>
            💬 WhatsApp
          </a>
        </div>
      ) : (
        <div style={{ color:T.muted, fontSize:14, marginBottom:16 }}>{hi?"मोबाइल नंबर उपलब्ध नहीं":"Mobile not available"}</div>
      )}
      <button onClick={onClose} style={{ width:"100%", padding:"13px", borderRadius:50, border:`1px solid ${T.border}`, background:T.white, cursor:"pointer", fontFamily:font.display, fontSize:15, fontWeight:700, color:T.muted }}>
        {hi?"बंद करें":"Close"}
      </button>
    </div>
  </div>
);

const HistoryDetailModal = ({ work, lang, onClose }) => {
  const hi = lang==="hi";
  const [showSI, setShowSI] = useState(false);
  if (!work) return null;

  const siName  = work.siUserId?.name  || "—";
  const siPhone = work.siUserId?.mobile || "";
  const proofFilename = work.proof?.photoPath?.split(/[\\/]/).pop();
  const proofAge = work.proof?.uploadedAt
    ? (Date.now() - new Date(work.proof.uploadedAt).getTime()) / (1000*60*60*24)
    : 999;
  const showProof = work.proof?.storageStatus === 'TEMP_STORED' && proofFilename && proofAge < 7;

  return (
    <>
      <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}
        onClick={onClose}>
        <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.45)" }} />
        <div className="slide-in" onClick={e=>e.stopPropagation()}
          style={{ width:"100%", maxWidth:420, background:T.white, borderRadius:"20px 20px 0 0", padding:"20px 16px 32px", position:"relative", maxHeight:"85vh", overflowY:"auto" }}>
          <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 18px" }} />
          <div style={{ fontFamily:font.mono, fontSize:10, color:T.saffron, letterSpacing:".1em", marginBottom:6 }}>WORK DETAILS</div>
          <div style={{ fontFamily:font.display, fontSize:20, fontWeight:800, marginBottom:16 }}>{work.workType||"Site Work"}</div>

          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {/* SI row with book icon */}
            <div style={{ paddingBottom:12, marginBottom:12, borderBottom:`1px solid ${T.border}` }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em" }}>SI / CONTRACTOR</div>
                <button onClick={e=>{ e.stopPropagation(); setShowSI(true); }} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, padding:0, lineHeight:1 }} title="SI Profile">📋</button>
              </div>
              <div style={{ fontSize:14, color:T.ink }}>{siName}</div>
            </div>

            {[
              { l:hi?"Site Address":"Site Address", v:work.siteAddress ? `📍 ${work.siteAddress}` : "—" },
              { l:hi?"विवरण":"Description", v:work.description||"—" },
              { l:hi?"पसंदीदा समय":"Preferred Time", v:work.preferredVisitTime ? `⏰ ${work.preferredVisitTime}` : "—" },
              { l:hi?"Agreed Charge":"Agreed Charge", v:work.agreedVisitCharge ? `₹${work.agreedVisitCharge} · ${work.paymentMode||""}` : "—" },
              { l:hi?"Status":"Status", v:work.status||"—" },
              { l:hi?"Date":"Date", v:new Date(work.timestamps?.siClosedAt||work.updatedAt||work.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"}) },
            ].map(r=>(
              <div key={r.l} style={{ paddingBottom:12, marginBottom:12, borderBottom:`1px solid ${T.border}` }}>
                <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:4 }}>{r.l.toUpperCase()}</div>
                <div style={{ fontSize:14, color:T.ink, lineHeight:1.5 }}>{r.v}</div>
              </div>
            ))}

            {/* Tech remark */}
            {work.technicianRemark && (
              <div style={{ paddingBottom:12, marginBottom:12, borderBottom:`1px solid ${T.border}` }}>
                <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:4 }}>{hi?"मेरा रिमार्क":"MY REMARK"}</div>
                <div style={{ fontSize:14, color:T.ink, lineHeight:1.5, fontStyle:"italic" }}>"{work.technicianRemark}"</div>
              </div>
            )}
          </div>

          {/* Proof photo */}
          {showProof && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>PROOF PHOTO ({hi?"7 दिन तक":"AVAILABLE 7 DAYS"})</div>
              <img src={`/uploads/${proofFilename}`} alt="proof"
                style={{ width:"100%", borderRadius:12, border:`1px solid ${T.border}`, maxHeight:280, objectFit:"cover" }}
              />
            </div>
          )}

          {(work.mapShortUrl || work.siteAddress) && (
            <a href={work.mapShortUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(work.siteAddress)}`}
              target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", marginBottom:14, borderRadius:10, background:T.skyDim, border:`1px solid ${T.sky}40`, color:T.sky, fontFamily:font.display, fontSize:13, fontWeight:700, textDecoration:"none" }}>
              🗺️ {hi?"Site Location खोलें":"Open Site Location"}
            </a>
          )}

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
      {showSI && <SIProfileModal siName={siName} siPhone={siPhone} hi={hi} onClose={()=>setShowSI(false)} />}
    </>
  );
};

export const HistoryScreen = ({ history, lang }) => {
  const hi = lang==="hi";
  const grouped = useMemo(()=>groupByMonth(history),[history]);
  const [detailWork, setDetailWork] = useState(null);
  const [siModal, setSiModal] = useState(null); // { name, phone }

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
                      <div style={{ fontSize:12, color:T.muted, display:"flex", alignItems:"center", gap:6 }}>
                        {w.siUserId?.name||"SI"}
                        <button onClick={e=>{ e.stopPropagation(); setSiModal({ name:w.siUserId?.name||"SI", phone:w.siUserId?.mobile||"" }); }}
                          style={{ background:"none", border:"none", cursor:"pointer", fontSize:13, padding:0, lineHeight:1 }}>📋</button>
                      </div>
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
      {siModal && <SIProfileModal siName={siModal.name} siPhone={siModal.phone} hi={hi} onClose={()=>setSiModal(null)} />}
    </>
  );
};
