import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  ink: "#0f0e0c",
  paper: "#f5f0e8",
  saffron: "#e8630a",
  saffronLight: "#ff8c3a",
  saffronDim: "#fde8d4",
  green: "#1a7a4a",
  greenLight: "#22a060",
  greenDim: "#d4f0e2",
  sky: "#1a5fa8",
  skyDim: "#daeaf8",
  border: "#e0d8cc",
  muted: "#6b6258",
  white: "#ffffff",
  error: "#c0392b",
  errorDim: "#fdecea",
};

const font = {
  display: "'Baloo 2', sans-serif",
  body: "'Noto Sans Devanagari', sans-serif",
  mono: "'Space Mono', monospace",
};

// ─── GOOGLE FONT LOADER ───────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: ${T.paper}; font-family: ${font.body}; color: ${T.ink}; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes pulse {
      0%,100% { opacity:1; transform:scale(1); }
      50%      { opacity:0.4; transform:scale(0.7); }
    }
    @keyframes checkPop {
      0%   { transform: scale(0); }
      70%  { transform: scale(1.25); }
      100% { transform: scale(1); }
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .fade-up { animation: fadeUp 0.38s ease both; }
    .fade-up-1 { animation: fadeUp 0.38s 0.06s ease both; }
    .fade-up-2 { animation: fadeUp 0.38s 0.12s ease both; }
    .fade-up-3 { animation: fadeUp 0.38s 0.18s ease both; }
    .fade-up-4 { animation: fadeUp 0.38s 0.24s ease both; }
    .fade-up-5 { animation: fadeUp 0.38s 0.30s ease both; }
  `}</style>
);

// ─── SHARED COMPONENTS ────────────────────────────────────────────

const StepDots = ({ total, current }) => (
  <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 28 }}>
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} style={{
        width: i === current ? 22 : 7,
        height: 7,
        borderRadius: 4,
        background: i === current ? T.saffron : i < current ? T.green : T.border,
        transition: "all 0.3s",
      }} />
    ))}
  </div>
);

const Btn = ({ children, onClick, variant = "primary", disabled, style }) => {
  const base = {
    width: "100%", padding: "15px 20px",
    borderRadius: 50, border: "none",
    fontFamily: font.display, fontSize: 16, fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.18s", display: "flex",
    alignItems: "center", justifyContent: "center", gap: 10,
    opacity: disabled ? 0.5 : 1,
    ...style,
  };
  const variants = {
    primary: { background: T.saffron, color: T.white, boxShadow: "0 4px 20px rgba(232,99,10,0.35)" },
    outline: { background: T.white, color: T.ink, border: `2px solid ${T.border}` },
    ghost:   { background: "transparent", color: T.muted, fontSize: 14 },
    green:   { background: T.green, color: T.white, boxShadow: "0 4px 20px rgba(26,122,74,0.3)" },
  };
  return (
    <button style={{ ...base, ...variants[variant] }} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

const Chip = ({ label, emoji, selected, onClick, color = "saffron" }) => {
  const colors = {
    saffron: { bg: T.saffronDim, border: T.saffron, text: T.saffron },
    sky:     { bg: T.skyDim,     border: T.sky,     text: T.sky },
    green:   { bg: T.greenDim,   border: T.green,   text: T.green },
    ink:     { bg: "#e8e4dc",    border: T.ink,     text: T.ink },
  };
  const c = colors[color];
  return (
    <button onClick={onClick} style={{
      display: "inline-flex", alignItems: "center", gap: 7,
      padding: "9px 16px", borderRadius: 50,
      border: `2px solid ${selected ? c.border : T.border}`,
      background: selected ? c.bg : T.white,
      color: selected ? c.text : T.muted,
      fontFamily: font.body, fontSize: 14, fontWeight: selected ? 700 : 400,
      cursor: "pointer", transition: "all 0.18s",
      boxShadow: selected ? `0 2px 12px ${c.border}30` : "none",
    }}>
      {emoji && <span style={{ fontSize: 16 }}>{emoji}</span>}
      {label}
      {selected && <span style={{ fontSize: 12, animation: "checkPop 0.3s ease" }}>✓</span>}
    </button>
  );
};

const Card = ({ children, style }) => (
  <div style={{
    background: T.white, borderRadius: 20,
    padding: "24px 20px", border: `1px solid ${T.border}`,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
    ...style,
  }}>{children}</div>
);

const Label = ({ children }) => (
  <div style={{
    fontFamily: font.mono, fontSize: 11, fontWeight: 700,
    letterSpacing: "0.1em", textTransform: "uppercase",
    color: T.muted, marginBottom: 10,
  }}>{children}</div>
);

const ProfileStrengthBar = ({ pct }) => (
  <div style={{ marginTop: 4 }}>
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontFamily: font.mono, fontSize: 11, color: T.muted }}>PROFILE STRENGTH</span>
      <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: pct >= 80 ? T.green : T.saffron }}>{pct}%</span>
    </div>
    <div style={{ height: 6, background: T.border, borderRadius: 3, overflow: "hidden" }}>
      <div style={{
        height: "100%", borderRadius: 3,
        width: `${pct}%`,
        background: pct >= 80 ? T.green : T.saffron,
        transition: "width 0.6s ease",
      }} />
    </div>
  </div>
);

// ─── STEP 1: GOOGLE LOGIN ──────────────────────────────────────────
const StepLogin = ({ onNext, lang }) => {
  const hi = lang === "hi";
  const { loginWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0 0" }}>
      {/* Logo area */}
      <div className="fade-up" style={{
        width: 72, height: 72, borderRadius: 20,
        background: T.ink, display: "flex", alignItems: "center", justifyContent: "center",
        marginBottom: 20,
        boxShadow: `0 8px 32px rgba(0,0,0,0.2)`,
      }}>
        <span style={{ fontSize: 32 }}>📡</span>
      </div>

      <h1 className="fade-up-1" style={{
        fontFamily: font.display, fontSize: 26, fontWeight: 800,
        textAlign: "center", lineHeight: 1.25, marginBottom: 10,
      }}>
        {hi ? <>Site Work <span style={{ color: T.saffron }}>Network</span></> : <>Site Work <span style={{ color: T.saffron }}>Network</span></>}
      </h1>

      <p className="fade-up-2" style={{
        fontSize: 14, color: T.muted, textAlign: "center",
        lineHeight: 1.65, marginBottom: 32, maxWidth: 280,
      }}>
        {hi
          ? "Client site के पास available CCTV technician तुरंत खोजें — बिल्कुल मुफ्त"
          : "Find nearby available CCTV technicians for your client site — completely free"}
      </p>

      <div className="fade-up-3" style={{ width: "100%" }}>
        <button onClick={async () => {
          setLoading(true);
          setError("");
          try {
            const result = await loginWithGoogle();
            onNext(result);
          } catch (e) {
            setError(e?.message || "Google sign-in was cancelled or failed.");
          } finally {
            setLoading(false);
          }
        }} disabled={loading} style={{
          width: "100%", padding: "15px 20px",
          borderRadius: 50, border: `2px solid ${T.border}`,
          background: T.white,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          fontFamily: font.display, fontSize: 16, fontWeight: 700,
          color: T.ink, transition: "all 0.2s",
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          opacity: loading ? 0.7 : 1,
        }}>
          {loading ? (
            <div style={{ width: 20, height: 20, border: `2px solid ${T.saffron}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {loading
            ? (hi ? "Signing in…" : "Signing in…")
            : (hi ? "Google से Continue करें" : "Continue with Google")}
        </button>
        {error && (
          <p style={{ textAlign: "center", fontSize: 13, color: T.error, marginTop: 10, fontFamily: font.body }}>{error}</p>
        )}
      </div>

      <p className="fade-up-4" style={{
        marginTop: 20, fontSize: 12, color: T.muted,
        textAlign: "center", lineHeight: 1.6,
      }}>
        {hi
          ? "Login करने से आप हमारी Terms & Conditions और Privacy Policy से सहमत होते हैं"
          : "By continuing you agree to our Terms & Conditions and Privacy Policy"}
      </p>

      <div style={{ marginTop: 28, padding: "14px 16px", background: T.saffronDim, borderRadius: 12, width: "100%" }}>
        <div style={{ fontFamily: font.mono, fontSize: 10, fontWeight: 700, color: T.saffron, letterSpacing: "0.08em", marginBottom: 6 }}>FREE PLATFORM</div>
        <div style={{ fontSize: 12, color: "#7a4a1a", lineHeight: 1.6 }}>
          {hi
            ? "कोई payment नहीं। कोई manual verification नहीं। सिर्फ काम और trust।"
            : "No payment. No manual verification. Just work and trust."}
        </div>
      </div>
    </div>
  );
};

