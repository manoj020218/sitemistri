const { searchNearby } = require('../services/discovery.service');
const { ok, err }      = require('../utils/response');

exports.nearby = async (req, res) => {
  try {
    const { siteLocation, radiusKm = 10, requiredSkills = [], workType } = req.body;
    if (!siteLocation?.lat || !siteLocation?.lng)
      return err(res, 'siteLocation.lat and siteLocation.lng required');

    const results = await searchNearby({
      lat: parseFloat(siteLocation.lat),
      lng: parseFloat(siteLocation.lng),
      radiusKm: Math.min(parseFloat(radiusKm), 50),
      requiredSkills,
      workType,
    });

    return ok(res, { results, count: results.length });
  } catch (e) { return err(res, e.message, 500); }
};
