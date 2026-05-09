// src/utils/location.js
export const radiusOptions = [25, 50, 100, 250, 500];

export const getDistanceInKm = (origin, destination) => {
  if (!origin || !destination) return null;

  const earthRadius = 6371;
  const toRadians = (value) => (value * Math.PI) / 180;
  const latDistance = toRadians(destination.lat - origin.lat);
  const lngDistance = toRadians(destination.lng - origin.lng);
  const originLat = toRadians(origin.lat);
  const destinationLat = toRadians(destination.lat);

  const a =
    Math.sin(latDistance / 2) * Math.sin(latDistance / 2) +
    Math.cos(originLat) *
      Math.cos(destinationLat) *
      Math.sin(lngDistance / 2) *
      Math.sin(lngDistance / 2);

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
