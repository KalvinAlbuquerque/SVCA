# SVCA/app/controllers/main_controller.py
import os
import uuid
from datetime import datetime
from flask import Blueprint, current_app, request, jsonify, session, url_for

from app.models.notificacao import Notificacao
from ..models.usuario import Usuario
from ..models.ocorrencia import Ocorrencia, StatusOcorrencia
from ..models.coordenada import Coordenada
from ..models.imagem import Imagem
from ..models.perfil import Perfil
from ..models.tipo_pontuacao import TipoPontuacao
from ..models.orgao_responsavel import OrgaoResponsavel
from .. import db
from ..decorators import login_required, roles_required
from flask_mail import Message 
from .. import mail
from itsdangerous import BadTimeSignature, SignatureExpired, URLSafeTimedSerializer 
from sqlalchemy.orm import joinedload # Esta importação está correta!

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
        
        if user and user.is_blocked:
            return jsonify({'error': 'Sua conta foi bloqueada devido a violação das políticas de uso. Por favor, entre em contato para mais informações.'}), 403
        
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

@main_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    nome = data.get('nome')
    sobrenome = data.get('sobrenome')
    email = data.get('email')
    telefone = data.get('telefone')
    # Remova a linha abaixo
    # cpf = data.get('cpf') # LINHA A SER REMOVIDA
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
@login_required
def dashboard():
    user_name = session.get('user_name', 'Usuário')
    user_profile = session.get('user_profile', 'N/A')
    return jsonify({'message': f'Bem-vindo ao dashboard, {user_name}!', 'user_profile': user_profile})

@main_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    session.pop('user_id', None)
    session.pop('user_name', None)
    session.pop('user_profile', None)
    return jsonify({'message': 'Você foi desconectado.'}), 200

@main_bp.route('/register-occurrence', methods=['POST'])
@login_required
def register_occurrence():
    user_id = session.get('user_id')
    current_user = Usuario.query.get(user_id)
    if not current_user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    titulo = request.form.get('titulo')
    endereco = request.form.get('endereco')
    descricao = request.form.get('descricao')
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    
    if not titulo or not endereco or not descricao or not latitude or not longitude:
        return jsonify({'error': 'Título, Endereço, Descrição, Latitude e Longitude são obrigatórios.'}), 400

    try:
        new_coordenada = Coordenada(latitude=float(latitude), longitude=float(longitude))
        db.session.add(new_coordenada)
        db.session.flush()

        status_registrada = StatusOcorrencia.query.filter_by(nome='Registrada').first()
        if not status_registrada:
            return jsonify({'error': "Status 'Registrada' não encontrado. Contate o administrador."}), 500

        nova_ocorrencia = Ocorrencia(
            titulo=titulo,
            descricao=descricao,
            data_registro=datetime.now().date(),
            endereco=endereco,
            status_id=status_registrada.id,
            usuario_id=current_user.id,
            coordenada_id=new_coordenada.id
        )
        db.session.add(nova_ocorrencia)
        db.session.flush()

        uploaded_images = []
        if 'imagens' in request.files:
            files = request.files.getlist('imagens') 
            UPLOAD_FOLDER = os.path.join(current_app.root_path, 'static', 'uploads', 'ocorrencias')
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
        return jsonify({'message': 'Ocorrência registrada com sucesso! Aguardando validação do moderador.'}), 201

    except Exception as e:
        db.session.rollback()
        print(f"Erro ao registrar ocorrência: {e}")
        return jsonify({'error': f'Ocorreu um erro ao registrar a ocorrência: {str(e)}'}), 500
    
@main_bp.route('/my-occurrences', methods=['GET'])
@login_required
def get_my_occurrences():
    user_id = session.get('user_id')
    current_user = Usuario.query.get(user_id)
    if not current_user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    occurrences = current_user.ocorrencias

    occurrences_data = []
    for occ in occurrences:
        images_urls = [img.url for img in occ.imagens]
        orgao_nome = occ.orgao_responsavel.nome if occ.orgao_responsavel else None
        
        latitude = None
        longitude = None
        if occ.coordenada:
            latitude = occ.coordenada.latitude
            longitude = occ.coordenada.longitude

        occurrences_data.append({
            'id': occ.id,
            'titulo': occ.titulo,
            'descricao': occ.descricao,
            'endereco': occ.endereco,
            'data_registro': occ.data_registro.strftime('%Y-%m-%d'),
            'status': occ.status_ocorrencia.nome if occ.status_ocorrencia else 'N/A',
            'imagens': images_urls,
            'latitude': latitude,
            'longitude': longitude,
        })

    return jsonify(occurrences_data), 200

