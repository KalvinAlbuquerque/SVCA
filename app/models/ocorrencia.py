# models/ocorrencia.py
from .. import db
from datetime import datetime

# Se 'ocorrencia_ponto_monitoramento' for uma tabela de associação global,
# ela pode ser definida em models/__init__.py ou em um arquivo próprio.
# Por simplicidade, vou colocá-la aqui para garantir que esteja definida antes de Ocorrencia
# e PontoMonitoramento, caso PontoMonitoramento não esteja aqui.

# Tabela de associação (se Ocorrencia e PontoMonitoramento tiverem muitos-para-muitos)
# Certifique-se de que está definida onde é necessária ou em um arquivo compartilhado.
ocorrencia_ponto_monitoramento = db.Table('ocorrencia_ponto_monitoramento',
    db.Column('ocorrencia_id', db.Integer, db.ForeignKey('ocorrencia.id'), primary_key=True),
    db.Column('ponto_monitoramento_id', db.Integer, db.ForeignKey('ponto_monitoramento.id'), primary_key=True)
)

class StatusOcorrencia(db.Model):
    __tablename__ = 'status_ocorrencia'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False, unique=True)
    ocorrencias = db.relationship('Ocorrencia', backref='status_ocorrencia', lazy=True)

    def __repr__(self):
        return f"<StatusOcorrencia {self.nome}>"

# Você precisará criar e importar as outras classes de modelo como Imagem,
# OrgaoResponsavel, Notificacao, Coordenada, TipoPontuacao, PontoMonitoramento
# em seus próprios arquivos (ex: models/imagem.py)
# Exemplo de como importá-los AQUI se você quiser usar seus objetos dentro de Ocorrencia
# from .imagem import Imagem
# from .orgao_responsavel import OrgaoResponsavel
# from .coordenada import Coordenada
# from .tipo_pontuacao import TipoPontuacao
# from .ponto_monitoramento import PontoMonitoramento

class Ocorrencia(db.Model):
    __tablename__ = 'ocorrencia'
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(255), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    data_registro = db.Column(db.Date, nullable=False, default=datetime.now().date())
    data_finalizacao = db.Column(db.Date)
    endereco = db.Column(db.String(255))

    status_id = db.Column(db.Integer, db.ForeignKey('status_ocorrencia.id'), nullable=False)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    orgao_responsavel_id = db.Column(db.Integer, db.ForeignKey('orgao_responsavel.id')) # Adicione a classe OrgaoResponsavel
    coordenada_id = db.Column(db.Integer, db.ForeignKey('coordenada.id')) # Adicione a classe Coordenada
    tipo_pontuacao_id = db.Column(db.Integer, db.ForeignKey('tipo_pontuacao.id')) # Adicione a classe TipoPontuacao
    
    justificativa_recusa = db.Column(db.Text) # *** NOVO CAMPO ***


    # Relacionamentos (precisam que as classes referenciadas existam e estejam importadas)
    coordenada = db.relationship('Coordenada', backref='ocorrencia_associada', lazy=True) 
    imagens = db.relationship('Imagem', backref='ocorrencia', lazy=True, cascade="all, delete-orphan") # Adicione a classe Imagem
    historico_notificacoes = db.relationship('Notificacao', backref='ocorrencia_historico', lazy=True, cascade="all, delete-orphan") # Adicione a classe Notificacao
    pontos_monitoramento = db.relationship('PontoMonitoramento', secondary=ocorrencia_ponto_monitoramento, back_populates='ocorrencias', lazy=True) # Adicione a classe PontoMonitoramento

    def __repr__(self):
        return f"<Ocorrencia {self.titulo} - Status: {self.status_ocorrencia.nome if self.status_ocorrencia else 'N/A'}>"