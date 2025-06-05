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
import ManageAccountPage from './components/ManageAccountPage';
import ManageOccurrencesPage from './components/ManageOccurrencesPage'; // Novo componente
import ManageUsersPage from './components/ManagerUsersPage'; // Novo componente
import ManageOrganizationsPage from './components/ManageOrganizationsPage'; // Novo componente

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userProfile, setUserProfile] = useState<string | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const storedUserProfile = localStorage.getItem('userProfile');

    if (userId) {
      setIsAuthenticated(true);
      setUserProfile(storedUserProfile);
    } else {
      setIsAuthenticated(false);
      setUserProfile(null);
    }
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setUserProfile(localStorage.getItem('userProfile'));
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
        localStorage.removeItem('userProfile');
        setIsAuthenticated(false);
        setUserProfile(null);
      } else {
        console.error('Erro ao fazer logout no servidor.');
      }
    } catch (error) {
      console.error('Erro de rede ao fazer logout:', error);
    }
  };

  return (
    <Router>
      <Header isAuthenticated={isAuthenticated} userProfile={userProfile} onLogout={handleLogout} />
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
          path="/gerenciar-conta"
          element={isAuthenticated ? <ManageAccountPage /> : <Navigate to="/login" replace />}
        />

        {/* Novas Rotas Protegidas por Perfil */}
        {userProfile === 'Administrador' || userProfile === 'Moderador' ? (
          <Route path="/gerenciar-ocorrencias" element={<ManageOccurrencesPage />} />
        ) : null}

        {/* Ajuste aqui se Moderador também puder gerenciar órgãos */}
        {userProfile === 'Administrador' || userProfile === 'Moderador' ? (
             <Route path="/gerenciar-orgaos" element={<ManageOrganizationsPage />} />
        ) : null}

        {userProfile === 'Administrador' ? (
          <>
            <Route path="/gerenciar-usuarios" element={<ManageUsersPage />} />
          </>
        ) : null}


        {/* Redirecionar para o dashboard caso tente acessar rotas restritas sem permissão */}
        {isAuthenticated && userProfile === 'Usuario' && (
             <Route path="/gerenciar-ocorrencias" element={<Navigate to="/dashboard" replace />} />
        )}
        {isAuthenticated && (userProfile !== 'Administrador' && userProfile !== 'Moderador') && (
             <Route path="/gerenciar-orgaos" element={<Navigate to="/dashboard" replace />} />
        )}
        {isAuthenticated && userProfile !== 'Administrador' && (
             <Route path="/gerenciar-usuarios" element={<Navigate to="/dashboard" replace />} />
        )}

      </Routes>
    </Router>
  );
};

export default App;