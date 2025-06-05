# SVCA/app/controllers/main_controller.py
import os
import uuid
from datetime import datetime
from flask import Blueprint, request, jsonify, session, url_for
from ..models.usuario import Usuario
from ..models.ocorrencia import Ocorrencia, StatusOcorrencia
from ..models.coordenada import Coordenada
from ..models.imagem import Imagem
from ..models.perfil import Perfil
from .. import db

main_bp = Blueprint('main', __name__)

# --- Funções de login, registro, dashboard, logout e register-occurrence (mantidas como estão) ---
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
        return '', 200
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

    titulo = request.form.get('titulo')
    endereco = request.form.get('endereco')
    descricao = request.form.get('descricao')
    
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
        db.session.flush()

        uploaded_images = []
        if 'imagens' in request.files:
            files = request.files.getlist('imagens') 
            UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads', 'ocorrencias')
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)

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

# --- Nova rota para buscar ocorrências do usuário ---
@main_bp.route('/my-occurrences', methods=['GET', 'OPTIONS'])
def get_my_occurrences():
    if request.method == 'OPTIONS':
        return '', 200 # CORS preflight

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Você precisa estar logado para ver suas ocorrências.'}), 401

    current_user = Usuario.query.get(user_id)
    if not current_user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    # Busca todas as ocorrências associadas a este usuário
    # .all() executa a query e retorna uma lista
    occurrences = current_user.ocorrencias

    # Formata as ocorrências para JSON
    occurrences_data = []
    for occ in occurrences:
        # Pega as URLs das imagens associadas
        images_urls = [img.url for img in occ.imagens]

        occurrences_data.append({
            'id': occ.id,
            'titulo': occ.titulo,
            'descricao': occ.descricao,
            'endereco': occ.endereco,
            'data_registro': occ.data_registro.strftime('%Y-%m-%d'), # Formata a data
            'status': occ.status_ocorrencia.nome if occ.status_ocorrencia else 'N/A',
            'imagens': images_urls,
            # Você pode adicionar mais campos conforme necessário, como coordenada
        })

    return jsonify(occurrences_data), 200