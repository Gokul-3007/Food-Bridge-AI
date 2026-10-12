/**
 * Calculate the great-circle distance between two points on Earth using Haversine formula
 * @param {number} lat1 Latitude of point 1 in degrees
 * @param {number} lon1 Longitude of point 1 in degrees
 * @param {number} lat2 Latitude of point 2 in degrees
 * @param {number} lon2 Longitude of point 2 in degrees
 * @returns {number} Distance in kilometers rounded to 2 decimal places
 */
export const calculateHaversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 100) / 100;
};

/**
 * Validates and formats GeoJSON Point
 * @param {number} lng Longitude
 * @param {number} lat Latitude
 */
export const formatGeoJSONPoint = (lng, lat) => {
  const numLng = parseFloat(lng);
  const numLat = parseFloat(lat);

  if (isNaN(numLng) || isNaN(numLat) || numLat < -90 || numLat > 90 || numLng < -180 || numLng > 180) {
    throw new Error('Invalid geographic coordinates');
  }

  return {
    type: 'Point',
    coordinates: [numLng, numLat]
  };
};
