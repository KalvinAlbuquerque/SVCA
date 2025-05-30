# SVCA/app/models/tipo_pontuacao.py
from .. import db # Importa db de SVCA/app/__init__.py

class TipoPontuacao(db.Model):
    __tablename__ = 'tipo_pontuacao' # Nome da tabela no banco de dados
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False, unique=True) # Ex: "Ocorrencia/qualidade", "CorrenciaSolucionada"

    # Relacionamento: Um TipoPontuacao pode estar associado a várias Ocorrências
    ocorrencias = db.relationship('Ocorrencia', backref='tipo_pontuacao', lazy=True)

    def __repr__(self):
        """
        Método de representação da classe, útil para depuração.
        """
        return f"<TipoPontuacao {self.nome}>"