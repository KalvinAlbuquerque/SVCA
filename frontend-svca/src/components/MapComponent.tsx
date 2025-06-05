// frontend-svca/src/components/MapComponent.tsx
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Workaround para ícones de marcador quebrados no Webpack/Vite
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Interface para uma única ocorrência no mapa
interface MapOccurrence {
  id: number;
  titulo: string;
  endereco: string;
  latitude: number;
  longitude: number;
  status?: string;
  showMarker?: boolean; // Controla se o marcador é exibido para esta ocorrência
  showCircle?: boolean; // **NOVA PROPRIEDADE**: Controla se o círculo é exibido para esta ocorrência
}

interface MapComponentProps {
  occurrences: MapOccurrence[];
  initialZoom?: number;
  circleRadius?: number;
  circleColor?: string;
  mapHeight?: string;
  showAllMarkers?: boolean;
  // **NOVA PROPRIEDADE**: Controla se todos os círculos devem ser exibidos por padrão
  showAllCircles?: boolean; 
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  occurrences,
  initialZoom = 13,
  circleRadius = 500,
  circleColor = '#008BCC',
  mapHeight = '400px',
  showAllMarkers = false,
  showAllCircles = true // **NOVO PADRÃO**: Mostrar todos os círculos por padrão
}) => {
  const mapRef = useRef<L.Map | null>(null); 

  const defaultCenter: [number, number] = [-12.9711, -38.5108]; // Coordenadas de Salvador, BA
  const mapCenter: [number, number] = occurrences.length > 0 
    ? [occurrences[0].latitude, occurrences[0].longitude] 
    : defaultCenter;

  useEffect(() => {
    if (mapRef.current && occurrences.length > 0) {
      const bounds = L.latLngBounds(occurrences.map(occ => [occ.latitude, occ.longitude]));
      mapRef.current.fitBounds(bounds.pad(0.5));
    }
  }, [occurrences]);

  const circleOptions = { color: circleColor, fillColor: circleColor, fillOpacity: 0.2, weight: 1 };

  return (
    <MapContainer 
      center={mapCenter} 
      zoom={initialZoom} 
      scrollWheelZoom={true}
      style={{ height: mapHeight, width: '100%' }}
      ref={mapRef} 
    >
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {occurrences.map((occ) => (
        <React.Fragment key={occ.id}>
          {/* Círculo para delimitar a região, se showAllCircles for true OU showCircle para esta ocorrência */}
          {(showAllCircles || occ.showCircle) && (
            <Circle center={[occ.latitude, occ.longitude]} pathOptions={circleOptions} radius={circleRadius}>
              <Popup>
                <strong>{occ.titulo}</strong><br />
                Endereço: {occ.endereco}<br />
                Status: {occ.status || 'N/A'}
              </Popup>
            </Circle>
          )}

          {/* Marcador para o ponto exato, se showAllMarkers for true OU showMarker para esta ocorrência */}
          {(showAllMarkers || occ.showMarker) && (
            <Marker position={[occ.latitude, occ.longitude]}>
              <Popup>
                <strong>{occ.titulo}</strong><br />
                Endereço: {occ.endereco}<br />
                Status: {occ.status || 'N/A'}
              </Popup>
            </Marker>
          )}
        </React.Fragment>
      ))}
    </MapContainer>
  );
};

export default MapComponent;