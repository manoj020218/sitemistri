import { T, font } from "../../utils/theme";

const NAV = [
  { id:"home",       icon:"🏠", hi:"Home",    en:"Home" },
  { id:"search",     icon:"🔍", hi:"Search",  en:"Search" },
  { id:"my-works",   icon:"📋", hi:"Works",   en:"Works" },
  { id:"profile",    icon:"👤", hi:"Profile", en:"Profile" },
];

export const BottomNav = ({ screen, setScreen, lang, reviewCount }) => {
  const hi = lang === "hi";
  const rootScreen = (s) => NAV.some(n => n.id === s) ? s : "home";
  return (
    <div style={{
      position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",
      width:"100%",maxWidth:420,background:T.white,
      borderTop:`1px solid ${T.border}`,display:"flex",
      paddingBottom:"env(safe-area-inset-bottom,8px)",zIndex:50,
    }}>
      {NAV.map(n=>{
        const active = rootScreen(screen) === n.id
          || (["assign","tech-profile"].includes(screen) && n.id==="search")
          || (screen==="work-detail" && n.id==="my-works")
          || (screen==="pool" && n.id==="profile");
        return (
          <button key={n.id} onClick={()=>setScreen(n.id)} style={{
            flex:1,padding:"10px 4px 6px",background:"none",border:"none",cursor:"pointer",
            display:"flex",flexDirection:"column",alignItems:"center",gap:3,
            position:"relative",
          }}>
            <span style={{ fontSize:20 }}>{n.icon}</span>
            {n.id==="my-works" && reviewCount>0 && (
              <span style={{
                position:"absolute",top:6,right:"calc(50% - 18px)",
                width:16,height:16,borderRadius:"50%",
                background:T.error,color:T.white,
                fontFamily:font.mono,fontSize:9,fontWeight:700,
                display:"flex",alignItems:"center",justifyContent:"center",
                border:`2px solid ${T.white}`,
              }}>{reviewCount}</span>
            )}
            <span style={{
              fontFamily:font.mono,fontSize:9,fontWeight:700,letterSpacing:"0.05em",
              color:active?T.sky:T.muted,
            }}>{hi?n.hi:n.en}</span>
            {active && (
              <div style={{
                position:"absolute",bottom:0,
                width:24,height:3,borderRadius:"3px 3px 0 0",background:T.sky,
              }}/>
            )}
          </button>
        );
      })}
    </div>
  );
};