@main_bp.route('/user-profile', methods=['GET', 'PUT'])
@login_required
def user_profile():
    user_id = session.get('user_id')
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    if request.method == 'GET':
        pontuacao = user.consultar_pontuacao()

        nome_partes = user.nome.split(' ', 1)
        primeiro_nome = nome_partes[0] if nome_partes else ""
        sobrenome = nome_partes[1] if len(nome_partes) > 1 else ""

        profile_data = {
            'id': user.id,
            'nome': primeiro_nome,
            'sobrenome': sobrenome,
            'email': user.email,
            'telefone': user.telefone,
            # Remova a linha abaixo
            # 'cpf': user.cpf if hasattr(user, 'cpf') else None, # LINHA A SER REMOVIDA
            'apelido': user.nome,
            'perfil': user.perfil.nome if user.perfil else 'N/A',
            'pontos': user.pontos,
            'avatar_url': user.avatar_url if hasattr(user, 'avatar_url') else None,
        }
        return jsonify(profile_data), 200

    elif request.method == 'PUT':
        data = request.get_json()

        try:
            if 'nome' in data and 'sobrenome' in data:
                nome_completo = f"{data['nome']} {data['sobrenome']}".strip()
                user.nome = nome_completo
            elif 'nome' in data:
                user.nome = data['nome']

            if 'email' in data and data['email'] != user.email:
                existing_email_user = Usuario.query.filter(Usuario.email == data['email'], Usuario.id != user.id).first()
                if existing_email_user:
                    return jsonify({'error': 'Este e-mail já está em uso por outro usuário.'}), 409
                user.email = data['email']

            if 'telefone' in data:
                user.telefone = data['telefone']
            # Remova a lógica do CPF abaixo
            # if 'cpf' in data: # LINHA A SER REMOVIDA
            #     if hasattr(user, 'cpf'): # LINHA A SER REMOVIDA
            #         user.cpf = data['cpf'] # LINHA A SER REMOVIDA

            if 'nova_senha' in data and data['nova_senha']:
                if 'repita_sua_senha' not in data or data['nova_senha'] != data['repita_sua_senha']:
                    return jsonify({'error': 'As novas senhas não coincidem.'}), 400
                if len(data['nova_senha']) < 6:
                    return jsonify({'error': 'A nova senha deve ter pelo menos 6 caracteres.'}), 400
                user.redefinir_senha(data['nova_senha'])
            
            if 'avatar_url' in data:
                if hasattr(user, 'avatar_url'):
                    user.avatar_url = data['avatar_url']

            db.session.commit()
            return jsonify({'message': 'Perfil atualizado com sucesso!'}), 200

        except Exception as e:
            db.session.rollback()
            print(f"Erro ao atualizar perfil: {e}")
            return jsonify({'error': f'Ocorreu um erro ao atualizar o perfil: {str(e)}'}), 500

