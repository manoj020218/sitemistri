import { useState } from "react";
import { T, font } from "../../utils/theme";
import { Card } from "../../components/SharedUI";

export const PoolScreen = ({ lang, setScreen, pool = [], setSelectedTech }) => {
  const hi = lang === "hi";
  const [copied, setCopied] = useState(false);

  const inviteLink = `${window.location.origin}/onboarding?ref=si`;

  const inviteMsg =
`🔧 CCTV Technician हो? काम ढूंढ रहे हो?

SiteMitra पर join करो — नज़दीकी SI directly काम देंगे।
✅ बिल्कुल Free — कोई commission नहीं
✅ काम मिलने पर notification आएगी
✅ Verified profile बनाओ, trust बढ़ाओ

👉 अभी join करो: ${inviteLink}

— SiteMitra | CCTV SI & Technician Platform`;

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(inviteMsg)}`, "_blank");
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(inviteMsg).catch(()=>{});
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
