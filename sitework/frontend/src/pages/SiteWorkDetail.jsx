import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const T = {
  ink: "#0f0e0c", paper: "#f5f0e8", saffron: "#e8630a",
  saffronLight: "#ff8c3a", saffronDim: "#fde8d4",
  green: "#1a7a4a", greenLight: "#22a060", greenDim: "#d4f0e2",
  sky: "#1a5fa8", skyDim: "#daeaf8",
  border: "#e0d8cc", muted: "#6b6258", white: "#ffffff",
  error: "#c0392b", errorDim: "#fdecea",
  warn: "#b8860b", warnDim: "#fff8e1",
  purple: "#6b3fa0", purpleDim: "#ede5f8",
};

const font = {
  display: "'Baloo 2', sans-serif",
  body:    "'Noto Sans Devanagari', sans-serif",
  mono:    "'Space Mono', monospace",
};

const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin:0; padding:0; }
    html,body { background:${T.paper}; font-family:${font.body}; color:${T.ink}; }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);} }
    @keyframes slideUp { from{opacity:0;transform:translateY(40px);}to{opacity:1;transform:translateY(0);} }
    @keyframes popIn   { 0%{transform:scale(0.7);opacity:0;}70%{transform:scale(1.1);}100%{transform:scale(1);opacity:1;} }
    @keyframes spin    { to{transform:rotate(360deg);} }
    @keyframes pulse   { 0%,100%{opacity:1;}50%{opacity:.45;} }
    @keyframes confetti{
      0%  { transform:translateY(0) rotate(0deg);   opacity:1; }
      100%{ transform:translateY(80px) rotate(720deg); opacity:0; }
    }
    .fade-up   { animation: fadeUp  .35s ease both; }
    .fade-up-1 { animation: fadeUp  .35s .05s ease both; }
    .fade-up-2 { animation: fadeUp  .35s .10s ease both; }
    .fade-up-3 { animation: fadeUp  .35s .15s ease both; }
    .pop-in    { animation: popIn   .4s  ease both; }
  `}</style>
);

// ── Helpers ──────────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', hour12: true,
  });
};

const proofUrl = (photoPath) => {
  if (!photoPath) return null;
  const base = import.meta.env.VITE_API_URL || '';
  const clean = photoPath.replace(/^\//, '');
  // photoPath is a full filesystem path — extract from uploads/ onwards
  const idx = clean.indexOf('uploads/');
  const rel = idx !== -1 ? clean.slice(idx) : clean;
  return `${base}/${rel}`;
};

const normalize = (raw) => ({
  id:             raw._id,
  siId:           raw.siUserId?._id?.toString() || raw.siUserId?.toString(),
  techId:         raw.technicianUserId?._id?.toString() || raw.technicianUserId?.toString(),
  siName:         raw.siUserId?.name    || '—',
  techName:       raw.technicianUserId?.name   || '—',
  techMobile:     raw.technicianUserId?.mobile || '',
  siteClientName: raw.clientName,
  clientMobile:   raw.clientMobile,
  siteAddress:    raw.siteAddress,
  workType:       raw.workType,
  description:    raw.description,
  preferredTime:  raw.preferredVisitTime,
  agreedCharge:   raw.agreedVisitCharge,
  materialIncluded: raw.materialIncluded,
  paymentBy:      raw.paymentBy,
  paymentMode:    raw.paymentMode,
  status:         raw.status,
  proofUploaded:  raw.proof?.photoUploaded,
  proofPhotoUrl:  proofUrl(raw.proof?.photoPath),
  ratingGiven:    raw.ratingBySI?.stars ? raw.ratingBySI : null,
  timestamps: {
    createdAt:             fmtDate(raw.createdAt),
    assignedAt:            fmtDate(raw.timestamps?.assignedAt),
    acceptedAt:            fmtDate(raw.timestamps?.acceptedAt),
    travelStartedAt:       fmtDate(raw.timestamps?.travelStartedAt),
    reachedAt:             fmtDate(raw.timestamps?.reachedAt),
    workStartedAt:         fmtDate(raw.timestamps?.workStartedAt),
    technicianCompletedAt: fmtDate(raw.timestamps?.technicianCompletedAt),
    siClosedAt:            fmtDate(raw.timestamps?.siClosedAt),
    cancelledAt:           fmtDate(raw.timestamps?.cancelledAt),
  },
});

// ── Status config ─────────────────────────────────────────────────────
const STATUS_CFG = {
  PENDING_ACCEPTANCE: { hi: "Technician का इंतजार", en: "Pending Acceptance", color: "warn" },
  ACCEPTED:           { hi: "Accepted",              en: "Accepted",          color: "sky" },
  ON_THE_WAY:         { hi: "On The Way",             en: "On The Way",        color: "sky" },
  REACHED:            { hi: "Site पर पहुंचा",          en: "Reached Site",      color: "sky" },
  WORK_STARTED:       { hi: "काम शुरू",               en: "Work Started",      color: "saffron" },
  COMPLETED:          { hi: "Complete — Review करें", en: "Complete — Review", color: "saffron" },
  CLOSED:             { hi: "Closed ✓",               en: "Closed ✓",          color: "green" },
  CANCELLED_BY_SI:    { hi: "SI ने Cancel किया",      en: "Cancelled by SI",   color: "error" },
  CANCELLED_BY_TECH:  { hi: "Tech ने Cancel किया",    en: "Cancelled by Tech", color: "error" },
};

// ── Shared UI components ──────────────────────────────────────────────
const Card = ({ children, style, className }) => (
  <div className={className} style={{
    background: T.white, borderRadius: 16,
    border: `1px solid ${T.border}`,
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    overflow: "hidden", ...style,
  }}>{children}</div>
);

const SectionLabel = ({ children }) => (
  <div style={{
    fontFamily: font.mono, fontSize: 10, fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: T.muted, marginBottom: 8,
  }}>{children}</div>
);

const Tag = ({ label, color = "sky" }) => {
  const c = {
    sky:     { bg: T.skyDim,     text: T.sky },
    saffron: { bg: T.saffronDim, text: T.saffron },
    green:   { bg: T.greenDim,   text: T.green },
    ink:     { bg: "#e8e4dc",    text: T.ink },
    warn:    { bg: T.warnDim,    text: T.warn },
    error:   { bg: T.errorDim,   text: T.error },
  }[color] || { bg: T.skyDim, text: T.sky };
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 20,
      background: c.bg, color: c.text,
      fontFamily: font.mono, fontSize: 10, fontWeight: 700,
      letterSpacing: "0.06em", textTransform: "uppercase",
    }}>{label}</span>
  );
};

const Divider = () => <div style={{ height: 1, background: T.border }} />;

const InfoRow = ({ label, value, valueStyle }) => (
  <div style={{ marginBottom: 14 }}>
    <SectionLabel>{label}</SectionLabel>
    <div style={{ fontSize: 14, color: T.ink, lineHeight: 1.55, ...valueStyle }}>{value}</div>
  </div>
);

const StarPicker = ({ value, onChange, size = 32 }) => (
  <div style={{ display: "flex", gap: 6 }}>
    {[1,2,3,4,5].map(n => (
      <button key={n} onClick={() => onChange(n)} style={{
        background: "none", border: "none", cursor: "pointer",
        fontSize: size, lineHeight: 1,
        color: n <= value ? "#f5a623" : T.border,
        transition: "color 0.15s, transform 0.15s",
        transform: n <= value ? "scale(1.1)" : "scale(1)",
        padding: 2,
      }}>★</button>
    ))}
  </div>
);

const Timeline = ({ timestamps }) => {
  const steps = [
    { key: "createdAt",             label: "Created" },
    { key: "assignedAt",            label: "Assigned" },
    { key: "acceptedAt",            label: "Accepted" },
    { key: "travelStartedAt",       label: "On The Way" },
    { key: "reachedAt",             label: "Reached Site" },
    { key: "workStartedAt",         label: "Work Started" },
    { key: "technicianCompletedAt", label: "Tech Completed" },
    { key: "siClosedAt",            label: "SI Closed" },
    { key: "cancelledAt",           label: "Cancelled" },
  ];
  const active = steps.filter(s => timestamps[s.key]);
  return (
    <div style={{ paddingLeft: 4 }}>
      {active.map((s, i) => (
        <div key={s.key} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < active.length - 1 ? 14 : 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{
              width: 26, height: 26, borderRadius: "50%",
              background: T.green,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, zIndex: 1,
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            {i < active.length - 1 && (
              <div style={{ width: 2, flex: 1, minHeight: 14, background: T.greenDim, marginTop: 2 }} />
            )}
          </div>
          <div style={{ paddingBottom: i < active.length - 1 ? 12 : 0, flex: 1 }}>
            <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700 }}>{s.label}</div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{timestamps[s.key]}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ActionBtn = ({ label, color = T.green, onClick, loading: busy }) => (
  <button onClick={onClick} disabled={busy} style={{
    width: "100%", padding: "14px",
    borderRadius: 50, border: "none",
    background: busy ? T.border : color,
    color: T.white,
    fontFamily: font.display, fontSize: 15, fontWeight: 700,
    cursor: busy ? "not-allowed" : "pointer",
    boxShadow: busy ? "none" : `0 4px 16px ${color}50`,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    marginBottom: 10, transition: "all 0.2s",
  }}>
    {busy && <div style={{ width: 16, height: 16, border: "3px solid rgba(255,255,255,0.3)", borderTopColor: T.white, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />}
    {label}
  </button>
);

// ── Site details card (shared) ────────────────────────────────────────
const SiteCard = ({ work, hi, className }) => (
  <Card className={className} style={{ marginBottom: 14 }}>
    <div style={{ padding: "14px 16px" }}>
      <SectionLabel>SITE DETAILS</SectionLabel>
      <InfoRow label="CLIENT" value={work.siteClientName} />
      {work.clientMobile && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <a href={`tel:${work.clientMobile}`} style={{
            flex: 1, padding: "9px", borderRadius: 10,
            background: T.greenDim, color: T.green,
            border: `1px solid ${T.green}30`,
            fontFamily: font.display, fontSize: 13, fontWeight: 700,
            textDecoration: "none", textAlign: "center",
          }}>📞 {work.clientMobile}</a>
          <a href={`https://wa.me/91${work.clientMobile}`} target="_blank" rel="noreferrer" style={{
            flex: "none", padding: "9px 14px", borderRadius: 10,
            background: "#e6f9f0", color: "#1a7a3a",
            border: "1px solid #1a7a3a30",
            fontFamily: font.display, fontSize: 13, fontWeight: 700,
            textDecoration: "none", textAlign: "center",
          }}>💬 WA</a>
        </div>
      )}
      <Divider />
      <div style={{ marginTop: 12 }}>
        <InfoRow label="SITE ADDRESS" value={`📍 ${work.siteAddress}`} />
      </div>
      <Divider />
      <div style={{ marginTop: 12 }}>
        <InfoRow label="WORK TYPE" value={work.workType} />
      </div>
      {work.description && <>
        <Divider />
        <div style={{ marginTop: 12 }}>
          <InfoRow label="DESCRIPTION" value={work.description} valueStyle={{ color: T.muted, fontSize: 13 }} />
        </div>
      </>}
      <Divider />
      <div style={{ marginTop: 12, display: "flex", gap: 20, flexWrap: "wrap" }}>
        <div>
          <SectionLabel>CHARGE</SectionLabel>
          <div style={{ fontFamily: font.mono, fontSize: 16, fontWeight: 700, color: T.green }}>₹{work.agreedCharge}</div>
          <div style={{ fontSize: 11, color: T.muted }}>{work.paymentMode} · {work.paymentBy}</div>
        </div>
        <div>
          <SectionLabel>MATERIAL</SectionLabel>
          <div style={{ fontSize: 14 }}>{work.materialIncluded === "YES" ? "✅ Included" : work.materialIncluded === "NO" ? "❌ Not included" : "❓ Not sure"}</div>
        </div>
        {work.preferredTime && (
          <div>
            <SectionLabel>VISIT TIME</SectionLabel>
            <div style={{ fontSize: 13 }}>⏰ {work.preferredTime}</div>
          </div>
        )}
      </div>
    </div>
  </Card>
);

