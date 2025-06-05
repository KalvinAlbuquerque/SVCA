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
    avatar_url = db.Column(db.String(255), default='/avatar.svg') # <--- GARANTA QUE ESTA LINHA EXISTE E ESTÁ CORRETA

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
            perfil_id=perfil_id
            # Não é necessário definir avatar_url aqui, o default já cuida
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
        # Importe Ocorrencia e StatusOcorrencia DENTRO da função para evitar importação circular
        # ou se você tiver um models/__init__.py que os importe todos.
        from models.ocorrencia import Ocorrencia
        from models.ocorrencia import StatusOcorrencia
        from datetime import datetime # datetime necessário aqui!

        status_em_andamento = db.session.query(StatusOcorrencia).filter_by(nome='Em andamento').first()
        if not status_em_andamento:
            raise ValueError("Status 'Em andamento' não encontrado. Crie-o na inicialização do banco.")

        nova_ocorrencia = Ocorrencia(
            titulo=titulo,
            descricao=descricao,
            data_registro=datetime.now().date(),
            endereco=endereco,
            coordenada=coordenada,
            status_ocorrencia=status_em_andamento,
            tipo_pontuacao=tipo_pontuacao,
            usuario=self
        )
        # db.session.add(nova_ocorrencia)
        # db.session.commit()
        return nova_ocorrencia

    def consultar_pontuacao(self):
        pontuacao = 0
        for ocorrencia in self.ocorrencias:
            if ocorrencia.status_ocorrencia and ocorrencia.status_ocorrencia.nome == 'Fechada com solução':
                if ocorrencia.tipo_pontuacao and ocorrencia.tipo_pontuacao.nome == 'Ocorrencia/qualidade':
                    pontuacao += 10
                elif ocorrencia.tipo_pontuacao and ocorrencia.tipo_pontuacao.nome == 'CorrenciaSolucionada':
                    pontuacao += 20
        return pontuacao

    def visualizar_denuncias(self):
        return self.ocorrencias.all()

    def __repr__(self):
        return f"<Usuario {self.nome} ({self.email})>"