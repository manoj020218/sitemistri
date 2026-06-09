import { useState } from "react";

// ─── DESIGN TOKENS ────────────────────────────────────────────────
const T = {
  ink: "#0f0e0c",
  paper: "#f0ede8",
  saffron: "#e8630a",
  saffronDim: "#fde8d4",
  green: "#1a7a4a",
  greenDim: "#d4f0e2",
  sky: "#1a5fa8",
  skyDim: "#daeaf8",
  border: "#e0d8cc",
  muted: "#6b6258",
  white: "#ffffff",
  error: "#c0392b",
  errorDim: "#fdecea",
  warn: "#b8860b",
  warnDim: "#fff8e1",
  sidebar: "#141210",
  sidebarActive: "#2a2520",
  sidebarText: "rgba(255,255,255,0.55)",
  sidebarActiveText: "#ffffff",
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
    @keyframes fadeUp  { from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);} }
    @keyframes slideIn { from{opacity:0;transform:translateX(20px);}to{opacity:1;transform:translateX(0);} }
    @keyframes pulse   { 0%,100%{opacity:1;}50%{opacity:.4;} }
    .fade-up   { animation: fadeUp  .3s ease both; }
    .fade-up-1 { animation: fadeUp  .3s .04s ease both; }
    .fade-up-2 { animation: fadeUp  .3s .08s ease both; }
    .fade-up-3 { animation: fadeUp  .3s .12s ease both; }
    .fade-up-4 { animation: fadeUp  .3s .16s ease both; }
    .fade-up-5 { animation: fadeUp  .3s .20s ease both; }
    .slide-in  { animation: slideIn .28s ease both; }

    /* scrollbar */
    ::-webkit-scrollbar { width:5px; height:5px; }
    ::-webkit-scrollbar-track { background:transparent; }
    ::-webkit-scrollbar-thumb { background:${T.border}; border-radius:4px; }

    input:focus, textarea:focus, select:focus { outline:none; }
  `}</style>
);

// ─── MOCK DATA ─────────────────────────────────────────────────────
const USERS = [
  { id:"u1",  name:"Ramesh Kumar",    email:"ramesh@gmail.com",  mobile:"9876543210", roles:["TECH"],     city:"Jaipur",     createdAt:"01 May 2026", lastActive:"28 May 2026", isBlocked:false, mobileStatus:"WORK_VERIFIED",   completedWork:18, openWork:0  },
  { id:"u2",  name:"Suresh Sharma",   email:"suresh@gmail.com",  mobile:"9812345678", roles:["SI"],       city:"Jaipur",     createdAt:"03 May 2026", lastActive:"28 May 2026", isBlocked:false, mobileStatus:"SI_CALL_VERIFIED", completedWork:0,  openWork:2  },
  { id:"u3",  name:"Vikram Singh",    email:"vikram@gmail.com",  mobile:"9765432109", roles:["TECH"],     city:"Jaipur",     createdAt:"05 May 2026", lastActive:"27 May 2026", isBlocked:false, mobileStatus:"WORK_VERIFIED",   completedWork:7,  openWork:1  },
  { id:"u4",  name:"Deepak Meena",    email:"deepak@gmail.com",  mobile:"9898989898", roles:["TECH","SI"],city:"Jaipur",     createdAt:"06 May 2026", lastActive:"26 May 2026", isBlocked:false, mobileStatus:"SELF_ADDED",      completedWork:12, openWork:0  },
  { id:"u5",  name:"Ajay Verma",      email:"ajay@gmail.com",    mobile:"9911223344", roles:["TECH"],     city:"Jaipur",     createdAt:"08 May 2026", lastActive:"25 May 2026", isBlocked:false, mobileStatus:"SELF_ADDED",      completedWork:3,  openWork:0  },
  { id:"u6",  name:"Priya Electronics",email:"priya@gmail.com",  mobile:"9955667788", roles:["SI"],       city:"Jodhpur",    createdAt:"10 May 2026", lastActive:"24 May 2026", isBlocked:false, mobileStatus:"SI_CALL_VERIFIED", completedWork:0,  openWork:1  },
  { id:"u7",  name:"Rajan Patel",     email:"rajan@gmail.com",   mobile:"9001234567", roles:["TECH"],     city:"Kota",       createdAt:"12 May 2026", lastActive:"20 May 2026", isBlocked:true,  mobileStatus:"SELF_ADDED",      completedWork:0,  openWork:0  },
  { id:"u8",  name:"Sanjay Gupta",    email:"sanjay@gmail.com",  mobile:"9988776655", roles:["TECH"],     city:"Udaipur",    createdAt:"15 May 2026", lastActive:"22 May 2026", isBlocked:false, mobileStatus:"SELF_ADDED",      completedWork:1,  openWork:0  },
  { id:"u9",  name:"Metro Surveillance",email:"metro@gmail.com", mobile:"9112233445", roles:["SI"],       city:"Jaipur",     createdAt:"18 May 2026", lastActive:"28 May 2026", isBlocked:false, mobileStatus:"SI_CALL_VERIFIED", completedWork:0,  openWork:3  },
  { id:"u10", name:"Kiran Sharma",    email:"kiran@gmail.com",   mobile:"9823456789", roles:["TECH"],     city:"Bikaner",    createdAt:"20 May 2026", lastActive:"27 May 2026", isBlocked:false, mobileStatus:"SELF_ADDED",      completedWork:0,  openWork:0  },
];

const SITE_WORKS = [
  { id:"sw001", siName:"Suresh Sharma",      techName:"Ramesh Kumar",   workType:"IP Camera Config",    city:"Jaipur",  status:"CLOSED",             createdAt:"26 May 2026", closedAt:"26 May 2026", charge:1200 },
  { id:"sw002", siName:"Suresh Sharma",      techName:"Vikram Singh",   workType:"DVR/NVR Setup",       city:"Jaipur",  status:"WORK_STARTED",       createdAt:"27 May 2026", closedAt:null,          charge:800  },
  { id:"sw003", siName:"Metro Surveillance", techName:"Deepak Meena",   workType:"CCTV Installation",   city:"Jaipur",  status:"ACCEPTED",           createdAt:"28 May 2026", closedAt:null,          charge:2500 },
  { id:"sw004", siName:"Priya Electronics",  techName:"Ajay Verma",     workType:"LAN Cabling",         city:"Jodhpur", status:"CLOSED",             createdAt:"25 May 2026", closedAt:"25 May 2026", charge:900  },
  { id:"sw005", siName:"Metro Surveillance", techName:"Ramesh Kumar",   workType:"Camera Service",      city:"Jaipur",  status:"CLOSED",             createdAt:"22 May 2026", closedAt:"22 May 2026", charge:600  },
  { id:"sw006", siName:"Suresh Sharma",      techName:"Deepak Meena",   workType:"Biometric Setup",     city:"Jaipur",  status:"PENDING_ACCEPTANCE", createdAt:"28 May 2026", closedAt:null,          charge:1500 },
  { id:"sw007", siName:"Priya Electronics",  techName:"Kiran Sharma",   workType:"WiFi Bridge",         city:"Bikaner", status:"CANCELLED",          createdAt:"20 May 2026", closedAt:null,          charge:700  },
  { id:"sw008", siName:"Metro Surveillance", techName:"Vikram Singh",   workType:"Site Survey",         city:"Jaipur",  status:"OVERDUE",            createdAt:"15 May 2026", closedAt:null,          charge:400  },
];

const PROOF_PHOTOS = [
  { id:"pp1", workId:"sw002", techName:"Vikram Singh",  uploadedAt:"27 May 2026, 3:00 PM",  status:"TEMP_STORED", expiresIn:"5 days",  sizeKb:380 },
  { id:"pp2", workId:"sw003", techName:"Deepak Meena",  uploadedAt:"28 May 2026, 12:40 PM", status:"TEMP_STORED", expiresIn:"6 days",  sizeKb:310 },
  { id:"pp3", workId:"sw001", techName:"Ramesh Kumar",  uploadedAt:"26 May 2026, 1:30 PM",  status:"DELETED",     expiresIn:null,      sizeKb:0   },
  { id:"pp4", workId:"sw004", techName:"Ajay Verma",    uploadedAt:"25 May 2026, 4:00 PM",  status:"DELETED",     expiresIn:null,      sizeKb:0   },
  { id:"pp5", workId:"sw006", techName:"Deepak Meena",  uploadedAt:null,                    status:"NONE",        expiresIn:null,      sizeKb:0   },
];

const CITY_STATS = [
  { city:"Jaipur",   techs:6, sis:3, totalWork:18, closedWork:14, openWork:4  },
  { city:"Jodhpur",  techs:1, sis:1, totalWork:3,  closedWork:2,  openWork:1  },
  { city:"Kota",     techs:1, sis:0, totalWork:0,  closedWork:0,  openWork:0  },
  { city:"Udaipur",  techs:1, sis:0, totalWork:1,  closedWork:1,  openWork:0  },
  { city:"Bikaner",  techs:1, sis:0, totalWork:1,  closedWork:0,  openWork:1  },
];

// ─── SHARED UI ─────────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{
    background:T.white, borderRadius:14,
    border:`1px solid ${T.border}`,
    boxShadow:"0 2px 10px rgba(0,0,0,0.04)",
    overflow:"hidden", ...style,
  }}>{children}</div>
);

const Tag = ({ label, color="sky" }) => {
  const c = {
    sky:    {bg:T.skyDim,    text:T.sky},
    green:  {bg:T.greenDim,  text:T.green},
    saffron:{bg:T.saffronDim,text:T.saffron},
    error:  {bg:T.errorDim,  text:T.error},
    warn:   {bg:T.warnDim,   text:T.warn},
    ink:    {bg:"#e8e4dc",   text:T.ink},
    muted:  {bg:"#f0ede8",   text:T.muted},
  }[color]||{bg:T.skyDim,text:T.sky};
  return (
    <span style={{
      display:"inline-block", padding:"2px 9px", borderRadius:20,
      background:c.bg, color:c.text,
      fontFamily:font.mono, fontSize:10, fontWeight:700,
      letterSpacing:"0.06em", textTransform:"uppercase", whiteSpace:"nowrap",
    }}>{label}</span>
  );
};

const StatCard = ({ icon, value, label, sub, color=T.saffron, className }) => (
  <Card className={className} style={{ padding:"16px 14px" }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
      <span style={{ fontSize:22 }}>{icon}</span>
      <div style={{ fontFamily:font.mono, fontSize:22, fontWeight:700, color, lineHeight:1 }}>{value}</div>
    </div>
    <div style={{ fontFamily:font.display, fontSize:13, fontWeight:700, marginBottom:2 }}>{label}</div>
    {sub && <div style={{ fontSize:11, color:T.muted }}>{sub}</div>}
  </Card>
);

const SearchBar = ({ value, onChange, placeholder }) => (
  <div style={{
    display:"flex", alignItems:"center", gap:8,
    background:T.white, border:`1px solid ${T.border}`,
    borderRadius:10, padding:"9px 14px",
    marginBottom:14,
  }}>
    <span style={{ fontSize:15, flexShrink:0 }}>🔍</span>
    <input
      value={value} onChange={e=>onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        flex:1, border:"none", background:"transparent",
        fontFamily:font.body, fontSize:14, color:T.ink,
      }}
    />
    {value && (
      <button onClick={()=>onChange("")} style={{ background:"none",border:"none",cursor:"pointer",color:T.muted,fontSize:16 }}>✕</button>
    )}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    PENDING_ACCEPTANCE: {l:"Pending",      c:"warn"},
    ACCEPTED:           {l:"Accepted",     c:"sky"},
    ON_THE_WAY:         {l:"On The Way",   c:"sky"},
    REACHED:            {l:"Reached",      c:"sky"},
    WORK_STARTED:       {l:"Started",      c:"saffron"},
    COMPLETED:          {l:"Review",       c:"saffron"},
    CLOSED:             {l:"Closed",       c:"green"},
    CANCELLED:          {l:"Cancelled",    c:"error"},
    OVERDUE:            {l:"Overdue ⚠",   c:"error"},
  };
  const s = map[status]||{l:status,c:"muted"};
  return <Tag label={s.l} color={s.c} />;
};

// ─── USER DETAIL MODAL ────────────────────────────────────────────
const UserModal = ({ user, onClose, onBlock }) => {
  if (!user) return null;
  const mobileStatusColor = {
    SELF_ADDED:"warn", SI_CALL_VERIFIED:"sky",
    WORK_VERIFIED:"green", MULTI_SI_VERIFIED:"green",
  }[user.mobileStatus]||"muted";

  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,0.5)",
      display:"flex", alignItems:"flex-end", justifyContent:"center",
    }} onClick={onClose}>
      <div className="slide-in" onClick={e=>e.stopPropagation()} style={{
        width:"100%", maxWidth:520,
        background:T.white, borderRadius:"20px 20px 0 0",
        padding:"24px 20px 32px",
        maxHeight:"85vh", overflowY:"auto",
      }}>
        {/* Handle */}
        <div style={{ width:40,height:4,borderRadius:2,background:T.border,margin:"0 auto 20px" }} />

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16 }}>
          <div>
            <div style={{ fontFamily:font.display, fontSize:20, fontWeight:800 }}>{user.name}</div>
            <div style={{ fontSize:13, color:T.muted, marginTop:2 }}>{user.email}</div>
          </div>
          <div style={{ display:"flex", gap:6 }}>
            {user.roles.map(r=><Tag key={r} label={r} color={r==="SI"?"sky":"saffron"} />)}
          </div>
        </div>

        {/* Details grid */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
          {[
            { l:"Mobile",       v:user.mobile },
            { l:"City",         v:user.city },
            { l:"Joined",       v:user.createdAt },
            { l:"Last Active",  v:user.lastActive },
            { l:"Completed Work", v:user.completedWork },
            { l:"Open Work",    v:user.openWork },
          ].map(r=>(
            <div key={r.l} style={{ background:T.paper, borderRadius:10, padding:"10px 12px" }}>
              <div style={{ fontFamily:font.mono,fontSize:9,color:T.muted,letterSpacing:"0.08em",marginBottom:4 }}>{r.l.toUpperCase()}</div>
              <div style={{ fontFamily:font.display,fontSize:14,fontWeight:700 }}>{r.v}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:16, display:"flex", gap:8, alignItems:"center" }}>
          <span style={{ fontFamily:font.mono,fontSize:11,color:T.muted }}>MOBILE STATUS:</span>
          <Tag label={user.mobileStatus.replace(/_/g," ")} color={mobileStatusColor} />
        </div>

        {user.isBlocked && (
          <div style={{ background:T.errorDim, borderRadius:10, padding:"10px 14px", marginBottom:16, fontSize:13, color:T.error, fontWeight:700 }}>
            ⛔ This user is currently BLOCKED
          </div>
        )}

        {/* Actions */}
        <div style={{ display:"flex", gap:10 }}>
          <button onClick={()=>{onBlock(user.id,!user.isBlocked);onClose();}} style={{
            flex:1, padding:"12px",
            borderRadius:50, border:"none",
            background: user.isBlocked ? T.green : T.error,
            color:T.white,
            fontFamily:font.display, fontSize:14, fontWeight:700, cursor:"pointer",
          }}>
            {user.isBlocked ? "✓ Unblock User" : "⛔ Block User"}
          </button>
          <button onClick={onClose} style={{
            flex:1, padding:"12px",
            borderRadius:50, border:`1px solid ${T.border}`,
            background:T.white, color:T.muted,
            fontFamily:font.display, fontSize:14, fontWeight:700, cursor:"pointer",
          }}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── SCREEN: OVERVIEW ─────────────────────────────────────────────
const OverviewScreen = () => {
  const totalUsers    = USERS.length;
  const totalTechs    = USERS.filter(u=>u.roles.includes("TECH")).length;
  const totalSIs      = USERS.filter(u=>u.roles.includes("SI")).length;
  const blocked       = USERS.filter(u=>u.isBlocked).length;
  const totalWork     = SITE_WORKS.length;
  const closedWork    = SITE_WORKS.filter(w=>w.status==="CLOSED").length;
  const openWork      = SITE_WORKS.filter(w=>!["CLOSED","CANCELLED"].includes(w.status)).length;
  const overdueWork   = SITE_WORKS.filter(w=>w.status==="OVERDUE").length;
  const tempPhotos    = PROOF_PHOTOS.filter(p=>p.status==="TEMP_STORED").length;
  const totalStorageKb= PROOF_PHOTOS.filter(p=>p.status==="TEMP_STORED").reduce((a,p)=>a+p.sizeKb,0);

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.saffron,letterSpacing:"0.1em",marginBottom:6 }}>OVERVIEW</div>
        <h2 style={{ fontFamily:font.display,fontSize:24,fontWeight:800 }}>Dashboard</h2>
      </div>

      {/* User stats */}
      <div style={{ fontFamily:font.mono,fontSize:10,color:T.muted,letterSpacing:"0.1em",marginBottom:10 }}>USERS</div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20 }}>
        <StatCard className="fade-up"   icon="👥" value={totalUsers} label="Total Users"     sub="All registered"         color={T.sky} />
        <StatCard className="fade-up-1" icon="🔧" value={totalTechs} label="Technicians"     sub="Field workers"          color={T.saffron} />
        <StatCard className="fade-up-2" icon="🏢" value={totalSIs}   label="System Integrators" sub="SI / Contractors"    color={T.green} />
        <StatCard className="fade-up-3" icon="⛔" value={blocked}    label="Blocked Users"   sub="Access restricted"      color={T.error} />
      </div>

      {/* Work stats */}
      <div style={{ fontFamily:font.mono,fontSize:10,color:T.muted,letterSpacing:"0.1em",marginBottom:10 }}>SITE WORKS</div>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:20 }}>
        <StatCard className="fade-up"   icon="📋" value={totalWork}  label="Total"   color={T.sky}     />
        <StatCard className="fade-up-1" icon="✅" value={closedWork} label="Closed"  color={T.green}   />
        <StatCard className="fade-up-2" icon="⚡" value={openWork}   label="Open"    color={T.saffron} />
      </div>

      {overdueWork > 0 && (
        <div className="fade-up-3" style={{
          background:T.errorDim, borderRadius:12,
          padding:"12px 14px", marginBottom:20,
          border:`1px solid ${T.error}40`,
          display:"flex",gap:10,alignItems:"center",
        }}>
          <span style={{fontSize:20}}>⚠️</span>
          <div>
            <div style={{fontFamily:font.display,fontSize:14,fontWeight:700,color:T.error}}>{overdueWork} Overdue Site Work</div>
            <div style={{fontSize:12,color:T.muted}}>Technician assigned but no update for 24+ hrs</div>
          </div>
        </div>
      )}

      {/* Storage */}
      <div style={{ fontFamily:font.mono,fontSize:10,color:T.muted,letterSpacing:"0.1em",marginBottom:10 }}>PROOF PHOTO STORAGE</div>
      <Card className="fade-up-4" style={{ padding:"14px 16px",marginBottom:20 }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
          <div>
            <div style={{ fontFamily:font.display,fontSize:14,fontWeight:700 }}>{tempPhotos} Temporary Photos</div>
            <div style={{ fontSize:12,color:T.muted }}>Total: {(totalStorageKb/1024).toFixed(2)} MB stored</div>
          </div>
          <Tag label="AUTO-DELETE ON" color="green" />
        </div>
        <div style={{ height:8,background:T.border,borderRadius:4,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${Math.min((totalStorageKb/5120)*100,100)}%`,background:T.saffron,borderRadius:4,transition:"width 0.6s" }} />
        </div>
        <div style={{ marginTop:6,fontSize:11,color:T.muted,fontFamily:font.mono }}>
          {totalStorageKb} KB / 5120 KB limit shown · Auto-delete after 7 days
        </div>
      </Card>

      {/* Terms version */}
      <div style={{ fontFamily:font.mono,fontSize:10,color:T.muted,letterSpacing:"0.1em",marginBottom:10 }}>PLATFORM CONFIG</div>
      <Card className="fade-up-5" style={{ padding:"14px 16px" }}>
        {[
          { l:"Terms Version",   v:"v1.0", status:"ACTIVE" },
          { l:"Privacy Version", v:"v1.0", status:"ACTIVE" },
          { l:"Platform Mode",   v:"MVP Phase 1", status:"LIVE" },
          { l:"Proof Auto-Delete", v:"7 days", status:"ON" },
        ].map((r,i,arr)=>(
          <div key={r.l}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0" }}>
              <span style={{ fontSize:13,color:T.muted }}>{r.l}</span>
              <div style={{ display:"flex",gap:8,alignItems:"center" }}>
                <span style={{ fontFamily:font.mono,fontSize:12,fontWeight:700 }}>{r.v}</span>
                <Tag label={r.status} color="green" />
              </div>
            </div>
            {i<arr.length-1&&<div style={{height:1,background:T.border}}/>}
          </div>
        ))}
      </Card>
    </div>
  );
};

// ─── SCREEN: USERS ────────────────────────────────────────────────
const UsersScreen = () => {
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [selectedUser, setSelectedUser] = useState(null);
  const [users,      setUsers]      = useState(USERS);

  const handleBlock = (id, block) => {
    setUsers(prev => prev.map(u => u.id===id ? {...u,isBlocked:block} : u));
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.name.toLowerCase().includes(q) || u.mobile.includes(q) || u.email.toLowerCase().includes(q) || u.city.toLowerCase().includes(q);
    const matchRole   = roleFilter==="ALL" || (roleFilter==="TECH"&&u.roles.includes("TECH")) || (roleFilter==="SI"&&u.roles.includes("SI")) || (roleFilter==="BLOCKED"&&u.isBlocked);
    return matchSearch && matchRole;
  });

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.saffron,letterSpacing:"0.1em",marginBottom:6 }}>USERS</div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h2 style={{ fontFamily:font.display,fontSize:22,fontWeight:800 }}>
            All Users <span style={{ fontSize:14,color:T.muted,fontWeight:400 }}>({filtered.length})</span>
          </h2>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="Search name, mobile, city…" />

      {/* Role filter */}
      <div style={{ display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:2 }}>
        {[
          {id:"ALL",    l:"All"},
          {id:"TECH",   l:"Technicians"},
          {id:"SI",     l:"SIs"},
          {id:"BLOCKED",l:"Blocked"},
        ].map(f=>(
          <button key={f.id} onClick={()=>setRoleFilter(f.id)} style={{
            flexShrink:0,padding:"7px 16px",borderRadius:50,
            border:`2px solid ${roleFilter===f.id?T.sky:T.border}`,
            background:roleFilter===f.id?T.skyDim:T.white,
            color:roleFilter===f.id?T.sky:T.muted,
            fontFamily:font.mono,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.18s",
          }}>{f.l}</button>
        ))}
      </div>

      {/* User list */}
      {filtered.map((u,i)=>(
        <Card key={u.id} className={`fade-up-${Math.min(i,4)}`}
          style={{ marginBottom:8, borderLeft:`3px solid ${u.isBlocked?T.error:u.roles.includes("SI")&&!u.roles.includes("TECH")?T.sky:T.saffron}`, cursor:"pointer" }}
          onClick={()=>setSelectedUser(u)}>
          <div style={{ padding:"12px 14px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
              <div>
                <div style={{ fontFamily:font.display,fontSize:15,fontWeight:700 }}>
                  {u.name}
                  {u.isBlocked && <span style={{ fontSize:12,color:T.error,marginLeft:8 }}>⛔</span>}
                </div>
                <div style={{ fontSize:12,color:T.muted }}>
                  📱 {u.mobile} · 📍 {u.city}
                </div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end" }}>
                {u.roles.map(r=><Tag key={r} label={r} color={r==="SI"?"sky":"saffron"} />)}
              </div>
            </div>
            <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
              <span style={{ fontSize:11,color:T.muted }}>✅ {u.completedWork} works</span>
              <span style={{ fontSize:11,color:T.muted }}>📅 Joined {u.createdAt}</span>
              <span style={{ fontSize:11,color:T.muted }}>🕐 Active {u.lastActive}</span>
            </div>
          </div>
        </Card>
      ))}

      {filtered.length===0 && (
        <div style={{ textAlign:"center",padding:"40px 0",color:T.muted,fontSize:14 }}>No users found</div>
      )}

      <UserModal user={selectedUser} onClose={()=>setSelectedUser(null)} onBlock={handleBlock} />
    </div>
  );
};

