import axios from 'axios';
import { calculateHaversineDistance } from '../utils/geo.js';

export const getRouteDirections = async (originLng, originLat, destLng, destLat) => {
  const oLng = parseFloat(originLng);
  const oLat = parseFloat(originLat);
  const dLng = parseFloat(destLng);
  const dLat = parseFloat(destLat);

  const providerUrl = process.env.ROUTING_PROVIDER_URL || 'https://router.project-osrm.org';

  try {
    const url = `${providerUrl}/route/v1/driving/${oLng},${oLat};${dLng},${dLat}?overview=full&geometries=geojson`;
    const response = await axios.get(url, { timeout: 6000 });

    if (
      response.data &&
      response.data.code === 'Ok' &&
      response.data.routes &&
      response.data.routes.length > 0
    ) {
      const route = response.data.routes[0];
      const distanceKm = Math.round((route.distance / 1000) * 100) / 100;
      const durationMin = Math.round(route.duration / 60);

      return {
        success: true,
        isFallback: false,
        distanceKm,
        durationMin,
        coordinates: route.geometry.coordinates, // array of [lng, lat]
        summary: `Road route via OSRM (${distanceKm} km, ~${durationMin} mins)`
      };
    }
  } catch (err) {
    console.warn(`OSRM routing call unavailable (${err.message}). Using fallback routing calculation.`);
  }

  // Fallback straight-line route calculation
  const straightDist = calculateHaversineDistance(oLat, oLng, dLat, dLng);
  const estMinutes = Math.max(1, Math.round((straightDist / 30) * 60)); // assuming 30 km/h avg urban speed

  return {
    success: true,
    isFallback: true,
    distanceKm: straightDist,
    durationMin: estMinutes,
    coordinates: [
      [oLng, oLat],
      [dLng, dLat]
    ],
    summary: `Geographic straight-line estimate (${straightDist} km). External navigation recommended.`
  };
};
