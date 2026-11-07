"""Prueba HTTP con base temporal, sin modificar el expediente del usuario."""
import json
import tempfile
import threading
import unittest
from functools import partial
from http.server import ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from app import Handler, ROOT
from equitytrack.store import Store


class ServerTests(unittest.TestCase):
    def test_http_read_write_and_private_files(self):
        with tempfile.TemporaryDirectory() as temp:
            store = Store(Path(temp) / 'case.sqlite3', ROOT / 'data/opportunities.json')
            server = ThreadingHTTPServer(('127.0.0.1', 0), partial(Handler, store=store))
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            base = 'http://127.0.0.1:' + str(server.server_port)
            try:
                self.assertIn(b'EquityTrack', urlopen(base + '/').read())
                case = json.load(urlopen(base + '/api/opportunities'))
                self.assertEqual(case['criteria'][2]['assessment']['code'], 'access')
                payload = json.dumps({'kind': 'comment', 'actor': 'Profesional', 'description': 'Quiero contrastar la asignación.'}).encode()
                result = json.load(urlopen(Request(base + '/api/opportunities', data=payload, headers={'Content-Type': 'application/json'})))
                self.assertEqual(len(result['comments']), 1)
                for path in ('/runtime/equitytrack.sqlite3', '/app.py', '/data/opportunities.json'):
                    with self.assertRaises(HTTPError) as error:
                        urlopen(base + path)
                    self.assertEqual(error.exception.code, 404)
                with self.assertRaises(HTTPError) as error:
                    urlopen(Request(base + '/api/opportunities', data=payload, headers={'Origin': 'https://external.example'}))
                self.assertEqual(error.exception.code, 403)
            finally:
                server.shutdown()
                server.server_close()
                thread.join()
