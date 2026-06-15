import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { T, font, API_URL } from "../../utils/theme";
import { Card, Tag } from "../../components/SharedUI";
import { SI_SERVICE_CATS } from "../../utils/siConstants";
import api from "../../services/api";

const roundRect = (ctx, x, y, w, h, r) => {
  ctx.beginPath();
  ctx.moveTo(x+r, y); ctx.lineTo(x+w-r, y);
  ctx.quadraticCurveTo(x+w, y, x+w, y+r);
  ctx.lineTo(x+w, y+h-r);
  ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
  ctx.lineTo(x+r, y+h);
  ctx.quadraticCurveTo(x, y+h, x, y+h-r);
  ctx.lineTo(x, y+r);
  ctx.quadraticCurveTo(x, y, x+r, y);
  ctx.closePath();
};

const generateVisitingCard = (siProfile, user) => new Promise(resolve => {
  const W = 900, H = 500;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Dark blue gradient
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0d2240"); bg.addColorStop(1, "#1a5fa8");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Decorative circles
  ctx.fillStyle = "rgba(255,255,255,0.04)";
  ctx.beginPath(); ctx.arc(820, 60, 140, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(820, 60, 90, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(100, 450, 100, 0, Math.PI*2); ctx.fill();

  // Top saffron bar
  ctx.fillStyle = "#e8630a"; ctx.fillRect(0, 0, W, 7);

  // Company name
  const company = (siProfile?.businessName || user?.name || "My Company").slice(0, 28);
  ctx.font = "bold 52px Arial"; ctx.fillStyle = "#ffffff";
  ctx.fillText(company, 60, 105);

  // Business type badge
  if (siProfile?.businessType) {
    ctx.font = "bold 15px Arial";
    const badge = "  " + siProfile.businessType + "  ";
    const bw = ctx.measureText(badge).width + 4;
    ctx.fillStyle = "rgba(232,99,10,0.85)";
    roundRect(ctx, 60, 118, bw, 28, 6); ctx.fill();
    ctx.fillStyle = "#ffffff"; ctx.fillText(badge, 64, 138);
  }

  // Services row
  const cats = (siProfile?.workCategories || []).slice(0, 5).map(id => {
    const c = SI_SERVICE_CATS.find(x => x.id === id);
    return c ? c.l : id;
  });
  if (cats.length) {
    ctx.font = "19px Arial"; ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.fillText(cats.join("  ·  ").slice(0, 68), 60, 175);
  }

  // Divider
  ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(60, 200); ctx.lineTo(840, 200); ctx.stroke();

  // Address
  if (siProfile?.businessAddress) {
    ctx.font = "18px Arial"; ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.fillText("📍  " + siProfile.businessAddress.slice(0, 58), 60, 240);
  }
  if (siProfile?.city) {
    ctx.font = "18px Arial"; ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.fillText(siProfile.city, 60, 268);
  }

  // Mobile
  if (user?.mobile) {
    ctx.font = "bold 30px Arial"; ctx.fillStyle = "#ffffff";
    ctx.fillText("📞  " + user.mobile, 60, 325);
  }

  // SiteMitra watermark
  ctx.fillStyle = "rgba(255,255,255,0.07)";
  roundRect(ctx, W-260, H-55, 240, 40, 8); ctx.fill();
  ctx.font = "bold 13px Arial"; ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillText("Powered by SiteMitra", W-250, H-29);

  resolve(canvas);
});

export const SIProfileScreen = ({ user, siProfile, onProfileSaved, lang, setScreen }) => {
  const { logout } = useAuth();
  const hi = lang === "hi";
  const [editing, setEditing] = useState(!siProfile?.businessName);
  const [businessName, setBusinessName]     = useState(siProfile?.businessName || "");
  const [city, setCity]                     = useState(siProfile?.city || "");
  const [businessType, setBusinessType]     = useState(siProfile?.businessType || "SI");
  const [workCategories, setWorkCategories] = useState(siProfile?.workCategories || []);
  const [businessAddress, setBusinessAddress] = useState(siProfile?.businessAddress || "");
  const [saving, setSaving]       = useState(false);
  const [saveErr, setSaveErr]     = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  const [sharing, setSharing]     = useState(false);
  const photoRef = useRef(null);

  useEffect(() => {
    if (siProfile) {
      setBusinessName(siProfile.businessName || "");
      setCity(siProfile.city || "");
      setBusinessType(siProfile.businessType || "SI");
      setWorkCategories(siProfile.workCategories || []);
      setBusinessAddress(siProfile.businessAddress || "");
    }
  }, [siProfile]);

  const handleSave = async () => {
    setSaving(true); setSaveErr("");
    try {
      const r = await api.put("/si", { businessName, city, businessType, workCategories, businessAddress });
      onProfileSaved(r.data);
      setEditing(false);
    } catch (e) { setSaveErr(e?.message || "Save failed"); }
    finally { setSaving(false); }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const form = new FormData();
      form.append("photo", file);
      const r = await api.post("/si/photo", form, { headers:{ "Content-Type":"multipart/form-data" } });
      onProfileSaved({ ...siProfile, customPhotoUrl: r?.data?.photoUrl });
    } catch {}
    setPhotoUploading(false);
  };

  const handleShareCard = async () => {
    if (!siProfile?.businessName) { alert(hi?"पहले profile save करें":"Please save profile first"); return; }
    setSharing(true);
    try {
      const canvas = await generateVisitingCard(siProfile, user);
      canvas.toBlob(async (blob) => {
        const file = new File([blob], "visiting-card.png", { type:"image/png" });
        if (navigator.share && navigator.canShare?.({ files:[file] })) {
          const cats = (siProfile.workCategories||[]).slice(0,3).map(id=>{ const c=SI_SERVICE_CATS.find(x=>x.id===id); return c?c.l:id; }).join(", ");
          const shareText = `🏢 ${siProfile.businessName}${siProfile.businessType?` (${siProfile.businessType})`:""}${cats?"\n"+cats:""}${user?.mobile?"\n📞 "+user.mobile:""}\n\n📲 मैं SiteMitra use करता हूँ — CCTV SI & Technician के लिए Free Platform\n👉 https://sitemitra.iotsoft.in`;
          await navigator.share({
            files: [file],
            title: siProfile.businessName,
            text: shareText,
          });
        } else {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url; a.download = "visiting-card.png"; a.click();
          URL.revokeObjectURL(url);
        }
        setSharing(false);
      }, "image/png");
    } catch { setSharing(false); }
  };

  const photoSrc = siProfile?.customPhotoUrl ? `${API_URL}${siProfile.customPhotoUrl}` : user?.photoUrl;
  const initials = user?.name?.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase() || "SI";
  const BIZ_TYPES = ["SI","CONTRACTOR","DEALER","SERVICE_PROVIDER"];
  const toggleCat = (id) => setWorkCategories(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);

  if (editing) {
    return (
      <div style={{ padding:"16px" }}>
        {siProfile?.businessName && (
          <button onClick={()=>setEditing(false)} style={{ display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",fontFamily:font.body,fontSize:14,color:T.muted,marginBottom:16 }}>
            ← {hi?"वापस":"Back"}
          </button>
        )}
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.sky,letterSpacing:"0.1em",marginBottom:6 }}>
          {hi?"COMPANY PROFILE":"COMPANY PROFILE"}
        </div>
        <h2 style={{ fontFamily:font.display,fontSize:22,fontWeight:800,marginBottom:20 }}>
          {hi?"Profile Setup करें":"Set Up Your Profile"}
        </h2>

        {/* Photo */}
        <div style={{ textAlign:"center",marginBottom:24 }}>
          <div style={{ position:"relative",display:"inline-block" }}>
            {photoSrc
              ? <img src={photoSrc} alt="" style={{ width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`2px solid ${T.border}` }} />
              : <div style={{ width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${T.sky},#0f4080)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font.display,fontSize:28,fontWeight:800,color:T.white }}>{initials}</div>
            }
            <button onClick={()=>photoRef.current?.click()} style={{ position:"absolute",bottom:0,right:0,width:28,height:28,borderRadius:"50%",background:T.saffron,color:T.white,border:`2px solid ${T.white}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:13 }}>
              📷
            </button>
          </div>
          <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }} />
          {photoUploading && <div style={{ fontSize:12,color:T.sky,marginTop:6 }}>Uploading…</div>}
          <div style={{ fontSize:12,color:T.muted,marginTop:6 }}>{hi?"Company / Profile Photo":"Company / Profile Photo"}</div>
        </div>

        {/* Business Name */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
            {hi?"COMPANY / BUSINESS NAME *":"COMPANY / BUSINESS NAME *"}
          </div>
          <input value={businessName} onChange={e=>setBusinessName(e.target.value)}
            placeholder={hi?"जैसे: Sharma Security Systems":"e.g. Sharma Security Systems"}
            style={{ width:"100%",padding:"13px 16px",border:`2px solid ${businessName?T.sky:T.border}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,transition:"border-color 0.2s" }}
          />
        </div>

        {/* City */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
            {hi?"CITY":"CITY"}
          </div>
          <input value={city} onChange={e=>setCity(e.target.value)}
            placeholder={hi?"जैसे: Jaipur":"e.g. Jaipur"}
            style={{ width:"100%",padding:"13px 16px",border:`2px solid ${city?T.sky:T.border}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,transition:"border-color 0.2s" }}
          />
        </div>

        {/* Business Address */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
            {hi?"BUSINESS ADDRESS":"BUSINESS ADDRESS"}
          </div>
          <textarea value={businessAddress} onChange={e=>setBusinessAddress(e.target.value)}
            placeholder={hi?"पूरा business address…":"Full business address…"}
            rows={2}
            style={{ width:"100%",padding:"13px 16px",border:`2px solid ${businessAddress?T.sky:T.border}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,resize:"none",lineHeight:1.5,transition:"border-color 0.2s" }}
          />
        </div>

        {/* Business Type */}
        <div style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:10 }}>
            {hi?"BUSINESS TYPE":"BUSINESS TYPE"}
          </div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {BIZ_TYPES.map(t=>(
              <button key={t} onClick={()=>setBusinessType(t)} style={{
                padding:"8px 16px",borderRadius:50,
                border:`2px solid ${businessType===t?T.sky:T.border}`,
                background:businessType===t?T.skyDim:T.white,
                color:businessType===t?T.sky:T.muted,
                fontFamily:font.body,fontSize:13,fontWeight:businessType===t?700:400,
                cursor:"pointer",transition:"all 0.18s",
              }}>{t}{businessType===t?" ✓":""}</button>
            ))}
          </div>
        </div>

        {/* Services / Work Categories */}
        <div style={{ marginBottom:24 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:10 }}>
            {hi?"SERVICES OFFERED (जो काम करते हो)":"SERVICES OFFERED"}
          </div>
          <div style={{ display:"flex",flexWrap:"wrap",gap:8 }}>
            {SI_SERVICE_CATS.map(c=>(
              <button key={c.id} onClick={()=>toggleCat(c.id)} style={{
                padding:"7px 13px",borderRadius:50,
                border:`2px solid ${workCategories.includes(c.id)?T.sky:T.border}`,
                background:workCategories.includes(c.id)?T.skyDim:T.white,
                color:workCategories.includes(c.id)?T.sky:T.muted,
                fontFamily:font.body,fontSize:13,fontWeight:workCategories.includes(c.id)?700:400,
                cursor:"pointer",transition:"all 0.18s",
              }}>{c.l}{workCategories.includes(c.id)?" ✓":""}</button>
            ))}
          </div>
        </div>

        {saveErr && (
          <div style={{ marginBottom:12,padding:"10px 14px",borderRadius:10,background:T.errorDim,fontSize:13,color:T.error }}>
            ⚠️ {saveErr}
          </div>
        )}

        <button onClick={handleSave} disabled={!businessName||saving} style={{
          width:"100%",padding:"15px",borderRadius:50,border:"none",
          background:businessName&&!saving?T.sky:T.border,color:T.white,
          fontFamily:font.display,fontSize:16,fontWeight:700,
          cursor:businessName&&!saving?"pointer":"not-allowed",
          boxShadow:businessName&&!saving?`0 4px 20px ${T.sky}50`:"none",
          marginBottom:24,transition:"all 0.2s",
          display:"flex",alignItems:"center",justifyContent:"center",gap:10,
        }}>
          {saving
            ? <><div style={{ width:18,height:18,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }} />{hi?"Save हो रहा…":"Saving…"}</>
            : (hi?"Profile Save करें →":"Save Profile →")
          }
        </button>
      </div>
    );
  }

  // ── VIEW MODE ──
  const catLabels = (siProfile?.workCategories||[]).map(id=>{ const c=SI_SERVICE_CATS.find(x=>x.id===id); return c?c.l:id; });

  return (
    <div style={{ padding:"16px" }}>
      {/* Profile header */}
      <div style={{ textAlign:"center",marginBottom:20 }}>
        <div style={{ position:"relative",display:"inline-block",marginBottom:10 }}>
          {photoSrc
            ? <img src={photoSrc} alt="" style={{ width:80,height:80,borderRadius:"50%",objectFit:"cover",border:`3px solid ${T.border}` }} />
            : <div style={{ width:80,height:80,borderRadius:"50%",background:`linear-gradient(135deg,${T.sky},#0f4080)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:font.display,fontSize:28,fontWeight:800,color:T.white }}>{initials}</div>
          }
          <button onClick={()=>photoRef.current?.click()} style={{ position:"absolute",bottom:0,right:0,width:26,height:26,borderRadius:"50%",background:T.saffron,color:T.white,border:`2px solid ${T.white}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12 }}>
            📷
          </button>
        </div>
        <input ref={photoRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display:"none" }} />
        <div style={{ fontFamily:font.display,fontSize:22,fontWeight:800 }}>{siProfile?.businessName || user?.name}</div>
        {siProfile?.businessType && <div style={{ fontSize:12,color:T.sky,fontFamily:font.mono,fontWeight:700,marginTop:3 }}>{siProfile.businessType}</div>}
        {siProfile?.city && <div style={{ fontSize:13,color:T.muted,marginTop:2 }}>📍 {siProfile.city}</div>}
      </div>

      {/* Info card */}
      <Card style={{ marginBottom:12 }}>
        <div style={{ padding:"14px 16px" }}>
          {siProfile?.businessAddress && (
            <div style={{ display:"flex",gap:10,marginBottom:10,alignItems:"flex-start" }}>
              <span style={{ fontSize:18,flexShrink:0 }}>🏢</span>
              <div style={{ fontSize:13,color:T.ink,lineHeight:1.5 }}>{siProfile.businessAddress}</div>
            </div>
          )}
          {user?.mobile && (
            <div style={{ display:"flex",gap:10,marginBottom:10,alignItems:"center" }}>
              <span style={{ fontSize:18 }}>📞</span>
              <div style={{ fontSize:14,fontWeight:600 }}>{user.mobile}</div>
            </div>
          )}
          {catLabels.length > 0 && (
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",marginTop:4 }}>
              {catLabels.map(l=><Tag key={l} label={l} color="sky" />)}
            </div>
          )}
        </div>
      </Card>

      {/* Visiting Card share */}
      <Card style={{ marginBottom:12,background:T.saffronDim,border:`1px solid ${T.saffron}30` }}>
        <div style={{ padding:"16px" }}>
          <div style={{ fontFamily:font.display,fontSize:15,fontWeight:700,marginBottom:4 }}>
            🪪 {hi?"Visiting Card Share करें":"Share Your Visiting Card"}
          </div>
          <div style={{ fontSize:13,color:T.muted,marginBottom:14,lineHeight:1.55 }}>
            {hi?"एक professional card image generate होगी — WhatsApp या किसी भी app पर share करें।":"A professional card image will be generated — share on WhatsApp or any app."}
          </div>
          <button onClick={handleShareCard} disabled={sharing} style={{
            width:"100%",padding:"13px",borderRadius:50,border:"none",
            background:sharing?T.border:T.saffron,color:T.white,
            fontFamily:font.display,fontSize:15,fontWeight:700,
            cursor:sharing?"not-allowed":"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            boxShadow:sharing?"none":`0 4px 20px ${T.saffron}40`,
            transition:"all 0.2s",
          }}>
            {sharing
              ? <><div style={{ width:18,height:18,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }} />{hi?"Card बन रहा…":"Generating…"}</>
              : <>📤 {hi?"Card Share करें":"Share Card"}</>
            }
          </button>
        </div>
      </Card>

      {/* My Technician Pool */}
      <button onClick={()=>setScreen?.("pool")} style={{
        width:"100%",padding:"13px",borderRadius:12,
        border:`1px solid ${T.saffron}`,background:T.saffronDim,color:T.saffron,
        fontFamily:font.display,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10,
        display:"flex",alignItems:"center",justifyContent:"center",gap:8,
      }}>
        👥 {hi?"मेरा Technician Pool":"My Technician Pool"}
      </button>

      {/* Edit profile */}
      <button onClick={()=>setEditing(true)} style={{
        width:"100%",padding:"13px",borderRadius:12,
        border:`1px solid ${T.sky}`,background:T.skyDim,color:T.sky,
        fontFamily:font.display,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:10,
      }}>
        ✏️ {hi?"Profile Edit करें":"Edit Profile"}
      </button>

      {/* Logout */}
      <button onClick={logout} style={{
        width:"100%",padding:"13px",borderRadius:12,
        border:`1px solid ${T.error}30`,background:T.errorDim,color:T.error,
        fontFamily:font.display,fontSize:14,fontWeight:700,cursor:"pointer",marginBottom:24,
      }}>
        🚪 {hi?"Logout करें":"Logout"}
      </button>
    </div>
  );
};
