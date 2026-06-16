import { useState, useRef } from "react";
import { T, font } from "../../utils/theme";
import { WORK_TYPES } from "../../utils/siConstants";
import api from "../../services/api";

// Voice input: tap to start → speaks live into field → auto-stops on pause (max 10s)
const MicButton = ({ onResult, baseValue = "", hi, atTop }) => {
  const [isOn, setIsOn] = useState(false);
  const recRef   = useRef(null);
  const finalRef = useRef("");
  const timerRef = useRef(null);
  const cbRef    = useRef(onResult); // always-fresh callback ref
  cbRef.current  = onResult;

  const start = () => {
    if (isOn) return;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert(hi ? "Chrome browser use करें — mic support नहीं है।" : "Please use Chrome — speech not supported.");
      return;
    }
    setIsOn(true);
    finalRef.current = "";
    const captured = baseValue; // snapshot before mic starts

    const rec = new SR();
    rec.lang = "hi-IN";
    rec.continuous = false;   // auto-stops after natural pause
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalRef.current += e.results[i][0].transcript;
        else interim = e.results[i][0].transcript;
      }
      // Live-type into input field as user speaks
      const live = (captured ? captured + " " : "") + (finalRef.current + interim).trim();
      cbRef.current(live);
    };

    rec.onerror = (ev) => {
      if (ev.error === "no-speech" || ev.error === "aborted") return;
      if (ev.error === "not-allowed")
        alert(hi ? "Microphone permission deny है। Browser settings में allow करें।" : "Mic permission denied — allow in browser settings.");
      else if (ev.error === "network")
        alert(hi ? "Network error — internet check करें।" : "Network error — check internet.");
      clearTimeout(timerRef.current);
      setIsOn(false);
    };

    rec.onend = () => {
      clearTimeout(timerRef.current);
      const final = (captured ? captured + " " : "") + finalRef.current.trim();
      if (finalRef.current.trim()) cbRef.current(final); // commit clean final
      setIsOn(false);
    };

    // Hard 10-second timeout
    timerRef.current = setTimeout(() => { try { rec.stop(); } catch {} }, 10000);

    try { rec.start(); recRef.current = rec; }
    catch (e) { clearTimeout(timerRef.current); setIsOn(false); alert("Mic error: " + e.message); }
  };

  const stop = () => { clearTimeout(timerRef.current); try { recRef.current?.stop(); } catch {} };

  return (
    <>
      <style>{`
        @keyframes ring1{0%{transform:scale(1);opacity:.65}100%{transform:scale(2.6);opacity:0}}
        @keyframes ring2{0%{transform:scale(1);opacity:.4}100%{transform:scale(3.4);opacity:0}}
      `}</style>

      {/* Sonar rings */}
      {isOn && (
        <span style={{
          position:"absolute", right:10,
          top: atTop ? 30 : "50%", transform: atTop ? "none" : "translateY(-50%)",
          width:36, height:36, borderRadius:"50%", pointerEvents:"none", zIndex:1,
        }}>
          <span style={{ position:"absolute",inset:0,borderRadius:"50%",background:"#e53e3e",animation:"ring1 1.5s ease-out infinite" }} />
          <span style={{ position:"absolute",inset:0,borderRadius:"50%",background:"#e53e3e",animation:"ring2 1.5s ease-out .6s infinite" }} />
        </span>
      )}

      {/* Hint strip */}
      {isOn && (
        <div style={{
          position:"absolute", bottom:"calc(100% + 8px)", left:0, right:0, zIndex:20,
          background:"#0f0e0c", color:"rgba(255,255,255,.65)", borderRadius:8,
          padding:"6px 12px", fontSize:11, fontFamily:font.mono,
          display:"flex", alignItems:"center", gap:6,
          boxShadow:"0 4px 16px rgba(0,0,0,.3)",
        }}>
          <span style={{ color:"#fc8181", fontSize:12 }}>●</span>
          {hi ? "बोलें — रुकने पर auto-stop" : "Speak — auto-stops on pause"}
          <span style={{ marginLeft:"auto", opacity:.5 }}>{hi?"या":"or"} 🔴 tap</span>
        </div>
      )}

      <button
        type="button"
        onPointerDown={e => { e.preventDefault(); isOn ? stop() : start(); }}
        onContextMenu={e => e.preventDefault()}
        style={{
          position:"absolute", right:10,
          top: atTop ? 12 : "50%", transform: atTop ? "none" : "translateY(-50%)",
          width:36, height:36, borderRadius:"50%", border:"none",
          background: isOn ? "#e53e3e" : T.sky,
          display:"flex", alignItems:"center", justifyContent:"center",
          cursor:"pointer", zIndex:2, padding:0, fontSize:17,
          transition:"background .15s",
          WebkitTapHighlightColor:"transparent",
          touchAction:"none", userSelect:"none",
        }}
      >🎤</button>
    </>
  );
};

