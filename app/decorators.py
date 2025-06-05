# app/decorators.py
from flask import session, jsonify, redirect, url_for, request
from functools import wraps
from .models.perfil import Perfil

def login_required(f):
    """
    Decorador para exigir que o usuário esteja logado.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Removido: if request.method == 'OPTIONS': return f(*args, **kwargs)
        if 'user_id' not in session:
            return jsonify({'error': 'Não autorizado. Faça login para acessar esta funcionalidade.'}), 401
        return f(*args, **kwargs)
    return decorated_function

def roles_required(roles):
    """
    Decorador para exigir que o usuário tenha um dos perfis especificados.
    :param roles: Uma lista de nomes de perfis permitidos (ex: ['Administrador', 'Moderador']).
    """
    def decorator(f):
        @wraps(f)
        @login_required # Garante que o usuário esteja logado antes de verificar o perfil
        def decorated_function(*args, **kwargs):
            user_profile_name = session.get('user_profile')
            if not user_profile_name or user_profile_name not in roles:
                return jsonify({'error': 'Acesso negado. Você não tem permissão para acessar esta funcionalidade.'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator