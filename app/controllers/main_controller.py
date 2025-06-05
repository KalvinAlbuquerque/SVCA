import os # Para lidar com caminhos de arquivo
import uuid # Para gerar nomes de arquivo únicos
from datetime import datetime # Para data_registro
from flask import Blueprint, request, jsonify, session, url_for # Adicionado url_for para URLs de imagem
from ..models.usuario import Usuario
from ..models.ocorrencia import Ocorrencia, StatusOcorrencia # Importe Ocorrencia e StatusOcorrencia
from ..models.coordenada import Coordenada # Importe Coordenada se for criar/associar
from ..models.imagem import Imagem # Importe Imagem para lidar com upload
from ..models.perfil import Perfil # Importe Perfil
from .. import db

main_bp = Blueprint('main', __name__)

# --- Funções de login e registro ---
@main_bp.route('/')
@main_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({'error': 'Por favor, preencha todos os campos.'}), 400

        user = Usuario.query.filter_by(email=email).first()
        print(user)

        if user and user.autenticar(password):
            session['user_id'] = user.id
            session['user_name'] = user.nome
            session['user_profile'] = user.perfil.nome
            return jsonify({
                'message': f'Bem-vindo, {user.nome}!',
                'user_id': user.id,
                'user_name': user.nome,
                'user_profile': user.perfil.nome
            }), 200
        else:
            return jsonify({'error': 'Email ou senha incorretos.'}), 401
    return "Backend em funcionamento. Acesse o frontend React."

@main_bp.route('/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return '', 200 # CORS preflight

    data = request.get_json()
    nome = data.get('nome')
    sobrenome = data.get('sobrenome')
    email = data.get('email')
    telefone = data.get('telefone')
    cpf = data.get('cpf')
    senha = data.get('senha')
    confirma_senha = data.get('confirma_senha')

    if not nome or not email or not telefone or not senha or not confirma_senha:
        return jsonify({'error': 'Por favor, preencha todos os campos obrigatórios.'}), 400
    if senha != confirma_senha:
        return jsonify({'error': 'As senhas não coincidem.'}), 400
    if len(senha) < 6:
        return jsonify({'error': 'A senha deve ter pelo menos 6 caracteres.'}), 400

    existing_user = Usuario.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Este e-mail já está cadastrado.'}), 409

    try:
        perfil_usuario = Perfil.query.filter_by(nome='Usuario').first()
        if not perfil_usuario:
            return jsonify({'error': 'Perfil de usuário padrão não encontrado. Contate o administrador.'}), 500
        
        nome_completo = f"{nome} {sobrenome}".strip()

        new_user = Usuario.criar(
            nome=nome_completo,
            email=email,
            telefone=telefone,
            senha_plana=senha,
            perfil_id=perfil_usuario.id
        )
        return jsonify({'message': 'Usuário registrado com sucesso!'}), 201
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao registrar usuário: {e}")
        return jsonify({'error': 'Ocorreu um erro ao registrar o usuário.'}), 500

@main_bp.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return jsonify({'error': 'Você precisa estar logado para acessar esta página.'}), 401
    user_name = session.get('user_name', 'Usuário')
    return jsonify({'message': f'Bem-vindo ao dashboard, {user_name}!'})

@main_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('user_name', None)
    session.pop('user_profile', None)
    return jsonify({'message': 'Você foi desconectado.'}), 200

# --- Rota para Registrar Ocorrência ---
@main_bp.route('/register-occurrence', methods=['POST', 'OPTIONS'])
def register_occurrence():
    if request.method == 'OPTIONS':
        return '', 200 # CORS preflight

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Você precisa estar logado para registrar uma ocorrência.'}), 401

    current_user = Usuario.query.get(user_id)
    if not current_user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    # Para lidar com upload de arquivos (imagens) e dados de formulário ao mesmo tempo,
    # o frontend enviará 'multipart/form-data'. Usamos request.form para texto
    # e request.files para arquivos.
    
    titulo = request.form.get('titulo')
    endereco = request.form.get('endereco')
    descricao = request.form.get('descricao')
    
    # Validação básica
    if not titulo or not endereco or not descricao:
        return jsonify({'error': 'Título, Endereço e Descrição são obrigatórios.'}), 400

    try:
        status_em_andamento = StatusOcorrencia.query.filter_by(nome='Em andamento').first()
        if not status_em_andamento:
            return jsonify({'error': "Status 'Em andamento' não encontrado. Contate o administrador."}), 500

        nova_ocorrencia = Ocorrencia(
            titulo=titulo,
            descricao=descricao,
            data_registro=datetime.now().date(),
            endereco=endereco,
            status_id=status_em_andamento.id,
            usuario_id=current_user.id
        )
        db.session.add(nova_ocorrencia)
        db.session.flush() # Para que nova_ocorrencia.id esteja disponível antes do commit

        uploaded_images = []
        if 'imagens' in request.files:
            files = request.files.getlist('imagens') 
            
            # Diretório para salvar imagens (deve existir e ser acessível)
            # Ex: SVCA/app/static/uploads/ocorrencias/
            UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads', 'ocorrencias')
            os.makedirs(UPLOAD_FOLDER, exist_ok=True) # Cria o diretório se não existir

            for file in files:
                if file and file.filename:
                    filename_ext = os.path.splitext(file.filename)
                    unique_filename = f"{uuid.uuid4().hex}{filename_ext[1]}"
                    file_path = os.path.join(UPLOAD_FOLDER, unique_filename)
                    file.save(file_path)

                    image_url = url_for('static', filename=f'uploads/ocorrencias/{unique_filename}', _external=True)
                    new_image = Imagem(url=image_url, ocorrencia_id=nova_ocorrencia.id)
                    db.session.add(new_image)
                    uploaded_images.append(image_url)

        db.session.commit()
        return jsonify({'message': 'Ocorrência registrada com sucesso!', 'ocorrencia_id': nova_ocorrencia.id, 'imagens_urls': uploaded_images}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao registrar ocorrência: {e}")
        return jsonify({'error': f'Ocorreu um erro ao registrar a ocorrência: {str(e)}'}), 500