// frontend-svca/src/components/ViewOccurrencePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapComponent from './MapComponent'; // Importe o componente MapComponent

// Interface para os dados completos da ocorrência (como vêm do backend)
interface OccurrenceDetail {
  id: number;
  titulo: string;
  descricao: string;
  endereco: string;
  data_registro: string;
  data_finalizacao: string | null; // Pode ser null
  status_id: number;
  status_nome: string; // Nome do status para exibição
  usuario_id: number;
  usuario_nome: string; // Nome do usuário para exibição
  orgao_responsavel_id: number | null; // ID do órgão responsável
  orgao_responsavel_nome?: string; // Nome do órgão para exibição (se existir)
  imagens: string[]; // URLs das imagens existentes
  latitude: number | null; // Adicione latitude
  longitude: number | null; // Adicione longitude
}

// Interface para os dados do formulário (o que pode ser editado e enviado)
interface OccurrenceFormData {
  titulo: string;
  descricao: string;
  endereco: string;
  status_id: number;
  orgao_responsavel_id: number | null; // Pode ser null
  // latitude e longitude não são editáveis aqui, apenas exibidos
}

// Interfaces para as opções de dropdown
interface StatusOption {
  id: number;
  nome: string;
}

interface OrganizationOption {
  id: number;
  nome: string;
}

