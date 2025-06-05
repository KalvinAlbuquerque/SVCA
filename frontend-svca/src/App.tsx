// frontend-svca/src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LoginBox from './components/LoginBox';
import Dashboard from './components/Dashboard';
import RegisterPage from './components/RegisterPage'; // Importe o novo componente RegisterPage
import HomePage from './components/HomePage'; // Importe o novo componente HomePage

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Verifica se o usuário está logado ao carregar o aplicativo
    // Você pode verificar a presença de um token JWT ou user_id no localStorage/sessionStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  // Função para mudar o estado de autenticação (passada para LoginBox)
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  // Função para logout (passada para Header ou outro componente de logout)
  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    // Se tiver token, remova também: localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {/* Passa o estado de autenticação para o Header */}
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} /> {/* onLogout será usado depois */}
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* Rota para a Homepage */}
        <Route path="/login" element={<LoginBox onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<RegisterPage />} /> {/* Rota para a página de registro */}
        
        {/* Rotas protegidas (apenas para usuários autenticados) */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
        />
        {/* Adicione outras rotas protegidas aqui */}
        {/* <Route path="/mapa" element={isAuthenticated ? <MapPage /> : <Navigate to="/login" />} /> */}
      </Routes>
    </Router>
  );
};

export default App;