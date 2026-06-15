import { useState } from "react";
import { T, font } from "../../utils/theme";
import { Card, Tag } from "../../components/SharedUI";
import { STATUS_MAP } from "../../utils/siConstants";

const buildRemindMsg = (w, hi) => {
  const techName = w.technicianUserId?.name || "Technician";
  const lines = hi
    ? [
        `नमस्ते ${techName} जी,`,
        `आपको SiteMitra पर एक काम assign हुआ है।`,
        ``,
        `📋 काम: ${w.workType || "Site Work"}`,
        w.siteAddress ? `📍 Site: ${w.siteAddress}` : null,
        w.agreedVisitCharge ? `💰 Charge: ₹${w.agreedVisitCharge}` : null,
        ``,
        `SiteMitra खोलें और Accept/Reject करें:`,
        `https://sitemitra.iotsoft.in/tech`,
      ]
    : [
        `Hello ${techName},`,
        `You have a new Site Work assigned on SiteMitra.`,
        ``,
        `📋 Work: ${w.workType || "Site Work"}`,
        w.siteAddress ? `📍 Site: ${w.siteAddress}` : null,
        w.agreedVisitCharge ? `💰 Charge: ₹${w.agreedVisitCharge}` : null,
        ``,
        `Open SiteMitra to Accept or Reject:`,
        `https://sitemitra.iotsoft.in/tech`,
      ];
  return lines.filter(l => l !== null).join("\n");
};

const RemindButtons = ({ w, hi, stopProp }) => {
  const phone = w.technicianUserId?.mobile || "";
  const msg   = buildRemindMsg(w, hi);
  const enc   = encodeURIComponent(msg);
  return (
    <div onClick={stopProp} style={{ display:"flex", gap:8, marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}` }}>
      <a href={`https://wa.me/91${phone}?text=${enc}`} target="_blank" rel="noreferrer"
        style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px", borderRadius:50, background:"#e6f9f0", border:"1px solid #1a7a3a40", textDecoration:"none", fontFamily:font.display, fontSize:13, fontWeight:700, color:"#1a7a3a" }}>
        💬 WhatsApp
      </a>
      <a href={`sms:+91${phone}${/iP(hone|od|ad)/.test(navigator.userAgent) ? "&" : "?"}body=${enc}`}
        style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"9px", borderRadius:50, background:T.skyDim, border:`1px solid ${T.sky}40`, textDecoration:"none", fontFamily:font.display, fontSize:13, fontWeight:700, color:T.sky }}>
        📱 SMS
      </a>
    </div>
  );
};

export const MyWorksScreen = ({ lang, setScreen, siteWorks = [], setSelectedWork }) => {
  const hi = lang === "hi";
  const [filter, setFilter] = useState("ALL");

  const filters = [
    { id:"ALL",      l: hi?"सभी":"All" },
    { id:"PENDING",  l: hi?"Pending":"Pending" },
    { id:"ACTIVE",   l: hi?"Active":"Active" },
    { id:"REVIEW",   l: hi?"Review":"Review" },
    { id:"CLOSED",   l: hi?"Closed":"Closed" },
  ];

  const filtered = siteWorks.filter(w => {
    if (filter === "ALL")     return true;
    if (filter === "PENDING") return w.status === "PENDING_ACCEPTANCE";
    if (filter === "ACTIVE")  return ["ACCEPTED","ON_THE_WAY","REACHED","WORK_STARTED"].includes(w.status);
    if (filter === "REVIEW")  return w.status === "COMPLETED";
    if (filter === "CLOSED")  return w.status === "CLOSED";
    return true;
  });

  const pendingCount = siteWorks.filter(w => w.status === "PENDING_ACCEPTANCE").length;

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
            transition:"all 0.18s",position:"relative",
          }}>
            {f.l}
            {f.id==="PENDING" && pendingCount>0 && (
              <span style={{ position:"absolute", top:-4, right:-4, width:16, height:16, borderRadius:"50%", background:T.saffron, color:T.white, fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{pendingCount}</span>
            )}
          </button>
        ))}
      </div>

      {filtered.map((w,i)=>{
        const st = STATUS_MAP[w.status]||STATUS_MAP.DRAFT;
        const needsReview  = w.status === "COMPLETED";
        const needsRemind  = w.status === "PENDING_ACCEPTANCE";
        const techName = w.technicianUserId?.name || "Technician";
        const techPhone = w.technicianUserId?.mobile || "";
        return (
          <Card key={w._id||i} className={`fade-up-${Math.min(i+1,5)}`}
            style={{ marginBottom:10, borderLeft: needsReview?`4px solid ${T.saffron}`:needsRemind?`4px solid ${T.sky}`:"none" }}
            onClick={()=>{ setSelectedWork?.(w); setScreen("work-detail"); }}>
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
                {needsReview && (
                  <div style={{ fontSize:12,fontWeight:700,color:T.saffron,fontFamily:font.mono }}>
                    {hi?"→ CLOSE करें":"→ CLOSE NOW"}
                  </div>
                )}
              </div>
              {/* Remind buttons — only for PENDING_ACCEPTANCE + phone known */}
              {needsRemind && techPhone && (
                <RemindButtons w={w} hi={hi} stopProp={e=>e.stopPropagation()} />
              )}
              {needsRemind && !techPhone && (
                <div onClick={e=>e.stopPropagation()} style={{ marginTop:10, paddingTop:10, borderTop:`1px solid ${T.border}`, fontSize:12, color:T.muted }}>
                  {hi?"Technician का नंबर उपलब्ध नहीं":"Tech phone number not available"}
                </div>
              )}
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
