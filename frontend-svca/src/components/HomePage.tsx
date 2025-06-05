// frontend-svca/src/components/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  // Você pode adicionar lógica para carregar o ranking e o mapa aqui no futuro

  return (
    <div className="homepage-container">
      <div className="homepage-content">
        <aside className="ranking-section">
          <h2>Ranking Semanal</h2>
          <ul className="ranking-list">
            {/* Exemplo de itens do ranking - você carregaria isso do backend */}
            <li>
              <span>1</span> {/* Número do ranking */}
              <img src="/avatar.svg" alt="Perfil" className="ranking-profile-icon" />
              <span className="ranking-item-text">Perfil - 300+ Pontos</span>
            </li>
            <li>
              <span>2</span>
              <img src="/undraw_female-avatar_7t6k.png" alt="Perfil" className="ranking-profile-icon" /> {/* Exemplo de outro avatar */}
              <span className="ranking-item-text">Perfil - 300+ Pontos</span>
            </li>
            <li>
              <span>3</span>
              <img src="/undraw_male-avatar_zkzx.png" alt="Perfil" className="ranking-profile-icon" /> {/* Exemplo de outro avatar */}
              <span className="ranking-item-text">Perfil - 300+ Pontos</span>
            </li>
            <li>
              <span>4</span>
              <img src="/undraw_hacker-mind_j91b.png" alt="Perfil" className="ranking-profile-icon" /> {/* Exemplo de outro avatar */}
              <span className="ranking-item-text">Perfil - 300+ Pontos</span>
            </li>
            <li>
              <span>5</span>
              <img src="/undraw_listening-to-podcasts_j0hm.png" alt="Perfil" className="ranking-profile-icon" /> {/* Exemplo de outro avatar */}
              <span className="ranking-item-text">Perfil - 300+ Pontos</span>
            </li>
          </ul>
          <button className="btn-secondary">Ver mais...</button>
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
        <img src="/imagem_2025-05-03_222956761.png" alt="Vigilância Comunitária da Água Logo" /> {/* Imagem do logo do Figma */}
        <p className="slogan">Vigilância Comunitária da Água</p> {/* Texto principal do logo */}
        <p className="homepage-slogan-text">Promovendo o acesso a água limpa em comunidades</p> {/* Slogan inferior */}
      </div>
    </div>
  );
};

export default HomePage;