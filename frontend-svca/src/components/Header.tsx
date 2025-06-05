// frontend-svca/src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';

// Props para simular o estado de autenticação
interface HeaderProps {
  isAuthenticated?: boolean;
  onLogout: () => void; // <--- Adicione esta linha AQUI
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated = false, onLogout }) => { // <--- Adicione 'onLogout' aqui também
  return (
    <header className="main-header">
      <nav className="main-nav">
        <ul className="nav-list">
          <li className="nav-item"><Link to="/">Início</Link></li>
          <li className="nav-item"><Link to="#">Contato</Link></li>
          <li className="nav-item"><Link to="#">Sobre Nós</Link></li>
          {/* Exibe "Meu menu" apenas se autenticado, caso contrário, botões de login/registro */}
          {isAuthenticated ? (
            <li className="nav-item"><Link to="/dashboard">Meu menu</Link></li>
          ) : (
            <>
              {/* Removido daqui e colocado em um div separado para melhor controle */}
            </>
          )}
          <li className="nav-item"><Link to="#">Políticas de Uso</Link></li>
        </ul>
        
        {/* Logo do cabeçalho - já está na posição certa */}
        <div className="header-logo-container">
            <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" />
            <span className="header-logo-text">Vigilância Comunitária da Água</span>
        </div>

        {/* Botões de autenticação para o cabeçalho */}
        {!isAuthenticated && (
          <div className="header-auth-buttons">
            <Link to="/login" className="btn-header-outline">Entrar</Link>
            <Link to="/register" className="btn-header-primary">Registrar-se</Link>
          </div>
        )}
        {/* Adiciona um botão de logout se estiver autenticado */}
        {isAuthenticated && (
          <div className="header-auth-buttons">
            <button onClick={onLogout} className="btn-header-outline">Sair</button> {/* Botão de Sair/Logout */}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;