// ─── STEP 2: T&C ACCEPTANCE ────────────────────────────────────────
const StepTerms = ({ onNext, lang }) => {
  const [agreed, setAgreed] = useState(false);
  const hi = lang === "hi";

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.saffron, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          {hi ? "महत्वपूर्ण सूचना" : "IMPORTANT NOTICE"}
        </div>
        <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>
          {hi ? "उपयोग से पहले पढ़ें" : "Read Before Using"}
        </h2>
        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65 }}>
          {hi
            ? "App इस्तेमाल करने से पहले नीचे दी गई जानकारी को ध्यान से पढ़ें।"
            : "Please read the following carefully before using the app."}
        </p>
      </div>

      <Card className="fade-up-1" style={{ marginBottom: 16, borderLeft: `4px solid ${T.saffron}` }}>
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
          {hi ? "यह App क्या है?" : "What is this App?"}
        </div>
        {[
          hi ? "यह एक free discovery और Site Work record platform है।"
             : "This is a free discovery and Site Work record platform.",
          hi ? "हम किसी technician, SI, या user को employ, verify, certify, या guarantee नहीं करते।"
             : "We do not employ, verify, certify, or guarantee any technician, SI, or user.",
          hi ? "सभी payments, work scope, quality, warranty, और disputes directly SI और technician के बीच हैं।"
             : "All payments, work scope, quality, warranty, and disputes are directly between SI and technician.",
          hi ? "Platform किसी भी payment, delay, dispute, या work quality के लिए liable नहीं है।"
             : "Platform is not liable for any payment, delay, dispute, or work quality.",
        ].map((pt, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
            <div style={{
              width: 20, height: 20, borderRadius: "50%",
              background: T.saffronDim, color: T.saffron,
              fontFamily: font.mono, fontSize: 10, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, marginTop: 1,
            }}>{i + 1}</div>
            <p style={{ fontSize: 13, color: T.ink, lineHeight: 1.6 }}>{pt}</p>
          </div>
        ))}
      </Card>

      <Card className="fade-up-2" style={{ marginBottom: 20, borderLeft: `4px solid ${T.green}` }}>
        <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, marginBottom: 10 }}>
          {hi ? "Platform का उपयोग करते समय याद रखें" : "Remember when using the Platform"}
        </div>
        {[
          { e: "💰", t: hi ? "App में कोई payment gateway नहीं है।" : "No payment gateway in the app." },
          { e: "📞", t: hi ? "SI assign करने से पहले technician से direct बात करे।" : "SI must talk to technician before assigning work." },
          { e: "🔒", t: hi ? "Accepted Site Work के बाद ही exact location दिखेगी।" : "Exact location shown only after Site Work accepted." },
          { e: "📷", t: hi ? "Proof photo 7 दिन में auto-delete हो जाती है।" : "Proof photo auto-deleted within 7 days." },
        ].map((pt, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 9, alignItems: "flex-start", fontSize: 13, color: T.muted }}>
            <span style={{ fontSize: 15 }}>{pt.e}</span>
            <span style={{ lineHeight: 1.55 }}>{pt.t}</span>
          </div>
        ))}
      </Card>

      {/* Checkbox */}
      <button onClick={() => setAgreed(!agreed)} className="fade-up-3" style={{
        width: "100%", padding: "14px 16px",
        borderRadius: 12, border: `2px solid ${agreed ? T.green : T.border}`,
        background: agreed ? T.greenDim : T.white,
        display: "flex", alignItems: "flex-start", gap: 12,
        cursor: "pointer", marginBottom: 20, textAlign: "left",
        transition: "all 0.2s",
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6,
          border: `2px solid ${agreed ? T.green : T.border}`,
          background: agreed ? T.green : T.white,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "all 0.2s",
        }}>
          {agreed && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
        </div>
        <span style={{ fontSize: 13, color: T.ink, lineHeight: 1.6, fontFamily: font.body }}>
          {hi
            ? "मैं Terms & Conditions और Privacy Policy से सहमत हूँ। मैं समझता/समझती हूँ कि platform किसी भी payment या dispute के लिए liable नहीं है।"
            : "I agree to the Terms & Conditions and Privacy Policy. I understand the platform is not liable for any payment or dispute."}
        </span>
      </button>

      <div className="fade-up-4">
        <Btn onClick={onNext} disabled={!agreed}>
          {hi ? "सहमत हूँ — आगे बढ़ें" : "I Agree — Continue"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </Btn>
      </div>

      <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 16 }}>
        <a href="#" style={{ fontSize: 12, color: T.sky, textDecoration: "none" }}>
          {hi ? "Terms & Conditions" : "Terms & Conditions"}
        </a>
        <span style={{ color: T.border }}>·</span>
        <a href="#" style={{ fontSize: 12, color: T.sky, textDecoration: "none" }}>
          {hi ? "Privacy Policy" : "Privacy Policy"}
        </a>
      </div>
    </div>
  );
};

