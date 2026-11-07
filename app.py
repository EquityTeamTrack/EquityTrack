"""Ejecutar: python3 app.py. Servidor local sin dependencias externas."""
import argparse
import json
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from equitytrack.store import Store

ROOT = Path(__file__).resolve().parent


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, store, **kwargs):
        self.store = store
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def json_response(self, status, value):
        body = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/opportunities':
            return self.json_response(200, self.store.get())
        # Serve only UI assets, never the database, Python source or user records.
        if path != '/' and not (path == '/index.html' or path.startswith(('/src/', '/assets/'))):
            return self.json_response(404, {'error': 'Ruta no encontrada.'})
        if '..' in path or '%' in path or path.endswith('/') and path != '/':
            return self.json_response(404, {'error': 'Ruta no encontrada.'})
        super().do_GET()

    def do_POST(self):
        # A local server has no remote authentication. Reject browser requests from other origins.
        origin = self.headers.get('Origin')
        if origin and origin != 'http://' + self.headers.get('Host', ''):
            return self.json_response(403, {'error': 'Origen no permitido.'})
        path = urlsplit(self.path).path
        if path != '/api/opportunities':
            return self.json_response(404, {'error': 'Ruta no encontrada.'})
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 50000:
                raise ValueError('Tamaño de solicitud no válido.')
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict):
                raise ValueError('Solicitud no válida.')
            case = self.store.update(payload.get('kind'), payload)
            self.json_response(200, case)
        except (ValueError, TypeError, KeyError) as error:
            self.json_response(400, {'error': str(error)})


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8080)
    args = parser.parse_args()
    store = Store(ROOT / 'runtime' / 'equitytrack.sqlite3', ROOT / 'data' / 'opportunities.json')
    server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, store=store))
    print(f'EquityTrack: http://127.0.0.1:{args.port}', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
