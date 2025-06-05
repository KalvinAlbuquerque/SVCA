// frontend-svca/src/components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapComponent from './MapComponent'; // Importe o MapComponent novamente para a HomePage

interface RankingUser {
  id: number;
  nome: string;
  pontos: number;
  avatar_url: string;
}

// Interface para as ocorrências a serem exibidas no mapa
interface ActiveMapOccurrence {
  id: number;
  titulo: string;
  endereco: string;
  latitude: number;
  longitude: number;
  status: string;
}

const HomePage: React.FC = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loadingRanking, setLoadingRanking] = useState<boolean>(true);
  const [errorRanking, setErrorRanking] = useState<string | null>(null);

  const [activeOccurrences, setActiveOccurrences] = useState<ActiveMapOccurrence[]>([]); // Novo estado para ocorrências ativas
  const [loadingMap, setLoadingMap] = useState<boolean>(true); // Novo estado de loading para o mapa
  const [errorMap, setErrorMap] = useState<string | null>(null); // Novo estado de erro para o mapa


  useEffect(() => {
    // Função para buscar o ranking
    const fetchRanking = async () => {
      setLoadingRanking(true);
      setErrorRanking(null);
      try {
        const response = await fetch('http://localhost:5000/ranking-semanal', {
          method: 'GET',
          credentials: 'include', // Pode ser necessário se o ranking depender de usuário logado
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar o ranking semanal.');
        }

        const data: RankingUser[] = await response.json();
        setRanking(data);
      } catch (err: any) {
        console.error("Erro ao buscar ranking:", err);
        setErrorRanking(err.message || 'Ocorreu um erro ao carregar o ranking.');
      } finally {
        setLoadingRanking(false);
      }
    };

    // Nova função para buscar ocorrências ativas para o mapa
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

    fetchRanking();
    fetchActiveOccurrences(); // Chamar a nova função de busca
  }, []);

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <aside className="ranking-section">
          <h2>Ranking Semanal</h2>
          {loadingRanking && <p>Carregando ranking...</p>}
          {errorRanking && <p className="error-message">{errorRanking}</p>}
          {!loadingRanking && !errorRanking && ranking.length === 0 && (
            <p>Nenhum usuário no ranking ainda.</p>
          )}
          {!loadingRanking && !errorRanking && ranking.length > 0 && (
            <ul className="ranking-list">
              {ranking.map((user, index) => (
                <li key={user.id}>
                  <span>{index + 1}</span>
                  <img src={user.avatar_url} alt="Perfil" className="ranking-profile-icon" />
                  <span className="ranking-item-text">{user.nome} - {user.pontos} Pontos</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/ranking-semanal" className="btn-secondary">Ver mais...</Link>
        </aside>

        {/* MUDANÇA AQUI: Nova div para agrupar mapa e botão */}
        <div className="map-and-button-area">
          <main className="main-map-area">
            {loadingMap && <h1>Carregando Mapa...</h1>}
            {errorMap && <h1 className="error-message">Erro ao carregar mapa: {errorMap}</h1>}
            {!loadingMap && !errorMap && activeOccurrences.length === 0 && (
              <h1>Nenhuma ocorrência ativa no momento.</h1>
            )}
            {!loadingMap && !errorMap && activeOccurrences.length > 0 && (
              <MapComponent 
                occurrences={activeOccurrences} 
                initialZoom={10}
                circleRadius={500}
                circleColor="#FF4500"
                mapHeight="100%"
                showAllMarkers={true}
                showAllCircles={true}
              />
            )}
          </main>

          {/* MUDANÇA AQUI: Botão Registrar ocorrência movido para dentro de map-and-button-area */}
          <Link to="/registrar-ocorrencia" className="btn-floating-homepage">
            + Registrar nova ocorrência
          </Link>
        </div> {/* Fim de map-and-button-area */}

      {/* Footer (mantido no final do homepage-container) */}
      <div className="homepage-footer-logo">
        <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" />
        <p className="slogan">Vigilância Comunitária da Água</p>
        <p className="homepage-slogan-text">Promovendo o acesso a água limpa em comunidades</p>
      </div>
    </div>
    </div>
  );
};

export default HomePage;