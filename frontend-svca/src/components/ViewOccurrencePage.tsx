// frontend-svca/src/components/ViewOccurrencePage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import MapComponent from './MapComponent';

// Interface para os dados completos da ocorrência (como vêm do backend)
interface OccurrenceDetail {
  id: number;
  titulo: string;
  descricao: string;
  endereco: string;
  data_registro: string;
  data_finalizacao: string | null;
  status_id: number;
  status_nome: string;
  usuario_id: number;
  usuario_nome: string;
  orgao_responsavel_id: number | null;
  orgao_responsavel_nome?: string;
  imagens: string[];
  latitude: number | null;
  longitude: number | null;
  historico_notificacoes: NotificationRecord[];
  justificativa_recusa: string | null; // *** NOVO CAMPO ***
}

// Interface para o histórico de notificações
interface NotificationRecord {
  mensagem: string;
  data_envio: string;
  email_destino: string;
}

// Interface para os dados do formulário (o que pode ser editado e enviado)
interface OccurrenceFormData {
  titulo: string;
  descricao: string;
  endereco: string;
  status_id: number;
  orgao_responsavel_id: number | null;
  justificativa_recusa: string; // *** NOVO CAMPO NO FORM ***
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [occurrence, setOccurrence] = useState<OccurrenceDetail | null>(null);
  const [form, setForm] = useState<OccurrenceFormData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [statusOptions, setStatusOptions] = useState<StatusOption[]>([]);
  const [organizationOptions, setOrganizationOptions] = useState<OrganizationOption[]>([]);

  const userProfile = localStorage.getItem('userProfile');
  const canEdit = userProfile === 'Administrador' || userProfile === 'Moderador';

  const isManagementRoute = location.pathname.startsWith('/gerenciar-ocorrencias');
  const fetchUrl = isManagementRoute 
    ? `http://localhost:5000/occurrence/${id}`
    : `http://localhost:5000/view-occurrence/${id}`;

  const fetchOccurrenceDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const occurrenceResponse = await fetch(fetchUrl, {
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

      if (canEdit) {
        const statusResponse = await fetch('http://localhost:5000/status-ocorrencias', { credentials: 'include' });
        if (!statusResponse.ok) {
          throw new Error('Falha ao buscar opções de status.');
        }
        const statusData: StatusOption[] = await statusResponse.json();
        setStatusOptions(statusData);

        const orgResponse = await fetch('http://localhost:5000/orgaos-responsaveis', { credentials: 'include' });
        if (!orgResponse.ok) {
          throw new Error('Falha ao buscar opções de órgãos responsáveis.');
        }
        const orgData: OrganizationOption[] = await orgResponse.json();
        setOrganizationOptions(orgData);
      }

      setForm({
        titulo: occurrenceData.titulo,
        descricao: occurrenceData.descricao,
        endereco: occurrenceData.endereco,
        status_id: occurrenceData.status_id,
        orgao_responsavel_id: occurrenceData.orgao_responsavel_id,
        justificativa_recusa: occurrenceData.justificativa_recusa || '', // *** INICIALIZA O CAMPO ***
      });

    } catch (err: any) {
      console.error("Erro ao carregar dados:", err);
      setError(err.message || 'Ocorreu um erro ao carregar os dados da ocorrência.');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchOccurrenceDetails();
  }, [id, navigate, fetchUrl, canEdit]);

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

    if (!canEdit) {
      setMessage({ type: 'error', text: 'Você não tem permissão para editar esta ocorrência.' });
      return;
    }

    // Obter o ID do status 'Recusada' para validação
    const recusadaStatus = statusOptions.find(s => s.nome === 'Recusada');

    if (!form || !form.titulo || !form.descricao || !form.endereco || !form.status_id) {
        setMessage({ type: 'error', text: 'Título, Descrição, Endereço e Status são obrigatórios.' });
        return;
    }

