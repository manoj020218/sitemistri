const TechnicianProfile = require('../models/TechnicianProfile.model');

const AVAIL_ACTIVE = ['AVAILABLE_NOW','AVAILABLE_TODAY','AVAILABLE_TOMORROW'];

const rankTechnicians = (techs, requiredSkills = []) =>
  techs.map(tech => {
    let score = 0;
    const avail = tech.availability;
    if (avail === 'AVAILABLE_NOW')      score += 40;
    if (avail === 'AVAILABLE_TODAY')    score += 20;
    if (avail === 'AVAILABLE_TOMORROW') score += 5;

    const ageMin = tech.currentLocation?.updatedAt
      ? (Date.now() - new Date(tech.currentLocation.updatedAt)) / 60000
      : 9999;
    if (ageMin < 5)   score += 20;
    else if (ageMin < 15) score += 15;
    else if (ageMin < 30) score += 10;
    else if (ageMin < 60) score += 5;

    const matched = requiredSkills.filter(s => (tech.skills || []).includes(s)).length;
    score += matched * 5;

    const km = tech._distance || 0;
    if (km < 2)  score += 15;
    else if (km < 5)  score += 10;
    else if (km < 10) score += 5;

    score += Math.min((tech.trustStats?.completedSiteWork || 0) * 1.5, 15);
    score += Math.min((tech.trustStats?.uniqueSIs || 0) * 2, 10);
    score -= (tech.trustStats?.overdueOpenWork || 0) * 10;

    return { ...tech.toObject(), score, distanceKm: km };
  }).sort((a, b) => b.score - a.score);

const searchNearby = async ({ lat, lng, radiusKm = 10, requiredSkills = [], workType }) => {
  const radiusMeters  = radiusKm * 1000;
  const cutoff48h     = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const results = await TechnicianProfile.aggregate([
    {
      $geoNear: {
        near:          { type: 'Point', coordinates: [lng, lat] },
        distanceField: '_distance',
        maxDistance:   radiusMeters,
        spherical:     true,
        query: {
          availability: { $in: [...AVAIL_ACTIVE, 'OFFLINE'] },
          'currentLocation.updatedAt': { $exists: true },
          ...(requiredSkills.length ? { skills: { $in: requiredSkills } } : {}),
        },
      },
    },
    { $limit: 60 },
    {
      $lookup: {
        from: 'users', localField: 'userId', foreignField: '_id', as: 'user',
      },
    },
    { $unwind: '$user' },
    { $match: { 'user.isBlocked': false } },
    {
      $project: {
        userId: 1, city: 1, skills: 1, workTypes: 1, availability: 1,
        currentLocation: 1, trustStats: 1, profileSlug: 1,
        vehicle: 1, experienceLevel: 1,
        'user.name': 1, 'user.mobile': 1,
        _distance: { $divide: ['$_distance', 1000] },
      },
    },
  ]);

  const available = results.filter(r => AVAIL_ACTIVE.includes(r.availability));
  const offline   = results.filter(r =>
    r.availability === 'OFFLINE' &&
    r.currentLocation?.updatedAt &&
    new Date(r.currentLocation.updatedAt) >= cutoff48h
  );

  const rankedAvailable = rankTechnicians(available.map(r => ({ ...r, toObject: () => r })), requiredSkills);
  const rankedOffline   = offline
    .map(r => ({ ...r, distanceKm: r._distance || 0, score: -1, isOffline: true }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  return [...rankedAvailable, ...rankedOffline];
};

const searchByPincode = async ({ pincode, requiredSkills = [] }) => {
  const cutoff48h = new Date(Date.now() - 48 * 60 * 60 * 1000);

  const results = await TechnicianProfile.aggregate([
    {
      $match: {
        pincode,
        availability: { $in: [...AVAIL_ACTIVE, 'OFFLINE'] },
        ...(requiredSkills.length ? { skills: { $in: requiredSkills } } : {}),
      },
    },
    { $limit: 60 },
    {
      $lookup: {
        from: 'users', localField: 'userId', foreignField: '_id', as: 'user',
      },
    },
    { $unwind: '$user' },
    { $match: { 'user.isBlocked': false } },
    {
      $project: {
        userId: 1, city: 1, skills: 1, workTypes: 1, availability: 1,
        currentLocation: 1, trustStats: 1, profileSlug: 1,
        vehicle: 1, experienceLevel: 1, pincode: 1,
        'user.name': 1, 'user.mobile': 1,
      },
    },
  ]);

  const available = results.filter(r => AVAIL_ACTIVE.includes(r.availability));
  const offline   = results.filter(r =>
    r.availability === 'OFFLINE' && (
      !r.currentLocation?.updatedAt ||
      new Date(r.currentLocation.updatedAt) >= cutoff48h
    )
  );

  const rankedAvailable = rankTechnicians(available.map(r => ({ ...r, _distance: 0, toObject: () => r })), requiredSkills);
  const rankedOffline   = offline.map(r => ({ ...r, distanceKm: 0, score: -1, isOffline: true }));

  return [...rankedAvailable, ...rankedOffline];
};

module.exports = { searchNearby, searchByPincode };
