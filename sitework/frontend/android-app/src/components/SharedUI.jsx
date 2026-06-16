import { T, font } from "../utils/theme";

export const Fonts = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body{background:${T.paper};font-family:${font.body};color:${T.ink};overscroll-behavior-y:none;}
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
    @keyframes ping{0%{transform:scale(1);opacity:.8;}100%{transform:scale(2.2);opacity:0;}}
    @keyframes spin{to{transform:rotate(360deg);}}
    @keyframes slideIn{from{transform:translateY(100%);opacity:0;}to{transform:translateY(0);opacity:1;}}
    @keyframes locPulse{0%,100%{opacity:1;}50%{opacity:.25;}}
    .fade-up{animation:fadeUp .35s ease both;}
    .fade-up-1{animation:fadeUp .35s .05s ease both;}
    .fade-up-2{animation:fadeUp .35s .10s ease both;}
    .fade-up-3{animation:fadeUp .35s .15s ease both;}
    .slide-in{animation:slideIn .32s ease both;}
    input[type=range]{-webkit-appearance:none;width:100%;height:6px;border-radius:3px;background:${T.border};outline:none;}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:${T.saffron};cursor:pointer;box-shadow:0 2px 8px rgba(232,99,10,.4);}
  `}</style>
);

export const Card = ({ children, style, onClick }) => (
  <div onClick={onClick} style={{ background:T.white, borderRadius:16, border:`1px solid ${T.border}`, boxShadow:"0 2px 12px rgba(0,0,0,.05)", overflow:"hidden", cursor:onClick?"pointer":"default", ...style }}>
    {children}
  </div>
);

export const Tag = ({ label, color="saffron" }) => {
  const c = { saffron:{bg:T.saffronDim,text:T.saffron}, green:{bg:T.greenDim,text:T.green}, sky:{bg:T.skyDim,text:T.sky}, ink:{bg:"#e8e4dc",text:T.ink}, warn:{bg:T.warnDim,text:T.warn}, error:{bg:T.errorDim,text:T.error} }[color];
  return <span style={{ display:"inline-block", padding:"3px 10px", borderRadius:20, background:c.bg, color:c.text, fontFamily:font.mono, fontSize:10, fontWeight:700, letterSpacing:".06em", textTransform:"uppercase" }}>{label}</span>;
};

export const Stars = ({ n }) => <span style={{ color:"#f5a623", letterSpacing:1 }}>{"★".repeat(n)}{"☆".repeat(5-n)}</span>;

export const Spinner = () => (
  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
    <div style={{ width:32, height:32, border:`3px solid ${T.border}`, borderTopColor:T.saffron, borderRadius:"50%", animation:"spin .8s linear infinite" }} />
  </div>
);

export const Avatar = ({ src, initials, size=40 }) => (
  src
    ? <img src={src} alt="" style={{ width:size, height:size, borderRadius:"50%", objectFit:"cover", border:`2px solid ${T.border}` }} />
    : <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${T.saffron},#c45a08)`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:font.display, fontSize:size*0.36, fontWeight:800, color:T.white }}>
        {initials}
      </div>
);
