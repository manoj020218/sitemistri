import { useState } from "react";
import { T, font } from "../../utils/theme";
import { Card } from "../../components/SharedUI";
import api from "../../services/api";
import { WORK_TYPES } from "../../utils/siConstants";

const wtLabel = (id, hi) => { const w = WORK_TYPES.find(x => x.id === id); return w ? (hi ? w.hi : w.en) : (id || "Site Work"); };

const REJECT_REASONS_HI = [
  "Busy हूँ", "बहुत दूर है", "आज available नहीं", "दूसरा काम है",
  "काम बहुत मुश्किल है", "Location unclear है", "Payment terms ठीक नहीं",
  "Tools नहीं हैं", "Client से बात नहीं हुई", "बाद में देखूँगा",
];
const REJECT_REASONS_EN = [
  "I'm busy", "Too far away", "Not available today", "Already have work",
  "Work too complex", "Location unclear", "Payment terms unsuitable",
  "Don't have required tools", "Haven't discussed with client", "Will reconsider later",
];

// Build a Google Maps URL that opens the Maps app on Android/iOS
// without going through the intent redirect chain that triggers Play Store.
const buildMapsUrl = (work) => {
  const c = work.siteLocation?.coordinates; // [lng, lat]
  if (c && (c[0] !== 0 || c[1] !== 0)) {
    return `https://maps.google.com/maps?q=${c[1]},${c[0]}`;
  }
  if (work.siteAddress) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(work.siteAddress)}`;
  }
  return null;
};

export const WorkDetailScreen = ({ work, lang, setScreen, onAccepted, onRejected }) => {
  const hi = lang === "hi";
  const [accepting,    setAccepting]    = useState(false);
  const [showReject,   setShowReject]   = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [rejecting,    setRejecting]    = useState(false);
  const [speaking,     setSpeaking]     = useState(false);

  const handleSpeak = () => {
    if (!window.speechSynthesis) { alert(hi ? "Speech support नहीं है" : "Speech not supported"); return; }
    window.speechSynthesis.cancel();
    const parts = [
      hi ? `${wtLabel(work.workType, true)} का काम है।` : `Work type: ${wtLabel(work.workType, false)}.`,
      work.siUserId?.name ? (hi ? `SI का नाम: ${work.siUserId.name}.` : `From SI: ${work.siUserId.name}.`) : "",
      work.siteAddress ? (hi ? `Site पता: ${work.siteAddress}.` : `Address: ${work.siteAddress}.`) : "",
      work.description ? (hi ? `विवरण: ${work.description}.` : `Details: ${work.description}.`) : "",
      work.agreedVisitCharge ? (hi ? `Visit charge: ${work.agreedVisitCharge} रुपये. Payment: ${work.paymentMode || ""}.` : `Charge: ${work.agreedVisitCharge} rupees. Payment: ${work.paymentMode || ""}.`) : "",
      work.materialIncluded === "YES" ? (hi ? "Material included है।" : "Material is included.") : work.materialIncluded === "NO" ? (hi ? "Material included नहीं है।" : "Material not included.") : "",
    ].filter(Boolean).join(" ");
    const utt = new SpeechSynthesisUtterance(parts);
    utt.lang = "hi-IN";
    utt.rate = 0.88;
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utt);
  };

  const handleStopSpeak = () => { window.speechSynthesis.cancel(); setSpeaking(false); };

  if (!work) return null;

  const mapsUrl = buildMapsUrl(work);
  const reasons = hi ? REJECT_REASONS_HI : REJECT_REASONS_EN;

  const handleAccept = async () => {
    setAccepting(true);
    try {
      await api.post(`/site-work/${work._id}/accept`);
      await onAccepted();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Error");
      setAccepting(false);
    }
  };

  const handleRejectSubmit = async () => {
    const reason = customReason.trim() || rejectReason;
    setRejecting(true);
    try {
      await api.post(`/site-work/${work._id}/reject`, { reason });
      await onRejected();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "Error");
      setRejecting(false);
    }
  };

  return (
    <div style={{ padding: 16 }}>
      <button onClick={() => setScreen("home")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, color:T.muted, marginBottom:16 }}>
        ← {hi ? "वापस" : "Back"}
      </button>
      <div style={{ fontFamily:font.mono, fontSize:11, color:T.saffron, letterSpacing:".1em", marginBottom:6 }}>WORK REQUEST</div>
      <h2 style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginBottom:16 }}>{work.workType || "—"}</h2>

      <Card style={{ marginBottom:12 }}>
        <div style={{ padding:"14px 16px" }}>
          {[
            { l:"SI",                          v: work.siUserId?.name || "—" },
            { l: hi?"Site Address":"Address",  v: `📍 ${work.siteAddress || "—"}` },
            { l: hi?"House/Flat":"House/Flat",  v: work.clientHouseNo || "—" },
            { l: hi?"विवरण":"Description",     v: work.description || "—" },
            { l: hi?"पसंदीदा समय":"Visit Time",v: work.preferredVisitTime ? new Date(work.preferredVisitTime).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "—" },
            { l: hi?"Charge":"Charge",         v: `₹${work.agreedVisitCharge || 0} · ${work.paymentMode || "—"}` },
            { l: hi?"Material":"Material",     v: work.materialIncluded || "—" },
          ].map(r => (
            <div key={r.l} style={{ marginBottom:10 }}>
              <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:2 }}>{r.l.toUpperCase()}</div>
              <div style={{ fontSize:14, color:T.ink, lineHeight:1.5 }}>{r.v}</div>
              <div style={{ height:1, background:T.border, marginTop:8 }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Maps button — uses coordinate URL, not short redirect */}
      {mapsUrl && (
        <a href={mapsUrl} target="_blank" rel="noreferrer"
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"13px", marginBottom:16, borderRadius:50, background:T.sky, color:T.white, fontFamily:font.display, fontSize:14, fontWeight:700, textDecoration:"none", boxShadow:`0 4px 14px ${T.sky}40` }}>
          🗺️ {hi ? "Site Location — Google Maps खोलें" : "Open Site in Google Maps"}
        </a>
      )}

      {/* Listen to instructions */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, background: speaking ? "#fff5f5" : T.skyDim, borderRadius:12, padding:"12px 14px", marginBottom:12, border:`1px solid ${speaking ? "#e53e3e30" : T.sky+"30"}`, transition:"all .3s" }}>
        <div>
          <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:3 }}>INSTRUCTIONS</div>
          <div style={{ fontSize:13, color:T.ink, fontFamily:font.body, lineHeight:1.5 }}>
            {hi ? "📢 काम की details सुनें — नीचे click करें" : "📢 Click to listen to work instructions"}
          </div>
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

      <div style={{ background:T.saffronDim, borderRadius:12, padding:"12px 14px", marginBottom:20, fontSize:12, color:"#7a4a1a", lineHeight:1.6, border:`1px solid ${T.saffron}30` }}>
        {hi
          ? "काम accept करने से confirm होता है कि work scope और payment SI से discuss हो गई है।"
          : "By accepting you confirm scope and payment have been discussed directly with SI."}
      </div>

      <div style={{ display:"flex", gap:10, marginBottom:24 }}>
        <button onClick={handleAccept} disabled={accepting} style={{
          flex:1, padding:"14px", borderRadius:50, border:"none",
          background: accepting ? T.border : T.green,
          color:T.white, fontFamily:font.display, fontSize:15, fontWeight:700,
          cursor: accepting ? "not-allowed" : "pointer",
          boxShadow: accepting ? "none" : `0 4px 16px ${T.green}40`,
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        }}>
          {accepting
            ? <><div style={{ width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }}/>{hi?"...":""}</>
            : `✓ ${hi ? "Accept करें" : "Accept Work"}`}
        </button>
        <button onClick={() => setShowReject(true)} style={{
          flex:1, padding:"14px", borderRadius:50,
          border:`1.5px solid ${T.error}`,
          background:T.white, color:T.error,
          fontFamily:font.display, fontSize:15, fontWeight:700, cursor:"pointer",
        }}>
          ✕ {hi ? "Reject" : "Reject"}
        </button>
      </div>

      {/* Reject reason bottom sheet */}
      {showReject && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"center" }}>
          <div className="slide-in" style={{ background:T.white, borderRadius:"20px 20px 0 0", padding:"20px 16px 32px", width:"100%", maxWidth:420, maxHeight:"80vh", overflowY:"auto" }}>
            <div style={{ fontFamily:font.display, fontSize:17, fontWeight:800, marginBottom:4 }}>
              {hi ? "Reject क्यों कर रहे हैं?" : "Reason for Rejection"}
            </div>
            <div style={{ fontSize:12, color:T.muted, fontFamily:font.body, marginBottom:16 }}>
              {hi ? "एक कारण चुनें — SI को दिखेगा।" : "Select a reason — visible to SI."}
            </div>

            <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:16 }}>
              {reasons.map(r => (
                <button key={r} onClick={() => { setRejectReason(r); setCustomReason(""); }}
                  style={{
                    padding:"7px 14px", borderRadius:50,
                    border:`2px solid ${rejectReason === r ? T.error : T.border}`,
                    background: rejectReason === r ? T.errorDim : T.white,
                    color: rejectReason === r ? T.error : T.ink,
                    fontFamily:font.body, fontSize:13, fontWeight: rejectReason === r ? 700 : 400,
                    cursor:"pointer", transition:"all .15s",
                  }}>
                  {r}{rejectReason === r ? " ✓" : ""}
                </button>
              ))}
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:6 }}>
                {hi ? "या खुद लिखें:" : "OR TYPE YOUR OWN:"}
              </div>
              <textarea
                value={customReason}
                onChange={e => { setCustomReason(e.target.value); setRejectReason(""); }}
                placeholder={hi ? "अपना कारण लिखें…" : "Type your reason…"}
                rows={2}
                style={{ width:"100%", padding:"10px 12px", border:`1.5px solid ${customReason ? T.error : T.border}`, borderRadius:10, resize:"none", fontFamily:font.body, fontSize:14, outline:"none", background:T.white, color:T.ink }}
              />
            </div>

            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setShowReject(false); setRejectReason(""); setCustomReason(""); }}
                style={{ flex:1, padding:"13px", borderRadius:50, border:`1px solid ${T.border}`, background:T.white, color:T.muted, fontFamily:font.display, fontSize:14, fontWeight:700, cursor:"pointer" }}>
                {hi ? "वापस" : "Cancel"}
              </button>
              <button onClick={handleRejectSubmit} disabled={rejecting || (!rejectReason && !customReason.trim())}
                style={{
                  flex:2, padding:"13px", borderRadius:50, border:"none",
                  background: (rejecting || (!rejectReason && !customReason.trim())) ? T.border : T.error,
                  color:T.white, fontFamily:font.display, fontSize:14, fontWeight:700,
                  cursor: (rejecting || (!rejectReason && !customReason.trim())) ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                }}>
                {rejecting
                  ? <><div style={{ width:16,height:16,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }}/>{hi?"...":""}</>
                  : `✕ ${hi ? "Reject करें" : "Confirm Reject"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