@main_bp.route('/view-occurrence/<int:occurrence_id>', methods=['GET'])
@login_required
def view_occurrence_public(occurrence_id):
    occurrence = Ocorrencia.query.options(joinedload(Ocorrencia.historico_notificacoes)).get(occurrence_id)
    if not occurrence:
        return jsonify({'error': 'Ocorrência não encontrada.'}), 404

    images_urls = [img.url for img in occurrence.imagens]
    orgao_nome = occurrence.orgao_responsavel.nome if occurrence.orgao_responsavel else None
    
    latitude = None
    longitude = None
    if occurrence.coordenada:
        latitude = occurrence.coordenada.latitude
        longitude = occurrence.coordenada.longitude

    historico_notificacoes = []
    for notificacao in occurrence.historico_notificacoes:
        historico_notificacoes.append({
            'mensagem': notificacao.mensagem,
            'data_envio': notificacao.data_envio, # REMOVIDO .strftime()
            'email_destino': notificacao.email_destino
        })
    historico_notificacoes.sort(key=lambda x: x['data_envio'], reverse=True)

    return jsonify({
        'id': occurrence.id,
        'titulo': occurrence.titulo,
        'descricao': occurrence.descricao,
        'endereco': occurrence.endereco,
        'data_registro': occurrence.data_registro.strftime('%Y-%m-%d'),
        'data_finalizacao': occurrence.data_finalizacao.strftime('%Y-%m-%d') if occurrence.data_finalizacao else None,
        'status_id': occurrence.status_id,
        'status_nome': occurrence.status_ocorrencia.nome if occurrence.status_ocorrencia else 'N/A',
        'usuario_id': occurrence.usuario_id,
        'usuario_nome': occurrence.usuario.nome if occurrence.usuario else 'N/A',
        'orgao_responsavel_id': occurrence.orgao_responsavel_id,
        'orgao_responsavel_nome': orgao_nome,
        'tipo_pontuacao_id': occurrence.tipo_pontuacao_id,
        'imagens': images_urls,
        'latitude': latitude,
        'longitude': longitude,
        'historico_notificacoes': historico_notificacoes,
    }), 200

@main_bp.route('/occurrences', methods=['GET'])
@roles_required(['Administrador', 'Moderador'])
def get_all_occurrences():
    search_term = request.args.get('search', '').strip()
    occurrences_query = Ocorrencia.query

    if search_term:
        occurrences_query = occurrences_query.join(Usuario).filter(db.or_(
            Ocorrencia.titulo.ilike(f'%{search_term}%'),
            Ocorrencia.endereco.ilike(f'%{search_term}%'),
            Usuario.nome.ilike(f'%{search_term}%')
        ))

    occurrences = occurrences_query.all()
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
            'usuario_nome': occ.usuario.nome if occ.usuario else 'N/A',
            'imagens': images_urls,
        })
    return jsonify(occurrences_data), 200

