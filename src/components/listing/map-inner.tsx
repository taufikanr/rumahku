"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { LANDMARKS } from "@/lib/constants";
import { formatRM } from "@/lib/format";

export interface MapListing {
  id: string;
  title: string;
  areaName: string;
  lat: number;
  lng: number;
  price: number;
  scamLevel: "safe" | "caution" | "high";
}

const PIN_COLOR: Record<MapListing["scamLevel"], string> = {
  safe: "#16a34a",
  caution: "#d97706",
  high: "#dc2626",
};

function priceIcon(l: MapListing) {
  const color = PIN_COLOR[l.scamLevel];
  return L.divIcon({
    className: "",
    html: `<div style="transform:translate(-50%,-100%);white-space:nowrap;background:#fff;border:2px solid ${color};color:#0f3a6b;font-weight:700;font-size:12px;border-radius:9999px;padding:2px 8px;box-shadow:0 1px 4px rgba(0,0,0,.25)">${formatRM(
      l.price,
    )}</div>`,
    iconSize: [0, 0],
  });
}

const umsIcon = L.divIcon({
  className: "",
  html: `<div style="transform:translate(-50%,-50%);background:#1e5cad;color:#fff;font-weight:700;font-size:11px;border-radius:9999px;padding:3px 9px;box-shadow:0 1px 4px rgba(0,0,0,.3)">🎓 UMS</div>`,
  iconSize: [0, 0],
});

function FitBounds({ points }: { points: MapListing[] }) {
  const map = useMap();
  const pts: [number, number][] = [
    [LANDMARKS.ums.lat, LANDMARKS.ums.lng],
    ...points.map((p) => [p.lat, p.lng] as [number, number]),
  ];
  if (pts.length > 1) {
    map.fitBounds(L.latLngBounds(pts), { padding: [40, 40], maxZoom: 14 });
  }
  return null;
}

export default function MapInner({ listings }: { listings: MapListing[] }) {
  return (
    <MapContainer
      center={[LANDMARKS.ums.lat, LANDMARKS.ums.lng]}
      zoom={12}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={listings} />

      <Marker position={[LANDMARKS.ums.lat, LANDMARKS.ums.lng]} icon={umsIcon} />

      {listings.map((l) => (
        <Marker key={l.id} position={[l.lat, l.lng]} icon={priceIcon(l)}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong>{l.title}</strong>
              <div style={{ color: "#666", fontSize: 12, margin: "2px 0 6px" }}>
                {l.areaName} · {formatRM(l.price)}/mo
              </div>
              <a
                href={`/listing/${l.id}`}
                style={{ color: "#1e5cad", fontWeight: 600, fontSize: 13 }}
              >
                View listing →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
