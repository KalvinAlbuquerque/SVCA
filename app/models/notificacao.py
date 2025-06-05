# SVCA/app/models/notificacao.py
from .. import db
from datetime import datetime

class Notificacao(db.Model):
    __tablename__ = 'notificacao'
    id = db.Column(db.Integer, primary_key=True)
    mensagem = db.Column(db.String(255), nullable=False)
    data_envio = db.Column(db.String(100), nullable=False, default=datetime.now().strftime("%Y-%m-%d %H:%M:%S")) # Usando string como no diagrama, mas db.DateTime é recomendado
    email_destino = db.Column(db.String(255))

    ocorrencia_id = db.Column(db.Integer, db.ForeignKey('ocorrencia.id'), nullable=False)

    def __repr__(self):
        return f"<Notificacao '{self.mensagem[:20]}...' para {self.email_destino}>"