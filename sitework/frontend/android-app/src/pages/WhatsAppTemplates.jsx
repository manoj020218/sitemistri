import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  ink: "#0f0e0c",
  paper: "#f5f0e8",
  saffron: "#e8630a",
  saffronDim: "#fde8d4",
  green: "#1a7a4a",
  greenDim: "#d4f0e2",
  sky: "#1a5fa8",
  skyDim: "#daeaf8",
  border: "#e0d8cc",
  muted: "#6b6258",
  white: "#ffffff",
  wa: "#25D366",
  waDim: "#e6f9f0",
};

const font = {
  display: "'Baloo 2', sans-serif",
  body: "'Noto Sans Devanagari', sans-serif",
  mono: "'Space Mono', monospace",
};

const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
    html,body { background:${T.paper}; font-family:${font.body}; color:${T.ink}; }
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);} }
    @keyframes checkPop { 0%{transform:scale(0);}70%{transform:scale(1.3);}100%{transform:scale(1);} }
    .fade-up   { animation:fadeUp .32s ease both; }
    .fade-up-1 { animation:fadeUp .32s .05s ease both; }
    .fade-up-2 { animation:fadeUp .32s .10s ease both; }
    .fade-up-3 { animation:fadeUp .32s .15s ease both; }
    .fade-up-4 { animation:fadeUp .32s .20s ease both; }
  `}</style>
);

// ─── TEMPLATE ENGINE ──────────────────────────────────────────────
// Replaces {{key}} placeholders with values object
const fillTemplate = (template, values) =>
  template.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] || `{{${key}}}`);

// ─── ALL TEMPLATES ────────────────────────────────────────────────
const TEMPLATES = {

  // 1. Technician shares profile to SI
  TECH_PROFILE_SHARE: {
    id: "TECH_PROFILE_SHARE",
    category: "technician",
    icon: "🔧",
    labelHi: "Technician → SI को Profile Share",
    labelEn: "Technician → Share Profile to SI",
    fields: [
      { key:"technicianName",   labelHi:"Technician Name",   labelEn:"Technician Name",   placeholder:"Ramesh Kumar" },
      { key:"skills",           labelHi:"Skills",            labelEn:"Skills",            placeholder:"CCTV, IP Camera, DVR/NVR" },
      { key:"city",             labelHi:"City",              labelEn:"City",              placeholder:"Jaipur" },
      { key:"profileLink",      labelHi:"Profile Link",      labelEn:"Profile Link",      placeholder:"siteworknetwork.com/t/ramesh-kumar" },
    ],
    templateHi:
`नमस्ते सर,
मैं {{city}} में CCTV / IP Camera / DVR-NVR field technician हूँ। मैं {{skills}} का काम करता हूँ।

मेरी profile, skills और completed site work यहाँ देखें:
{{profileLink}}

अगर आपके पास मेरे area में site work हो तो app से assign कर सकते हैं।

धन्यवाद।
— {{technicianName}}`,
    templateEn:
`Hello Sir,
I am a CCTV / IP Camera / DVR-NVR field technician in {{city}} available for {{skills}} work.

You can view my profile, skills, and completed site work here:
{{profileLink}}

If you have site work in my area, you can assign it through the app.

Thank you.
— {{technicianName}}`,
  },

  // 2. SI shares hiring link to attract technicians
  SI_HIRING_LINK: {
    id: "SI_HIRING_LINK",
    category: "si",
    icon: "🏢",
    labelHi: "SI → Technicians को Hiring Link",
    labelEn: "SI → Hiring Link to Technicians",
    fields: [
      { key:"siName",     labelHi:"SI Name",       labelEn:"SI Name",       placeholder:"Suresh Sharma" },
      { key:"bizName",    labelHi:"Business Name", labelEn:"Business Name", placeholder:"Rajasthan Security Systems" },
      { key:"city",       labelHi:"City",          labelEn:"City",          placeholder:"Jaipur" },
      { key:"siLink",     labelHi:"SI Hiring Link",labelEn:"SI Hiring Link",placeholder:"siteworknetwork.com/si/suresh-sharma" },
    ],
    templateHi:
`नमस्ते,
हम {{city}} में CCTV / IP Camera / DVR-NVR installation और service work के लिए field technicians जोड़ रहे हैं।

