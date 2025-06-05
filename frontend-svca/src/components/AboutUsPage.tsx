import React from 'react';
// Não precisa importar a imagem como um módulo se ela estiver em /public
// import image_sobre_nos from '/image_sobre_nos.png'; // Comentado, não necessário para public

const AboutUsPage: React.FC = () => {
  return (
    <main className="about-us-page-container">
      <div className="about-us-page-box">
        <h1 className="about-us-page-title">Sobre Nós</h1>
        <p className="about-us-page-text">
          O Sistema Vigilância Comunitária da Água é uma iniciativa voltada para fortalecer a participação cidadã no monitoramento da qualidade da água em comunidades, promovendo saúde pública, sustentabilidade e o acesso à água limpa. Desenvolvido como parte de um projeto acadêmico na Universidade do Estado da Bahia (UNEB)[cite: 5], o sistema tem como objetivo centralizar, organizar e dar visibilidade às denúncias e ocorrências relacionadas ao abastecimento e à condição da água em regiões vulneráveis.
        </p>
        <div className="about-us-image-container">
          <img src="/image_sobre_nos.png" alt="Imagem Sobre Nós" className="about-us-image" /> {/* Caminho direto da raiz pública */}
        </div>
        <p className="about-us-page-text">
          Inspirado no Objetivo de Desenvolvimento Sustentável (ODS) 6 da ONU — “Assegurar a disponibilidade e a gestão sustentável da água e do saneamento para todos” [cite: 3] —, o sistema permite que cidadãos, órgãos públicos e organizações comunitárias colaborem de forma eficiente, utilizando tecnologia para criar um ambiente de transparência, engajamento e ação.
        </p>
        <p className="about-us-page-text">
          Acreditamos que o acesso à informação e o envolvimento comunitário são ferramentas poderosas para transformar a realidade. Por isso, o sistema oferece funcionalidades como envio e acompanhamento de denúncias, mapa interativo com pontos de monitoramento, gráficos de indicadores, sistema de pontuação cidadã e gestão integrada por parte das autoridades competentes.
        </p>
        <p className="about-us-page-text">
          Estamos comprometidos com a construção de uma sociedade mais justa, informada e participativa, onde cada cidadão tem voz e pode contribuir para um futuro com água limpa e segura para todos.
        </p>
      </div>
    </main>
  );
};

export default AboutUsPage;