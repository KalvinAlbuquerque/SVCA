// frontend-svca/src/components/MapComponent.tsx
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Workaround para ícones de marcador quebrados no Webpack/Vite
// Opção 1a: Usando @ts-ignore
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

// Opção 1b: Usando 'as any' (alternativa, mas @ts-ignore é mais conciso aqui)
// (L.Icon.Default.prototype as any)._getIconUrl = undefined; // Melhor que delete para TS

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface MapComponentProps {
  latitude: number;
  longitude: number;
  popupText?: string;
  zoom?: number;
}

const MapComponent: React.FC<MapComponentProps> = ({ latitude, longitude, popupText, zoom = 15 }) => {
  const position: [number, number] = [latitude, longitude];

  return (
    <MapContainer center={position} zoom={zoom} scrollWheelZoom={false} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        {popupText && <Popup>{popupText}</Popup>}
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;