// frontend-svca/src/components/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isAuthenticated?: boolean;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated = false, onLogout }) => {
  return (
    <header className="main-header">
      <nav className="main-nav">
        <ul className="nav-list">
          <li className="nav-item"><Link to="/">Início</Link></li>
          <li className="nav-item"><Link to="#">Contato</Link></li>
          <li className="nav-item"><Link to="/sobre-nos">Sobre Nós</Link></li> {/* Novo link */}
          {isAuthenticated ? (
            <li className="nav-item"><Link to="/dashboard">Meu menu</Link></li>
          ) : (
            null
          )}
           <li className="nav-item"><Link to="/politicas">Políticas de Uso</Link></li> {/* Novo link */}
        </ul>
        
        <div className="header-logo-container">
            <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" />
            <span className="header-logo-text">Vigilância Comunitária da Água</span>
        </div>

        {!isAuthenticated && (
          <div className="header-auth-buttons">
            <Link to="/login" className="btn-header-outline">Entrar</Link>
            <Link to="/register" className="btn-header-primary">Registrar-se</Link>
          </div>
        )}
        {isAuthenticated && (
          <button className="btn-header-outline" onClick={onLogout}>Sair</button>
        )}
      </nav>
    </header>
  );
};

export default Header;