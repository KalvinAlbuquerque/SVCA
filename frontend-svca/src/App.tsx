// frontend-svca/src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import LoginBox from './components/LoginBox';
import Dashboard from './components/Dashboard';
import RegisterPage from './components/RegisterPage';
import HomePage from './components/HomePage';
import RegisterOccurrencePage from './components/RegisterOccurrencePage';
import MyOccurrencesPage from './components/MyOccurrencesPage';
import PoliciesPage from './components/PoliciesPage';
import AboutUsPage from './components/AboutUsPage';
import ManageAccountPage from './components/ManageAccountPage'; // Importe o novo componente

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('http://localhost:5000/logout', {
        method: 'POST',
        credentials: 'include',
      });
      if (response.ok) {
        localStorage.removeItem('userId');
        localStorage.removeItem('userName');
        setIsAuthenticated(false);
      } else {
        console.error('Erro ao fazer logout no servidor.');
      }
    } catch (error) {
      console.error('Erro de rede ao fazer logout:', error);
    }
  };

  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} onLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginBox onLoginSuccess={handleLoginSuccess} />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/politicas" element={<PoliciesPage />} />
        <Route path="/sobre-nos" element={<AboutUsPage />} />
        
        {/* Rotas protegidas (apenas para usuários autenticados) */}
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/registrar-ocorrencia"
          element={isAuthenticated ? <RegisterOccurrencePage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/minhas-ocorrencias"
          element={isAuthenticated ? <MyOccurrencesPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/gerenciar-conta" // Nova rota para Gerenciar Conta
          element={isAuthenticated ? <ManageAccountPage /> : <Navigate to="/login" replace />}
        />
        {/* Adicione outras rotas protegidas aqui */}
      </Routes>
    </Router>
  );
};

export default App;