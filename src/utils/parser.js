/**
 * Parse a text file containing coordinate points.
 * Supports:
 *   - "lat,lon" (comma-separated)
 *   - "lat lon" (space-separated)
 *   - Optional header row (auto-detected)
 *   - Optional third column for parcel/group ID
 *
 * @param {string} text - Raw file content
 * @returns {{ points: Array, skipped: Array, totalLines: number }}
 */
export function parseCoordinates(text) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim() !== '');
  const points = [];
  const skipped = [];
  let hasHeader = false;

  if (lines.length === 0) {
    return { points, skipped, totalLines: 0, hasHeader: false };
  }

  // Detect header: if the first line contains letters that aren't just e/E (scientific notation)
  const firstLine = lines[0].trim();
  if (/[a-df-zA-DF-Z]/.test(firstLine)) {
    hasHeader = true;
  }

  const startIdx = hasHeader ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    try {
      const parsed = parseLine(line, i + 1);
      if (parsed) {
        points.push(parsed);
      }
    } catch (err) {
      skipped.push({ line: i + 1, content: line, reason: err.message });
    }
  }

  return {
    points,
    skipped,
    totalLines: lines.length - (hasHeader ? 1 : 0),
    hasHeader,
  };
}

/**
 * Parse a single line into a coordinate point.
 * @param {string} line
 * @param {number} lineNumber
 * @returns {{ lat: number, lon: number, id: string|null, lineNumber: number }}
 */
function parseLine(line, lineNumber) {
  // Try comma-separated first, then space/tab
  let parts;
  if (line.includes(',')) {
    parts = line.split(',').map((s) => s.trim());
  } else {
    parts = line.split(/\s+/).map((s) => s.trim());
  }

  if (parts.length < 2) {
    throw new Error('Insufficient columns — expected at least lat and lon');
  }

  const lat = parseFloat(parts[0]);
  const lon = parseFloat(parts[1]);
  const id = parts.length >= 3 ? parts.slice(2).join(' ').trim() || null : null;

  if (isNaN(lat) || isNaN(lon)) {
    throw new Error('Non-numeric latitude or longitude value');
  }

  if (lat < -90 || lat > 90) {
    throw new Error(`Latitude ${lat} out of range [-90, 90]`);
  }

  if (lon < -180 || lon > 180) {
    throw new Error(`Longitude ${lon} out of range [-180, 180]`);
  }

  return { lat, lon, id, lineNumber };
}
