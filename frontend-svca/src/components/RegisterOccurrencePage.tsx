import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterOccurrencePage: React.FC = () => {
  const [titulo, setTitulo] = useState<string>('');
  const [endereco, setEndereco] = useState<string>('');
  const [descricao, setDescricao] = useState<string>('');
  const [imagens, setImagens] = useState<File[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagens(prev => [...prev, ...Array.from(e.target.files || [])]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!titulo || !endereco || !descricao) {
      setMessage({ type: 'error', text: 'Título, Endereço e Descrição são obrigatórios.' });
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('endereco', endereco);
    formData.append('descricao', descricao);
    
    imagens.forEach((file) => {
      formData.append('imagens', file);
    });

    try {
      const response = await fetch('http://localhost:5000/register-occurrence', { // <--- MUDANÇA AQUI
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Ocorrência registrada com sucesso!' });
        setTitulo('');
        setEndereco('');
        setDescricao('');
        setImagens([]);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao registrar ocorrência.' });
      }
    } catch (error) {
      console.error("Erro na requisição de registro de ocorrência:", error);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  return (
    <main className="login-container">
      <div className="login-box register-occurrence-box">
        <div className="logo-area">
          <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" className="app-logo" />
        </div>
        <h1 className="app-title">Registrar Ocorrência</h1>
        <p className="slogan">Ajude-nos a monitorar a qualidade da água em sua comunidade.</p>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="register-occurrence-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título</label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              placeholder="Ex: Vazamento na Rua X..."
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="endereco">Endereço</label>
            <input
              type="text"
              id="endereco"
              name="endereco"
              placeholder="Ex: Rua Y, 123 - Bairro Z"
              required
              value={endereco}
              onChange={(e) => setEndereco(e.target.value)}
            />
          </div>
          <div className="form-group file-input-group">
            <label htmlFor="imagens">Adicionar Imagens</label>
            <input
              type="file"
              id="imagens"
              name="imagens"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="custom-file-input" onClick={() => document.getElementById('imagens')?.click()}>
              + Clique para adicionar imagens ({imagens.length} selecionada(s))
            </div>
            {imagens.length > 0 && (
              <div className="selected-images-preview">
                {imagens.map((file, index) => (
                  <span key={index} className="image-tag">{file.name}</span>
                ))}
              </div>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descrição</label>
            <textarea
              id="descricao"
              name="descricao"
              placeholder="Descreva detalhadamente a ocorrência..."
              rows={6}
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            ></textarea>
          </div>
          
          <button type="submit" className="btn-primary">Registre sua ocorrência</button>
        </form>
      </div>
    </main>
  );
};

export default RegisterOccurrencePage;