अगर आप CCTV, IP Camera, LAN cabling, DVR/NVR setting या service work करते हैं, तो अपनी technician profile यहाँ बनाएं और future site work के लिए connect करें:
{{siLink}}

धन्यवाद।
— {{siName}}
{{bizName}}`,
    templateEn:
`Hello,
We are looking to connect with field technicians for CCTV, IP Camera, DVR/NVR installation, LAN cabling, and service work in {{city}}.

If you are a technician, create your profile here and connect with us for future site work:
{{siLink}}

Thank you.
— {{siName}}
{{bizName}}`,
  },

  // 3. SI forwards technician contact to client
  SI_TECH_TO_CLIENT: {
    id: "SI_TECH_TO_CLIENT",
    category: "si",
    icon: "📤",
    labelHi: "SI → Client को Technician Details",
    labelEn: "SI → Send Technician to Client",
    fields: [
      { key:"clientName",       labelHi:"Client Name",        labelEn:"Client Name",        placeholder:"Sharma Medical Store" },
      { key:"technicianName",   labelHi:"Technician Name",    labelEn:"Technician Name",    placeholder:"Ramesh Kumar" },
      { key:"technicianMobile", labelHi:"Technician Mobile",  labelEn:"Technician Mobile",  placeholder:"9876543210" },
      { key:"workType",         labelHi:"Work Type",          labelEn:"Work Type",          placeholder:"IP Camera Configuration" },
      { key:"expectedVisitTime",labelHi:"Expected Visit Time",labelEn:"Expected Visit Time",placeholder:"Today, 2:00 PM" },
      { key:"siBusinessName",   labelHi:"Your Business Name", labelEn:"Your Business Name", placeholder:"Rajasthan Security Systems" },
    ],
    templateHi:
`नमस्ते {{clientName}} जी,
आपके site work के लिए technician details नीचे हैं:

Technician: {{technicianName}}
Mobile: {{technicianMobile}}
काम: {{workType}}
Expected Visit: {{expectedVisitTime}}

कृपया technician के call पर guide कर दें और site access दे दें।

धन्यवाद।
— {{siBusinessName}}`,
    templateEn:
`Hello {{clientName}},
Technician details for your site work are below:

Technician: {{technicianName}}
Mobile: {{technicianMobile}}
Work Type: {{workType}}
Expected Visit: {{expectedVisitTime}}

Please guide the technician when he calls or reaches your site.

Thank you.
— {{siBusinessName}}`,
  },

  // 4. SI assigns work — confirmation to technician (manual backup)
  SI_WORK_ASSIGN_CONFIRM: {
    id: "SI_WORK_ASSIGN_CONFIRM",
    category: "si",
    icon: "📋",
    labelHi: "SI → Technician को Work Assignment Confirm",
    labelEn: "SI → Work Assignment Confirmation",
    fields: [
      { key:"technicianName",   labelHi:"Technician Name",   labelEn:"Technician Name",   placeholder:"Ramesh Kumar" },
      { key:"workType",         labelHi:"Work Type",         labelEn:"Work Type",         placeholder:"DVR/NVR Setup" },
      { key:"siteAddress",      labelHi:"Site Address",      labelEn:"Site Address",      placeholder:"Block B, Green Valley, Jaipur" },
      { key:"clientName",       labelHi:"Client Name",       labelEn:"Client Name",       placeholder:"Green Valley Apartments" },
      { key:"visitTime",        labelHi:"Visit Time",        labelEn:"Visit Time",        placeholder:"Today, 11:00 AM" },
      { key:"agreedCharge",     labelHi:"Agreed Charge (₹)", labelEn:"Agreed Charge (₹)", placeholder:"800" },
      { key:"paymentMode",      labelHi:"Payment Mode",      labelEn:"Payment Mode",      placeholder:"Cash" },
      { key:"siName",           labelHi:"Your Name",         labelEn:"Your Name",         placeholder:"Suresh Sharma" },
    ],
    templateHi:
`नमस्ते {{technicianName}} जी,
आपको नीचे दी गई site के लिए Site Work assign किया गया है:

काम: {{workType}}
Client: {{clientName}}
Site: {{siteAddress}}
Visit Time: {{visitTime}}
Agreed Charge: ₹{{agreedCharge}} ({{paymentMode}})

App पर Site Work accept करें और site पर जाएं।

