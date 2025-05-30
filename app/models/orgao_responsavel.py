from .. import db # Importa db de SVCA/app/__init__.py

class OrgaoResponsavel(db.Model):
    
    __tablename__ = 'orgao_responsavel'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False)
    telefone = db.Column(db.String(255), nullable=False)

    # Relacionamento: Um OrgaoResponsavel pode ter várias Ocorrências
    ocorrencias = db.relationship('Ocorrencia', backref='orgao_responsavel', lazy=True)

    def __repr__(self):
        return f"<OrgaoResponsavel {self.nome}>"