// ─── STEP 3: MOBILE NUMBER ─────────────────────────────────────────
const StepMobile = ({ onNext, lang }) => {
  const [mobile, setMobile] = useState("");
  const hi = lang === "hi";
  const valid = /^[6-9]\d{9}$/.test(mobile);

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.saffron, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          STEP 1 OF 3
        </div>
        <h2 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>
          {hi ? "अपना Mobile Number डालें" : "Enter Your Mobile Number"}
        </h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
          {hi
            ? "यह number call और WhatsApp के लिए use होगा। कोई OTP नहीं।"
            : "This number will be used for calls and WhatsApp. No OTP required."}
        </p>
      </div>

      <div className="fade-up-1" style={{ marginBottom: 20 }}>
        <Label>{hi ? "मोबाइल नंबर" : "MOBILE NUMBER"}</Label>
        <div style={{
          display: "flex", alignItems: "center",
          border: `2px solid ${mobile && !valid ? T.error : valid ? T.green : T.border}`,
          borderRadius: 14, background: T.white, overflow: "hidden",
          transition: "border-color 0.2s",
        }}>
          <div style={{
            padding: "14px 16px",
            borderRight: `2px solid ${T.border}`,
            fontFamily: font.mono, fontSize: 14, fontWeight: 700,
            color: T.ink, background: "#f9f6f0",
            display: "flex", alignItems: "center", gap: 8,
          }}>
            🇮🇳 +91
          </div>
          <input
            type="tel" maxLength={10}
            value={mobile}
            onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
            placeholder={hi ? "10 अंक का नंबर" : "10-digit number"}
            style={{
              flex: 1, padding: "14px 16px", border: "none", outline: "none",
              fontFamily: font.display, fontSize: 18, fontWeight: 700,
              color: T.ink, background: "transparent",
              letterSpacing: "0.08em",
            }}
          />
          {valid && (
            <div style={{ padding: "0 16px", color: T.green, fontSize: 20 }}>✓</div>
          )}
        </div>
        {mobile && !valid && (
          <p style={{ fontSize: 12, color: T.error, marginTop: 6, fontFamily: font.mono }}>
            {hi ? "Valid 10-digit mobile number डालें (6-9 से शुरू)" : "Enter valid 10-digit number (starts with 6-9)"}
          </p>
        )}
      </div>

      <Card className="fade-up-2" style={{ marginBottom: 24, background: T.saffronDim, border: "none" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span style={{ fontSize: 18 }}>ℹ️</span>
          <p style={{ fontSize: 13, color: "#7a4a1a", lineHeight: 1.6 }}>
            {hi
              ? "Mobile number self-entered है। कोई OTP verify नहीं होगा। Trust real completed Site Work से बनेगा।"
              : "Mobile number is self-entered. No OTP verification. Trust is built from real completed Site Work."}
          </p>
        </div>
      </Card>

      <div className="fade-up-3">
        <Btn onClick={() => onNext(mobile)} disabled={!valid}>
          {hi ? "आगे बढ़ें" : "Continue"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </Btn>
      </div>
    </div>
  );
};

// ─── STEP 4: ROLE SELECTION ────────────────────────────────────────
const StepRole = ({ onNext, lang, initialRole }) => {
  const [role, setRole] = useState(initialRole || null);
  const hi = lang === "hi";

  const roles = [
    {
      id: "SI",
      emoji: "🏢",
      title: hi ? "System Integrator / Contractor" : "System Integrator / Contractor",
      desc: hi ? "Client sites के लिए nearby available technicians खोजना चाहता हूँ, call करना और Site Work assign करना चाहता हूँ।"
               : "I want to find nearby available technicians for client sites, call them, and assign Site Work.",
      color: "sky",
    },
    {
      id: "TECH",
      emoji: "🔧",
      title: hi ? "Field Technician" : "Field Technician",
      desc: hi ? "मैं CCTV / IP Camera / DVR-NVR field technician हूँ। Profile बनाना और ज्यादा site work पाना चाहता हूँ।"
               : "I am a CCTV / IP Camera / DVR-NVR field technician. I want to build a profile and get more site work.",
      color: "saffron",
    },
    {
      id: "BOTH",
      emoji: "🔄",
      title: hi ? "दोनों (SI + Technician)" : "Both (SI + Technician)",
      desc: hi ? "मैं कभी SI की तरह काम assign करता हूँ, कभी खुद technician की तरह काम करता हूँ।"
               : "I sometimes assign work like an SI, and sometimes work as a technician myself.",
      color: "green",
    },
  ];

  const colorMap = {
    sky:     { bg: T.skyDim,     border: T.sky,     text: T.sky },
    saffron: { bg: T.saffronDim, border: T.saffron, text: T.saffron },
    green:   { bg: T.greenDim,   border: T.green,   text: T.green },
  };

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.saffron, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          STEP 2 OF 3
        </div>
        <h2 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>
          {hi ? "आप किस role में हैं?" : "What is Your Role?"}
        </h2>
        <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6 }}>
          {hi ? "आप बाद में role बदल सकते हैं।" : "You can change your role later."}
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
        {roles.map((r, i) => {
          const c = colorMap[r.color];
          const sel = role === r.id;
          return (
            <button key={r.id} onClick={() => setRole(r.id)} className={`fade-up-${i + 1}`} style={{
              padding: "18px 16px", borderRadius: 16,
              border: `2px solid ${sel ? c.border : T.border}`,
              background: sel ? c.bg : T.white,
              cursor: "pointer", textAlign: "left",
              display: "flex", gap: 14, alignItems: "flex-start",
              transition: "all 0.2s",
              boxShadow: sel ? `0 4px 20px ${c.border}30` : "none",
            }}>
              <div style={{
                width: 48, height: 48, borderRadius: 14,
                background: sel ? c.border : T.paper,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, flexShrink: 0, transition: "background 0.2s",
              }}>{r.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: font.display, fontSize: 16, fontWeight: 700,
                  color: sel ? c.text : T.ink, marginBottom: 4,
                }}>{r.title}</div>
                <div style={{ fontSize: 13, color: T.muted, lineHeight: 1.55 }}>{r.desc}</div>
              </div>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                border: `2px solid ${sel ? c.border : T.border}`,
                background: sel ? c.border : T.white,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", marginTop: 2,
              }}>
                {sel && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="fade-up-4">
        <Btn onClick={() => onNext(role)} disabled={!role}>
          {hi ? "आगे बढ़ें" : "Continue"}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </Btn>
      </div>
    </div>
  );
};

// ─── STEP 5A: TECHNICIAN PROFILE BUILDER ──────────────────────────
const StepTechProfile = ({ onNext, lang }) => {
  const hi = lang === "hi";

  const [city, setCity] = useState("");
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState(null);
  const [tools, setTools] = useState([]);
  const [vehicle, setVehicle] = useState(null);
  const [availability, setAvailability] = useState(null);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const skillList = [
    { id: "CCTV_INSTALLATION", e: "📷", l: hi ? "CCTV Installation" : "CCTV Installation" },
    { id: "CAMERA_SERVICE",    e: "🔧", l: hi ? "Camera Service" : "Camera Service" },
    { id: "DVR_NVR",           e: "💾", l: hi ? "DVR/NVR Setting" : "DVR/NVR Setting" },
    { id: "IP_CAMERA",         e: "🌐", l: hi ? "IP Camera Setup" : "IP Camera Setup" },
    { id: "LAN_CABLING",       e: "🔌", l: hi ? "LAN Cabling" : "LAN Cabling" },
    { id: "WIFI_BRIDGE",       e: "📶", l: hi ? "WiFi Bridge" : "WiFi Bridge" },
    { id: "BIOMETRIC",         e: "👆", l: hi ? "Biometric" : "Biometric" },
    { id: "ACCESS_CONTROL",    e: "🚪", l: hi ? "Access Control" : "Access Control" },
    { id: "NETWORKING",        e: "🖧",  l: hi ? "Networking" : "Networking" },
    { id: "EDGEYE",            e: "👁",  l: hi ? "EdgEye Setup" : "EdgEye Setup" },
  ];

  const expList = [
    { id: "NEW",     l: hi ? "नया" : "New" },
    { id: "1_PLUS",  l: hi ? "1+ साल" : "1+ yr" },
    { id: "3_PLUS",  l: hi ? "3+ साल" : "3+ yrs" },
    { id: "5_PLUS",  l: hi ? "5+ साल" : "5+ yrs" },
    { id: "10_PLUS", l: hi ? "10+ साल" : "10+ yrs" },
  ];

  const toolList = [
    { id: "DRILL",       e: "🔩", l: "Drill Machine" },
    { id: "LAN_TESTER",  e: "🔬", l: "LAN Tester" },
    { id: "CRIMPING",    e: "✂️", l: "Crimping Tool" },
    { id: "LADDER",      e: "🪜", l: "Ladder" },
    { id: "LAPTOP",      e: "💻", l: "Laptop" },
    { id: "MULTIMETER",  e: "📟", l: "Multimeter" },
    { id: "BASIC_KIT",   e: "🧰", l: hi ? "Basic Kit" : "Basic Kit" },
  ];

  const vehicleList = [
    { id: "BIKE",    e: "🏍", l: hi ? "Bike" : "Bike" },
    { id: "SCOOTER", e: "🛵", l: hi ? "Scooter" : "Scooter" },
    { id: "CAR",     e: "🚗", l: hi ? "Car" : "Car" },
    { id: "NONE",    e: "🚶", l: hi ? "कोई नहीं" : "None" },
  ];

  const availList = [
    { id: "AVAILABLE_NOW",      e: "🟢", l: hi ? "अभी Available" : "Available Now",   color: "green" },
    { id: "AVAILABLE_TODAY",    e: "🟡", l: hi ? "आज Available" : "Available Today",  color: "saffron" },
    { id: "AVAILABLE_TOMORROW", e: "🔵", l: hi ? "कल Available" : "Available Tomorrow", color: "sky" },
    { id: "BUSY",               e: "🔴", l: hi ? "Busy" : "Busy",                     color: "ink" },
  ];

  // Profile strength calc
  let pct = 10; // base for name from google
  if (city) pct += 10;
  if (skills.length > 0) pct += 20;
  if (experience) pct += 10;
  if (tools.length > 0) pct += 10;
  if (vehicle) pct += 10;
  if (availability) pct += 10;

  const canProceed = city && skills.length > 0 && experience && availability;

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.saffron, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          STEP 3 OF 3 — TECHNICIAN
        </div>
        <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, lineHeight: 1.3, marginBottom: 6 }}>
          {hi ? "अपनी Profile बनाएं" : "Build Your Profile"}
        </h2>
        <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.5, marginBottom: 12 }}>
          {hi ? "Buttons चुनें — typing minimum।" : "Select from buttons — minimum typing."}
        </p>
        <ProfileStrengthBar pct={pct} />
      </div>

      {/* City */}
      <div className="fade-up-1" style={{ marginBottom: 20 }}>
        <Label>{hi ? "शहर / काम का इलाका" : "CITY / WORKING AREA"}</Label>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder={hi ? "जैसे: Jaipur, Delhi, Mumbai…" : "e.g. Jaipur, Delhi, Mumbai…"}
          style={{
            width: "100%", padding: "13px 16px",
            border: `2px solid ${city ? T.saffron : T.border}`,
            borderRadius: 12, outline: "none",
            fontFamily: font.display, fontSize: 16,
            color: T.ink, background: T.white, transition: "border-color 0.2s",
          }}
        />
      </div>

      {/* Skills */}
      <div className="fade-up-2" style={{ marginBottom: 20 }}>
        <Label>{hi ? "Skills (एक या ज्यादा चुनें)" : "SKILLS (SELECT ONE OR MORE)"}</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {skillList.map(s => (
            <Chip key={s.id} emoji={s.e} label={s.l} selected={skills.includes(s.id)}
              onClick={() => toggle(skills, setSkills, s.id)} color="saffron" />
          ))}
        </div>
      </div>

      {/* Experience */}
      <div className="fade-up-3" style={{ marginBottom: 20 }}>
        <Label>{hi ? "Experience" : "EXPERIENCE"}</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {expList.map(e => (
            <Chip key={e.id} label={e.l} selected={experience === e.id}
              onClick={() => setExperience(e.id)} color="sky" />
          ))}
        </div>
      </div>

      {/* Tools */}
      <div className="fade-up-4" style={{ marginBottom: 20 }}>
        <Label>{hi ? "Tools (जो उपलब्ध हैं)" : "AVAILABLE TOOLS"}</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {toolList.map(t => (
            <Chip key={t.id} emoji={t.e} label={t.l} selected={tools.includes(t.id)}
              onClick={() => toggle(tools, setTools, t.id)} color="ink" />
          ))}
        </div>
      </div>

      {/* Vehicle */}
      <div style={{ marginBottom: 20 }}>
        <Label>{hi ? "वाहन" : "VEHICLE"}</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {vehicleList.map(v => (
            <Chip key={v.id} emoji={v.e} label={v.l} selected={vehicle === v.id}
              onClick={() => setVehicle(v.id)} color="green" />
          ))}
        </div>
      </div>

      {/* Availability */}
      <div style={{ marginBottom: 24 }}>
        <Label>{hi ? "अभी Availability" : "CURRENT AVAILABILITY"}</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {availList.map(a => (
            <Chip key={a.id} emoji={a.e} label={a.l} selected={availability === a.id}
              onClick={() => setAvailability(a.id)} color={a.color} />
          ))}
        </div>
      </div>

      {/* Preview generated bio */}
      {skills.length > 0 && city && experience && (
        <Card style={{ marginBottom: 20, background: T.saffronDim, border: `1px solid ${T.saffron}40` }}>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: T.saffron, letterSpacing: "0.1em", marginBottom: 8 }}>
            {hi ? "AUTO-GENERATED PROFILE PREVIEW" : "AUTO-GENERATED PROFILE PREVIEW"}
          </div>
          <p style={{ fontSize: 13, color: T.ink, lineHeight: 1.7 }}>
            {hi
              ? `आप ${city} में ${skillList.filter(s => skills.includes(s.id)).map(s => s.l).slice(0,3).join(", ")} technician हैं। आपको ${expList.find(e => e.id === experience)?.l} का अनुभव है।${tools.length > 0 ? ` आपके पास ${tools.length} field tools हैं।` : ""}`
              : `You are a ${skillList.filter(s => skills.includes(s.id)).map(s => s.l).slice(0,3).join(", ")} technician in ${city} with ${expList.find(e => e.id === experience)?.l} of experience.${tools.length > 0 ? ` You have ${tools.length} field tools available.` : ""}`}
          </p>
        </Card>
      )}

      <Btn onClick={() => onNext({ city, skills, experienceLevel: experience, tools, vehicle, availability })} disabled={!canProceed}>
        {hi ? "Profile Save करें — शुरू करें" : "Save Profile — Get Started"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </Btn>

      {!canProceed && (
        <p style={{ textAlign: "center", fontSize: 12, color: T.muted, marginTop: 12, fontFamily: font.mono }}>
          {hi ? "City, Skills, Experience और Availability जरूरी है" : "City, Skills, Experience & Availability required"}
        </p>
      )}
    </div>
  );
};