// ─── SCREEN: SITE WORKS ───────────────────────────────────────────
const SiteWorksScreen = () => {
  const [search,      setSearch]      = useState("");
  const [statusFilter,setStatusFilter]= useState("ALL");

  const statusFilters = [
    {id:"ALL",     l:"All"},
    {id:"OPEN",    l:"Open"},
    {id:"OVERDUE", l:"Overdue"},
    {id:"CLOSED",  l:"Closed"},
    {id:"CANCELLED",l:"Cancelled"},
  ];

  const filtered = SITE_WORKS.filter(w=>{
    const q = search.toLowerCase();
    const matchSearch = !q || w.siName.toLowerCase().includes(q) || w.techName.toLowerCase().includes(q) || w.workType.toLowerCase().includes(q) || w.city.toLowerCase().includes(q);
    const matchStatus =
      statusFilter==="ALL" ? true :
      statusFilter==="OPEN" ? !["CLOSED","CANCELLED"].includes(w.status) :
      statusFilter==="OVERDUE" ? w.status==="OVERDUE" :
      statusFilter==="CLOSED" ? w.status==="CLOSED" :
      statusFilter==="CANCELLED" ? w.status==="CANCELLED" : true;
    return matchSearch && matchStatus;
  });

  const totalCharge = SITE_WORKS.filter(w=>w.status==="CLOSED").reduce((a,w)=>a+w.charge,0);

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.saffron,letterSpacing:"0.1em",marginBottom:6 }}>SITE WORKS</div>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <h2 style={{ fontFamily:font.display,fontSize:22,fontWeight:800 }}>
            Site Works <span style={{ fontSize:14,color:T.muted,fontWeight:400 }}>({filtered.length})</span>
          </h2>
          <div style={{ fontFamily:font.mono,fontSize:11,color:T.green,fontWeight:700 }}>
            ₹{totalCharge.toLocaleString()} closed
          </div>
        </div>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="SI, technician, work type, city…" />

      <div style={{ display:"flex",gap:8,marginBottom:16,overflowX:"auto",paddingBottom:2 }}>
        {statusFilters.map(f=>(
          <button key={f.id} onClick={()=>setStatusFilter(f.id)} style={{
            flexShrink:0,padding:"7px 16px",borderRadius:50,
            border:`2px solid ${statusFilter===f.id?T.sky:T.border}`,
            background:statusFilter===f.id?T.skyDim:T.white,
            color:statusFilter===f.id?T.sky:T.muted,
            fontFamily:font.mono,fontSize:11,fontWeight:700,cursor:"pointer",transition:"all 0.18s",
          }}>{f.l}</button>
        ))}
      </div>

      {filtered.map((w,i)=>(
        <Card key={w.id} className={`fade-up-${Math.min(i,4)}`}
          style={{ marginBottom:8, borderLeft:`3px solid ${w.status==="OVERDUE"?T.error:w.status==="CLOSED"?T.green:T.sky}` }}>
          <div style={{ padding:"12px 14px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
              <div>
                <div style={{ fontFamily:font.display,fontSize:14,fontWeight:700 }}>{w.workType}</div>
                <div style={{ fontSize:12,color:T.muted }}>
                  🏢 {w.siName} → 🔧 {w.techName}
                </div>
              </div>
              <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4 }}>
                <StatusBadge status={w.status} />
                <div style={{ fontFamily:font.mono,fontSize:12,fontWeight:700,color:T.green }}>₹{w.charge}</div>
              </div>
            </div>
            <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
              <span style={{ fontSize:11,color:T.muted }}>📍 {w.city}</span>
              <span style={{ fontSize:11,color:T.muted }}>📅 {w.createdAt}</span>
              <span style={{ fontFamily:font.mono,fontSize:10,color:T.muted }}>#{w.id}</span>
            </div>
          </div>
        </Card>
      ))}

      {filtered.length===0 && (
        <div style={{ textAlign:"center",padding:"40px 0",color:T.muted,fontSize:14 }}>No site works found</div>
      )}
    </div>
  );
};

