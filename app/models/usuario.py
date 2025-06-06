# SVCA/app/models/usuario.py
# Importa a instância 'db' do arquivo principal 'run.py'
from .. import db
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(db.Model):
    """
        Classe Usuário.
    """
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    telefone = db.Column(db.String(255))
    senha = db.Column(db.String(255), nullable=False)
    perfil_id = db.Column(db.Integer, db.ForeignKey('perfil.id'), nullable=False)
    avatar_url = db.Column(db.String(255), default='/avatar.svg')
    ocorrencias_recusadas_count = db.Column(db.Integer, default=0, nullable=False) # *** NOVO CAMPO ***
    is_blocked = db.Column(db.Boolean, default=False, nullable=False) # *** NOVO CAMPO ***
    pontos = db.Column(db.Integer, default=0, nullable=False) # *** NOVO CAMPO PARA PONTUAÇÃO ***

    #Relationship
    ocorrencias = db.relationship('Ocorrencia', backref='usuario', lazy=True)

    # --- MÉTODO AUTENTICAR ATUALIZADO ---
    def autenticar(self, senha_digitada):
        """
        Autentica o usuário comparando a senha digitada com a senha hashada armazenada.
        """
        # check_password_hash compara a senha hashada (self.senha) com a senha em texto puro digitada
        return check_password_hash(self.senha, senha_digitada)

    # --- MÉTODO REDEFINIR SENHA ATUALIZADO ---
    def redefinir_senha(self, nova_senha):
        """
        Redefine a senha do usuário, armazenando-a como um hash.
        """
        self.senha = generate_password_hash(nova_senha)
        db.session.add(self)
        db.session.commit()

    @classmethod
    def criar(cls, nome, email, telefone, senha_plana, perfil_id):
        """
        Cria um novo usuário e o salva no banco de dados, hasheando a senha.
        """
        # Hasheia a senha antes de criar o usuário
        senha_hash = generate_password_hash(senha_plana)

        novo_usuario = cls(
            nome=nome,
            email=email,
            telefone=telefone,
            senha=senha_hash,
            perfil_id=perfil_id,
            ocorrencias_recusadas_count=0, # Garante que comece em 0
            is_blocked=False, # Garante que comece como não bloqueado
            pontos=0 # Inicializa pontos como 0
        )
        db.session.add(novo_usuario)
        db.session.commit()
        return novo_usuario

    @classmethod
    def buscar_por_id(cls, usuario_id):
        """
        Retorna o usuário com o ID fornecido, ou None se não encontrado.
        """
        return cls.query.get(usuario_id)

    @classmethod
    def buscar_todos(cls):
        """
        Retorna todos os usuários cadastrados.
        """
        return cls.query.all()
    
    def deletar(self):
        """
        Remove o usuário do banco de dados.
        """
        db.session.delete(self)
        db.session.commit()

    def registrar_ocorrencia(self, titulo, descricao, endereco, coordenada=None, tipo_pontuacao=None):
        """
        Registra uma nova ocorrência associada a este usuário.
        Retorna a nova instância de Ocorrencia.
        """
        from models.ocorrencia import Ocorrencia
        from models.ocorrencia import StatusOcorrencia
        from datetime import datetime

        # O status inicial agora será 'Registrada'
        status_registrada = db.session.query(StatusOcorrencia).filter_by(nome='Registrada').first()
        if not status_registrada:
            raise ValueError("Status 'Registrada' não encontrado. Crie-o na inicialização do banco.")

        nova_ocorrencia = Ocorrencia(
            titulo=titulo,
            descricao=descricao,
            data_registro=datetime.now().date(),
            endereco=endereco,
            coordenada=coordenada,
            status_ocorrencia=status_registrada, # *** MUDANÇA AQUI: Status inicial 'Registrada' ***
            tipo_pontuacao=tipo_pontuacao,
            usuario=self
        )
        return nova_ocorrencia
    
    # Este método não será mais necessário diretamente para calcular pontos totais
    # mas pode ser útil para outras lógicas. A lógica de pontuação será no controller.
    def consultar_pontuacao(self):
        # Esta função agora retorna o valor do campo 'pontos'
        return self.pontos

    def visualizar_denuncias(self):
        return self.ocorrencias.all()

    def __repr__(self):
        return f"<Usuario {self.nome} ({self.email})>"