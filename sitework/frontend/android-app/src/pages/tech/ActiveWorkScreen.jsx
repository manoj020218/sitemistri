import { useState, useRef } from "react";
import { T, font } from "../../utils/theme";
import { Card } from "../../components/SharedUI";
import api from "../../services/api";
import { WORK_TYPES } from "../../utils/siConstants";

const wtLabel = (id, hi) => { const w = WORK_TYPES.find(x => x.id === id); return w ? (hi ? w.hi : w.en) : (id || "Site Work"); };

const NEXT_ACTION = {
  ACCEPTED:     { ep:"/start-travel", hi:"निकल पड़ा", en:"Start Travel",  color:T.sky },
  ON_THE_WAY:   { ep:"/reached",      hi:"Site पर पहुंचा", en:"Reached Site", color:T.saffron },
  REACHED:      { ep:"/start-work",   hi:"काम शुरू किया", en:"Work Started",  color:T.saffron },
  WORK_STARTED: { ep:"/complete",     hi:"काम पूरा किया", en:"Work Complete", color:T.green },
};
const STATUS_STEPS = ["ACCEPTED","ON_THE_WAY","REACHED","WORK_STARTED","COMPLETED"];

export const ActiveWorkScreen = ({ work, lang, setScreen, onStatusChange, onProofUploaded }) => {
  const hi = lang==="hi";
  const [actionLoading, setActionLoading] = useState(false);
  const [proofUploading, setProofUploading] = useState(false);
  const [proofErr, setProofErr] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [showCompleteRemark, setShowCompleteRemark] = useState(false);
  const [remark, setRemark] = useState("");
  const [micOn, setMicOn] = useState(false);
  const [showSIModal, setShowSIModal] = useState(false);
  const proofRef = useRef();
  const micRef   = useRef(null);
  const micTimer = useRef(null);

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const parts = [
      hi ? `${wtLabel(work.workType, true)} का काम है।` : `Work: ${wtLabel(work.workType, false)}.`,
      work.siteAddress ? (hi ? `Site पता: ${work.siteAddress}.` : `Address: ${work.siteAddress}.`) : "",
      work.description ? (hi ? `विवरण: ${work.description}.` : `Details: ${work.description}.`) : "",
      work.agreedVisitCharge ? (hi ? `Charge: ${work.agreedVisitCharge} रुपये.` : `Charge: ${work.agreedVisitCharge} rupees.`) : "",
    ].filter(Boolean).join(" ");
    const utt = new SpeechSynthesisUtterance(parts);
    utt.lang = "hi-IN"; utt.rate = 0.88;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  };
  const handleStopSpeak = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  if (!work) {
    // Proof was uploaded → activeWork filter removed it → redirect home
    setTimeout(() => setScreen("home"), 100);
    return null;
  }

  const curStepIdx = STATUS_STEPS.indexOf(work.status);
  const next = NEXT_ACTION[work.status];

  const startMic = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert(hi ? "Mic support नहीं है" : "Mic not supported"); return; }
    setMicOn(true);
    const rec = new SR(); rec.lang="hi-IN"; rec.continuous=false; rec.interimResults=true;
    const base = remark;
    rec.onresult = (e) => {
      let interim="";
      for (let i=e.resultIndex;i<e.results.length;i++) {
        if (e.results[i].isFinal) interim+=e.results[i][0].transcript;
        else interim=e.results[i][0].transcript;
      }
      setRemark((base ? base+" " : "") + interim.trim());
    };
    rec.onend = () => { clearTimeout(micTimer.current); setMicOn(false); };
    rec.onerror = () => { clearTimeout(micTimer.current); setMicOn(false); };
    micTimer.current = setTimeout(() => { try{rec.stop();}catch{} }, 10000);
    try { rec.start(); micRef.current = rec; } catch { setMicOn(false); }
  };
  const stopMic = () => { clearTimeout(micTimer.current); try{micRef.current?.stop();}catch{} setMicOn(false); };

  const handleNext = async (remarkText) => {
    if (!next) return;
    setActionLoading(true);
    try {
      const body = remarkText ? { technicianRemark: remarkText } : undefined;
      await api.post(`/site-work/${work._id}${next.ep}`, body);
      await onStatusChange();
    } catch(e) { alert(e?.message || "Error") }
    finally { setActionLoading(false); }
  };

  const compressPhoto = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.onload = () => {
      URL.revokeObjectURL(url);
      const MAX = 1200;
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > MAX || h > MAX) {
        if (w >= h) { h = Math.round(h * MAX / w); w = MAX; }
        else        { w = Math.round(w * MAX / h); h = MAX; }
      }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      canvas.toBlob((blob) => {
        if (blob && blob.type === 'image/webp') { resolve(blob); return; }
        // webp not supported (old Safari) — fall back to jpeg
        canvas.toBlob(
          (b) => b ? resolve(b) : reject(new Error('Compression failed')),
          'image/jpeg', 0.78
        );
      }, 'image/webp', 0.78);
    };
    img.src = url;
  });

  const handleProofPick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProofUploading(true); setProofErr("");
    try {
      const blob = await compressPhoto(file);
      const ext  = blob.type === 'image/webp' ? 'webp' : 'jpeg';
      const fd   = new FormData();
      fd.append("photo", blob, `proof.${ext}`);
      await api.post(`/site-work/${work._id}/proof-photo`, fd);
      // Success — mark locally and go home immediately, no poll needed
      onProofUploaded(work._id);
    } catch(e) {
      setProofErr(e?.message || "Upload failed");
      if (proofRef.current) proofRef.current.value = "";
    }
    finally { setProofUploading(false); }
  };

  const siPhone = work.siUserId?.mobile || "";
  const siName = work.siUserId?.name || "SI";

  return (
    <div>
      <div style={{ padding:"16px 16px 0" }}>
        <button onClick={()=>setScreen("home")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, color:T.muted, marginBottom:16 }}>
          ← {hi?"वापस":"Back"}
        </button>
        <div style={{ fontFamily:font.mono, fontSize:11, color:T.saffron, letterSpacing:".1em", marginBottom:6 }}>ACTIVE SITE WORK</div>
        <h2 style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginBottom:16 }}>{work.workType || "Site Work"}</h2>

        {/* SI info */}
        <Card style={{ marginBottom:12 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em" }}>SI / CONTRACTOR</div>
              <button onClick={()=>setShowSIModal(true)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:16, padding:0, lineHeight:1 }} title="SI Profile">📋</button>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:font.display, fontSize:16, fontWeight:700 }}>{siName}</div>
                {siPhone && <div style={{ fontSize:13, color:T.muted }}>+91 {siPhone}</div>}
              </div>
              {siPhone && (
                <div style={{ display:"flex", gap:8 }}>
                  <a href={`tel:${siPhone}`} style={{ width:40, height:40, borderRadius:"50%", background:T.greenDim, border:`1px solid ${T.green}40`, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", fontSize:18 }}>📞</a>
                  <a href={`https://wa.me/91${siPhone}`} target="_blank" rel="noreferrer" style={{ width:40, height:40, borderRadius:"50%", background:"#e6f9f0", border:"1px solid #1a7a3a40", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", fontSize:18 }}>💬</a>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Listen button */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, background: speaking ? "#fff5f5" : T.skyDim, borderRadius:12, padding:"12px 14px", marginBottom:12, border:`1px solid ${speaking ? "#e53e3e30" : T.sky+"30"}`, transition:"all .3s" }}>
          <div style={{ fontSize:13, color:T.ink, fontFamily:font.body, lineHeight:1.5 }}>
            {hi ? "📢 काम की details सुनें — यहाँ click करें" : "📢 Click to listen to work instructions"}
          </div>
          <button onClick={speaking ? handleStopSpeak : handleSpeak} style={{
            flexShrink:0, padding:"9px 14px", borderRadius:50, border:"none",
            background: speaking ? "#e53e3e" : T.sky, color:T.white,
            fontFamily:font.display, fontSize:13, fontWeight:700, cursor:"pointer",
            display:"flex", alignItems:"center", gap:5,
          }}>
            {speaking ? "⏹ रुको" : "▶ सुनें"}
          </button>
        </div>

        {/* Site details */}
        <Card style={{ marginBottom:12 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>SITE DETAILS</div>
            {work.siteAddress && <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>📍 {work.siteAddress}</div>}
            {work.description && <div style={{ fontSize:13, color:T.muted, marginBottom:10 }}>{work.description}</div>}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom: work.siteAddress ? 12 : 0 }}>
              {work.preferredVisitTime && <div style={{ fontSize:13 }}>⏰ {work.preferredVisitTime}</div>}
              {work.agreedVisitCharge && <div style={{ fontSize:13 }}>💰 ₹{work.agreedVisitCharge} · {work.paymentMode}</div>}
            </div>
            {(() => {
              const c = work.siteLocation?.coordinates;
              const mapsUrl = (c && (c[0]!==0||c[1]!==0))
                ? `https://maps.google.com/maps?q=${c[1]},${c[0]}`
                : work.siteAddress
                ? `https://maps.google.com/maps?q=${encodeURIComponent(work.siteAddress)}`
                : null;
              return mapsUrl ? (
                <a href={mapsUrl} target="_blank" rel="noreferrer"
                  style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"11px", borderRadius:10, background:T.skyDim, border:`1px solid ${T.sky}40`, color:T.sky, fontFamily:font.display, fontSize:13, fontWeight:700, textDecoration:"none" }}>
                  🗺️ {hi?"Google Maps में खोलें":"Open in Google Maps"}
                </a>
              ) : null;
            })()}
          </div>
        </Card>

        {/* Status timeline */}
        <Card style={{ marginBottom:16 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:14 }}>PROGRESS</div>
            {STATUS_STEPS.map((s,i)=>{
              const done = i <= curStepIdx;
              const labels = { ACCEPTED:hi?"Accepted":"Accepted", ON_THE_WAY:hi?"On The Way":"On The Way", REACHED:hi?"Site पर पहुंचा":"Reached Site", WORK_STARTED:hi?"काम शुरू":"Work Started", COMPLETED:hi?"पूरा":"Completed" };
              return (
                <div key={s} style={{ display:"flex", gap:12, alignItems:"flex-start", marginBottom:i<STATUS_STEPS.length-1?14:0 }}>
                  <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:done?T.green:T.border, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {done ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg> : <span style={{ width:8, height:8, borderRadius:"50%", background:T.muted, display:"block" }} />}
                    </div>
                    {i<STATUS_STEPS.length-1 && <div style={{ width:2, flex:1, minHeight:16, background:done?T.green:T.border, marginTop:2 }} />}
                  </div>
                  <div style={{ paddingBottom:i<STATUS_STEPS.length-1?12:0 }}>
                    <div style={{ fontFamily:font.display, fontSize:14, fontWeight:700, color:done?T.ink:T.muted }}>{labels[s]}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Next action */}
        {next && work.status !== "COMPLETED" && (
          work.status === "WORK_STARTED" && showCompleteRemark ? (
            <div style={{ background:T.greenDim, borderRadius:14, padding:16, marginBottom:12, border:`1px solid ${T.green}40` }}>
              <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, marginBottom:10, color:T.ink }}>
                {hi ? "रिमार्क लिखें (optional)" : "Completion remark (optional)"}
              </div>
              <textarea
                value={remark} onChange={e=>setRemark(e.target.value)}
                placeholder={hi ? "कोई extra work, observation, या note लिखें..." : "Any extra work, observation, or note..."}
                rows={3}
                style={{ width:"100%", borderRadius:10, border:`1px solid ${T.border}`, padding:"10px 12px", fontFamily:font.body, fontSize:14, resize:"none", boxSizing:"border-box", marginBottom:10 }}
              />
              <button onClick={micOn ? stopMic : startMic}
                style={{ width:"100%", padding:"11px", borderRadius:50, border:`1px solid ${micOn ? T.error : T.border}`, background:micOn ? "#fff5f5" : T.white, cursor:"pointer", fontFamily:font.display, fontSize:14, fontWeight:700, color:micOn ? T.error : T.muted, marginBottom:10 }}>
                {micOn ? `⏹ ${hi?"रुको":"Stop"}` : `🎤 ${hi?"Mic से बोलें":"Speak via Mic"}`}
              </button>
              <button onClick={()=>handleNext(remark || undefined)} disabled={actionLoading}
                style={{ width:"100%", padding:"14px", borderRadius:50, border:"none", background:T.green, color:T.white, fontFamily:font.display, fontSize:16, fontWeight:700, cursor:"pointer", marginBottom:8, boxShadow:`0 4px 20px ${T.green}50`, opacity:actionLoading?0.7:1 }}>
                {actionLoading ? "…" : hi?"✅ काम पूरा करें →":"✅ Complete Work →"}
              </button>
              <button onClick={()=>{ setShowCompleteRemark(false); setRemark(""); }}
                style={{ width:"100%", padding:"11px", borderRadius:50, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", fontFamily:font.display, fontSize:13, fontWeight:600, color:T.muted }}>
                {hi?"वापस जाएं":"Back"}
              </button>
            </div>
          ) : (
            <button
              onClick={work.status === "WORK_STARTED" ? ()=>setShowCompleteRemark(true) : ()=>handleNext()}
              disabled={actionLoading}
              style={{ width:"100%", padding:"15px", borderRadius:50, border:"none", background:next.color, color:T.white, fontFamily:font.display, fontSize:16, fontWeight:700, cursor:"pointer", marginBottom:12, boxShadow:`0 4px 20px ${next.color}50`, opacity:actionLoading?0.7:1 }}>
              {actionLoading ? "…" : `${hi?next.hi:next.en} →`}
            </button>
          )
        )}

        {/* Proof photo upload */}
        {work.status === "COMPLETED" && !work.proof?.photoUploaded && (
          <div className="slide-in" style={{ background:T.saffronDim, borderRadius:14, padding:16, marginBottom:12, border:`1px solid ${T.saffron}40` }}>
            <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, marginBottom:6 }}>{hi?"1 Proof Photo Upload करें":"Upload 1 Proof Photo"}</div>
            <div style={{ fontSize:12, color:T.muted, marginBottom:12, lineHeight:1.6 }}>{hi?"कोई भी size चलेगी — auto-compress होगी।":"Any size — auto-compressed."}</div>
            {proofErr && <div style={{ fontSize:12, color:T.error, marginBottom:8 }}>{proofErr}</div>}
            <input ref={proofRef} type="file" accept="image/*" capture="environment" style={{ display:"none" }} onChange={handleProofPick} />
            <button onClick={()=>proofRef.current?.click()} disabled={proofUploading} style={{ width:"100%", padding:"13px", borderRadius:50, border:`2px dashed ${T.saffron}`, background:T.white, cursor:"pointer", fontFamily:font.display, fontSize:14, fontWeight:700, color:T.saffron }}>
              {proofUploading ? (hi?"Upload हो रही है…":"Uploading…") : `📷 ${hi?"Photo खींचें / Upload करें":"Take or Upload Photo"}`}
            </button>
          </div>
        )}

        {work.proof?.photoUploaded && (
          <div style={{ background:T.greenDim, borderRadius:14, padding:16, marginBottom:12, border:`1px solid ${T.green}40` }}>
            <div style={{ fontFamily:font.display, fontSize:14, fontWeight:700, color:T.green }}>✅ {hi?"Proof Photo भेज दी गई — SI review करेगा।":"Proof sent — SI will review and close."}</div>
          </div>
        )}

        {/* Cancel */}
        <button onClick={async()=>{ if(!confirm("Cancel this work?"))return; try{await api.post(`/site-work/${work._id}/cancel`);setScreen("home");}catch{} }} style={{ width:"100%", padding:"13px", borderRadius:50, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", fontFamily:font.display, fontSize:14, fontWeight:700, color:T.muted, marginBottom:24 }}>
          {hi?"Site Work Cancel करें":"Cancel Site Work"}
        </button>
      </div>

      {/* SI Profile modal */}
      {showSIModal && (
        <div style={{ position:"fixed", inset:0, zIndex:200, display:"flex", flexDirection:"column", justifyContent:"flex-end", alignItems:"center" }}
          onClick={()=>setShowSIModal(false)}>
          <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.45)" }} />
          <div className="slide-in" onClick={e=>e.stopPropagation()}
            style={{ width:"100%", maxWidth:420, background:T.white, borderRadius:"20px 20px 0 0", padding:"20px 16px 32px", position:"relative" }}>
            <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:"0 auto 18px" }} />
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".1em", marginBottom:6 }}>SI / CONTRACTOR</div>
            <div style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginBottom:4 }}>{siName}</div>
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
            <button onClick={()=>setShowSIModal(false)} style={{ width:"100%", padding:"13px", borderRadius:50, border:`1px solid ${T.border}`, background:T.white, cursor:"pointer", fontFamily:font.display, fontSize:15, fontWeight:700, color:T.muted }}>
              {hi?"बंद करें":"Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