धन्यवाद।
— {{siName}}`,
    templateEn:
`Hello {{technicianName}},
You have been assigned a Site Work for the following:

Work: {{workType}}
Client: {{clientName}}
Site: {{siteAddress}}
Visit Time: {{visitTime}}
Agreed Charge: ₹{{agreedCharge}} ({{paymentMode}})

Please accept the Site Work on the app and proceed to the site.

Thank you.
— {{siName}}`,
  },

  // 5. Technician confirms reaching site to SI
  TECH_REACHED_SITE: {
    id: "TECH_REACHED_SITE",
    category: "technician",
    icon: "📍",
    labelHi: "Technician → SI को Site पर पहुंचने की सूचना",
    labelEn: "Technician → Reached Site Notification",
    fields: [
      { key:"technicianName", labelHi:"Technician Name", labelEn:"Technician Name", placeholder:"Ramesh Kumar" },
      { key:"siteAddress",    labelHi:"Site Address",    labelEn:"Site Address",    placeholder:"Block B, Green Valley, Jaipur" },
      { key:"reachedTime",    labelHi:"Reached Time",    labelEn:"Reached Time",    placeholder:"11:05 AM" },
    ],
    templateHi:
`नमस्ते सर,
मैं site पर पहुंच गया हूँ।

Site: {{siteAddress}}
Time: {{reachedTime}}

काम शुरू कर रहा हूँ। कोई specific instruction हो तो बताएं।

— {{technicianName}}`,
    templateEn:
`Hello Sir,
I have reached the site.

Site: {{siteAddress}}
Time: {{reachedTime}}

Starting work now. Please let me know if you have any specific instructions.

— {{technicianName}}`,
  },

  // 6. Technician marks work complete — sends proof notice to SI
  TECH_WORK_COMPLETE: {
    id: "TECH_WORK_COMPLETE",
    category: "technician",
    icon: "✅",
    labelHi: "Technician → SI को Work Complete सूचना",
    labelEn: "Technician → Work Complete Notice to SI",
    fields: [
      { key:"technicianName",  labelHi:"Technician Name", labelEn:"Technician Name", placeholder:"Ramesh Kumar" },
      { key:"workType",        labelHi:"Work Type",       labelEn:"Work Type",       placeholder:"DVR/NVR Setup" },
      { key:"clientName",      labelHi:"Client Name",     labelEn:"Client Name",     placeholder:"Green Valley Apartments" },
      { key:"completionTime",  labelHi:"Completion Time", labelEn:"Completion Time", placeholder:"12:40 PM" },
    ],
    templateHi:
`नमस्ते सर,
मैंने {{clientName}} का {{workType}} काम पूरा कर लिया है।

Completion Time: {{completionTime}}

App पर proof photo upload कर दी है। कृपया review करके Site Work close कर दें।

अगर अतिरिक्त proof चाहिए तो WhatsApp पर भेज सकता हूँ।

धन्यवाद।
— {{technicianName}}`,
    templateEn:
`Hello Sir,
I have completed the {{workType}} work at {{clientName}}.

Completion Time: {{completionTime}}

Proof photo has been uploaded on the app. Please review and close the Site Work.

If you need additional proof, I can send it on WhatsApp.

Thank you.
— {{technicianName}}`,
  },

  // 7. Technician reports issue privately to SI
  TECH_ISSUE_REPORT: {
    id: "TECH_ISSUE_REPORT",
    category: "technician",
    icon: "⚠️",
    labelHi: "Technician → SI को Issue Report",
    labelEn: "Technician → Issue Report to SI",
    fields: [
      { key:"technicianName", labelHi:"Technician Name", labelEn:"Technician Name", placeholder:"Ramesh Kumar" },
      { key:"workType",       labelHi:"Work Type",       labelEn:"Work Type",       placeholder:"DVR/NVR Setup" },
      { key:"issue",          labelHi:"Issue",           labelEn:"Issue",           placeholder:"Payment not received" },
    ],
    templateHi:
`नमस्ते सर,
{{workType}} site work के संदर्भ में एक समस्या है:

Issue: {{issue}}

कृपया इस पर ध्यान दें और जल्द resolve करें।

धन्यवाद।
— {{technicianName}}`,
    templateEn:
`Hello Sir,
I have an issue regarding the {{workType}} site work:

Issue: {{issue}}

Please look into this and resolve it at the earliest.

Thank you.
— {{technicianName}}`,
  },

  // 8. SI sends payment reminder to client
  SI_PAYMENT_REMINDER: {
    id: "SI_PAYMENT_REMINDER",
    category: "si",
    icon: "💰",
    labelHi: "SI → Client को Payment Reminder",
    labelEn: "SI → Payment Reminder to Client",
    fields: [
      { key:"clientName",   labelHi:"Client Name",   labelEn:"Client Name",   placeholder:"Sharma Medical Store" },
      { key:"workType",     labelHi:"Work Type",     labelEn:"Work Type",     placeholder:"CCTV Installation" },
      { key:"amount",       labelHi:"Amount (₹)",    labelEn:"Amount (₹)",    placeholder:"2500" },
      { key:"paymentMode",  labelHi:"Payment Mode",  labelEn:"Payment Mode",  placeholder:"Cash / UPI" },
      { key:"siName",       labelHi:"Your Name",     labelEn:"Your Name",     placeholder:"Suresh Sharma" },
    ],
    templateHi:
`नमस्ते {{clientName}} जी,
आपके यहाँ {{workType}} का काम पूरा हो गया है।

Due Amount: ₹{{amount}}
Payment Mode: {{paymentMode}}

कृपया payment settle कर दें।

धन्यवाद।
— {{siName}}`,
    templateEn:
`Hello {{clientName}},
The {{workType}} work at your site has been completed.

Due Amount: ₹{{amount}}
Payment Mode: {{paymentMode}}

Please settle the payment at your earliest convenience.

