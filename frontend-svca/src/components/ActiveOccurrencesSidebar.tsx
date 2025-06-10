// frontend-svca/src/components/ActiveOccurrencesSidebar.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ActiveMapOccurrence {
  id: number;
  titulo: string;
  endereco: string;
  status: string;
  data_registro: string; // Adicionado para exibição
}

interface ActiveOccurrencesSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const ActiveOccurrencesSidebar: React.FC<ActiveOccurrencesSidebarProps> = ({ isOpen, onClose }) => {
  const [occurrences, setOccurrences] = useState<ActiveMapOccurrence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) { // Só busca dados se a sidebar estiver visível ou acabou de abrir
      return;
    }

    const fetchActiveOccurrences = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/active-occurrences', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao buscar ocorrências ativas.');
        }

        const data: ActiveMapOccurrence[] = await response.json();
        setOccurrences(data);
      } catch (err: any) {
        console.error("Erro ao buscar ocorrências ativas:", err);
        setError(err.message || 'Ocorreu um erro ao carregar as ocorrências ativas.');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOccurrences();
  }, [isOpen]); // Recarrega quando isOpen muda (se a sidebar for aberta)

  const handleCardClick = (occurrenceId: number) => {
    navigate(`/ocorrencia/${occurrenceId}`);
    onClose(); // Fecha a sidebar ao navegar para a ocorrência
  };

  if (!isOpen) {
    return null; // Não renderiza nada se não estiver aberta
  }

  return (
    <div className="sidebar-overlay">
      <div className="sidebar-content">
        <button className="sidebar-close-button" onClick={onClose}>
          X
        </button>
        <h2 className="sidebar-title">Histórico de Ocorrências Ativas</h2>

        {loading && <p className="loading-message">Carregando ocorrências...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && occurrences.length === 0 && (
          <p className="no-items-message">Nenhuma ocorrência ativa encontrada.</p>
        )}

        {!loading && !error && occurrences.length > 0 && (
          <div className="occurrences-list">
            {occurrences.map((occ) => (
              <div
                key={occ.id}
                className="occurrence-card"
                onClick={() => handleCardClick(occ.id)}
                style={{ cursor: 'pointer' }}
              >
                <h3 className="occurrence-card-title">{occ.titulo}</h3>
                <p className="occurrence-card-status">Status: <span>{occ.status}</span></p>
                <p className="occurrence-card-address">Endereço: {occ.endereco}</p>
                <p className="occurrence-card-date">Registrado em: {occ.data_registro}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveOccurrencesSidebar;