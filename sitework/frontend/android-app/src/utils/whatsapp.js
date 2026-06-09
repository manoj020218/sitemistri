export const buildTechProfileMsg = ({ technicianName, skills, city, profileLink }, lang='hi') =>
  lang === 'hi'
    ? `नमस्ते सर,\nमैं ${city} में CCTV / IP Camera field technician हूँ। मैं ${skills} का काम करता हूँ।\n\nProfile देखें:\n${profileLink}\n\nधन्यवाद।\n— ${technicianName}`
    : `Hello Sir,\nI am a CCTV technician in ${city} for ${skills} work.\n\nView profile:\n${profileLink}\n\nThank you.\n— ${technicianName}`;

export const buildTechToClientMsg = ({ clientName, technicianName, technicianMobile, workType, expectedVisitTime, siBusinessName }, lang='hi') =>
  lang === 'hi'
    ? `नमस्ते ${clientName} जी,\nTechnician details:\n\nNaam: ${technicianName}\nMobile: ${technicianMobile}\nKaam: ${workType}\nVisit: ${expectedVisitTime}\n\n— ${siBusinessName}`
    : `Hello ${clientName},\nTechnician details:\n\nName: ${technicianName}\nMobile: ${technicianMobile}\nWork: ${workType}\nVisit: ${expectedVisitTime}\n\n— ${siBusinessName}`;

export const openWhatsApp = (phone, message) => {
  const url = phone
    ? `https://wa.me/91${phone}?text=${encodeURIComponent(message)}`
    : `https://wa.me/?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
};
