// frontend-svca/src/components/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
  id: number;
  nome: string; // Já vem o nome completo
  email: string;
  telefone: string;
  cpf?: string;
  perfil: string;
  pontos: number;
  avatar_url?: string; // Se você tiver o avatar_url no banco de dados
}

interface Occurrence {
  id: number;
  titulo: string;
  descricao: string;
  endereco: string;
  data_registro: string;
  status: string; // Nome do status
  imagens: string[];
}

const ProfilePage: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [occurrences, setOccurrences] = useState<Occurrence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch User Profile
        const profileResponse = await fetch('http://localhost:5000/user-profile', {
          method: 'GET',
          credentials: 'include',
        });

        if (!profileResponse.ok) {
          if (profileResponse.status === 401) {
            navigate('/login');
            return;
          }
          const errorData = await profileResponse.json();
          throw new Error(errorData.error || 'Falha ao carregar perfil.');
        }
        const profileData: UserProfile = await profileResponse.json();
        setUserProfile(profileData);

        // Fetch User's Occurrences
        const occurrencesResponse = await fetch('http://localhost:5000/my-occurrences', {
          method: 'GET',
          credentials: 'include',
        });

        if (!occurrencesResponse.ok) {
          const errorData = await occurrencesResponse.json();
          throw new Error(errorData.error || 'Falha ao carregar ocorrências.');
        }
        const occurrencesData: Occurrence[] = await occurrencesResponse.json();
        // Filtra apenas as ocorrências com status 'Fechada com solução' para "Ocorrências Validadas"
        const validatedOccurrences = occurrencesData.filter(
          (occ) => occ.status === 'Fechada com solução'
        );
        setOccurrences(validatedOccurrences);

      } catch (err: any) {
        console.error("Erro ao carregar dados do perfil:", err);
        setError(err.message || 'Ocorreu um erro ao carregar seu perfil e ocorrências.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <main className="profile-page-container">
        <p className="loading-message">Carregando perfil...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="profile-page-container">
        <p className="error-message">{error}</p>
      </main>
    );
  }

  if (!userProfile) {
    return (
      <main className="profile-page-container">
        <p className="no-profile-message">Perfil não encontrado.</p>
      </main>
    );
  }

  // Define um avatar padrão se nenhum avatar_url for fornecido pelo backend
  const displayAvatar = userProfile.avatar_url || '/Perfil.png'; // Use a imagem padrão que você enviou

  return (
    <main className="profile-page-container">
      <div className="profile-box">
        <div className="profile-header">
          <img src={displayAvatar} alt="Avatar do Usuário" className="profile-avatar" />
          <h1 className="profile-name">{userProfile.nome}</h1>
          <p className="profile-points">{userProfile.pontos} Pontos</p>
        </div>

        <h2 className="section-title">Ocorrências Validadas</h2>
        <div className="validated-occurrences-section">
          {occurrences.length === 0 ? (
            <p className="no-occurrences-message">Nenhuma ocorrência validada encontrada.</p>
          ) : (
            <div className="occurrences-list">
              {occurrences.map((occ) => (
                <div key={occ.id} className="occurrence-card">
                  <h3 className="occurrence-card-title">{occ.titulo}</h3>
                  <p className="occurrence-card-status">Status: <span>{occ.status}</span></p>
                  <p className="occurrence-card-address">Endereço: {occ.endereco}</p>
                  <p className="occurrence-card-date">Registrado em: {occ.data_registro}</p>
                  {/* Você pode adicionar mais detalhes ou imagens se quiser */}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;