Thank you.
— {{siName}}`,
  },
};

// ─── SHARED UI ─────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{
    background: T.white, borderRadius: 16,
    border: `1px solid ${T.border}`,
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    overflow: "hidden", ...style,
  }}>{children}</div>
);

const CopyBtn = ({ text, label = "Copy", style }) => {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handle} style={{
      padding: "9px 18px", borderRadius: 50,
      border: `1px solid ${copied ? T.green : T.border}`,
      background: copied ? T.greenDim : T.white,
      color: copied ? T.green : T.muted,
      fontFamily: font.display, fontSize: 13, fontWeight: 700,
      cursor: "pointer", transition: "all 0.2s",
      display: "flex", alignItems: "center", gap: 6,
      ...style,
    }}>
      {copied
        ? <><span style={{ animation: "checkPop .3s ease" }}>✓</span> Copied!</>
        : <>📋 {label}</>}
    </button>
  );
};

const WABtn = ({ message, phone = "" }) => {
  const encoded = encodeURIComponent(message);
  const url = phone
    ? `https://wa.me/91${phone}?text=${encoded}`
    : `https://wa.me/?text=${encoded}`;
  return (
    <a href={url} target="_blank" rel="noreferrer" style={{
      flex: 1, padding: "11px",
      borderRadius: 50, border: "none",
      background: T.wa, color: T.white,
      fontFamily: font.display, fontSize: 14, fontWeight: 700,
      textDecoration: "none", textAlign: "center",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      boxShadow: "0 4px 16px rgba(37,211,102,0.35)",
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.136.562 4.14 1.534 5.876L0 24l6.334-1.521A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.656-.493-5.193-1.355l-.372-.219-3.861.928.967-3.758-.24-.386A9.937 9.937 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
      </svg>
      Send on WhatsApp
    </a>
  );
};

// ─── TEMPLATE CARD ────────────────────────────────────────────────
const TemplateCard = ({ template, lang }) => {
  const hi = lang === "hi";
  const [values,   setValues]   = useState({});
  const [expanded, setExpanded] = useState(false);
  const [msgLang,  setMsgLang]  = useState(hi ? "hi" : "en");

  const rawTemplate  = msgLang === "hi" ? template.templateHi : template.templateEn;
  const filledMsg    = fillTemplate(rawTemplate, values);
  const allFilled    = template.fields.every(f => values[f.key]?.trim());
  const catColor     = template.category === "si" ? T.sky : T.saffron;
  const catDim       = template.category === "si" ? T.skyDim : T.saffronDim;

  return (
    <Card style={{ marginBottom: 14 }}>
      {/* Header */}
      <button onClick={() => setExpanded(!expanded)} style={{
        width: "100%", padding: "14px 16px",
        background: "none", border: "none", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 12, textAlign: "left",
      }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: catDim,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>{template.icon}</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: font.display, fontSize: 15, fontWeight: 700,
            marginBottom: 3,
          }}>
            {hi ? template.labelHi : template.labelEn}
          </div>
          <div style={{ fontFamily: font.mono, fontSize: 10, color: catColor, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {template.category === "si" ? "SI" : "TECHNICIAN"} · {template.fields.length} fields
          </div>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5">
          <polyline points={expanded ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
        </svg>
      </button>

      {expanded && (
        <div style={{ borderTop: `1px solid ${T.border}` }}>
          {/* Fields */}
          <div style={{ padding: "14px 16px 0" }}>
            <div style={{
              fontFamily: font.mono, fontSize: 10, color: T.muted,
              letterSpacing: "0.1em", marginBottom: 12,
            }}>FILL IN THE DETAILS</div>
            {template.fields.map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <div style={{
                  fontFamily: font.mono, fontSize: 10, color: T.muted,
                  letterSpacing: "0.08em", marginBottom: 6,
                }}>{(hi ? f.labelHi : f.labelEn).toUpperCase()}</div>
                <input
                  value={values[f.key] || ""}
                  onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{
                    width: "100%", padding: "10px 14px",
                    border: `2px solid ${values[f.key] ? catColor : T.border}`,
                    borderRadius: 10, outline: "none",
                    fontFamily: font.body, fontSize: 14, color: T.ink,
                    background: T.white, transition: "border-color 0.2s",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Lang toggle for message */}
          <div style={{ padding: "0 16px 12px", display: "flex", gap: 6 }}>
            {["hi", "en"].map(l => (
              <button key={l} onClick={() => setMsgLang(l)} style={{
                padding: "5px 14px", borderRadius: 20,
                border: `2px solid ${msgLang === l ? catColor : T.border}`,
                background: msgLang === l ? catDim : T.white,
                color: msgLang === l ? catColor : T.muted,
                fontFamily: font.mono, fontSize: 11, fontWeight: 700,
                cursor: "pointer", transition: "all 0.18s",
              }}>
                {l === "hi" ? "हिंदी" : "English"}
              </button>
            ))}
          </div>

          {/* Preview */}
          <div style={{ margin: "0 16px 14px" }}>
            <div style={{
              fontFamily: font.mono, fontSize: 10, color: T.muted,
              letterSpacing: "0.1em", marginBottom: 8,
            }}>MESSAGE PREVIEW</div>
            <div style={{
              background: "#f0faf0",
              border: `1px solid ${T.green}30`,
              borderRadius: 12,
              padding: "14px",
              fontFamily: font.body,
              fontSize: 13,
              lineHeight: 1.8,
              color: T.ink,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              maxHeight: 240,
              overflowY: "auto",
              position: "relative",
            }}>
              {/* WA bubble tail */}
              <div style={{
                position: "absolute", top: 12, left: -7,
                width: 14, height: 14,
                background: "#f0faf0",
                clipPath: "polygon(100% 0, 100% 100%, 0 50%)",
                border: `1px solid ${T.green}30`,
              }} />
              {filledMsg}
            </div>
          </div>

          {/* Actions */}
          <div style={{ padding: "0 16px 16px", display: "flex", gap: 8 }}>
            <WABtn message={filledMsg} />
            <CopyBtn text={filledMsg} />
          </div>

          {!allFilled && (
            <div style={{
              margin: "0 16px 14px",
              padding: "9px 12px",
              background: T.saffronDim, borderRadius: 10,
              fontSize: 12, color: "#7a4a1a", fontFamily: font.mono,
            }}>
              ⚠️ Fill all fields for a complete message
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────
const CATEGORIES = [
  { id: "ALL",        label: "All Templates" },
  { id: "si",         label: "SI / Contractor" },
  { id: "technician", label: "Technician" },
];

export default function WhatsAppTemplates() {
  const [lang,   setLang]   = useState("hi");
  const [catFilter, setCatFilter] = useState("ALL");

  const hi = lang === "hi";

  const filtered = Object.values(TEMPLATES).filter(t =>
    catFilter === "ALL" || t.category === catFilter
  );

  return (
    <>
      <Fonts />
      <div style={{ minHeight: "100vh", background: T.paper, display: "flex", flexDirection: "column", alignItems: "center" }}>

        {/* Top bar */}
        <div style={{
          width: "100%", maxWidth: 520,
          padding: "12px 16px",
          background: T.paper,
          borderBottom: `1px solid ${T.border}`,
          position: "sticky", top: 0, zIndex: 40,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.08em" }}>
            SITE WORK NETWORK
          </div>
          <div style={{ display: "flex", gap: 2, background: T.white, border: `1px solid ${T.border}`, borderRadius: 20, padding: 3 }}>
            {["hi", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{
                padding: "3px 10px", borderRadius: 14, border: "none",
                background: lang === l ? T.saffron : "transparent",
                color: lang === l ? T.white : T.muted,
                fontFamily: font.mono, fontSize: 11, fontWeight: 700,
                cursor: "pointer", transition: "all 0.2s",
              }}>{l === "hi" ? "हि" : "EN"}</button>
            ))}
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 520, padding: "20px 16px 40px" }}>

          {/* Header */}
          <div className="fade-up" style={{ marginBottom: 20 }}>
            <div style={{ fontFamily: font.mono, fontSize: 11, color: T.wa, letterSpacing: "0.1em", marginBottom: 6 }}>
              WHATSAPP TEMPLATES
            </div>
            <h1 style={{ fontFamily: font.display, fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
              {hi ? "WhatsApp Share Messages" : "WhatsApp Share Messages"}
            </h1>
            <p style={{ fontSize: 13, color: T.muted, lineHeight: 1.65 }}>
              {hi
                ? "सभी pre-filled messages। Details भरें, preview देखें, और WhatsApp पर send करें।"
                : "All pre-filled messages. Fill in details, preview, and send on WhatsApp."}
            </p>
          </div>

          {/* How to use */}
          <Card className="fade-up-1" style={{ marginBottom: 16, background: T.waDim, border: `1px solid ${T.wa}30` }}>
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontFamily: font.display, fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
                💬 {hi ? "कैसे use करें?" : "How to use?"}
              </div>
              {[
                hi ? "Template card tap करें" : "Tap the template card",
                hi ? "Fields में details भरें" : "Fill in the details",
                hi ? "Hindi / English चुनें" : "Choose Hindi or English",
                hi ? "WhatsApp button tap करें" : "Tap the WhatsApp button",
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 5, fontSize: 13, color: T.green }}>
                  <span style={{ fontFamily: font.mono, fontSize: 11, fontWeight: 700, minWidth: 16 }}>{i + 1}.</span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Category filter */}
          <div className="fade-up-2" style={{ display: "flex", gap: 8, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setCatFilter(c.id)} style={{
                flexShrink: 0, padding: "8px 18px", borderRadius: 50,
                border: `2px solid ${catFilter === c.id ? T.wa : T.border}`,
                background: catFilter === c.id ? T.waDim : T.white,
                color: catFilter === c.id ? T.green : T.muted,
                fontFamily: font.mono, fontSize: 11, fontWeight: 700,
                cursor: "pointer", transition: "all 0.18s",
              }}>{c.label}</button>
            ))}
          </div>

          {/* Template count */}
          <div className="fade-up-3" style={{
            fontFamily: font.mono, fontSize: 11, color: T.muted,
            marginBottom: 14, letterSpacing: "0.06em",
          }}>
            {filtered.length} TEMPLATES
          </div>

          {/* Templates */}
          {filtered.map((t, i) => (
            <div key={t.id} className={`fade-up-${Math.min(i + 1, 5)}`}>
              <TemplateCard template={t} lang={lang} />
            </div>
          ))}

          {/* Footer note */}
          <div style={{
            marginTop: 20, padding: "14px 16px",
            background: T.saffronDim, borderRadius: 14,
            border: `1px solid ${T.saffron}30`,
            fontSize: 12, color: "#7a4a1a", lineHeight: 1.65,
          }}>
            <strong>{hi ? "याद रखें:" : "Remember:"}</strong>
            {hi
              ? " Platform payment collect, guarantee, या settle नहीं करता। सभी payment और disputes directly SI और technician के बीच हैं।"
              : " Platform does not collect, guarantee, or settle any payment. All payments and disputes are directly between SI and technician."}
          </div>
        </div>
      </div>
    </>
  );
}
