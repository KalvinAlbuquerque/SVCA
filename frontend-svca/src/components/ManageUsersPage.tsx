// frontend-svca/src/components/ManageUsersPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  perfil: string;
  perfil_id?: number;
  pontos: number;
}

interface ProfileOption {
    id: number;
    nome: string;
}

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [profileOptions, setProfileOptions] = useState<ProfileOption[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<number | null>(null);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');

  const navigate = useNavigate();

  const fetchUsers = useCallback(async (term: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/users${term ? `?search=${encodeURIComponent(term)}` : ''}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar usuários.');
      }

      const data: User[] = await response.json();
      setUsers(data);
    } catch (err: any) {
      console.error("Erro ao buscar usuários:", err);
      setError(err.message || 'Ocorreu um erro ao carregar os usuários.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const fetchProfileOptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/perfis', {
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data: ProfileOption[] = await response.json();
        setProfileOptions(data);
      } else {
        console.error('Falha ao carregar opções de perfil.');
      }
    } catch (error) {
      console.error('Erro de rede ao carregar opções de perfil:', error);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchUsers(debouncedSearchTerm);
    fetchProfileOptions();
  }, [fetchUsers, debouncedSearchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(searchTerm);
    setDebouncedSearchTerm(searchTerm);
  };

  const openModal = (user: User) => {
    setSelectedUser(user);
    const currentProfile = profileOptions.find(p => p.nome === user.perfil);
    setCurrentProfileId(currentProfile ? currentProfile.id : null);
    setNewPassword('');
    setConfirmNewPassword('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setMessage(null);
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentProfileId(Number(e.target.value));
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedUser) {
        setSelectedUser({ ...selectedUser, pontos: Number(e.target.value) });
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || currentProfileId === null) return;

    setMessage(null);

    if (newPassword && newPassword !== confirmNewPassword) {
        setMessage({ type: 'error', text: 'As novas senhas não coincidem.' });
        return;
    }
    if (newPassword && newPassword.length < 6) {
        setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres.' });
        return;
    }

    const dataToUpdate: any = {
        nome: selectedUser.nome,
        email: selectedUser.email,
        telefone: selectedUser.telefone,
        perfil_id: currentProfileId,
        pontos: selectedUser.pontos,
    };

    if (newPassword) {
        dataToUpdate.nova_senha = newPassword;
    }
    
    try {
      const response = await fetch(`http://localhost:5000/user/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToUpdate),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Usuário atualizado com sucesso!' });
        fetchUsers(debouncedSearchTerm);
        setTimeout(() => closeModal(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar usuário.' });
      }
    } catch (err: any) {
      console.error("Erro ao atualizar usuário:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  const handleDeleteUser = async (userToDelete: User) => {
    if (!window.confirm(`Tem certeza que deseja deletar o usuário "${userToDelete.nome}"?`)) {
        return;
    }

    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/user/${userToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Usuário deletado com sucesso!' });
        fetchUsers(debouncedSearchTerm);
        setTimeout(() => closeModal(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao deletar usuário.' });
      }
    } catch (err: any) {
      console.error("Erro ao deletar usuário:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  if (loading) {
    return (
      <main className="manage-page-container">
        <p className="loading-message">Carregando usuários...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="manage-page-container">
        <p className="error-message">{error}</p>
      </main>
    );
  }

  return (
    <main className="manage-page-container">
      <div className="manage-box">
        <h1 className="manage-title">Pesquisar Usuário</h1>

        <form className="search-form" onSubmit={handleSearch}>
          <div className="form-group search-group">
            <label htmlFor="search-user-profile">Perfil do Usuário</label>
            <input
              type="text"
              id="search-user-profile"
              placeholder="Pesquisar por nome ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="btn-primary search-button">Pesquisar</button>
          </div>
        </form>

        {users.length === 0 && (
          <p className="no-items-message">Nenhum usuário encontrado.</p>
        )}

        {users.length > 0 && (
          <div className="items-list">
            {users.map((user) => (
              <div key={user.id} className="item-card">
                <h2 className="item-card-title">{user.nome}</h2>
                <p>Email: {user.email}</p>
                <p>Telefone: {user.telefone}</p>
                <p>Perfil: <span>{user.perfil}</span></p>
                <p>Pontos: {user.pontos}</p>
                <div className="item-actions">
                  <button className="btn-edit" onClick={() => openModal(user)}>Editar</button>
                  <button className="btn-delete" onClick={() => handleDeleteUser(user)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && selectedUser && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Editar Usuário</h2>
              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="edit-nome">Nome:</label>
                <input type="text" id="edit-nome" value={selectedUser.nome} onChange={(e) => setSelectedUser({ ...selectedUser, nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-email">Email:</label>
                <input type="email" id="edit-email" value={selectedUser.email} onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-telefone">Telefone:</label>
                <input type="tel" id="edit-telefone" value={selectedUser.telefone} onChange={(e) => setSelectedUser({ ...selectedUser, telefone: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-perfil">Perfil:</label>
                <select id="edit-perfil" value={currentProfileId || ''} onChange={handleProfileChange}>
                  {profileOptions.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="edit-pontos">Pontos:</label>
                <input type="number" id="edit-pontos" value={selectedUser.pontos} onChange={handlePointsChange} />
              </div>
              <div className="form-group">
                <label htmlFor="new-password">Nova Senha:</label>
                <input type="password" id="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Deixe em branco para não alterar" />
              </div>
              <div className="form-group">
                <label htmlFor="confirm-new-password">Confirmar Nova Senha:</label>
                <input type="password" id="confirm-new-password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleUpdateUser}>Salvar Alterações</button>
                <button className="btn-secondary-modal" onClick={closeModal}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageUsersPage;