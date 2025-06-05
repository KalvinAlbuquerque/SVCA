// frontend-svca/src/components/ContactPage.tsx
import React from 'react';

const ContactPage: React.FC = () => {
  return (
    <main className="manage-page-container"> {/* Reutilizando o container de gerenciamento para o layout */}
      <div className="manage-box"> {/* Reutilizando a caixa de gerenciamento */}
        <h1 className="manage-title">Contato</h1> {/* Título principal */}

        <div className="contact-info-section">
          <p>Glenda Santana - Desenvolvedora (glendaeaa1@gmail.com)</p>
          <p>Kalvin Albuquerque - Desenvolvedor (kalvinalbuquerque5@gmail.com)</p>
        </div>

        <h2 className="section-title">Equipe</h2> {/* Título para a seção da equipe */}
        <div className="team-section">
          <p className="team-placeholder">Equipe</p> {/* Texto dentro da caixa da equipe */}
        </div>
      </div>
    </main>
  );
};

export default ContactPage;