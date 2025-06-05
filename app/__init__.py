# SVCA/app/__init__.py
import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_mail import Mail 

db = SQLAlchemy()
mail = Mail() 

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['SECRET_KEY'] = 'uma_chave_secreta_bem_longa_e_aleatoria_para_sua_sessao'
    
    # *** CONFIGURAÇÕES DO FLASK-MAIL (MUDANÇA AQUI) ***
    # Você precisará substituir estes valores pelas suas credenciais reais de e-mail SMTP
    app.config['MAIL_SERVER'] = 'smtp.gmail.com' # Ex: 'smtp.gmail.com' para Gmail, 'smtp.office365.com' para Outlook/Hotmail
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True # Geralmente True para TLS
    app.config['MAIL_USERNAME'] = "svca.systemmail@gmail.com"
    #os.environ.get('EMAIL_USER') # Use variáveis de ambiente para segurança
    app.config['MAIL_PASSWORD'] = "nehfmqgtcnzbirit"
    #os.environ.get('EMAIL_PASS') # Use variáveis de ambiente
    app.config['MAIL_DEFAULT_SENDER'] = "kalvinalbuquerque5@gmail.com"
    #os.environ.get('EMAIL_USER') # O e-mail que aparecerá como remetente
    # Ou, para testes, você pode colocar diretamente:
    # app.config['MAIL_USERNAME'] = 'seu_email@gmail.com'
    # app.config['MAIL_PASSWORD'] = 'sua_senha_do_app_ou_conta'
    # app.config['MAIL_DEFAULT_SENDER'] = 'seu_email@gmail.com'
    # Lembre-se que para Gmail, você precisará gerar uma "senha de app" se tiver autenticação de 2 fatores.
    # Para Hotmail/Outlook, a configuração é um pouco diferente (MAIL_USE_SSL = True, MAIL_PORT = 465)
    # Veja a documentação do Flask-Mail para mais detalhes se tiver problemas: https://flask-mail.readthedocs.io/en/latest/


    CORS(app, supports_credentials=True, origins=['http://localhost:5173']) 

    db.init_app(app)
    mail.init_app(app) 

    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'instance')
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)

    # --- Importe seus modelos AQUI dentro da função create_app ---
    from .models.perfil import Perfil
    from .models.ocorrencia import StatusOcorrencia
    from .models.usuario import Usuario
    from .models.ocorrencia import Ocorrencia, ocorrencia_ponto_monitoramento
    from .models.imagem import Imagem
    from .models.orgao_responsavel import OrgaoResponsavel
    from .models.notificacao import Notificacao
    from .models.coordenada import Coordenada
    from .models.tipo_pontuacao import TipoPontuacao
    from .models.ponto_monitoramento import PontoMonitoramento

    # Importe o módulo de decoradores
    from . import decorators # Adicione esta linha

    from .controllers.main_controller import main_bp
    app.register_blueprint(main_bp)
    
    from .cli_commands import cli
    app.cli.add_command(cli)  

    print(f"Comandos Flask registrados: {list(app.cli.commands.keys())}")

    return app