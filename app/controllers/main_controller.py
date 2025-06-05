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
from ..models.tipo_pontuacao import TipoPontuacao # Importe TipoPontuacao para calcular pontos
from .. import db

main_bp = Blueprint('main', __name__)

# --- Funções existentes (login, register, dashboard, logout, register-occurrence, get_my_occurrences) ---
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

    occurrences = current_user.ocorrencias # Remova o .all()

    occurrences_data = []
    for occ in occurrences:
        images_urls = [img.url for img in occ.imagens]

        occurrences_data.append({
            'id': occ.id,
            'titulo': occ.titulo,
            'descricao': occ.descricao,
            'endereco': occ.endereco,
            'data_registro': occ.data_registro.strftime('%Y-%m-%d'),
            'status': occ.status_ocorrencia.nome if occ.status_ocorrencia else 'N/A',
            'imagens': images_urls,
        })

    return jsonify(occurrences_data), 200

# --- Novas rotas para Gerenciar Conta ---
@main_bp.route('/user-profile', methods=['GET', 'OPTIONS'])
def get_user_profile():
    if request.method == 'OPTIONS':
        return '', 200

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Você precisa estar logado para ver seu perfil.'}), 401

    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    # Calcula a pontuação do usuário
    pontuacao = user.consultar_pontuacao() # O método já existe no modelo Usuario

    # Divide o nome completo em Nome e Sobrenome, se possível
    # Isso é um palpite, baseado em como você está combinando nome e sobrenome no registro
    nome_partes = user.nome.split(' ', 1) 
    primeiro_nome = nome_partes[0] if nome_partes else ""
    sobrenome = nome_partes[1] if len(nome_partes) > 1 else ""

    profile_data = {
        'id': user.id,
        'nome': primeiro_nome, # Nome (primeiro nome)
        'sobrenome': sobrenome, # Sobrenome
        'email': user.email,
        'telefone': user.telefone,
        'cpf': user.cpf if hasattr(user, 'cpf') else None, # CPF pode ser opcional no modelo
        'apelido': user.nome, # Usando o campo 'nome' do modelo como 'apelido'
        'perfil': user.perfil.nome if user.perfil else 'N/A',
        'pontos': pontuacao,
        # Adicione aqui o campo para URL do avatar, se você o tiver no modelo Usuario
        # Ex: 'avatar_url': user.avatar_url
    }
    return jsonify(profile_data), 200

@main_bp.route('/user-profile', methods=['PUT', 'OPTIONS'])
def update_user_profile():
    if request.method == 'OPTIONS':
        return '', 200

    user_id = session.get('user_id')
    if not user_id:
        return jsonify({'error': 'Você precisa estar logado para atualizar seu perfil.'}), 401

    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    data = request.get_json()

    # Validação e atualização dos campos
    # Certifique-se de validar cada campo e atualizar apenas os que são permitidos
    try:
        if 'nome' in data and 'sobrenome' in data:
            nome_completo = f"{data['nome']} {data['sobrenome']}".strip()
            user.nome = nome_completo
        elif 'nome' in data: # Se só o nome for enviado
            user.nome = data['nome']

        if 'email' in data and data['email'] != user.email:
            # Verificar se o novo email já está em uso por outro usuário
            existing_email_user = Usuario.query.filter(Usuario.email == data['email'], Usuario.id != user.id).first()
            if existing_email_user:
                return jsonify({'error': 'Este e-mail já está em uso por outro usuário.'}), 409
            user.email = data['email']

        if 'telefone' in data:
            user.telefone = data['telefone']
        if 'cpf' in data:
            # Lidar com CPF se o modelo Usuario tiver esse campo
            if hasattr(user, 'cpf'):
                user.cpf = data['cpf']
        # 'apelido' na tela mapeia para 'nome' no modelo, já tratado acima
        # if 'apelido' in data: user.nome = data['apelido']

        if 'nova_senha' in data and data['nova_senha']:
            if 'repita_sua_senha' not in data or data['nova_senha'] != data['repita_sua_senha']:
                return jsonify({'error': 'As novas senhas não coincidem.'}), 400
            if len(data['nova_senha']) < 6:
                return jsonify({'error': 'A nova senha deve ter pelo menos 6 caracteres.'}), 400
            user.redefinir_senha(data['nova_senha']) # Utiliza o método existente para hashear

        # Se você tiver um campo para avatar_url no modelo Usuario
        # if 'avatar_url' in data:
        #     user.avatar_url = data['avatar_url']

        db.session.commit()
        return jsonify({'message': 'Perfil atualizado com sucesso!'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao atualizar perfil: {e}")
        return jsonify({'error': f'Ocorreu um erro ao atualizar o perfil: {str(e)}'}), 500