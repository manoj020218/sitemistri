export const WORK_TYPES = [
  { id: "NEW_INSTALL",    e: "🔧", hi: "नई Installation",    en: "New Installation" },
  { id: "MAINTENANCE",   e: "🛠",  hi: "Maintenance",        en: "Maintenance" },
  { id: "SERVICE_REPAIR",e: "🔨", hi: "Service / Repair",    en: "Service / Repair" },
  { id: "DVR_NVR",       e: "💾", hi: "DVR/NVR Setup",       en: "DVR/NVR Setup" },
  { id: "IP_CAMERA",     e: "🌐", hi: "IP Camera Config",    en: "IP Camera Config" },
  { id: "LAN_CABLING",   e: "🔌", hi: "LAN / Cabling",       en: "LAN / Cabling" },
  { id: "CAMERA_ANGLE",  e: "📐", hi: "Camera Angle",        en: "Camera Angle" },
  { id: "HDD_ISSUE",     e: "💿", hi: "HDD / Recording",     en: "HDD / Recording" },
  { id: "AMC_VISIT",     e: "📅", hi: "AMC Visit",           en: "AMC Visit" },
  { id: "EMERGENCY",     e: "🚨", hi: "Emergency Visit",     en: "Emergency Visit" },
  { id: "SITE_SURVEY",   e: "📍", hi: "Site Survey",         en: "Site Survey" },
  { id: "OTHER",         e: "📋", hi: "अन्य काम",            en: "Other Work" },
];

export const SKILL_ID_MAP = {
  "CCTV":"CCTV_INSTALLATION", "IP Camera":"IP_CAMERA", "DVR/NVR":"DVR_NVR",
  "LAN Cabling":"LAN_CABLING", "WiFi Bridge":"WIFI_BRIDGE",
  "Biometric":"BIOMETRIC", "Access Control":"ACCESS_CONTROL", "Networking":"NETWORKING",
};

const SKILL_LABEL = {
  CCTV_INSTALLATION:"CCTV", IP_CAMERA:"IP Cam", DVR_NVR:"DVR/NVR",
  LAN_CABLING:"LAN", WIFI_BRIDGE:"WiFi", BIOMETRIC:"Biometric",
  ACCESS_CONTROL:"Access Ctrl", NETWORKING:"Networking", EDGEYE:"EdgEye",
  CAMERA_SERVICE:"Camera Svc",
};

const VEHICLE_EMOJI = { BIKE:"🏍", SCOOTER:"🛵", CAR:"🚗", NONE:"🚶" };
const EXP_LABEL = { NEW:"नया", "1_PLUS":"1-2 yr", "3_PLUS":"3-4 yr", "5_PLUS":"5-9 yr", "10_PLUS":"10+ yr" };

export const normalizeTech = (t) => {
  const mins = t.currentLocation?.updatedAt
    ? Math.floor((Date.now() - new Date(t.currentLocation.updatedAt)) / 60000)
    : null;
  const locationAge = mins === null ? "–"
    : mins < 2 ? "अभी"
    : mins < 60 ? `${mins} min पहले`
    : `${Math.floor(mins/60)} घंटा पहले`;
  return {
    ...t,
    name: t.user?.name || t.name || "Technician",
    mobile: t.user?.mobile || t.mobile || "",
    skillIds: t.skills || [],                                    // raw IDs for client-side filtering
    skills: (t.skills || []).map(s => SKILL_LABEL[s] || s),    // labels for display
    workTypes: t.workTypes || [],                                // work type IDs for filtering
    vehicle: VEHICLE_EMOJI[t.vehicle] || "🚶",
    experience: EXP_LABEL[t.experienceLevel] || "–",
    completedWork: t.trustStats?.completedSiteWork || 0,
    uniqueSIs: t.trustStats?.uniqueSIs || 0,
    avgRating: t.trustStats?.averageRating > 0 ? t.trustStats.averageRating.toFixed(1) : "–",
    openWork: t.trustStats?.overdueOpenWork || 0,
    distanceKm: typeof t.distanceKm === "number" ? t.distanceKm.toFixed(1) : "?",
    locationAge,
    techUserId: t.userId,
  };
};

export const SI_SERVICE_CATS = [
  { id:"CCTV_SURVEILLANCE",   l:"CCTV Surveillance" },
  { id:"ACCESS_CONTROL",      l:"Access Control" },
  { id:"NETWORKING",          l:"Networking / LAN" },
  { id:"FIRE_ALARM",          l:"Fire Alarm" },
  { id:"BIOMETRIC",           l:"Biometric" },
  { id:"HOME_AUTOMATION",     l:"Home Automation" },
  { id:"VIDEO_DOOR_PHONE",    l:"Video Door Phone" },
  { id:"SOLAR_SECURITY",      l:"Solar + Security" },
  { id:"IP_SURVEILLANCE",     l:"IP Surveillance" },
  { id:"INTERCOM",            l:"Intercom" },
  { id:"WIFI_NETWORKING",     l:"WiFi Networking" },
  { id:"AMC_SERVICES",        l:"AMC Services" },
];

export const STATUS_MAP = {
  DRAFT:               { hi: "Draft",             en: "Draft",           color: "ink" },
  PENDING_ACCEPTANCE:  { hi: "Pending",           en: "Pending",         color: "warn" },
  ACCEPTED:            { hi: "Accepted",          en: "Accepted",        color: "sky" },
  REJECTED:            { hi: "Rejected",          en: "Rejected",        color: "error" },
  ON_THE_WAY:          { hi: "On The Way",        en: "On The Way",      color: "sky" },
  REACHED:             { hi: "Site पर पहुंचा",   en: "Reached",         color: "sky" },
  WORK_STARTED:        { hi: "काम शुरू",          en: "Work Started",    color: "saffron" },
  COMPLETED:           { hi: "Complete — Review", en: "Complete—Review", color: "saffron" },
  CLOSED:              { hi: "Closed",            en: "Closed",          color: "green" },
  CANCELLED:           { hi: "Cancelled",         en: "Cancelled",       color: "error" },
};
