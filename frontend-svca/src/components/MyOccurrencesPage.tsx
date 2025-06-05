// frontend-svca/src/components/MyOccurrencesPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Occurrence {
  id: number;
  titulo: string;
  descricao: string;
  endereco: string;
  data_registro: string;
  status: string;
  imagens: string[];
}

const MyOccurrencesPage: React.FC = () => {
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOccurrences = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('http://localhost:5000/my-occurrences', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401) {
            navigate('/login'); // Redireciona para o login se não estiver autenticado
            return;
          }
          const errorData = await response.json();
          throw new Error(errorData.error || 'Falha ao buscar ocorrências.');
        }

        const data: Occurrence[] = await response.json();
        setOccurrences(data);
      } catch (err: any) {
        console.error("Erro ao buscar ocorrências:", err);
        setError(err.message || 'Ocorreu um erro ao carregar suas ocorrências.');
      } finally {
        setLoading(false);
      }
    };

    fetchOccurrences();
  }, [navigate]); // navigate é uma dependência para o useEffect

  return (
    <main className="my-occurrences-container">
      <div className="my-occurrences-box">
        <h1 className="my-occurrences-title">Minhas Ocorrências</h1>

        {loading && <p className="loading-message">Carregando ocorrências...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && occurrences.length === 0 && (
          <p className="no-occurrences-message">Você ainda não registrou nenhuma ocorrência.</p>
        )}

        {!loading && !error && occurrences.length > 0 && (
          <div className="occurrences-list">
            {occurrences.map((occ) => (
              <div key={occ.id} className="occurrence-card">
                <h2 className="occurrence-card-title">{occ.titulo}</h2>
                <p className="occurrence-card-status">Status: <span>{occ.status}</span></p>
                <p className="occurrence-card-address">Endereço: {occ.endereco}</p>
                <p className="occurrence-card-date">Registrado em: {occ.data_registro}</p>
                <p className="occurrence-card-description">{occ.descricao}</p>
                {occ.imagens.length > 0 && (
                  <div className="occurrence-images">
                    {occ.imagens.map((imgUrl, idx) => (
                      <img key={idx} src={imgUrl} alt={`Imagem da ocorrência ${occ.id}`} className="occurrence-image-thumbnail" />
                    ))}
                  </div>
                )}
                {/* Adicione um botão para ver detalhes ou editar se quiser */}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyOccurrencesPage;