import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///../instance/site.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    app.config['SECRET_KEY'] = 'uma_chave_secreta_bem_longa_e_aleatoria_para_sua_sessao'

    # --- MUDANÇA CRÍTICA AQUI: Defina as origens permitidas explicitamente ---
    CORS(app, supports_credentials=True, origins=['http://localhost:5173']) 
    # Se você tiver outras origens (por exemplo, localhost:3000), adicione-as à lista
    # Ex: origins=['http://localhost:5173', 'http://localhost:3000']
    # Para o caso de produção, você pode usar um curinga ou a URL do seu domínio, mas com cautela.
    # No desenvolvimento, especificar ajuda a depurar.

    db.init_app(app)

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

    from .controllers.main_controller import main_bp
    app.register_blueprint(main_bp)
    
    from .cli_commands import cli
    app.cli.add_command(cli)  

    print(f"Comandos Flask registrados: {list(app.cli.commands.keys())}")

    return app