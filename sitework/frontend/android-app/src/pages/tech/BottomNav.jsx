import { T, font } from "../../utils/theme";

const NAV = [
  { id:"home", icon:"🏠", hi:"Home",    en:"Home" },
  { id:"active-work", icon:"⚡", hi:"Active", en:"Active" },
  { id:"history", icon:"📋", hi:"History", en:"History" },
  { id:"profile", icon:"👤", hi:"Profile", en:"Profile" },
];

export const BottomNav = ({ screen, setScreen, lang, pendingCount }) => {
  const hi = lang==="hi";
  return (
    <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:420, background:T.white, borderTop:`1px solid ${T.border}`, display:"flex", paddingBottom:"env(safe-area-inset-bottom,8px)", zIndex:50 }}>
      {NAV.map(n=>{
        const active = screen===n.id || (screen==="work-detail"&&n.id==="home");
        return (
          <button key={n.id} onClick={()=>setScreen(n.id)} style={{ flex:1, padding:"10px 4px 6px", background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, position:"relative" }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            {n.id==="home" && pendingCount>0 && (
              <span style={{ position:"absolute", top:6, right:"calc(50% - 16px)", width:16, height:16, borderRadius:"50%", background:T.error, color:T.white, fontFamily:font.mono, fontSize:9, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", border:`2px solid ${T.white}` }}>{pendingCount}</span>
            )}
            <span style={{ fontFamily:font.mono, fontSize:9, fontWeight:700, letterSpacing:".05em", color:active?T.saffron:T.muted }}>{hi?n.hi:n.en}</span>
            {active && <div style={{ position:"absolute", bottom:0, width:24, height:3, borderRadius:"3px 3px 0 0", background:T.saffron }} />}
          </button>
        );
      })}
    </div>
  );
};
