// frontend-svca/src/components/Header.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface HeaderProps {
  isAuthenticated?: boolean;
  userProfile?: string | null; // Adiciona a propriedade userProfile
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ isAuthenticated = false, userProfile = null, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false); // Estado para controlar a visibilidade do dropdown

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleMenuItemClick = () => {
    setShowMenu(false); // Fecha o menu ao clicar em um item
  };

  return (
    <header className="main-header">
      <nav className="main-nav">
        <ul className="nav-list">
          <li className="nav-item"><Link to="/">Início</Link></li>
          <li className="nav-item"><Link to="/contato">Contato</Link></li>
          <li className="nav-item"><Link to="/sobre-nos">Sobre Nós</Link></li>
          
          {isAuthenticated && (
            <li className="nav-item menu-dropdown">
              <span onClick={handleMenuClick} className="menu-dropdown-toggle">
                Meu menu
              </span>
              {showMenu && (
                <ul className="dropdown-menu">
                  <li><Link to="/dashboard" onClick={handleMenuItemClick}>Dashboard</Link></li>
                  {userProfile === 'Administrador' || userProfile === 'Moderador' ? (
                    <li><Link to="/gerenciar-ocorrencias" onClick={handleMenuItemClick}>Gerenciar Ocorrências</Link></li>
                  ) : null}
                  {userProfile === 'Administrador' ? (
                    <>
                      <li><Link to="/gerenciar-usuarios" onClick={handleMenuItemClick}>Gerenciar Usuários</Link></li>
                      <li><Link to="/gerenciar-orgaos" onClick={handleMenuItemClick}>Gerenciar Órgãos</Link></li>
                    </>
                  ) : null}
                  <li><Link to="/gerenciar-conta" onClick={handleMenuItemClick}>Gerenciar Conta</Link></li>
                </ul>
              )}
            </li>
          )}
           <li className="nav-item"><Link to="/politicas">Políticas de Uso</Link></li>
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