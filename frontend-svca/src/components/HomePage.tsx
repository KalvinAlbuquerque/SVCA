// frontend-svca/src/components/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface RankingUser {
  id: number;
  nome: string;
  pontos: number;
  avatar_url: string;
}

const HomePage: React.FC = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loadingRanking, setLoadingRanking] = useState<boolean>(true);
  const [errorRanking, setErrorRanking] = useState<string | null>(null);

  useEffect(() => {
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

    fetchRanking();
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
                  <span>{index + 1}</span> {/* Número do ranking */}
                  <img src={user.avatar_url} alt="Perfil" className="ranking-profile-icon" />
                  <span className="ranking-item-text">{user.nome} - {user.pontos} Pontos</span>
                </li>
              ))}
            </ul>
          )}
          {/* ALTERAÇÃO: Adicionar a classe "btn-secondary" diretamente ao componente Link */}
          <Link to="/ranking-semanal" className="btn-secondary">Ver mais...</Link>
        </aside>

        <main className="main-map-area">
          <h1>MAPA INTERATIVO</h1>
          {/* Aqui futuramente será o componente do mapa real */}
        </main>
      </div>

      {/* Botão de registrar nova ocorrência */}
      <Link to="/registrar-ocorrencia" className="btn-floating">
        + Registrar nova ocorrência
      </Link>

      {/* Bloco de logo e slogan na parte inferior esquerda */}
      <div className="homepage-footer-logo">
        <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" />
        <p className="slogan">Vigilância Comunitária da Água</p>
        <p className="homepage-slogan-text">Promovendo o acesso a água limpa em comunidades</p>
      </div>
    </div>
  );
};

export default HomePage;