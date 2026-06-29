# =============================================================================
# devserver.py — Statischer Entwicklungs-Server OHNE Caching
# -----------------------------------------------------------------------------
# Python's "http.server" sendet keine Cache-Header, wodurch Browser geänderte
# ES-Module heuristisch aus dem Cache bedienen (man sieht alte Stände). Dieser
# kleine Server setzt "no-store", sodass jede Änderung sofort sichtbar ist.
#
#   Start:  python devserver.py [PORT]   (Standard-Port 8124)
# =============================================================================
import http.server
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8124


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()


if __name__ == '__main__':
    # ThreadingHTTPServer (wie "python -m http.server"): bedient die vielen
    # parallelen ES-Modul-Anfragen gleichzeitig — ein single-threaded Server
    # würde mit HTTP-Keep-Alive blockieren.
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    with http.server.ThreadingHTTPServer(('', PORT), NoCacheHandler) as httpd:
        print(f'ZauberAcker Dev-Server (no-cache) auf http://localhost:{PORT}')
        httpd.serve_forever()
