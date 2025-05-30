# SVCA/app/models/notificacao.py
from .. import db # Importa db de SVCA/app/__init__.py
from datetime import datetime # Para usar em data_envio

class Notificacao(db.Model):
    __tablename__ = 'notificacao'
    id = db.Column(db.Integer, primary_key=True)
    mensagem = db.Column(db.String(255), nullable=False)
    data_envio = db.Column(db.String(100), nullable=False, default=datetime.now().strftime("%Y-%m-%d %H:%M:%S")) # Usando string como no diagrama, mas db.DateTime é recomendado
    email_destino = db.Column(db.String(255))

    # Chave estrangeira para Ocorrencia
    ocorrencia_id = db.Column(db.Integer, db.ForeignKey('ocorrencia.id'), nullable=False)
    # Relacionamento: Uma Notificacao pertence a uma Ocorrencia (backref já definido em Ocorrencia)

    def __repr__(self):
        return f"<Notificacao '{self.mensagem[:20]}...' para {self.email_destino}>"