// frontend-svca/src/components/ManageOccurrencesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Occurrence {
  id: number;
  titulo: string;
  descricao: string;
  endereco: string;
  data_registro: string;
  status: string;
  usuario_nome: string;
  imagens: string[];
}

interface StatusOption {
  id: number;
  nome: string;
}

const ManageOccurrencesPage: React.FC = () => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState<Occurrence | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [currentStatusId, setCurrentStatusId] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const navigate = useNavigate();

  const fetchOccurrences = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/occurrences', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          navigate('/login');
          return;
        }
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao buscar ocorrências.');
      }

      const data: Occurrence[] = await response.json();
      setOccurrences(data);
    } catch (err: any) {
      console.error("Erro ao buscar ocorrências:", err);
      setError(err.message || 'Ocorreu um erro ao carregar as ocorrências.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStatusOptions = async () => {
    try {
      const response = await fetch('http://localhost:5000/status-ocorrencias', { // Você precisará criar esta rota no backend!
        method: 'GET',
        credentials: 'include',
      });
      if (response.ok) {
        const data: StatusOption[] = await response.json();
        setStatusOptions(data);
      } else {
        console.error('Falha ao carregar opções de status.');
      }
    } catch (error) {
      console.error('Erro de rede ao carregar opções de status:', error);
    }
  };

  useEffect(() => {
    fetchOccurrences();
    fetchStatusOptions();
  }, [navigate]);


  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOccurrence(null);
    setMessage(null);
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentStatusId(Number(e.target.value));
  };

  const handleUpdateOccurrence = async () => {
    if (!selectedOccurrence || currentStatusId === null) return;
    
    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/occurrence/${selectedOccurrence.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status_id: currentStatusId }),
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Ocorrência atualizada com sucesso!' });
        fetchOccurrences(); // Atualiza a lista de ocorrências
        setTimeout(() => closeModal(), 1500); // Fecha o modal após 1.5s
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar ocorrência.' });
      }
    } catch (err: any) {
      console.error("Erro ao atualizar ocorrência:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  const handleDeleteOccurrence = async () => {
    if (!selectedOccurrence) return;

    if (!window.confirm(`Tem certeza que deseja deletar a ocorrência "${selectedOccurrence.titulo}"?`)) {
        return;
    }

    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/occurrence/${selectedOccurrence.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Ocorrência deletada com sucesso!' });
        fetchOccurrences(); // Atualiza a lista de ocorrências
        setTimeout(() => closeModal(), 1500); // Fecha o modal após 1.5s
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao deletar ocorrência.' });
      }
    } catch (err: any) {
      console.error("Erro ao deletar ocorrência:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };


  if (loading) {
    return (
      <main className="manage-page-container">
        <p className="loading-message">Carregando ocorrências...</p>
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
        <h1 className="manage-title">Gerenciar Ocorrências</h1>

        {occurrences.length === 0 && (
          <p className="no-items-message">Nenhuma ocorrência encontrada.</p>
        )}

        {occurrences.length > 0 && (
        <div className="items-list">
            {occurrences.map((occ) => (
            <div
                key={occ.id}
                className="item-card"
                onClick={() => navigate(`/gerenciar-ocorrencias/${occ.id}`)} // <--- ADICIONE ESTA LINHA
                style={{ cursor: 'pointer' }} // <--- ADICIONE ESTA LINHA PARA INDICAÇÃO VISUAL
            >
                <h2 className="item-card-title">{occ.titulo}</h2>
                <p>Usuário: {occ.usuario_nome}</p>
                <p>Status: <span>{occ.status}</span></p>
                <p>Endereço: {occ.endereco}</p>
                <p>Data: {occ.data_registro}</p>
            </div>
            ))}
        </div>
        )}

        {isModalOpen && selectedOccurrence && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Detalhes da Ocorrência</h2>
              {message && (
                <div className={`message ${message.type}`}>
                  {message.text}
                </div>
              )}
              <p><strong>Título:</strong> {selectedOccurrence.titulo}</p>
              <p><strong>Descrição:</strong> {selectedOccurrence.descricao}</p>
              <p><strong>Endereço:</strong> {selectedOccurrence.endereco}</p>
              <p><strong>Registrado por:</strong> {selectedOccurrence.usuario_nome}</p>
              <p><strong>Data de Registro:</strong> {selectedOccurrence.data_registro}</p>
              
              <div className="form-group">
                <label htmlFor="status">Alterar Status:</label>
                <select id="status" value={currentStatusId || ''} onChange={handleStatusChange}>
                  {statusOptions.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-images">
                {selectedOccurrence.imagens.length > 0 ? (
                  selectedOccurrence.imagens.map((imgUrl, idx) => (
                    <img key={idx} src={imgUrl} alt={`Imagem ${idx + 1}`} className="modal-image-thumbnail" />
                  ))
                ) : (
                  <p>Nenhuma imagem disponível.</p>
                )}
              </div>

              <div className="modal-actions">
                <button className="btn-primary" onClick={handleUpdateOccurrence}>Atualizar</button>
                <button className="btn-delete" onClick={handleDeleteOccurrence}>Excluir</button>
                <button className="btn-secondary-modal" onClick={closeModal}>Fechar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default ManageOccurrencesPage;