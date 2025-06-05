# SVCA/app/cli_commands.py
import click
from flask.cli import with_appcontext

# Importe db do seu __init__.py
from . import db

# Importe seus modelos para que db.create_all() os encontre
from .models.perfil import Perfil
from .models.ocorrencia import StatusOcorrencia
from .models.usuario import Usuario
from .models.ocorrencia import Ocorrencia, ocorrencia_ponto_monitoramento
from .models.imagem import Imagem
from .models.orgao_responsavel import OrgaoResponsavel
from .models.notificacao import Notificacao
from .models.coordenada import Coordenada
from .models.tipo_pontuacao import TipoPontuacao # <-- Adicione/descomente esta linha


@click.group()
def cli():
    """Comandos para o seu aplicativo SVCA."""
    pass

@cli.command('create-db')
@with_appcontext
def create_db():
    """Cria todas as tabelas do banco de dados."""
    db.create_all()
    click.echo('Tabelas do banco de dados criadas.')

@cli.command('seed-db')
@with_appcontext
def seed_db():
    """Adiciona dados iniciais (perfis, status, etc.) ao banco de dados."""
    if not Perfil.query.first():
        admin_perfil = Perfil(nome='Administrador')
        moderador_perfil = Perfil(nome='Moderador')
        usuario_perfil = Perfil(nome='Usuario')
        db.session.add_all([admin_perfil, moderador_perfil, usuario_perfil])
        click.echo('Perfis básicos adicionados.')

    if not StatusOcorrencia.query.first():
        em_andamento_status = StatusOcorrencia(nome='Em andamento')
        fechada_solucao_status = StatusOcorrencia(nome='Fechada com solução')
        fechada_sem_solucao_status = StatusOcorrencia(nome='Fechada sem solução')
        db.session.add_all([em_andamento_status, fechada_solucao_status, fechada_sem_solucao_status])
        click.echo('Status de ocorrência básicos adicionados.')

    if not Usuario.query.filter_by(email='admin@example.com').first():
        # Encontre o perfil de Administrador que acabamos de criar/garantir
        admin_perfil = Perfil.query.filter_by(nome='Administrador').first()
        if admin_perfil:
            Usuario.criar( # Usando o método de classe 'criar'
                nome='Kalvin',
                email='admin@example.com',
                telefone='(XX)YYYYY-YYYY',
                senha_plana='123456', # Em produção, use um hash
                perfil_id=admin_perfil.id
            )
            click.echo('Usuário administrador inicial adicionado.')
        else:
            click.echo('Erro: Perfil Administrador não encontrado para criar usuário inicial.') 
    print(Usuario.buscar_todos())
    db.session.commit()
    click.echo('Dados iniciais inseridos com sucesso.')