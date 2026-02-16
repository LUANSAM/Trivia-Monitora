"""Script wrapper para iniciar o servidor Flask com output forçado"""
import sys
import os
import traceback

# Forçar UTF-8 para evitar problemas de encoding
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Configurar variáveis de ambiente
os.environ['FLASK_DEBUG'] = '1'
os.environ['PYTHONUNBUFFERED'] = '1'

# Importar e rodar o app
print("Importando app...", flush=True)
try:
    import app as main_app
    print("App importado com sucesso!", flush=True)
    try:
        print(f"app.py usado: {main_app.__file__}", flush=True)
    except Exception:
        pass
    print(f"Supabase client: {main_app.supabase}", flush=True)
except Exception as e:
    print(f"ERRO ao importar app: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)

print("Iniciando servidor Flask...", flush=True)
try:
    main_app.app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
        use_reloader=False  # Desabilitar para evitar duplo spawn
    )
except Exception as e:
    print(f"ERRO ao iniciar servidor: {e}", flush=True)
    traceback.print_exc()
    sys.exit(1)
