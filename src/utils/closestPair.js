import { haversineDistance } from './distance.js';

/**
 * Find the closest pair of points using the appropriate algorithm.
 * - Brute force for n < 1000
 * - Divide and conquer for n >= 1000
 *
 * @param {Array<{lat: number, lon: number}>} points
 * @returns {{ point1: object, point2: object, distance: number }}
 */
export function findClosestPair(points) {
  if (points.length < 2) {
    return null;
  }

  if (points.length < 1000) {
    return bruteForceClosest(points);
  }

  return divideAndConquerClosest(points);
}

/**
 * Brute force O(n²) closest pair.
 */
export function bruteForceClosest(points) {
  let minDist = Infinity;
  let pair = null;

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const d = haversineDistance(
        points[i].lat,
        points[i].lon,
        points[j].lat,
        points[j].lon
      );
      if (d < minDist) {
        minDist = d;
        pair = { point1: points[i], point2: points[j], distance: d };
      }
    }
  }

  return pair;
}

/**
 * Divide and conquer O(n log n) closest pair using Haversine distance.
 * We project lat/lon onto a plane-like sorting for the divide step,
 * but all actual distance computations use Haversine.
 */
export function divideAndConquerClosest(points) {
  // Sort by latitude (x-axis equivalent)
  const sortedByLat = [...points].sort((a, b) => a.lat - b.lat);
  // Pre-sort by longitude for strip processing
  const sortedByLon = [...points].sort((a, b) => a.lon - b.lon);

  return closestRec(sortedByLat, sortedByLon);
}

function closestRec(sortedByLat, sortedByLon) {
  const n = sortedByLat.length;

  // Base case: brute force for small sets
  if (n <= 3) {
    return bruteForceClosest(sortedByLat);
  }

  const mid = Math.floor(n / 2);
  const midPoint = sortedByLat[mid];

  // Split into left and right halves
  const leftByLat = sortedByLat.slice(0, mid);
  const rightByLat = sortedByLat.slice(mid);

  // Build sorted-by-lon arrays for each half
  const leftSet = new Set(leftByLat);
  const leftByLon = sortedByLon.filter((p) => leftSet.has(p));
  const rightByLon = sortedByLon.filter((p) => !leftSet.has(p));

  // Recurse on each half
  const leftResult = closestRec(leftByLat, leftByLon);
  const rightResult = closestRec(rightByLat, rightByLon);

  // Take the smaller of the two
  let best;
  if (!leftResult) best = rightResult;
  else if (!rightResult) best = leftResult;
  else best = leftResult.distance <= rightResult.distance ? leftResult : rightResult;

  if (!best) return null;

  let delta = best.distance;

  // Build strip: points within delta meters of the midpoint latitude.
  // Convert delta (meters) to approximate degrees for filtering.
  const deltaDeg = delta / 111320; // ~111.32 km per degree latitude
  const strip = sortedByLon.filter(
    (p) => Math.abs(p.lat - midPoint.lat) < deltaDeg
  );

  // Check strip pairs (at most 7 comparisons per point)
  for (let i = 0; i < strip.length; i++) {
    for (
      let j = i + 1;
      j < strip.length && strip[j].lon - strip[i].lon < deltaDeg;
      j++
    ) {
      const d = haversineDistance(
        strip[i].lat,
        strip[i].lon,
        strip[j].lat,
        strip[j].lon
      );
      if (d < delta) {
        delta = d;
        best = { point1: strip[i], point2: strip[j], distance: d };
      }
    }
  }

  return best;
}