const ViewOccurrencePage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Pega o ID da ocorrência da URL
  const navigate = useNavigate();

  const [occurrence, setOccurrence] = useState<OccurrenceDetail | null>(null); // Dados originais da ocorrência
  const [form, setForm] = useState<OccurrenceFormData | null>(null); // Estado do formulário para edição
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [organizationOptions, setOrganizationOptions] = useState<OrganizationOption[]>([]);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Busca os detalhes da ocorrência
        const occurrenceResponse = await fetch(`http://localhost:5000/occurrence/${id}`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!occurrenceResponse.ok) {
          if (occurrenceResponse.status === 401 || occurrenceResponse.status === 403) {
            navigate('/login');
            return;
          }
          const errorData = await occurrenceResponse.json();
          throw new Error(errorData.error || 'Falha ao buscar detalhes da ocorrência.');
        }
        const occurrenceData: OccurrenceDetail = await occurrenceResponse.json();
        setOccurrence(occurrenceData);

        // Busca as opções de status
        const statusResponse = await fetch('http://localhost:5000/status-ocorrencias', { credentials: 'include' });
        if (!statusResponse.ok) {
          throw new Error('Falha ao buscar opções de status.');
        }
        const statusData: StatusOption[] = await statusResponse.json();
        setStatusOptions(statusData);

        // Busca as opções de órgãos responsáveis
        const orgResponse = await fetch('http://localhost:5000/orgaos-responsaveis', { credentials: 'include' });
        if (!orgResponse.ok) {
          throw new Error('Falha ao buscar opções de órgãos responsáveis.');
        }
        const orgData: OrganizationOption[] = await orgResponse.json();
        setOrganizationOptions(orgData);

        // Inicializa o estado do formulário com os dados da ocorrência para edição
        setForm({
          titulo: occurrenceData.titulo,
          descricao: occurrenceData.descricao,
          endereco: occurrenceData.endereco,
          status_id: occurrenceData.status_id,
          orgao_responsavel_id: occurrenceData.orgao_responsavel_id,
        });

      } catch (err: any) {
        console.error("Erro ao carregar dados:", err);
        setError(err.message || 'Ocorreu um erro ao carregar os dados da ocorrência.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, navigate]); // Dependências: id e navigate

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => {
      if (!prevForm) return null;

      const parsedValue = (name === 'status_id' || name === 'orgao_responsavel_id')
        ? (value === '' ? null : Number(value))
        : value;

      return {
        ...prevForm,
        [name]: parsedValue,
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!form || !form.titulo || !form.descricao || !form.endereco || !form.status_id) {
        setMessage({ type: 'error', text: 'Título, Descrição, Endereço e Status são obrigatórios.' });
        return;
    }

    try {
      const response = await fetch(`http://localhost:5000/occurrence/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: form.titulo,
          descricao: form.descricao,
          endereco: form.endereco,
          status_id: form.status_id,
          orgao_responsavel_id: form.orgao_responsavel_id,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Ocorrência atualizada com sucesso!' });
        const updatedOccurrence = await fetch(`http://localhost:5000/occurrence/${id}`, { method: 'GET', credentials: 'include' }).then(res => res.json());
        setOccurrence(updatedOccurrence);
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar ocorrência.' });
      }
    } catch (err: any) {
      console.error("Erro na requisição de atualização:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  if (loading) {
    return <main className="manage-page-container"><p className="loading-message">Carregando detalhes da ocorrência...</p></main>;
  }

  if (error) {
    return <main className="manage-page-container"><p className="error-message">{error}</p></main>;
  }

  if (!occurrence || !form) {
    return <main className="manage-page-container"><p>Ocorrência não encontrada ou dados incompletos.</p></main>;
  }

  return (
    <main className="manage-page-container">
      <div className="manage-box view-occurrence-box">
        <h1 className="manage-title">Ocorrência #{occurrence.id}</h1>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="occurrence-view-form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="status_id">Status</label>
              <select
                id="status_id"
                name="status_id"
                value={form.status_id || ''}
                onChange={handleChange}
                required
              >
                <option value="">Selecione o status</option>
                {statusOptions.map(status => (
                  <option key={status.id} value={status.id}>{status.nome}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="titulo">Título</label>
              <input
                type="text"
                id="titulo"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                placeholder="Título da ocorrência"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="data_registro">Data Registro</label>
              <input
                type="text"
                id="data_registro"
                name="data_registro"
                value={occurrence.data_registro}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="endereco">Endereço</label>
              <input
                type="text"
                id="endereco"
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                placeholder="Endereço da ocorrência"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="data_finalizacao">Data Finalização</label>
              <input
                type="text"
                id="data_finalizacao"
                name="data_finalizacao"
                value={occurrence.data_finalizacao || 'N/A'}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="usuario_nome">Usuário Responsável</label>
              <input
                type="text"
                id="usuario_nome"
                name="usuario_nome"
                value={occurrence.usuario_nome || 'N/A'}
                readOnly
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="orgao_responsavel_id">Órgão Responsável</label>
              <select
                id="orgao_responsavel_id"
                name="orgao_responsavel_id"
                value={form.orgao_responsavel_id || ''}
                onChange={handleChange}
              >
                <option value="">Nenhum</option>
                {organizationOptions.map(org => (
                  <option key={org.id} value={org.id}>{org.nome}</option>
                ))}
              </select>
            </div>
            
            <div className="form-group image-display-group">
                <label>Imagens</label>
                <div className="current-images-container">
                    {occurrence.imagens.length > 0 ? (
                        occurrence.imagens.map((imgUrl, idx) => (
                            <img key={idx} src={imgUrl} alt={`Imagem ${idx + 1}`} className="current-image-thumbnail" />
                        ))
                    ) : (
                        <p>Nenhuma imagem existente.</p>
                    )}
                </div>
                <small className="form-text-info">As imagens são gerenciadas separadamente. Para adicionar ou remover, utilize a interface de gerenciamento de arquivos se disponível.</small>
            </div>
          </div>

          <div className="form-group full-width-description">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Descreva detalhadamente a ocorrência..."
              rows={6}
              required
            ></textarea>
          </div>

          {/* Adicione o MapComponent aqui, se as coordenadas estiverem disponíveis */}
          {occurrence.latitude !== null && occurrence.longitude !== null && (
            <div className="form-group full-width-map" style={{ marginBottom: '20px' }}>
              <label>Localização no Mapa</label>
              <MapComponent 
                latitude={occurrence.latitude} 
                longitude={occurrence.longitude} 
                popupText={occurrence.endereco} 
                zoom={15} // Ajuste o zoom conforme necessário
              />
            </div>
          )}

          <div className="modal-actions">
            <button type="submit" className="btn-primary">Salvar</button>
            <button type="button" className="btn-secondary-modal" onClick={() => navigate('/gerenciar-ocorrencias')}>Voltar</button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ViewOccurrencePage;