// ─── SCREEN: CITY ANALYTICS ───────────────────────────────────────
const CityScreen = () => {
  const maxWork = Math.max(...CITY_STATS.map(c=>c.totalWork));

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.saffron,letterSpacing:"0.1em",marginBottom:6 }}>ANALYTICS</div>
        <h2 style={{ fontFamily:font.display,fontSize:22,fontWeight:800 }}>City-wise Stats</h2>
      </div>

      {/* Bar chart */}
      <Card style={{ padding:"16px",marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:10,color:T.muted,letterSpacing:"0.08em",marginBottom:14 }}>SITE WORKS BY CITY</div>
        {CITY_STATS.map((c,i)=>(
          <div key={c.city} className={`fade-up-${Math.min(i,4)}`} style={{ marginBottom:14 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
              <span style={{ fontFamily:font.display,fontSize:13,fontWeight:700 }}>{c.city}</span>
              <div style={{ display:"flex",gap:10 }}>
                <span style={{ fontFamily:font.mono,fontSize:11,color:T.green }}>{c.closedWork} closed</span>
                <span style={{ fontFamily:font.mono,fontSize:11,color:T.saffron }}>{c.openWork} open</span>
              </div>
            </div>
            <div style={{ height:10,background:T.border,borderRadius:5,overflow:"hidden",display:"flex" }}>
              <div style={{
                height:"100%",
                width:`${maxWork>0?(c.closedWork/maxWork)*100:0}%`,
                background:T.green,borderRadius:"5px 0 0 5px",
                transition:"width 0.6s ease",
              }}/>
              <div style={{
                height:"100%",
                width:`${maxWork>0?(c.openWork/maxWork)*100:0}%`,
                background:T.saffron,
                transition:"width 0.6s ease",
              }}/>
            </div>
          </div>
        ))}
        <div style={{ display:"flex",gap:16,marginTop:4 }}>
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <div style={{ width:10,height:10,borderRadius:2,background:T.green }}/> <span style={{ fontSize:11,color:T.muted }}>Closed</span>
          </div>
          <div style={{ display:"flex",gap:6,alignItems:"center" }}>
            <div style={{ width:10,height:10,borderRadius:2,background:T.saffron }}/> <span style={{ fontSize:11,color:T.muted }}>Open</span>
          </div>
        </div>
      </Card>

      {/* City table */}
      {CITY_STATS.map((c,i)=>(
        <Card key={c.city} className={`fade-up-${Math.min(i,4)}`} style={{ marginBottom:10 }}>
          <div style={{ padding:"14px 16px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <div style={{ fontFamily:font.display,fontSize:16,fontWeight:800 }}>{c.city}</div>
              <div style={{ fontFamily:font.mono,fontSize:12,color:T.muted }}>
                {c.totalWork} total works
              </div>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8 }}>
              {[
                {l:"Techs",   v:c.techs,      color:T.saffron},
                {l:"SIs",     v:c.sis,        color:T.sky},
                {l:"Closed",  v:c.closedWork, color:T.green},
                {l:"Open",    v:c.openWork,   color:c.openWork>0?T.saffron:T.muted},
              ].map(s=>(
                <div key={s.l} style={{ background:T.paper,borderRadius:8,padding:"8px 6px",textAlign:"center" }}>
                  <div style={{ fontFamily:font.mono,fontSize:16,fontWeight:700,color:s.color }}>{s.v}</div>
                  <div style={{ fontSize:10,color:T.muted,marginTop:2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// ─── SCREEN: PROOF PHOTOS ─────────────────────────────────────────
const ProofScreen = () => {
  const [photos, setPhotos] = useState(PROOF_PHOTOS);

  const handleDelete = (id) => {
    setPhotos(prev=>prev.map(p=>p.id===id?{...p,status:"DELETED",sizeKb:0,expiresIn:null}:p));
  };

  const stored     = photos.filter(p=>p.status==="TEMP_STORED");
  const deleted    = photos.filter(p=>p.status==="DELETED");
  const totalKb    = stored.reduce((a,p)=>a+p.sizeKb,0);

  return (
    <div>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.saffron,letterSpacing:"0.1em",marginBottom:6 }}>PROOF PHOTOS</div>
        <h2 style={{ fontFamily:font.display,fontSize:22,fontWeight:800 }}>Proof Photo Cleanup</h2>
      </div>

      {/* Storage summary */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16 }}>
        <StatCard className="fade-up"   icon="📷" value={stored.length}  label="Stored"    sub={`${totalKb} KB`}  color={T.saffron} />
        <StatCard className="fade-up-1" icon="🗑" value={deleted.length} label="Deleted"   sub="Metadata kept"    color={T.green} />
        <StatCard className="fade-up-2" icon="⏰" value="7d"             label="Auto-delete" sub="After SI closes" color={T.sky} />
      </div>

      {/* Policy box */}
      <div className="fade-up-3" style={{
        background:T.skyDim, borderRadius:12,
        padding:"12px 14px", marginBottom:16,
        border:`1px solid ${T.sky}30`,
        fontSize:12, color:T.sky, lineHeight:1.65,
      }}>
        <strong>Auto-delete rules:</strong> Photo deleted immediately when SI closes work · Auto-deleted after 7 days if SI inactive · Kept max 15 days if issue reported · Only metadata retained after deletion (no image data)
      </div>

      {/* Photo list */}
      {photos.map((p,i)=>(
        <Card key={p.id} className={`fade-up-${Math.min(i,4)}`}
          style={{ marginBottom:10, borderLeft:`3px solid ${p.status==="TEMP_STORED"?T.saffron:p.status==="DELETED"?T.green:T.border}` }}>
          <div style={{ padding:"12px 14px" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8 }}>
              <div>
                <div style={{ fontFamily:font.display,fontSize:14,fontWeight:700 }}>{p.techName}</div>
                <div style={{ fontSize:12,color:T.muted }}>Work #{p.workId}</div>
              </div>
              <Tag
                label={p.status==="TEMP_STORED"?"STORED":p.status==="DELETED"?"DELETED":"NONE"}
                color={p.status==="TEMP_STORED"?"saffron":p.status==="DELETED"?"green":"muted"}
              />
            </div>

            {p.status==="TEMP_STORED" && (
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
                <div>
                  <div style={{ fontSize:12,color:T.muted }}>📅 {p.uploadedAt}</div>
                  <div style={{ fontSize:12,color:T.warn,fontWeight:700,marginTop:2 }}>
                    ⏰ Expires in {p.expiresIn} · {p.sizeKb} KB
                  </div>
                </div>
                <button onClick={()=>handleDelete(p.id)} style={{
                  padding:"8px 16px",borderRadius:50,
                  border:`1px solid ${T.error}40`,
                  background:T.errorDim, color:T.error,
                  fontFamily:font.display,fontSize:12,fontWeight:700,cursor:"pointer",
                }}>
                  🗑 Force Delete
                </button>
              </div>
            )}

            {p.status==="DELETED" && (
              <div style={{ fontSize:12,color:T.green }}>
                ✓ Deleted · Metadata only retained · {p.uploadedAt?`Uploaded: ${p.uploadedAt}`:"Never uploaded"}
              </div>
            )}

            {p.status==="NONE" && (
              <div style={{ fontSize:12,color:T.muted }}>No photo uploaded yet for this work.</div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

// ─── SCREEN: TERMS MANAGEMENT ─────────────────────────────────────
const TermsScreen = () => {
  const [termsVer,   setTermsVer]   = useState("v1.0");
  const [privacyVer, setPrivacyVer] = useState("v1.0");
  const [saved,      setSaved]      = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(()=>setSaved(false),2200);
  };

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontFamily:font.mono,fontSize:11,color:T.saffron,letterSpacing:"0.1em",marginBottom:6 }}>PLATFORM CONFIG</div>
        <h2 style={{ fontFamily:font.display,fontSize:22,fontWeight:800 }}>Terms Version Management</h2>
      </div>

      <Card className="fade-up" style={{ padding:"16px",marginBottom:16 }}>
        <div style={{ fontFamily:font.mono,fontSize:10,color:T.muted,letterSpacing:"0.08em",marginBottom:14 }}>CURRENT ACTIVE VERSIONS</div>
        {[
          {l:"Terms & Conditions Version", v:termsVer, set:setTermsVer, hint:"Changing version forces all users to re-accept T&C on next login."},
          {l:"Privacy Policy Version",     v:privacyVer,set:setPrivacyVer,hint:"Changing version forces all users to re-accept Privacy Policy."},
        ].map((r,i)=>(
          <div key={r.l} style={{ marginBottom:i===0?16:0 }}>
            <div style={{ fontFamily:font.display,fontSize:14,fontWeight:700,marginBottom:6 }}>{r.l}</div>
            <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:6 }}>
              <input
                value={r.v} onChange={e=>r.set(e.target.value)}
                style={{
                  flex:1, padding:"10px 14px",
                  border:`2px solid ${T.sky}`,
                  borderRadius:10, fontFamily:font.mono,
                  fontSize:15,fontWeight:700, color:T.ink,
                  background:T.white,
                }}
              />
              <Tag label="ACTIVE" color="green" />
            </div>
            <div style={{ fontSize:11,color:T.warn,lineHeight:1.5 }}>⚠️ {r.hint}</div>
            {i===0&&<div style={{height:1,background:T.border,margin:"14px 0"}}/>}
          </div>
        ))}
      </Card>

      <Card className="fade-up-1" style={{ padding:"14px 16px",marginBottom:16,background:T.saffronDim,border:`1px solid ${T.saffron}30` }}>
        <div style={{ fontFamily:font.display,fontSize:14,fontWeight:700,marginBottom:8 }}>📋 Re-acceptance Rules</div>
        {[
          "When T&C version changes, ALL users see acceptance gate on next login.",
          "Users cannot use the app until they accept the new version.",
          "Acceptance record stored: userId, version, timestamp, userAgent.",
          "Old acceptance records are NOT deleted — kept for audit.",
        ].map((r,i)=>(
          <div key={i} style={{ display:"flex",gap:8,marginBottom:6,fontSize:13,color:"#7a4a1a" }}>
            <span>•</span><span>{r}</span>
          </div>
        ))}
      </Card>

      <button onClick={handleSave} style={{
        width:"100%",padding:"14px",borderRadius:50,border:"none",
        background:saved?T.green:T.sky, color:T.white,
        fontFamily:font.display,fontSize:16,fontWeight:700,cursor:"pointer",
        boxShadow:`0 4px 20px ${saved?T.green:T.sky}50`,
        transition:"all 0.25s",marginBottom:24,
      }}>
        {saved ? "✓ Saved!" : "Save Version Config"}
      </button>
    </div>
  );
};

// ─── SIDEBAR NAV ──────────────────────────────────────────────────
const NAV = [
  { id:"overview",  icon:"📊", label:"Overview" },
  { id:"users",     icon:"👥", label:"Users" },
  { id:"works",     icon:"📋", label:"Site Works" },
  { id:"cities",    icon:"🗺️", label:"Cities" },
  { id:"photos",    icon:"📷", label:"Proof Photos" },
  { id:"terms",     icon:"📄", label:"Terms Mgmt" },
];

// ─── ROOT APP ─────────────────────────────────────────────────────
export default function AdminPanel() {
  const [screen,      setScreen]      = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = NAV.find(n=>n.id===screen)||NAV[0];

  const renderScreen = () => {
    switch(screen){
      case "overview": return <OverviewScreen/>;
      case "users":    return <UsersScreen/>;
      case "works":    return <SiteWorksScreen/>;
      case "cities":   return <CityScreen/>;
      case "photos":   return <ProofScreen/>;
      case "terms":    return <TermsScreen/>;
      default:         return <OverviewScreen/>;
    }
  };

  return (
    <>
      <Fonts/>
      <div style={{ minHeight:"100vh", display:"flex", background:T.paper }}>

        {/* ── DESKTOP SIDEBAR (≥600px) ── */}
        <div style={{
          width:220, flexShrink:0,
          background:T.sidebar,
          display:"flex", flexDirection:"column",
          position:"sticky", top:0, height:"100vh",
          // Hidden on mobile via JS below — we'll use a state toggle
        }}>
          <div style={{ padding:"20px 16px 14px" }}>
            <div style={{ fontFamily:font.mono,fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:"0.1em",marginBottom:4 }}>
              SITE WORK NETWORK
            </div>
            <div style={{ fontFamily:font.display,fontSize:16,fontWeight:800,color:T.white }}>
              Admin Panel
            </div>
            <div style={{ marginTop:8,display:"flex",alignItems:"center",gap:6 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:T.greenLight,animation:"pulse 2s ease-in-out infinite" }}/>
              <span style={{ fontFamily:font.mono,fontSize:10,color:"rgba(255,255,255,0.4)" }}>MVP Phase 1 · LIVE</span>
            </div>
          </div>

          <div style={{ height:1,background:"rgba(255,255,255,0.08)",margin:"0 16px" }}/>

          <nav style={{ flex:1,padding:"10px 8px",overflowY:"auto" }}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>{setScreen(n.id);setSidebarOpen(false);}} style={{
                width:"100%",padding:"11px 12px",
                borderRadius:10,border:"none",
                background:screen===n.id?T.sidebarActive:"transparent",
                cursor:"pointer",
                display:"flex",alignItems:"center",gap:10,
                marginBottom:2,
                transition:"background 0.18s",
              }}>
                <span style={{ fontSize:18,flexShrink:0 }}>{n.icon}</span>
                <span style={{
                  fontFamily:font.display,fontSize:14,fontWeight:screen===n.id?700:400,
                  color:screen===n.id?T.white:T.sidebarText,
                }}>{n.label}</span>
                {screen===n.id&&(
                  <div style={{ marginLeft:"auto",width:4,height:4,borderRadius:"50%",background:T.saffron }}/>
                )}
              </button>
            ))}
          </nav>

          <div style={{ padding:"12px 16px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontSize:11,color:"rgba(255,255,255,0.25)",fontFamily:font.mono }}>
              v1.0 · Admin Only
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0 }}>

          {/* Top bar */}
          <div style={{
            padding:"12px 20px",
            background:T.white,
            borderBottom:`1px solid ${T.border}`,
            display:"flex",alignItems:"center",gap:12,
            position:"sticky",top:0,zIndex:30,
          }}>
            <div style={{ fontSize:20 }}>{nav.icon}</div>
            <div style={{ fontFamily:font.display,fontSize:18,fontWeight:800,flex:1 }}>{nav.label}</div>

            {/* Mobile nav dropdown */}
            <div style={{ position:"relative" }}>
              <button onClick={()=>setSidebarOpen(!sidebarOpen)} style={{
                padding:"8px 14px",borderRadius:10,
                border:`1px solid ${T.border}`,
                background:T.white,cursor:"pointer",
                fontFamily:font.mono,fontSize:11,fontWeight:700,
                display:"flex",alignItems:"center",gap:6,color:T.muted,
              }}>
                ☰ Nav
              </button>
              {sidebarOpen && (
                <div className="slide-in" style={{
                  position:"absolute",right:0,top:"calc(100% + 6px)",
                  background:T.sidebar,borderRadius:14,
                  overflow:"hidden",minWidth:180,
                  boxShadow:"0 8px 32px rgba(0,0,0,0.25)",
                  zIndex:100,
                }}>
                  {NAV.map(n=>(
                    <button key={n.id} onClick={()=>{setScreen(n.id);setSidebarOpen(false);}} style={{
                      width:"100%",padding:"12px 16px",
                      background:screen===n.id?"rgba(255,255,255,0.12)":"transparent",
                      border:"none",cursor:"pointer",
                      display:"flex",alignItems:"center",gap:10,
                    }}>
                      <span style={{ fontSize:16 }}>{n.icon}</span>
                      <span style={{ fontFamily:font.display,fontSize:14,color:screen===n.id?T.white:T.sidebarText,fontWeight:screen===n.id?700:400 }}>
                        {n.label}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Page content */}
          <div style={{ flex:1,padding:"20px",maxWidth:760,width:"100%" }}>
            {renderScreen()}
          </div>
        </div>
      </div>
    </>
  );
}
