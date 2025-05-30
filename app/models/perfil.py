# SVCA/app/models/perfil.py
from .. import db # Importa 'db' do __init__.py da pasta 'app' (um nível acima)

class Perfil(db.Model):
    __tablename__ = 'perfil'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False, unique=True)
    usuarios = db.relationship('Usuario', backref='perfil', lazy=True)

    def __repr__(self):
        return f"<Perfil {self.nome}>"