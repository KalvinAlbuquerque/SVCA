// frontend-svca/src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState<string>('Usuário');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <div className="welcome-section">
        <img src="/avatar.svg" alt="Profile" className="profile-icon" />
        <h2 className="welcome-text">Olá, {userName}</h2>
      </div>

      <div className="dashboard-cards">
        <div className="card" onClick={() => handleCardClick('/mapa')}>
          <img src="/mapa.svg" alt="Mapa" className="card-icon" />
          <h3>Mapa</h3>
        </div>
        <div className="card" onClick={() => handleCardClick('/minhas-ocorrencias')}>
          <img src="/minhas_ocorrencias.svg" alt="Minhas Ocorrências" className="card-icon" />
          <h3>Minhas Ocorrências</h3>
        </div>
        <div className="card" onClick={() => handleCardClick('/ranking-semanal')}>
          <img src="/ranking_semanal.svg" alt="Ranking Semanal" className="card-icon" />
          <h3>Ranking Semanal</h3>
        </div>
        <div className="card" onClick={() => handleCardClick('/gerenciar-conta')}>
          <img src="/gerenciar_conta.svg" alt="Gerenciar Conta" className="card-icon" />
          <h3>Gerenciar Conta</h3>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;