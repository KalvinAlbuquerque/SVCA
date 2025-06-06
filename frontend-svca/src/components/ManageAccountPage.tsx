// frontend-svca/src/components/ManageAccountPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Definição da interface para os dados do perfil do usuário
interface UserProfile {
  id: number;
  nome: string;
  sobrenome: string;
  email: string;
  telefone: string;
  cpf?: string; // Opcional
  apelido: string; // Mapeado para o nome completo ou nome principal
  perfil: string;
  pontos: number; // Já existe, mas reforçando que é o campo direto do modelo
  avatar_url?: string; // Opcional, se você tiver no modelo
}

const avatarOptions = [
  '/avatar.svg',
  '/avatar2.svg', // Este
  '/avatar3.svg', // Este
  '/avatar4.svg', // Este
  '/avatar5.svg', // Este
  '/avatar6.svg',
  '/avatar7.svg',
  '/avatar8.svg',
  '/avatar9.svg',
  '/avatar10.svg',
  '/avatar11.svg',
  '/avatar12.svg',
  '/avatar13.svg',
  '/avatar14.svg',
];

const ManageAccountPage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(''); // Para o avatar selecionado
  const navigate = useNavigate();

  // Função para buscar os dados do perfil
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/user-profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login');
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao carregar perfil.');
        }

        const data: UserProfile = await response.json();
        setProfile(data);
        // Define o avatar selecionado com base no avatar_url do backend, ou o primeiro da lista se não houver
        // Ou, se o avatar_url do backend não estiver na sua lista de avatarOptions, define um padrão.
        setSelectedAvatar(data.avatar_url && avatarOptions.includes(data.avatar_url) ? data.avatar_url : avatarOptions[0]);
      } catch (err: any) {
        console.error("Erro ao carregar perfil:", err);
        setError(err.message || 'Ocorreu um erro ao carregar seu perfil.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Função para lidar com a mudança nos campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  // Função para lidar com a seleção de avatar
  const handleAvatarSelect = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    if (profile) {
      setProfile({ ...profile, avatar_url: avatarUrl }); // Atualiza o avatar no estado local do perfil
    }
  };

  // Função para lidar com a submissão do formulário de atualização
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!profile) return; // Não deve acontecer se profile for null

    if (newPassword && newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
      return;
    }
    if (newPassword && newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    try {
      const dataToUpdate: any = {
        nome: profile.nome,
        sobrenome: profile.sobrenome,
        email: profile.email,
        telefone: profile.telefone,
        cpf: profile.cpf,
        apelido: profile.apelido, // Enviando o apelido de volta
        avatar_url: selectedAvatar, // Envia o avatar selecionado para o backend
      };

      if (newPassword) {
        dataToUpdate.nova_senha = newPassword;
        dataToUpdate.repita_sua_senha = confirmNewPassword;
      }

      const response = await fetch('http://localhost:5000/user-profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
        credentials: 'include',
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: responseData.message || 'Perfil atualizado com sucesso!' });
        setNewPassword('');
        setConfirmNewPassword('');
        // Se o nome foi atualizado, atualize também no localStorage para o header/dashboard
        if (profile.nome && profile.sobrenome) {
            localStorage.setItem('userName', `${profile.nome} ${profile.sobrenome}`);
        } else {
            localStorage.setItem('userName', profile.nome);
        }
        // Opcional: Recarregar o perfil após a atualização para refletir o avatar salvo
        // fetchProfile(); // Isso poderia ser chamado para buscar os dados mais recentes do perfil
      } else {
        setMessage({ type: 'error', text: responseData.error || 'Erro ao atualizar perfil.' });
      }
    } catch (err: any) {
      console.error("Erro na requisição de atualização:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  if (loading) {
    return (
      <main className="manage-account-container">
        <p className="loading-message">Carregando perfil...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="manage-account-container">
        <p className="error-message">{error}</p>
      </main>
    );
  }

  if (!profile) return null; // Não deve acontecer se !loading e !error

  return (
    <main className="manage-account-container">
      <div className="manage-account-box">
        <h1 className="manage-account-title">Gerenciar Conta</h1>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="manage-account-form" onSubmit={handleSubmit}>
          {/* Informações pessoais */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input type="text" id="nome" name="nome" value={profile.nome} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="sobrenome">Sobrenome</label>
              <input type="text" id="sobrenome" name="sobrenome" value={profile.sobrenome} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={profile.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="cpf">CPF</label>
              <input type="text" id="cpf" name="cpf" value={profile.cpf || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input type="tel" id="telefone" name="telefone" value={profile.telefone} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label htmlFor="apelido">Apelido</label>
              <input type="text" id="apelido" name="apelido" value={profile.apelido} onChange={handleChange} />
            </div>
          </div>

          {/* Alterar Senha */}
          <h2 className="section-title">Alterar Senha</h2>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nova_senha">Nova Senha</label>
              <input type="password" id="nova_senha" name="nova_senha" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Deixe em branco para manter a senha atual" />
            </div>
            <div className="form-group">
              <label htmlFor="repita_sua_senha">Repita sua senha</label>
              <input type="password" id="repita_sua_senha" name="repita_sua_senha" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Repita a nova senha" />
            </div>
          </div>

          {/* Seleção de Avatar */}
          <h2 className="section-title">Avatar</h2>
          <div className="avatar-selection-grid">
            {avatarOptions.map((avatarUrl, index) => (
              <div 
                key={index} 
                className={`avatar-option ${selectedAvatar === avatarUrl ? 'selected' : ''}`}
                onClick={() => handleAvatarSelect(avatarUrl)}
              >
                <img src={avatarUrl} alt={`Avatar ${index + 1}`} />
              </div>
            ))}
          </div>

          {/* Perfil e Pontos (apenas leitura) */}
          <div className="form-row profile-info-row">
            <div className="form-group">
              <label htmlFor="perfil">Perfil</label>
              <input type="text" id="perfil" name="perfil" value={profile.perfil} readOnly disabled />
            </div>
            <div className="form-group">
              <label htmlFor="pontos">Pontos</label>
              <input type="text" id="pontos" name="pontos" value={profile.pontos.toString()} readOnly disabled />
            </div>
          </div>

          <button type="submit" className="btn-primary">Salvar</button>
        </form>
      </div>
    </main>
  );
};

export default ManageAccountPage;