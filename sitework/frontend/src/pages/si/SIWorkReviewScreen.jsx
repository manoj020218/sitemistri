import { useState } from "react";
import { T, font } from "../../utils/theme";
import { Card, Stars } from "../../components/SharedUI";
import { WORK_TYPES } from "../../utils/siConstants";
import api from "../../services/api";

const buildRemindMsg = (w, hi) => {
  const techName = w.technicianUserId?.name || "Technician";
  const lines = hi
    ? [`नमस्ते ${techName} जी,`, `आपको SiteMitra पर एक काम assign हुआ है।`, ``,
       `📋 काम: ${w.workType || "Site Work"}`,
       w.siteAddress ? `📍 Site: ${w.siteAddress}` : null,
       w.agreedVisitCharge ? `💰 Charge: ₹${w.agreedVisitCharge}` : null,
       ``, `SiteMitra खोलें और Accept/Reject करें:`, `https://sitemitra.iotsoft.in/tech`]
    : [`Hello ${techName},`, `You have a new Site Work on SiteMitra.`, ``,
       `📋 Work: ${w.workType || "Site Work"}`,
       w.siteAddress ? `📍 ${w.siteAddress}` : null,
       w.agreedVisitCharge ? `💰 ₹${w.agreedVisitCharge}` : null,
       ``, `Open SiteMitra to Accept or Reject:`, `https://sitemitra.iotsoft.in/tech`];
  return lines.filter(Boolean).join("\n");
};

const STATUS_LABELS = {
  ACCEPTED: { hi:"Accepted", en:"Accepted", color:T.sky },
  ON_THE_WAY: { hi:"On the Way", en:"On the Way", color:T.sky },
  REACHED: { hi:"Site पर पहुंचा", en:"Reached Site", color:T.saffron },
  WORK_STARTED: { hi:"काम शुरू", en:"Work Started", color:T.saffron },
  COMPLETED: { hi:"पूरा — Review करें", en:"Completed — Review", color:T.green },
  CLOSED: { hi:"Closed", en:"Closed", color:T.muted },
  CANCELLED_BY_SI: { hi:"Cancelled by SI", en:"Cancelled by SI", color:T.error },
  CANCELLED_BY_TECH: { hi:"Cancelled by Tech", en:"Cancelled by Tech", color:T.error },
};

const Toggle = ({ label, value, onChange }) => (
  <button onClick={() => onChange(!value)}
    style={{ display:"flex", alignItems:"center", justifyContent:"space-between", width:"100%", padding:"11px 14px", borderRadius:10, border:`1px solid ${value ? T.green : T.border}`, background:value ? T.greenDim : T.white, cursor:"pointer", marginBottom:8 }}>
    <span style={{ fontFamily:font.body, fontSize:14, color:T.ink }}>{label}</span>
    <span style={{ width:36, height:20, borderRadius:10, background:value ? T.green : T.border, position:"relative", transition:"all .2s", display:"flex", alignItems:"center" }}>
      <span style={{ width:16, height:16, borderRadius:"50%", background:T.white, position:"absolute", left:value ? 18 : 2, transition:"all .2s", boxShadow:"0 1px 4px rgba(0,0,0,.2)" }} />
    </span>
  </button>
);

const TERMINAL_STATUSES = ['CLOSED','CANCELLED_BY_SI','CANCELLED_BY_TECH','REJECTED','DISPUTED','OVERDUE'];

