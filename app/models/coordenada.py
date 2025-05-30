# SVCA/app/models/coordenada.py
from .. import db # Importa db de SVCA/app/__init__.py

class Coordenada(db.Model):
    __tablename__ = 'coordenada'
    id = db.Column(db.Integer, primary_key=True)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)

    # Relacionamentos definidos nos outros modelos, como Ocorrencia e PontoMonitoramento
    # ocorrencias = db.relationship('Ocorrencia', backref='coordenada_ocorrencia', lazy=True)
    # pontos_monitoramento = db.relationship('PontoMonitoramento', backref='coordenada_ponto', lazy=True)
    # Não defina os backrefs aqui se eles já estão definidos do outro lado com um nome específico.
    # A linha 'coordenada = db.relationship('Coordenada', backref='pontos_monitoramento', lazy=True)'
    # em PontoMonitoramento já cria o backref 'pontos_monitoramento' aqui.

    def __repr__(self):
        return f"<Coordenada Lat: {self.latitude}, Lon: {self.longitude}>"