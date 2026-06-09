const EXP_HI = { NEW:'नए', '1_PLUS':'1+ साल', '3_PLUS':'3+ साल', '5_PLUS':'5+ साल', '10_PLUS':'10+ साल' };
const EXP_EN = { NEW:'new',  '1_PLUS':'1+ year', '3_PLUS':'3+ years', '5_PLUS':'5+ years', '10_PLUS':'10+ years' };
const SKILL_LABELS = {
  CCTV_INSTALLATION:'CCTV Installation', CAMERA_SERVICE:'Camera Service',
  DVR_NVR:'DVR/NVR Setting', IP_CAMERA:'IP Camera Setup',
  LAN_CABLING:'LAN Cabling', WIFI_BRIDGE:'WiFi Bridge',
  BIOMETRIC:'Biometric', ACCESS_CONTROL:'Access Control',
  NETWORKING:'Networking', EDGEYE_SETUP:'EdgEye Setup',
};

const generateBio = (name, { city, skills=[], experienceLevel, tools=[] }) => {
  const skillStr = skills.slice(0,4).map(s => SKILL_LABELS[s] || s).join(', ') || 'CCTV';
  const hasTools = tools.length > 0;
  const expHi    = EXP_HI[experienceLevel] || '';
  const expEn    = EXP_EN[experienceLevel] || '';

  const hi = `${name} ${city} में CCTV / IP Camera technician हैं।${expHi ? ` इन्हें ${expHi} का अनुभव है।` : ''} इनके पास ${skillStr} का काम आता है।${hasTools ? ' इनके पास field work के tools हैं।' : ''} ये nearby client site पर काम के लिए उपलब्ध हैं।`;
  const en = `${name} is a CCTV / IP Camera technician in ${city}${expEn ? ` with ${expEn} of experience` : ''}.  Available for ${skillStr} work.${hasTools ? ' Has field tools available.' : ''} Can visit nearby client sites.`;

  return { hi, en };
};

const calcStrength = (profile) => {
  let pct = 10; // base (name from google)
  if (profile.city)               pct += 10;
  if (profile.skills?.length)     pct += 20;
  if (profile.experienceLevel)    pct += 10;
  if (profile.tools?.length)      pct += 10;
  if (profile.vehicle)            pct += 10;
  if (profile.availability && profile.availability !== 'OFFLINE') pct += 10;
  // +30 after first completed work (handled in sitework controller)
  return Math.min(pct, 100);
};

module.exports = { generateBio, calcStrength };
