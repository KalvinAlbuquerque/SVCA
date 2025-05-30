# SVCA/app/run.py
# Este arquivo é o ponto de entrada para o aplicativo Flask.
from . import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True)