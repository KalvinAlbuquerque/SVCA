# SVCA/app/__init__.py
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os
from flask_cors import CORS # Adicione esta linha

# Instância do SQLAlchemy, não associada a um app Flask ainda.
# Será inicializada depois, na função create_app.
db = SQLAlchemy()

# A função create_app é uma convenção para fábricas de aplicativos Flask.
# Ela permite configurar o aplicativo de forma flexível (ex: para testes).
def create_app():
    app = Flask(__name__)

    # Configuração do Banco de Dados SQLite
    # O caminho 'sqlite:///../instance/site.db' sobe um nível para 'SVCA/'
    # e depois entra em 'instance/'.
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['SECRET_KEY'] = '1234567@' 

    # Inicialize o db com o aplicativo Flask
    db.init_app(app)

    # Crie o diretório 'instance' se ele não existir
    # Isso é importante para o SQLite ter onde salvar o arquivo .db
    instance_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'instance')
    if not os.path.exists(instance_path):
        os.makedirs(instance_path)

    CORS(app) # Adicione esta linha AQUI para habilitar o CORS para o seu aplicativo Flask

    # --- Importe seus modelos AQUI dentro da função create_app ---
    # Isso garante que db.create_all() veja todos os modelos após db.init_app(app)
    # e resolve potenciais problemas de importação circular.
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

    # Registro de Blueprints (se você tiver)
    from .controllers.main_controller import main_bp
    app.register_blueprint(main_bp)
    
    from .cli_commands import cli
    app.cli.add_command(cli)  

    print(f"Comandos Flask registrados: {list(app.cli.commands.keys())}")

    return app