"""Simple HTTP server with no-cache headers for development."""
import http.server
import os
import sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

port = 8080
directory = None
args = sys.argv[1:]
for i, a in enumerate(args):
    if a == "--directory" and i + 1 < len(args):
        directory = args[i + 1]
    elif a.isdigit():
        port = int(a)

if directory:
    os.chdir(directory)

print(f"Dev server on http://localhost:{port} (no-cache) serving {os.getcwd()}")
http.server.HTTPServer(("", port), NoCacheHandler).serve_forever()