const ChipGroup = ({ label, opts, val, setVal }) => (
  <div style={{ marginBottom:16 }}>
    <div style={{ fontFamily:font.mono, fontSize:11, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>{label}</div>
    <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
      {opts.map(o => (
        <button key={o.id} onClick={() => setVal(o.id)} style={{
          padding:"7px 14px", borderRadius:50,
          border:`2px solid ${val === o.id ? T.sky : T.border}`,
          background: val === o.id ? T.skyDim : T.white,
          color: val === o.id ? T.sky : T.muted,
          fontFamily:font.body, fontSize:13,
          fontWeight: val === o.id ? 700 : 400, cursor:"pointer", transition:"all .18s",
        }}>{o.l}{val === o.id ? " ✓" : ""}</button>
      ))}
    </div>
  </div>
);

const EditForm = ({ work, hi, onSaved, onCancel }) => {
  const [clientName,    setClientName]    = useState(work.clientName    || "");
  const [clientMobile,  setClientMobile]  = useState(work.clientMobile  || "");
  const [clientHouseNo, setClientHouseNo] = useState(work.clientHouseNo || "");
  const [siteAddress,   setSiteAddress]   = useState(work.siteAddress   || "");
  const [workType,      setWorkType]      = useState(work.workType      || null);
  const [description,   setDescription]   = useState(work.description   || "");
  const [visitTime,     setVisitTime]     = useState(
    work.preferredVisitTime
      ? new Date(work.preferredVisitTime).toISOString().slice(0,16)
      : ""
  );
  const [charge,       setCharge]       = useState(work.agreedVisitCharge || "");
  const [materialIncl, setMaterialIncl] = useState(work.materialIncluded  || null);
  const [paymentBy,    setPaymentBy]    = useState(work.paymentBy          || null);
  const [paymentMode,  setPaymentMode]  = useState(work.paymentMode        || null);
  const [saving,       setSaving]       = useState(false);
  const [saveErr,      setSaveErr]      = useState("");

  const canSave = clientName.trim() && siteAddress.trim();

  const handleSave = async () => {
    setSaving(true); setSaveErr("");
    try {
      const r = await api.patch(`/site-work/${work._id}`, {
        clientName:        clientName.trim(),
        clientMobile:      clientMobile.trim(),
        clientHouseNo:     clientHouseNo.trim(),
        siteAddress:       siteAddress.trim(),
        workType,
        description:       description.trim(),
        preferredVisitTime: visitTime || undefined,
        agreedVisitCharge:  Number(charge) || 0,
        materialIncluded:  materialIncl  || undefined,
        paymentBy:         paymentBy     || undefined,
        paymentMode:       paymentMode   || undefined,
      });
      onSaved(r.data);
    } catch(e) {
      setSaveErr(e?.message || "Save failed — please try again");
      setSaving(false);
    }
  };

  const Field = ({ label, required, children }) => (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontFamily:font.mono, fontSize:11, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>
        {label}{required ? " *" : ""}
      </div>
      {children}
    </div>
  );

  const inputStyle = (val, req) => ({
    width:"100%", padding:"13px 16px", borderRadius:12, outline:"none",
    fontFamily:font.body, fontSize:14, color:T.ink, background:T.white,
    boxSizing:"border-box",
    border:`1.5px solid ${val ? T.sky : (req ? T.error : T.border)}`,
    transition:"border-color .2s",
  });

  return (
    <div style={{ padding:16, paddingBottom:32 }}>
      <button onClick={onCancel} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, color:T.muted, marginBottom:16 }}>
        ← {hi ? "वापस" : "Back"}
      </button>
      <div style={{ fontFamily:font.mono, fontSize:11, color:T.saffron, letterSpacing:".1em", marginBottom:6 }}>EDIT SITE WORK</div>
      <h2 style={{ fontFamily:font.display, fontSize:20, fontWeight:800, marginBottom:20 }}>
        {hi ? "Details सुधारें" : "Edit Details"}
      </h2>

      <Field label="CLIENT NAME" required>
        <input type="text" value={clientName} onChange={e => setClientName(e.target.value)}
          placeholder="Client / Site Name"
          style={inputStyle(clientName, true)} />
      </Field>

      <Field label="CLIENT MOBILE">
        <input type="tel" value={clientMobile} onChange={e => setClientMobile(e.target.value)}
          placeholder="10 digit number"
          style={inputStyle(clientMobile, false)} />
      </Field>

      <Field label="HOUSE / FLAT / SHOP NO.">
        <input type="text" value={clientHouseNo} onChange={e => setClientHouseNo(e.target.value)}
          placeholder="e.g. D-204, Shop No. 5"
          style={inputStyle(clientHouseNo, false)} />
      </Field>

      <Field label="FULL SITE ADDRESS" required>
        <textarea value={siteAddress} onChange={e => setSiteAddress(e.target.value)}
          placeholder="Society, Colony, Area, City…" rows={2}
          style={{ ...inputStyle(siteAddress, true), resize:"none", lineHeight:1.5 }} />
      </Field>

      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono, fontSize:11, color:T.muted, letterSpacing:".08em", marginBottom:10 }}>WORK TYPE</div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          {WORK_TYPES.map(w => (
            <button key={w.id} onClick={() => setWorkType(w.id)} style={{
              display:"inline-flex", alignItems:"center", gap:5,
              padding:"7px 12px", borderRadius:50,
              border:`2px solid ${workType === w.id ? T.sky : T.border}`,
              background: workType === w.id ? T.skyDim : T.white,
              color: workType === w.id ? T.sky : T.muted,
              fontFamily:font.body, fontSize:13,
              fontWeight: workType === w.id ? 700 : 400, cursor:"pointer", transition:"all .18s",
            }}>{w.e} {hi ? w.hi : w.en}{workType === w.id ? " ✓" : ""}</button>
          ))}
        </div>
      </div>

      <Field label="DESCRIPTION">
        <textarea value={description} onChange={e => setDescription(e.target.value)}
          placeholder="Short description of work…" rows={3}
          style={{ ...inputStyle(description, false), resize:"none", lineHeight:1.5 }} />
      </Field>

      <Field label="PREFERRED VISIT TIME">
        <input type="datetime-local" value={visitTime} onChange={e => setVisitTime(e.target.value)}
          style={inputStyle(visitTime, false)} />
      </Field>

      <Field label="AGREED CHARGE">
        <div style={{ display:"flex", alignItems:"center", border:`2px solid ${charge ? T.sky : T.border}`, borderRadius:12, background:T.white, overflow:"hidden", transition:"border-color .2s" }}>
          <div style={{ padding:"13px 14px", borderRight:`1px solid ${T.border}`, fontFamily:font.mono, fontSize:15, fontWeight:700, color:T.muted, background:"#f9f6f0" }}>₹</div>
          <input type="number" value={charge} onChange={e => setCharge(e.target.value)}
            placeholder="e.g. 500"
            style={{ flex:1, padding:"13px 16px", border:"none", outline:"none", fontFamily:font.display, fontSize:16, fontWeight:700, color:T.ink, background:"transparent" }} />
        </div>
      </Field>

      <ChipGroup label="MATERIAL INCLUDED?" val={materialIncl} setVal={setMaterialIncl}
        opts={[{id:"YES",l:hi?"हाँ":"Yes"},{id:"NO",l:hi?"नहीं":"No"},{id:"NOT_SURE",l:hi?"पता नहीं":"Not Sure"}]} />
      <ChipGroup label="PAYMENT BY?" val={paymentBy} setVal={setPaymentBy}
        opts={[{id:"SI",l:"SI"},{id:"CLIENT",l:"Client"},{id:"OTHER",l:"Other"}]} />
      <ChipGroup label="PAYMENT MODE?" val={paymentMode} setVal={setPaymentMode}
        opts={[{id:"CASH",l:"Cash"},{id:"UPI",l:"UPI"},{id:"LATER",l:"Later"}]} />

      {saveErr && (
        <div style={{ marginBottom:12, padding:"10px 14px", borderRadius:10, background:T.errorDim, fontSize:13, color:T.error }}>
          ⚠️ {saveErr}
        </div>
      )}

      <button onClick={handleSave} disabled={!canSave || saving} style={{
        width:"100%", padding:"15px", borderRadius:50, border:"none",
        background: canSave && !saving ? T.sky : T.border, color:T.white,
        fontFamily:font.display, fontSize:16, fontWeight:700,
        cursor: canSave && !saving ? "pointer" : "not-allowed",
        boxShadow: canSave && !saving ? `0 4px 20px ${T.sky}50` : "none",
        marginBottom:8, display:"flex", alignItems:"center", justifyContent:"center", gap:10,
      }}>
        {saving
          ? <><div style={{ width:18,height:18,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"white",borderRadius:"50%",animation:"spin .8s linear infinite" }} />{hi ? "Save हो रहा…" : "Saving…"}</>
          : (hi ? "✓ बदलाव Save करें" : "✓ Save Changes")}
      </button>
      <button onClick={onCancel} style={{ width:"100%", padding:"13px", borderRadius:50, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", fontFamily:font.display, fontSize:14, fontWeight:700, color:T.muted }}>
        {hi ? "रद्द करें" : "Cancel"}
      </button>
    </div>
  );
};

