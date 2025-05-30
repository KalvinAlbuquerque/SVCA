# SVCA/app/models/imagem.py
from .. import db # Importa db de SVCA/app/__init__.py

class Imagem(db.Model):
    __tablename__ = 'imagem'
    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(255), nullable=False)

    # Chave estrangeira para Ocorrencia
    ocorrencia_id = db.Column(db.Integer, db.ForeignKey('ocorrencia.id'), nullable=False)
    # Relacionamento: Uma Imagem pertence a uma Ocorrencia (backref já definido em Ocorrencia)

    def __repr__(self):
        return f"<Imagem {self.url}>"