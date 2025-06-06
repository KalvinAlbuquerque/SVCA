// frontend-svca/src/components/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

const ResetPasswordPage: React.FC = () => {
  const { token } = useParams<{ token: string }>(); // Pega o token da URL
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null); // null: verificando, true: válido, false: inválido

  useEffect(() => {
    // Opcional: Você pode querer uma chamada inicial ao backend para validar o token imediatamente
    // ou deixar a validação apenas no submit para simplificar.
    // Por enquanto, vamos assumir que o token será validado no submit.
    if (!token) {
      setMessage({ type: 'error', text: 'Token de redefinição de senha não encontrado na URL.' });
      setIsValidToken(false);
    } else {
      setIsValidToken(true); // Assume que o token está presente para permitir o formulário
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!token) {
      setMessage({ type: 'error', text: 'Token de redefinição de senha ausente.' });
      setLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      setLoading(false);
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/reset-password/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword, confirm_new_password: confirmNewPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.' });
        setNewPassword('');
        setConfirmNewPassword('');
        // Redireciona para a página de login após alguns segundos
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao redefinir senha. O token pode ser inválido ou ter expirado.' });
        setIsValidToken(false); // Indica que o token é inválido/expirado
      }
    } catch (error) {
      console.error("Erro na requisição de redefinição de senha:", error);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    } finally {
      setLoading(false);
    }
  };

  if (isValidToken === null) {
    return (
      <main className="login-container">
        <p className="loading-message">Verificando token...</p>
      </main>
    );
  }

  return (
    <main className="login-container">
      <div className="login-box">
        <div className="logo-area">
          <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" className="app-logo" />
        </div>
        <h1 className="app-title">Redefinir Senha</h1>
        <p className="slogan">Digite e confirme sua nova senha.</p>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {!isValidToken && (
          <p className="error-message" style={{marginBottom: '20px'}}>
            O link de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link.
          </p>
        )}

        {isValidToken && (
          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="new_password">Nova Senha</label>
              <input
                type="password"
                id="new_password"
                name="new_password"
                placeholder="Sua nova senha..."
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm_new_password">Confirmar Nova Senha</label>
              <input
                type="password"
                id="confirm_new_password"
                name="confirm_new_password"
                placeholder="Confirme sua nova senha..."
                required
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Redefinindo...' : 'Redefinir Senha'}
            </button>
          </form>
        )}

        <p className="register-prompt" style={{marginTop: isValidToken ? '20px' : '0'}}>
          <Link to="/forgot-password">Solicitar novo link de redefinição</Link>
        </p>
        <p className="register-prompt">
          <Link to="/login">Voltar ao Login</Link>
        </p>
      </div>
    </main>
  );
};

export default ResetPasswordPage;