@main_bp.route('/occurrence/<int:occurrence_id>', methods=['GET', 'PUT', 'DELETE'])
@roles_required(['Administrador', 'Moderador'])
def manage_occurrence(occurrence_id):
    # APLICADO joinedload AQUI PARA GARANTIR O CARREGAMENTO DO HISTÓRICO EM TODAS AS OPERAÇÕES DESTA ROTA
    occurrence = Ocorrencia.query.options(joinedload(Ocorrencia.historico_notificacoes)).get(occurrence_id)
    if not occurrence:
        return jsonify({'error': 'Ocorrência não encontrada.'}), 404

    if request.method == 'GET':
        images_urls = [img.url for img in occurrence.imagens]
        orgao_nome = occurrence.orgao_responsavel.nome if occurrence.orgao_responsavel else None
        
        latitude = None
        longitude = None
        if occurrence.coordenada:
            latitude = occurrence.coordenada.latitude
            longitude = occurrence.coordenada.longitude

        # Constrói o histórico de notificações para a resposta JSON GET
        historico_notificacoes = []
        for notificacao in occurrence.historico_notificacoes:
            historico_notificacoes.append({
                'mensagem': notificacao.mensagem,
                'data_envio': notificacao.data_envio, # REMOVIDO .strftime()
                'email_destino': notificacao.email_destino
            })
        historico_notificacoes.sort(key=lambda x: x['data_envio'], reverse=True)


        return jsonify({
            'id': occurrence.id,
            'titulo': occurrence.titulo,
            'descricao': occurrence.descricao,
            'endereco': occurrence.endereco,
            'data_registro': occurrence.data_registro.strftime('%Y-%m-%d'),
            'data_finalizacao': occurrence.data_finalizacao.strftime('%Y-%m-%d') if occurrence.data_finalizacao else None,
            'status_id': occurrence.status_id,
            'status_nome': occurrence.status_ocorrencia.nome if occurrence.status_ocorrencia else 'N/A',
            'usuario_id': occurrence.usuario_id,
            'usuario_nome': occurrence.usuario.nome if occurrence.usuario else 'N/A',
            'orgao_responsavel_id': occurrence.orgao_responsavel_id,
            'orgao_responsavel_nome': orgao_nome,
            'tipo_pontuacao_id': occurrence.tipo_pontuacao_id,
            'imagens': images_urls,
            'latitude': latitude,
            'longitude': longitude,
            'justificativa_recusa': occurrence.justificativa_recusa,
            'historico_notificacoes': historico_notificacoes, # ADICIONADO AO JSON DE RESPOSTA
        }), 200

    elif request.method == 'PUT':
        data = request.get_json()
        old_status_id = occurrence.status_id
        old_orgao_id = occurrence.orgao_responsavel_id

        try:
            if 'titulo' in data:
                occurrence.titulo = data['titulo']
            if 'descricao' in data:
                occurrence.descricao = data['descricao']
            if 'endereco' in data:
                occurrence.endereco = data['endereco']
            
            if 'status_id' in data:
                new_status_id = int(data['status_id'])
                if new_status_id != old_status_id:
                    occurrence.status_id = new_status_id
                    new_status = StatusOcorrencia.query.get(new_status_id)
                    user_who_registered = Usuario.query.get(occurrence.usuario_id)

                    if user_who_registered:
                        old_status = StatusOcorrencia.query.get(old_status_id)
                        if old_status:
                            if old_status.nome == 'Em andamento':
                                user_who_registered.pontos -= 25
                            elif old_status.nome == 'Fechada com solução':
                                user_who_registered.pontos -= 50
                            elif old_status.nome == 'Recusada':
                                pass 
                        
                        if new_status.nome == 'Em andamento':
                            user_who_registered.pontos += 25
                        elif new_status.nome == 'Fechada com solução':
                            user_who_registered.pontos += 50 
                        elif new_status.nome == 'Recusada':
                            user_who_registered.pontos -= 10
                        
                        if user_who_registered.pontos < 0:
                            user_who_registered.pontos = 0
                        db.session.add(user_who_registered)

                    if new_status and new_status.nome == 'Fechada com solução':
                        occurrence.data_finalizacao = datetime.now().date()
                        tipo_pontuacao_solucionada = TipoPontuacao.query.filter_by(nome='OcorrenciaSolucionada').first()
                        if tipo_pontuacao_solucionada:
                            occurrence.tipo_pontuacao_id = tipo_pontuacao_solucionada.id
                        recusada_status_obj = StatusOcorrencia.query.filter_by(nome='Recusada').first()
                        if old_status_id == recusada_status_obj.id and user_who_registered and user_who_registered.ocorrencias_recusadas_count > 0:
                            user_who_registered.ocorrencias_recusadas_count -= 1
                            if user_who_registered.ocorrencias_recusadas_count < 3 and user_who_registered.is_blocked:
                                user_who_registered.is_blocked = False
                                print(f"Usuário {user_who_registered.email} desbloqueado devido a ocorrência {occurrence.id} ser solucionada.")

                        occurrence.justificativa_recusa = None 

                    elif new_status and new_status.nome == 'Recusada':
                        justificativa = data.get('justificativa_recusa')
                        if not justificativa:
                            return jsonify({'error': 'Justificativa é obrigatória para recusar a ocorrência.'}), 400
                        
                        occurrence.justificativa_recusa = justificativa
                        occurrence.data_finalizacao = datetime.now().date()

                        if user_who_registered:
                            user_who_registered.ocorrencias_recusadas_count += 1
                            db.session.add(user_who_registered)

                            if user_who_registered.ocorrencias_recusadas_count >= 3:
                                user_who_registered.is_blocked = True
                                print(f"Usuário {user_who_registered.email} bloqueado por ter {user_who_registered.ocorrencias_recusadas_count} ocorrências recusadas.")

                            msg_body = (
                                f"Prezado(a) {user_who_registered.nome},\n\n"
                                f"Sua ocorrência '{occurrence.titulo}' foi recusada.\n\n"
                                f"Justificativa: {justificativa}\n\n"
                                f"Status atual: {new_status.nome}\n\n"
                            )
                            if user_who_registered.is_blocked:
                                msg_body += (
                                    f"ATENÇÃO: Sua conta foi bloqueada automaticamente devido a múltiplas ocorrências recusadas.\n"
                                    f"Você acumulou {user_who_registered.ocorrencias_recusadas_count} ocorrências recusadas.\n"
                                    f"Para mais informações sobre as políticas de uso, visite o sistema.\n\n"
                                )
                            msg_body += f"Atenciosamente,\nSua equipe SVCA"

                            msg = Message(
                                f"Sua Ocorrência '{occurrence.titulo}' Foi Recusada",
                                recipients=[user_who_registered.email],
                                body=msg_body
                            )
                            try:
                                mail.send(msg)
                                print(f"E-mail de recusa/bloqueio enviado para {user_who_registered.email}")
                            except Exception as mail_e:
                                print(f"ERRO ao enviar e-mail de recusa/bloqueio: {mail_e}")

                    elif new_status and new_status.nome == 'Em andamento':
                        occurrence.data_finalizacao = None
                        occurrence.justificativa_recusa = None

                    else:
                        occurrence.data_finalizacao = None
                        occurrence.justificativa_recusa = None
                        occurrence.tipo_pontuacao_id = None

            if 'orgao_responsavel_id' in data:
                orgao_id_val = data['orgao_responsavel_id']
                if orgao_id_val is not None and orgao_id_val != '':
                    occurrence.orgao_responsavel_id = int(orgao_id_val)
                else:
                    occurrence.orgao_responsavel_id = None
            
            db.session.commit()

            return jsonify({'message': 'Ocorrência atualizada com sucesso!'}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao atualizar ocorrência: {e}")
            return jsonify({'error': f'Ocorreu um erro ao atualizar a ocorrência: {str(e)}'}), 500

    elif request.method == 'DELETE':
        try:
            db.session.delete(occurrence)
            db.session.commit()
            return jsonify({'message': 'Ocorrência deletada com sucesso!'}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Erro ao deletar ocorrência: {e}")

            return jsonify({'error': f'Erro ao deletar ocorrência: {str(e)}'}), 500

@main_bp.route('/users', methods=['GET'])
@roles_required(['Administrador'])
def get_all_users():
    search_term = request.args.get('search', '').strip()
    users_query = Usuario.query

    if search_term:
        users_query = users_query.filter(db.or_(
            Usuario.nome.ilike(f'%{search_term}%'),
            Usuario.email.ilike(f'%{search_term}%'),
            Usuario.telefone.ilike(f'%{search_term}%')
        ))
    
    users = users_query.all()
    users_data = []
    for user in users:
        nome_partes = user.nome.split(' ', 1)
        primeiro_nome = nome_partes[0] if nome_partes else ""
        sobrenome = nome_partes[1] if len(nome_partes) > 1 else ""

        users_data.append({
            'id': user.id,
            'nome': primeiro_nome,
            'sobrenome': sobrenome,
            'email': user.email,
            'telefone': user.telefone,
            'perfil_id': user.perfil_id,
            'perfil': user.perfil.nome if user.perfil else 'N/A',
            'pontos': user.pontos,
            'ocorrencias_recusadas_count': user.ocorrencias_recusadas_count,
            'is_blocked': user.is_blocked,
        })
    return jsonify(users_data), 200

@main_bp.route('/user/<int:user_id>', methods=['GET', 'PUT', 'DELETE'])
@roles_required(['Administrador'])
def manage_user(user_id):
    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado.'}), 404

    if request.method == 'GET':
        return jsonify({
            'id': user.id,
            'nome': user.nome,
            'email': user.email,
            'telefone': user.telefone,
            'perfil_id': user.perfil_id,
            'perfil_nome': user.perfil.nome if user.perfil else 'N/A',
            'pontos': user.pontos,
            'ocorrencias_recusadas_count': user.ocorrencias_recusadas_count,
            'is_blocked': user.is_blocked,
        }), 200

    elif request.method == 'PUT':
        data = request.get_json()
        try:
            if 'nome' in data and 'sobrenome' in data:
                user.nome = f"{data['nome']} {data['sobrenome']}".strip()
            elif 'nome' in data:
                user.nome = data['nome']

            if 'email' in data and data['email'] != user.email:
                existing_email_user = Usuario.query.filter(Usuario.email == data['email'], Usuario.id != user.id).first()
                if existing_email_user:
                    return jsonify({'error': 'Este e-mail já está em uso por outro usuário.'}), 409
                user.email = data['email']
            if 'telefone' in data:
                user.telefone = data['telefone']
            if 'perfil_id' in data:
                user.perfil_id = data['perfil_id']
            if 'nova_senha' in data and data['nova_senha']:
                user.redefinir_senha(data['nova_senha'])
            
            if 'is_blocked' in data:
                user.is_blocked = bool(data['is_blocked'])
            if 'ocorrencias_recusadas_count' in data:
                user.ocorrencias_recusadas_count = int(data['ocorrencias_recusadas_count'])

            if 'pontos' in data:
                user.pontos = int(data['pontos'])

            db.session.commit()
            return jsonify({'message': 'Usuário atualizado com sucesso!'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Ocorreu um erro ao atualizar o usuário: {str(e)}'}), 500

    elif request.method == 'DELETE':
        try:
            db.session.delete(user)
            db.session.commit()
            return jsonify({'message': 'Usuário deletado com sucesso!'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Erro ao deletar usuário: {str(e)}'}), 500

@main_bp.route('/orgaos-responsaveis', methods=['GET'])
@roles_required(['Administrador', 'Moderador'])
def get_all_orgaos():
    search_term = request.args.get('search', '').strip()
    orgaos_query = OrgaoResponsavel.query

    if search_term:
        orgaos_query = orgaos_query.filter(db.or_(
            OrgaoResponsavel.nome.ilike(f'%{search_term}%'),
            OrgaoResponsavel.email.ilike(f'%{search_term}%')
        ))

    orgaos = orgaos_query.all()
    orgaos_data = []
    for orgao in orgaos:
        orgaos_data.append({
            'id': orgao.id,
            'nome': orgao.nome,
            'email': orgao.email,
            'telefone': orgao.telefone
        })
    return jsonify(orgaos_data), 200

@main_bp.route('/orgao-responsavel', methods=['POST'])
@roles_required(['Administrador', 'Moderador'])
def create_orgao():
    data = request.get_json()
    nome = data.get('nome')
    email = data.get('email')
    telefone = data.get('telefone')

    if not nome or not email or not telefone:
        return jsonify({'error': 'Nome, email e telefone são obrigatórios para o órgão responsável.'}), 400

    existing_orgao = OrgaoResponsavel.query.filter_by(email=email).first()
    if existing_orgao:
        return jsonify({'error': 'Já existe um órgão responsável com este e-mail.'}), 409

    try:
        new_orgao = OrgaoResponsavel(nome=nome, email=email, telefone=telefone)
        db.session.add(new_orgao)
        db.session.commit()
        return jsonify({'message': 'Órgão responsável criado com sucesso!', 'id': new_orgao.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Erro ao criar órgão responsável: {str(e)}'}), 500

@main_bp.route('/orgao-responsavel/<int:orgao_id>', methods=['GET', 'PUT', 'DELETE'])
@roles_required(['Administrador', 'Moderador'])
def manage_orgao(orgao_id):
    orgao = OrgaoResponsavel.query.get(orgao_id)
    if not orgao:
        return jsonify({'error': 'Órgão responsável não encontrado.'}), 404

    if request.method == 'GET':
        return jsonify({
            'id': orgao.id,
            'nome': orgao.nome,
            'email': orgao.email,
            'telefone': orgao.telefone
        }), 200

    elif request.method == 'PUT':
        data = request.get_json()
        try:
            if 'nome' in data:
                orgao.nome = data['nome']
            if 'email' in data and data['email'] != orgao.email:
                existing_email_orgao = OrgaoResponsavel.query.filter(OrgaoResponsavel.email == data['email'], OrgaoResponsavel.id != orgao.id).first()
                if existing_email_orgao:
                    return jsonify({'error': 'Este e-mail já está em uso por outro órgão responsável.'}), 409
                orgao.email = data['email']
            if 'telefone' in data:
                orgao.telefone = data['telefone']
            db.session.commit()
            return jsonify({'message': 'Órgão responsável atualizado com sucesso!'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Ocorreu um erro ao atualizar o órgão responsável: {str(e)}'}), 500

    elif request.method == 'DELETE':
        try:
            db.session.delete(orgao)
            db.session.commit()
            return jsonify({'message': 'Órgão responsável deletado com sucesso!'}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Erro ao deletar órgão responsável: {str(e)}'}), 500

@main_bp.route('/status-ocorrencias', methods=['GET'])
@login_required 
def get_status_options():
    status_list = StatusOcorrencia.query.all()
    return jsonify([{'id': s.id, 'nome': s.nome} for s in status_list]), 200

@main_bp.route('/perfis', methods=['GET'])
@roles_required(['Administrador'])
def get_profile_options():
    profiles = Perfil.query.all()
    return jsonify([{'id': p.id, 'nome': p.nome} for p in profiles]), 200

@main_bp.route('/ranking-semanal', methods=['GET', 'OPTIONS'])
def get_ranking_semanal():
    if request.method == 'OPTIONS':
        return '', 200

    users = Usuario.query.all()

    users_with_scores = []
    for user in users:
        users_with_scores.append({
            'id': user.id,
            'nome': user.nome,
            'pontos': user.pontos,
            'avatar_url': user.avatar_url if hasattr(user, 'avatar_url') else '/avatar.svg',
        })
    
    sorted_ranking = sorted(users_with_scores, key=lambda x: x['pontos'], reverse=True)[:5]

    return jsonify(sorted_ranking), 200

@main_bp.route('/active-occurrences', methods=['GET', 'OPTIONS'])
def get_active_occurrences():
    if request.method == 'OPTIONS':
        return '', 200

    try:
        status_em_andamento = StatusOcorrencia.query.filter_by(nome='Em andamento').first()
        
        if not status_em_andamento:
            return jsonify({'error': "Status 'Em andamento' não encontrado. Contate o administrador."}), 500

        active_occurrences = Ocorrencia.query \
            .filter_by(status_id=status_em_andamento.id) \
            .join(Coordenada) \
            .all()

        occurrences_data = []
        for occ in active_occurrences:
            if occ.coordenada:
                occurrences_data.append({
                    'id': occ.id,
                    'titulo': occ.titulo,
                    'endereco': occ.endereco,
                    'latitude': occ.coordenada.latitude,
                    'longitude': occ.coordenada.longitude,
                    'status': occ.status_ocorrencia.nome
                })
        
        return jsonify(occurrences_data), 200

    except Exception as e:
        print(f"Erro ao buscar ocorrências ativas: {e}")
        return jsonify({'error': f'Ocorreu um erro ao carregar as ocorrências ativas: {str(e)}'}), 500
    
@main_bp.route('/occurrence/<int:occurrence_id>/send-notification', methods=['POST'])
@roles_required(['Administrador', 'Moderador'])
def send_notification_to_orgao(occurrence_id):

    occurrence = Ocorrencia.query.get(occurrence_id)
    if not occurrence:
        return jsonify({'error': 'Ocorrência não encontrada.'}), 404

    if not occurrence.orgao_responsavel_id:
        return jsonify({'error': 'Esta ocorrência não possui um Órgão Responsável atribuído para envio de notificação.'}), 400
    
    orgao = OrgaoResponsavel.query.get(occurrence.orgao_responsavel_id)
    if not orgao or not orgao.email:
        return jsonify({'error': 'Órgão Responsável não encontrado ou sem e-mail para notificação.'}), 400

    try:
        msg_body = (
            f"Prezado(a) {orgao.nome},\n\n"
            f"Uma ocorrência foi encaminhada/atualizada para a sua organização:\n\n"
            f"Título: {occurrence.titulo}\n"
            f"Descrição: {occurrence.descricao}\n"
            f"Endereço: {occurrence.endereco}\n"
            f"Status: {occurrence.status_ocorrencia.nome}\n"
            f"Registrada por: {occurrence.usuario.nome}\n"
            f"Data de Registro: {occurrence.data_registro.strftime('%d/%m/%Y')}\n\n"
            f"Para mais detalhes, acesse o sistema.\n\n"
            f"Atenciosamente,\nSua equipe SVCA"
        )
        msg = Message(
            f"Notificação de Ocorrência: {occurrence.titulo}",
            recipients=[orgao.email],
            body=msg_body
        )
        mail.send(msg)

        new_notification = Notificacao(
            mensagem="Notificação enviada ao Órgão Responsável.",
            data_envio=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            email_destino=orgao.email,
            ocorrencia_id=occurrence.id
        )
        db.session.add(new_notification)
        db.session.commit()

        return jsonify({'message': 'Notificação enviada com sucesso e registrada no histórico!'}), 200

    except Exception as e:
        db.session.rollback()
        print(f"ERRO ao enviar notificação para {orgao.email} ou registrar histórico: {e}")
        return jsonify({'error': f'Erro ao enviar notificação ou registrar histórico: {str(e)}'}), 500

@main_bp.route('/forgot-password', methods=['POST'])
def forgot_password_request():
    email = request.json.get('email')
    if not email:
        return jsonify({'error': 'E-mail é obrigatório.'}), 400

    user = Usuario.query.filter_by(email=email).first()

    if not user:
        return jsonify({'message': 'Se você tem uma conta, um link para redefinir sua senha foi enviado para seu e-mail.'}), 200

    try:
        s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
        token = s.dumps({'user_id': user.id}, salt='password-reset-salt') 

        reset_url = f"http://localhost:5173/reset-password/{token}"

        msg = Message(
            "Redefinição de Senha para SVCA",
            recipients=[user.email],
            body=f"Olá {user.nome},\n\n"
                 f"Você solicitou uma redefinição de senha para sua conta SVCA.\n"
                 f"Clique no link a seguir para redefinir sua senha: {reset_url}\n\n"
                 f"Este link é válido por 1 hora. Se você não solicitou isso, por favor, ignore este e-mail.\n\n"
                 f"Atenciosamente,\nSua equipe SVCA"
        )
        mail.send(msg)

        return jsonify({'message': 'Um link para redefinir sua senha foi enviado para seu e-mail.'}), 200

    except Exception as e:
        print(f"ERRO ao enviar e-mail de redefinição de senha para {email}: {e}")
        return jsonify({'error': 'Ocorreu um erro ao enviar o e-mail de redefinição de senha.'}), 500
    
@main_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    s = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])

    try:
        user_data = s.loads(token, salt='password-reset-salt', max_age=3600)
        user_id = user_data.get('user_id')
    except SignatureExpired:
        return jsonify({'error': 'O link de redefinição de senha expirou. Por favor, solicite um novo.'}), 400
    except BadTimeSignature:
        return jsonify({'error': 'O link de redefinição de senha é inválido ou foi adulterado.'}), 400
    except Exception as e:
        print(f"Erro ao decodificar token: {e}")
        return jsonify({'error': 'O link de redefinição de senha é inválido.'}), 400

    user = Usuario.query.get(user_id)
    if not user:
        return jsonify({'error': 'Usuário não encontrado para este link de redefinição.'}), 404

    data = request.json
    new_password = data.get('new_password')
    confirm_new_password = data.get('confirm_new_password')

    if not new_password or not confirm_new_password:
        return jsonify({'error': 'Por favor, digite e confirme sua nova senha.'}), 400
    
    if len(new_password) < 6:
        return jsonify({'error': 'A nova senha deve ter pelo menos 6 caracteres.'}), 400

    if new_password != confirm_new_password:
        return jsonify({'error': 'As senhas não coincidem.'}), 400
    
    try:
        user.redefinir_senha(new_password)
        db.session.commit()
        return jsonify({'message': 'Sua senha foi redefinida com sucesso!'}), 200
    except Exception as e:
        db.session.rollback()
        print(f"Erro ao redefinir senha do usuário {user_id}: {e}")
        return jsonify({'error': 'Ocorreu um erro ao redefinir sua senha.'}), 500