// src/components/LoginBox.tsx
import React, { useState } from 'react';

const LoginBox: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null); // Clear previous messages

    if (!email || !password) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos.' });
      return;
    }

    try {
      // Aqui você faria a chamada para a sua API Flask
      // A URL abaixo deve ser a URL do seu backend Flask (por exemplo, http://localhost:5000/login)
      const response = await fetch('http://127.0.0.1:5000/login', { // Altere para a URL do seu backend Flask
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Importante para enviar JSON
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Assumindo que o Flask retorna JSON

      if (response.ok) {
        // Login bem-sucedido
        setMessage({ type: 'success', text: data.message || 'Login realizado com sucesso!' });
        // Redirecionar ou armazenar token/sessão aqui
        console.log("Login successful:", data);
        // Exemplo de redirecionamento (você precisará do react-router-dom para isso)
        // navigate('/dashboard');
      } else {
        // Login falhou
        setMessage({ type: 'error', text: data.error || 'Email ou senha incorretos.' }); // Usando a mensagem de erro do backend
        console.error("Login failed:", data);
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
          <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" className="app-logo" /> {/* Adjust path as needed */}
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
          <a href="#" className="forgot-password">Esqueceu sua senha?</a>
          <button type="submit" className="btn-primary">Entrar</button>
        </form>
      </div>
    </main>
  );
};

export default LoginBox;