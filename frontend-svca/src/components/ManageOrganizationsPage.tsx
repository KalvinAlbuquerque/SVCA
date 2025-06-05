// frontend-svca/src/components/ManageOrganizationsPage.tsx
import React, { useState, useEffect, useCallback } from 'react'; // Adicionado useCallback
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null); // Para rastrear o órgão selecionado
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const navigate = useNavigate();

  const fetchOrganizations = useCallback(async (term: string = '') => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/orgaos-responsaveis${term ? `?search=${encodeURIComponent(term)}` : ''}`, {
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
  }, [navigate]); // Adiciona navigate como dependência

  // Efeito para aplicar o debounce ao searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Atraso de 500ms

    // Limpa o timeout anterior se o searchTerm mudar antes do tempo
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Efeito para buscar organizações quando o debouncedSearchTerm muda
  useEffect(() => {
    fetchOrganizations(debouncedSearchTerm);
  }, [fetchOrganizations, debouncedSearchTerm]); // Agora depende de debouncedSearchTerm

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Ao clicar no botão, a busca é imediata, sem debounce
    fetchOrganizations(searchTerm);
    setDebouncedSearchTerm(searchTerm); // Garante que o debounced state esteja alinhado
  };

  const handleAddOrg = () => {
    navigate('/gerenciar-orgaos/cadastrar'); // Navega para a tela de cadastro
  };

  const handleEditOrg = () => {
    if (selectedOrgId) {
      navigate(`/gerenciar-orgaos/editar/${selectedOrgId}`); // Navega para a tela de edição
    } else {
      setMessage({type: 'error', text: 'Selecione um órgão para editar.'});
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleDeleteOrganization = async () => {
    if (!selectedOrgId) {
      setMessage({type: 'error', text: 'Selecione um órgão para remover.'});
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    // Encontra o nome do órgão selecionado para a confirmação
    const orgToDelete = organizations.find(org => org.id === selectedOrgId);
    if (!orgToDelete) {
        setMessage({type: 'error', text: 'Órgão não encontrado na lista para remoção.'});
        setTimeout(() => setMessage(null), 3000);
        return;
    }

    if (!window.confirm(`Tem certeza que deseja remover o órgão "${orgToDelete.nome}"? Esta ação é irreversível!`)) {
      return;
    }

    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/orgao-responsavel/${selectedOrgId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Órgão responsável removido com sucesso!' });
        fetchOrganizations(debouncedSearchTerm); // Atualiza a lista após a exclusão
        setSelectedOrgId(null); // Limpa a seleção
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao remover órgão responsável.' });
      }
    } catch (err: any) {
      console.error("Erro ao remover órgão responsável:", err);
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
        <h1 className="manage-title">Pesquisar Órgão</h1> {/* Título conforme a imagem */}

        {message && ( // Exibe mensagens (sucesso/erro)
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Formulário de Pesquisa e Botões de Ação */}
        <form className="search-and-action-form" onSubmit={handleSearch}>
            <div className="form-group search-group">
                <input
                    type="text"
                    id="search-org"
                    placeholder="Pesquisar órgão..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit" className="btn-primary search-button">Pesquisar</button>
            </div>
            <div className="action-buttons-group">
                <button type="button" className="btn-primary" onClick={handleAddOrg}>+ Adicionar órgão</button>
                <button type="button" className="btn-edit" onClick={handleEditOrg}>Editar órgão</button>
                <button type="button" className="btn-delete" onClick={handleDeleteOrganization}>Remover órgão</button>
            </div>
        </form>
        {/* Fim do Formulário de Pesquisa e Botões de Ação */}

        {/* Exibição da Lista de Órgãos */}
        {organizations.length === 0 ? (
          <div className="empty-state">
            <h1>Órgãos responsáveis cadastrados</h1> {/* Título centralizado quando vazio */}
            <p>Nenhum órgão responsável encontrado.</p>
          </div>
        ) : (
            <div className="organizations-list-container">
                <h1 className="list-title">Órgãos responsáveis cadastrados</h1> {/* Título acima da lista */}
                <div className="items-list">
                    {organizations.map((org) => (
                    <div
                        key={org.id}
                        className={`item-card ${selectedOrgId === org.id ? 'selected' : ''}`}
                        onClick={() => setSelectedOrgId(org.id === selectedOrgId ? null : org.id)} // Alterna a seleção
                    >
                        <h2 className="item-card-title">{org.nome}</h2>
                        <p>Email: {org.email}</p>
                        <p>Telefone: {org.telefone}</p>
                        {/* Removidos os botões de ação individuais para usar os botões da barra superior */}
                    </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </main>
  );
};

export default ManageOrganizationsPage;