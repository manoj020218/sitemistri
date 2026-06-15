import { T, font } from "../../utils/theme";

export const LocationModal = ({ lang, onClose }) => {
  const hi = lang === 'hi';
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:9999, background:'rgba(0,0,0,.55)', display:'flex', alignItems:'flex-end', justifyContent:'center' }}>
      <div onClick={e=>e.stopPropagation()} className="slide-in" style={{ background:T.white, borderRadius:'20px 20px 0 0', padding:'8px 20px 40px', width:'100%', maxWidth:480 }}>
        <div style={{ width:40, height:4, borderRadius:2, background:T.border, margin:'12px auto 20px' }} />
        <div style={{ fontSize:36, textAlign:'center', marginBottom:10, animation:'locPulse 1.4s ease-in-out infinite' }}>📍</div>
        <div style={{ fontFamily:font.display, fontSize:18, fontWeight:800, textAlign:'center', marginBottom:6 }}>
          {hi ? 'लोकेशन Access दें' : 'Allow Location Access'}
        </div>
        <div style={{ fontSize:13, color:T.muted, textAlign:'center', marginBottom:20, lineHeight:1.7 }}>
          {hi
            ? 'GPS चालू करें ताकि SI आपको nearby search में देख सके।'
            : 'Enable GPS so SIs can find you in nearby searches.'}
        </div>
        <div style={{ background:T.warnDim, border:`1px solid ${T.warn}30`, borderRadius:12, padding:'12px 14px', marginBottom:10, fontSize:13 }}>
          <div style={{ fontWeight:700, color:T.warn, marginBottom:4 }}>🤖 Android Chrome</div>
          <div style={{ color:T.ink, lineHeight:1.6 }}>
            {hi
              ? 'Address bar में 🔒 → Site settings → Location → Allow'
              : 'Address bar 🔒 → Site settings → Location → Allow'}
          </div>
        </div>
        <div style={{ background:T.skyDim, border:`1px solid ${T.sky}30`, borderRadius:12, padding:'12px 14px', marginBottom:22, fontSize:13 }}>
          <div style={{ fontWeight:700, color:T.sky, marginBottom:4 }}>🍎 iPhone Safari</div>
          <div style={{ color:T.ink, lineHeight:1.6 }}>
            {hi
              ? 'Settings → Safari → Location → Allow'
              : 'Settings → Safari → Location → Allow'}
          </div>
        </div>
        <button onClick={onClose} style={{ width:'100%', padding:'14px', borderRadius:50, border:'none', background:T.saffron, color:T.white, fontFamily:font.display, fontSize:15, fontWeight:700, cursor:'pointer' }}>
          {hi ? 'समझ गया' : 'Got it'}
        </button>
      </div>
    </div>
  );
};