// ─── STEP 5B: SI PROFILE BUILDER ──────────────────────────────────
const StepSIProfile = ({ onNext, lang }) => {
  const hi = lang === "hi";
  const [bizName, setBizName] = useState("");
  const [city, setCity] = useState("");
  const [bizType, setBizType] = useState(null);
  const [workCats, setWorkCats] = useState([]);

  const toggle = (arr, setArr, val) =>
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

  const bizTypes = [
    { id: "SI",               l: hi ? "System Integrator" : "System Integrator" },
    { id: "CONTRACTOR",       l: hi ? "Contractor" : "Contractor" },
    { id: "DEALER",           l: hi ? "Dealer" : "Dealer" },
    { id: "SERVICE_PROVIDER", l: hi ? "Service Provider" : "Service Provider" },
  ];

  const catList = [
    { id: "CCTV",          e: "📷", l: "CCTV" },
    { id: "IP_CAMERA",     e: "🌐", l: "IP Camera" },
    { id: "DVR_NVR",       e: "💾", l: "DVR / NVR" },
    { id: "ACCESS_CTRL",   e: "🚪", l: hi ? "Access Control" : "Access Control" },
    { id: "BIOMETRIC",     e: "👆", l: "Biometric" },
    { id: "NETWORKING",    e: "🔌", l: "Networking" },
    { id: "ALARM",         e: "🚨", l: hi ? "Alarm System" : "Alarm System" },
    { id: "EDGEYE",        e: "👁", l: "EdgEye" },
  ];

  const canProceed = city && bizType;

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: font.mono, fontSize: 11, color: T.sky, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>
          STEP 3 OF 3 — SI / CONTRACTOR
        </div>
        <h2 style={{ fontFamily: font.display, fontSize: 22, fontWeight: 800, lineHeight: 1.3, marginBottom: 8 }}>
          {hi ? "SI Profile बनाएं" : "Create SI Profile"}
        </h2>
      </div>

      <div className="fade-up-1" style={{ marginBottom: 18 }}>
        <Label>{hi ? "Business / Company Name (Optional)" : "BUSINESS / COMPANY NAME (OPTIONAL)"}</Label>
        <input
          value={bizName}
          onChange={e => setBizName(e.target.value)}
          placeholder={hi ? "जैसे: Rajasthan Security Systems" : "e.g. Rajasthan Security Systems"}
          style={{
            width: "100%", padding: "13px 16px",
            border: `2px solid ${bizName ? T.sky : T.border}`,
            borderRadius: 12, outline: "none",
            fontFamily: font.display, fontSize: 15,
            color: T.ink, background: T.white, transition: "border-color 0.2s",
          }}
        />
      </div>

      <div className="fade-up-2" style={{ marginBottom: 18 }}>
        <Label>{hi ? "शहर / काम का इलाका" : "CITY / WORKING AREA"}</Label>
        <input
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder={hi ? "जैसे: Jaipur, Delhi…" : "e.g. Jaipur, Delhi…"}
          style={{
            width: "100%", padding: "13px 16px",
            border: `2px solid ${city ? T.sky : T.border}`,
            borderRadius: 12, outline: "none",
            fontFamily: font.display, fontSize: 15,
            color: T.ink, background: T.white, transition: "border-color 0.2s",
          }}
        />
      </div>

      <div className="fade-up-3" style={{ marginBottom: 18 }}>
        <Label>{hi ? "Business Type" : "BUSINESS TYPE"}</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {bizTypes.map(b => (
            <Chip key={b.id} label={b.l} selected={bizType === b.id}
              onClick={() => setBizType(b.id)} color="sky" />
          ))}
        </div>
      </div>

      <div className="fade-up-4" style={{ marginBottom: 24 }}>
        <Label>{hi ? "आमतौर पर किन categories में काम करते हैं?" : "WORK CATEGORIES (USUALLY HANDLED)"}</Label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {catList.map(c => (
            <Chip key={c.id} emoji={c.e} label={c.l} selected={workCats.includes(c.id)}
              onClick={() => toggle(workCats, setWorkCats, c.id)} color="sky" />
          ))}
        </div>
      </div>

      <Btn onClick={() => onNext({ businessName: bizName, city, businessType: bizType, workCategories: workCats })} disabled={!canProceed} style={{ background: T.sky, boxShadow: `0 4px 20px ${T.sky}50` }}>
        {hi ? "Profile Save करें — शुरू करें" : "Save Profile — Get Started"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </Btn>
    </div>
  );
};

