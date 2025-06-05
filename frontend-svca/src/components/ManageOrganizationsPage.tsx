// frontend-svca/src/components/ManageOrganizationsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Organization {
  id: number;
  nome: string;
  email: string;
  telefone: string;
}

const ManageOrganizationsPage: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newOrgForm, setNewOrgForm] = useState({ nome: '', email: '', telefone: '' });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const navigate = useNavigate();

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/orgaos-responsaveis', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar órgãos responsáveis.');
      }

      const data: Organization[] = await response.json();
      setOrganizations(data);
    } catch (err: any) {
      console.error("Erro ao buscar órgãos responsáveis:", err);
      setError(err.message || 'Ocorreu um erro ao carregar os órgãos responsáveis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, [navigate]);

  const openModal = (org: Organization) => {
    setSelectedOrganization(org);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrganization(null);
    setMessage(null);
  };

  const openCreateModal = () => {
    setNewOrgForm({ nome: '', email: '', telefone: '' });
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setMessage(null);
  };

  const handleOrgFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewOrgForm({ ...newOrgForm, [e.target.name]: e.target.value });
  };

  const handleCreateOrganization = async () => {
    setMessage(null);
    if (!newOrgForm.nome || !newOrgForm.email || !newOrgForm.telefone) {
        setMessage({ type: 'error', text: 'Todos os campos são obrigatórios para criar um órgão.' });
        return;
    }

    try {
      const response = await fetch('http://localhost:5000/orgao-responsavel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOrgForm),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Órgão responsável criado com sucesso!' });
        fetchOrganizations();
        setTimeout(() => closeCreateModal(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao criar órgão responsável.' });
      }
    } catch (err: any) {
      console.error("Erro ao criar órgão responsável:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrganization) return;
    setMessage(null);

    try {
      const response = await fetch(`http://localhost:5000/orgao-responsavel/${selectedOrganization.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedOrganization),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Órgão responsável atualizado com sucesso!' });
        fetchOrganizations();
        setTimeout(() => closeModal(), 1500);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar órgão responsável.' });
      }
    } catch (err: any) {
      console.error("Erro ao atualizar órgão responsável:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  const handleDeleteOrganization = async (orgId: number) => {
    if (!window.confirm(`Tem certeza que deseja deletar este órgão responsável?`)) {
        return;
    }
    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/orgao-responsavel/${orgId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Órgão responsável deletado com sucesso!' });
        fetchOrganizations();
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao deletar órgão responsável.' });
      }
    } catch (err: any) {
      console.error("Erro ao deletar órgão responsável:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  if (loading) {
    return (
      <main className="manage-page-container">
        <p className="loading-message">Carregando órgãos responsáveis...</p>
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
        <h1 className="manage-title">Gerenciar Órgãos Responsáveis</h1>

        <button className="btn-primary add-new-button" onClick={openCreateModal}>+ Adicionar Novo Órgão</button>

        {organizations.length === 0 && (
          <p className="no-items-message">Nenhum órgão responsável encontrado.</p>
        )}

        {organizations.length > 0 && (
          <div className="items-list">
            {organizations.map((org) => (
              <div key={org.id} className="item-card">
                <h2 className="item-card-title">{org.nome}</h2>
                <p>Email: {org.email}</p>
                <p>Telefone: {org.telefone}</p>
                <div className="item-actions">
                  <button className="btn-edit" onClick={() => openModal(org)}>Editar</button>
                  <button className="btn-delete" onClick={() => handleDeleteOrganization(org.id)}>Excluir</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && selectedOrganization && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Editar Órgão Responsável</h2>
              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="edit-org-nome">Nome:</label>
                <input type="text" id="edit-org-nome" value={selectedOrganization.nome} onChange={(e) => setSelectedOrganization({ ...selectedOrganization, nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-org-email">Email:</label>
                <input type="email" id="edit-org-email" value={selectedOrganization.email} onChange={(e) => setSelectedOrganization({ ...selectedOrganization, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label htmlFor="edit-org-telefone">Telefone:</label>
                <input type="tel" id="edit-org-telefone" value={selectedOrganization.telefone} onChange={(e) => setSelectedOrganization({ ...selectedOrganization, telefone: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleUpdateOrganization}>Salvar Alterações</button>
                <button className="btn-secondary-modal" onClick={closeModal}>Cancelar</button>
              </div>
            </div>
          </div>
        )}

        {isCreateModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Adicionar Novo Órgão Responsável</h2>
              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="new-org-nome">Nome:</label>
                <input type="text" id="new-org-nome" name="nome" value={newOrgForm.nome} onChange={handleOrgFormChange} />
              </div>
              <div className="form-group">
                <label htmlFor="new-org-email">Email:</label>
                <input type="email" id="new-org-email" name="email" value={newOrgForm.email} onChange={handleOrgFormChange} />
              </div>
              <div className="form-group">
                <label htmlFor="new-org-telefone">Telefone:</label>
                <input type="tel" id="new-org-telefone" name="telefone" value={newOrgForm.telefone} onChange={handleOrgFormChange} />
              </div>
              <div className="modal-actions">
                <button className="btn-primary" onClick={handleCreateOrganization}>Criar Órgão</button>
                <button className="btn-secondary-modal" onClick={closeCreateModal}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageOrganizationsPage;