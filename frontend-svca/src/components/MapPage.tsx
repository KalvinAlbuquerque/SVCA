// frontend-svca/src/components/MapPage.tsx
import React, { useState, useEffect } from 'react';
import MapComponent from './MapComponent'; // Importe seu MapComponent

// Interface para as ocorrências a serem exibidas no mapa
interface ActiveMapOccurrence {
  id: number;
  titulo: string;
  endereco: string;
  latitude: number;
  longitude: number;
  status: string;
}

const MapPage: React.FC = () => {
  const [activeOccurrences, setActiveOccurrences] = useState<ActiveMapOccurrence[]>([]);
  const [loadingMap, setLoadingMap] = useState<boolean>(true);
  const [errorMap, setErrorMap] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveOccurrences = async () => {
      setLoadingMap(true);
      setErrorMap(null);
      try {
        const response = await fetch('http://localhost:5000/active-occurrences', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao buscar ocorrências ativas.');
        }

        const data: ActiveMapOccurrence[] = await response.json();
        setActiveOccurrences(data);
      } catch (err: any) {
        console.error("Erro ao buscar ocorrências ativas para o mapa:", err);
        setErrorMap(err.message || 'Ocorreu um erro ao carregar as ocorrências ativas para o mapa.');
      } finally {
        setLoadingMap(false);
      }
    };

    fetchActiveOccurrences();
  }, []);

  return (
    <main className="manage-page-container"> {/* Reutiliza o container para centralização */}
      <div className="manage-box"> {/* Reutiliza a caixa de conteúdo */}
        <h1 className="manage-title" style={{textAlign: 'center', marginBottom: '30px'}}>Mapa de Ocorrências Ativas</h1> {/* Título centralizado */}

        {loadingMap && <p className="loading-message">Carregando Mapa...</p>}
        {errorMap && <p className="error-message">Erro ao carregar mapa: {errorMap}</p>}
        {!loadingMap && !errorMap && activeOccurrences.length === 0 && (
          <p className="no-items-message">Nenhuma ocorrência ativa para exibir no mapa.</p>
        )}
        {!loadingMap && !errorMap && activeOccurrences.length > 0 && (
          <div style={{ height: '700px', width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
            <MapComponent 
              occurrences={activeOccurrences} 
              initialZoom={12} // Zoom um pouco mais detalhado para a página dedicada
              circleRadius={500} // Mantém o raio de 500m
              circleColor="#FF4500" // Cor para as ocorrências ativas
              mapHeight="100%" // Ocupa 100% da altura da div pai
              showAllMarkers={true} // Mostrar marcadores junto com os raios
              showAllCircles={true} // Mostrar círculos
            />
          </div>
        )}
      </div>
    </main>
  );
};

export default MapPage;