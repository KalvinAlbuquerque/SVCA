# SVCA/app/controllers/main_controller.py
from flask import Blueprint, render_template, request, flash, redirect, url_for, session # <-- Adicione 'session'
from ..models.usuario import Usuario # <-- Importe o modelo Usuario
from ..models.perfil import Perfil # <-- Importe o modelo Perfil (se precisar criar perfis aqui ou buscar)
from .. import db # <-- Importe a instância db se precisar de db.session.add/commit fora dos métodos do modelo

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
@main_bp.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')

        # 1. Validação básica (campos não vazios)
        if not email or not password:
            flash('Por favor, preencha todos os campos.', 'danger')
            return render_template('login.html')

        # 2. Buscar o usuário pelo email
        user = Usuario.query.filter_by(email=email).first()
        print(user)
        # 3. Verificar se o usuário existe e se a senha está correta
        if user and user.autenticar(password):
            # Lógica de login bem-sucedido
            # Geralmente, você armazena o ID do usuário na sessão
            session['user_id'] = user.id
            session['user_name'] = user.nome # Opcional: para exibir o nome
            session['user_profile'] = user.perfil.nome # Opcional: para controle de acesso

            flash(f'Bem-vindo, {user.nome}!', 'success')
            return redirect(url_for('main.dashboard')) # Redirecione para uma página de dashboard após o login

        else:
            # Autenticação falhou
            flash('Email ou senha incorretos.', 'danger')
            return render_template('login.html')

    # Para requisições GET, apenas renderiza a página de login
    return render_template('login.html')

# Exemplo de uma rota de dashboard protegida (você pode expandir isso)
@main_bp.route('/dashboard')
def dashboard():
    # Verifica se o usuário está logado
    if 'user_id' not in session:
        flash('Você precisa estar logado para acessar esta página.', 'warning')
        return redirect(url_for('main.login'))

    user_name = session.get('user_name', 'Usuário')
    return render_template('dashboard.html', user_name=user_name) # Crie um template dashboard.html

# Rota para logout
@main_bp.route('/logout')
def logout():
    session.pop('user_id', None) # Remove o ID do usuário da sessão
    session.pop('user_name', None)
    session.pop('user_profile', None)
    flash('Você foi desconectado.', 'info')
    return redirect(url_for('main.login'))