# SVCA/app/models/ponto_monitoramento.py
from .. import db # Importa db de SVCA/app/__init__.py
from .coordenada import Coordenada # Importa Coordenada do mesmo pacote models

class PontoMonitoramento(db.Model):
    __tablename__ = 'ponto_monitoramento'
    id = db.Column(db.Integer, primary_key=True)
    endereco = db.Column(db.String(255))
    status = db.Column(db.Boolean, nullable=False)

    coordenada_id = db.Column(db.Integer, db.ForeignKey('coordenada.id'))
    # Relacionamento: Um PontoMonitoramento tem uma Coordenada
    coordenada = db.relationship('Coordenada', backref='pontos_monitoramento', lazy=True)

    # Relacionamento de muitos-para-muitos com Ocorrencia
    # A tabela de associação 'ocorrencia_ponto_monitoramento' é definida em ocorrencia.py
    # Então, importamos Ocorrencia e a tabela de associação.
    from .ocorrencia import Ocorrencia, ocorrencia_ponto_monitoramento # Importe para usar no relacionamento
    ocorrencias = db.relationship(
        'Ocorrencia',
        secondary=ocorrencia_ponto_monitoramento,
        back_populates='pontos_monitoramento',
        lazy=True
    )

    def __repr__(self):
        return f"<PontoMonitoramento {self.endereco}>"