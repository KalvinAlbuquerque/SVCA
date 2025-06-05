# SVCA/app/controllers/main_controller.py
from flask import Blueprint, request, jsonify, session # Removi render_template, flash, redirect, url_for para manter o foco na API JSON
from ..models.usuario import Usuario
from ..models.perfil import Perfil
from .. import db

main_bp = Blueprint('main', __name__)

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

    # Rota GET para '/' e '/login' pode ser usada para servir o HTML base do React
    # Ou simplesmente ignore se o React for o único frontend
    return "Backend em funcionamento. Acesse o frontend React." # Mensagem simples para GET

# Rota para registro de usuário
@main_bp.route('/register', methods=['POST', 'OPTIONS']) # <--- Esta é a rota que você precisa
def register():
    if request.method == 'OPTIONS':
        # Responde à requisição OPTIONS para preflight do CORS
        # Flask-CORS deve lidar com isso automaticamente se configurado,
        # mas incluir explicitamente aqui pode ajudar se houver problemas.
        # Geralmente, um return vazio com 200 OK é suficiente para preflight.
        return '', 200

    data = request.get_json()
    nome = data.get('nome')
    sobrenome = data.get('sobrenome')
    email = data.get('email')
    telefone = data.get('telefone')
    cpf = data.get('cpf')
    senha = data.get('senha')
    confirma_senha = data.get('confirma_senha')

    # Validação básica dos campos
    if not nome or not email or not telefone or not senha or not confirma_senha:
        return jsonify({'error': 'Por favor, preencha todos os campos obrigatórios.'}), 400

    if senha != confirma_senha:
        return jsonify({'error': 'As senhas não coincidem.'}), 400

    if len(senha) < 6: # Exemplo de validação de senha
        return jsonify({'error': 'A senha deve ter pelo menos 6 caracteres.'}), 400

    # Verificar se o e-mail já está em uso
    existing_user = Usuario.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Este e-mail já está cadastrado.'}), 409 # Conflict

    try:
        perfil_usuario = Perfil.query.filter_by(nome='Usuario').first()
        if not perfil_usuario:
            return jsonify({'error': 'Perfil de usuário padrão não encontrado. Contate o administrador.'}), 500
        
        # Combinando nome e sobrenome para o campo 'nome' do modelo 'Usuario'
        nome_completo = f"{nome} {sobrenome}".strip() # .strip() remove espaços extras se sobrenome for vazio

        new_user = Usuario.criar(
            nome=nome_completo,
            email=email,
            telefone=telefone,
            senha_plana=senha,
            perfil_id=perfil_usuario.id
        )

        return jsonify({'message': 'Usuário registrado com sucesso!'}), 201 # Created

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao registrar usuário: {e}")
        return jsonify({'error': 'Ocorreu um erro ao registrar o usuário.'}), 500


# Rota de dashboard protegida
@main_bp.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return jsonify({'error': 'Você precisa estar logado para acessar esta página.'}), 401

    user_name = session.get('user_name', 'Usuário')
    return jsonify({'message': f'Bem-vindo ao dashboard, {user_name}!'})

# Rota para logout
@main_bp.route('/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    session.pop('user_name', None)
    session.pop('user_profile', None)
    return jsonify({'message': 'Você foi desconectado.'}), 200