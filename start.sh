#!/bin/bash

# Este script inicia o aplicativo Flask.
# Ele verifica se o banco de dados SQLite existe e o cria/popula se não existir.

# Define o caminho para a pasta instance e o arquivo do banco de dados
INSTANCE_DIR="./instance"
DB_FILE="$INSTANCE_DIR/site.db"

# Define a variável FLASK_APP para o seu aplicativo
export FLASK_APP=app.run

echo "Verificando o banco de dados em $DB_FILE..."

# Verifica se o arquivo do banco de dados existe
if [ ! -f "$DB_FILE" ]; then
    echo "Banco de dados não encontrado. Criando e populando o banco de dados..."

    # Garante que a pasta instance existe
    mkdir -p "$INSTANCE_DIR"

    # Limpa caches antigos, se houver
    echo "Limpando caches Python..."
    rm -rf __pycache__/ app/__pycache__/

    # Cria as tabelas do banco de dados
    flask cli create-db
    if [ $? -ne 0 ]; then # Verifica o código de saída do comando anterior
        echo "Erro ao criar o banco de dados. Verifique o traceback acima."
        exit 1
    fi

    # Popula o banco de dados com dados iniciais
    flask cli seed-db
    if [ $? -ne 0 ]; then
        echo "Erro ao popular o banco de dados. Verifique o traceback acima."
        exit 1
    fi

    echo "Banco de dados criado e populado com sucesso."
else
    echo "Banco de dados encontrado. Pulando a criação e população."
fi

echo "Iniciando o servidor Flask..."
# Inicia o servidor Flask
flask run