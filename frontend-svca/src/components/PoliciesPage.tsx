// frontend-svca/src/components/PoliciesPage.tsx
import React from 'react';

const PoliciesPage: React.FC = () => {
  return (
    <main className="policies-page-container">
      <div className="policies-page-box">
        <h1 className="policies-page-title">Políticas de Uso</h1>
        <p className="policies-page-text">
          Para garantir um uso justo, responsável e colaborativo do nosso sistema, estabelecemos as seguintes diretrizes:
        </p>

        <section className="policies-section">
          <h2>Cadastro de Ocorrências</h2>
          <ul>
            <li>Os usuários podem registrar ocorrências relacionadas ao monitoramento da água (vazamentos, desperdícios, falta de abastecimento, etc.).</li>
            <li>Cada ocorrência será avaliada por nossa equipe antes de ser validada.</li>
          </ul>
        </section>

        <section className="policies-section">
          <h2>Sistema de Pontuação</h2>
          <ul>
            <li>+25 pontos: ao ter uma ocorrência validada.</li>
            <li>+25 pontos adicionais: se a ocorrência for resolvida com base no seu registro.</li>
            <li>-10 pontos: se a ocorrência for identificada como falsa ou irrelevante.</li>
          </ul>
        </section>

        <section className="policies-section">
          <h2>Penalidades por Uso Indevido</h2>
          <ul>
            <li>Se um usuário registrar 3 ocorrências falsas, a conta será bloqueada automaticamente por mau uso do sistema.</li>
            <li>Ocorrência falsa é considerada qualquer denúncia propositalmente incorreta, inventada ou sem relação com problemas reais de monitoramento da água.</li>
          </ul>
        </section>

        <section className="policies-section">
          <h2>Regras Gerais</h2>
          <ul>
            <li>Use o sistema de forma responsável, visando o bem coletivo.</li>
            <li>Informações falsas comprometem a eficiência do sistema e prejudicam a comunidade.</li>
            <li>Ao utilizar o sistema, você concorda com estas políticas e entende as consequências de desrespeitá-las.</li>
          </ul>
        </section>
      </div>
    </main>
  );
};

export default PoliciesPage;