export const AssignScreen = ({ lang, tech, setScreen, searchContext }) => {
  const hi = lang === "hi";
  if (!tech) { setScreen("search"); return null; }

  const prefillAddr = searchContext?.siteAddr || "";
  const prefillUrl  = searchContext?.mapShortUrl || "";

  const [clientName,    setClientName]    = useState("");
  const [clientMobile,  setClientMobile]  = useState("");
  const [clientHouseNo, setClientHouseNo] = useState("");
  const [siteArea,      setSiteArea]      = useState(prefillAddr);
  const [editingArea,   setEditingArea]   = useState(!prefillAddr);
  const [workType,      setWorkType]      = useState(searchContext?.workType || null);
  const [description,   setDescription]   = useState("");
  const [visitTime,     setVisitTime]      = useState("");
  const [charge,        setCharge]         = useState("");
  const [materialIncl,  setMaterialIncl]  = useState(null);
  const [paymentBy,     setPaymentBy]      = useState(null);
  const [paymentMode,   setPaymentMode]    = useState(null);
  const [confirmed,     setConfirmed]      = useState(false);
  const [submitted,     setSubmitted]      = useState(false);
  const [submitting,    setSubmitting]     = useState(false);
  const [submitErr,     setSubmitErr]      = useState("");

  const fullAddress = [clientHouseNo, siteArea].filter(Boolean).join(", ");
  const canSubmit = clientName && fullAddress && workType && confirmed;

  const handleSubmit = async () => {
    setSubmitting(true); setSubmitErr("");
    try {
      await api.post("/site-work", {
        technicianUserId: tech.techUserId || tech.userId,
        clientName, clientMobile,
        clientHouseNo,
        siteAddress: fullAddress,
        mapShortUrl: prefillUrl || undefined,
        siteLocation: searchContext?.siteCoords
          ? { type:'Point', coordinates:[searchContext.siteCoords.lng, searchContext.siteCoords.lat] }
          : undefined,
        workType, description,
        preferredVisitTime: visitTime,
        agreedVisitCharge: Number(charge) || 0,
        paymentMode: paymentMode || "CASH",
        materialIncluded: materialIncl || undefined,
      });
      setSubmitted(true);
    } catch (e) {
      setSubmitErr(e?.response?.data?.message || e?.message || "Failed to assign");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: "32px 16px", textAlign: "center" }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%",
          background: T.greenDim, border: `3px solid ${T.green}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px", fontSize: 36,
        }}>✅</div>
        <h2 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
          {hi ? "Site Work Assign हो गया!" : "Site Work Assigned!"}
        </h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 28 }}>
          {hi
            ? `${tech.name} को notification मिल गई। वो accept/reject करेगा।`
            : `${tech.name} has been notified. They will accept or reject.`}
        </p>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button onClick={() => setScreen("my-works")} style={{
            flex:1,padding:"13px",borderRadius:50,border:"none",
            background:T.sky,color:T.white,
            fontFamily:font.display,fontSize:15,fontWeight:700,cursor:"pointer",
          }}>
            {hi?"My Works देखें":"View My Works"}
          </button>
        </div>
        <button style={{
          width:"100%",padding:"13px",borderRadius:50,
          border:`1px solid ${T.border}`,background:T.white,
          fontFamily:font.display,fontSize:14,fontWeight:700,
          color:T.muted,cursor:"pointer",
          display:"flex",alignItems:"center",justifyContent:"center",gap:6,
        }}>
          💬 {hi?"Technician Contact Client को Forward करें":"Forward Technician to Client"}
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: "16px" }}>
      <button onClick={() => setScreen("search")} style={{
        display:"flex",alignItems:"center",gap:6,
        background:"none",border:"none",cursor:"pointer",
        fontFamily:font.body,fontSize:14,color:T.muted,marginBottom:16,
      }}>← {hi?"वापस":"Back"}</button>

      <div style={{ fontFamily: font.mono, fontSize: 11, color: T.sky, letterSpacing: "0.1em", marginBottom: 6 }}>
        {hi?"SITE WORK ASSIGN":"ASSIGN SITE WORK"}
      </div>
      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, marginBottom: 4 }}>
        {hi?"Site Work Details भरें":"Fill Site Work Details"}
      </h2>

      {/* Assigned to */}
      <div style={{
        display:"flex",alignItems:"center",gap:12,padding:"12px 14px",
        background:T.skyDim,borderRadius:12,marginBottom:20,
        border:`1px solid ${T.sky}30`,
      }}>
        <div style={{
          width:40,height:40,borderRadius:"50%",flexShrink:0,
          background:`linear-gradient(135deg,${T.saffron},#c45a08)`,
          display:"flex",alignItems:"center",justifyContent:"center",
          fontFamily:font.display,fontSize:18,fontWeight:800,color:T.white,
        }}>{tech.name[0]}</div>
        <div>
          <div style={{ fontFamily:font.mono,fontSize:10,color:T.sky,letterSpacing:"0.08em" }}>
            {hi?"ASSIGNING TO":"ASSIGNING TO"}
          </div>
          <div style={{ fontFamily:font.display,fontSize:15,fontWeight:700 }}>{tech.name}</div>
          <div style={{ fontSize:12,color:T.muted }}>{tech.distanceKm} km · {tech.city}</div>
        </div>
      </div>

      {/* Client Name */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
          {hi?"CLIENT / SITE NAME *":"CLIENT / SITE NAME *"}
        </div>
        <div style={{ position:"relative" }}>
          <input type="text" value={clientName} onChange={e=>setClientName(e.target.value)}
            placeholder={hi?"जैसे: Sharma Medical Store":"e.g. Sharma Medical Store"}
            style={{ width:"100%",padding:"13px 46px 13px 16px",border:`1.5px solid ${clientName?T.sky:T.error}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,transition:"border-color 0.2s" }}
          />
          <MicButton onResult={v=>setClientName(v)} baseValue={clientName} hi={hi} />
        </div>
      </div>

      {/* Client Mobile */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
          {hi?"CLIENT MOBILE (OPTIONAL)":"CLIENT MOBILE (OPTIONAL)"}
        </div>
        <input type="tel" value={clientMobile} onChange={e=>setClientMobile(e.target.value)}
          placeholder={hi?"10 digit number":"10 digit number"}
          style={{ width:"100%",padding:"13px 16px",border:`2px solid ${clientMobile?T.sky:T.border}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,transition:"border-color 0.2s" }}
        />
      </div>

      {/* House / Flat / Shop No. */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
          {hi?"HOUSE / FLAT / SHOP NO.":"HOUSE / FLAT / SHOP NO."}
        </div>
        <div style={{ position:"relative" }}>
          <input type="text" value={clientHouseNo} onChange={e=>setClientHouseNo(e.target.value)}
            placeholder={hi?"जैसे: D-204, Shop No. 5, Plot 12":"e.g. D-204, Shop No. 5, Plot 12"}
            style={{ width:"100%",padding:"13px 46px 13px 16px",border:`2px solid ${clientHouseNo?T.sky:T.border}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,transition:"border-color 0.2s" }}
          />
          <MicButton onResult={v=>setClientHouseNo(v)} baseValue={clientHouseNo} hi={hi} />
        </div>
      </div>

      {/* Society / Colony / Area */}
      <div style={{ marginBottom:16 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em" }}>
            {hi?"SOCIETY / COLONY / AREA *":"SOCIETY / COLONY / AREA *"}
          </div>
          {!editingArea && (
            <button onClick={()=>setEditingArea(true)} style={{ display:"flex",alignItems:"center",gap:4,background:"none",border:`1px solid ${T.sky}`,borderRadius:20,padding:"2px 8px",cursor:"pointer",fontFamily:font.mono,fontSize:10,color:T.sky }}>
              ✏️ {hi?"Edit":"Edit"}
            </button>
          )}
        </div>
        {editingArea ? (
          <div style={{ position:"relative" }}>
            <textarea
              value={siteArea} onChange={e=>setSiteArea(e.target.value)}
              rows={2}
              placeholder={hi?"Society, Colony, Area का नाम":"Society, Colony, Area name"}
              style={{ width:"100%",padding:"13px 46px 13px 16px",border:`1.5px solid ${siteArea?T.sky:T.error}`,borderRadius:12,outline:"none",fontFamily:font.body,fontSize:14,color:T.ink,background:T.white,resize:"none",lineHeight:1.5,transition:"border-color 0.2s" }}
            />
            <MicButton onResult={v=>setSiteArea(v)} baseValue={siteArea} hi={hi} atTop />
          </div>
        ) : (
          <div style={{ padding:"13px 16px",border:`2px solid ${T.sky}`,borderRadius:12,background:T.skyDim,fontFamily:font.body,fontSize:14,color:T.ink,lineHeight:1.5 }}>
            📍 {siteArea}
          </div>
        )}
        {prefillAddr && (
          <div style={{ marginTop:5,fontSize:11,color:T.green,fontFamily:font.mono }}>
            ✓ {hi?"Search की location से pre-fill हुई":"Pre-filled from your search location"}
          </div>
        )}
      </div>

      {/* Google Maps link */}
      {prefillUrl && (
        <div style={{ marginBottom:16,padding:"12px 14px",background:T.greenDim,border:`1px solid ${T.green}40`,borderRadius:12,display:"flex",gap:10,alignItems:"flex-start" }}>
          <span style={{ fontSize:20,flexShrink:0 }}>🗺️</span>
          <div>
            <div style={{ fontFamily:font.mono,fontSize:10,color:T.green,fontWeight:700,letterSpacing:".08em",marginBottom:4 }}>
              {hi?"GOOGLE MAPS LINK — TECH को मिलेगी":"GOOGLE MAPS LINK — TECH WILL RECEIVE"}
            </div>
            <a href={prefillUrl} target="_blank" rel="noreferrer"
              style={{ fontSize:12,color:T.sky,wordBreak:"break-all",lineHeight:1.5,display:"block",marginBottom:4 }}>
              {prefillUrl}
            </a>
            <div style={{ fontSize:11,color:T.muted }}>
              {hi?"Tech इस link पर tap करेगा और Google Maps में site खुल जाएगी।":"Tech taps this link and site opens directly in Google Maps."}
            </div>
          </div>
        </div>
      )}

      {/* Work Type */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:10 }}>
          {hi?"WORK TYPE *":"WORK TYPE *"}
        </div>
        <div style={{ display:"flex",flexWrap:"wrap",gap:8,padding:6,borderRadius:10,border:`1.5px solid ${workType?'transparent':T.error}`,transition:"border-color 0.2s" }}>
          {WORK_TYPES.map(w=>(
            <button key={w.id} onClick={()=>setWorkType(w.id)} style={{
              display:"inline-flex",alignItems:"center",gap:5,
              padding:"7px 12px",borderRadius:50,
              border:`2px solid ${workType===w.id?T.sky:T.border}`,
              background:workType===w.id?T.skyDim:T.white,
              color:workType===w.id?T.sky:T.muted,
              fontFamily:font.body,fontSize:13,
              fontWeight:workType===w.id?700:400,cursor:"pointer",transition:"all 0.18s",
            }}>
              {w.e} {hi?w.hi:w.en}{workType===w.id?" ✓":""}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
          {hi?"WORK DESCRIPTION":"WORK DESCRIPTION"}
        </div>
        <div style={{ position:"relative" }}>
          <textarea
            value={description}
            onChange={e=>setDescription(e.target.value)}
            placeholder={hi?"काम का short description… (🎤 mic से बोलकर भी भर सकते हैं)":"Short description of work… (🎤 tap mic to speak)"}
            rows={3}
            style={{
              width:"100%",padding:"13px 46px 13px 16px",
              border:`2px solid ${description?T.sky:T.border}`,
              borderRadius:12,outline:"none",
              fontFamily:font.body,fontSize:14,color:T.ink,
              background:T.white,resize:"none",lineHeight:1.5,
              transition:"border-color 0.2s",
            }}
          />
          <MicButton onResult={v=>setDescription(v)} baseValue={description} hi={hi} atTop />
        </div>
      </div>

      {/* Visit Time */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
          {hi?"PREFERRED VISIT TIME":"PREFERRED VISIT TIME"}
        </div>
        <input
          type="datetime-local"
          value={visitTime}
          onChange={e=>setVisitTime(e.target.value)}
          style={{
            width:"100%",padding:"13px 16px",
            border:`2px solid ${visitTime?T.sky:T.border}`,
            borderRadius:12,outline:"none",
            fontFamily:font.body,fontSize:14,color:T.ink,
            background:T.white,transition:"border-color 0.2s",
          }}
        />
      </div>

      {/* Charge */}
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:8 }}>
          {hi?"AGREED VISIT CHARGE (OPTIONAL)":"AGREED VISIT CHARGE (OPTIONAL)"}
        </div>
        <div style={{ display:"flex",alignItems:"center",border:`2px solid ${charge?T.sky:T.border}`,borderRadius:12,background:T.white,overflow:"hidden",transition:"border-color 0.2s" }}>
          <div style={{ padding:"13px 14px",borderRight:`1px solid ${T.border}`,fontFamily:font.mono,fontSize:15,fontWeight:700,color:T.muted,background:"#f9f6f0" }}>₹</div>
          <input
            type="number" value={charge}
            onChange={e=>setCharge(e.target.value)}
            placeholder={hi?"जैसे: 500":"e.g. 500"}
            style={{ flex:1,padding:"13px 16px",border:"none",outline:"none",fontFamily:font.display,fontSize:16,fontWeight:700,color:T.ink,background:"transparent" }}
          />
        </div>
        <div style={{ fontSize:11,color:T.muted,marginTop:5,fontFamily:font.mono }}>
          {hi?"Reference only — app collect नहीं करता":"Reference only — app does not collect payment"}
        </div>
      </div>

      {/* Material + Payment */}
      {[
        {
          label: hi?"MATERIAL INCLUDED?":"MATERIAL INCLUDED?",
          opts: [{id:"YES",l:hi?"हाँ":"Yes"},{id:"NO",l:hi?"नहीं":"No"},{id:"NOT_SURE",l:hi?"पता नहीं":"Not Sure"}],
          val: materialIncl, set: setMaterialIncl,
        },
        {
          label: hi?"PAYMENT BY?":"PAYMENT BY?",
          opts: [{id:"SI",l:"SI"},{id:"CLIENT",l:hi?"Client":"Client"},{id:"OTHER",l:hi?"Other":"Other"}],
          val: paymentBy, set: setPaymentBy,
        },
        {
          label: hi?"PAYMENT MODE?":"PAYMENT MODE?",
          opts: [{id:"CASH",l:hi?"Cash":"Cash"},{id:"UPI",l:"UPI"},{id:"LATER",l:hi?"Later":"Later"}],
          val: paymentMode, set: setPaymentMode,
        },
      ].map(f=>(
        <div key={f.label} style={{ marginBottom:16 }}>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.muted,letterSpacing:"0.08em",marginBottom:10 }}>{f.label}</div>
          <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
            {f.opts.map(o=>(
              <button key={o.id} onClick={()=>f.set(o.id)} style={{
                padding:"8px 16px",borderRadius:50,
                border:`2px solid ${f.val===o.id?T.sky:T.border}`,
                background:f.val===o.id?T.skyDim:T.white,
                color:f.val===o.id?T.sky:T.muted,
                fontFamily:font.body,fontSize:14,
                fontWeight:f.val===o.id?700:400,cursor:"pointer",transition:"all 0.18s",
              }}>
                {o.l}{f.val===o.id?" ✓":""}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* T&C Confirm */}
      <button onClick={()=>setConfirmed(!confirmed)} style={{
        width:"100%",padding:"14px 16px",
        borderRadius:12,border:`1.5px solid ${confirmed?T.green:T.error}`,
        background:confirmed?T.greenDim:T.white,
        display:"flex",alignItems:"flex-start",gap:12,
        cursor:"pointer",marginBottom:20,textAlign:"left",
        transition:"all 0.2s",
      }}>
        <div style={{
          width:22,height:22,borderRadius:6,flexShrink:0,marginTop:1,
          border:`2px solid ${confirmed?T.green:T.error}`,
          background:confirmed?T.green:T.white,
          display:"flex",alignItems:"center",justifyContent:"center",
          transition:"all 0.2s",
        }}>
          {confirmed&&<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span style={{ fontSize:13,color:T.ink,lineHeight:1.6,fontFamily:font.body }}>
          {hi
            ?"मैं confirm करता/करती हूँ कि work scope, charges, payment, material, और timing technician से directly discuss हो गई है। Platform किसी payment या work dispute के लिए liable नहीं है।"
            :"I confirm that work scope, charges, payment, material, and timing have been directly discussed with the technician. Platform is not liable for payment or work disputes."}
        </span>
      </button>

      {submitErr && (
        <div style={{ marginBottom:12, padding:"10px 14px", borderRadius:10, background:T.errorDim, fontSize:13, color:T.error, fontFamily:font.body }}>
          ⚠️ {submitErr}
        </div>
      )}
      <button onClick={handleSubmit} disabled={!canSubmit||submitting} style={{
        width:"100%",padding:"15px",borderRadius:50,border:"none",
        background:canSubmit&&!submitting?T.sky:T.border,color:T.white,
        fontFamily:font.display,fontSize:16,fontWeight:700,
        cursor:canSubmit&&!submitting?"pointer":"not-allowed",
        boxShadow:canSubmit&&!submitting?`0 4px 20px ${T.sky}50`:"none",
        marginBottom:24,transition:"all 0.2s",
        display:"flex",alignItems:"center",justifyContent:"center",gap:10,
      }}>
        {submitting
          ? <><div style={{ width:18,height:18,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }} />{hi?"Assign हो रहा…":"Assigning…"}</>
          : (hi?"Site Work Assign करें →":"Assign Site Work →")
        }
      </button>
    </div>
  );
};
