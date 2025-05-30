# SVCA/app/models/__init__.py

# Importe todas as suas classes de modelo aqui (imports relativos internos)
from .perfil import Perfil
from .ocorrencia import StatusOcorrencia
from .usuario import Usuario
from .ocorrencia import Ocorrencia, ocorrencia_ponto_monitoramento # Se a tabela de associação estiver aqui
from .imagem import Imagem
from .orgao_responsavel import OrgaoResponsavel
from .notificacao import Notificacao
from .coordenada import Coordenada
from .ponto_monitoramento import PontoMonitoramento # <-- Certifique-se que esta linha existe
from .tipo_pontuacao import TipoPontuacao # <-- Verifique se esta linha está descomentada e o arquivo existe

