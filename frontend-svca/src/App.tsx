// src/App.tsx
import React from 'react';
import Header from './components/Header';
import LoginBox from './components/LoginBox';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'; // Se for usar rotas

const App: React.FC = () => {
  return (
    // <Router> {/* Envolver com Router se for usar react-router-dom */}
      <>
        <Header />
        {/* <Routes>
          <Route path="/login" element={<LoginBox />} />
          <Route path="/" element={<LoginBox />} /> {/* Redirecionar para login por padrão */}
          {/* Adicione outras rotas aqui, como /dashboard */}
        {/* </Routes> */}
        <LoginBox /> {/* Remova esta linha se estiver usando react-router-dom e uma rota para /login */}
      </>
    // </Router>
  );
};

export default App;