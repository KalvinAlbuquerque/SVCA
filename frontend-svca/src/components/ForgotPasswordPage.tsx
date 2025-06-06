// frontend-svca/src/components/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Para o link "Esqueceu sua senha?" na LoginBox

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!email) {
      setMessage({ type: 'error', text: 'Por favor, insira seu e-mail cadastrado.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include', // Se necessário para cookies, embora para reset de senha, geralmente não é crítico aqui.
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Se você tem uma conta, um link para redefinir sua senha foi enviado para seu e-mail.' });
        setEmail(''); // Limpa o campo de e-mail
      } else {
        // Mensagem genérica para segurança, mesmo se o e-mail não existir
        setMessage({ type: 'error', text: data.error || 'Ocorreu um erro ao processar sua solicitação. Tente novamente.' });
      }
    } catch (error) {
      console.error("Erro na requisição de esqueci senha:", error);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-container"> {/* Reutiliza o estilo do container de login */}
      <div className="login-box"> {/* Reutiliza o estilo da caixa de login */}
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

        <form className="login-form" onSubmit={handleSubmit}> {/* Reutiliza o estilo do formulário de login */}
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
              disabled={loading}
            />
          </div>
          <p className="forgot-password-info" style={{fontSize: '0.9rem', color: '#555', textAlign: 'center', marginBottom: '20px'}}>
            Sua nova senha será enviada para seu e-mail. Você pode alterá-la posteriormente.
          </p>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
        <p className="register-prompt">
          Lembrou da senha? <Link to="/login">Faça Login</Link>
        </p>
      </div>
    </main>
  );
};

export default ForgotPasswordPage;