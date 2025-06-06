// frontend-svca/src/components/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    email: '',
    apelido: '',
    nome: '',
    sobrenome: '',
    // Remova a linha abaixo
    // cpf: '', // LINHA A SER REMOVIDA
    telefone: '',
    senha: '',
    confirma_senha: ''
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (form.senha !== form.confirma_senha) {
      setMessage({ type: 'error', text: 'As senhas não coincidem.' });
      return;
    }

    if (form.senha.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter pelo menos 6 caracteres.' });
      return;
    }

    if (!form.email || !form.apelido || !form.nome || !form.telefone || !form.senha || !form.confirma_senha) {
      setMessage({ type: 'error', text: 'Por favor, preencha todos os campos obrigatórios.' });
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: form.email,
          nome: form.nome,
          sobrenome: form.sobrenome,
          telefone: form.telefone,
          // Remova a linha abaixo
          // cpf: form.cpf, // LINHA A SER REMOVIDA
          senha: form.senha,
          confirma_senha: form.confirma_senha
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Registro realizado com sucesso!' });
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao registrar usuário.' });
      }
    } catch (error) {
      console.error("Erro na requisição de registro:", error);
      setMessage({ type: 'error', text: 'Erro ao conectar ao servidor. Tente novamente mais tarde.' });
    }
  };

  return (
    <main className="login-container">
      <div className="login-box register-box">
        <div className="logo-area">
          <img src="/logo.png" alt="Vigilância Comunitária da Água Logo" className="app-logo" />
        </div>
        <h1 className="app-title">Vigilância Comunitária da Água</h1>
        <p className="slogan">Promovendo o acesso a água limpa<br />em comunidades</p>

        {message && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" placeholder="Insira seu e-mail..." required value={form.email} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="apelido">Apelido</label>
              <input type="text" id="apelido" name="apelido" placeholder="Insira seu apelido..." required value={form.apelido} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nome">Nome</label>
              <input type="text" id="nome" name="nome" placeholder="Insira seu nome..." required value={form.nome} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="sobrenome">Sobrenome</label>
              <input type="text" id="sobrenome" name="sobrenome" placeholder="Insira seu sobrenome..." value={form.sobrenome} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            {/* Remova o div completo abaixo */}
            {/*
            <div className="form-group">
              <label htmlFor="cpf">CPF (Opcional)</label>
              <input type="text" id="cpf" name="cpf" placeholder="Insira seu CPF..." value={form.cpf} onChange={handleChange} />
            </div>
            */}
            <div className="form-group">
              <label htmlFor="telefone">Telefone</label>
              <input type="tel" id="telefone" name="telefone" placeholder="Insira seu telefone..." required value={form.telefone} onChange={handleChange} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="senha">Senha</label>
              <input type="password" id="senha" name="senha" placeholder="Insira sua senha..." required value={form.senha} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label htmlFor="confirma_senha">Repita sua senha</label>
              <input type="password" id="confirma_senha" name="confirma_senha" placeholder="Repita sua senha..." required value={form.confirma_senha} onChange={handleChange} />
            </div>
          </div>
          
          <button type="submit" className="btn-primary">Criar conta</button>
        </form>
      </div>
    </main>
  );
};

export default RegisterPage;