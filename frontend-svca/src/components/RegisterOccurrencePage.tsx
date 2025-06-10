// frontend-svca/src/components/RegisterOccurrencePage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterOccurrencePage: React.FC = () => {
  const [titulo, setTitulo] = useState<string>('');
  const [street, setStreet] = useState<string>(''); // Novo campo
  const [houseNumber, setHouseNumber] = useState<string>(''); // Novo campo
  const [neighborhood, setNeighborhood] = useState<string>(''); // Novo campo
  const [city, setCity] = useState<string>(''); // Novo campo
  const [state, setState] = useState<string>(''); // Novo campo
  const [postcode, setPostcode] = useState<string>(''); // Novo campo
  const [descricao, setDescricao] = useState<string>('');
  const [imagens, setImagens] = useState<File[]>([]);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImagens(Array.from(e.target.files));
    }
  };

  const geocodeAddress = async () => {
    // Constrói a string de endereço a partir dos campos separados
    const fullAddress = `${street}, ${houseNumber}, ${neighborhood}, ${city}, ${state}, ${postcode}`.replace(/,(\s*,)+/g, ',').replace(/^,\s*|,\s*$/g, '');

    if (!fullAddress.trim()) {
      setMessage({ type: 'error', text: 'Por favor, preencha os campos de endereço para obter as coordenadas.' });
      return;
    }
    try {
      // Usando Nominatim do OpenStreetMap para geocodificação
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(fullAddress)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        setLatitude(parseFloat(data[0].lat));
        setLongitude(parseFloat(data[0].lon));
        setMessage({ type: 'success', text: 'Coordenadas obtidas com sucesso!' });
      } else {
        setMessage({ type: 'error', text: 'Endereço não encontrado. Por favor, seja mais específico ou verifique os dados.' });
        setLatitude(null);
        setLongitude(null);
      }
    } catch (error) {
      console.error("Erro ao geocodificar endereço:", error);
      setMessage({ type: 'error', text: 'Erro ao obter coordenadas. Tente novamente mais tarde.' });
      setLatitude(null);
      setLongitude(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Constrói a string de endereço a partir dos campos separados para enviar ao backend
    const fullAddressForBackend = `${street}, ${houseNumber}, ${neighborhood}, ${city}, ${state}, ${postcode}`.replace(/,(\s*,)+/g, ',').replace(/^,\s*|,\s*$/g, '');

    if (!titulo || !fullAddressForBackend.trim() || !descricao || latitude === null || longitude === null) {
      setMessage({ type: 'error', text: 'Título, Endereço completo, Descrição e Coordenadas são obrigatórios. Clique em "Obter Coordenadas" após digitar o endereço.' });
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('endereco', fullAddressForBackend); // Envia a string completa do endereço
    formData.append('descricao', descricao);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    
    imagens.forEach((file) => {
      formData.append('imagens', file);
    });

    try {
      const response = await fetch('http://localhost:5000/register-occurrence', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Ocorrência registrada com sucesso! Aguardando validação do moderador.' });
        setTitulo('');
        setStreet(''); // Limpa os novos campos
        setHouseNumber('');
        setNeighborhood('');
        setCity('');
        setState('');
        setPostcode('');
        setDescricao('');
        setImagens([]);
        setLatitude(null);
        setLongitude(null);
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

          <div className="form-row"> {/* Novo form-row para campos de endereço */}
            <div className="form-group">
              <label htmlFor="street">Rua</label>
              <input
                type="text"
                id="street"
                name="street"
                placeholder="Ex: Av. Sete de Setembro"
                required
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="houseNumber">Número</label>
              <input
                type="text"
                id="houseNumber"
                name="houseNumber"
                placeholder="Ex: 123"
                value={houseNumber}
                onChange={(e) => setHouseNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="neighborhood">Bairro</label>
              <input
                type="text"
                id="neighborhood"
                name="neighborhood"
                placeholder="Ex: Centro"
                required
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="city">Cidade</label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Ex: Salvador"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="state">Estado</label>
              <input
                type="text"
                id="state"
                name="state"
                placeholder="Ex: BA"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="postcode">CEP</label>
              <input
                type="text"
                id="postcode"
                name="postcode"
                placeholder="Ex: 40000-000"
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
              />
            </div>
          </div>
          
          <div className="form-group">
            {/* Botão para obter coordenadas */}
            <button type="button" className="btn-primary" onClick={geocodeAddress} style={{ marginTop: '10px' }}>
              Obter Coordenadas do Endereço
            </button>
            {latitude !== null && longitude !== null && (
              <p style={{ marginTop: '10px', fontSize: '0.9rem', color: 'green' }}>
                Coordenadas: Latitude {latitude.toFixed(4)}, Longitude {longitude.toFixed(4)}
              </p>
            )}
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