// frontend-svca/src/components/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [userName, setUserName] = useState<string>('Usuário');
  const [userProfile, setUserProfile] = useState<string | null>(null); // Novo estado
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    const storedUserProfile = localStorage.getItem('userProfile'); // Obtém o perfil

    if (storedUserName && storedUserProfile) {
      setUserName(storedUserName);
      setUserProfile(storedUserProfile); // Define o perfil
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
        {/* Cards Comuns para todos os perfis */}
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

        {/* Cards específicos para Moderador e Administrador */}
        {(userProfile === 'Moderador' || userProfile === 'Administrador') && (
          <div className="card" onClick={() => handleCardClick('/gerenciar-ocorrencias')}>
            <img src="/ocorrencias_moderador.svg" alt="Gerenciar Ocorrências" className="card-icon" /> {/* Substitua com o ícone correto */}
            <h3>Gerenciar Ocorrências</h3>
          </div>
        )}

        {/* Cards específicos para Administrador */}
        {userProfile === 'Administrador' && (
          <>
            <div className="card" onClick={() => handleCardClick('/gerenciar-usuarios')}>
              <img src="/gerenciar_usuarios.svg" alt="Gerenciar Usuários" className="card-icon" /> {/* Substitua com o ícone correto */}
              <h3>Gerenciar Usuários</h3>
            </div>
            <div className="card" onClick={() => handleCardClick('/gerenciar-orgaos')}>
              <img src="/gerenciar_orgaos.svg" alt="Gerenciar Órgãos" className="card-icon" /> {/* Substitua com o ícone correto */}
              <h3>Gerenciar Órgãos</h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;