// frontend-svca/src/components/RankingSemanal.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface RankingUser {
  id: number;
  nome: string;
  pontos: number;
  avatar_url: string;
}

const RankingSemanal: React.FC = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
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
        console.error('Erro ao buscar ranking:', err);
        setError(err.message || 'Ocorreu um erro ao carregar o ranking.');
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  return (
    <div className="ranking-semanal-container">
      <h1>Ranking Semanal</h1>
      {loading && <p>Carregando ranking...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && ranking.length === 0 && (
        <p>Nenhum usuário no ranking ainda.</p>
      )}
      {!loading && !error && ranking.length > 0 && (
        <ol className="ranking-list">
          {ranking.map((user) => (
            <li key={user.id}>
              <div className="ranking-item">
                <img src={user.avatar_url} alt={`Avatar de ${user.nome}`} className="ranking-avatar" />
                <span className="ranking-nome">{user.nome}</span>
                <span className="ranking-pontos">{user.pontos} pontos</span>
              </div>
            </li>
          ))}
        </ol>
      )}
      {/* ALTERAÇÃO: Adicionar a classe "btn-secondary" e remover "voltar-link" */}
      <Link to="/" className="btn-secondary">Voltar</Link> 
    </div>
  );
};

export default RankingSemanal;