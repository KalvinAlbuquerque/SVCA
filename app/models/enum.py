from enum import Enum

class Perfil(Enum):
    USUARIO = 1
    MODERADOR = 2
    ADMINISTRADOR = 3

class StatusOcorrencia(Enum):
    EM_ANDAMENTO = 1
    FECHADA_SEM_SOLUCAO = 2
    FECHADA_COM_SOLUCAO = 3
    RECUSADA= 4
    REGISTRADA=5

class TipoPontuacao(Enum):
    OCORRENCIA_SOLUCIONADA = 1
    OCORRENCIA_VALIDADA = 2
