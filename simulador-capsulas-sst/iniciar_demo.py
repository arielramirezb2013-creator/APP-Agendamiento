"""
Inicia la demostración del Simulador Cápsulas SST (Rehavid S.A.S.) en http://localhost.
Por qué: Chrome no recuerda el permiso de micrófono para archivos abiertos desde el disco (file://)
y lo pide en cada respuesta. Servido desde localhost lo pide una sola vez y queda en manos libres.
Uso: python iniciar_demo.py   (Ctrl+C para cerrar)
"""
import http.server, os, socketserver, sys, threading, webbrowser

os.chdir(os.path.dirname(os.path.abspath(__file__)))
candidatos = sorted(f for f in os.listdir(".") if f.startswith("simulador_capsulas_sst") and f.endswith(".html"))
if not candidatos:
    sys.exit("No encuentro simulador_capsulas_sst_*.html en esta carpeta.")
archivo = sys.argv[1] if len(sys.argv) > 1 else candidatos[-1]

class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

socketserver.TCPServer.allow_reuse_address = True
for puerto in range(8765, 8775):
    try:
        servidor = socketserver.TCPServer(("127.0.0.1", puerto), Silencioso)
        break
    except OSError:
        continue
else:
    sys.exit("No hay puertos libres entre 8765 y 8774.")

url = f"http://localhost:{puerto}/{archivo}"
print(f"Demo lista en {url}\nPermite el micrófono una sola vez cuando Chrome lo pida. Ctrl+C para cerrar.")
threading.Timer(0.7, lambda: webbrowser.open(url)).start()
try:
    servidor.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    servidor.server_close()
