// src/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="main-header">
      <nav className="main-nav">
        <ul className="nav-list">
          <li className="nav-item"><a href="#">Início</a></li>
          <li className="nav-item"><a href="#">Contato</a></li>
          <li className="nav-item"><a href="#">Sobre Nós</a></li>
          <li className="nav-item"><a href="#">Meu menu</a></li>
          <li className="nav-item"><a href="#">Políticas de Uso</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;