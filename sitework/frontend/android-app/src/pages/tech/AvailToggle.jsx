import { useState } from "react";
import { T, font } from "../../utils/theme";

export const AVAIL_OPTIONS = [
  { id:"AVAILABLE_NOW",      dot:T.greenLight, label:"Available Now",      hi:"अभी Available" },
  { id:"AVAILABLE_TODAY",    dot:"#f5a623",    label:"Available Today",    hi:"आज Available" },
  { id:"AVAILABLE_TOMORROW", dot:T.sky,        label:"Avail. Tomorrow",    hi:"कल Available" },
  { id:"BUSY",               dot:T.error,      label:"Busy",               hi:"Busy" },
  { id:"OFFLINE",            dot:T.muted,      label:"Offline",            hi:"Offline" },
];

export const AvailToggle = ({ status, onChange, lang }) => {
  const hi = lang==="hi";
  const [open, setOpen] = useState(false);
  const cur = AVAIL_OPTIONS.find(o=>o.id===status) || AVAIL_OPTIONS[4];
  return (
    <div style={{ position:"relative" }}>
      <button onClick={()=>setOpen(!open)} style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px", borderRadius:50, border:`2px solid ${cur.dot}`, background:T.white, cursor:"pointer", fontFamily:font.display, fontSize:13, fontWeight:700, color:T.ink, transition:"all .2s" }}>
        <span style={{ position:"relative", width:10, height:10, flexShrink:0 }}>
          {status==="AVAILABLE_NOW" && <span style={{ position:"absolute", inset:-2, borderRadius:"50%", background:cur.dot, opacity:.35, animation:"ping 1.5s ease-out infinite" }} />}
          <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:cur.dot }} />
        </span>
        {hi ? cur.hi : cur.label}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={T.muted} strokeWidth="2.5"><polyline points={open?"18 15 12 9 6 15":"6 9 12 15 18 9"}/></svg>
      </button>
      {open && (
        <div className="slide-in" style={{ position:"absolute", top:"calc(100% + 8px)", left:0, background:T.white, borderRadius:14, border:`1px solid ${T.border}`, boxShadow:"0 8px 32px rgba(0,0,0,.12)", zIndex:50, minWidth:200, overflow:"hidden" }}>
          {AVAIL_OPTIONS.map(o=>(
            <button key={o.id} onClick={()=>{onChange(o.id);setOpen(false);}} style={{ width:"100%", padding:"12px 16px", display:"flex", alignItems:"center", gap:10, background:o.id===status?T.paper:T.white, border:"none", cursor:"pointer", fontFamily:font.body, fontSize:14, fontWeight:o.id===status?700:400, color:T.ink, textAlign:"left", transition:"background .15s" }}>
              <span style={{ width:10, height:10, borderRadius:"50%", background:o.dot, flexShrink:0 }} />
              {hi ? o.hi : o.label}
              {o.id===status && <svg style={{marginLeft:"auto"}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
