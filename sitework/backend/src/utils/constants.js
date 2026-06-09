const AVAILABILITY = ['AVAILABLE_NOW','AVAILABLE_TODAY','AVAILABLE_TOMORROW','BUSY','OFFLINE'];
const SKILLS       = ['CCTV_INSTALLATION','CAMERA_SERVICE','DVR_NVR','IP_CAMERA','LAN_CABLING',
                      'WIFI_BRIDGE','BIOMETRIC','ACCESS_CONTROL','ALARM_SYSTEM','EDGEYE_SETUP','NETWORKING','OTHER'];
const WORK_STATUS  = ['DRAFT','PENDING_ACCEPTANCE','ACCEPTED','REJECTED','ON_THE_WAY',
                      'REACHED','WORK_STARTED','COMPLETED','CLOSED','CANCELLED_BY_SI',
                      'CANCELLED_BY_TECH','DISPUTED','OVERDUE'];
const FCM_EVENTS   = {
  SITE_WORK_ASSIGNED:   { title:'New Site Work',           body:'You have a new Site Work request' },
  TECH_ACCEPTED:        { title:'Work Accepted',           body:'Technician accepted your Site Work' },
  TECH_REJECTED:        { title:'Work Rejected',           body:'Technician rejected your Site Work' },
  TECH_ON_THE_WAY:      { title:'On The Way',              body:'Technician is on the way to site' },
  TECH_REACHED:         { title:'Technician Reached',      body:'Technician has reached the site' },
  TECH_COMPLETED:       { title:'Review Site Work',        body:'Technician marked work complete — review now' },
  SI_CLOSED:            { title:'Work Closed',             body:'SI has closed the Site Work' },
  CLOSE_REMINDER:       { title:'Action Required',         body:'You have a pending Site Work to close' },
};
module.exports = { AVAILABILITY, SKILLS, WORK_STATUS, FCM_EVENTS };
