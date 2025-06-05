# SVCA/app/cli_commands.py
import click
from flask.cli import with_appcontext

from . import db

from .models.perfil import Perfil
from .models.ocorrencia import StatusOcorrencia
from .models.usuario import Usuario
from .models.ocorrencia import Ocorrencia, ocorrencia_ponto_monitoramento
from .models.imagem import Imagem
from .models.orgao_responsavel import OrgaoResponsavel
from .models.notificacao import Notificacao
from .models.coordenada import Coordenada
from .models.tipo_pontuacao import TipoPontuacao # Já importado, mas reforçando


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
        db.session.commit() # Commit para garantir que perfis tenham IDs antes de criar usuário
        click.echo('Perfis básicos adicionados.')
    else:
        # Se os perfis já existem, recupere-os para usar no Usuario.criar
        admin_perfil = Perfil.query.filter_by(nome='Administrador').first()
        moderador_perfil = Perfil.query.filter_by(nome='Moderador').first()
        usuario_perfil = Perfil.query.filter_by(nome='Usuario').first()


    if not StatusOcorrencia.query.first():
        em_andamento_status = StatusOcorrencia(nome='Em andamento')
        fechada_solucao_status = StatusOcorrencia(nome='Fechada com solução')
        fechada_sem_solucao_status = StatusOcorrencia(nome='Fechada sem solução')
        db.session.add_all([em_andamento_status, fechada_solucao_status, fechada_sem_solucao_status])
        click.echo('Status de ocorrência básicos adicionados.')

    # Adicionar Tipos de Pontuação
    if not TipoPontuacao.query.first():
        ocorrencia_qualidade = TipoPontuacao(nome='Ocorrencia/qualidade')
        ocorrencia_solucionada = TipoPontuacao(nome='OcorrenciaSolucionada')
        db.session.add_all([ocorrencia_qualidade, ocorrencia_solucionada])
        click.echo('Tipos de Pontuação básicos adicionados.')

    if not Usuario.query.filter_by(email='admin@example.com').first():
        admin_perfil = Perfil.query.filter_by(nome='Administrador').first()
        if admin_perfil:
            Usuario.criar(
                nome='Kalvin Administrador',
                email='admin@example.com',
                telefone='(XX)YYYYY-YYYY',
                senha_plana='123456',
                perfil_id=admin_perfil.id
            )
            click.echo('Usuário administrador inicial adicionado.')
        else:
            click.echo('Erro: Perfil Administrador não encontrado para criar usuário inicial.') 
    
    if not Usuario.query.filter_by(email='moderador@example.com').first():
        moderador_perfil = Perfil.query.filter_by(nome='Moderador').first()
        if moderador_perfil:
            Usuario.criar(
                nome='Maria Moderadora',
                email='moderador@example.com',
                telefone='(XX)YYYYY-YYYY',
                senha_plana='123456',
                perfil_id=moderador_perfil.id
            )
            click.echo('Usuário moderador inicial adicionado.')
        else:
            click.echo('Erro: Perfil Moderador não encontrado para criar usuário inicial.')

    if not Usuario.query.filter_by(email='usuario@example.com').first():
        usuario_perfil = Perfil.query.filter_by(nome='Usuario').first()
        if usuario_perfil:
            Usuario.criar(
                nome='João Usuário',
                email='usuario@example.com',
                telefone='(XX)YYYYY-YYYY',
                senha_plana='123456',
                perfil_id=usuario_perfil.id
            )
            click.echo('Usuário padrão inicial adicionado.')
        else:
            click.echo('Erro: Perfil Usuário não encontrado para criar usuário inicial.')
            
    db.session.commit() # Commit final para todas as adições
    click.echo('Dados iniciais inseridos com sucesso.')