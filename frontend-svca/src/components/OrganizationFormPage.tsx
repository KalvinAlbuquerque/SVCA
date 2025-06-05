// frontend-svca/src/components/OrganizationFormPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface Organization {
  id?: number; // Opcional, pois não existirá para novas organizações
  nome: string;
  email: string;
  telefone: string;
}

const OrganizationFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Pega o ID da URL para modo de edição
  const navigate = useNavigate();
  const [form, setForm] = useState<Organization>({ nome: '', email: '', telefone: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const isEditing = !!id; // Verdadeiro se um ID existe nos parâmetros da URL

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      const fetchOrganization = async () => {
        try {
          const response = await fetch(`http://localhost:5000/orgao-responsavel/${id}`, {
            method: 'GET',
            credentials: 'include',
          });

          if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
              navigate('/login');
              return;
            }
            const errorData = await response.json();
            throw new Error(errorData.error || 'Falha ao buscar detalhes do órgão.');
          }

          const data: Organization = await response.json();
          setForm(data);
        } catch (err: any) {
          console.error("Erro ao buscar órgão:", err);
          setError(err.message || 'Ocorreu um erro ao carregar os dados do órgão.');
        } finally {
          setLoading(false);
        }
      };
      fetchOrganization();
    }
  }, [id, isEditing, navigate]); // Adiciona 'id', 'isEditing' e 'navigate' como dependências

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!form.nome || !form.email || !form.telefone) {
      setMessage({ type: 'error', text: 'Todos os campos (Nome, Email, Telefone) são obrigatórios.' });
      return;
    }

    const url = isEditing ? `http://localhost:5000/orgao-responsavel/${id}` : 'http://localhost:5000/orgao-responsavel';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || `Órgão ${isEditing ? 'atualizado' : 'criado'} com sucesso!` });
        setTimeout(() => {
          navigate('/gerenciar-orgaos'); // Navega de volta para a lista após sucesso
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.error || `Erro ao ${isEditing ? 'atualizar' : 'criar'} órgão.` });
      }
    } catch (err: any) {
      console.error(`Erro na requisição de ${isEditing ? 'atualização' : 'criação'} de órgão:`, err);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  if (loading) {
    return (
      <main className="manage-page-container">
        <p className="loading-message">Carregando formulário...</p>
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
    <main className="login-container"> {/* Reutiliza estilos do container de login para centralização */}
      <div className="login-box register-occurrence-box"> {/* Reutiliza estilos da caixa de registro de ocorrência */}
        <h1 className="app-title">{isEditing ? 'Editar Órgão Responsável' : 'Cadastrar Novo Órgão Responsável'}</h1>
        <p className="slogan">Preencha os dados do órgão responsável.</p>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="register-occurrence-form" onSubmit={handleSubmit}> {/* Reutiliza estilos de formulário */}
          <div className="form-group">
            <label htmlFor="nome">Nome do órgão</label>
            <input
              type="text"
              id="nome"
              name="nome"
              placeholder="Nome completo do órgão"
              required
              value={form.nome}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Email do órgão"
              required
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              type="tel"
              id="telefone"
              name="telefone"
              placeholder="Telefone do órgão (DDD)XXXXX-XXXX"
              required
              value={form.telefone}
              onChange={handleChange}
            />
          </div>
          
          <button type="submit" className="btn-primary">Salvar</button>
          <button type="button" className="btn-secondary-modal" onClick={() => navigate('/gerenciar-orgaos')}>Cancelar</button> {/* Botão de voltar */}
        </form>
      </div>
    </main>
  );
};

export default OrganizationFormPage;