// ── VIEW: SI — ACTIVE ─────────────────────────────────────────────────
const SIActiveView = ({ work, lang, onAction }) => {
  const hi = lang === "hi";
  const st = STATUS_CFG[work.status] || {};
  const [acting, setActing] = useState(false);

  const handleCancel = async () => {
    if (!confirm(hi ? "यह Site Work cancel करें?" : "Cancel this site work?")) return;
    setActing(true);
    try {
      await api.post(`/site-work/${work.id}/cancel`);
      onAction();
    } catch (e) { alert(e?.message || "Failed"); }
    setActing(false);
  };

  return (
    <div>
      <div style={{
        background: T.skyDim, padding: "14px 16px",
        borderBottom: `1px solid ${T.sky}30`,
        display: "flex", alignItems: "center", gap: 10,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.sky, animation: "pulse 1.8s ease-in-out infinite", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, color: T.sky }}>{hi ? st.hi : st.en}</div>
          <div style={{ fontSize: 12, color: T.muted }}>{hi ? `${work.techName} को notify किया जा चुका है` : `${work.techName} has been notified`}</div>
        </div>
        <Tag label={hi ? st.hi : st.en} color={st.color} />
      </div>

      <div style={{ padding: "16px" }}>
        <Card className="fade-up" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>TECHNICIAN</SectionLabel>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: "50%", flexShrink: 0,
                background: `linear-gradient(135deg, ${T.saffron}, #c45a08)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.display, fontSize: 20, fontWeight: 800, color: T.white,
              }}>{work.techName[0]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700 }}>{work.techName}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href={`tel:${work.techMobile}`} style={{
                flex: 1, padding: "10px", borderRadius: 10,
                background: T.greenDim, color: T.green,
                border: `1px solid ${T.green}30`,
                fontFamily: font.display, fontSize: 13, fontWeight: 700,
                textDecoration: "none", textAlign: "center",
              }}>📞 Call</a>
              <a href={`https://wa.me/91${work.techMobile}`} target="_blank" rel="noreferrer" style={{
                flex: 1, padding: "10px", borderRadius: 10,
                background: "#e6f9f0", color: "#1a7a3a",
                border: "1px solid #1a7a3a30",
                fontFamily: font.display, fontSize: 13, fontWeight: 700,
                textDecoration: "none", textAlign: "center",
              }}>💬 WhatsApp</a>
            </div>
          </div>
        </Card>

        <SiteCard work={work} hi={hi} className="fade-up-1" />

        <Card className="fade-up-2" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>TIMELINE</SectionLabel>
            <Timeline timestamps={work.timestamps} />
          </div>
        </Card>

        {work.clientMobile && (
          <Card className="fade-up-3" style={{ marginBottom: 14, background: "#e6f9f0", border: "1px solid #1a7a3a30" }}>
            <div style={{ padding: "14px 16px" }}>
              <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, marginBottom: 6 }}>
                📤 {hi ? "Technician Contact Client को भेजें" : "Send Technician Contact to Client"}
              </div>
              <a href={`https://wa.me/91${work.clientMobile}?text=${encodeURIComponent(`Hello ${work.siteClientName}, our technician ${work.techName} (${work.techMobile}) is on the way to your site.`)}`}
                target="_blank" rel="noreferrer"
                style={{
                  display: "block", width: "100%", padding: "11px",
                  borderRadius: 50, background: "#25D366", color: T.white,
                  fontFamily: font.display, fontSize: 14, fontWeight: 700,
                  textDecoration: "none", textAlign: "center",
                }}>
                💬 {hi ? "WhatsApp पर भेजें" : "Send on WhatsApp"}
              </a>
            </div>
          </Card>
        )}

        <ActionBtn label={acting ? "Cancelling…" : (hi ? "Site Work Cancel करें" : "Cancel Site Work")} color={T.error} onClick={handleCancel} loading={acting} />
      </div>
    </div>
  );
};

// ── VIEW: SI — REVIEW & CLOSE ─────────────────────────────────────────
const SIReviewClose = ({ work, lang, onClosed }) => {
  const hi = lang === "hi";
  const [stars, setStars]               = useState(0);
  const [reachedOnTime, setReachedOnTime] = useState(null);
  const [skillMatch, setSkillMatch]       = useState(null);
  const [workCompleted, setWorkCompleted] = useState(null);
  const [behaviourGood, setBehaviourGood] = useState(null);
  const [comment, setComment]             = useState("");
  const [photoViewed, setPhotoViewed]     = useState(false);
  const [closing, setClosing]             = useState(false);
  const [closeErr, setCloseErr]           = useState("");

  const canClose = stars > 0 && photoViewed;

  const handleClose = async () => {
    setClosing(true); setCloseErr("");
    try {
      await api.post(`/site-work/${work.id}/close`, {
        stars, reachedOnTime, skillMatch, workCompleted, behaviourGood, comment,
      });
      onClosed();
    } catch (e) { setCloseErr(e?.message || "Failed"); setClosing(false); }
  };

  const BoolToggle = ({ label, value, onChange }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
      <span style={{ fontSize: 14, color: T.ink }}>{label}</span>
      <div style={{ display: "flex", gap: 6 }}>
        {[
          { v: true,  l: hi ? "हाँ" : "Yes", color: T.green, bg: T.greenDim },
          { v: false, l: hi ? "नहीं" : "No", color: T.error, bg: T.errorDim },
        ].map(o => (
          <button key={String(o.v)} onClick={() => onChange(o.v)} style={{
            padding: "5px 14px", borderRadius: 20,
            border: `2px solid ${value === o.v ? o.color : T.border}`,
            background: value === o.v ? o.bg : T.white,
            color: value === o.v ? o.color : T.muted,
            fontFamily: font.mono, fontSize: 11, fontWeight: 700,
            cursor: "pointer", transition: "all 0.18s",
          }}>{o.l}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div style={{
        background: T.saffronDim, padding: "14px 16px",
        borderBottom: `1px solid ${T.saffron}40`,
        display: "flex", gap: 10, alignItems: "flex-start",
      }}>
        <span style={{ fontSize: 22, flexShrink: 0 }}>🔔</span>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, color: T.saffron, marginBottom: 3 }}>
            {hi ? "Technician ने काम पूरा किया — Review करें" : "Technician marked work complete — Review now"}
          </div>
          <div style={{ fontSize: 12, color: T.muted }}>
            {work.timestamps.technicianCompletedAt}
          </div>
        </div>
      </div>

      <div style={{ padding: "16px" }}>
        {/* Proof photo */}
        <Card className="fade-up" style={{ marginBottom: 14, border: `2px solid ${photoViewed ? T.green : T.saffron}` }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>PROOF PHOTO</SectionLabel>
            {!photoViewed ? (
              <>
                <div style={{
                  height: 160, borderRadius: 12, marginBottom: 10,
                  background: "linear-gradient(135deg, #ddd 0%, #ccc 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  position: "relative", overflow: "hidden",
                }}>
                  <div style={{
                    position: "absolute", inset: 0,
                    backdropFilter: "blur(12px)",
                    background: "rgba(245,240,232,0.6)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                    <span style={{ fontSize: 36 }}>📷</span>
                    <div style={{ fontFamily: font.mono, fontSize: 11, color: T.muted, fontWeight: 700 }}>
                      TAP TO VIEW PROOF PHOTO
                    </div>
                  </div>
                </div>
                <button onClick={() => setPhotoViewed(true)} style={{
                  width: "100%", padding: "12px", borderRadius: 50, border: "none",
                  background: T.saffron, color: T.white,
                  fontFamily: font.display, fontSize: 14, fontWeight: 700, cursor: "pointer",
                  boxShadow: `0 4px 16px ${T.saffron}40`,
                }}>
                  📷 {hi ? "Proof Photo देखें" : "View Proof Photo"}
                </button>
              </>
            ) : work.proofPhotoUrl ? (
              <>
                <img src={work.proofPhotoUrl} alt="Proof" style={{ width: "100%", borderRadius: 12, marginBottom: 10, display: "block" }} />
                <div style={{ background: T.greenDim, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: T.green, lineHeight: 1.55 }}>
                  {hi ? "ℹ️ यह photo close करने पर server से delete हो जाएगी।" : "ℹ️ This photo will be deleted from server after you close this work."}
                </div>
              </>
            ) : (
              <div style={{ padding: "20px", textAlign: "center", color: T.muted, fontSize: 13 }}>
                {hi ? "Photo अभी उपलब्ध नहीं" : "Photo not available"}
              </div>
            )}
          </div>
        </Card>

        {/* Summary */}
        <Card className="fade-up-1" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>WORK SUMMARY</SectionLabel>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                background: `linear-gradient(135deg, ${T.saffron}, #c45a08)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: font.display, fontSize: 17, fontWeight: 800, color: T.white, flexShrink: 0,
              }}>{work.techName[0]}</div>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700 }}>{work.techName}</div>
                <div style={{ fontSize: 12, color: T.muted }}>{work.workType} · {work.siteClientName}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              <div>
                <SectionLabel>CHARGE</SectionLabel>
                <div style={{ fontFamily: font.mono, fontSize: 16, fontWeight: 700, color: T.green }}>₹{work.agreedCharge}</div>
              </div>
              <div>
                <SectionLabel>DURATION</SectionLabel>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{work.timestamps.workStartedAt} → {work.timestamps.technicianCompletedAt}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Rating */}
        <Card className="fade-up-2" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>{hi ? "TECHNICIAN को RATE करें (जरूरी)" : "RATE THE TECHNICIAN (REQUIRED)"}</SectionLabel>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: T.muted, marginBottom: 10 }}>Overall Rating</div>
              <StarPicker value={stars} onChange={setStars} size={36} />
              {stars > 0 && (
                <div style={{ marginTop: 8, fontFamily: font.mono, fontSize: 12, color: T.saffron, fontWeight: 700 }}>
                  {["","⭐ Poor","⭐⭐ Fair","⭐⭐⭐ Good","⭐⭐⭐⭐ Very Good","⭐⭐⭐⭐⭐ Excellent"][stars]}
                </div>
              )}
            </div>
            <Divider />
            <div style={{ marginTop: 14 }}>
              <BoolToggle label={hi ? "समय पर पहुंचा?" : "Reached on time?"} value={reachedOnTime} onChange={setReachedOnTime} />
              <BoolToggle label={hi ? "Skill सही था?" : "Skill matched?"} value={skillMatch} onChange={setSkillMatch} />
              <BoolToggle label={hi ? "काम पूरा हुआ?" : "Work fully completed?"} value={workCompleted} onChange={setWorkCompleted} />
              <BoolToggle label={hi ? "Behaviour अच्छा था?" : "Behaviour was good?"} value={behaviourGood} onChange={setBehaviourGood} />
            </div>
            <div style={{ marginTop: 4 }}>
              <SectionLabel>COMMENT (OPTIONAL)</SectionLabel>
              <textarea value={comment} onChange={e => setComment(e.target.value)}
                placeholder="Additional comments…" rows={2}
                style={{ width: "100%", padding: "11px 14px", border: `2px solid ${comment ? T.sky : T.border}`, borderRadius: 10, outline: "none", fontFamily: font.body, fontSize: 13, color: T.ink, background: T.white, resize: "none", lineHeight: 1.5 }} />
            </div>
          </div>
        </Card>

        <div className="fade-up-3" style={{ background: T.warnDim, borderRadius: 12, padding: "12px 14px", marginBottom: 16, border: `1px solid ${T.warn}40`, fontSize: 13, color: T.warn, lineHeight: 1.6 }}>
          💰 {hi
            ? `Payment directly ${work.paymentBy} द्वारा technician को — ₹${work.agreedCharge} (${work.paymentMode}).`
            : `Payment directly by ${work.paymentBy} to technician — ₹${work.agreedCharge} (${work.paymentMode}).`}
        </div>

        {closeErr && <div style={{ background: T.errorDim, borderRadius: 10, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: T.error }}>{closeErr}</div>}

        <ActionBtn
          label={closing ? (hi ? "Closing…" : "Closing…") : (hi ? "✓ Site Work Close करें" : "✓ Close Site Work")}
          color={canClose ? T.green : T.border}
          onClick={canClose ? handleClose : undefined}
          loading={closing}
        />

        {!canClose && (
          <p style={{ textAlign: "center", fontSize: 12, color: T.muted, fontFamily: font.mono, marginBottom: 8 }}>
            {hi ? "Photo देखें और rating दें — then close करें" : "View proof photo and give rating to close"}
          </p>
        )}
      </div>
    </div>
  );
};

// ── VIEW: CLOSED ──────────────────────────────────────────────────────
const ClosedView = ({ work, lang }) => {
  const hi = lang === "hi";
  const r = work.ratingGiven;
  return (
    <div>
      <div style={{ background: T.greenDim, padding: "14px 16px", borderBottom: `1px solid ${T.green}30`, display: "flex", gap: 10, alignItems: "center" }}>
        <span style={{ fontSize: 22 }}>✅</span>
        <div>
          <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, color: T.green }}>Site Work Closed</div>
          <div style={{ fontSize: 12, color: T.muted }}>{work.timestamps.siClosedAt}</div>
        </div>
        <div style={{ marginLeft: "auto" }}><Tag label="CLOSED" color="green" /></div>
      </div>
      <div style={{ padding: "16px" }}>
        {r && (
          <Card className="fade-up" style={{ marginBottom: 14 }}>
            <div style={{ padding: "14px 16px" }}>
              <SectionLabel>RATING GIVEN</SectionLabel>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {[1,2,3,4,5].map(n => <span key={n} style={{ fontSize: 28, color: n <= r.stars ? "#f5a623" : T.border }}>★</span>)}
              </div>
              <div style={{ fontFamily: font.mono, fontSize: 12, color: T.saffron, fontWeight: 700, marginBottom: 10 }}>
                {["","POOR","FAIR","GOOD","VERY GOOD","EXCELLENT"][r.stars]}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {[
                  { v: r.reachedOnTime, l: "On-time" },
                  { v: r.skillMatch,    l: "Skill Match" },
                  { v: r.workCompleted, l: "Work Done" },
                  { v: r.behaviourGood, l: "Behaviour" },
                ].map(b => (
                  <span key={b.l} style={{ padding: "4px 12px", borderRadius: 20, background: b.v ? T.greenDim : T.errorDim, color: b.v ? T.green : T.error, fontFamily: font.mono, fontSize: 10, fontWeight: 700 }}>
                    {b.v ? "✓" : "✗"} {b.l}
                  </span>
                ))}
              </div>
              {r.comment && <div style={{ marginTop: 10, fontSize: 13, color: T.muted, fontStyle: "italic" }}>"{r.comment}"</div>}
            </div>
          </Card>
        )}
        <Card className="fade-up-1" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>WORK DETAILS</SectionLabel>
            <InfoRow label="TECHNICIAN" value={work.techName} />
            <Divider /><div style={{ marginTop: 12 }}><InfoRow label="CLIENT" value={work.siteClientName} /></div>
            <Divider /><div style={{ marginTop: 12 }}><InfoRow label="WORK TYPE" value={work.workType} /></div>
            <Divider />
            <div style={{ marginTop: 12, display: "flex", gap: 24 }}>
              <div><SectionLabel>CHARGE</SectionLabel><div style={{ fontFamily: font.mono, fontSize: 16, fontWeight: 700, color: T.green }}>₹{work.agreedCharge}</div></div>
              <div><SectionLabel>PAYMENT</SectionLabel><div style={{ fontSize: 13 }}>{work.paymentMode} · {work.paymentBy}</div></div>
            </div>
          </div>
        </Card>
        <div className="fade-up-2" style={{ background: T.paper, borderRadius: 12, padding: "12px 14px", marginBottom: 14, border: `1px solid ${T.border}`, fontSize: 12, color: T.muted, lineHeight: 1.6, display: "flex", gap: 8 }}>
          <span style={{ fontSize: 16 }}>🗑️</span>
          <span>{hi ? "Proof photo server से delete हो गई।" : "Proof photo deleted from server. Only metadata retained."}</span>
        </div>
        <Card className="fade-up-3" style={{ marginBottom: 24 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>FULL TIMELINE</SectionLabel>
            <Timeline timestamps={work.timestamps} />
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── VIEW: TECH — PENDING ACCEPTANCE ──────────────────────────────────
const TechPendingView = ({ work, lang, onAction }) => {
  const hi = lang === "hi";
  const [confirmed, setConfirmed] = useState(false);
  const [acting, setActing] = useState(null);
  const [done, setDone] = useState(null);

  const doAccept = async () => {
    if (!confirmed) return;
    setActing("accept");
    try { await api.post(`/site-work/${work.id}/accept`); setDone("accepted"); }
    catch (e) { alert(e?.message || "Failed"); setActing(null); }
  };
  const doReject = async () => {
    setActing("reject");
    try { await api.post(`/site-work/${work.id}/reject`); setDone("rejected"); }
    catch (e) { alert(e?.message || "Failed"); setActing(null); }
  };

  if (done === "accepted") return (
    <div style={{ padding: "40px 24px", textAlign: "center" }}>
      <div className="pop-in" style={{ width: 80, height: 80, borderRadius: "50%", background: T.greenDim, border: `3px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>✅</div>
      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{hi ? "काम Accept कर लिया!" : "Work Accepted!"}</h2>
      <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 20 }}>{hi ? `${work.siName} को notify कर दिया गया।` : `${work.siName} has been notified.`}</p>
      <div style={{ background: T.saffronDim, borderRadius: 12, padding: "12px 14px", marginBottom: 20, fontSize: 13, color: "#7a4a1a", lineHeight: 1.6, textAlign: "left" }}>
        📍 {work.siteAddress}
      </div>
      <a href={`https://maps.google.com/?q=${encodeURIComponent(work.siteAddress)}`} target="_blank" rel="noreferrer"
        style={{ display: "block", width: "100%", padding: "13px", borderRadius: 50, background: T.sky, color: T.white, fontFamily: font.display, fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center" }}>
        🗺️ {hi ? "Google Maps में खोलें" : "Open in Google Maps"}
      </a>
    </div>
  );

  if (done === "rejected") return (
    <div style={{ padding: "40px 24px", textAlign: "center" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: T.errorDim, border: `3px solid ${T.error}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 36 }}>✕</div>
      <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{hi ? "काम Reject कर दिया" : "Work Rejected"}</h2>
      <p style={{ fontSize: 14, color: T.muted }}>{hi ? `${work.siName} को notify कर दिया गया।` : `${work.siName} has been notified.`}</p>
    </div>
  );

  return (
    <div>
      <div style={{ background: T.saffronDim, padding: "14px 16px", borderBottom: `1px solid ${T.saffron}40`, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.saffron, animation: "pulse 1.4s ease-in-out infinite", flexShrink: 0 }} />
        <div>
          <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, color: T.saffron }}>{hi ? "नया Site Work Request!" : "New Site Work Request!"}</div>
          <div style={{ fontSize: 12, color: T.muted }}>{work.siName} · {work.timestamps.assignedAt}</div>
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <Card className="fade-up" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>SI / CONTRACTOR</SectionLabel>
            <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{work.siName}</div>
            <div style={{ background: T.saffronDim, borderRadius: 10, padding: "10px 12px", fontSize: 12, color: "#7a4a1a", lineHeight: 1.6 }}>
              💡 {hi ? "Accept करने से पहले SI से call/WhatsApp करके work scope confirm करें।" : "Before accepting, confirm work scope with SI."}
            </div>
          </div>
        </Card>

        <Card className="fade-up-1" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>WORK DETAILS</SectionLabel>
            {[
              { l: "CLIENT",       v: work.siteClientName },
              { l: "WORK TYPE",    v: work.workType },
              { l: "SITE ADDRESS", v: `📍 ${work.siteAddress}` },
              { l: "DESCRIPTION",  v: work.description },
              { l: "VISIT TIME",   v: `⏰ ${work.preferredTime}` },
              { l: "CHARGE",       v: `₹${work.agreedCharge} · ${work.paymentMode} · By ${work.paymentBy}` },
              { l: "MATERIAL",     v: work.materialIncluded === "YES" ? "✅ Included" : "❌ Not included" },
            ].filter(r => r.v && r.v !== '⏰ undefined').map((r, i) => (
              <div key={r.l}>
                {i > 0 && <Divider />}
                <div style={{ marginTop: i > 0 ? 12 : 0, marginBottom: 12 }}>
                  <InfoRow label={r.l} value={r.v} valueStyle={r.l === "DESCRIPTION" ? { color: T.muted, fontSize: 13 } : {}} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Client contact revealed only after accepting — not shown on pending request */}

        <button onClick={() => setConfirmed(!confirmed)} style={{
          width: "100%", padding: "14px 16px", borderRadius: 12,
          border: `2px solid ${confirmed ? T.green : T.border}`,
          background: confirmed ? T.greenDim : T.white,
          display: "flex", alignItems: "flex-start", gap: 12,
          cursor: "pointer", marginBottom: 16, textAlign: "left", transition: "all 0.2s",
        }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1, border: `2px solid ${confirmed ? T.green : T.border}`, background: confirmed ? T.green : T.white, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
            {confirmed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
          </div>
          <span style={{ fontSize: 13, color: T.ink, lineHeight: 1.6, fontFamily: font.body }}>
            {hi ? "मैं यह Site Work accept करता/करती हूँ। Payment directly SI/Client से मिलेगी।" : "I accept this Site Work. Payment will be received directly from SI/Client."}
          </span>
        </button>

        <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <ActionBtn label={acting === "accept" ? "Accepting…" : (hi ? "✓ काम स्वीकार करें" : "✓ Accept Work")} color={confirmed ? T.green : T.border} onClick={doAccept} loading={acting === "accept"} />
          <button onClick={doReject} disabled={!!acting} style={{ flex: 1, padding: "15px", borderRadius: 50, border: `1px solid ${T.border}`, background: T.white, color: T.error, fontFamily: font.display, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
            {acting === "reject" ? "…" : (hi ? "✕ अस्वीकार" : "✕ Reject")}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── VIEW: TECH — ACTIVE WORK ──────────────────────────────────────────
const TechActiveView = ({ work, lang, onAction }) => {
  const hi = lang === "hi";
  const [acting, setActing] = useState(false);

  const NEXT = {
    ACCEPTED:     { label: hi ? "🚗 निकल रहा/रही हूँ" : "🚗 Starting Travel", endpoint: "start-travel" },
    ON_THE_WAY:   { label: hi ? "📍 Site पर पहुंच गया/गई" : "📍 I've Reached Site", endpoint: "reached" },
    REACHED:      { label: hi ? "🔧 काम शुरू करें" : "🔧 Start Work", endpoint: "start-work" },
    WORK_STARTED: { label: hi ? "✅ काम पूरा हो गया" : "✅ Mark Work Complete", endpoint: "complete" },
  };
  const next = NEXT[work.status];

  const handleNext = async () => {
    if (!next) return;
    setActing(true);
    try {
      await api.post(`/site-work/${work.id}/${next.endpoint}`);
      onAction();
    } catch (e) { alert(e?.message || "Failed"); setActing(false); }
  };

  const st = STATUS_CFG[work.status] || {};

  return (
    <div>
      <div style={{ background: T.saffronDim, padding: "14px 16px", borderBottom: `1px solid ${T.saffron}40`, display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: T.saffron, animation: "pulse 1.6s ease-in-out infinite", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, color: T.saffron }}>{hi ? st.hi : st.en}</div>
          <div style={{ fontSize: 12, color: T.muted }}>{work.siteClientName} · {work.siteAddress.split(",")[0]}</div>
        </div>
        <Tag label={hi ? st.hi : st.en} color={st.color} />
      </div>
      <div style={{ padding: "16px" }}>
        {next && (
          <div className="fade-up" style={{ marginBottom: 16 }}>
            <ActionBtn label={acting ? "Updating…" : next.label} color={T.saffron} onClick={handleNext} loading={acting} />
          </div>
        )}

        <SiteCard work={work} hi={hi} className="fade-up-1" />

        <Card className="fade-up-2" style={{ marginBottom: 14 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>SI / CONTRACTOR</SectionLabel>
            <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700 }}>{work.siName}</div>
          </div>
        </Card>

        <a href={`https://maps.google.com/?q=${encodeURIComponent(work.siteAddress)}`} target="_blank" rel="noreferrer"
          style={{ display: "block", width: "100%", padding: "13px", borderRadius: 50, background: T.sky, color: T.white, fontFamily: font.display, fontSize: 15, fontWeight: 700, textDecoration: "none", textAlign: "center", marginBottom: 14 }}>
          🗺️ {hi ? "Google Maps में खोलें" : "Open in Google Maps"}
        </a>

        <Card className="fade-up-3" style={{ marginBottom: 24 }}>
          <div style={{ padding: "14px 16px" }}>
            <SectionLabel>TIMELINE</SectionLabel>
            <Timeline timestamps={work.timestamps} />
          </div>
        </Card>
      </div>
    </div>
  );
};

// ── CLOSED SUCCESS ANIMATION ──────────────────────────────────────────
const ClosedSuccess = ({ work, lang, onDone }) => {
  const hi = lang === "hi";
  const confettiColors = [T.saffron, T.green, T.sky, "#f5a623", T.greenLight];
  return (
    <div style={{ padding: "40px 24px", textAlign: "center", position: "relative", overflow: "hidden" }}>
      {[...Array(12)].map((_, i) => (
        <div key={i} style={{ position: "absolute", left: `${10 + (i * 7.5)}%`, top: `${10 + (i % 3) * 8}%`, width: 8, height: 8, borderRadius: i % 2 === 0 ? "50%" : 2, background: confettiColors[i % confettiColors.length], animation: `confetti ${1 + (i * 0.15)}s ${i * 0.1}s ease-out both` }} />
      ))}
      <div className="pop-in" style={{ width: 90, height: 90, borderRadius: "50%", background: T.greenDim, border: `4px solid ${T.green}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 42 }}>🎉</div>
      <h2 style={{ fontFamily: font.display, fontSize: 26, fontWeight: 800, marginBottom: 8 }}>{hi ? "Site Work बंद हो गया!" : "Site Work Closed!"}</h2>
      <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 8 }}>{hi ? `${work.techName} का trust score update हो गया।` : `${work.techName}'s trust score has been updated.`}</p>
      <p style={{ fontSize: 12, color: T.muted, marginBottom: 28, fontFamily: font.mono }}>PROOF PHOTO DELETED FROM SERVER ✓</p>
      <button onClick={onDone} style={{ width: "100%", padding: "15px", borderRadius: 50, border: "none", background: T.sky, color: T.white, fontFamily: font.display, fontSize: 16, fontWeight: 700, cursor: "pointer", boxShadow: `0 4px 20px ${T.sky}50` }}>
        {hi ? "My Works पर जाएं" : "Go to My Works"}
      </button>
    </div>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────
export default function SiteWorkDetail() {
  const { id }       = useParams();
  const navigate     = useNavigate();
  const { user }     = useAuth();
  const [lang, setLang]   = useState(localStorage.getItem('sm_lang') || 'hi');
  const [work, setWork]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [closed, setClosed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const r = await api.get(`/site-work/${id}`);
      setWork(normalize(r.data));
    } catch (e) {
      setError(e?.message || 'Failed to load');
    } finally { setLoading(false); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const perspective = work && user
    ? (user._id === work.siId ? 'SI' : 'TECH')
    : null;

  const hi = lang === "hi";
  const st = work ? (STATUS_CFG[closed ? "CLOSED" : work.status] || {}) : {};

  const renderBody = () => {
    if (loading) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 24px", flexDirection: "column", gap: 16 }}>
        <div style={{ width: 32, height: 32, border: `3px solid ${T.saffron}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: T.muted, fontSize: 14 }}>{hi ? "Loading…" : "Loading…"}</div>
      </div>
    );
    if (error) return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontFamily: font.display, fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{hi ? "Load नहीं हो सका" : "Could not load"}</div>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>{error}</div>
        <button onClick={load} style={{ padding: "12px 28px", borderRadius: 50, border: "none", background: T.saffron, color: T.white, fontFamily: font.display, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Retry</button>
      </div>
    );
    if (!work) return null;
    if (closed) return <ClosedSuccess work={work} lang={lang} onDone={() => navigate(user?.roles?.includes('SI') ? '/si' : '/tech')} />;

    // Cancelled states
    if (work.status === "CANCELLED_BY_SI" || work.status === "CANCELLED_BY_TECH") return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>❌</div>
        <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{hi ? "Cancelled" : "Cancelled"}</div>
        <div style={{ fontSize: 13, color: T.muted }}>{work.status === "CANCELLED_BY_SI" ? (hi ? "SI ने cancel किया" : "Cancelled by SI") : (hi ? "Technician ने cancel किया" : "Cancelled by Technician")}</div>
        {work.timestamps.cancelledAt && <div style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>{work.timestamps.cancelledAt}</div>}
      </div>
    );

    if (work.status === "CLOSED") return <ClosedView work={work} lang={lang} />;

    if (perspective === "SI") {
      if (work.status === "COMPLETED") return <SIReviewClose work={work} lang={lang} onClosed={() => setClosed(true)} />;
      return <SIActiveView work={work} lang={lang} onAction={load} />;
    }

    if (perspective === "TECH") {
      if (work.status === "PENDING_ACCEPTANCE") return <TechPendingView work={work} lang={lang} onAction={load} />;
      return <TechActiveView work={work} lang={lang} onAction={load} />;
    }

    return null;
  };

  return (
    <>
      <Fonts />
      <div style={{ minHeight: "100vh", background: T.paper, display: "flex", flexDirection: "column", alignItems: "center" }}>
        {/* Top bar */}
        <div style={{ width: "100%", maxWidth: 420, background: T.paper, borderBottom: `1px solid ${T.border}`, position: "sticky", top: 0, zIndex: 40 }}>
          <div style={{ padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontFamily: font.body, fontSize: 14, color: T.muted }}>
              ← {hi ? "वापस" : "Back"}
            </button>
            <div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.08em" }}>SITE WORK DETAIL</div>
            <div style={{ display: "flex", gap: 2, background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: 3 }}>
              {["hi","en"].map(l => (
                <button key={l} onClick={() => setLang(l)} style={{ padding: "3px 10px", borderRadius: 14, border: "none", background: lang === l ? T.saffron : "transparent", color: lang === l ? T.white : T.muted, fontFamily: font.mono, fontSize: 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                  {l === "hi" ? "हि" : "EN"}
                </button>
              ))}
            </div>
          </div>

          {!closed && work && !loading && !error && (
            <div style={{ padding: "0 16px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontFamily: font.display, fontSize: 18, fontWeight: 800, lineHeight: 1.25, marginBottom: 4 }}>{work.workType}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>{work.siteClientName} · {work.siteAddress?.split(",")[0]}</div>
                </div>
                <Tag label={hi ? st.hi : st.en} color={st.color} />
              </div>
              <div style={{ fontFamily: font.mono, fontSize: 11, color: T.muted, marginTop: 6 }}>
                #{work.id?.slice(-8)} · {perspective}
              </div>
            </div>
          )}
        </div>

        <div style={{ width: "100%", maxWidth: 420, flex: 1 }}>
          {renderBody()}
        </div>
      </div>
    </>
  );
}
