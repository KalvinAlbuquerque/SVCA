import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

interface LoginBoxProps {
  onLoginSuccess: () => void;
}

const LoginBox: React.FC<LoginBoxProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Login realizado com sucesso!' });
        localStorage.setItem('userName', data.user_name || 'Usuário');
        localStorage.setItem('userId', data.user_id);
        localStorage.setItem('userProfile', data.user_profile); // <-- Adicione esta linha

        onLoginSuccess();
        navigate('/dashboard');

      } else {
        setMessage({ type: 'error', text: data.error || 'Email ou senha incorretos.' });
      }
    } catch (error) {
      console.error("Erro na requisição de login:", error);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  return (
    <main className="login-container">
      <div className="login-box">
        <div className="logo-area">
          <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" className="app-logo" />
        </div>
        <h1 className="app-title">Vigilância Comunitária da Água</h1>
        <p className="slogan">Promovendo o acesso a água limpa<br />em comunidades</p>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Insira seu e-mail..."
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Insira sua senha..."
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Link to="/forgot-password" className="forgot-password">Esqueceu sua senha?</Link>
          <button type="submit" className="btn-primary">Entrar</button>
        </form>
        <p className="register-prompt">
          Ainda não tem conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </main>
  );
};

export default LoginBox;