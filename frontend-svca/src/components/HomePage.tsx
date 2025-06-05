// frontend-svca/src/components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MapComponent from './MapComponent'; // Importe o novo MapComponent

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
          credentials: 'include',
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
  }, []); // Executa uma vez ao montar o componente

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

        <main className="main-map-area">
          {loadingMap && <h1>Carregando Mapa...</h1>}
          {errorMap && <h1 className="error-message">Erro ao carregar mapa: {errorMap}</h1>}
          {!loadingMap && !errorMap && activeOccurrences.length === 0 && (
            <h1>Nenhuma ocorrência ativa no momento.</h1>
          )}
          {!loadingMap && !errorMap && activeOccurrences.length > 0 && (
            // Renderiza o MapComponent com as ocorrências ativas
            <MapComponent 
              occurrences={activeOccurrences} 
              initialZoom={10} // Zoom um pouco mais distante para ver mais área
              circleRadius={500} // Mantém o raio de 500m
              circleColor="#FF4500" // Exemplo: uma cor diferente para ocorrências ativas no mapa principal (laranja avermelhado)
              mapHeight="100%" // Ocupa 100% da altura da div pai
              showAllMarkers={true}
              showAllCircles={true}
            />
          )}
        </main>
      </div>

      <Link to="/registrar-ocorrencia" className="btn-floating">
        + Registrar nova ocorrência
      </Link>

      <div className="homepage-footer-logo">
        <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" />
        <p className="slogan">Vigilância Comunitária da Água</p>
        <p className="homepage-slogan-text">Promovendo o acesso a água limpa em comunidades</p>
      </div>
    </div>
  );
};

export default HomePage;