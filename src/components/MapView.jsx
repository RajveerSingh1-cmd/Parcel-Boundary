import { useEffect, useMemo, useRef } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';

/* ── Custom marker icons ── */
const defaultIcon = new L.DivIcon({
  html: `<div style="width:10px;height:10px;border-radius:50%;background:#6366f1;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>`,
  className: '',
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

const closestIconA = new L.DivIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#10b981;border:3px solid #fff;box-shadow:0 0 12px rgba(16,185,129,0.6);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const closestIconB = new L.DivIcon({
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#f43f5e;border:3px solid #fff;box-shadow:0 0 12px rgba(244,63,94,0.6);"></div>`,
  className: '',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

/* ── Auto-fit bounds ── */
function FitBounds({ points }) {
  const map = useMap();

  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [points, map]);

  return null;
}

/* ── Reset view control ── */
function ResetViewButton({ points }) {
  const map = useMap();
  const btnRef = useRef(null);

  useEffect(() => {
    const container = L.DomUtil.create('div', 'leaflet-bar leaflet-control');
    const btn = L.DomUtil.create('a', '', container);
    btn.href = '#';
    btn.title = 'Reset View';
    btn.role = 'button';
    btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.51 9a9 9 0 0114.85-3.36L21 8M3 16l2.64 2.36A9 9 0 0020.49 15"/><polyline points="21 3 21 8 16 8"/><polyline points="3 21 3 16 8 16"/></svg>`;
    btn.style.cssText =
      'display:flex;align-items:center;justify-content:center;width:30px;height:30px;cursor:pointer;';

    L.DomEvent.on(btn, 'click', (e) => {
      L.DomEvent.preventDefault(e);
      if (points && points.length > 0) {
        const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lon]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
      }
    });

    const control = L.control({ position: 'topright' });
    control.onAdd = () => container;
    control.addTo(map);
    btnRef.current = control;

    return () => {
      if (btnRef.current) map.removeControl(btnRef.current);
    };
  }, [map, points]);

  return null;
}

export default function MapView({ points, closestPair, darkMode }) {
  /* Group points by parcel ID */
  const parcels = useMemo(() => {
    if (!points) return {};
    const groups = {};
    points.forEach((p) => {
      if (p.id) {
        if (!groups[p.id]) groups[p.id] = [];
        groups[p.id].push(p);
      }
    });
    return groups;
  }, [points]);

  /* Is a point in the closest pair? */
  const isClosestA = (p) =>
    closestPair &&
    p.lat === closestPair.point1.lat &&
    p.lon === closestPair.point1.lon;

  const isClosestB = (p) =>
    closestPair &&
    p.lat === closestPair.point2.lat &&
    p.lon === closestPair.point2.lon;

  const tileUrl = darkMode
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';

  const tileAttr =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

  /* Polygon color palette */
  const polyColors = [
    '#818cf8',
    '#34d399',
    '#f472b6',
    '#fbbf24',
    '#38bdf8',
    '#a78bfa',
    '#fb923c',
    '#2dd4bf',
  ];

  const formatDist = (m) =>
    m >= 1000 ? `${(m / 1000).toFixed(3)} km` : `${m.toFixed(2)} m`;

  return (
    <MapContainer
      center={[40.7128, -74.006]}
      zoom={12}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer url={tileUrl} attribution={tileAttr} />

      {points && <FitBounds points={points} />}
      {points && <ResetViewButton points={points} />}

      {/* Parcel polygons */}
      {Object.entries(parcels).map(([id, pts], idx) => (
        <Polygon
          key={id}
          positions={pts.map((p) => [p.lat, p.lon])}
          pathOptions={{
            color: polyColors[idx % polyColors.length],
            fillColor: polyColors[idx % polyColors.length],
            fillOpacity: 0.12,
            weight: 2,
          }}
        >
          <Popup>
            <span className="font-semibold">Parcel {id}</span>
            <br />
            {pts.length} boundary points
          </Popup>
        </Polygon>
      ))}

      {/* All markers with clustering */}
      {points && points.length > 0 && (
        <MarkerClusterGroup
          chunkedLoading
          maxClusterRadius={40}
          spiderfyOnMaxZoom
          showCoverageOnHover={false}
        >
          {points.map((p, i) => {
            const icon = isClosestA(p)
              ? closestIconA
              : isClosestB(p)
              ? closestIconB
              : defaultIcon;

            return (
              <Marker key={i} position={[p.lat, p.lon]} icon={icon}>
                <Popup>
                  <div className="text-xs space-y-0.5">
                    <p className="font-semibold">
                      {isClosestA(p)
                        ? '⭐ Closest Point A'
                        : isClosestB(p)
                        ? '⭐ Closest Point B'
                        : `Point #${i + 1}`}
                    </p>
                    <p className="font-mono">
                      {p.lat.toFixed(6)}, {p.lon.toFixed(6)}
                    </p>
                    {p.id && <p>Parcel: {p.id}</p>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      )}

      {/* Closest pair line */}
      {closestPair && (
        <Polyline
          positions={[
            [closestPair.point1.lat, closestPair.point1.lon],
            [closestPair.point2.lat, closestPair.point2.lon],
          ]}
          pathOptions={{
            color: '#fbbf24',
            weight: 3,
            dashArray: '8 6',
            opacity: 0.9,
          }}
        >
          <Popup>
            <div className="text-xs">
              <p className="font-semibold mb-1">Closest Pair Distance</p>
              <p className="text-lg font-bold">{formatDist(closestPair.distance)}</p>
            </div>
          </Popup>
        </Polyline>
      )}
    </MapContainer>
  );
}