    // Validação da justificativa se o status for 'Recusada'
    if (recusadaStatus && form.status_id === recusadaStatus.id && !form.justificativa_recusa) {
        setMessage({ type: 'error', text: 'Justificativa é obrigatória para recusar a ocorrência.' });
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
          // Envia a justificativa_recusa APENAS se o status selecionado for 'Recusada'
          justificativa_recusa: (recusadaStatus && form.status_id === recusadaStatus.id) 
                                ? form.justificativa_recusa 
                                : null,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Ocorrência atualizada com sucesso!' });
        fetchOccurrenceDetails(); // Recarrega os detalhes para atualizar o histórico de notificações e justificativa
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao atualizar ocorrência.' });
      }
    } catch (err: any) {
      console.error("Erro na requisição de atualização:", err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  // ... (handleSendNotification como está) ...
  const handleSendNotification = async () => { /* ... */ };


  if (loading) {
    return <main className="manage-page-container"><p className="loading-message">Carregando detalhes da ocorrência...</p></main>;
  }

  if (error) {
    return <main className="manage-page-container"><p className="error-message">{error}</p></main>;
  }

  if (!occurrence || !form) {
    return <main className="manage-page-container"><p>Ocorrência não encontrada ou dados incompletos.</p></main>;
  }

  const isSendNotificationDisabled = !occurrence.orgao_responsavel_id || !canEdit;

  // Encontra o status 'Recusada' para checagem na UI
  const recusadaStatusOption = statusOptions.find(s => s.nome === 'Recusada');
  // Verifica se o status selecionado atualmente no formulário é 'Recusada'
  const isRecusadaSelected = form.status_id === recusadaStatusOption?.id;

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
                disabled={!canEdit}
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
                disabled={!canEdit}
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
                disabled={!canEdit}
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
                disabled={!canEdit}
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
              disabled={!canEdit}
            ></textarea>
          </div>

          {/* *** CAMPO DE JUSTIFICATIVA RECUSA (NOVO) *** */}
          {canEdit && isRecusadaSelected && (
            <div className="form-group full-width-description">
              <label htmlFor="justificativa_recusa">Justificativa da Recusa</label>
              <textarea
                id="justificativa_recusa"
                name="justificativa_recusa"
                value={form.justificativa_recusa}
                onChange={handleChange}
                placeholder="Explique o motivo da recusa desta ocorrência..."
                rows={4}
                required={isRecusadaSelected} // Torna obrigatório apenas se 'Recusada' selecionado
                disabled={!canEdit}
              ></textarea>
            </div>
          )}
          {/* Exibir justificativa em modo de visualização se o status for Recusada */}
          {!canEdit && occurrence.status_nome === 'Recusada' && occurrence.justificativa_recusa && (
            <div className="form-group full-width-description">
              <label>Justificativa da Recusa</label>
              <p style={{
                backgroundColor: '#f0f0f0', 
                padding: '12px 15px', 
                borderRadius: '11px', 
                fontSize: '1rem', 
                color: 'var(--text-dark)',
                minHeight: '47px'
              }}>{occurrence.justificativa_recusa}</p>
            </div>
          )}


          {occurrence.latitude !== null && occurrence.longitude !== null && (
            <div className="form-group full-width-map" style={{ marginBottom: '20px' }}>
              <label>Localização no Mapa</label>
              <MapComponent 
                occurrences={[{
                  id: occurrence.id,
                  titulo: occurrence.titulo,
                  endereco: occurrence.endereco,
                  latitude: occurrence.latitude,
                  longitude: occurrence.longitude,
                  status: occurrence.status_nome,
                  showMarker: true,
                  showCircle: false,
                }]}
                initialZoom={15}
                circleRadius={500}
                circleColor="#008BCC"
                mapHeight="400px"
                showAllMarkers={false}
                showAllCircles={false}
              />
            </div>
          )}

          {/* Seção: Histórico de Notificações */}
          {canEdit && (
            <div className="section-title" style={{marginTop: '30px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
                Histórico de Notificações
            </div>
          )}
          {canEdit && occurrence.historico_notificacoes && occurrence.historico_notificacoes.length > 0 && (
            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px', maxHeight: '200px', overflowY: 'auto' }}>
              {occurrence.historico_notificacoes.map((notif, index) => (
                <p key={index} style={{ fontSize: '0.9rem', marginBottom: '5px', borderBottom: '1px dashed #eee', paddingBottom: '5px' }}>
                  <strong>{notif.data_envio}:</strong> {notif.mensagem} (para {notif.email_destino})
                </p>
              ))}
            </div>
          )}
          {canEdit && (!occurrence.historico_notificacoes || occurrence.historico_notificacoes.length === 0) && (
            <p style={{textAlign: 'center', color: '#666', marginBottom: '20px'}}>Nenhuma notificação enviada ainda.</p>
          )}

          <div className="modal-actions">
            {canEdit && (
                <>
                    <button type="submit" className="btn-primary">Salvar</button>
                    <button 
                        type="button" 
                        className="btn-primary" 
                        onClick={handleSendNotification} 
                        disabled={isSendNotificationDisabled}
                        style={{ backgroundColor: isSendNotificationDisabled ? '#ccc' : '#28a745' }}
                    >
                        Enviar Notificação
                    </button>
                </>
            )}
            <button type="button" className="btn-secondary-modal" onClick={() => navigate(-1)}>Voltar</button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default ViewOccurrencePage;