// ─── STEP 6: SUCCESS ───────────────────────────────────────────────
const StepSuccess = ({ role, lang, onEnter }) => {
  const hi = lang === "hi";
  const isTech = role === "TECH" || role === "BOTH";
  const isSI   = role === "SI"   || role === "BOTH";

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        width: 80, height: 80, borderRadius: "50%",
        background: T.greenDim, border: `3px solid ${T.green}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
        fontSize: 36,
        animation: "checkPop 0.5s ease",
      }}>🎉</div>

      <h2 className="fade-up" style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, marginBottom: 10 }}>
        {hi ? "आप तैयार हैं!" : "You're All Set!"}
      </h2>
      <p className="fade-up-1" style={{ fontSize: 14, color: T.muted, lineHeight: 1.65, marginBottom: 28 }}>
        {hi
          ? "आपकी profile बन गई है। अब app इस्तेमाल शुरू करें।"
          : "Your profile is ready. Start using the app now."}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
        {isSI && (
          <Card className="fade-up-2" style={{ textAlign: "left", borderLeft: `4px solid ${T.sky}` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 28 }}>🏢</span>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, marginBottom: 3 }}>
                  {hi ? "SI Mode में जाएं" : "Go to SI Mode"}
                </div>
                <div style={{ fontSize: 13, color: T.muted }}>
                  {hi ? "Client site डालें और nearby technician खोजें" : "Enter client site and find nearby technicians"}
                </div>
              </div>
            </div>
          </Card>
        )}
        {isTech && (
          <Card className="fade-up-3" style={{ textAlign: "left", borderLeft: `4px solid ${T.saffron}` }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 28 }}>🔧</span>
              <div>
                <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, marginBottom: 3 }}>
                  {hi ? "Available ON करें" : "Turn Available ON"}
                </div>
                <div style={{ fontSize: 13, color: T.muted }}>
                  {hi ? "Nearby SIs को आपकी profile दिखेगी" : "Nearby SIs will see your profile in search"}
                </div>
              </div>
            </div>
          </Card>
        )}
        <Card className="fade-up-4" style={{ textAlign: "left", borderLeft: `4px solid ${T.green}` }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 28 }}>🔗</span>
            <div>
              <div style={{ fontFamily: font.display, fontSize: 15, fontWeight: 700, marginBottom: 3 }}>
                {hi ? "Profile Link Share करें" : "Share Your Profile Link"}
              </div>
              <div style={{ fontSize: 13, color: T.muted }}>
                {hi ? "WhatsApp पर अपनी profile share करें" : "Share your profile on WhatsApp"}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Btn onClick={onEnter} variant="green">
        {hi ? "App खोलें" : "Open App"}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </Btn>
    </div>
  );
};

// ─── MAIN ONBOARDING APP ───────────────────────────────────────────
export default function OnboardingApp() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState(localStorage.getItem("sm_lang") || "hi");
  const [role, setRole] = useState(null);
  const [apiErr, setApiErr] = useState("");
  const [busy, setBusy] = useState(false);

  // If user already logged in, start from the right step
  useEffect(() => {
    if (!user) return;
    if (!user.termsAccepted) { setStep(1); return; }
    if (!user.mobile)        { setStep(2); return; }
    if (!user.roles?.length) { setStep(3); return; }
    // Fully onboarded — go to dashboard
    navigate("/", { replace: true });
  }, [user]);

  const call = async (fn) => {
    setBusy(true); setApiErr("");
    try { await fn(); }
    catch (e) { setApiErr(e?.message || "Something went wrong. Try again."); }
    finally { setBusy(false); }
  };

  // Step handlers with real API calls
  const handleLoginNext = async (loginResult, preRole) => {
    const u = loginResult?.user || user;
    if (!u) { setStep(1); return; }
    if (preRole) setRole(preRole); // pre-fill role from login screen selection
    if (!u.termsAccepted) { setStep(1); return; }
    if (!u.mobile)        { setStep(2); return; }
    if (!u.roles?.length) { setStep(3); return; }
    navigate("/", { replace: true });
  };

  const handleTermsNext = () => call(async () => {
    await api.post("/auth/accept-terms");
    await refreshUser();
    setStep(2);
  });

  const handleMobileNext = (mobile) => call(async () => {
    await api.post("/auth/mobile", { mobile });
    await refreshUser();
    setStep(3);
  });

  const handleRoleNext = (selectedRole) => call(async () => {
    const roles = selectedRole === "BOTH" ? ["TECHNICIAN", "SI"]
                : selectedRole === "SI"   ? ["SI"]
                : ["TECHNICIAN"];
    await api.post("/auth/roles", { roles });
    await refreshUser();
    setRole(selectedRole);
    setStep(4);
  });

  const handleTechProfileNext = (profileData) => call(async () => {
    await api.put("/technician/profile", profileData);
    await refreshUser();
    setStep(5);
  });

  const handleSIProfileNext = (profileData) => call(async () => {
    await api.put("/si/profile", profileData);
    await refreshUser();
    setStep(5);
  });

  const handleSuccess = () => navigate("/", { replace: true });

  // steps: 0=login, 1=terms, 2=mobile, 3=role, 4=profile, 5=success
  const totalDots = 5;
  const dotStep = Math.max(0, step - 1);
  const showDots = step >= 1 && step <= 5;

  return (
    <>
      <FontLoader />
      <div style={{
        minHeight: "100vh",
        background: T.paper,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}>
        {/* Top bar */}
        <div style={{
          width: "100%", maxWidth: 420,
          padding: "12px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 10,
          background: T.paper,
          borderBottom: step > 0 ? `1px solid ${T.border}` : "none",
        }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => Math.max(1, s - 1))} style={{
              width: 36, height: 36, borderRadius: "50%",
              background: T.white, border: `1px solid ${T.border}`,
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.ink} strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
          ) : <div style={{ width: 36 }} />}

          <div style={{ fontFamily: font.mono, fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: "0.06em" }}>
            SITEMITRA
          </div>

          {/* Lang toggle */}
          <div style={{
            display: "flex", gap: 2,
            background: T.white, border: `1px solid ${T.border}`,
            borderRadius: 20, padding: 3,
          }}>
            {["hi", "en"].map(l => (
              <button key={l} onClick={() => { setLang(l); localStorage.setItem("sm_lang", l); }} style={{
                padding: "3px 10px", borderRadius: 14, border: "none",
                background: lang === l ? T.saffron : "transparent",
                color: lang === l ? "#fff" : T.muted,
                fontFamily: font.mono, fontSize: 11, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
              }}>
                {l === "hi" ? "हि" : "EN"}
              </button>
            ))}
          </div>
        </div>

        {/* API error banner */}
        {apiErr && (
          <div style={{
            width: "100%", maxWidth: 420, padding: "10px 20px",
            background: "#fdecea", borderBottom: "1px solid #f5c6cb",
          }}>
            <p style={{ fontSize: 13, color: T.error, textAlign: "center", fontFamily: font.body }}>{apiErr}</p>
          </div>
        )}

        {/* Main content */}
        <div style={{ width: "100%", maxWidth: 420, padding: "20px 20px 40px", flex: 1 }}>
          {showDots && <StepDots total={totalDots} current={dotStep} />}

          {step === 0 && <StepLogin onNext={handleLoginNext} lang={lang} />}
          {step === 1 && <StepTerms onNext={handleTermsNext} lang={lang} disabled={busy} />}
          {step === 2 && <StepMobile onNext={handleMobileNext} lang={lang} disabled={busy} />}
          {step === 3 && <StepRole onNext={handleRoleNext} lang={lang} disabled={busy} initialRole={role} />}
          {step === 4 && (role === "SI"
            ? <StepSIProfile onNext={handleSIProfileNext} lang={lang} disabled={busy} />
            : <StepTechProfile onNext={handleTechProfileNext} lang={lang} disabled={busy} />
          )}
          {step === 5 && <StepSuccess role={role} lang={lang} onEnter={handleSuccess} />}
        </div>
      </div>
    </>
  );
}