export const SIWorkReviewScreen = ({ work: workProp, lang, setScreen, onClosed }) => {
  const hi = lang === "hi";
  const [localWork, setLocalWork]     = useState(workProp);
  const [isEditing, setIsEditing]     = useState(false);
  const [stars, setStars]             = useState(0);
  const [reachedOnTime, setReachedOnTime] = useState(true);
  const [skillMatch, setSkillMatch]   = useState(true);
  const [workCompleted, setWorkCompleted] = useState(true);
  const [behaviourGood, setBehaviourGood] = useState(true);
  const [comment, setComment]         = useState("");
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);

  if (!localWork) { setScreen("my-works"); return null; }

  const work = localWork;
  const canEdit = !TERMINAL_STATUSES.includes(work.status);

  const handleEdited = (updated) => {
    setLocalWork(updated);
    setIsEditing(false);
    onClosed?.(); // refresh parent list silently
  };

  if (isEditing) return (
    <EditForm
      work={work}
      hi={hi}
      onSaved={handleEdited}
      onCancel={() => setIsEditing(false)}
    />
  );

  const st = STATUS_LABELS[work.status] || { hi: work.status, en: work.status, color:T.muted };
  const techName  = work.technicianUserId?.name  || "Technician";
  const techPhone = work.technicianUserId?.mobile || "";
  const proofFilename = work.proof?.photoPath?.split(/[\\/]/).pop();
  const proofAge = work.proof?.uploadedAt
    ? (Date.now() - new Date(work.proof.uploadedAt).getTime()) / (1000*60*60*24)
    : 999;
  const showProof = work.proof?.storageStatus === "TEMP_STORED" && proofFilename && proofAge < 7;

  const handleClose = async () => {
    if (stars < 1) { alert(hi ? "कृपया Star rating दें" : "Please give a star rating"); return; }
    setLoading(true);
    try {
      await api.post(`/site-work/${work._id}/close`, {
        stars, reachedOnTime, skillMatch, workCompleted, behaviourGood,
        comment: comment.trim() || undefined,
      });
      setDone(true);
      await onClosed();
    } catch (e) {
      alert(e?.message || (hi ? "Error आई — दोबारा try करें" : "Error — please try again"));
    } finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ padding:"40px 24px", textAlign:"center" }}>
      <div style={{ fontSize:64, marginBottom:16 }}>🎉</div>
      <div style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginBottom:8 }}>
        {hi ? "काम बंद हो गया!" : "Work Closed!"}
      </div>
      <div style={{ fontSize:14, color:T.muted, marginBottom:24 }}>
        {hi ? "Rating save हो गई। Technician को notification मिलेगी।" : "Rating saved. Technician notified."}
      </div>
      <button onClick={() => setScreen("my-works")} style={{ padding:"14px 32px", borderRadius:50, border:"none", background:T.sky, color:T.white, fontFamily:font.display, fontSize:16, fontWeight:700, cursor:"pointer" }}>
        {hi ? "My Works →" : "My Works →"}
      </button>
    </div>
  );

  return (
    <div>
      <div style={{ padding:"16px 16px 0" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <button onClick={() => setScreen("my-works")} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, color:T.muted }}>
            ← {hi ? "वापस" : "Back"}
          </button>
          {canEdit && (
            <button onClick={() => setIsEditing(true)} style={{
              display:"flex", alignItems:"center", gap:5,
              padding:"7px 14px", borderRadius:50,
              border:`1.5px solid ${T.sky}`, background:T.skyDim,
              color:T.sky, fontFamily:font.mono, fontSize:12, fontWeight:700, cursor:"pointer",
            }}>
              ✏️ {hi ? "Edit" : "Edit"}
            </button>
          )}
        </div>

        <div style={{ fontFamily:font.mono, fontSize:11, color:T.saffron, letterSpacing:".1em", marginBottom:6 }}>
          WORK DETAIL
        </div>
        <h2 style={{ fontFamily:font.display, fontSize:22, fontWeight:800, marginBottom:16 }}>
          {work.workType || "Site Work"}
        </h2>

        {/* Work info */}
        <Card style={{ marginBottom:12 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:10 }}>TECHNICIAN</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <div style={{ fontFamily:font.display, fontSize:16, fontWeight:700 }}>{techName}</div>
                {techPhone && <div style={{ fontSize:13, color:T.muted }}>+91 {techPhone}</div>}
              </div>
              {techPhone && (
                <div style={{ display:"flex", gap:8 }}>
                  <a href={`tel:${techPhone}`} style={{ width:40, height:40, borderRadius:"50%", background:T.greenDim, border:`1px solid ${T.green}40`, display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", fontSize:18 }}>📞</a>
                  <a href={`https://wa.me/91${techPhone}`} target="_blank" rel="noreferrer" style={{ width:40, height:40, borderRadius:"50%", background:"#e6f9f0", border:"1px solid #1a7a3a40", display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", fontSize:18 }}>💬</a>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card style={{ marginBottom:12 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:10 }}>SITE DETAILS</div>
            {work.clientName && (
              <div style={{ marginBottom:10 }}>
                <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:4 }}>CLIENT</div>
                <div style={{ fontFamily:font.display, fontSize:15, fontWeight:700, marginBottom:6 }}>{work.clientName}</div>
                {work.clientMobile && (
                  <div style={{ display:"flex", gap:8 }}>
                    <a href={`tel:${work.clientMobile}`} style={{ flex:1, padding:"9px", borderRadius:10, background:T.greenDim, color:T.green, border:`1px solid ${T.green}30`, fontFamily:font.display, fontSize:13, fontWeight:700, textDecoration:"none", textAlign:"center" }}>📞 {work.clientMobile}</a>
                    <a href={`https://wa.me/91${work.clientMobile}`} target="_blank" rel="noreferrer" style={{ flex:"none", padding:"9px 14px", borderRadius:10, background:"#e6f9f0", color:"#1a7a3a", border:"1px solid #1a7a3a30", fontFamily:font.display, fontSize:13, fontWeight:700, textDecoration:"none", textAlign:"center" }}>💬 WA</a>
                  </div>
                )}
              </div>
            )}
            {work.siteAddress && <div style={{ fontSize:14, fontWeight:600, marginBottom:4 }}>📍 {work.siteAddress}</div>}
            {work.description && <div style={{ fontSize:13, color:T.muted, marginBottom:8 }}>{work.description}</div>}
            <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:8 }}>
              {work.agreedVisitCharge && <div style={{ fontSize:13 }}>💰 ₹{work.agreedVisitCharge} · {work.paymentMode}</div>}
              {work.preferredVisitTime && <div style={{ fontSize:13 }}>⏰ {new Date(work.preferredVisitTime).toLocaleString("en-IN")}</div>}
            </div>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"4px 12px", borderRadius:50, background:st.color+"20", border:`1px solid ${st.color}40` }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:st.color }} />
              <span style={{ fontFamily:font.mono, fontSize:11, fontWeight:700, color:st.color }}>{hi ? st.hi : st.en}</span>
            </div>
          </div>
        </Card>

        {/* PENDING_ACCEPTANCE — remind tech via WhatsApp/SMS */}
        {work.status === "PENDING_ACCEPTANCE" && (
          <div style={{ background:T.skyDim, borderRadius:14, padding:16, marginBottom:12, border:`1px solid ${T.sky}40` }}>
            <div style={{ fontFamily:font.display, fontSize:14, fontWeight:700, marginBottom:4, color:T.ink }}>
              {hi ? "⏳ Technician ने अभी Accept नहीं किया" : "⏳ Waiting for technician to accept"}
            </div>
            <div style={{ fontSize:12, color:T.muted, marginBottom:12, lineHeight:1.5 }}>
              {hi
                ? "अगर Tech का PWA बंद है तो WhatsApp या SMS से remind करें — message में सीधा link होगा।"
                : "If the tech's app is closed, remind them via WhatsApp or SMS — the message includes a direct link."}
            </div>
            {techPhone ? (
              <div style={{ display:"flex", gap:10 }}>
                <a href={`https://wa.me/91${techPhone}?text=${encodeURIComponent(buildRemindMsg(work, hi))}`}
                  target="_blank" rel="noreferrer"
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"12px", borderRadius:50, background:"#e6f9f0", border:"1px solid #1a7a3a40", textDecoration:"none", fontFamily:font.display, fontSize:14, fontWeight:700, color:"#1a7a3a" }}>
                  💬 WhatsApp
                </a>
                <a href={`sms:+91${techPhone}${/iP(hone|od|ad)/.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(buildRemindMsg(work, hi))}`}
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:7, padding:"12px", borderRadius:50, background:T.skyDim, border:`1px solid ${T.sky}60`, textDecoration:"none", fontFamily:font.display, fontSize:14, fontWeight:700, color:T.sky }}>
                  📱 SMS
                </a>
              </div>
            ) : (
              <div style={{ fontSize:12, color:T.muted }}>{hi ? "Technician का नंबर उपलब्ध नहीं" : "Tech phone number not available"}</div>
            )}
          </div>
        )}

        {/* Tech remark if any */}
        {work.technicianRemark && (
          <Card style={{ marginBottom:12 }}>
            <div style={{ padding:"14px 16px" }}>
              <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:6 }}>TECHNICIAN'S REMARK</div>
              <div style={{ fontSize:14, color:T.ink, fontStyle:"italic" }}>"{work.technicianRemark}"</div>
            </div>
          </Card>
        )}

        {/* Proof photo */}
        {showProof && (
          <div style={{ marginBottom:12 }}>
            <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>PROOF PHOTO</div>
            <img src={`/uploads/${proofFilename}`} alt="proof"
              style={{ width:"100%", borderRadius:12, border:`1px solid ${T.border}`, maxHeight:300, objectFit:"cover" }} />
          </div>
        )}

        {work.status === "COMPLETED" && (
          <div>
            <div style={{ fontFamily:font.mono, fontSize:11, color:T.saffron, letterSpacing:".1em", marginBottom:12, marginTop:4 }}>
              {hi ? "⭐ RATING & CLOSE" : "⭐ RATE & CLOSE WORK"}
            </div>

            {/* Stars */}
            <Card style={{ marginBottom:12 }}>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:12 }}>
                  {hi ? "OVERALL RATING (जरूरी)" : "OVERALL RATING (required)"}
                </div>
                <div style={{ display:"flex", gap:8, justifyContent:"center" }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} onClick={() => setStars(n)}
                      style={{ width:48, height:48, borderRadius:"50%", border:`2px solid ${n <= stars ? T.warn : T.border}`, background:n <= stars ? T.warnDim : T.white, cursor:"pointer", fontSize:22, transition:"all .15s" }}>
                      {n <= stars ? "⭐" : "☆"}
                    </button>
                  ))}
                </div>
                {stars > 0 && <div style={{ textAlign:"center", fontFamily:font.mono, fontSize:13, fontWeight:700, color:T.warn, marginTop:8 }}>{stars}/5</div>}
              </div>
            </Card>

            {/* Toggles */}
            <Card style={{ marginBottom:12 }}>
              <div style={{ padding:"14px 16px" }}>
                <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:12 }}>
                  {hi ? "PERFORMANCE (हाँ / नहीं)" : "PERFORMANCE"}
                </div>
                <Toggle label={hi ? "समय पर पहुंचा?" : "Reached on time?"} value={reachedOnTime} onChange={setReachedOnTime} />
                <Toggle label={hi ? "Skill match था?" : "Skills matched?"} value={skillMatch} onChange={setSkillMatch} />
                <Toggle label={hi ? "काम पूरा हुआ?" : "Work completed properly?"} value={workCompleted} onChange={setWorkCompleted} />
                <Toggle label={hi ? "व्यवहार अच्छा था?" : "Good behaviour?"} value={behaviourGood} onChange={setBehaviourGood} />
              </div>
            </Card>

            {/* Comment */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:font.mono, fontSize:10, color:T.muted, letterSpacing:".08em", marginBottom:8 }}>
                {hi ? "कोई टिप्पणी (optional)" : "COMMENT (optional)"}
              </div>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder={hi ? "technician के बारे में कुछ लिखें..." : "Write something about the technician..."}
                rows={3}
                style={{ width:"100%", borderRadius:10, border:`1px solid ${T.border}`, padding:"10px 12px", fontFamily:font.body, fontSize:14, resize:"none", boxSizing:"border-box" }} />
            </div>

            <button onClick={handleClose} disabled={loading || stars < 1}
              style={{ width:"100%", padding:"16px", borderRadius:50, border:"none", background:stars > 0 ? T.green : T.border, color:T.white, fontFamily:font.display, fontSize:16, fontWeight:700, cursor:stars > 0 ? "pointer" : "not-allowed", marginBottom:24, boxShadow:stars > 0 ? `0 4px 20px ${T.green}50` : "none", opacity:loading ? 0.7 : 1 }}>
              {loading ? "…" : (hi ? "✅ काम बंद करें (Close)" : "✅ Close & Rate Work")}
            </button>
          </div>
        )}

        {/* For non-COMPLETED non-CLOSED works, show cancel option */}
        {!["COMPLETED","CLOSED","CANCELLED_BY_SI","CANCELLED_BY_TECH"].includes(work.status) && (
          <button onClick={async () => {
            if (!confirm(hi ? "इस काम को cancel करें?" : "Cancel this work?")) return;
            try {
              await api.post(`/site-work/${work._id}/cancel`);
              await onClosed();
              setScreen("my-works");
            } catch(e) { alert(e?.message || "Error"); }
          }} style={{ width:"100%", padding:"13px", borderRadius:50, border:`1px solid ${T.border}`, background:"transparent", cursor:"pointer", fontFamily:font.display, fontSize:14, fontWeight:700, color:T.muted, marginBottom:24 }}>
            {hi ? "Site Work Cancel करें" : "Cancel Site Work"}
          </button>
        )}
      </div>
    </div>
  );
};
